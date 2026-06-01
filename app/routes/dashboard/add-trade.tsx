import { Form } from "react-router";
import { useState } from "react";

import styles from "./add-trade.module.css";

export async function action({ request }: any) {
  const formData = await request.formData();

  const trade = {
    exchange: formData.get("exchange"),

    instrument_type: formData.get("instrument_type"),

    script: formData.get("script"),

    expiry: formData.get("expiry"),

    strike_price: formData.get("strike_price")
      ? Number(formData.get("strike_price"))
      : null,

    option_type: formData.get("option_type"),

    position_type: formData.get("position_type"),

    quantity: Number(formData.get("quantity")),

    entry_price: Number(formData.get("entry_price")),
  };

  console.log(trade);

  return null;
}

export default function AddTradePage() {
  const [instrumentType, setInstrumentType] =
    useState("");

  const isOptions =
    instrumentType === "OPTIONS";

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        Add Trade
      </h2>

      <Form
        method="post"
        className={styles.form}
      >
        {/* Exchange */}
        <div className={styles.field}>
          <label>Exchange</label>

          <select
            name="exchange"
            required
          >
            <option value="">
              Select Exchange
            </option>

            <option value="NSE">
              NSE
            </option>

            <option value="BSE">
              BSE
            </option>
          </select>
        </div>

        {/* Instrument Type */}
        <div className={styles.field}>
          <label>Instrument Type</label>

          <select
            name="instrument_type"
            required
            value={instrumentType}
            onChange={(e) =>
              setInstrumentType(
                e.target.value
              )
            }
          >
            <option value="">
              Select Instrument
            </option>

            <option value="FUTURES">
              Futures
            </option>

            <option value="OPTIONS">
              Options
            </option>
          </select>
        </div>

        {/* Script */}
        <div className={styles.field}>
          <label>Stock Symbol</label>

          <input
            type="text"
            name="script"
            placeholder="RELIANCE"
            required
          />
        </div>

        {/* Expiry */}
        <div className={styles.field}>
          <label>Expiry Date</label>

          <input
            type="date"
            name="expiry"
            required
          />
        </div>

        {/* Strike Price */}
        {isOptions && (
          <div className={styles.field}>
            <label>
              Strike Price
            </label>

            <input
              type="number"
              step="0.01"
              name="strike_price"
              placeholder="25000"
              required
            />
          </div>
        )}

        {/* Option Type */}
        {isOptions && (
          <div className={styles.field}>
            <label>
              Option Type
            </label>

            <select
              name="option_type"
              required
            >
              <option value="">
                Select Option Type
              </option>

              <option value="CE">
                CE (Call)
              </option>

              <option value="PE">
                PE (Put)
              </option>
            </select>
          </div>
        )}

        {/* Position Type */}
        <div className={styles.field}>
          <label>
            Position Type
          </label>

          <select
            name="position_type"
            required
          >
            <option value="">
              Select Position
            </option>

            <option value="LONG">
              Buy / Long
            </option>

            <option value="SHORT">
              Sell / Short
            </option>
          </select>
        </div>

        {/* Quantity */}
        <div className={styles.field}>
          <label>Quantity</label>

          <input
            type="number"
            name="quantity"
            placeholder="10"
            required
          />
        </div>

        {/* Entry Price */}
        <div className={styles.field}>
          <label>
            Entry Price
          </label>

          <input
            type="number"
            step="0.01"
            name="entry_price"
            placeholder="2500"
            required
          />
        </div>

        <button
          type="submit"
          className={styles.submitButton}
        >
          Save Trade
        </button>
      </Form>
    </div>
  );
}