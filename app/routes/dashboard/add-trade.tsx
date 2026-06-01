import { Form } from "react-router";

export async function action({ request }: any) {
  const formData = await request.formData();

  const trade = {
    symbol: formData.get("symbol"),
    quantity: Number(formData.get("quantity")),
    price: Number(formData.get("price")),
  };

  console.log(trade);

  return null;
}


export default function AddTradePage() {
  return (
    <div>
      <h2>Add Trade</h2>

      <Form method="post">
        <div>
          <label>Symbol</label>

          <input
            type="text"
            name="symbol"
            placeholder="RELIANCE"
          />
        </div>

        <div>
          <label>Quantity</label>

          <input
            type="number"
            name="quantity"
            placeholder="10"
          />
        </div>

        <div>
          <label>Price</label>

          <input
            type="number"
            step="0.01"
            name="price"
            placeholder="2500"
          />
        </div>

        <button type="submit">
          Save Trade
        </button>
      </Form>
    </div>
  );
}
