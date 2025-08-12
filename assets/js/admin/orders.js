/**
 * NHAFLOWER - Order Management JavaScript
 * Quản lý đơn hàng cho admin panel
 */

let ordersTable;
let currentFilters = {};

// Document ready
$(document).ready(function() {
    initializeOrdersTable();
    bindEvents();
    loadOrders();
});

/**
 * Initialize DataTable for orders
 */
function initializeOrdersTable() {
    ordersTable = $('#ordersTable').DataTable({
        "language": {
            "url": "https://cdn.datatables.net/plug-ins/1.13.7/i18n/vi.json"
        },
        "responsive": true,
        "processing": true,
        "serverSide": false,
        "pageLength": 10,
        "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "Tất cả"]],
        "order": [[2, "desc"]], // Sort by date descending
        "columnDefs": [
            {
                "targets": [6], // Actions column
                "orderable": false,
                "searchable": false
            }
        ],
        "drawCallback": function(settings) {
            // Re-initialize tooltips after table draw
            $('[data-toggle="tooltip"]').tooltip();
        }
    });
}

/**
 * Bind event handlers
 */
function bindEvents() {
    // Filter form
    $('#statusFilter, #dateFromFilter, #dateToFilter').on('change', function() {
        applyFilters();
    });

    // Update status form
    $('#updateStatusForm').on('submit', function(e) {
        e.preventDefault();
        updateOrderStatus();
    });

    // Print order button
    $('#printOrderBtn').on('click', function() {
        printOrder();
    });

    // Search functionality
    $('.navbar-search input').on('keyup', function() {
        if (ordersTable) {
            ordersTable.search(this.value).draw();
        }
    });
}

/**
 * Load orders from API
 */
function loadOrders() {
    showLoading();
    
    $.ajax({
        url: '../api/don_hang/get_all_donhang.php',
        type: 'GET',
        dataType: 'json',
        data: currentFilters,
        success: function(data) {
            // The API returns data directly, not wrapped in response object
            if (Array.isArray(data)) {
                displayOrders(data);
            } else {
                showError('Dữ liệu trả về không hợp lệ');
            }
        },
        error: function(xhr, status, error) {
            console.error('Error loading orders:', error);
            showError('Không thể tải dữ liệu đơn hàng. Vui lòng thử lại.');
        },
        complete: function() {
            hideLoading();
        }
    });
}

/**
 * Display orders in DataTable
 */
function displayOrders(orders) {
    // Clear existing data
    ordersTable.clear();

    if (!orders || orders.length === 0) {
        ordersTable.draw();
        return;
    }

    // Add rows to DataTable
    orders.forEach(function(order) {
        const statusBadge = getStatusBadge(order.trang_thai || 'cho');
        const paymentBadge = getPaymentBadge('pending'); // Default since not in current DB
        const formattedDate = formatDate(order.ngay_dat);
        const formattedTotal = formatCurrency(0); // Will need to calculate from chitietdonhang

        const actions = `
            <div class="btn-group" role="group">
                <button type="button" class="btn btn-info btn-sm" onclick="viewOrderDetails(${order.id_donhang})" data-toggle="tooltip" title="Xem chi tiết">
                    <i class="fas fa-eye"></i>
                </button>
                <button type="button" class="btn btn-warning btn-sm" onclick="showUpdateStatusModal(${order.id_donhang}, '${order.trang_thai || 'cho'}')" data-toggle="tooltip" title="Cập nhật trạng thái">
                    <i class="fas fa-edit"></i>
                </button>
                <button type="button" class="btn btn-danger btn-sm" onclick="deleteOrder(${order.id_donhang})" data-toggle="tooltip" title="Xóa đơn hàng">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        ordersTable.row.add([
            `#${order.id_donhang}`,
            order.ten_khachhang || 'N/A',
            formattedDate,
            formattedTotal,
            statusBadge,
            paymentBadge,
            actions
        ]);
    });

    ordersTable.draw();
    
    // Initialize tooltips
    $('[data-toggle="tooltip"]').tooltip();
}

/**
 * Apply filters to order list
 */
function applyFilters() {
    currentFilters = {};
    
    const status = $('#statusFilter').val();
    const dateFrom = $('#dateFromFilter').val();
    const dateTo = $('#dateToFilter').val();
    
    if (status) {
        currentFilters.status = status;
    }
    
    if (dateFrom) {
        currentFilters.date_from = dateFrom;
    }
    
    if (dateTo) {
        currentFilters.date_to = dateTo;
    }
    
    loadOrders();
}

/**
 * View order details
 */
