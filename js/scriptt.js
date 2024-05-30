const file = "https://raw.githubusercontent.com/Jakarta-Team12/NYC-dataset/main/csvjson.json";

async function getData() {
    const response = await fetch(file);
    const body = await response.json();
    return body;
}

document.addEventListener("DOMContentLoaded", async () => {
    const data = await getData();
    console.log(data);

    // Process and display total sales per borough
    const boroughData = processTotalSalesByBorough(data);
    displayBarChart('chartTotalSalesByBorough', boroughData);

    // Process and display sales trend per month for Staten Island
    const salesTrendData = processSalesTrendDataForStatenIsland(data);
    displayLineChart('lineChartSalesTrend', salesTrendData);

    // Process and display top 5 building class
    const buildingClassData = processTop5BuildingClass(data);
    displayPieChart('PieChartTop5', buildingClassData);

    // Process and display comparison chart for sale price and residential unit in specific months
    const comparisonData = processComparisonDataForStatenIsland(data);
    displayComparisonBarChart('chartComparison', comparisonData);
});

function processTotalSalesByBorough(data) {
    const listBorough = data.reduce((acc, item) => {
        const key = item.BOROUGH_NAME;
        if (!acc[key]) acc[key] = 0;
        acc[key] += item.TOTAL_SALES;
        return acc;
    }, {});

    const arrayBorough = Object.keys(listBorough).map(key => ({
        x: key,
        y: listBorough[key]
    }));

    console.log(arrayBorough);
    return {
        labels: arrayBorough.map(item => item.x),
        datasets: [{
            data: arrayBorough.map(item => item.y),
            label: 'Sales Total',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
        }]
    };
}

function processSalesTrendDataForStatenIsland(data) {
    // Filter data for Staten Island
    const statenIslandData = data.filter(item => item.BOROUGH_NAME === 'Staten Island');
    console.log("Staten Island Data:", statenIslandData);

    // Initialize an object to store total sales per month
    const salesByMonth = {};

    // Calculate total sales per month
    statenIslandData.forEach(item => {
        const monthYear = item.MON_YYYY;
        const totalSales = parseFloat(item.TOTAL_SALES);
        if (!salesByMonth[monthYear]) {
            salesByMonth[monthYear] = 0;
        }
        salesByMonth[monthYear] += totalSales;
    });

    console.log("Sales by Month (before sorting):", salesByMonth);

    // Convert the salesByMonth object into an array and sort it
    const sortedSalesData = Object.keys(salesByMonth).map(key => ({
        month: key,
        sales: salesByMonth[key]
    })).sort((a, b) => {
        const [monthA, yearA] = a.month.split('_');
        const [monthB, yearB] = b.month.split('_');
        const dateA = new Date(`${monthA} 1, ${yearA}`);
        const dateB = new Date(`${monthB} 1, ${yearB}`);
        return dateA - dateB;
    });

    console.log("Sorted Sales Data:", sortedSalesData);

    // Prepare the labels and data values for the chart
    const labels = sortedSalesData.map(item => item.month.replace('_', ' '));
    const dataValues = sortedSalesData.map(item => item.sales);

    console.log("Labels:", labels);
    console.log("Data Values:", dataValues);

    return {
        labels: labels,
        datasets: [{
            label: 'Sales Trend',
            data: dataValues,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            fill: false,
            borderWidth: 1
        }]
    };
}

function processComparisonDataForStatenIsland(data) {
    // Filter data for Staten Island and specific months
    const monthsToCompare = ['Feb_2017', 'Mar_2017', 'May_2017', 'Jun_2017', 'Jul_2017', 'Aug_2017'];
    const filteredData = data.filter(item => 
        item.BOROUGH_NAME === 'Staten Island' && monthsToCompare.includes(item.MON_YYYY)
    );

    // Initialize objects to store total sale price and total residential unit per month
    const salePriceByMonth = {};
    const residentialUnitByMonth = {};

    // Calculate total sale price and total residential unit per month
    filteredData.forEach(item => {
        const monthYear = item.MON_YYYY;
        const totalSalePrice = parseFloat(item.TOTAL_SALE_PRICE);
        const totalResidentialUnit = parseInt(item.RESIDENTIAL_UNITS);

        if (!salePriceByMonth[monthYear]) {
            salePriceByMonth[monthYear] = 0;
        }
        if (!residentialUnitByMonth[monthYear]) {
            residentialUnitByMonth[monthYear] = 0;
        }

        salePriceByMonth[monthYear] += totalSalePrice;
        residentialUnitByMonth[monthYear] += totalResidentialUnit;
    });

    // Sort the months in chronological order
    const sortedMonths = Object.keys(salePriceByMonth).sort((a, b) => {
        const [monthA, yearA] = a.split('_');
        const [monthB, yearB] = b.split('_');
        const dateA = new Date(`${monthA} 1, ${yearA}`);
        const dateB = new Date(`${monthB} 1, ${yearB}`);
        return dateA - dateB;
    });

    // Prepare the labels and data values for the chart
    const labels = sortedMonths.map(item => item.replace('_', ' '));
    const salePriceValues = sortedMonths.map(month => salePriceByMonth[month]);
    const residentialUnitValues = sortedMonths.map(month => residentialUnitByMonth[month]);

    return {
        labels: labels,
        datasets: [
            {
                label: 'Total Sale Price',
                data: salePriceValues,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            },
            {
                label: 'Total Residential Unit',
                data: residentialUnitValues,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }
        ]
    };
}

function displayBarChart(canvasId, chartData) {
    const ctx = document.getElementById(canvasId);
    new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: {
            responsive: true,
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true
                }
            }
        }
    });
}

function displayLineChart(canvasId, chartData) {
    const ctx = document.getElementById(canvasId);
    new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
            responsive: true
        }
    });
}

function displayComparisonBarChart(canvasId, chartData) {
    const ctx = document.getElementById(canvasId);
    new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function processTop5BuildingClass(data) {
    const listBuildingClass = data.reduce((acc, item) => {
        const key = item.BUILDING_CLASS_CATEGORY;
        if (!acc[key]) acc[key] = 0;
        acc[key] += item.TOTAL_SALES;
        return acc;
    }, {});

    const arrayBuildingClass = Object.keys(listBuildingClass).map(key => ({
        label: key,
        value: listBuildingClass[key]
    })).sort((a, b) => b.value - a.value).slice(0, 5);

    console.log(arrayBuildingClass);
    return {
        labels: arrayBuildingClass.map(item => item.label),
        datasets: [{
            data: arrayBuildingClass.map(item => item.value),
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)'
            ],
            borderWidth: 1
        }]
    };
}

function displayPieChart(canvasId, chartData) {
    const ctx = document.getElementById(canvasId);
    new Chart(ctx, {
        type: 'pie',
        data: chartData,
        options: {
            responsive: true
        }
    });
}
