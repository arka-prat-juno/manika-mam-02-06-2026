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

    const weekdays = [
        "Sun",
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat"
    ];

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

                            <div className={styles.weekdays}>
                                {
                                    weekdays.map((day) => (
                                        <div
                                            key={day}
                                            className={styles.weekday}
                                        >
                                            {day}
                                        </div>
                                    ))
                                }
                            </div>

                            <div className={styles.grid}>

                                {
                                    entries.map((entry) => {

                                        const pnl =
                                            Number(entry.pnl);

                                        const date =
                                            new Date(
                                                entry.tradingDate
                                            );

                                        return (
                                            <div
                                                key={entry.id}
                                                className={`${styles.card} ${
                                                    pnl >= 0
                                                        ? styles.profit
                                                        : styles.loss
                                                }`}
                                            >

                                                <div className={styles.date}>
                                                    {
                                                        date.getDate()
                                                    }
                                                </div>

                                                <div className={styles.user}>
                                                    {
                                                        entry.user.username
                                                    }
                                                </div>

                                                <div className={styles.pnl}>
                                                    ₹ {
                                                        pnl.toFixed(0)
                                                    }
                                                </div>

                                            </div>
                                        );
                                    })
                                }

                            </div>

                        </section>
                    )
                )
            }

        </div>
    );
}