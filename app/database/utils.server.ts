async function doALogin() {
    const BASE_URL = "http://xts.achintya.net.in:3000/apimarketdata";
    const XTS_APP_KEY = "ddc9ca260dee67556bd436";
    const XTS_APP_SECRET = "Fixs437#W1";

    const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json" 
        },
        body: JSON.stringify({
            secretKey: XTS_APP_SECRET,
            appKey: XTS_APP_KEY
        })
    });

    const data = await response.json();
    return data.result.token;
}

async function getInstrumentDetails({
    script,
    exchange = "NSE",
    instrumentType, // "FUTURE" | "OPTIONS"
    expiry,         // "YYYY-MM-DD" or Date
    strikePrice = null,
    optionType = null,
    tokeny
}) {
    const BASE_URL = "http://xts.achintya.net.in:3000/apimarketdata";

    // 1. Get token if not provided
    const token = tokeny || (await doALogin());
    if (exchange.toUpperCase() !== "NSE") {
        throw new Error("Only NSE derivatives supported");
    }
    if (!expiry) throw new Error("expiry is required");

    const expiryDate = typeof expiry === "string" ? new Date(expiry) : expiry;
    if (isNaN(expiryDate)) throw new Error("invalid expiry");

    const day = String(expiryDate.getDate()).padStart(2, "0");
    const month = expiryDate.toLocaleString("en-US", {
        month: "short" 
    });
    const year = expiryDate.getFullYear();
    const expiryStr = `${day}${month}${year}`;

    const scriptUpper = script.toUpperCase();
    const type = instrumentType.toUpperCase();

    const indexSymbols = new Set([
        "NIFTY",
        "BANKNIFTY",
        "FINNIFTY",
        "MIDCPNIFTY",
        "SENSEX",
        "BANKEX"
    ]);

    const isIndex = indexSymbols.has(scriptUpper);

    let endpoint;
    const params = {
        exchangeSegment: 2,
        symbol: scriptUpper,
        expiryDate: expiryStr
    };

    if (type === "FUTURE") {
        endpoint = "/instruments/instrument/futureSymbol";
        params.series = isIndex ? "FUTIDX" : "FUTSTK";
    } else if (type === "OPTIONS") {
        if (strikePrice == null || optionType == null) {
            throw new Error("strikePrice and optionType are required for OPTIONS");
        }
        endpoint = "/instruments/instrument/optionSymbol";
        params.series = isIndex ? "OPTIDX" : "OPTSTK";
        params.optionType = String(optionType).toUpperCase();
        params.strikePrice = Number(strikePrice);
    } else {
        throw new Error("instrumentType must be FUTURE or OPTIONS");
    }

    const query = new URLSearchParams(params).toString();

    const response = await fetch(`${BASE_URL}${endpoint}?${query}`, {
        method: "GET",
        headers: {
            Authorization: token,
            "Content-Type": "application/json"
        }
    });

    if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    const result = data?.result?.[0];

    if (!result) return null;

    return {
        exchangeInstrumentId: result.ExchangeInstrumentID,
        lotSize: result.LotSize
    };
}

export {
    getInstrumentDetails 
};
