import {
    eq,
    gt,
    desc
} from "drizzle-orm";

import {
    db
} from "../../database/db.server";

import {
    positions,
    trades
} from "../../database/schema.server";

import {
    requireUser
} from "~/utils/auth.server";

import styles from "./trades.module.css";
import {
    useEffect, useState 
} from "react";
import {
    Form, 
    useNavigation
} from "react-router";

export async function loader({
    request
}: any) {
    const user = await requireUser(request);

    /*
    =========================
    ADMIN
    =========================
    */

    const whereClause =
        user.role === "admin"
            ? gt(positions.quantity, 0)
            : eq(positions.userId, user.id);

    const rows = await db.query.positions.findMany({
        where:
        user.role === "admin"
            ? gt(positions.quantity, 0)
            : (table, {
                and 
            }) =>
                and(
                    eq(table.userId, user.id),
                    gt(table.quantity, 0)
                ),

        with: {
            user: true
        },

        orderBy: [
            desc(positions.createdAt)
        ]
    });

    const futures = rows.filter((position) =>
        position.instrumentType ===
      "FUTURE").sort((a, b) => a.id - b.id);

    const options = rows.filter((position) =>
        position.instrumentType ===
      "OPTIONS").sort((a, b) => a.id - b.id);

    return {
        user,
        futures,
        options
    };
}

/* =========================
   ACTION
========================= */

export async function action({
    request
}: Route.ActionArgs) {

    const currentUser =
        await requireUser(request);

    const formData =
        await request.formData();

    const positionId =
        Number(formData.get("positionId"));

    const lots =
        Number(formData.get("lots"));

    const exitPrice =
        Number(formData.get("exitPrice"));

    /*
    =========================
    FETCH POSITION
    =========================
    */

    const position =
        await db.query.positions.findFirst({
            where: eq(
                positions.id,
                positionId
            )
        });

    if (!position) {
        throw new Error("Position not found");
    }

    /*
    =========================
    SECURITY CHECK
    =========================
    */

    if (
        currentUser.role !== "admin" &&
        position.userId !== currentUser.id
    ) {
        throw new Error("Unauthorized");
    }

    /*
    =========================
    FULL EXIT
    =========================
    */

    if (lots >= position.quantity) {

        await db
            .update(positions)
            .set({
                quantity: 0
            })
            .where(eq(
                positions.id,
                position.id
            ));

        await db.insert(trades).values({
            positionId:
                position.id,

            userId:
                currentUser.id,

            tradeType:
                "EXIT",

            quantity:
                position.quantity,

            price:
                exitPrice.toFixed(2),

            notes:
                "Full exit"
        });

        return {
            success: true
        };
    }

    /*
    =========================
    PARTIAL EXIT
    =========================
    */

    await db
        .update(positions)
        .set({
            quantity:
                position.quantity -
                lots
        })
        .where(eq(
            positions.id,
            position.id
        ));

    await db.insert(trades).values({
        positionId:
            position.id,

        userId:
            currentUser.id,

        tradeType:
            "EXIT",

        quantity:
            lots,

        price:
            exitPrice.toFixed(2),

        notes:
            `Partial exit ${lots}`
    });

    return {
        success: true
    };
}

