const file = "https://raw.githubusercontent.com/Jakarta-Team12/NYC-dataset/main/csvjson.json";

async function getData() {
    const response = await fetch(file);
    const body = await response.json();
    return body;
}

document.addEventListener("DOMContentLoaded", async (event) => {
    const data = await getData();
    console.log(data);

    const listBorough = Object.groupBy(data, ({ BOROUGH_NAME }) => BOROUGH_NAME);
    console.log(listBorough);
    const arrayBorough = Object.keys(listBorough).map(borough => {
        const value = listBorough[borough].map(totalsales => {
            return totalsales.TOTAL_SALES;
        }).reduce(function (result, item) {
            return result + item;
        }, 0);;
        console.log(value);
        return {
            x: borough, y: value
        };
    });
    console.log(arrayBorough);
    displayTotalSalesBorough(arrayBorough);
});

function displayTotalSalesBorough(chartData) {
    const ctx = document.getElementById('chartTotalSalesByBorough');

    new Chart(ctx, {
        type: 'bar',
        data: {
            datasets: [{
                data: chartData,
                label: 'series',
            }]
        }
    });
}