/**
 * NHAFLOWER - Charts & Reports JavaScript
 * Biểu đồ và báo cáo cho admin panel
 */

// Chart instances
let revenueChart, categoryChart, topProductsChart, orderStatusChart;

// Chart colors matching NHAFLOWER theme
const colors = {
    primary: '#e91e63',
    primaryLight: '#f48fb1',
    primaryDark: '#ad1457',
    success: '#4caf50',
    warning: '#ff9800',
    info: '#2196f3',
    danger: '#f44336',
    secondary: '#6c757d'
};

// Chart data
let chartData = {
    revenue: [],
    categories: [],
    topProducts: [],
    orderStatus: []
};

// Advanced configuration
const config = {
    maxRetries: 3,
    retryDelay: 1000,
    autoRefresh: false,
    refreshInterval: 30000, // 30 seconds
    debug: false
};

// Global state
let refreshTimer = null;
let apiCallQueue = [];
let isLoading = false;

// Document ready
$(document).ready(function() {
    // Wait for Chart.js to be available
    waitForChartJS(() => {
        // Enhanced initialization
        enhancedInit();
        
        initializeCharts();
        loadStatistics();
        loadChartDataEnhanced(); // Use enhanced version
        bindEvents();
        
        // Set default date range (last 30 days)
        setDefaultDateRange();
        
        console.log('NHAFLOWER Charts System Initialized');
    });
});

/**
 * Wait for Chart.js to be available
 */
function waitForChartJS(callback) {
    if (typeof Chart !== 'undefined') {
        callback();
    } else {
        console.log('Waiting for Chart.js to load...');
        setTimeout(() => waitForChartJS(callback), 100);
    }
}

/**
 * Set default date range
 */
function setDefaultDateRange() {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    $('#dateTo').val(formatDate(today));
    $('#dateFrom').val(formatDate(thirtyDaysAgo));
}

/**
 * Format date for input
 */
function formatDate(date) {
    return date.toISOString().split('T')[0];
}

/**
 * Bind event handlers
 */
function bindEvents() {
    // Date range change
    $('#dateFrom, #dateTo, #reportType').on('change', function() {
        updateCharts();
    });
    
    // Export buttons
    $('#exportExcel').on('click', function() {
        exportReport('excel');
    });
    
    $('#exportPDF').on('click', function() {
        exportReport('pdf');
    });
}

/**
 * Initialize all charts
 */
function initializeCharts() {
    try {
        if (typeof Chart === 'undefined') {
            console.error('Chart.js is not loaded');
            return;
        }
        
        initRevenueChart();
        initCategoryChart();
        initTopProductsChart();
        initOrderStatusChart();
    } catch (error) {
        console.error('Error initializing charts:', error);
    }
}

/**
 * Initialize revenue chart
 */
function initRevenueChart() {
    try {
        const canvas = document.getElementById('revenueChart');
        if (!canvas) {
            console.warn('Revenue chart canvas not found');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        
        revenueChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Doanh thu (₫)',
                    data: [],
                    backgroundColor: colors.primary + '20',
                    borderColor: colors.primary,
                    borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: colors.primary,
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                title: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        color: '#e3e6f0'
                    },
                    ticks: {
                        color: '#858796'
                    }
                },
                y: {
                    grid: {
                        color: '#e3e6f0'
                    },
                    ticks: {
                        color: '#858796',
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: colors.primary,
                    borderWidth: 1,                    callbacks: {
                        label: function(context) {
                            return 'Doanh thu: ' + formatCurrency(context.parsed.y);
                        }
                    }
                }
            }
        }
    });
    } catch (error) {
        console.error('Error initializing revenue chart:', error);
    }
}

/**
 * Initialize category pie chart
 */
function initCategoryChart() {
    try {
        const canvas = document.getElementById('categoryChart');
        if (!canvas) {
            console.warn('Category chart canvas not found');
            return;
        }
        
        const ctx = canvas.getContext('2d');
    
    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    colors.primary,
                    colors.success,
                    colors.warning,
                    colors.info,
                    colors.danger,
                    colors.secondary
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                }        },
            cutout: '50%'
        }
    });
    } catch (error) {
        console.error('Error initializing category chart:', error);
    }
}