export default function TradesPage({
    loaderData
}: any) {
    const {
        user
    } = loaderData;

    const [
        liveData,
        setLiveData
    ] = useState({
        futures: loaderData.futures,
        options: loaderData.options
    });

    const futures =
        liveData.futures;

    const options =
        liveData.options;

    const navigation =
        useNavigation();
    useEffect(() => {
        const es = new EventSource("/dashboard/trades/live");

        es.onmessage = (event) => {
            const data = JSON.parse(event.data);

            setLiveData(data);
        };

        return () => es.close();
    }, [
    ]);
    useEffect(() => {

        /*
    =========================
    CLOSE DIALOGS
    AFTER ACTION
    =========================
    */

        if (
            navigation.state ===
        "idle"
        ) {

            const dialogs =
                document.querySelectorAll("dialog");

            dialogs.forEach((dialog) => {
                (
                    dialog as HTMLDialogElement
                ).close();
            });
        }

    }, [
        navigation.state
    ]);

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1>
                    Trades Dashboard
                </h1>

                <p>
                    {user.role === "admin"
                        ? "Viewing all active positions"
                        : "Viewing your active positions"}
                </p>
            </div>

            {/* ======================
                FUTURES TABLE
            ====================== */}

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                    Futures
                </h2>

                {futures.length === 0 ? (
                    <div className={styles.empty}>
                        No futures positions
                    </div>
                ) : (
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Symbol</th>

                                    <th>Type</th>

                                    <th>Qty</th>

                                    <th>Avg Price</th>

                                    <th>Current</th>

                                    <th>Exchange</th>

                                    {user.role ===
                    "admin" && (
                                        <th>
                                            User
                                        </th>
                                    )}
                                </tr>
                            </thead>

                            <tbody>
                                {futures.map((trade: any) => (
                                    <tr
                                        key={
                                            trade.id
                                        }
                                    >
                                        <td>
                                            {
                                                trade.script
                                            }
                                        </td>

                                        <td>
                                            {
                                                trade.positionType
                                            }
                                        </td>

                                        <td>
                                            {
                                                trade.quantity
                                            }
                                        </td>

                                        <td>
                                            ₹
                                            {
                                                trade.averagePrice
                                            }
                                        </td>

                                        <td>
                                            ₹
                                            {
                                                trade.currentPrice
                                            }
                                        </td>

                                        <td>
                                            {
                                                trade.exchange
                                            }
                                        </td>

                                        {user.role ===
                      "admin" && (
                                            <td>
                                                {
                                                    trade
                                                        .user
                                                        ?.username
                                                }
                                            </td>
                                        )}
                                        <td>
                                            <button
                                                className={
                                                    styles.squareOffBtn
                                                }
                                                onClick={() => {
                                                    (
                                                        document.getElementById(`dialog-${trade.id}`) as HTMLDialogElement
                                                    ).showModal();
                                                }}
                                            >
                                                Square Off
                                            </button>

                                            <dialog
                                                id={`dialog-${trade.id}`}
                                                className={styles.dialog}
                                            >

                                                <Form method="post">

                                                    <input
                                                        type="hidden"
                                                        name="positionId"
                                                        value={trade.id}
                                                    />

                                                    <h3>
                                                        Square Off
                                                    </h3>

                                                    <div
                                                        className={styles.field}
                                                    >
                                                        <label>
                                                            Lots
                                                        </label>

                                                        <input
                                                            type="number"
                                                            name="lots"
                                                            required
                                                            min="1"
                                                            max={
                                                                trade.quantity
                                                            }
                                                        />
                                                    </div>

                                                    <div
                                                        className={styles.field}
                                                    >
                                                        <label>
                                                            Exit Price
                                                        </label>

                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            name="exitPrice"
                                                            required
                                                        />
                                                    </div>

                                                    <div
                                                        className={
                                                            styles.dialogActions
                                                        }
                                                    >
                                                        <button
                                                            type="submit"
                                                        >
                                                            Submit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                (
                                                                    document.getElementById(`dialog-${trade.id}`) as HTMLDialogElement
                                                                ).close();
                                                            }}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>

                                                </Form>

                                            </dialog>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* ======================
                OPTIONS TABLE
            ====================== */}

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                    Options
                </h2>

                {options.length === 0 ? (
                    <div className={styles.empty}>
                        No options positions
                    </div>
                ) : (
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Symbol</th>

                                    <th>Option</th>

                                    <th>Strike</th>

                                    <th>Qty</th>

                                    <th>Avg Price</th>

                                    <th>Expiry</th>

                                    {user.role ===
                    "admin" && (
                                        <th>
                                            User
                                        </th>
                                    )}
                                </tr>
                            </thead>

                            <tbody>
                                {options.map((trade: any) => (
                                    <tr
                                        key={
                                            trade.id
                                        }
                                    >
                                        <td>
                                            {
                                                trade.script
                                            }
                                        </td>

                                        <td>
                                            {
                                                trade.optionType
                                            }
                                        </td>

                                        <td>
                                                
                                            {
                                                trade.strikePrice
                                            }
                                        </td>

                                        <td>
                                            {
                                                trade.quantity
                                            }
                                        </td>

                                        <td>
                                            ₹
                                            {
                                                trade.averagePrice
                                            }
                                        </td>

                                        <td>
                                            {
                                                trade.expiry
                                            }
                                        </td>

                                        {user.role ===
                      "admin" && (
                                            <td>
                                                {
                                                    trade
                                                        .user
                                                        ?.username
                                                }
                                            </td>
                                        )}

                                        <td>
                                            <button
                                                className={
                                                    styles.squareOffBtn
                                                }
                                                onClick={() => {
                                                    (
                                                        document.getElementById(`dialog-${trade.id}`) as HTMLDialogElement
                                                    ).showModal();
                                                }}
                                            >
                                                Square Off
                                            </button>

                                            <dialog
                                                id={`dialog-${trade.id}`}
                                                className={styles.dialog}
                                            >

                                                <Form method="post">

                                                    <input
                                                        type="hidden"
                                                        name="positionId"
                                                        value={trade.id}
                                                    />

                                                    <h3>
                                                        Square Off
                                                    </h3>

                                                    <div
                                                        className={styles.field}
                                                    >
                                                        <label>
                                                            Lots
                                                        </label>

                                                        <input
                                                            type="number"
                                                            name="lots"
                                                            required
                                                            min="1"
                                                            max={
                                                                trade.quantity
                                                            }
                                                        />
                                                    </div>

                                                    <div
                                                        className={styles.field}
                                                    >
                                                        <label>
                                                            Exit Price
                                                        </label>

                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            name="exitPrice"
                                                            required
                                                        />
                                                    </div>

                                                    <div
                                                        className={
                                                            styles.dialogActions
                                                        }
                                                    >
                                                        <button
                                                            type="submit"
                                                        >
                                                            Submit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                (
                                                                    document.getElementById(`dialog-${trade.id}`) as HTMLDialogElement
                                                                ).close();
                                                            }}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>

                                                </Form>

                                            </dialog>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}
