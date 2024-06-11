const file = 'https://raw.githubusercontent.com/Jakarta-Team12/NYC-dataset/main/csvjson2.json';
let barchart = null;

async function getData() {
  const response = await fetch(file);
  const body = await response.json();
  return body;
}

const filterDataByMonth = (data, months) => {
  return data.filter(({ BOROUGH_NAME, MON_YYYY }) => {
    const [month, year] = MON_YYYY.split('-');
    const monthIndex = new Date(`${month} 1, ${year}`).getMonth() + 1;
    return BOROUGH_NAME === 'Staten Island' && months.includes(monthIndex);
  });
};

document.addEventListener('DOMContentLoaded', async () => {
  const data = await getData();
});

/*-------------sales total per unit------------------*/

document.addEventListener('DOMContentLoaded', async (event) => {
  const data = await getData();

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
        x: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Month-Year',
          },
        },
      },
    },
  };

  const myChart = new Chart(ctx, config);
}

/*-------------sales total per building------------------*/


document.addEventListener('DOMContentLoaded', async (event) => {
  const data = await getData();

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

  const chart = new Chart(ctx, {
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
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: `Total Sales ${label}`,
          position: 'bottom',
          padding: {
            top: 20,
            bottom: 10,
          },
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

let itemsPerPage = 10;
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
  const itemsPerPageSelect = document.getElementById('rows-per-page');

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

  itemsPerPageSelect.addEventListener('change', (event) => {
    itemsPerPage = parseInt(event.target.value);
    currentPage = 1;
    displayItems();
    displayPagination();
  });

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


/*-----sales borough-----*/
document.addEventListener('DOMContentLoaded', function () {
  const ctx = document.getElementById('chartTotalSalesByBorough').getContext('2d');
  const monthSelect = document.getElementById('monthSelect');

  function fetchJSONFile(path, callback) {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        callback(JSON.parse(xhr.responseText));
      }
    };
    xhr.open('GET', path, true);
    xhr.send();
  }

  function updateChart(selectedMonth) {
    fetchJSONFile('data/borough.json', function (data) {
      const boroughSales = {};

      data.forEach(function (item) {
        const monthYear = item.MONTH_YEAR;
        if (selectedMonth === 'all' || monthYear === selectedMonth) {
          const boroughName = item.BOROUGH_NAME;
          const totalSales = parseFloat(item.TOTAL_SALES);

          if (boroughSales[boroughName]) {
            boroughSales[boroughName] += totalSales;
          } else {
            boroughSales[boroughName] = totalSales;
          }
        }
      });

      const sortedBoroughSales = Object.entries(boroughSales).sort((a, b) => b[1] - a[1]);

      const chartData = {
        labels: sortedBoroughSales.map(item => item[0]),
        datasets: [
          {
            label: 'Total Sales',
            borderColor: '#0e0e70',
            backgroundColor: '#0e0e70',
            borderWidth: 1,
            data: sortedBoroughSales.map(item => item[1]),
          },
        ],
      };

      const options = {
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
            beginAtZero: true,
            title: {
              display: true,
              text: 'Borough'
            }
          },
        },
        plugins: {
          legend: {
            display: false
          }
        }
      };

      if (window.myChart instanceof Chart) {
        window.myChart.destroy();
      }

      window.myChart = new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: options,
      });
    });
  }

  monthSelect.addEventListener('change', function () {
    const selectedMonth = monthSelect.value;
    updateChart(selectedMonth);
  });

  updateChart('all');
});



/*--------- sales trend--------*/


fetch('data/tren.json')
  .then(response => response.json())
  .then(data => {
    const originalData = data;
    const processedData = processData(data);
    populateFilterOptions(data);

    // Buat grafik
    const ctx = document.getElementById('lineChartSalesTrend').getContext('2d');
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: processedData.labels,
        datasets: [{
          label: 'Total Sales',
          data: processedData.totalSales,
          borderColor: '#3e95cd',
          fill: false
        }]
      },
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


    document.getElementById('buildingClassFilter').addEventListener('change', function () {
      const selectedCategory = this.value;
      const filteredData = processData(originalData, selectedCategory);
      updateChart(chart, filteredData);
    });
  });

function processData(data, filterCategory = 'all') {
  const labels = [];
  const monthlySales = {};


  data.forEach(item => {
    if (filterCategory === 'all' || item.BUILDING_CLASS_CATEGORY === filterCategory) {
      const label = item.MONTH_YEAR;
      if (!labels.includes(label)) {
        labels.push(label);
        monthlySales[label] = 0;
      }

      monthlySales[label] += parseFloat(item.TOTAL_SALES);
    }
  });

  // Convert 
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const formattedLabels = labels.map(label => {
    const [year, month] = label.split("-");
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  });

  // Buat array total penjualan per bulan
  const totalSales = labels.map(label => monthlySales[label]);

  return { labels: formattedLabels, totalSales };
}

function populateFilterOptions(data) {
  const categories = new Set(data.map(item => item.BUILDING_CLASS_CATEGORY));
  const filterSelect = document.getElementById('buildingClassFilter');

  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.text = category;
    filterSelect.appendChild(option);
  });
}

function updateChart(chart, data) {
  chart.data.labels = data.labels;
  chart.data.datasets[0].data = data.totalSales;
  chart.update();
}



/*-------pie chart-----*/
document.addEventListener('DOMContentLoaded', function () {
  const ctx = document.getElementById('PieChartTop5').getContext('2d');
  const monthSelect = document.getElementById('monthSelect');
  let chart;
  let allData;

  function fetchJSONFile(path, callback) {
    fetch(path)
      .then((response) => response.json())
      .then((data) => callback(data))
      .catch((error) => {
        alert('Error message: ' + error.message + '\nURL: ' + path);
      });
  }

  function updateChart() {
    const selectedMonth = monthSelect.value;
    const salesByCategory = {};

    // Filter and aggregate data 
    allData.forEach(function (item) {
      const monthYear = item.MONTH_YEAR;
      if (selectedMonth === 'all' || monthYear === selectedMonth) {
        const buildingCategory = item.BUILDING_CLASS_CATEGORY;
        const totalSales = parseFloat(item.TOTAL_SALES);

        if (salesByCategory[buildingCategory]) {
          salesByCategory[buildingCategory] += totalSales;
        } else {
          salesByCategory[buildingCategory] = totalSales;
        }
      }
    });

    const top5Categories = Object.entries(salesByCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const labels = top5Categories.map((item) => item[0]);
    const sales = top5Categories.map((item) => item[1]);

    const chartData = {
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

    const options = {
      responsive: true,
      layout: {
        padding: {
          top: 20,
        }
      },
      plugins: {
        legend: {
          position: 'bottom',
        },
      },
    };

    if (chart) {
      chart.destroy();
    }

    chart = new Chart(ctx, {
      type: 'doughnut',
      data: chartData,
      options: options,
    });
  }

  fetchJSONFile('data/piechart.json', function (data) {
    allData = data;
    updateChart();
  });

  monthSelect.addEventListener('change', updateChart);
});
