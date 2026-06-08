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

// import {
//     dailyPnls
// } from "~/database/schema.server";

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




    const now =
    new Date();

const currentMonthKey =
    now.toLocaleString(
        "en-IN",
        {
            month: "long",
            year: "numeric"
        }
    );

if (
    !grouped[currentMonthKey]
) {

    grouped[currentMonthKey] = [];
}
    /*
    =========================
    BUILD MONTH DATA
    =========================
    */

    const months =
        Object.entries(grouped).map(
            ([month, entries]) => {

                const firstDate =
                    new Date(entries[0].tradingDate);

                const year =
                    firstDate.getFullYear();

                const monthIndex =
                    firstDate.getMonth();

                const daysInMonth =
                    new Date(
                        year,
                        monthIndex + 1,
                        0
                    ).getDate();

                const firstDay =
                    new Date(
                        year,
                        monthIndex,
                        1
                    ).getDay();

                return {
                    month,
                    entries,
                    year,
                    monthIndex,
                    daysInMonth,
                    firstDay
                };
            }
        );

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
                months.map((monthData) => {

                    const {
                        month,
                        entries,
                        daysInMonth,
                        firstDay
                    } = monthData;

                    return (

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
                                    Array.from({
                                        length: firstDay
                                    }).map((_, i) => (
                                        <div
                                            key={`empty-${i}`}
                                        />
                                    ))
                                }

                                {
                                    Array.from({
                                        length: daysInMonth
                                    }).map((_, index) => {

                                        const day =
                                            index + 1;

                                        const found =
                                            entries.find((entry) => {

                                                const d =
                                                    new Date(
                                                        entry.tradingDate
                                                    );

                                                return (
                                                    d.getDate() === day
                                                );
                                            });

                                        const pnl =
                                            found
                                                ? Number(found.pnl)
                                                : 0;

                                        return (

                                            <div
                                                key={day}
                                                className={`${styles.card} ${
                                                    pnl >= 0
                                                        ? styles.profit
                                                        : styles.loss
                                                }`}
                                            >

                                                <div className={styles.date}>
                                                    {day}
                                                </div>

                                                <div className={styles.user}>
                                                    {
                                                        found?.user.username ??
                                                        "-"
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
                    );
                })
            }

        </div>
    );
}