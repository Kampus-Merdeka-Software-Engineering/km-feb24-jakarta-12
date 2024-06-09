const file = 'https://raw.githubusercontent.com/Jakarta-Team12/NYC-dataset/main/csvjson2.json';
let barchart = null;

async function getData() {
  const response = await fetch(file);
  const body = await response.json();
  return body;
}

document.addEventListener('DOMContentLoaded', async () => {
  const data = await getData();
  console.log(data);

  //  sale price and residential unit
  const comparisonData = processComparisonDataForStatenIsland(data);
  displayComparisonBarChart('chartComparison', comparisonData);
});

/*-------------sales total per unit------------------*/

async function getData() {
  const response = await fetch(file);
  const body = await response.json();
  return body;
}

document.addEventListener('DOMContentLoaded', async (event) => {
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
    { label: 'Jul-Aug', commercial: totalSalesJulAug.commercial, residential: totalSalesJulAug.residential },
  ]);
});

function displayTotalSalesByUnit(canvasId, dataSets) {
  const ctx = document.getElementById(canvasId).getContext('2d');

  const labels = dataSets.map((item) => item.label);
  const commercialData = dataSets.map((item) => item.commercial);
  const residentialData = dataSets.map((item) => item.residential);

  const data = {
    labels: labels,
    datasets: [
      {
        label: 'Commercial Sales',
        data: commercialData,
        backgroundColor: '#0e0e70',
        borderColor: '#0e0e70',
        borderWidth: 1,
      },
      {
        label: 'Residential Sales',
        data: residentialData,
        backgroundColor: '#a5a7f8',
        borderColor: '#a5a7f8',
        borderWidth: 1,
      },
    ],
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
            text: 'Total Sales',
          },
        },
      },
    },
  };

  new Chart(ctx, config);
}

/*-------------sales total per building------------------*/

async function getData() {
  const response = await fetch(file);
  const body = await response.json();
  return body;
}

document.addEventListener('DOMContentLoaded', async (event) => {
  const data = await getData();

  const filterDataByMonth = (data, months) => {
    return data.filter(({ BOROUGH_NAME, MON_YYYY }) => {
      const [month, year] = MON_YYYY.split('-');
      const monthIndex = new Date(`${month} 1, ${year}`).getMonth() + 1;
      return BOROUGH_NAME === 'Staten Island' && months.includes(monthIndex);
    });
  };

  const groupByBuildingClass = (data) => {
    return Object.entries(
      data.reduce((result, item) => {
        const { BUILDING_CLASS_CATEGORY, TOTAL_SALES } = item;
        if (!result[BUILDING_CLASS_CATEGORY]) {
          result[BUILDING_CLASS_CATEGORY] = 0;
        }
        result[BUILDING_CLASS_CATEGORY] += TOTAL_SALES;
        return result;
      }, {})
    ).map(([buildingClass, value]) => ({ buildingClass, value }));
  };

  const filteredDataFebMar = filterDataByMonth(data, [2, 3]);
  const topBuildingClassesFebMar = groupByBuildingClass(filteredDataFebMar)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const filteredDataMarApr = filterDataByMonth(data, [3, 4]);
  const topBuildingClassesMarApr = groupByBuildingClass(filteredDataMarApr)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const filteredDataJulAug = filterDataByMonth(data, [7, 8]);
  const topBuildingClassesJulAug = groupByBuildingClass(filteredDataJulAug)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  displayTrenBuilding('chartTrenBuilding1', topBuildingClassesFebMar, 'Feb-Mar');
  displayTrenBuilding('chartTrenBuilding2', topBuildingClassesMarApr, 'Mar-Apr');
  displayTrenBuilding('chartTrenBuilding3', topBuildingClassesJulAug, 'Jul-Aug');
});

function displayTrenBuilding(chartId, chartData, label) {
  const ctx = document.getElementById(chartId).getContext('2d');

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: chartData.map((data) => data.buildingClass),
      datasets: [
        {
          data: chartData.map((data) => data.value),
          label: 'Sale Price',
          backgroundColor: '#a5a7f8',
          borderColor: '#a5a7f8',
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: `Total Sales ${label}`,
          position: 'bottom',
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${context.dataset.label}: ${context.raw}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Total Sales',
          },
        },
      },
    },
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