/**
 * Initialize top products bar chart
 */
function initTopProductsChart() {
    try {
        const canvas = document.getElementById('topProductsChart');
        if (!canvas) {
            console.warn('Top products chart canvas not found');
            return;
        }
        
        const ctx = canvas.getContext('2d');
    
        topProductsChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Số lượng bán',
                    data: [],
                    backgroundColor: colors.primary,
                    borderColor: colors.primaryDark,
                    borderWidth: 1,
                    borderRadius: 4,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#858796'
                        }
                    },
                    y: {
                        grid: {
                            color: '#e3e6f0'
                        },
                        ticks: {
                            color: '#858796',
                            beginAtZero: true
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error initializing top products chart:', error);
        showError('Không thể khởi tạo biểu đồ sản phẩm bán chạy');
    }
}

/**
 * Initialize order status chart
 */
function initOrderStatusChart() {
    const ctx = document.getElementById('orderStatusChart').getContext('2d');
    
    orderStatusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Chờ xác nhận', 'Đang giao', 'Hoàn thành'],
            datasets: [{
                data: [],
                backgroundColor: [
                    colors.warning,
                    colors.info,
                    colors.success
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                }
            },
            cutout: '60%'
        }
    });
}

/**
 * Load statistics data
 */
function loadStatistics() {
    showLoading(true);
    
    $.ajax({
        url: '../api/api_thongke.php',
        type: 'GET',
        dataType: 'json',
        data: {
            action: 'overview',
            date_from: $('#dateFrom').val(),
            date_to: $('#dateTo').val()
        },
        success: function(response) {
            if (response.success) {
                updateStatisticsCards(response.data);
            } else {
                showError('Lỗi tải thống kê: ' + response.message);
            }
        },
        error: function(xhr, status, error) {
            console.error('Error loading statistics:', error);
            showError('Không thể tải dữ liệu thống kê');
        },
        complete: function() {
            showLoading(false);
        }
    });
}

/**
 * Update statistics cards
 */
function updateStatisticsCards(data) {
    $('#monthlyRevenue').text(formatCurrency(data.monthly_revenue || 0));
    $('#totalOrders').text(data.total_orders || 0);
    $('#totalProducts').text(data.total_products || 0);
    $('#totalCustomers').text(data.total_customers || 0);
    
    // Update performance metrics
    $('#conversionRate').text((data.conversion_rate || 0) + '%');
    $('#avgOrderValue').text(formatCurrency(data.avg_order_value || 0));
    $('#customerRetention').text((data.customer_retention || 0) + '%');
    $('#inventoryTurnover').text((data.inventory_turnover || 0) + 'x');
    
    // Update progress bar
    const productProgress = Math.min(100, (data.total_products || 0) / 100 * 100);
    $('#productProgress').css('width', productProgress + '%').attr('aria-valuenow', productProgress);
}

/**
 * Load chart data
 */
function loadChartData() {
    const dateFrom = $('#dateFrom').val();
    const dateTo = $('#dateTo').val();
    
    // Load revenue data
    loadRevenueData(dateFrom, dateTo);
    
    // Load category data
    loadCategoryData();
    
    // Load top products data
    loadTopProductsData(dateFrom, dateTo);
    
    // Load order status data
    loadOrderStatusData(dateFrom, dateTo);
    
    // Load detailed reports
    loadRevenueReport(dateFrom, dateTo);
    loadTopCustomers();
}

/**
 * Load revenue chart data
 */
function loadRevenueData(dateFrom, dateTo) {
    $.ajax({
        url: '../api/api_thongke.php',
        type: 'GET',
        dataType: 'json',
        data: {
            action: 'revenue_chart',
            date_from: dateFrom,
            date_to: dateTo
        },
        success: function(response) {
            if (response.success && response.data) {
                const labels = response.data.map(item => formatDateLabel(item.date));
                const data = response.data.map(item => parseFloat(item.revenue));
                
                revenueChart.data.labels = labels;
                revenueChart.data.datasets[0].data = data;
                revenueChart.update();
            }
        },
        error: function(xhr, status, error) {
            console.error('Error loading revenue data:', error);
        }
    });
}

