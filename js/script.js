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
                'rgba(70, 130, 180, 1)',  
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
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
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

    const filteredDataMayJun = filterDataByMonth(data, [5, 6]);
    const totalSalesMayJun = calculateTotalSales(filteredDataMayJun);

    const filteredDataJulAug = filterDataByMonth(data, [7, 8]);
    const totalSalesJulAug = calculateTotalSales(filteredDataJulAug);

    displayTotalSalesByUnit('ChartTrendPerUnit', [
        { label: 'Feb-Mar', commercial: totalSalesFebMar.commercial, residential: totalSalesFebMar.residential },
        { label: 'May-Jun', commercial: totalSalesMayJun.commercial, residential: totalSalesMayJun.residential },
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
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            },
            {
                label: 'Residential Sales',
                data: residentialData,
                backgroundColor: '#a5a7f8',
                borderColor: 'rgba(54, 162, 235, 1)',
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




/*---------------*/

const itemsPerPage = 10; 
let currentPage = 1; 
const maxButtons = 4;
let sortDirection = '';
let currentSortColumn = '';

async function getData() {
    const response = await fetch(file);
    const body = await response.json();
    return body;
}

document.addEventListener("DOMContentLoaded", async () => {
    const data = await getData();
    let sortedData = data.slice();
    const tableBody = document.getElementById('table-body');
    const pagination = document.getElementById('pagination');
    const tableSearchInput = document.getElementById('table-search-input');
    const sortSaleDateHeader = document.getElementById('sort-sale-date');
    const sortBuildingClassHeader = document.getElementById('sort-building-class');
    const sortResidentialUnitsHeader = document.getElementById('sort-residential-units');
    const sortCommercialUnitsHeader = document.getElementById('sort-commercial-units');
    const sortTotalSalesHeader = document.getElementById('sort-total-sales');


    function handleSearchData(event) {
        const value = event.target.value.trim().toLowerCase();
        sortedData = data.filter(item => item["SALE_DATE"].toLowerCase().includes(value));
        currentPage = 1; 
        displayItems();
        displayPagination();
    }


    function displayItems() {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedItems = sortedData.slice(start, end);

        tableBody.innerHTML = '';
        paginatedItems.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item["SALE_DATE"]}</td>
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
            const valueA = a[column];
            const valueB = b[column];
            if (typeof valueA === 'number' && typeof valueB === 'number') {
                if (sortDirection === 'asc') {
                    return valueA - valueB;
                } else {
                    return valueB - valueA;
                }
            } else {
                if (sortDirection === 'asc') {
                    return valueA.toString().localeCompare(valueB.toString());
                } else {
                    return valueB.toString().localeCompare(valueA.toString());
                }
            }
        });

        currentPage = 1; 
        displayItems();
        displayPagination();
        updateSortIcon(column);
    }

   
    function updateSortIcon(column) {
        const sortIcons = {
            'SALE_DATE': document.getElementById('sort-icon-sale-date'),
            'BUILDING_CLASS_CATEGORY': document.getElementById('sort-icon-building-class'),
            'RESIDENTIAL_UNITS': document.getElementById('sort-icon-residential-units'),
            'COMMERCIAL_UNITS': document.getElementById('sort-icon-commercial-units'),
            'TOTAL_SALES': document.getElementById('sort-icon-total-sales')
        };
        
        Object.keys(sortIcons).forEach(key => {
            sortIcons[key].innerHTML = '';
        });
        
        if (sortIcons[column]) {
            sortIcons[column].innerHTML = sortDirection === 'asc' ? ' &#x25B2;' : ' &#x25BC;';
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

  
    sortSaleDateHeader.addEventListener('click', () => {
        sortByColumn('SALE_DATE');
    });

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
