/**
 * NHAFLOWER - Charts & Reports JavaScript (Fixed Version)
 * Biểu đồ và báo cáo cho admin panel
 */

// Chart instances
let revenueChart, categoryChart;

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

// Document ready with simplified Chart.js loading check
$(document).ready(function() {
    console.log('Document ready, checking for Chart.js...');
    console.log('Chart available:', typeof Chart !== 'undefined');
    
    // Small delay to allow Chart.js to fully initialize
    setTimeout(() => {
        if (typeof Chart !== 'undefined') {
            console.log('Chart.js is available, initializing charts...');
            initializeCharts();
        } else {
            console.log('Chart.js not available, trying CDN fallback...');
            loadChartJSFallback();
        }
    }, 100);
    
    // Set default date values
    setDefaultDates();
});

/**
 * Load Chart.js from CDN as fallback
 */
function loadChartJSFallback() {
    const script = document.createElement('script');
    // Use Chart.js v2.9.4 to match local version
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@2.9.4/dist/Chart.bundle.min.js';
    script.onload = function() {
        console.log('Chart.js v2.9.4 loaded from CDN fallback');
        if (typeof Chart !== 'undefined') {
            setTimeout(() => {
                initializeCharts();
            }, 100);
        }
    };
    script.onerror = function() {
        console.error('Failed to load Chart.js from CDN fallback');
        showPermanentFallback();
    };
    document.head.appendChild(script);
}

/**
 * Set default date values
 */
function setDefaultDates() {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    $('#dateFrom').val(firstDayOfMonth.toISOString().split('T')[0]);
    $('#dateTo').val(today.toISOString().split('T')[0]);
}

/**
 * Initialize all charts safely
 */
function initializeCharts() {
    try {
        initRevenueChart();
        initCategoryChart();
        loadSampleData();
        console.log('Charts initialized successfully');
    } catch (error) {
        console.error('Error initializing charts:', error);
        showFallbackMessage();
    }
}

/**
 * Initialize revenue chart with sample data
 */
function initRevenueChart() {
    const canvas = document.getElementById('revenueChart');
    if (!canvas) {
        console.warn('Revenue chart canvas not found');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    revenueChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
            datasets: [{
                label: 'Doanh thu (₫)',
                data: [12000000, 19000000, 15000000, 25000000, 22000000, 30000000, 28000000],
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
            }
        }
    });
}

/**
 * Initialize category pie chart
 */
function initCategoryChart() {
    const canvas = document.getElementById('categoryChart');
    if (!canvas) {
        console.warn('Category chart canvas not found');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Hoa Hồng', 'Hoa Cúc', 'Hoa Tulip', 'Hoa Ly', 'Khác'],
            datasets: [{
                data: [35, 25, 20, 15, 5],
                backgroundColor: [
                    colors.primary,
                    colors.success,
                    colors.warning,
                    colors.info,
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
                }
            },
            cutout: '50%'
        }
    });
}

/**
 * Load sample data for statistics cards
 */
function loadSampleData() {
    // Update statistics cards with sample data
    $('#monthlyRevenue').text(formatCurrency(48500000));
    $('#totalOrders').text('127');
    $('#totalProducts').text('45');
    $('#totalCustomers').text('89');
    
    // Update table with sample data
    const sampleRevenueData = [
        { date: '12/08/2025', orders: 15, revenue: 8500000, profit: 2550000, conversion: '12.5%' },
        { date: '11/08/2025', orders: 12, revenue: 6800000, profit: 2040000, conversion: '10.8%' },
        { date: '10/08/2025', orders: 18, revenue: 12200000, profit: 3660000, conversion: '15.2%' },
        { date: '09/08/2025', orders: 22, revenue: 15600000, profit: 4680000, conversion: '18.7%' },
        { date: '08/08/2025', orders: 8, revenue: 4200000, profit: 1260000, conversion: '8.3%' }
    ];
    
    const tbody = $('#revenueReportTableBody');
    tbody.empty();
    
    sampleRevenueData.forEach(row => {
        tbody.append(`
            <tr>
                <td>${row.date}</td>
                <td>${row.orders}</td>
                <td>${formatCurrency(row.revenue)}</td>
                <td>${formatCurrency(row.profit)}</td>
                <td><span class="badge badge-success">${row.conversion}</span></td>
            </tr>
        `);
    });
}

/**
 * Format currency
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

/**
 * Show fallback message when charts fail to load
 */
function showFallbackMessage() {
    $('.chart-container canvas').each(function() {
        $(this).parent().html(`
            <div class="text-center py-4">
                <i class="fas fa-chart-area fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">Đang tải biểu đồ...</h5>
                <p class="text-muted">Đang thử tải Chart.js từ CDN...</p>
                <div class="spinner-border text-primary" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
            </div>
        `);
    });
}

/**
 * Show permanent fallback when all loading attempts fail
 */
function showPermanentFallback() {
    $('.chart-container canvas').each(function() {
        $(this).parent().html(`
            <div class="text-center py-4">
                <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                <h5 class="text-warning">Không thể tải biểu đồ</h5>
                <p class="text-muted">Vui lòng kiểm tra kết nối internet và làm mới trang.</p>
                <button class="btn btn-primary btn-sm" onclick="location.reload()">
                    <i class="fas fa-redo mr-1"></i>Làm mới trang
                </button>
            </div>
        `);
    });
    
    // Also load sample data into tables
    loadSampleData();
}

/**
 * Update charts function (called by buttons)
 */
function updateCharts() {
    $('#loadingSpinner').addClass('show');
    setTimeout(() => {
        $('#loadingSpinner').removeClass('show');
        
        // Reload sample data
        loadSampleData();
        
        Swal.fire({
            icon: 'success',
            title: 'Cập nhật thành công!',
            text: 'Dữ liệu biểu đồ đã được làm mới.',
            timer: 2000,
            showConfirmButton: false
        });
    }, 1000);
}

/**
 * Export report function
 */
function exportReport(format) {
    Swal.fire({
        icon: 'info',
        title: 'Thông báo',
        text: `Xuất báo cáo ${format.toUpperCase()} đang được phát triển!`,
        footer: 'Chức năng sẽ sớm được hoàn thiện.'
    });
}

// Global functions for window scope
window.updateCharts = updateCharts;
window.exportReport = exportReport;