/**
 * Load category chart data
 */
function loadCategoryData() {
    $.ajax({
        url: '../api/api_thongke.php',
        type: 'GET',
        dataType: 'json',
        data: {
            action: 'category_stats'
        },
        success: function(response) {
            if (response.success && response.data) {
                const labels = response.data.map(item => item.category_name);
                const data = response.data.map(item => parseInt(item.product_count));
                
                categoryChart.data.labels = labels;
                categoryChart.data.datasets[0].data = data;
                categoryChart.update();
            }
        },
        error: function(xhr, status, error) {
            console.error('Error loading category data:', error);
        }
    });
}

/**
 * Load top products data
 */
function loadTopProductsData(dateFrom, dateTo) {
    $.ajax({
        url: '../api/api_thongke.php',
        type: 'GET',
        dataType: 'json',
        data: {
            action: 'top_products',
            date_from: dateFrom,
            date_to: dateTo,
            limit: 5
        },
        success: function(response) {
            if (response.success && response.data) {
                const labels = response.data.map(item => item.product_name);
                const data = response.data.map(item => parseInt(item.quantity_sold));
                
                topProductsChart.data.labels = labels;
                topProductsChart.data.datasets[0].data = data;
                topProductsChart.update();
            }
        },
        error: function(xhr, status, error) {
            console.error('Error loading top products data:', error);
        }
    });
}

/**
 * Load order status data
 */
function loadOrderStatusData(dateFrom, dateTo) {
    $.ajax({
        url: '../api/api_thongke.php',
        type: 'GET',
        dataType: 'json',
        data: {
            action: 'order_status_stats',
            date_from: dateFrom,
            date_to: dateTo
        },
        success: function(response) {
            if (response.success && response.data) {
                const data = [
                    response.data.pending || 0,
                    response.data.shipping || 0,
                    response.data.completed || 0
                ];
                
                orderStatusChart.data.datasets[0].data = data;
                orderStatusChart.update();
            }
        },
        error: function(xhr, status, error) {
            console.error('Error loading order status data:', error);
        }
    });
}

/**
 * Load revenue report table
 */
function loadRevenueReport(dateFrom, dateTo) {
    $.ajax({
        url: '../api/api_thongke.php',
        type: 'GET',
        dataType: 'json',
        data: {
            action: 'revenue_report',
            date_from: dateFrom,
            date_to: dateTo
        },
        success: function(response) {
            if (response.success && response.data) {
                displayRevenueReport(response.data);
            } else {
                $('#revenueReportTableBody').html(`
                    <tr>
                        <td colspan="5" class="text-center text-muted">
                            Không có dữ liệu trong khoảng thời gian đã chọn
                        </td>
                    </tr>
                `);
            }
        },
        error: function(xhr, status, error) {
            console.error('Error loading revenue report:', error);
            $('#revenueReportTableBody').html(`
                <tr>
                    <td colspan="5" class="text-center text-danger">
                        Lỗi tải dữ liệu báo cáo
                    </td>
                </tr>
            `);
        }
    });
}

/**
 * Display revenue report in table
 */
function displayRevenueReport(data) {
    let html = '';
    
    data.forEach(function(item) {
        html += `
            <tr>
                <td>${formatDateLabel(item.date)}</td>
                <td>${item.order_count || 0}</td>
                <td>${formatCurrency(item.revenue || 0)}</td>
                <td>${formatCurrency(item.profit || 0)}</td>
                <td>${(item.conversion_rate || 0)}%</td>
            </tr>
        `;
    });
    
    if (html === '') {
        html = `
            <tr>
                <td colspan="5" class="text-center text-muted">
                    Không có dữ liệu trong khoảng thời gian đã chọn
                </td>
            </tr>
        `;
    }
    
    $('#revenueReportTableBody').html(html);
}

/**
 * Load top customers
 */
