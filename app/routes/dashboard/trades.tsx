// app/routes/dashboard/trades.tsx

export async function loader() {
    return [
        {
            id: 1,
            symbol: "RELIANCE",
            quantity: 10,
            price: 2500,
        },
        {
            id: 2,
            symbol: "TCS",
            quantity: 5,
            price: 3800,
        },
    ];
}

export default function TradesPage({
    loaderData,
}: any) {
    return (
        <div>
            <h2>My Trades</h2>

            {loaderData.map((trade: any) => (
                <div key={trade.id}>
                    <h3>{trade.symbol}</h3>

                    <p>Quantity: {trade.quantity}</p>

                    <p>Price: ₹{trade.price}</p>
                </div>
            ))}
        </div>
    );
}
