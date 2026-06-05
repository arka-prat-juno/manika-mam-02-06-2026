import type {
    Route
} from "./+types/mtm";

import {
    calculatePnL
} from "~/database/utils.server";
import {
    useRevalidator
} from "react-router";
import { useEffect } from "react";

/* =========================
   LOADER
========================= */

export async function loader({
    request
}: Route.LoaderArgs) {
    const data =
        await calculatePnL(request);

    return data;
}

/* =========================
   COMPONENT
========================= */

export default function MTM({
    loaderData
}: Route.ComponentProps) {
    const {
        positions,
        totalPnL
    } = loaderData;
    const revalidator =
        useRevalidator();


        /*
    =========================
    AUTO REFRESH
    =========================
    */

    useEffect(() => {
        const interval =
            setInterval(() => {
                revalidator.revalidate();
            }, 10000);

        return () =>
            clearInterval(interval);
    }, [
        revalidator
    ]);

    return (
        <div>
            <h1>
                MTM
            </h1>

            <h2>
                Total PnL:
                {" "}
                {totalPnL.toFixed(2)}
            </h2>

            <div>
                {positions.map((position) => (
                    <div
                        key={position.id}
                    >
                        <p>
                            {position.script}
                        </p>

                        <p>
                            Qty:
                            {" "}
                            {position.quantity}
                        </p>

                        <p>
                            PnL:
                            {" "}
                            {position.pnl.toFixed(2)}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