function loadTopCustomers() {
    $.ajax({
        url: '../api/api_thongke.php',
        type: 'GET',
        dataType: 'json',
        data: {
            action: 'top_customers',
            limit: 5
        },
        success: function(response) {
            if (response.success && response.data) {
                displayTopCustomers(response.data);
            }
        },
        error: function(xhr, status, error) {
            console.error('Error loading top customers:', error);
            $('#topCustomersList').html(`
                <div class="text-center text-danger">
                    Lỗi tải dữ liệu khách hàng
                </div>
            `);
        }
    });
}

/**
 * Display top customers
 */
function displayTopCustomers(data) {
    let html = '';
    
    data.forEach(function(customer, index) {
        const badge = index === 0 ? 'primary' : index === 1 ? 'success' : 'info';
        const icon = index === 0 ? 'crown' : index === 1 ? 'medal' : 'award';
        
        html += `
            <div class="d-flex align-items-center mb-3">
                <div class="mr-3">
                    <div class="icon-circle bg-${badge}">
                        <i class="fas fa-${icon} text-white"></i>
                    </div>
                </div>
                <div class="flex-grow-1">
                    <div class="small text-gray-500">#${index + 1}</div>
                    <div class="font-weight-bold">${customer.customer_name}</div>
                    <div class="text-xs text-gray-500">
                        ${customer.order_count} đơn hàng - ${formatCurrency(customer.total_spent)}
                    </div>
                </div>
            </div>
        `;
    });
    
    if (html === '') {
        html = '<div class="text-center text-muted">Không có dữ liệu khách hàng</div>';
    }
    
    $('#topCustomersList').html(html);
}

/**
 * Enhanced error handling with retry mechanism
 */
function makeApiCall(options, retryCount = 0) {
    const defaultOptions = {
        type: 'GET',
        dataType: 'json',
        timeout: 10000,
        beforeSend: function() {
            if (!isLoading) {
                showLoading(true);
                isLoading = true;
            }
        }
    };

    const finalOptions = $.extend({}, defaultOptions, options);

    return $.ajax(finalOptions)
        .done(function(response) {
            if (config.debug) {
                console.log('API Success:', finalOptions.url, response);
            }
        })
        .fail(function(xhr, status, error) {
            if (config.debug) {
                console.error('API Error:', finalOptions.url, xhr.status, error);
            }

            // Retry logic
            if (retryCount < config.maxRetries && xhr.status !== 404) {
                setTimeout(function() {
                    makeApiCall(options, retryCount + 1);
                }, config.retryDelay * (retryCount + 1));
                return;
            }

            // Handle specific error types
            let errorMessage = 'Không thể tải dữ liệu';
            switch (xhr.status) {
                case 0:
                    errorMessage = 'Không thể kết nối đến server';
                    break;
                case 404:
                    errorMessage = 'API không tồn tại';
                    break;
                case 500:
                    errorMessage = 'Lỗi server nội bộ';
                    break;
                case 502:
                case 503:
                    errorMessage = 'Server tạm thời không khả dụng';
                    break;
            }

            if (finalOptions.error) {
                finalOptions.error(xhr, status, errorMessage);
            }
        })
        .always(function() {
            // Check if all API calls are complete
            setTimeout(function() {
                if (apiCallQueue.length === 0) {
                    showLoading(false);
                    isLoading = false;
                }
            }, 100);
        });
}

/**
 * Enhanced chart data loading with error handling
 */
