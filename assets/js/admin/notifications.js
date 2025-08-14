/**
 * NHAFLOWER Admin - Notifications Management
 * File: notifications.js
 * Author: NHAFLOWER Team  
 * Created: 2025
 */

$(document).ready(function() {
    console.log('NHAFLOWER Notifications Management initializing...');
    
    // Initialize page
    initializeNotifications();
    loadNotifications();
    loadNotificationStats();
    
    // Setup auto-refresh every 30 seconds
    setInterval(function() {
        loadNotifications();
        loadNotificationStats();
    }, 30000);
});

/**
 * Initialize notifications management
 */
function initializeNotifications() {
    // Setup form validation
    setupFormValidation();
    
    // Setup event listeners
    setupEventListeners();
    
    console.log('Notifications management initialized');
}

/**
 * Setup form validation
 */
function setupFormValidation() {
    // Add notification form validation
    $('#addNotificationForm').on('submit', function(e) {
        e.preventDefault();
        saveNotification();
    });
    
    // Edit notification form validation
    $('#editNotificationForm').on('submit', function(e) {
        e.preventDefault();
        updateNotification();
    });
    
    // Real-time character counter
    $('#notificationTitle, #editNotificationTitle').on('input', function() {
        const maxLength = 200;
        const currentLength = $(this).val().length;
        const remaining = maxLength - currentLength;
        
        const counter = $(this).siblings('.character-counter');
        if (counter.length === 0) {
            $(this).after(`<small class="character-counter text-muted">${remaining} ký tự còn lại</small>`);
        } else {
            counter.text(`${remaining} ký tự còn lại`);
            counter.toggleClass('text-danger', remaining < 20);
        }
    });
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Search functionality
    $('.navbar-search input').on('keyup', function() {
        const searchTerm = $(this).val().toLowerCase();
        filterNotifications(searchTerm);
    });
    
    // Priority filter
    $(document).on('change', '#priorityFilter', function() {
        const priority = $(this).val();
        filterNotificationsByPriority(priority);
    });
    
    // Auto-hide alerts
    setTimeout(function() {
        $('.alert').fadeOut();
    }, 5000);
}

/**
 * Load notification statistics
 */
function loadNotificationStats() {
    $.ajax({
        url: '../api/thong_bao.php?action=get_stats',
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                updateStatsCards(response.data);
            }
        },
        error: function() {
            console.log('Failed to load notification stats');
            // Set default stats
            updateStatsCards({
                total: 0,
                today: 0,
                week: 0,
                month: 0
            });
        }
    });
}

/**
 * Update statistics cards
 */
function updateStatsCards(stats) {
    $('#totalNotifications').text(stats.total || 0);
    $('#todayNotifications').text(stats.today || 0);
    $('#weekNotifications').text(stats.week || 0);
    $('#monthNotifications').text(stats.month || 0);
    $('#notificationCounter').text(stats.total > 9 ? '9+' : stats.total || 0);
}

/**
 * Load notifications list
 */
function loadNotifications() {
    showTableLoading(true);
    
    $.ajax({
        url: '../api/thong_bao.php?action=get_all',
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                renderNotificationsTable(response.data);
            } else {
                showError('Không thể tải danh sách thông báo: ' + response.message);
            }
        },
        error: function(xhr, status, error) {
            console.error('Load notifications error:', error);
            showError('Lỗi kết nối API. Vui lòng thử lại sau.');
        },
        complete: function() {
            showTableLoading(false);
        }
    });
}

/**
 * Render notifications table
 */
