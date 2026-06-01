import {
    redirect 
} from "react-router";
import {
    eq, and, isNull 
} from "drizzle-orm";
import {
    db 
} from "./db.server";
import {
    positions, trades 
} from "./schema.server";

const CURRENT_USER_ID = 1; // hardcoded for now

/* =====================================================
   Find an existing position matching the instrument
===================================================== */

async function findMatchingPosition({
    userId,
    exchange,
    instrumentType,
    script,
    expiry,
    positionType,
    strikePrice,
    optionType
}: {
    userId: number;
    exchange: "NSE" | "BSE";
    instrumentType: "FUTURE" | "OPTIONS";
    script: string;
    expiry: string;
    positionType: "LONG" | "SHORT";
    strikePrice: string | null;
    optionType: "CE" | "PE" | null;
}) {
    const conditions = [
        eq(positions.userId, userId),
        eq(positions.exchange, exchange),
        eq(positions.instrumentType, instrumentType),
        eq(positions.script, script.toUpperCase()),
        eq(positions.expiry, expiry),
        eq(positions.positionType, positionType)
    ];

    if (instrumentType === "OPTIONS") {
        conditions.push(eq(positions.strikePrice, strikePrice!));
        conditions.push(eq(positions.optionType, optionType!));
    } else {
        conditions.push(isNull(positions.strikePrice));
        conditions.push(isNull(positions.optionType));
    }

    const rows = await db
        .select()
        .from(positions)
        .where(and(...conditions))
        .limit(1);

    return rows[0] ?? null;
}

/* =====================================================
   Compute updated position state after a new trade
===================================================== */

function computeUpdatedPosition(
    existing: {
        quantity: number;
        averagePrice: string | null;
        positionType: "LONG" | "SHORT";
    },
    trade: {
        quantity: number;
        price: number;
        positionType: "LONG" | "SHORT";
    }
) {
    const prevQty = existing.quantity;
    const prevAvg = existing.averagePrice
        ? Number(existing.averagePrice)
        : trade.price;

    // Same direction → weighted average, add quantities
    if (existing.positionType === trade.positionType) {
        const newQty = prevQty + trade.quantity;
        const newAvg =
            (prevAvg * prevQty + trade.price * trade.quantity) / newQty;

        return {
            quantity: newQty,
            averagePrice: newAvg.toFixed(2),
            currentPrice: trade.price.toFixed(2),
            positionType: existing.positionType
        };
    }

    // Opposite direction → reduce or flip
    if (trade.quantity < prevQty) {
    // Partial close — quantity shrinks, avg stays
        return {
            quantity: prevQty - trade.quantity,
            averagePrice: prevAvg.toFixed(2),
            currentPrice: trade.price.toFixed(2),
            positionType: existing.positionType
        };
    }

    if (trade.quantity === prevQty) {
    // Full close — position goes to 0
        return {
            quantity: 0,
            averagePrice: "0.00",
            currentPrice: trade.price.toFixed(2),
            positionType: existing.positionType
        };
    }

    // Flip — trade qty exceeds existing, net flips direction
    const flippedQty = trade.quantity - prevQty;
    return {
        quantity: flippedQty,
        averagePrice: trade.price.toFixed(2),
        currentPrice: trade.price.toFixed(2),
        positionType: trade.positionType
    };
}

/* =====================================================
   Public: addTrade
===================================================== */

export async function addTrade(request: Request) {
    const userId = CURRENT_USER_ID;
    const formData = await request.formData();

    // --- parse fields ---
    const exchange = formData.get("exchange") as "NSE" | "BSE";
    const instrumentType = formData.get("instrument_type") as "FUTURE" | "OPTIONS";
    const script = (formData.get("script") as string).toUpperCase().trim();
    const expiry = formData.get("expiry") as string;
    const positionType = formData.get("position_type") as "LONG" | "SHORT";
    const quantity = Number(formData.get("quantity"));
    const entryPrice = Number(formData.get("entry_price"));

    const strikePrice =
        instrumentType === "OPTIONS" && formData.get("strike_price")
            ? Number(formData.get("strike_price")).toFixed(2)
            : null;

    const optionType =
        instrumentType === "OPTIONS"
            ? (formData.get("option_type") as "CE" | "PE")
            : null;

    // --- validate ---
    if (!exchange || !instrumentType || !script || !expiry || !positionType) {
        throw new Response("Missing required fields", {
            status: 400 
        });
    }
    if (quantity <= 0 || entryPrice <= 0) {
        throw new Response("Quantity and price must be positive", {
            status: 400 
        });
    }
    if (instrumentType === "OPTIONS" && (!strikePrice || !optionType)) {
        throw new Response("Options require strike price and option type", {
            status: 400 
        });
    }

    // --- find or create position ---
    const existing = await findMatchingPosition({
        userId,
        exchange,
        instrumentType,
        script,
        expiry,
        positionType,
        strikePrice,
        optionType
    });

    let positionId: number;

    if (existing) {
    // update existing position
        const updated = computeUpdatedPosition(existing, {
            quantity,
            price: entryPrice,
            positionType
        });

        await db
            .update(positions)
            .set({
                quantity: updated.quantity,
                averagePrice: updated.averagePrice,
                currentPrice: updated.currentPrice,
                positionType: updated.positionType
            })
            .where(eq(positions.id, existing.id));

        positionId = existing.id;
    } else {
    // create new position
        const inserted = await db
            .insert(positions)
            .values({
                userId,
                exchange,
                instrumentType,
                script,
                expiry,
                strikePrice,
                optionType,
                positionType,
                quantity,
                lotSize: 1,
                entryPrice: entryPrice.toFixed(2),
                averagePrice: entryPrice.toFixed(2),
                currentPrice: entryPrice.toFixed(2)
            })
            .returning({
                id: positions.id 
            });

        positionId = inserted[0].id;
    }

    // --- insert trade record ---
    await db.insert(trades).values({
        positionId,
        userId,
        tradeType: "ADD",
        quantity,
        price: entryPrice.toFixed(2),
        notes: ""
    });

    // --- redirect ---
    return redirect("/dashboard/trades");
}