function loadChartDataEnhanced() {
    const dateFrom = $('#dateFrom').val();
    const dateTo = $('#dateTo').val();

    // Clear previous API call queue
    apiCallQueue = [];

    // Add all API calls to queue
    const apiCalls = [
        { name: 'revenue', url: '../api/api_thongke.php', data: { action: 'revenue_chart', date_from: dateFrom, date_to: dateTo } },
        { name: 'category', url: '../api/api_thongke.php', data: { action: 'category_stats' } },
        { name: 'topProducts', url: '../api/api_thongke.php', data: { action: 'top_products', date_from: dateFrom, date_to: dateTo, limit: 5 } },
        { name: 'orderStatus', url: '../api/api_thongke.php', data: { action: 'order_status_stats', date_from: dateFrom, date_to: dateTo } },
        { name: 'revenueReport', url: '../api/api_thongke.php', data: { action: 'revenue_report', date_from: dateFrom, date_to: dateTo } },
        { name: 'topCustomers', url: '../api/api_thongke.php', data: { action: 'top_customers', limit: 5 } }
    ];

    apiCallQueue = [...apiCalls];

    // Execute API calls
    apiCalls.forEach(function(call) {
        makeApiCall({
            url: call.url,
            data: call.data,
            success: function(response) {
                handleApiResponse(call.name, response);
                // Remove from queue
                apiCallQueue = apiCallQueue.filter(item => item.name !== call.name);
            },
            error: function(xhr, status, error) {
                handleApiError(call.name, error);
                // Remove from queue
                apiCallQueue = apiCallQueue.filter(item => item.name !== call.name);
            }
        });
    });
}

/**
 * Handle API responses
 */
function handleApiResponse(type, response) {
    if (!response.success) {
        handleApiError(type, response.message || 'API returned error');
        return;
    }

    try {
        switch (type) {
            case 'revenue':
                updateRevenueChart(response.data);
                break;
            case 'category':
                updateCategoryChart(response.data);
                break;
            case 'topProducts':
                updateTopProductsChart(response.data);
                break;
            case 'orderStatus':
                updateOrderStatusChart(response.data);
                break;
            case 'revenueReport':
                displayRevenueReport(response.data);
                break;
            case 'topCustomers':
                displayTopCustomers(response.data);
                break;
        }
    } catch (error) {
        console.error('Error processing ' + type + ' data:', error);
        handleApiError(type, 'Lỗi xử lý dữ liệu');
    }
}

/**
 * Handle API errors
 */
function handleApiError(type, error) {
    const errorMessages = {
        revenue: 'Lỗi tải dữ liệu doanh thu',
        category: 'Lỗi tải dữ liệu danh mục',
        topProducts: 'Lỗi tải dữ liệu sản phẩm bán chạy',
        orderStatus: 'Lỗi tải dữ liệu trạng thái đơn hàng',
        revenueReport: 'Lỗi tải báo cáo doanh thu',
        topCustomers: 'Lỗi tải dữ liệu khách hàng'
    };

    const message = errorMessages[type] || 'Lỗi tải dữ liệu';
    
    // Display error in chart containers
    switch (type) {
        case 'revenue':
            showChartError('revenueChart', message);
            break;
        case 'category':
            showChartError('categoryChart', message);
            break;
        case 'topProducts':
            showChartError('topProductsChart', message);
            break;
        case 'orderStatus':
            showChartError('orderStatusChart', message);
            break;
        case 'revenueReport':
            $('#revenueReportTableBody').html(`
                <tr>
                    <td colspan="5" class="text-center text-danger">
                        <i class="fas fa-exclamation-triangle mr-2"></i>${message}
                    </td>
                </tr>
            `);
            break;
        case 'topCustomers':
            $('#topCustomersList').html(`
                <div class="text-center text-danger">
                    <i class="fas fa-exclamation-triangle mr-2"></i>${message}
                </div>
            `);
            break;
    }

    if (config.debug) {
        console.error(type + ' error:', error);
    }
}

/**
 * Show error in chart container
 */
function showChartError(canvasId, message) {
    const container = $('#' + canvasId).parent();
    container.html(`
        <div class="d-flex align-items-center justify-content-center h-100 text-danger">
            <div class="text-center">
                <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
                <p class="mb-0">${message}</p>
                <button class="btn btn-outline-danger btn-sm mt-2" onclick="retryLoadData()">
                    <i class="fas fa-redo mr-1"></i>Thử lại
                </button>
            </div>
        </div>
    `);
}

/**
 * Retry loading data
 */
function retryLoadData() {
    // Reinitialize charts
    setTimeout(function() {
        location.reload();
    }, 500);
}

/**
 * Update chart functions with animation
 */