function renderNotificationsTable(notifications) {
    const tableBody = $('#notificationsTableBody');
    tableBody.empty();
    
    if (!notifications || notifications.length === 0) {
        tableBody.html(`
            <tr>
                <td colspan="6" class="text-center text-muted py-4">
                    <i class="fas fa-bell-slash fa-2x mb-3"></i><br>
                    Chưa có thông báo nào
                </td>
            </tr>
        `);
        return;
    }
    
    notifications.forEach(function(notification) {
        const row = `
            <tr data-id="${notification.id_thongbao}">
                <td class="font-weight-bold">${notification.id_thongbao}</td>
                <td>
                    <div class="font-weight-bold text-primary">${escapeHtml(notification.tieu_de)}</div>
                    <small class="text-muted">ID Admin: ${notification.id_admin || 'N/A'}</small>
                </td>
                <td>
                    <div class="notification-content-preview">
                        ${escapeHtml(truncateText(notification.noi_dung, 100))}
                    </div>
                </td>
                <td>
                    <span class="font-weight-bold">${formatDateTime(notification.ngay_gui)}</span><br>
                    <small class="text-muted">${getTimeAgo(notification.ngay_gui)}</small>
                </td>
                <td>
                    <span class="badge badge-success">Đã gửi</span>
                </td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-info btn-sm" onclick="viewNotification(${notification.id_thongbao})" title="Xem chi tiết">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-warning btn-sm" onclick="editNotification(${notification.id_thongbao})" title="Chỉnh sửa">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deleteNotification(${notification.id_thongbao})" title="Xóa">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
        tableBody.append(row);
    });
    
    // Initialize DataTable if not already initialized
    if (!$.fn.DataTable.isDataTable('#notificationsTable')) {
        $('#notificationsTable').DataTable({
            language: {
                url: 'https://cdn.datatables.net/plug-ins/1.11.5/i18n/vi.json'
            },
            pageLength: 10,
            order: [[0, 'desc']],
            columnDefs: [
                { orderable: false, targets: -1 }
            ]
        });
    } else {
        $('#notificationsTable').DataTable().destroy();
        $('#notificationsTable').DataTable({
            language: {
                url: 'https://cdn.datatables.net/plug-ins/1.11.5/i18n/vi.json'
            },
            pageLength: 10,
            order: [[0, 'desc']],
            columnDefs: [
                { orderable: false, targets: -1 }
            ]
        });
    }
}

/**
 * Save new notification
 */
function saveNotification() {
    const title = $('#notificationTitle').val().trim();
    const content = $('#notificationContent').val().trim();
    const priority = $('#notificationPriority').val();
    const type = $('#notificationType').val();
    const sendImmediately = $('#sendImmediately').is(':checked');
    
    // Validation
    if (!title || !content) {
        showError('Vui lòng điền đầy đủ tiêu đề và nội dung thông báo.');
        return;
    }
    
    if (title.length > 200) {
        showError('Tiêu đề không được vượt quá 200 ký tự.');
        return;
    }
    
    // Show loading
    const saveBtn = $('#addNotificationModal .btn-notification');
    const originalText = saveBtn.html();
    saveBtn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin mr-1"></i>Đang lưu...');
    
    $.ajax({
        url: '../api/thong_bao.php?action=add',
        method: 'POST',
        data: {
            id_admin: 1, // This should come from session
            tieu_de: title,
            noi_dung: content,
            priority: priority,
            type: type,
            send_immediately: sendImmediately ? 1 : 0
        },
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                showSuccess('Thông báo đã được tạo thành công!');
                $('#addNotificationModal').modal('hide');
                resetAddForm();
                loadNotifications();
                loadNotificationStats();
            } else {
                showError('Lỗi tạo thông báo: ' + response.message);
            }
        },
        error: function(xhr, status, error) {
            console.error('Save notification error:', error);
            showError('Lỗi kết nối. Vui lòng thử lại sau.');
        },
        complete: function() {
            saveBtn.prop('disabled', false).html(originalText);
        }
    });
}

/**
 * View notification details
 */
function viewNotification(id) {
    $.ajax({
        url: '../api/thong_bao.php?action=get_by_id&id_thongbao=' + id,
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                const notification = response.data;
                Swal.fire({
                    title: escapeHtml(notification.tieu_de),
                    html: `
                        <div class="text-left">
                            <p><strong>Nội dung:</strong></p>
                            <div class="p-3 bg-light rounded">${escapeHtml(notification.noi_dung)}</div>
                            <hr>
                            <p><strong>Ngày gửi:</strong> ${formatDateTime(notification.ngay_gui)}</p>
                            <p><strong>Admin ID:</strong> ${notification.id_admin}</p>
                        </div>
                    `,
                    icon: 'info',
                    confirmButtonColor: '#e91e63',
                    confirmButtonText: 'Đóng',
                    width: 600
                });
            } else {
                showError('Không thể tải chi tiết thông báo.');
            }
        },
        error: function() {
            showError('Lỗi kết nối khi tải chi tiết thông báo.');
        }
    });
}

/**
 * Edit notification
 */
function editNotification(id) {
    $.ajax({
        url: '../api/thong_bao.php?action=get_by_id&id_thongbao=' + id,
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                const notification = response.data;
                $('#editNotificationId').val(notification.id_thongbao);
                $('#editNotificationTitle').val(notification.tieu_de);
                $('#editNotificationContent').val(notification.noi_dung);
                $('#editNotificationModal').modal('show');
            } else {
                showError('Không thể tải thông tin thông báo để chỉnh sửa.');
            }
        },
        error: function() {
            showError('Lỗi kết nối khi tải thông tin thông báo.');
        }
    });
}

/**
 * Update notification
 */
function updateNotification() {
    const id = $('#editNotificationId').val();
    const title = $('#editNotificationTitle').val().trim();
    const content = $('#editNotificationContent').val().trim();
    
    // Validation
    if (!title || !content) {
        showError('Vui lòng điền đầy đủ tiêu đề và nội dung thông báo.');
        return;
    }
    
    if (title.length > 200) {
        showError('Tiêu đề không được vượt quá 200 ký tự.');
        return;
    }
    
    // Show loading
    const saveBtn = $('#editNotificationModal .btn-notification');
    const originalText = saveBtn.html();
    saveBtn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin mr-1"></i>Đang cập nhật...');
    
    $.ajax({
        url: '../api/thong_bao.php?action=update',
        method: 'POST',
        data: {
            id_thongbao: id,
            tieu_de: title,
            noi_dung: content
        },
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                showSuccess('Thông báo đã được cập nhật thành công!');
                $('#editNotificationModal').modal('hide');
                loadNotifications();
            } else {
                showError('Lỗi cập nhật thông báo: ' + response.message);
            }
        },
        error: function(xhr, status, error) {
            console.error('Update notification error:', error);
            showError('Lỗi kết nối. Vui lòng thử lại sau.');
        },
        complete: function() {
            saveBtn.prop('disabled', false).html(originalText);
        }
    });
}

/**
 * Delete notification
 */
function deleteNotification(id) {
    Swal.fire({
        title: 'Xác nhận xóa',
        text: 'Bạn có chắc chắn muốn xóa thông báo này không?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy'
    }).then((result) => {
        if (result.isConfirmed) {
            performDelete(id);
        }
    });
}

/**
 * Perform delete notification
 */
function performDelete(id) {
    $.ajax({
        url: '../api/thong_bao.php?action=delete',
        method: 'POST',
        data: {
            id_thongbao: id
        },
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                showSuccess('Thông báo đã được xóa thành công!');
                loadNotifications();
                loadNotificationStats();
            } else {
                showError('Lỗi xóa thông báo: ' + response.message);
            }
        },
        error: function(xhr, status, error) {
            console.error('Delete notification error:', error);
            showError('Lỗi kết nối. Vui lòng thử lại sau.');
        }
    });
}

/**
 * Refresh notifications
 */
function refreshNotifications() {
    const refreshBtn = $('button[onclick="refreshNotifications()"]');
    const originalHtml = refreshBtn.html();
    
    refreshBtn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin mr-1"></i>Đang tải...');
    
    loadNotifications();
    loadNotificationStats();
    
    setTimeout(function() {
        refreshBtn.prop('disabled', false).html(originalHtml);
        showSuccess('Dữ liệu đã được làm mới!');
    }, 1000);
}

/**
 * Reset add form
 */
function resetAddForm() {
    $('#addNotificationForm')[0].reset();
    $('.character-counter').remove();
    $('#notificationPriority').val('medium');
    $('#notificationType').val('system');
    $('#sendImmediately').prop('checked', true);
}

/**
 * Filter notifications by search term
 */
function filterNotifications(searchTerm) {
    const table = $('#notificationsTable').DataTable();
    table.search(searchTerm).draw();
}

/**
 * Filter notifications by priority
 */
function filterNotificationsByPriority(priority) {
    const table = $('#notificationsTable').DataTable();
    if (priority === '') {
        table.column(4).search('').draw();
    } else {
        table.column(4).search(priority).draw();
    }
}

/**
 * Show/hide table loading
 */
function showTableLoading(show) {
    if (show) {
        $('#tableLoading').show();
    } else {
        $('#tableLoading').hide();
    }
}

/**
 * Utility functions
 */

// Format date time
function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN');
}

// Get time ago
function getTimeAgo(dateString) {
    if (!dateString) return '';
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Vài giây trước';
    if (diffInSeconds < 3600) return Math.floor(diffInSeconds / 60) + ' phút trước';
    if (diffInSeconds < 86400) return Math.floor(diffInSeconds / 3600) + ' giờ trước';
    return Math.floor(diffInSeconds / 86400) + ' ngày trước';
}

// Truncate text
function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show success message
function showSuccess(message) {
    Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: message,
        confirmButtonColor: '#28a745',
        timer: 3000,
        timerProgressBar: true
    });
}

// Show error message
function showError(message) {
    Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: message,
        confirmButtonColor: '#dc3545'
    });
}

// Show info message
function showInfo(message) {
    Swal.fire({
        icon: 'info',
        title: 'Thông tin',
        text: message,
        confirmButtonColor: '#17a2b8'
    });
}

/**
 * Modal event handlers
 */
$(document).ready(function() {
    // Reset form when modal is hidden
    $('#addNotificationModal').on('hidden.bs.modal', function() {
        resetAddForm();
    });
    
    // Focus on title when modal is shown
    $('#addNotificationModal').on('shown.bs.modal', function() {
        $('#notificationTitle').focus();
    });
    
    $('#editNotificationModal').on('shown.bs.modal', function() {
        $('#editNotificationTitle').focus();
    });
});

console.log('NHAFLOWER Notifications Management loaded successfully!');
