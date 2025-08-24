/**
 * NHAFLOWER - Reports JavaScript
 * Xử lý logic cho giao diện báo cáo chi tiết
 */

// Global variables
let currentReportType = 'overview';
let reportData = {};
let debugMode = false;

// Document ready
$(document).ready(function() {
    initializeReports();
    loadCategories();
    setDefaultDates();
    generateReport();
    checkSystemStatus();
});

/**
 * Initialize reports system
 */
function initializeReports() {
    // Bind events
    $('#reportType').on('change', function() {
        currentReportType = $(this).val();
        showReport(currentReportType);
    });

    $('#dateFrom, #dateTo, #statusFilter, #categoryFilter').on('change', function() {
        if (currentReportType) {
            generateReport();
        }
    });

    console.log('Reports system initialized');
}

/**
 * Set default date range (last 30 days)
 */
function setDefaultDates() {
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
 * Load categories for filter
 */
function loadCategories() {
    $.ajax({
        url: '../api/api_thongke.php',
        type: 'GET',
        data: { action: 'category_stats' },
        success: function(response) {
            if (response.success && response.data) {
                let options = '<option value="">Tất cả danh mục</option>';
                response.data.forEach(function(category) {
                    options += `<option value="${category.category_name}">${category.category_name}</option>`;
                });
                $('#categoryFilter').html(options);
            }
        },
        error: function(xhr, status, error) {
            console.error('Error loading categories:', error);
        }
    });
}

/**
 * Generate report based on current filters
 */
function generateReport() {
    const reportType = $('#reportType').val();
    const dateFrom = $('#dateFrom').val();
    const dateTo = $('#dateTo').val();
    const status = $('#statusFilter').val();
    const category = $('#categoryFilter').val();

    // Validate dates
    if (!dateFrom || !dateTo) {
        showError('Vui lòng chọn khoảng thời gian');
        return;
    }

    if (dateFrom > dateTo) {
        showError('Ngày bắt đầu không thể sau ngày kết thúc');
        return;
    }

    // Show selected report
    showReport(reportType);

    // Generate appropriate report
    switch (reportType) {
        case 'overview':
            generateOverviewReport(dateFrom, dateTo);
            break;
        case 'revenue':
            generateRevenueReport(dateFrom, dateTo);
            break;
        case 'products':
            generateProductsReport(dateFrom, dateTo, category);
            break;
        case 'customers':
            generateCustomersReport(dateFrom, dateTo);
            break;
        case 'orders':
            generateOrdersReport(dateFrom, dateTo, status);
            break;
        case 'inventory':
            generateInventoryReport();
            break;
    }
}

/**
 * Show specific report section
 */
function showReport(reportType) {
    // Hide all reports
    $('.report-card').hide();
    
    // Show selected report
    $(`#${reportType}Report`).show();
    
    // Update current report type
    currentReportType = reportType;
}

/**
 * Generate Overview Report
 */
function generateOverviewReport(dateFrom, dateTo) {
    showLoading('overview');
    
    // Load overview statistics
    $.ajax({
        url: '../api/api_thongke.php',
        type: 'GET',
        data: {
            action: 'overview',
            date_from: dateFrom,
            date_to: dateTo
        },
        success: function(response) {
            if (response.success) {
                displayOverviewReport(response.data, dateFrom, dateTo);
                updateSummaryCards(response.data);
            } else {
                showReportError('overview', response.message);
            }
        },
        error: function(xhr, status, error) {
            showReportError('overview', 'Không thể tải báo cáo tổng quan');
        },
        complete: function() {
            hideLoading('overview');
        }
    });
}

/**
 * Display Overview Report
 */
function displayOverviewReport(data, dateFrom, dateTo) {
    const html = `
        <div class="row">
            <div class="col-md-6">
                <h5>Thông tin chính</h5>
                <table class="table table-borderless">
                    <tr>
                        <td><strong>Khoảng thời gian:</strong></td>
                        <td>${formatDisplayDate(dateFrom)} - ${formatDisplayDate(dateTo)}</td>
                    </tr>
                    <tr>
                        <td><strong>Tổng doanh thu:</strong></td>
                        <td class="text-success font-weight-bold">${formatCurrency(data.monthly_revenue)}</td>
                    </tr>
                    <tr>
                        <td><strong>Tổng đơn hàng:</strong></td>
                        <td class="text-primary font-weight-bold">${data.total_orders}</td>
                    </tr>
                    <tr>
                        <td><strong>Giá trị đơn hàng TB:</strong></td>
                        <td class="text-info font-weight-bold">${formatCurrency(data.avg_order_value)}</td>
                    </tr>
                </table>
            </div>
            <div class="col-md-6">
                <h5>Chỉ số hiệu suất</h5>
                <table class="table table-borderless">
                    <tr>
                        <td><strong>Tỷ lệ chuyển đổi:</strong></td>
                        <td class="text-warning font-weight-bold">${data.conversion_rate}%</td>
                    </tr>
                    <tr>
                        <td><strong>Khách hàng quay lại:</strong></td>
                        <td class="text-info font-weight-bold">${data.customer_retention}%</td>
                    </tr>
                    <tr>
                        <td><strong>Tổng sản phẩm:</strong></td>
                        <td class="text-secondary font-weight-bold">${data.total_products}</td>
                    </tr>
                    <tr>
                        <td><strong>Tổng khách hàng:</strong></td>
                        <td class="text-secondary font-weight-bold">${data.total_customers}</td>
                    </tr>
                </table>
            </div>
        </div>
        
        <hr>
        
        <div class="row">
            <div class="col-md-12">
                <h5>Đánh giá tình hình kinh doanh</h5>
                <div class="alert alert-info">
                    <i class="fas fa-info-circle mr-2"></i>
                    <strong>Nhận xét:</strong> ${generateBusinessInsight(data)}
                </div>
            </div>
        </div>
    `;
    
    $('#overviewContent').html(html);
}

/**
 * Generate Revenue Report
 */
function generateRevenueReport(dateFrom, dateTo) {
    showLoading('revenue');
    
    Promise.all([
        // Revenue chart data
        $.ajax({
            url: '../api/api_thongke.php',
            type: 'GET',
            data: {
                action: 'revenue_chart',
                date_from: dateFrom,
                date_to: dateTo
            }
        }),
        // Revenue report data
        $.ajax({
            url: '../api/api_thongke.php',
            type: 'GET',
            data: {
                action: 'revenue_report',
                date_from: dateFrom,
                date_to: dateTo
            }
        })
    ]).then(function(results) {
        const chartData = results[0];
        const reportData = results[1];
        
        if (chartData.success && reportData.success) {
            displayRevenueReport(chartData.data, reportData.data, dateFrom, dateTo);
        } else {
            showReportError('revenue', 'Không thể tải báo cáo doanh thu');
        }
    }).catch(function(error) {
        showReportError('revenue', 'Lỗi kết nối server');
    }).finally(function() {
        hideLoading('revenue');
    });
}

/**
 * Display Revenue Report
 */
function displayRevenueReport(chartData, reportData, dateFrom, dateTo) {
    // Calculate totals
    const totalRevenue = reportData.reduce((sum, item) => sum + parseFloat(item.revenue || 0), 0);
    const totalOrders = reportData.reduce((sum, item) => sum + parseInt(item.order_count || 0), 0);
    const totalProfit = reportData.reduce((sum, item) => sum + parseFloat(item.profit || 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    let html = `
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="summary-card card h-100 py-2">
                    <div class="card-body">
                        <div class="text-center">
                            <div class="h4 mb-0 font-weight-bold text-success">${formatCurrency(totalRevenue)}</div>
                            <div class="text-xs font-weight-bold text-uppercase text-gray-500">Tổng doanh thu</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="summary-card card h-100 py-2">
                    <div class="card-body">
                        <div class="text-center">
                            <div class="h4 mb-0 font-weight-bold text-primary">${totalOrders}</div>
                            <div class="text-xs font-weight-bold text-uppercase text-gray-500">Tổng đơn hàng</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="summary-card card h-100 py-2">
                    <div class="card-body">
                        <div class="text-center">
                            <div class="h4 mb-0 font-weight-bold text-info">${formatCurrency(avgOrderValue)}</div>
                            <div class="text-xs font-weight-bold text-uppercase text-gray-500">Giá trị TB/đơn</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="summary-card card h-100 py-2">
                    <div class="card-body">
                        <div class="text-center">
                            <div class="h4 mb-0 font-weight-bold text-warning">${formatCurrency(totalProfit)}</div>
                            <div class="text-xs font-weight-bold text-uppercase text-gray-500">Lợi nhuận ước tính</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="table-responsive">
            <table class="table table-bordered report-table" id="revenueTable">
                <thead>
                    <tr>
                        <th>Ngày</th>
                        <th>Đơn hàng</th>
                        <th>Doanh thu</th>
                        <th>Lợi nhuận</th>
                        <th>Tỷ lệ chuyển đổi</th>
                        <th>Tăng trưởng</th>
                    </tr>
                </thead>
                <tbody>
    `;

    reportData.forEach(function(item, index) {
        const growthRate = index > 0 ? 
            calculateGrowthRate(reportData[index-1].revenue, item.revenue) : 0;
        
        html += `
            <tr>
                <td>${formatDisplayDate(item.date)}</td>
                <td class="text-center">${item.order_count || 0}</td>
                <td class="text-right text-success font-weight-bold">${formatCurrency(item.revenue)}</td>
                <td class="text-right text-warning">${formatCurrency(item.profit)}</td>
                <td class="text-center">${item.conversion_rate || 0}%</td>
                <td class="text-center">
                    <span class="badge ${growthRate >= 0 ? 'badge-success' : 'badge-danger'}">
                        ${growthRate >= 0 ? '+' : ''}${growthRate}%
                    </span>
                </td>
            </tr>
        `;
    });

    html += `
                </tbody>
                <tfoot>
                    <tr class="table-active font-weight-bold">
                        <td>TỔNG CỘNG</td>
                        <td class="text-center">${totalOrders}</td>
                        <td class="text-right text-success">${formatCurrency(totalRevenue)}</td>
                        <td class="text-right text-warning">${formatCurrency(totalProfit)}</td>
                        <td class="text-center">-</td>
                        <td class="text-center">-</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    `;

    $('#revenueContent').html(html);
    
    // Initialize DataTable
    $('#revenueTable').DataTable({
        responsive: true,
        pageLength: 25,
        order: [[0, 'desc']],
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/vi.json'
        }
    });
}

/**
 * Generate Products Report
 */
function generateProductsReport(dateFrom, dateTo, category) {
    showLoading('products');
    
    // Load top products and category stats
    Promise.all([
        $.ajax({
            url: '../api/api_thongke.php',
            type: 'GET',
            data: {
                action: 'top_products',
                date_from: dateFrom,
                date_to: dateTo,
                limit: 20
            }
        }),
        $.ajax({
            url: '../api/api_thongke.php',
            type: 'GET',
            data: { action: 'category_stats' }
        })
    ]).then(function(results) {
        const productsData = results[0];
        const categoryData = results[1];
        
        if (productsData.success && categoryData.success) {
            displayProductsReport(productsData.data, categoryData.data, category);
        } else {
            showReportError('products', 'Không thể tải báo cáo sản phẩm');
        }
    }).catch(function(error) {
        showReportError('products', 'Lỗi kết nối server');
    }).finally(function() {
        hideLoading('products');
    });
}

/**
 * Display Products Report
 */
function displayProductsReport(productsData, categoryData, selectedCategory) {
    // Filter by category if selected
    let filteredProducts = productsData;
    if (selectedCategory) {
        filteredProducts = productsData.filter(product => 
            product.category_name === selectedCategory
        );
    }

    const totalQuantitySold = filteredProducts.reduce((sum, item) => 
        sum + parseInt(item.quantity_sold || 0), 0);
    const totalRevenue = filteredProducts.reduce((sum, item) => 
        sum + parseFloat(item.total_revenue || 0), 0);

    let html = `
        <div class="row mb-4">
            <div class="col-md-4">
                <div class="summary-card card h-100 py-2">
                    <div class="card-body">
                        <div class="text-center">
                            <div class="h4 mb-0 font-weight-bold text-primary">${filteredProducts.length}</div>
                            <div class="text-xs font-weight-bold text-uppercase text-gray-500">Sản phẩm có doanh số</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="summary-card card h-100 py-2">
                    <div class="card-body">
                        <div class="text-center">
                            <div class="h4 mb-0 font-weight-bold text-success">${totalQuantitySold}</div>
                            <div class="text-xs font-weight-bold text-uppercase text-gray-500">Tổng số lượng bán</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="summary-card card h-100 py-2">
                    <div class="card-body">
                        <div class="text-center">
                            <div class="h4 mb-0 font-weight-bold text-warning">${formatCurrency(totalRevenue)}</div>
                            <div class="text-xs font-weight-bold text-uppercase text-gray-500">Tổng doanh thu</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-8">
                <h5>Top sản phẩm bán chạy</h5>
                <div class="table-responsive">
                    <table class="table table-bordered report-table" id="productsTable">
                        <thead>
                            <tr>
                                <th>Hạng</th>
                                <th>Tên sản phẩm</th>
                                <th>Số lượng bán</th>
                                <th>Doanh thu</th>
                                <th>% Tổng doanh thu</th>
                            </tr>
                        </thead>
                        <tbody>
    `;

    filteredProducts.forEach(function(product, index) {
        const percentage = totalRevenue > 0 ? 
            ((parseFloat(product.total_revenue) / totalRevenue) * 100).toFixed(1) : 0;
        
        html += `
            <tr>
                <td class="text-center">
                    <span class="badge ${index < 3 ? 'badge-warning' : 'badge-secondary'}">${index + 1}</span>
                </td>
                <td>${product.product_name}</td>
                <td class="text-center font-weight-bold">${product.quantity_sold}</td>
                <td class="text-right font-weight-bold text-success">${formatCurrency(product.total_revenue)}</td>
                <td class="text-center">${percentage}%</td>
            </tr>
        `;
    });

    html += `
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="col-md-4">
                <h5>Phân bố theo danh mục</h5>
                <div class="list-group">
    `;

    categoryData.forEach(function(category) {
        html += `
            <div class="list-group-item d-flex justify-content-between align-items-center">
                ${category.category_name}
                <span class="badge badge-primary badge-pill">${category.product_count}</span>
            </div>
        `;
    });

    html += `
                </div>
            </div>
        </div>
    `;

    $('#productsContent').html(html);
    
    // Initialize DataTable
    $('#productsTable').DataTable({
        responsive: true,
        pageLength: 10,
        order: [[2, 'desc']],
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/vi.json'
        }
    });
}

/**
 * Generate Customers Report
 */
function generateCustomersReport(dateFrom, dateTo) {
    showLoading('customers');
    
    $.ajax({
        url: '../api/api_thongke.php',
        type: 'GET',
        data: {
            action: 'top_customers',
            limit: 50
        },
        success: function(response) {
            if (response.success) {
                displayCustomersReport(response.data);
            } else {
                showReportError('customers', response.message);
            }
        },
        error: function(xhr, status, error) {
            showReportError('customers', 'Không thể tải báo cáo khách hàng');
        },
        complete: function() {
            hideLoading('customers');
        }
    });
}

/**
 * Display Customers Report
 */
function displayCustomersReport(customersData) {
    const totalCustomers = customersData.length;
    const totalSpent = customersData.reduce((sum, customer) => 
        sum + parseFloat(customer.total_spent || 0), 0);
    const avgSpentPerCustomer = totalCustomers > 0 ? totalSpent / totalCustomers : 0;
    const totalOrders = customersData.reduce((sum, customer) => 
        sum + parseInt(customer.order_count || 0), 0);

    let html = `
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="summary-card card h-100 py-2">
                    <div class="card-body">
                        <div class="text-center">
                            <div class="h4 mb-0 font-weight-bold text-primary">${totalCustomers}</div>
                            <div class="text-xs font-weight-bold text-uppercase mb-1">Khách hàng có giao dịch</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="summary-card card h-100 py-2">
                    <div class="card-body">
                        <div class="text-center">
                            <div class="h4 mb-0 font-weight-bold text-success">${formatCurrency(totalSpent)}</div>
                            <div class="text-xs font-weight-bold text-uppercase mb-1">Tổng chi tiêu</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="summary-card card h-100 py-2">
                    <div class="card-body">
                        <div class="text-center">
                            <div class="h4 mb-0 font-weight-bold text-info">${formatCurrency(avgSpentPerCustomer)}</div>
                            <div class="text-xs font-weight-bold text-uppercase mb-1">Chi tiêu TB/KH</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="summary-card card h-100 py-2">
                    <div class="card-body">
                        <div class="text-center">
                            <div class="h4 mb-0 font-weight-bold text-warning">${totalOrders}</div>
                            <div class="text-xs font-weight-bold text-uppercase mb-1">Tổng đơn hàng</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="table-responsive">
            <table class="table table-bordered report-table" id="customersTable">
                <thead>
                    <tr>
                        <th>Hạng</th>
                        <th>Tên khách hàng</th>
                        <th>Số đơn hàng</th>
                        <th>Tổng chi tiêu</th>
                        <th>Chi tiêu TB/đơn</th>
                        <th>Phân loại</th>
                    </tr>
                </thead>
                <tbody>
    `;

    customersData.forEach(function(customer, index) {
        const avgOrderValue = customer.order_count > 0 ? 
            customer.total_spent / customer.order_count : 0;
        
        let customerType = 'Thường';
        let badgeClass = 'badge-secondary';
        
        if (customer.total_spent >= 5000000) {
            customerType = 'VIP';
            badgeClass = 'badge-danger';
        } else if (customer.total_spent >= 2000000) {
            customerType = 'Thân thiết';
            badgeClass = 'badge-warning';
        } else if (customer.total_spent >= 1000000) {
            customerType = 'Tích cực';
            badgeClass = 'badge-info';
        }

        html += `
            <tr>
                <td class="text-center">
                    <span class="badge ${index < 3 ? 'badge-warning' : 'badge-secondary'}">${index + 1}</span>
                </td>
                <td>${customer.customer_name}</td>
                <td class="text-center">${customer.order_count}</td>
                <td class="text-right font-weight-bold text-success">${formatCurrency(customer.total_spent)}</td>
                <td class="text-right">${formatCurrency(avgOrderValue)}</td>
                <td class="text-center">
                    <span class="status-badge ${badgeClass}">${customerType}</span>
                </td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
        </div>
    `;

    $('#customersContent').html(html);
    
    // Initialize DataTable
    $('#customersTable').DataTable({
        responsive: true,
        pageLength: 25,
        order: [[3, 'desc']],
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/vi.json'
        }
    });
}

/**
 * Generate Orders Report
 */
function generateOrdersReport(dateFrom, dateTo, status) {
    showLoading('orders');
    
    // This would typically call a dedicated orders report API
    // For now, we'll use the existing order status stats and simulate detailed data
    $.ajax({
        url: '../api/api_thongke.php',
        type: 'GET',
        data: {
            action: 'order_status_stats',
            date_from: dateFrom,
            date_to: dateTo
        },
        success: function(response) {
            if (response.success) {
                displayOrdersReport(response.data, dateFrom, dateTo);
            } else {
                showReportError('orders', response.message);
            }
        },
        error: function(xhr, status, error) {
            showReportError('orders', 'Không thể tải báo cáo đơn hàng');
        },
        complete: function() {
            hideLoading('orders');
        }
    });
}

/**
 * Display Orders Report
 */
function displayOrdersReport(data, dateFrom, dateTo) {
    const totalOrders = data.pending + data.shipping + data.completed;
    const completionRate = totalOrders > 0 ? 
        ((data.completed / totalOrders) * 100).toFixed(1) : 0;

    let html = `
        <div class="row mb-4">
            <div class="col-md-4">
                <div class="summary-card card h-100 py-2">
                    <div class="card-body">
                        <div class="text-center">
                            <div class="h4 mb-0 font-weight-bold text-primary">${totalOrders}</div>
                            <div class="text-xs font-weight-bold text-uppercase text-gray-500">Tổng đơn hàng</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="summary-card card h-100 py-2">
                    <div class="card-body">
                        <div class="text-center">
                            <div class="h4 mb-0 font-weight-bold text-success">${data.completed}</div>
                            <div class="text-xs font-weight-bold text-uppercase text-gray-500">Đã hoàn thành</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="summary-card card h-100 py-2">
                    <div class="card-body">
                        <div class="text-center">
                            <div class="h4 mb-0 font-weight-bold text-info">${completionRate}%</div>
                            <div class="text-xs font-weight-bold text-uppercase text-gray-500">Tỷ lệ hoàn thành</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h6 class="m-0">Phân bố trạng thái đơn hàng</h6>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <div class="d-flex justify-content-between">
                                <span>Chờ xác nhận</span>
                                <span class="font-weight-bold">${data.pending}</span>
                            </div>
                            <div class="progress mb-2">
                                <div class="progress-bar bg-warning" style="width: ${totalOrders > 0 ? (data.pending / totalOrders * 100) : 0}%"></div>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <div class="d-flex justify-content-between">
                                <span>Đang giao</span>
                                <span class="font-weight-bold">${data.shipping}</span>
                            </div>
                            <div class="progress mb-2">
                                <div class="progress-bar bg-info" style="width: ${totalOrders > 0 ? (data.shipping / totalOrders * 100) : 0}%"></div>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <div class="d-flex justify-content-between">
                                <span>Hoàn thành</span>
                                <span class="font-weight-bold">${data.completed}</span>
                            </div>
                            <div class="progress mb-2">
                                <div class="progress-bar bg-success" style="width: ${totalOrders > 0 ? (data.completed / totalOrders * 100) : 0}%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h6 class="m-0">Phân tích hiệu suất</h6>
                    </div>
                    <div class="card-body">
                        <table class="table table-borderless">
                            <tr>
                                <td><strong>Tỷ lệ hủy đơn:</strong></td>
                                <td class="text-right">
                                    <span class="badge badge-danger">0%</span>
                                </td>
                            </tr>
                            <tr>
                                <td><strong>Thời gian xử lý TB:</strong></td>
                                <td class="text-right">
                                    <span class="badge badge-info">2.5 ngày</span>
                                </td>
                            </tr>
                            <tr>
                                <td><strong>Đơn hàng/ngày TB:</strong></td>
                                <td class="text-right">
                                    <span class="badge badge-primary">${(totalOrders / 30).toFixed(1)}</span>
                                </td>
                            </tr>
                            <tr>
                                <td><strong>Hiệu suất tổng thể:</strong></td>
                                <td class="text-right">
                                    <span class="badge ${completionRate >= 80 ? 'badge-success' : completionRate >= 60 ? 'badge-warning' : 'badge-danger'}">${getPerformanceRating(completionRate)}</span>
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;

    $('#ordersContent').html(html);
}

/**
 * Generate Inventory Report
 */
function generateInventoryReport() {
    showLoading('inventory');
    
    // Simulate inventory data - in real implementation, this would call inventory API
    setTimeout(function() {
        displayInventoryReport();
        hideLoading('inventory');
    }, 1000);
}

/**
 * Display Inventory Report
 */
function displayInventoryReport() {
    // This is simulated data - in real implementation, would come from API
    const inventoryData = [
        { product: 'Hoa hồng đỏ', current_stock: 45, min_stock: 20, max_stock: 100, status: 'normal' },
        { product: 'Hoa cúc vàng', current_stock: 15, min_stock: 20, max_stock: 80, status: 'low' },
        { product: 'Hoa tulip', current_stock: 85, min_stock: 30, max_stock: 100, status: 'high' },
        { product: 'Hoa ly trắng', current_stock: 5, min_stock: 15, max_stock: 60, status: 'critical' },
        { product: 'Hoa lan', current_stock: 25, min_stock: 10, max_stock: 50, status: 'normal' }
    ];

    const lowStockItems = inventoryData.filter(item => item.status === 'low' || item.status === 'critical').length;
    const totalItems = inventoryData.length;
    const totalValue = inventoryData.reduce((sum, item) => sum + (item.current_stock * 50000), 0); // Assume 50k average price

    let html = `
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="summary-card card h-100 py-2">
                    <div class="card-body">
                        <div class="text-center">
                            <div class="h4 mb-0 font-weight-bold text-primary">${totalItems}</div>
                            <div class="text-xs font-weight-bold text-uppercase text-gray-500">Tổng sản phẩm</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="summary-card card h-100 py-2">
                    <div class="card-body">
                        <div class="text-center">
                            <div class="h4 mb-0 font-weight-bold text-danger">${lowStockItems}</div>
                            <div class="text-xs font-weight-bold text-uppercase text-gray-500">Cần nhập thêm</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="summary-card card h-100 py-2">
                    <div class="card-body">
                        <div class="text-center">
                            <div class="h4 mb-0 font-weight-bold text-success">${formatCurrency(totalValue)}</div>
                            <div class="text-xs font-weight-bold text-uppercase text-gray-500">Giá trị tồn kho</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="summary-card card h-100 py-2">
                    <div class="card-body">
                        <div class="text-center">
                            <div class="h4 mb-0 font-weight-bold text-info">2.5</div>
                            <div class="text-xs font-weight-bold text-uppercase text-gray-500">Vòng quay kho</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="table-responsive">
            <table class="table table-bordered report-table" id="inventoryTable">
                <thead>
                    <tr>
                        <th>Sản phẩm</th>
                        <th>Tồn kho hiện tại</th>
                        <th>Tồn kho tối thiểu</th>
                        <th>Tồn kho tối đa</th>
                        <th>Tình trạng</th>
                        <th>Khuyến nghị</th>
                    </tr>
                </thead>
                <tbody>
    `;

    inventoryData.forEach(function(item) {
        let statusBadge, statusText, recommendation;
        
        switch(item.status) {
            case 'critical':
                statusBadge = 'badge-danger';
                statusText = 'Rất thấp';
                recommendation = 'Nhập ngay';
                break;
            case 'low':
                statusBadge = 'badge-warning';
                statusText = 'Thấp';
                recommendation = 'Cần nhập';
                break;
            case 'high':
                statusBadge = 'badge-info';
                statusText = 'Cao';
                recommendation = 'Tạm dừng nhập';
                break;
            default:
                statusBadge = 'badge-success';
                statusText = 'Bình thường';
                recommendation = 'Theo dõi';
        }

        html += `
            <tr>
                <td>${item.product}</td>
                <td class="text-center font-weight-bold">${item.current_stock}</td>
                <td class="text-center">${item.min_stock}</td>
                <td class="text-center">${item.max_stock}</td>
                <td class="text-center">
                    <span class="status-badge ${statusBadge}">${statusText}</span>
                </td>
                <td class="text-center">
                    <span class="badge ${statusBadge}">${recommendation}</span>
                </td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
        </div>
    `;

    $('#inventoryContent').html(html);
    
    // Initialize DataTable
    $('#inventoryTable').DataTable({
        responsive: true,
        pageLength: 25,
        order: [[1, 'asc']],
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/vi.json'
        }
    });
}

/**
 * Update summary cards
 */
function updateSummaryCards(data) {
    const summaryHtml = `
        <div class="col-xl-3 col-md-6 mb-4">
            <div class="summary-card card h-100 py-2">
                <div class="card-body">
                    <div class="row no-gutters align-items-center">
                        <div class="col mr-2">
                            <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">Doanh thu</div>
                            <div class="h5 mb-0 font-weight-bold text-gray-800">${formatCurrency(data.monthly_revenue)}</div>
                        </div>
                        <div class="col-auto">
                            <i class="fas fa-dollar-sign fa-2x text-gray-300"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-xl-3 col-md-6 mb-4">
            <div class="summary-card card h-100 py-2">
                <div class="card-body">
                    <div class="row no-gutters align-items-center">
                        <div class="col mr-2">
                            <div class="text-xs font-weight-bold text-success text-uppercase mb-1">Đơn hàng</div>
                            <div class="h5 mb-0 font-weight-bold text-gray-800">${data.total_orders}</div>
                        </div>
                        <div class="col-auto">
                            <i class="fas fa-shopping-cart fa-2x text-gray-300"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-xl-3 col-md-6 mb-4">
            <div class="summary-card card h-100 py-2">
                <div class="card-body">
                    <div class="row no-gutters align-items-center">
                        <div class="col mr-2">
                            <div class="text-xs font-weight-bold text-info text-uppercase mb-1">Sản phẩm</div>
                            <div class="h5 mb-0 font-weight-bold text-gray-800">${data.total_products}</div>
                        </div>
                        <div class="col-auto">
                            <i class="fas fa-leaf fa-2x text-gray-300"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-xl-3 col-md-6 mb-4">
            <div class="summary-card card h-100 py-2">
                <div class="card-body">
                    <div class="row no-gutters align-items-center">
                        <div class="col mr-2">
                            <div class="text-xs font-weight-bold text-warning text-uppercase mb-1">Khách hàng</div>
                            <div class="h5 mb-0 font-weight-bold text-gray-800">${data.total_customers}</div>
                        </div>
                        <div class="col-auto">
                            <i class="fas fa-users fa-2x text-gray-300"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    $('#summaryCards').html(summaryHtml);
}

/**
 * Show loading state
 */
function showLoading(reportType) {
    $(`#${reportType}Loading`).show();
}

/**
 * Hide loading state
 */
function hideLoading(reportType) {
    $(`#${reportType}Loading`).hide();
}

/**
 * Show report error
 */
function showReportError(reportType, message) {
    $(`#${reportType}Content`).html(`
        <div class="alert alert-danger text-center">
            <i class="fas fa-exclamation-triangle fa-2x mb-2"></i>
            <h5>Không thể tải báo cáo</h5>
            <p>${message}</p>
            <button class="btn btn-outline-danger btn-sm" onclick="generateReport()">
                <i class="fas fa-redo mr-1"></i>Thử lại
            </button>
        </div>
    `);
}

/**
 * System status and debugging functions
 */

function checkSystemStatus() {
    const statusText = $('#systemStatusText');
    const debugList = $('#debugList');
    
    statusText.html('<i class="fas fa-spinner fa-spin"></i> Đang kiểm tra...');
    
    const checks = [
        { name: 'Database Connection', url: '../api/api_thongke.php?action=overview' },
        { name: 'Category Data', url: '../api/api_thongke.php?action=category_stats' },
        { name: 'Revenue Data', url: '../api/api_thongke.php?action=revenue_chart&date_from=2024-01-01&date_to=2024-12-31' }
    ];
    
    let passedChecks = 0;
    let debugInfo = [];
    
    const checkPromises = checks.map(check => {
        return $.ajax({
            url: check.url,
            type: 'GET',
            timeout: 10000
        }).then(
            function(response) {
                passedChecks++;
                debugInfo.push(`✓ ${check.name}: OK`);
                if (response.data) {
                    debugInfo.push(`  └─ Data count: ${Array.isArray(response.data) ? response.data.length : Object.keys(response.data).length}`);
                }
            },
            function(xhr) {
                debugInfo.push(`✗ ${check.name}: ${xhr.status} ${xhr.statusText}`);
                if (xhr.responseText) {
                    debugInfo.push(`  └─ Error: ${xhr.responseText.substring(0, 100)}...`);
                }
            }
        );
    });
    
    Promise.all(checkPromises.map(p => p.catch(e => e))).then(() => {
        // Update status display
        if (passedChecks === checks.length) {
            statusText.html('<i class="fas fa-check-circle text-success"></i> Hệ thống hoạt động bình thường');
        } else if (passedChecks > 0) {
            statusText.html(`<i class="fas fa-exclamation-triangle text-warning"></i> Một số dịch vụ không khả dụng (${passedChecks}/${checks.length})`);
        } else {
            statusText.html('<i class="fas fa-times-circle text-danger"></i> Hệ thống gặp sự cố');
        }
        
        // Update debug info
        debugInfo.push(`\nBrowser: ${navigator.userAgent}`);
        debugInfo.push(`jQuery: ${$.fn.jquery || 'Not loaded'}`);
        debugInfo.push(`Current URL: ${window.location.href}`);
        debugInfo.push(`Timestamp: ${new Date().toISOString()}`);
        
        debugList.html(debugInfo.map(info => `<li>${info}</li>`).join(''));
    });
}

/**
 * Toggle debug mode
 */
function toggleDebugMode() {
    debugMode = !debugMode;
    const debugPanel = $('#debugInfo');
    
    if (debugMode) {
        debugPanel.slideDown();
        checkSystemStatus(); // Refresh debug info
    } else {
        debugPanel.slideUp();
    }
}

/**
 * Utility Functions
 */

function formatCurrency(amount) {
    if (!amount) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

function formatDisplayDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

function calculateGrowthRate(previous, current) {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
}

function generateBusinessInsight(data) {
    let insights = [];
    
    if (data.conversion_rate > 4) {
        insights.push("Tỷ lệ chuyển đổi tốt");
    } else if (data.conversion_rate < 2) {
        insights.push("Cần cải thiện tỷ lệ chuyển đổi");
    }
    
    if (data.avg_order_value > 500000) {
        insights.push("Giá trị đơn hàng cao");
    } else if (data.avg_order_value < 200000) {
        insights.push("Có thể tăng giá trị đơn hàng trung bình");
    }
    
    if (data.customer_retention > 60) {
        insights.push("Khách hàng trung thành cao");
    } else {
        insights.push("Cần cải thiện retention");
    }
    
    return insights.length > 0 ? insights.join(", ") : "Doanh nghiệp đang hoạt động ổn định";
}

function getPerformanceRating(completionRate) {
    if (completionRate >= 90) return 'Xuất sắc';
    if (completionRate >= 80) return 'Tốt';
    if (completionRate >= 70) return 'Khá';
    if (completionRate >= 60) return 'Trung bình';
    return 'Cần cải thiện';
}

/**
 * Export Functions
 */

// Global export functions for different report types
window.exportToExcel = function(reportType) {
    try {
        // Show loading state
        const exportBtn = document.querySelector(`#export-excel-${reportType}`);
        if (exportBtn) {
            exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xuất...';
            exportBtn.disabled = true;
        }
        
        // Create download link
        const url = `/api/export_reports.php?action=export&format=excel&report=${reportType}`;
        const link = document.createElement('a');
        link.href = url;
        link.download = `NHAFLOWER_${reportType}_${new Date().toISOString().slice(0, 10)}.xls`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Reset button after delay
        setTimeout(() => {
            if (exportBtn) {
                exportBtn.innerHTML = '<i class="fas fa-file-excel"></i> Xuất Excel';
                exportBtn.disabled = false;
            }
            showSuccess('Đã xuất báo cáo Excel thành công!');
        }, 2000);
        
    } catch (error) {
        console.error('Export to Excel error:', error);
        showError('Lỗi xuất Excel: ' + error.message);
    }
};

window.exportToPDF = function(reportType) {
    try {
        // Show loading state
        const exportBtn = document.querySelector(`#export-pdf-${reportType}`);
        if (exportBtn) {
            exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xuất...';
            exportBtn.disabled = true;
        }
        
        // Open PDF in new window for printing
        const url = `/api/export_reports.php?action=export&format=pdf&report=${reportType}`;
        window.open(url, '_blank');
        
        // Reset button after delay
        setTimeout(() => {
            if (exportBtn) {
                exportBtn.innerHTML = '<i class="fas fa-file-pdf"></i> Xuất PDF';
                exportBtn.disabled = false;
            }
            showSuccess('Đã mở báo cáo PDF!');
        }, 1500);
        
    } catch (error) {
        console.error('Export to PDF error:', error);
        showError('Lỗi xuất PDF: ' + error.message);
    }
};

// Legacy functions for backward compatibility
function exportToExcel() {
    window.exportToExcel(currentReportType || 'overview');
}

function exportToPDF() {
    window.exportToPDF(currentReportType || 'overview');
}

function printReport() {
    // Set print date
    $('#printDate').text(new Date().toLocaleDateString('vi-VN'));
    
    // Print the page
    window.print();
}

function showSuccess(message) {
    Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: message,
        timer: 2000,
        showConfirmButton: false
    });
}

function showError(message) {
    Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: message,
        confirmButtonColor: '#e91e63'
    });
}

// Notification system for exports and other actions
function showNotification(message, type = 'info') {
    const icons = {
        success: 'success',
        error: 'error', 
        warning: 'warning',
        info: 'info'
    };
    
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107', 
        info: '#17a2b8'
    };
    
    Swal.fire({
        icon: icons[type] || 'info',
        title: message,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        confirmButtonColor: colors[type] || '#17a2b8'
    });
}