function updateRevenueChart(data) {
    if (!revenueChart || !data) return;

    const labels = data.map(item => formatDateLabel(item.date));
    const chartData = data.map(item => parseFloat(item.revenue) || 0);

    revenueChart.data.labels = labels;
    revenueChart.data.datasets[0].data = chartData;
    revenueChart.update('active');

    // Update summary
    const total = chartData.reduce((sum, val) => sum + val, 0);
    $('#totalRevenueSummary').text(formatCurrency(total));
}

function updateCategoryChart(data) {
    if (!categoryChart || !data) return;

    const labels = data.map(item => item.category_name);
    const chartData = data.map(item => parseInt(item.product_count) || 0);

    categoryChart.data.labels = labels;
    categoryChart.data.datasets[0].data = chartData;
    categoryChart.update('active');
}

function updateTopProductsChart(data) {
    if (!topProductsChart || !data) return;

    const labels = data.map(item => item.product_name);
    const chartData = data.map(item => parseInt(item.quantity_sold) || 0);

    topProductsChart.data.labels = labels;
    topProductsChart.data.datasets[0].data = chartData;
    topProductsChart.update('active');
}

function updateOrderStatusChart(data) {
    if (!orderStatusChart || !data) return;

    const chartData = [
        data.pending || 0,
        data.shipping || 0,
        data.completed || 0
    ];

    orderStatusChart.data.datasets[0].data = chartData;
    orderStatusChart.update('active');
}

/**
 * Auto refresh functionality
 */
function toggleAutoRefresh() {
    config.autoRefresh = !config.autoRefresh;
    
    if (config.autoRefresh) {
        startAutoRefresh();
        $('#autoRefreshBtn').addClass('btn-success').removeClass('btn-outline-secondary');
        $('#autoRefreshBtn').html('<i class="fas fa-sync-alt fa-spin mr-1"></i>Tự động làm mới');
        showSuccess('Đã bật tự động làm mới dữ liệu');
    } else {
        stopAutoRefresh();
        $('#autoRefreshBtn').addClass('btn-outline-secondary').removeClass('btn-success');
        $('#autoRefreshBtn').html('<i class="fas fa-sync-alt mr-1"></i>Tự động làm mới');
        showSuccess('Đã tắt tự động làm mới dữ liệu');
    }
}

function startAutoRefresh() {
    if (refreshTimer) {
        clearInterval(refreshTimer);
    }
    
    refreshTimer = setInterval(function() {
        loadChartDataEnhanced();
        loadStatistics();
        
        // Show refresh indicator
        const indicator = $('#refreshIndicator');
        indicator.fadeIn(200).delay(1000).fadeOut(200);
        
    }, config.refreshInterval);
}

function stopAutoRefresh() {
    if (refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = null;
    }
}

/**
 * Enhanced update charts function
 */
function updateCharts() {
    // Show update indicator
    $('#updateIndicator').show();
    
    // Load all data
    loadStatistics();
    loadChartDataEnhanced();
    
    // Hide indicator after delay
    setTimeout(function() {
        $('#updateIndicator').hide();
    }, 2000);
}

/**
 * Export report
 */
function exportReport(format) {
    const dateFrom = $('#dateFrom').val();
    const dateTo = $('#dateTo').val();
    const reportType = $('#reportType').val();
    
    Swal.fire({
        title: 'Đang xuất báo cáo...',
        text: 'Vui lòng đợi trong giây lát',
        icon: 'info',
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
            Swal.showLoading();
        }
    });
    
    // Create form and submit
    const form = $('<form>', {
        action: `../api/export_report.php`,
        method: 'POST',
        target: '_blank'
    });
    
    form.append($('<input>', { type: 'hidden', name: 'format', value: format }));
    form.append($('<input>', { type: 'hidden', name: 'report_type', value: reportType }));
    form.append($('<input>', { type: 'hidden', name: 'date_from', value: dateFrom }));
    form.append($('<input>', { type: 'hidden', name: 'date_to', value: dateTo }));
    
    $('body').append(form);
    form.submit();
    form.remove();
    
    setTimeout(() => {
        Swal.close();
        showSuccess('Báo cáo đã được xuất thành công!');
    }, 2000);
}

