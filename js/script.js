const file = "https://raw.githubusercontent.com/Jakarta-Team12/NYC-dataset/main/csvjson2.json";
let barchart = null;

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
            backgroundColor: [
                '#0e0e70',  
            ],
            borderColor: [
                'rgba(0, 0, 139, 1)',      
            ],
            borderWidth: 1
        }]
    };
}

function processSalesTrendDataForStatenIsland(data) {
    const statenIslandData = data.filter(item => item.BOROUGH_NAME === 'Staten Island');
    console.log("Staten Island Data:", statenIslandData);

    const salesByMonth = {};

    statenIslandData.forEach(item => {
        const [month, year] = item.MON_YYYY.split('-');
        const monthYear = `${month}-${parseInt(year) < 50 ? 20 : 19}${year}`;
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
        const [monthA, yearA] = a.month.split('-');
        const [monthB, yearB] = b.month.split('-');
        const dateA = new Date(`${yearA}-${monthA}-01`);
        const dateB = new Date(`${yearB}-${monthB}-01`);
        if (dateA.getFullYear() !== dateB.getFullYear()) {
            return dateA.getFullYear() - dateB.getFullYear();
        } else {
            return dateA.getMonth() - dateB.getMonth();
        }
    });

    console.log("Sorted Sales Data:", sortedSalesData);

    const labels = sortedSalesData.map(item => item.month);
    const dataValues = sortedSalesData.map(item => item.sales);

    console.log("Labels:", labels);
    console.log("Data Values:", dataValues);

    return {
        labels: labels,
        datasets: [{
            label: 'Total Sales',
            data: dataValues,
            borderColor: '#0e0e70',
            backgroundColor: '#0e0e70',
            fill: false,
            borderWidth: 1
        }]
    };
}


function displayBarChart(canvasId, chartData) {
    if (barchart != null) {
        barchart.destroy();
    }

    const ctx = document.getElementById(canvasId);

    barchart = new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: {
            responsive: true,
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Total Sales' 
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Borough' 
                    }
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
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Month-Year' 
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Total Sales' 
                    }
                }
            }
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
    const statenIslandData = data.filter(item => item.BOROUGH_NAME === 'Staten Island');

    const listBuildingClass = statenIslandData.reduce((acc, item) => {
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
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                },
            },
        },
    });
}




/*-------------sales total per unit------------------*/


async function getData() {
    const response = await fetch(file);
    const body = await response.json();
    return body;
}

document.addEventListener("DOMContentLoaded", async (event) => {
    const data = await getData();

    const filterDataByMonth = (data, months) => {
        return data.filter(({ BOROUGH_NAME, MON_YYYY }) => {
            const [month, year] = MON_YYYY.split('-');
            const monthIndex = new Date(`${month} 1, ${year}`).getMonth() + 1;
            return BOROUGH_NAME === 'Staten Island' && months.includes(monthIndex);
        });
    };

    const calculateTotalSales = (data) => {
        return {
            commercial: data.reduce((total, item) => total + (item.COMMERCIAL_SALES || 0), 0),
            residential: data.reduce((total, item) => total + (item.RESIDENTIAL_SALES || 0), 0),
        };
    };

    const filteredDataFebMar = filterDataByMonth(data, [2, 3]);
    const totalSalesFebMar = calculateTotalSales(filteredDataFebMar);

    const filteredDataMarApr = filterDataByMonth(data, [3, 4]);
    const totalSalesMarApr = calculateTotalSales(filteredDataMarApr);

    const filteredDataJulAug = filterDataByMonth(data, [7, 8]);
    const totalSalesJulAug = calculateTotalSales(filteredDataJulAug);

    displayTotalSalesByUnit('ChartTrendPerUnit', [
        { label: 'Feb-Mar', commercial: totalSalesFebMar.commercial, residential: totalSalesFebMar.residential },
        { label: 'Mar-Apr', commercial: totalSalesMarApr.commercial, residential: totalSalesMarApr.residential },
        { label: 'Jul-Aug', commercial: totalSalesJulAug.commercial, residential: totalSalesJulAug.residential }
    ]);
});