document.addEventListener('DOMContentLoaded', async () => {
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
    return data.filter((item) => item['BOROUGH_NAME'] === boroughName);
  }

  function groupByBuildingClass(data) {
    const groups = {};
    data.forEach((item) => {
      const buildingClass = item['BUILDING_CLASS_CATEGORY'];
      if (!groups[buildingClass]) {
        groups[buildingClass] = {
          BUILDING_CLASS_CATEGORY: buildingClass,
          RESIDENTIAL_UNITS: 0,
          COMMERCIAL_UNITS: 0,
          TOTAL_SALES: 0,
        };
      }
      groups[buildingClass]['RESIDENTIAL_UNITS'] += parseInt(item['RESIDENTIAL_UNITS']);
      groups[buildingClass]['COMMERCIAL_UNITS'] += parseInt(item['COMMERCIAL_UNITS']);
      groups[buildingClass]['TOTAL_SALES'] += parseFloat(item['TOTAL_SALES']);
    });
    return Object.values(groups);
  }

  function handleSearchData(event) {
    const value = event.target.value.trim().toLowerCase();
    sortedData = groupedData.filter((item) => {
      return item['BUILDING_CLASS_CATEGORY'].toLowerCase().includes(value);
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
                <td>${item['BUILDING_CLASS_CATEGORY']}</td>
                <td>${item['RESIDENTIAL_UNITS']}</td>
                <td>${item['COMMERCIAL_UNITS']}</td>
                <td>${item['TOTAL_SALES']}</td>
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
        return sortDirection === 'asc' ? valueA.toString().localeCompare(valueB.toString()) : valueB.toString().localeCompare(valueA.toString());
      }
    });

    currentPage = 1;
    displayItems();
    displayPagination();
    updateSortIcon(column);
  }

  function updateSortIcon(column) {
    const sortIcons = {
      BUILDING_CLASS_CATEGORY: document.getElementById('sort-icon-category'),
      RESIDENTIAL_UNITS: document.getElementById('sort-icon-residential-units'),
      COMMERCIAL_UNITS: document.getElementById('sort-icon-commercial-units'),
      TOTAL_SALES: document.getElementById('sort-icon-total-sales'),
    };

    Object.keys(sortIcons).forEach((key) => {
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

document.addEventListener('DOMContentLoaded', function () {
  var ctx = document.getElementById('chartTotalSalesByBorough').getContext('2d');
  var monthSelect = document.getElementById('monthSelect');

  // Function to fetch JSON file
  function fetchJSONFile(path, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        callback(JSON.parse(xhr.responseText));
      }
    };
    xhr.open('GET', path, true);
    xhr.send();
  }

  // Function to update chart based on selected month
  function updateChart(selectedMonth) {
    fetchJSONFile('data/borough.json', function (data) {
      var boroughSales = {};

      // Filter data based on selected month
      data.forEach(function (item) {
        var monthYear = item.MONTH_YEAR;
        if (selectedMonth === 'all' || monthYear === selectedMonth) {
          var boroughName = item.BOROUGH_NAME;
          var totalSales = parseFloat(item.TOTAL_SALES);

          if (boroughSales[boroughName]) {
            boroughSales[boroughName] += totalSales;
          } else {
            boroughSales[boroughName] = totalSales;
          }
        }
      });

      var chartData = {
        labels: Object.keys(boroughSales),
        datasets: [
          {
            label: 'Total Sales',
            borderColor: '#0e0e70',
            backgroundColor: '#0e0e70',
            borderWidth: 1,
            data: Object.values(boroughSales),
          },
        ],
      };

      var options = {
        indexAxis: 'y', // Make the chart horizontal
        scales: {
          x: {
            beginAtZero: true,
          },
        },
      };

      // Destroy the existing chart if it exists
      if (window.myChart instanceof Chart) {
        window.myChart.destroy();
      }

      // Create new chart
      window.myChart = new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: options,
      });
    });
  }

  // Event listener for month select change
  monthSelect.addEventListener('change', function () {
    var selectedMonth = monthSelect.value;
    updateChart(selectedMonth);
  });

  // Initial chart creation
  updateChart('all');
});