/**
 * Print report
 */
function printReport() {
    window.print();
}

// Utility Functions

/**
 * Format currency
 */
function formatCurrency(amount) {
    if (!amount) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

/**
 * Format date label for charts
 */
function formatDateLabel(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Show loading state
 */
function showLoading(show) {
    if (show) {
        $('#loadingSpinner').addClass('show');
    } else {
        $('#loadingSpinner').removeClass('show');
    }
}

/**
 * Show success message
 */
function showSuccess(message) {
    Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: message,
        timer: 2000,
        showConfirmButton: false
    });
}

/**
 * Show error message
 */
function showError(message) {
    Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: message,
        confirmButtonColor: colors.primary
    });
}

/**
 * Settings functions
 */

/**
 * Save user settings
 */
function saveSettings() {
    const settings = {
        refreshInterval: $('#refreshInterval').val(),
        maxRetries: $('#maxRetries').val(),
        debug: $('#debugMode').is(':checked'),
        smoothAnimations: $('#smoothAnimations').is(':checked'),
        chartTheme: $('input[name="chartTheme"]:checked').val(),
        showDataLabels: $('#showDataLabels').is(':checked'),
        showGridLines: $('#showGridLines').is(':checked')
    };

    // Update global config
    config.refreshInterval = parseInt(settings.refreshInterval);
    config.maxRetries = parseInt(settings.maxRetries);
    config.debug = settings.debug;

    // Save to localStorage
    localStorage.setItem('nhaflower_charts_settings', JSON.stringify(settings));

    // Close modal
    $('#settingsModal').modal('hide');

    // Show success message
    showSuccess('Cài đặt đã được lưu thành công!');

    // Apply settings
    applySettings(settings);
}

/**
 * Reset settings to default
 */
function resetSettings() {
    // Clear localStorage
    localStorage.removeItem('nhaflower_charts_settings');

    // Reset form
    $('#refreshInterval').val('30000');
    $('#maxRetries').val('3');
    $('#debugMode').prop('checked', false);
    $('#smoothAnimations').prop('checked', true);
    $('input[name="chartTheme"][value="default"]').prop('checked', true);
    $('#showDataLabels').prop('checked', false);
    $('#showGridLines').prop('checked', true);

    // Reset global config
    config.refreshInterval = 30000;
    config.maxRetries = 3;
    config.debug = false;

    showSuccess('Cài đặt đã được khôi phục về mặc định!');
}

/**
 * Load saved settings
 */
function loadSettings() {
    const savedSettings = localStorage.getItem('nhaflower_charts_settings');
    
    if (savedSettings) {
        try {
            const settings = JSON.parse(savedSettings);
            
            // Apply to form
            $('#refreshInterval').val(settings.refreshInterval || '30000');
            $('#maxRetries').val(settings.maxRetries || '3');
            $('#debugMode').prop('checked', settings.debug || false);
            $('#smoothAnimations').prop('checked', settings.smoothAnimations !== false);
            $(`input[name="chartTheme"][value="${settings.chartTheme || 'default'}"]`).prop('checked', true);
            $('#showDataLabels').prop('checked', settings.showDataLabels || false);
            $('#showGridLines').prop('checked', settings.showGridLines !== false);

            // Apply to config
            config.refreshInterval = parseInt(settings.refreshInterval) || 30000;
            config.maxRetries = parseInt(settings.maxRetries) || 3;
            config.debug = settings.debug || false;

            // Apply visual settings
            applySettings(settings);
            
        } catch (error) {
            console.error('Error loading settings:', error);
            resetSettings();
        }
    }
}

/**
 * Apply settings to charts and interface
 */
