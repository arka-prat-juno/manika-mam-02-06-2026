const BASE_URL =
    "http://localhost:3000/api/api-settlement";

async function runSettlement() {

    try {

        const response =
            await fetch(BASE_URL);

        const data =
            await response.json();

        console.log(data);

    } catch (error) {

        console.error(error);
    }
}

runSettlement();