// live-price-updater.js

const BASE_URL =
    "http://localhost:3000/api/live-price-update";

/*
=========================
UPDATE LIVE PRICES
=========================
*/

async function updateLivePrices() {

    try {

        const response =
            await fetch(BASE_URL);

        if (!response.ok) {

            const text =
                await response.text();

            throw new Error(text);
        }

        const data =
            await response.json();

        console.log(
            `[${new Date().toLocaleTimeString()}]`,
            data.message
        );

    } catch (error) {

        console.error(
            `[${new Date().toLocaleTimeString()}]`,
            error
        );
    }
}

/*
=========================
INITIAL RUN
=========================
*/

updateLivePrices();

/*
=========================
RUN EVERY 2 SEC
=========================
*/

// setInterval(
//     updateLivePrices,
//     2000
// );