function viewOrderDetails(orderId) {
    showLoading();
    
    $.ajax({
        url: '../api/don_hang/get_donhang_by_id.php',
        type: 'GET',
        dataType: 'json',
        data: { id: orderId },
        success: function(response) {
            if (response.success) {
                displayOrderDetails(response.data);
                $('#orderDetailModal').modal('show');
            } else {
                showError('Lỗi tải chi tiết đơn hàng: ' + response.message);
            }
        },
        error: function(xhr, status, error) {
            console.error('Error loading order details:', error);
            showError('Không thể tải chi tiết đơn hàng.');
        },
        complete: function() {
            hideLoading();
        }
    });
}

/**
 * Display order details in modal
 */
function displayOrderDetails(orderData) {
    // Handle different response formats
    const order = orderData.order || orderData;
    const items = orderData.items || [];
    
    let itemsHTML = '';
    let totalAmount = 0;
    
    // If we have items, display them
    if (items && items.length > 0) {
        items.forEach(function(item) {
            const itemTotal = parseFloat(item.so_luong || 0) * parseFloat(item.don_gia || 0);
            totalAmount += itemTotal;
            
            itemsHTML += `
                <tr>
                    <td>
                        <div class="d-flex align-items-center">
                            <img src="../uploads/products/${item.hinh_anh || 'default.jpg'}" 
                                 alt="${item.ten_san_pham || 'Sản phẩm'}" 
                                 class="img-thumbnail me-3" 
                                 style="width: 50px; height: 50px; object-fit: cover;">
                            <div>
                                <div class="fw-bold">${item.ten_san_pham || 'N/A'}</div>
                                <small class="text-muted">Mã: ${item.id_sanpham || 'N/A'}</small>
                            </div>
                        </div>
                    </td>
                    <td class="text-center">${item.so_luong || 0}</td>
                    <td class="text-end">${formatCurrency(item.don_gia || 0)}</td>
                    <td class="text-end">${formatCurrency(itemTotal)}</td>
                </tr>
            `;
        });
    } else {
        itemsHTML = '<tr><td colspan="4" class="text-center text-muted">Không có thông tin chi tiết sản phẩm</td></tr>';
    }
    
    const detailHTML = `
        <div class="row">
            <div class="col-md-6">
                <h6 class="text-primary"><i class="fas fa-info-circle"></i> Thông tin đơn hàng</h6>
                <table class="table table-borderless">
                    <tr><td><strong>Mã đơn hàng:</strong></td><td>#${order.id_donhang || 'N/A'}</td></tr>
                    <tr><td><strong>Ngày đặt:</strong></td><td>${formatDateTime(order.ngay_dat || order.ngay_dat_hang)}</td></tr>
                    <tr><td><strong>Trạng thái:</strong></td><td>${getStatusBadge(order.trang_thai || 'cho')}</td></tr>
                    <tr><td><strong>Địa chỉ giao:</strong></td><td>${order.dia_chi_giao || 'N/A'}</td></tr>
                </table>
            </div>
            <div class="col-md-6">
                <h6 class="text-primary"><i class="fas fa-user"></i> Thông tin khách hàng</h6>
                <table class="table table-borderless">
                    <tr><td><strong>Tên:</strong></td><td>${order.ten_khachhang || order.ten || 'N/A'}</td></tr>
                    <tr><td><strong>SĐT:</strong></td><td>${order.sdt || order.so_dien_thoai || 'N/A'}</td></tr>
                    <tr><td><strong>Địa chỉ:</strong></td><td>${order.dia_chi || 'N/A'}</td></tr>
                </table>
            </div>
        </div>
        
        <hr>
        
        <h6 class="text-primary"><i class="fas fa-shopping-cart"></i> Chi tiết sản phẩm</h6>
        <div class="table-responsive">
            <table class="table table-hover">
                <thead class="table-light">
                    <tr>
                        <th>Sản phẩm</th>
                        <th class="text-center">Số lượng</th>
                        <th class="text-end">Đơn giá</th>
                        <th class="text-end">Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHTML}
                </tbody>
                <tfoot class="table-light">
                    <tr>
                        <td colspan="3" class="text-end"><strong>Tổng cộng:</strong></td>
                        <td class="text-end"><strong>${formatCurrency(totalAmount)}</strong></td>
                    </tr>
                </tfoot>
            </table>
        </div>
    `;
    
    $('#orderDetailContent').html(detailHTML);
}

/**
 * Show update status modal
 */
function showUpdateStatusModal(orderId, currentStatus) {
    $('#updateOrderId').val(orderId);
    $('#newStatus').val(currentStatus);
    $('#statusNote').val('');
    $('#updateStatusModal').modal('show');
}

