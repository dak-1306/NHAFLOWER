/**
 * NHAFLOWER - Global Notification System
 * File: notification-system.js
 * Provides unified notification handling across the application
 */

class NHAFLOWERNotificationSystem {
    constructor(options = {}) {
        this.options = {
            autoRefresh: true,
            refreshInterval: 30000, // 30 seconds
            showToasts: true,
            maxToasts: 3,
            toastDuration: 5000,
            apiEndpoint: '/api/thong_bao.php',
            ...options
        };
        
        this.notifications = [];
        this.unreadCount = 0;
        this.isAdmin = this.detectUserRole();
        this.refreshTimer = null;
        
        this.init();
    }
    
    /**
     * Initialize notification system
     */
    init() {
        console.log('🔔 NHAFLOWER Notification System initializing...');
        
        this.setupEventListeners();
        this.loadNotifications();
        
        if (this.options.autoRefresh) {
            this.startAutoRefresh();
        }
        
        // Setup visibility change handler
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.options.autoRefresh) {
                this.loadNotifications();
            }
        });
        
        console.log('✅ Notification System initialized');
    }
    
    /**
     * Detect user role (admin/user)
     */
    detectUserRole() {
        const currentPath = window.location.pathname;
        return currentPath.includes('/admin/') || currentPath.includes('admin\\');
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for custom notification events
        document.addEventListener('nhaflower:notification:new', (event) => {
            this.handleNewNotification(event.detail);
        });
        
        document.addEventListener('nhaflower:notification:read', (event) => {
            this.markAsRead(event.detail.id);
        });
        
        document.addEventListener('nhaflower:notification:refresh', () => {
            this.loadNotifications();
        });
    }
    
    /**
     * Load notifications from API
     */
    async loadNotifications() {
        try {
            const endpoint = this.isAdmin 
                ? `${this.options.apiEndpoint}?action=get_recent&limit=10`
                : `${this.options.apiEndpoint}?action=get_notifications`;
                
            const response = await fetch(endpoint);
            const data = await response.json();
            
            if (data.success) {
                this.notifications = data.data || [];
                this.updateUnreadCount();
                this.updateUI();
                
                // Trigger custom event
                document.dispatchEvent(new CustomEvent('nhaflower:notifications:loaded', {
                    detail: { notifications: this.notifications, count: this.unreadCount }
                }));
            }
        } catch (error) {
            console.error('Failed to load notifications:', error);
            this.showErrorToast('Không thể tải thông báo');
        }
    }
    
    /**
     * Send new notification (admin only)
     */
    async sendNotification(notificationData) {
        if (!this.isAdmin) {
            console.warn('Only admins can send notifications');
            return false;
        }
        
        try {
            const response = await fetch(this.options.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'add',
                    id_admin: 1, // Should come from session
                    tieu_de: notificationData.title,
                    noi_dung: notificationData.content,
                    priority: notificationData.priority || 'medium',
                    type: notificationData.type || 'system'
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showSuccessToast('Thông báo đã được gửi thành công!');
                this.loadNotifications(); // Refresh list
                return true;
            } else {
                this.showErrorToast('Lỗi gửi thông báo: ' + data.message);
                return false;
            }
        } catch (error) {
            console.error('Failed to send notification:', error);
            this.showErrorToast('Lỗi kết nối khi gửi thông báo');
            return false;
        }
    }
    
    /**
     * Mark notification as read
     */
    async markAsRead(notificationId) {
        try {
            // Update local state
            const notification = this.notifications.find(n => n.id_thongbao == notificationId);
            if (notification) {
                notification.read = true;
                this.updateUnreadCount();
                this.updateUI();
            }
            
            // Optional: Send to API if you have user-specific read tracking
            // const response = await fetch(this.options.apiEndpoint, {
            //     method: 'POST',
            //     body: new URLSearchParams({
            //         action: 'mark_as_read',
            //         id_thongbao: notificationId,
            //         user_id: this.getCurrentUserId()
            //     })
            // });
            
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    }
    
    /**
     * Delete notification (admin only)
     */
    async deleteNotification(notificationId) {
        if (!this.isAdmin) {
            console.warn('Only admins can delete notifications');
            return false;
        }
        
        try {
            const response = await fetch(this.options.apiEndpoint, {
                method: 'POST',
                body: new URLSearchParams({
                    action: 'delete',
                    id_thongbao: notificationId
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Remove from local state
                this.notifications = this.notifications.filter(n => n.id_thongbao != notificationId);
                this.updateUnreadCount();
                this.updateUI();
                
                this.showSuccessToast('Thông báo đã được xóa');
                return true;
            } else {
                this.showErrorToast('Lỗi xóa thông báo: ' + data.message);
                return false;
            }
        } catch (error) {
            console.error('Failed to delete notification:', error);
            this.showErrorToast('Lỗi kết nối khi xóa thông báo');
            return false;
        }
    }
    
    /**
     * Update unread count
     */
    updateUnreadCount() {
        this.unreadCount = this.notifications.filter(n => !n.read).length;
    }
    
    /**
     * Update UI elements
     */
    updateUI() {
        // Update notification counters
        const counters = document.querySelectorAll('.notification-counter, .badge-counter, #notificationCounter');
        counters.forEach(counter => {
            if (this.unreadCount > 0) {
                counter.textContent = this.unreadCount > 9 ? '9+' : this.unreadCount;
                counter.style.display = 'inline-block';
            } else {
                counter.style.display = 'none';
            }
        });
        
        // Update notification dropdowns
        this.updateNotificationDropdowns();
        
        // Update page title for unread notifications
        if (this.unreadCount > 0 && !document.title.includes('(')) {
            document.title = `(${this.unreadCount}) ${document.title}`;
        } else if (this.unreadCount === 0 && document.title.includes('(')) {
            document.title = document.title.replace(/^\(\d+\)\s/, '');
        }
    }
    
    /**
     * Update notification dropdown menus
     */
    updateNotificationDropdowns() {
        const dropdowns = document.querySelectorAll('.notification-dropdown, .alerts-dropdown');
        
        dropdowns.forEach(dropdown => {
            if (this.notifications.length === 0) {
                dropdown.innerHTML = `
                    <div class="dropdown-header">Thông báo</div>
                    <div class="dropdown-item text-center text-muted py-3">
                        <i class="fas fa-bell-slash mb-2"></i><br>
                        Không có thông báo nào
                    </div>
                `;
                return;
            }
            
            let html = '<div class="dropdown-header">Thông báo mới nhất</div>';
            
            this.notifications.slice(0, 5).forEach(notification => {
                const timeAgo = this.getTimeAgo(notification.ngay_gui);
                const isUnread = !notification.read;
                
                html += `
                    <div class="dropdown-item d-flex align-items-center ${isUnread ? 'bg-light' : ''}" 
                         data-notification-id="${notification.id_thongbao}">
                        <div class="icon-circle ${this.getNotificationIconClass(notification.type || 'system')}">
                            <i class="fas ${this.getNotificationIcon(notification.type || 'system')} text-white"></i>
                        </div>
                        <div class="ml-3">
                            <div class="small text-gray-500">${timeAgo}</div>
                            <div class="font-weight-bold">${this.escapeHtml(notification.tieu_de)}</div>
                            <div class="small text-truncate" style="max-width: 200px;">
                                ${this.escapeHtml(this.truncateText(notification.noi_dung, 50))}
                            </div>
                        </div>
                        ${isUnread ? '<div class="ml-auto"><span class="badge badge-primary">Mới</span></div>' : ''}
                    </div>
                `;
            });
            
            html += `
                <div class="dropdown-footer text-center">
                    <a href="${this.isAdmin ? 'notifications.html' : 'profile/notifications.html'}" 
                       class="small text-primary">Xem tất cả thông báo</a>
                </div>
            `;
            
            dropdown.innerHTML = html;
            
            // Add click handlers for dropdown items
            dropdown.querySelectorAll('.dropdown-item[data-notification-id]').forEach(item => {
                item.addEventListener('click', (e) => {
                    const notificationId = e.currentTarget.getAttribute('data-notification-id');
                    this.markAsRead(notificationId);
                });
            });
        });
    }
    
    /**
     * Handle new notification received
     */
    handleNewNotification(notification) {
        console.log('📬 New notification received:', notification);
        
        // Add to local notifications
        this.notifications.unshift(notification);
        this.updateUnreadCount();
        this.updateUI();
        
        // Show toast if enabled
        if (this.options.showToasts) {
            this.showNotificationToast(notification);
        }
        
        // Play notification sound (optional)
        this.playNotificationSound();
    }
    
    /**
     * Show notification toast
     */
    showNotificationToast(notification) {
        const toastContainer = this.getToastContainer();
        const existingToasts = toastContainer.querySelectorAll('.notification-toast');
        
        // Remove excess toasts
        if (existingToasts.length >= this.options.maxToasts) {
            existingToasts[0].remove();
        }
        
        const toast = document.createElement('div');
        toast.className = 'notification-toast alert alert-info alert-dismissible fade show';
        toast.style.cssText = `
            position: fixed;
            top: ${20 + (existingToasts.length * 70)}px;
            right: 20px;
            z-index: 9999;
            min-width: 350px;
            max-width: 400px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        toast.innerHTML = `
            <div class="d-flex align-items-start">
                <div class="icon-circle ${this.getNotificationIconClass(notification.type || 'system')} mr-3">
                    <i class="fas ${this.getNotificationIcon(notification.type || 'system')} text-white"></i>
                </div>
                <div class="flex-grow-1">
                    <div class="font-weight-bold">${this.escapeHtml(notification.tieu_de)}</div>
                    <div class="small">${this.escapeHtml(this.truncateText(notification.noi_dung, 80))}</div>
                </div>
            </div>
            <button type="button" class="close" data-dismiss="alert">
                <span>&times;</span>
            </button>
        `;
        
        toastContainer.appendChild(toast);
        
        // Auto-dismiss after duration
        setTimeout(() => {
            if (toast.parentNode) {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 150);
            }
        }, this.options.toastDuration);
    }
    
    /**
     * Get or create toast container
     */
    getToastContainer() {
        let container = document.getElementById('notification-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-toast-container';
            container.style.cssText = 'position: fixed; top: 0; right: 0; z-index: 9999; pointer-events: none;';
            document.body.appendChild(container);
        }
        return container;
    }
    
    /**
     * Show success toast
     */
    showSuccessToast(message) {
        this.showToast(message, 'success');
    }
    
    /**
     * Show error toast
     */
    showErrorToast(message) {
        this.showToast(message, 'error');
    }
    
    /**
     * Show toast message
     */
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show`;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        toast.innerHTML = `
            <i class="fas ${icons[type] || icons.info} mr-2"></i>
            ${this.escapeHtml(message)}
            <button type="button" class="close" data-dismiss="alert">
                <span>&times;</span>
            </button>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 150);
            }
        }, 3000);
    }
    
    /**
     * Start auto-refresh timer
     */
    startAutoRefresh() {
        this.stopAutoRefresh(); // Clear existing timer
        
        this.refreshTimer = setInterval(() => {
            this.loadNotifications();
        }, this.options.refreshInterval);
    }
    
    /**
     * Stop auto-refresh timer
     */
    stopAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    }
    
    /**
     * Play notification sound
     */
    playNotificationSound() {
        try {
            // Create audio element for notification sound
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMeCSaUzOScXxIPYLXu5qRSEgtBoOHyumIcBhyGz+2oVRoPdsjt3o88GgwODNm0xZxKGgwNDhzJlnrRqWVJGgwNDhzGlnvPqmRJGgwNDhvGlnrPqmRKGgwNDhzGlnrRqWVJGgwNDhzJlnrRqWVJGgwNDhzJlnrRqWVJGgwNDhjKlnrRqWVJGgwNDhzJlnrQqWVJGgwNDhzJlXrRqWVJGgwNDhzJlnrRqWVJGgwNDhzJlnrRqWVJGgwN');
            audio.volume = 0.3;
            audio.play().catch(() => {
                // Ignore play errors (user hasn't interacted yet)
            });
        } catch (error) {
            // Ignore audio errors
        }
    }
    
    /**
     * Utility functions
     */
    getTimeAgo(dateString) {
        if (!dateString) return '';
        const now = new Date();
        const date = new Date(dateString);
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Vài giây trước';
        if (diffInSeconds < 3600) return Math.floor(diffInSeconds / 60) + ' phút trước';
        if (diffInSeconds < 86400) return Math.floor(diffInSeconds / 3600) + ' giờ trước';
        return Math.floor(diffInSeconds / 86400) + ' ngày trước';
    }
    
    getNotificationIcon(type) {
        const icons = {
            'system': 'fa-info-circle',
            'order': 'fa-shopping-cart',
            'promotion': 'fa-gift',
            'product': 'fa-leaf',
            'delivery': 'fa-truck',
            'user': 'fa-user',
            'payment': 'fa-credit-card'
        };
        return icons[type] || 'fa-bell';
    }
    
    getNotificationIconClass(type) {
        const classes = {
            'system': 'bg-info',
            'order': 'bg-primary',
            'promotion': 'bg-success',
            'product': 'bg-warning',
            'delivery': 'bg-secondary',
            'user': 'bg-info',
            'payment': 'bg-success'
        };
        return classes[type] || 'bg-info';
    }
    
    truncateText(text, maxLength) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
    
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    getCurrentUserId() {
        // This should be implemented based on your authentication system
        const userData = localStorage.getItem('nhaflower_user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                return user.id || user.id_khachhang || 1;
            } catch (e) {
                return 1;
            }
        }
        return 1;
    }
    
    /**
     * Public API methods
     */
    
    // Get current notifications
    getNotifications() {
        return this.notifications;
    }
    
    // Get unread count
    getUnreadCount() {
        return this.unreadCount;
    }
    
    // Refresh notifications manually
    refresh() {
        return this.loadNotifications();
    }
    
    // Clear all notifications (visual only)
    clearAll() {
        this.notifications = [];
        this.unreadCount = 0;
        this.updateUI();
    }
    
    // Destroy instance
    destroy() {
        this.stopAutoRefresh();
        const container = document.getElementById('notification-toast-container');
        if (container) {
            container.remove();
        }
    }
}

// Global instance
window.NHAFLOWER_NOTIFICATIONS = null;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize global notification system
    if (!window.NHAFLOWER_NOTIFICATIONS) {
        window.NHAFLOWER_NOTIFICATIONS = new NHAFLOWERNotificationSystem({
            autoRefresh: true,
            refreshInterval: 30000,
            showToasts: true,
            maxToasts: 3,
            toastDuration: 5000
        });
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NHAFLOWERNotificationSystem;
}
