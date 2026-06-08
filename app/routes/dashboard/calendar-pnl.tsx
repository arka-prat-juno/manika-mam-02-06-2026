// app/routes/dashboard/calendar-pnl.tsx

import type {
    Route
} from "./+types/calendar-pnl";

import {
    desc
} from "drizzle-orm";

import {
    db
} from "~/database/db.server";

import {
    dailyPnls
} from "~/database/schema.server";

import styles from "./calendar-pnl.module.css";

/* =========================
   LOADER
========================= */

export async function loader() {

    const rows =
        await db.query.dailyPnls.findMany({
            with: {
                user: true
            },

            orderBy: (
                table,
                { desc }
            ) => [
                desc(table.tradingDate)
            ]
        });

    return {
        rows
    };
}

/* =========================
   COMPONENT
========================= */

export default function CalendarPnL({
    loaderData
}: Route.ComponentProps) {

    const {
        rows
    } = loaderData;

    /*
    =========================
    GROUP BY MONTH
    =========================
    */

    const grouped =
        rows.reduce((acc, row) => {

            const date =
                new Date(row.tradingDate);

            const month =
                date.toLocaleString(
                    "en-IN",
                    {
                        month: "long",
                        year: "numeric"
                    }
                );

            if (!acc[month]) {
                acc[month] = [];
            }

            acc[month].push(row);

            return acc;

        }, {} as Record<string, typeof rows>);

    return (
        <div className={styles.container}>

            <h1 className={styles.title}>
                Daily PnL Calendar
            </h1>

            {
                Object.entries(grouped).map(
                    ([month, entries]) => (

                        <section
                            key={month}
                            className={styles.monthSection}
                        >

                            <h2 className={styles.monthTitle}>
                                {month}
                            </h2>

                            <div className={styles.entries}>

                                {
                                    entries.map((entry) => (

                                        <div
                                            key={entry.id}
                                            className={`${styles.card} ${
                                                Number(entry.pnl) >= 0
                                                    ? styles.profit
                                                    : styles.loss
                                            }`}
                                        >

                                            <div>
                                                <strong>
                                                    {
                                                        new Date(
                                                            entry.tradingDate
                                                        ).toLocaleDateString(
                                                            "en-IN",
                                                            {
                                                                day: "2-digit",
                                                                month: "short",
                                                                year: "numeric"
                                                            }
                                                        )
                                                    }
                                                </strong>
                                            </div>

                                            <div>
                                                {
                                                    entry.user.username
                                                }
                                            </div>

                                            <div className={styles.pnl}>
                                                ₹ {
                                                    Number(entry.pnl)
                                                        .toFixed(2)
                                                }
                                            </div>

                                        </div>
                                    ))
                                }

                            </div>

                        </section>
                    )
                )
            }

        </div>
    );
}