document.addEventListener('DOMContentLoaded', function () {
  var ctx = document.getElementById('lineChartSalesTrend').getContext('2d');
  var monthSelect = document.getElementById('monthSelect');

  // Function to fetch JSON file
  function fetchJSONFile(path, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        callback(JSON.parse(xhr.responseText));
      }
    };
    xhr.open('GET', path, true);
    xhr.send();
  }

  // Fetch data and draw chart
  fetchJSONFile('data/borough.json', function (data) {
    var salesData = data.filter(function (item) {
      return item.BOROUGH_NAME === 'Staten Island';
    });

    var labels = [];
    var sales = [];

    salesData.forEach(function (item) {
      labels.push(getMonthYear(item.MONTH_YEAR));
      sales.push(parseFloat(item.TOTAL_SALES));
    });

    var lineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Total Sales',
            data: sales,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          xAxes: [
            {
              scaleLabel: {
                display: true,
                labelString: 'Month and Year',
              },
            },
          ],
          yAxes: [
            {
              scaleLabel: {
                display: true,
                labelString: 'Total Sales',
              },
              ticks: {
                beginAtZero: true,
                callback: function (value, index, values) {
                  return '$' + value; // Add $ sign to y-axis values
                },
              },
            },
          ],
        },
      },
    });
  });

  // Function to get month and year from month-year string
  function getMonthYear(monthYear) {
    var parts = monthYear.split('-');
    var month = parseInt(parts[1], 10);
    var year = parts[0];
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month - 1] + ' ' + year;
  }
});

document.addEventListener('DOMContentLoaded', function () {
  var ctx = document.getElementById('PieChartTop5').getContext('2d');
  var monthSelect = document.getElementById('monthSelect');
  var chart;
  var allData;

  // Function to fetch JSON file
  function fetchJSONFile(path, callback) {
    fetch(path)
      .then((response) => response.json())
      .then((data) => callback(data))
      .catch((error) => console.error('Error loading data:', error));
  }

  // Function to update chart based on selected month
  function updateChart() {
    var selectedMonth = monthSelect.value;
    var salesByCategory = {};

    // Filter and aggregate data based on selected month
    allData.forEach(function (item) {
      var monthYear = item.MONTH_YEAR;
      if (selectedMonth === 'all' || monthYear === selectedMonth) {
        var buildingCategory = item.BUILDING_CLASS_CATEGORY;
        var totalSales = parseFloat(item.TOTAL_SALES);

        if (salesByCategory[buildingCategory]) {
          salesByCategory[buildingCategory] += totalSales;
        } else {
          salesByCategory[buildingCategory] = totalSales;
        }
      }
    });

    // Get top 5 categories
    var top5Categories = Object.entries(salesByCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    var labels = top5Categories.map((item) => item[0]);
    var sales = top5Categories.map((item) => item[1]);

    var chartData = {
      labels: labels,
      datasets: [
        {
          label: 'Total Sales',
          backgroundColor: ['rgb(166, 119, 255)', 'rgb(88, 37, 168)', 'rgb(82, 74, 187)', '#a5a7f8', '#0e0e70'],
          borderColor: ['rgb(0, 0, 0)'],
          borderWidth: 1,
          data: sales,
        },
      ],
    };

    var options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
        },
      },
    };

    // Destroy the existing chart if it exists
    if (chart) {
      chart.destroy();
    }

    // Create new chart
    chart = new Chart(ctx, {
      type: 'doughnut',
      data: chartData,
      options: options,
    });
  }

  // Initial data fetch and chart creation
  fetchJSONFile('data/piechart.json', function (data) {
    allData = data;
    updateChart();
  });

  // Event listener for month select change
  monthSelect.addEventListener('change', updateChart);
});
