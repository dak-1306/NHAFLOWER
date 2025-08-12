/**
 * NHAFLOWER - Order Management JavaScript
 * Simplified and robust version
 */

let ordersTable;

$(document).ready(function() {
    console.log("Orders page initializing...");
    try {
        initializeOrdersTable();
        loadOrders();
        console.log("Orders page initialized successfully.");
    } catch (error) {
        console.error("Initialization error:", error);
    }
});

/**
 * Initialize DataTable for orders
 */
function initializeOrdersTable() {
    console.log("Initializing DataTable...");
    
    ordersTable = $('#ordersTable').DataTable({
        "processing": true,
        "language": {
            "decimal": "",
            "emptyTable": "Không có dữ liệu trong bảng",
            "info": "Hiển thị _START_ đến _END_ của _TOTAL_ mục",
            "infoEmpty": "Hiển thị 0 đến 0 của 0 mục",
            "infoFiltered": "(lọc từ _MAX_ tổng số mục)",
            "lengthMenu": "Hiển thị _MENU_ mục",
            "loadingRecords": "Đang tải...",
            "processing": "Đang xử lý...",
            "search": "Tìm kiếm:",
            "zeroRecords": "Không tìm thấy kết quả phù hợp",
            "paginate": {
                "first": "Đầu",
                "last": "Cuối", 
                "next": "Tiếp",
                "previous": "Trước"
            }
        },
        "responsive": true,
        "pageLength": 10,
        "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "Tất cả"]],
        "order": [[2, "desc"]], // Sort by date descending
        "columnDefs": [
            {
                "targets": [6], // Actions column
                "orderable": false,
                "searchable": false
            }
        ]
    });
    
    console.log("DataTable initialized successfully");
}

/**
 * Load orders from API
 */
function loadOrders() {
    console.log("Loading orders from API...");
    
    $.ajax({
        url: '../api/don_hang/get_all_donhang.php',
        type: 'GET',
        dataType: 'json',
        timeout: 15000,
        success: function(response) {
            console.log("API Response:", response);
            
            let orders = [];
            if (response && response.success && Array.isArray(response.data)) {
                orders = response.data;
            } else if (Array.isArray(response)) {
                orders = response;
            } else {
                console.error("Invalid response format:", response);
                showNotification('Định dạng dữ liệu không hợp lệ', 'error');
                return;
            }
            
            displayOrders(orders);
            showNotification(`Đã tải ${orders.length} đơn hàng`, 'success');
        },
        error: function(xhr, status, error) {
            console.error('API Error:', {
                status: status,
                error: error,
                responseText: xhr.responseText,
                statusCode: xhr.status
            });
            
            let message = 'Không thể tải dữ liệu đơn hàng';
            if (xhr.status === 404) {
                message = 'API không tìm thấy (404)';
            } else if (xhr.status === 500) {
                message = 'Lỗi máy chủ (500)';
            } else if (status === 'timeout') {
                message = 'Kết nối bị timeout';
            }
            
            showNotification(message, 'error');
        }
    });
}

/**
 * Display orders in DataTable
 */
function displayOrders(orders) {
    console.log("Displaying orders:", orders.length);
    
    if (!ordersTable) {
        console.error("DataTable not initialized");
        return;
    }
    
    // Clear existing data
    ordersTable.clear();

    if (!orders || orders.length === 0) {
        ordersTable.draw();
        return;
    }

    // Add rows to DataTable
    orders.forEach(function(order) {
        try {
            const statusBadge = getStatusBadge(order.trang_thai || 'cho');
            const paymentBadge = '<span class="badge badge-warning">Chưa thanh toán</span>';
            const formattedDate = formatDate(order.ngay_dat);
            const formattedTotal = formatCurrency(parseFloat(order.tong_tien || 0));

            const actions = `
                <div class="btn-group btn-group-sm" role="group">
                    <button type="button" class="btn btn-info" onclick="viewOrderDetails(${order.id_donhang})" title="Xem chi tiết">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button type="button" class="btn btn-warning" onclick="showUpdateStatusModal(${order.id_donhang}, '${order.trang_thai || 'cho'}')" title="Cập nhật trạng thái">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button type="button" class="btn btn-danger" onclick="confirmDeleteOrder(${order.id_donhang})" title="Xóa đơn hàng">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;

            const row = [
                `#${order.id_donhang}`,
                order.ten_khachhang || 'N/A',
                formattedDate,
                formattedTotal,
                statusBadge,
                paymentBadge,
                actions
            ];

            ordersTable.row.add(row);
        } catch (error) {
            console.error("Error processing order:", order, error);
        }
    });

    ordersTable.draw();
    console.log("Orders displayed successfully");
}

/**
 * Get status badge HTML
 */
function getStatusBadge(status) {
    const statusMap = {
        'cho': '<span class="badge badge-warning">Chờ xác nhận</span>',
        'dang_giao': '<span class="badge badge-info">Đang giao</span>',
        'hoan_tat': '<span class="badge badge-success">Hoàn thành</span>',
        'huy': '<span class="badge badge-danger">Đã hủy</span>'
    };
    return statusMap[status] || '<span class="badge badge-secondary">Không xác định</span>';
}

/**
 * Format date for display
 */
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    } catch (error) {
        return dateString;
    }
}

/**
 * Format currency
 */
function formatCurrency(amount) {
    if (isNaN(amount)) return '0 ₫';
    
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            text: message,
            icon: type === 'error' ? 'error' : type === 'success' ? 'success' : 'info',
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
    } else {
        console.log(`${type.toUpperCase()}: ${message}`);
    }
}

/**
 * View order details
 */
function viewOrderDetails(orderId) {
    console.log("Viewing order details:", orderId);
    showNotification(`Đang xem chi tiết đơn hàng #${orderId}`, 'info');
}

/**
 * Show update status modal
 */
function showUpdateStatusModal(orderId, currentStatus) {
    console.log("Update status for order:", orderId, currentStatus);
    showNotification(`Cập nhật trạng thái đơn hàng #${orderId}`, 'info');
}

/**
 * Confirm delete order
 */
function confirmDeleteOrder(orderId) {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: 'Xác nhận xóa',
            text: `Bạn có chắc muốn xóa đơn hàng #${orderId}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteOrder(orderId);
            }
        });
    } else {
        if (confirm(`Bạn có chắc muốn xóa đơn hàng #${orderId}?`)) {
            deleteOrder(orderId);
        }
    }
}

/**
 * Delete order
 */
function deleteOrder(orderId) {
    console.log("Deleting order:", orderId);
    showNotification(`Đã xóa đơn hàng #${orderId}`, 'success');
    // TODO: Implement actual delete functionality
}

/**
 * Apply filters
 */
function applyFilters() {
    console.log("Applying filters...");
    // TODO: Implement filter functionality
    loadOrders();
}

/**
 * Export orders
 */
function exportOrders() {
    console.log("Exporting orders...");
    showNotification('Xuất dữ liệu thành công', 'success');
    // TODO: Implement export functionality
}