/**
 * Update order status
 */
function updateOrderStatus() {
    const orderId = $('#updateOrderId').val();
    const newStatus = $('#newStatus').val();
    const note = $('#statusNote').val();
    
    if (!newStatus) {
        showError('Vui lòng chọn trạng thái mới.');
        return;
    }
    
    const formData = {
        id_donhang: orderId,
        trang_thai: newStatus,
        dia_chi_giao: note // Using available field for note
    };
    
    $.ajax({
        url: '../api/don_hang/update_donhang.php',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(formData),
        success: function(response) {
            if (response.message && response.message.includes('thành công')) {
                $('#updateStatusModal').modal('hide');
                showSuccess('Cập nhật trạng thái thành công!');
                loadOrders(); // Reload the table
            } else if (response.error) {
                showError('Lỗi cập nhật: ' + response.error);
            } else {
                showError('Có lỗi xảy ra khi cập nhật');
            }
        },
        error: function(xhr, status, error) {
            console.error('Error updating order status:', error);
            showError('Không thể cập nhật trạng thái đơn hàng.');
        }
    });
}

/**
 * Delete order
 */
function deleteOrder(orderId) {
    Swal.fire({
        title: 'Xác nhận xóa',
        text: 'Bạn có chắc chắn muốn xóa đơn hàng này?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e91e63',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: '../api/don_hang/delete_donhang.php',
                type: 'POST',
                dataType: 'json',
                data: { id: orderId },
                success: function(response) {
                    if (response.message && response.message.includes('thành công')) {
                        showSuccess('Xóa đơn hàng thành công!');
                        loadOrders(); // Reload the table
                    } else if (response.error) {
                        showError('Lỗi xóa đơn hàng: ' + response.error);
                    } else {
                        showError('Có lỗi xảy ra khi xóa đơn hàng');
                    }
                },
                error: function(xhr, status, error) {
                    console.error('Error deleting order:', error);
                    showError('Không thể xóa đơn hàng.');
                }
            });
        }
    });
}

/**
 * Print order
 */
function printOrder() {
    const printContent = document.getElementById('orderDetailContent').innerHTML;
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Chi tiết đơn hàng - NHAFLOWER</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                @media print {
                    .no-print { display: none; }
                }
                body { font-family: 'Arial', sans-serif; }
                .header { text-align: center; margin-bottom: 30px; }
                .logo { color: #e91e63; font-size: 24px; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">NHAFLOWER</div>
                    <p>Hệ thống bán hoa trực tuyến</p>
                </div>
                ${printContent}
            </div>
            <script>
                window.onload = function() {
                    window.print();
                    window.onafterprint = function() {
                        window.close();
                    };
                };
            </script>
        </body>
        </html>
    `);
    
    printWindow.document.close();
}

// Utility Functions

/**
 * Get status badge HTML
 */
function getStatusBadge(status) {
    const statusMap = {
        'cho': { class: 'warning', text: 'Chờ xác nhận' },
        'dang_giao': { class: 'info', text: 'Đang giao' },
        'hoan_tat': { class: 'success', text: 'Hoàn thành' },
        'huy': { class: 'danger', text: 'Đã hủy' }
    };
    
    const statusInfo = statusMap[status] || { class: 'secondary', text: status };
    return `<span class="badge badge-${statusInfo.class}">${statusInfo.text}</span>`;
}

/**
 * Get payment status badge HTML
 */
function getPaymentBadge(status) {
    const statusMap = {
        'pending': { class: 'warning', text: 'Chờ thanh toán' },
        'paid': { class: 'success', text: 'Đã thanh toán' },
        'failed': { class: 'danger', text: 'Thanh toán lỗi' },
        'refunded': { class: 'info', text: 'Đã hoàn tiền' }
    };
    
    const statusInfo = statusMap[status] || { class: 'secondary', text: status };
    return `<span class="badge badge-${statusInfo.class}">${statusInfo.text}</span>`;
}

/**
 * Format date
 */
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

/**
 * Format date and time
 */
function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
}

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
 * Show loading state
 */
function showLoading() {
    $('#ordersTableBody').html(`
        <tr>
            <td colspan="7" class="loading">
                <i class="fas fa-spinner fa-spin mr-2"></i>Đang tải dữ liệu...
            </td>
        </tr>
    `);
}

/**
 * Hide loading state
 */
function hideLoading() {
    // Loading will be hidden when data is displayed
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
        confirmButtonColor: '#e91e63'
    });
}