function displayTotalSalesByUnit(canvasId, dataSets) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    const labels = dataSets.map(item => item.label);
    const commercialData = dataSets.map(item => item.commercial);
    const residentialData = dataSets.map(item => item.residential);

    const data = {
        labels: labels,
        datasets: [
            {
                label: 'Commercial Sales',
                data: commercialData,
                backgroundColor: '#0e0e70',
                borderColor: '#0e0e70',
                borderWidth: 1
            },
            {
                label: 'Residential Sales',
                data: residentialData,
                backgroundColor: '#a5a7f8',
                borderColor: '#a5a7f8',
                borderWidth: 1
            }
        ]
    };

    const config = {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
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
    };

    new Chart(ctx, config);
}



/*-------------sales total per building------------------*/

async function getData() {
    const response = await fetch(file);
    const body = await response.json();
    return body;
}

document.addEventListener("DOMContentLoaded", async (event) => {
    const data = await getData();

    const filterDataByMonth = (data, months) => {
        return data.filter(({ BOROUGH_NAME, MON_YYYY }) => {
            const [month, year] = MON_YYYY.split('-');
            const monthIndex = new Date(`${month} 1, ${year}`).getMonth() + 1;
            return BOROUGH_NAME === 'Staten Island' && months.includes(monthIndex);
        });
    };

    const groupByBuildingClass = (data) => {
        return Object.entries(data.reduce((result, item) => {
            const { BUILDING_CLASS_CATEGORY, TOTAL_SALES } = item;
            if (!result[BUILDING_CLASS_CATEGORY]) {
                result[BUILDING_CLASS_CATEGORY] = 0;
            }
            result[BUILDING_CLASS_CATEGORY] += TOTAL_SALES;
            return result;
        }, {})).map(([buildingClass, value]) => ({ buildingClass, value }));
    };

    const filteredDataFebMar = filterDataByMonth(data, [2, 3]);
    const topBuildingClassesFebMar = groupByBuildingClass(filteredDataFebMar).sort((a, b) => b.value - a.value).slice(0, 5);

    const filteredDataMarApr = filterDataByMonth(data, [3, 4]);
    const topBuildingClassesMarApr = groupByBuildingClass(filteredDataMarApr).sort((a, b) => b.value - a.value).slice(0, 5);

    const filteredDataJulAug = filterDataByMonth(data, [7, 8]);
    const topBuildingClassesJulAug = groupByBuildingClass(filteredDataJulAug).sort((a, b) => b.value - a.value).slice(0, 5);

    displayTrenBuilding('chartTrenBuilding1', topBuildingClassesFebMar, 'Feb-Mar');
    displayTrenBuilding('chartTrenBuilding2', topBuildingClassesMarApr, 'Mar-Apr');
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
                backgroundColor: '#a5a7f8',
                borderColor: '#a5a7f8',
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




/*--------------------TABLE DATA----------------*/

const itemsPerPage = 10;
let currentPage = 1;
const maxButtons = 4;
let sortDirection = '';
let currentSortColumn = '';

document.addEventListener("DOMContentLoaded", async () => {
    const data = await getData();
    const statenIslandData = filterDataByBorough(data, 'Staten Island');
    let groupedData = groupByBuildingClass(statenIslandData);
    let sortedData = groupedData.slice();
    const tableBody = document.getElementById('table-body');
    const pagination = document.getElementById('pagination');
    const tableSearchInput = document.getElementById('table-search-input');
    const sortBuildingClassHeader = document.getElementById('sort-category');
    const sortResidentialUnitsHeader = document.getElementById('sort-residential-units');
    const sortCommercialUnitsHeader = document.getElementById('sort-commercial-units');
    const sortTotalSalesHeader = document.getElementById('sort-total-sales');

    function filterDataByBorough(data, boroughName) {
        return data.filter(item => item["BOROUGH_NAME"] === boroughName);
    }

    function groupByBuildingClass(data) {
        const groups = {};
        data.forEach(item => {
            const buildingClass = item["BUILDING_CLASS_CATEGORY"];
            if (!groups[buildingClass]) {
                groups[buildingClass] = {
                    "BUILDING_CLASS_CATEGORY": buildingClass,
                    "RESIDENTIAL_UNITS": 0,
                    "COMMERCIAL_UNITS": 0,
                    "TOTAL_SALES": 0
                };
            }
            groups[buildingClass]["RESIDENTIAL_UNITS"] += parseInt(item["RESIDENTIAL_UNITS"]);
            groups[buildingClass]["COMMERCIAL_UNITS"] += parseInt(item["COMMERCIAL_UNITS"]);
            groups[buildingClass]["TOTAL_SALES"] += parseFloat(item["TOTAL_SALES"]);
        });
        return Object.values(groups);
    }

    function handleSearchData(event) {
        const value = event.target.value.trim().toLowerCase();
        sortedData = groupedData.filter(item => {
            return (
                item["BUILDING_CLASS_CATEGORY"].toLowerCase().includes(value)
            );
        });
        currentPage = 1;
        displayItems();
        displayPagination();
    }

    function displayItems() {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedItems = sortedData.slice(start, end);

        tableBody.innerHTML = '';
        paginatedItems.forEach((item, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${start + index + 1}</td>
                <td>${item["BUILDING_CLASS_CATEGORY"]}</td>
                <td>${item["RESIDENTIAL_UNITS"]}</td>
                <td>${item["COMMERCIAL_UNITS"]}</td>
                <td>${item["TOTAL_SALES"]}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    function sortByColumn(column) {
        if (currentSortColumn === column) {
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            sortDirection = 'asc';
            currentSortColumn = column;
        }

        sortedData.sort((a, b) => {
            let valueA = a[column];
            let valueB = b[column];
            if (typeof valueA === 'number' && typeof valueB === 'number') {
                return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
            } else {
                return sortDirection === 'asc'
                    ? valueA.toString().localeCompare(valueB.toString())
                    : valueB.toString().localeCompare(valueA.toString());
            }
        });

        currentPage = 1;
        displayItems();
        displayPagination();
        updateSortIcon(column);
    }

    function updateSortIcon(column) {
        const sortIcons = {
            'BUILDING_CLASS_CATEGORY': document.getElementById('sort-icon-category'),
            'RESIDENTIAL_UNITS': document.getElementById('sort-icon-residential-units'),
            'COMMERCIAL_UNITS': document.getElementById('sort-icon-commercial-units'),
            'TOTAL_SALES': document.getElementById('sort-icon-total-sales')
        };

        Object.keys(sortIcons).forEach(key => {
            sortIcons[key].classList.remove('sort-icon-asc', 'sort-icon-desc');
            sortIcons[key].innerHTML = '&#x25B2;&#x25BC;';
        });

        if (sortIcons[column]) {
            sortIcons[column].innerHTML = sortDirection === 'asc' ? '&#x25B2;' : '&#x25BC;';
            sortIcons[column].classList.add(sortDirection === 'asc' ? 'sort-icon-asc' : 'sort-icon-desc');
        }
    }

    function displayPagination() {
        const totalPages = Math.ceil(sortedData.length / itemsPerPage);
        pagination.innerHTML = '';
        const startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
        const endPage = Math.min(totalPages, startPage + maxButtons - 1);

        if (startPage > 1) {
            pagination.appendChild(createPaginationButton('Prev', currentPage - 1));
        }

        for (let i = startPage; i <= endPage; i++) {
            pagination.appendChild(createPaginationButton(i, i));
        }

        if (endPage < totalPages) {
            pagination.appendChild(createPaginationButton('Next', currentPage + 1));
        }
    }

    function createPaginationButton(label, pageNumber) {
        const button = document.createElement('button');
        button.textContent = label;
        if (pageNumber === currentPage) {
            button.classList.add('active');
        }
        button.addEventListener('click', () => {
            currentPage = pageNumber;
            displayItems();
            displayPagination();
        });
        return button;
    }

    displayItems();
    displayPagination();

    sortBuildingClassHeader.addEventListener('click', () => {
        sortByColumn('BUILDING_CLASS_CATEGORY');
    });

    sortResidentialUnitsHeader.addEventListener('click', () => {
        sortByColumn('RESIDENTIAL_UNITS');
    });

    sortCommercialUnitsHeader.addEventListener('click', () => {
        sortByColumn('COMMERCIAL_UNITS');
    });

    sortTotalSalesHeader.addEventListener('click', () => {
        sortByColumn('TOTAL_SALES');
    });

    tableSearchInput.addEventListener('input', handleSearchData);
});
