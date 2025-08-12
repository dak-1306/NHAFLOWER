/**
 * NHAFLOWER - Simplified Charts JavaScript
 * Compatible with Chart.js v2.9.4
 */

// Chart instances
let revenueChart, categoryChart;

// Colors matching NHAFLOWER theme
const colors = {
    primary: '#e91e63',
    primaryLight: '#f48fb1', 
    success: '#4caf50',
    warning: '#ff9800',
    info: '#2196f3',
    danger: '#f44336'
};

// Wait for DOM and Chart.js to be ready
$(document).ready(function() {
    console.log('Document ready');
    
    // Set default dates
    setDefaultDates();
    
    // Initialize charts when Chart.js is available
    if (typeof Chart !== 'undefined') {
        console.log('Chart.js available immediately');
        initializeCharts();
    } else {
        console.log('Waiting for Chart.js...');
        // Simple retry mechanism
        let retries = 0;
        const checkChart = setInterval(() => {
            if (typeof Chart !== 'undefined') {
                console.log('Chart.js now available');
                clearInterval(checkChart);
                initializeCharts();
            } else if (retries++ > 10) {
                console.log('Chart.js failed to load, showing fallback');
                clearInterval(checkChart);
                showChartFallback();
            }
        }, 200);
    }
});

function setDefaultDates() {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    $('#dateFrom').val(firstDayOfMonth.toISOString().split('T')[0]);
    $('#dateTo').val(today.toISOString().split('T')[0]);
}

function initializeCharts() {
    console.log('Initializing charts...');
    try {
        initRevenueChart();
        initCategoryChart();
        loadSampleData();
        console.log('Charts initialized successfully');
    } catch (error) {
        console.error('Error initializing charts:', error);
        showChartFallback();
    }
}

function initRevenueChart() {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) {
        console.error('Revenue chart canvas not found');
        return;
    }
    
    revenueChart = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Doanh thu (VNĐ)',
                data: [],
                borderColor: colors.primary,
                backgroundColor: colors.primaryLight + '20',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        callback: function(value) {
                            return new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                            }).format(value);
                        }
                    }
                }]
            },
            tooltips: {
                callbacks: {
                    label: function(tooltipItem, data) {
                        const value = tooltipItem.yLabel;
                        return 'Doanh thu: ' + new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND'
                        }).format(value);
                    }
                }
            }
        }
    });
}

function initCategoryChart() {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) {
        console.error('Category chart canvas not found');
        return;
    }
    
    categoryChart = new Chart(ctx.getContext('2d'), {
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
                    colors.primaryLight
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            legend: {
                position: 'bottom',
                labels: {
                    boxWidth: 12,
                    padding: 15
                }
            },
            tooltips: {
                callbacks: {
                    label: function(tooltipItem, data) {
                        const label = data.labels[tooltipItem.index];
                        const value = data.datasets[0].data[tooltipItem.index];
                        const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${label}: ${value} (${percentage}%)`;
                    }
                }
            }
        }
    });
}

function loadSampleData() {
    // Sample revenue data
    const revenueData = {
        labels: ['01/01', '02/01', '03/01', '04/01', '05/01', '06/01', '07/01'],
        data: [1200000, 1900000, 3000000, 5000000, 2300000, 3200000, 4100000]
    };
    
    if (revenueChart) {
        revenueChart.data.labels = revenueData.labels;
        revenueChart.data.datasets[0].data = revenueData.data;
        revenueChart.update();
    }
    
    // Sample category data
    const categoryData = {
        labels: ['Hoa hồng', 'Hoa cúc', 'Hoa ly', 'Hoa tulip', 'Khác'],
        data: [35, 25, 20, 15, 5]
    };
    
    if (categoryChart) {
        categoryChart.data.labels = categoryData.labels;
        categoryChart.data.datasets[0].data = categoryData.data;
        categoryChart.update();
    }
    
    // Update stats
    $('#totalRevenue').text('15.700.000 ₫');
    $('#totalOrders').text('156');
    $('#totalProducts').text('89');
    $('#totalCustomers').text('234');
    
    console.log('Sample data loaded');
}

function showChartFallback() {
    $('.chart-container canvas').each(function() {
        $(this).hide().after(`
            <div class="text-center p-4">
                <i class="fas fa-chart-line fa-3x text-muted mb-3"></i>
                <p class="text-muted">Biểu đồ đang được tải...</p>
                <button class="btn btn-primary btn-sm" onclick="location.reload()">
                    <i class="fas fa-sync"></i> Tải lại
                </button>
            </div>
        `);
    });
}

// Export functions
function exportReport(format) {
    Swal.fire({
        icon: 'info',
        title: 'Thông báo', 
        text: `Xuất báo cáo ${format.toUpperCase()} đang được phát triển!`
    });
}

function updateCharts() {
    $('#loadingSpinner').addClass('show');
    setTimeout(() => {
        $('#loadingSpinner').removeClass('show');
        Swal.fire({
            icon: 'success',
            title: 'Cập nhật thành công!',
            text: 'Dữ liệu đã được làm mới!'
        });
    }, 1000);
}
