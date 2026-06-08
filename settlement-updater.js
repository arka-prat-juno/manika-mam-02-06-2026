// settlement-updater.js

const BASE_URL =
    "http://localhost:3000/api/api-settlement";

async function runSettlement() {

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
            `[${new Date().toLocaleString()}]`,
            data.message
        );

    } catch (error) {

        console.error(
            `[${new Date().toLocaleString()}]`,
            error
        );
    }
}

runSettlement();