function applySettings(settings) {
    // Apply theme
    if (settings.chartTheme === 'dark') {
        applyDarkTheme();
    } else if (settings.chartTheme === 'light') {
        applyLightTheme();
    } else {
        applyDefaultTheme();
    }

    // Update chart options for animations
    const animationEnabled = settings.smoothAnimations !== false;
    
    if (revenueChart) {
        revenueChart.options.animation = { duration: animationEnabled ? 1000 : 0 };
        revenueChart.options.plugins.tooltip.enabled = true;
        revenueChart.update();
    }

    // Apply grid lines setting
    if (revenueChart && settings.showGridLines !== undefined) {
        revenueChart.options.scales.x.grid.display = settings.showGridLines;
        revenueChart.options.scales.y.grid.display = settings.showGridLines;
        revenueChart.update();
    }

    if (topProductsChart && settings.showGridLines !== undefined) {
        topProductsChart.options.scales.x.grid.display = settings.showGridLines;
        topProductsChart.options.scales.y.grid.display = settings.showGridLines;
        topProductsChart.update();
    }

    // Restart auto refresh if enabled with new interval
    if (config.autoRefresh) {
        stopAutoRefresh();
        startAutoRefresh();
    }
}

/**
 * Theme functions
 */
function applyDefaultTheme() {
    // NHAFLOWER pink theme - already applied
    document.documentElement.style.setProperty('--primary-color', '#e91e63');
}

function applyDarkTheme() {
    // Dark theme colors
    document.documentElement.style.setProperty('--primary-color', '#bb86fc');
    
    // Update chart colors if needed
    const darkColors = {
        primary: '#bb86fc',
        success: '#03dac6',
        warning: '#cf6679',
        background: '#121212',
        surface: '#1e1e1e'
    };
    
    // You could update all chart background colors here
}

function applyLightTheme() {
    // Light theme colors
    document.documentElement.style.setProperty('--primary-color', '#6200ea');
    
    const lightColors = {
        primary: '#6200ea',
        success: '#00c853',
        warning: '#ff8f00'
    };
}

/**
 * Performance monitoring
 */
function monitorPerformance() {
    const performanceData = {
        apiCalls: 0,
        totalLoadTime: 0,
        errors: 0,
        lastUpdate: new Date().toISOString()
    };

    // Track API calls
    const originalAjax = $.ajax;
    $.ajax = function(options) {
        performanceData.apiCalls++;
        const startTime = performance.now();
        
        const originalSuccess = options.success || function(){};
        const originalError = options.error || function(){};
        
        options.success = function(data) {
            performanceData.totalLoadTime += performance.now() - startTime;
            originalSuccess.apply(this, arguments);
        };
        
        options.error = function() {
            performanceData.errors++;
            originalError.apply(this, arguments);
        };
        
        return originalAjax.apply(this, arguments);
    };

    // Save performance data every minute
    setInterval(function() {
        localStorage.setItem('nhaflower_performance', JSON.stringify(performanceData));
    }, 60000);
}

/**
 * Keyboard shortcuts
 */
function initKeyboardShortcuts() {
    $(document).keydown(function(e) {
        // Ctrl/Cmd + R: Refresh data
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            updateCharts();
            return false;
        }
        
        // Ctrl/Cmd + S: Save settings (when modal is open)
        if ((e.ctrlKey || e.metaKey) && e.key === 's' && $('#settingsModal').hasClass('show')) {
            e.preventDefault();
            saveSettings();
            return false;
        }
        
        // Esc: Close any open modals
        if (e.key === 'Escape') {
            $('.modal').modal('hide');
        }
        
        // F1: Toggle auto refresh
        if (e.key === 'F1') {
            e.preventDefault();
            toggleAutoRefresh();
            return false;
        }
    });
}

/**
 * Enhanced initialization
 */
function enhancedInit() {
    // Load saved settings
    loadSettings();
    
    // Initialize performance monitoring
    if (config.debug) {
        monitorPerformance();
    }
    
    // Initialize keyboard shortcuts
    initKeyboardShortcuts();
    
    // Add connection status monitoring
    window.addEventListener('online', function() {
        $('#connectionWarning').hide();
        showSuccess('Kết nối internet đã được khôi phục');
    });
    
    window.addEventListener('offline', function() {
        $('#connectionWarning').show();
        showError('Mất kết nối internet');
    });
}
