const file = "https://raw.githubusercontent.com/Jakarta-Team12/NYC-dataset/main/csvjson.json";

async function getData() {
    const response = await fetch(file);
    const body = await response.json();
    return body;
}

document.addEventListener("DOMContentLoaded", async () => {
    const data = await getData();
    console.log(data);

    //total sales per borough
    const boroughData = processTotalSalesByBorough(data);
    displayBarChart('chartTotalSalesByBorough', boroughData);

    // sales trend per month for Staten Island
    const salesTrendData = processSalesTrendDataForStatenIsland(data);
    displayLineChart('lineChartSalesTrend', salesTrendData);

    //  top 5 building class
    const buildingClassData = processTop5BuildingClass(data);
    displayPieChart('PieChartTop5', buildingClassData);

    //  sale price and residential unit
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

    const statenIslandData = data.filter(item => item.BOROUGH_NAME === 'Staten Island');
    console.log("Staten Island Data:", statenIslandData);

    const salesByMonth = {};

    statenIslandData.forEach(item => {
        const monthYear = item.MON_YYYY;
        const totalSales = parseFloat(item.TOTAL_SALES);
        if (!salesByMonth[monthYear]) {
            salesByMonth[monthYear] = 0;
        }
        salesByMonth[monthYear] += totalSales;
    });

    console.log("Sales by Month (before sorting):", salesByMonth);

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
    const monthsToCompare = ['Feb_2017', 'Mar_2017', 'May_2017', 'Jun_2017', 'Jul_2017', 'Aug_2017'];
    const filteredData = data.filter(item =>
        item.BOROUGH_NAME === 'Staten Island' && monthsToCompare.includes(item.MON_YYYY)
    );

    const salePriceByMonth = {};
    const residentialUnitByMonth = {};

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




//grafik tren per unit//
document.addEventListener("DOMContentLoaded", async (event) => {
    const data = await getData();
    console.log(data);

    const dataFebMar = data.filter(item => {
        const date = new Date(item.SALE_DATE);
        return date.getMonth() === 1 || date.getMonth() === 2;
    });

    let totalSalesCommercialFebMar = 0;
    let totalSalesResidentialFebMar = 0;
    dataFebMar.forEach(item => {
        if (item.BUILDING_CLASS_CATEGORY.includes("COMMERCIAL")) {
            totalSalesCommercialFebMar += item.TOTAL_SALES;
        } else if (item.BUILDING_CLASS_CATEGORY.includes("RESIDENTIAL")) {
            totalSalesResidentialFebMar += item.TOTAL_SALES;
        }
    });

    console.log("Total Sales - Commercial (Feb-Mar):", totalSalesCommercialFebMar);
    console.log("Total Sales - Residential (Feb-Mar):", totalSalesResidentialFebMar);

    displayTotalSalesByUnit('ChartTrendPerUnit', totalSalesCommercialFebMar, totalSalesResidentialFebMar, 'Feb-Mar');
    const dataMayJun = data.filter(item => {
        const date = new Date(item.SALE_DATE);
        return date.getMonth() === 4 || date.getMonth() === 5;
    });

    let totalSalesCommercialMayJun = 0;
    let totalSalesResidentialMayJun = 0;
    dataMayJun.forEach(item => {
        if (item.BUILDING_CLASS_CATEGORY.includes("COMMERCIAL")) {
            totalSalesCommercialMayJun += item.TOTAL_SALES;
        } else if (item.BUILDING_CLASS_CATEGORY.includes("RESIDENTIAL")) {
            totalSalesResidentialMayJun += item.TOTAL_SALES;
        }
    });

    console.log("Total Sales - Commercial (May-Jun):", totalSalesCommercialMayJun);
    console.log("Total Sales - Residential (May-Jun):", totalSalesResidentialMayJun);

    displayTotalSalesByUnit('ChartTrendPerUnit2', totalSalesCommercialMayJun, totalSalesResidentialMayJun, 'May-Jun');

    const dataJulAug = data.filter(item => {
        const date = new Date(item.SALE_DATE);
        return date.getMonth() === 6 || date.getMonth() === 7;
    });

    let totalSalesCommercialJulAug = 0;
    let totalSalesResidentialJulAug = 0;
    dataJulAug.forEach(item => {
        if (item.BUILDING_CLASS_CATEGORY.includes("COMMERCIAL")) {
            totalSalesCommercialJulAug += item.TOTAL_SALES;
        } else if (item.BUILDING_CLASS_CATEGORY.includes("RESIDENTIAL")) {
            totalSalesResidentialJulAug += item.TOTAL_SALES;
        }
    });

    console.log("Total Sales - Commercial (Jul-Aug):", totalSalesCommercialJulAug);
    console.log("Total Sales - Residential (Jul-Aug):", totalSalesResidentialJulAug);

    displayTotalSalesByUnit('ChartTrendPerUnit3', totalSalesCommercialJulAug, totalSalesResidentialJulAug, 'Jul-Aug');
});

function displayTotalSalesByUnit(canvasId, totalSalesCommercial, totalSalesResidential, periodLabel) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [periodLabel],
            datasets: [
                {
                    label: 'Commercial',
                    data: [totalSalesCommercial],
                    backgroundColor: 'rgba(255, 99, 132, 0.5)'
                },
                {
                    label: 'Residential',
                    data: [totalSalesResidential],
                    backgroundColor: 'rgba(54, 162, 235, 0.5)'
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}


//grafik tren per building//


document.addEventListener("DOMContentLoaded", async (event) => {
    const data = await getData();

    const filteredDataFebMar = data.filter(({ BOROUGH_NAME, SALE_DATE }) => {
        const saleDate = new Date(SALE_DATE);
        return BOROUGH_NAME === 'Staten Island' && (saleDate.getMonth() === 1 || saleDate.getMonth() === 2);
    });

    const listBuildingClassFebMar = Object.groupBy(filteredDataFebMar, ({ BUILDING_CLASS_CATEGORY }) => BUILDING_CLASS_CATEGORY);
    const arrayBuildingClassFebMar = Object.keys(listBuildingClassFebMar).map(buildingClass => {
        const value = listBuildingClassFebMar[buildingClass].map(totalsales => {
            return totalsales.TOTAL_SALES;
        }).reduce((result, item) => result + item, 0);
        return {
            buildingClass,
            value
        };
    });

    const topBuildingClassesFebMar = arrayBuildingClassFebMar.sort((a, b) => b.value - a.value).slice(0, 5);

    const filteredDataMayJun = data.filter(({ BOROUGH_NAME, SALE_DATE }) => {
        const saleDate = new Date(SALE_DATE);
        return BOROUGH_NAME === 'Staten Island' && (saleDate.getMonth() === 4 || saleDate.getMonth() === 5);
    });

    const listBuildingClassMayJun = Object.groupBy(filteredDataMayJun, ({ BUILDING_CLASS_CATEGORY }) => BUILDING_CLASS_CATEGORY);
    const arrayBuildingClassMayJun = Object.keys(listBuildingClassMayJun).map(buildingClass => {
        const value = listBuildingClassMayJun[buildingClass].map(totalsales => {
            return totalsales.TOTAL_SALES;
        }).reduce((result, item) => result + item, 0);
        return {
            buildingClass,
            value
        };
    });

    const topBuildingClassesMayJun = arrayBuildingClassMayJun.sort((a, b) => b.value - a.value).slice(0, 5);

    const filteredDataJulAug = data.filter(({ BOROUGH_NAME, SALE_DATE }) => {
        const saleDate = new Date(SALE_DATE);
        return BOROUGH_NAME === 'Staten Island' && (saleDate.getMonth() === 6 || saleDate.getMonth() === 7);
    });

    const listBuildingClassJulAug = Object.groupBy(filteredDataJulAug, ({ BUILDING_CLASS_CATEGORY }) => BUILDING_CLASS_CATEGORY);
    const arrayBuildingClassJulAug = Object.keys(listBuildingClassJulAug).map(buildingClass => {
        const value = listBuildingClassJulAug[buildingClass].map(totalsales => {
            return totalsales.TOTAL_SALES;
        }).reduce((result, item) => result + item, 0);
        return {
            buildingClass,
            value
        };
    });

    const topBuildingClassesJulAug = arrayBuildingClassJulAug.sort((a, b) => b.value - a.value).slice(0, 5);

    displayTrenBuilding('chartTrenBuilding1', topBuildingClassesFebMar, 'Feb-Mar');
    displayTrenBuilding('chartTrenBuilding2', topBuildingClassesMayJun, 'May-Jun');
    displayTrenBuilding('chartTrenBuilding3', topBuildingClassesJulAug, 'Jul-Aug');
});

function displayTrenBuilding(chartId, chartData, label) {
    const ctx = document.getElementById(chartId).getContext('2d');

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartData.map(data => data.buildingClass),
            datasets: [{
                data: chartData.map(data => data.value),
                label: 'Sale Price',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },


        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: `Total Sales ${label}`
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `${context.dataset.label}: ${context.raw}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Total Sales'
                    }
                },

            }
        }
    });
}

if (!Object.groupBy) {
    Object.groupBy = function (array, keyFunc) {
        return array.reduce((result, item) => {
            const key = keyFunc(item);
            if (!result[key]) {
                result[key] = [];
            }
            result[key].push(item);
            return result;
        }, {});
    };
}
