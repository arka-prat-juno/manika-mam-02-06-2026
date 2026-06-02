import {
    eq,
    gt,
    desc
} from "drizzle-orm";

import {
    db
} from "../../database/db.server";

import {
    positions
} from "../../database/schema.server";

import {
    requireUser
} from "~/utils/auth.server";

import styles from "./trades.module.css";
import {
    useEffect, useState 
} from "react";

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
      "FUTURE");

    const options = rows.filter((position) =>
        position.instrumentType ===
      "OPTIONS");

    return {
        user,
        futures,
        options
    };
}

export default function TradesPage({
    loaderData
}: any) {
    const {
        user,
        futures,
        options
    } = loaderData;
    const [
        liveData,
        setLiveData
    ] =useState(loaderData);
    useEffect(() => {
        const es = new EventSource("/dashboard/trades/live");

        es.onmessage = (event) => {
            const data = JSON.parse(event.data);

            setLiveData(data);
        };

        return () => es.close();
    }, [
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
