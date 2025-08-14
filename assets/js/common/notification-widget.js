/**
 * NHAFLOWER - Notification Widget
 * Embeddable notification dropdown for any page
 */

class NotificationWidget {
    constructor(element, options = {}) {
        this.element = typeof element === 'string' ? document.querySelector(element) : element;
        this.options = {
            showCounter: true,
            maxItems: 5,
            autoUpdate: true,
            updateInterval: 30000,
            showTimestamps: true,
            enableMarkAsRead: true,
            ...options
        };
        
        this.notifications = [];
        this.unreadCount = 0;
        this.isOpen = false;
        
        if (this.element) {
            this.init();
        }
    }
    
    init() {
        this.createHTML();
        this.attachEventListeners();
        this.loadNotifications();
        
        if (this.options.autoUpdate) {
            this.startAutoUpdate();
        }
    }
    
    createHTML() {
        this.element.innerHTML = `
            <div class="notification-widget">
                <div class="notification-trigger" role="button" aria-haspopup="true">
                    <i class="fas fa-bell"></i>
                    <span class="notification-badge" style="display: none;">0</span>
                </div>
                <div class="notification-dropdown" style="display: none;">
                    <div class="notification-header">
                        <h6>Thông báo</h6>
                        <button class="btn-close" type="button" aria-label="Đóng">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="notification-list">
                        <div class="notification-loading">
                            <i class="fas fa-spinner fa-spin"></i>
                            <span>Đang tải...</span>
                        </div>
                    </div>
                    <div class="notification-footer">
                        <a href="#" class="view-all-link">Xem tất cả</a>
                    </div>
                </div>
            </div>
        `;
        
        this.addStyles();
    }
    
    addStyles() {
        if (document.getElementById('notification-widget-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'notification-widget-styles';
        styles.textContent = `
            .notification-widget {
                position: relative;
                display: inline-block;
            }
            
            .notification-trigger {
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: #f8f9fa;
                color: #6c757d;
                cursor: pointer;
                transition: all 0.2s ease;
                border: none;
            }
            
            .notification-trigger:hover {
                background: #e9ecef;
                color: #495057;
            }
            
            .notification-trigger.has-notifications {
                color: #e91e63;
            }
            
            .notification-badge {
                position: absolute;
                top: -2px;
                right: -2px;
                min-width: 18px;
                height: 18px;
                border-radius: 9px;
                background: #dc3545;
                color: white;
                font-size: 11px;
                font-weight: 600;
                display: flex;
                align-items: center;
                justify-content: center;
                line-height: 1;
                animation: pulse 1s ease-in-out;
            }
            
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }
            
            .notification-dropdown {
                position: absolute;
                top: 100%;
                right: 0;
                width: 350px;
                max-height: 400px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                border: 1px solid #e3e6f0;
                z-index: 1000;
                overflow: hidden;
                margin-top: 8px;
            }
            
            .notification-dropdown::before {
                content: '';
                position: absolute;
                top: -6px;
                right: 12px;
                width: 12px;
                height: 12px;
                background: white;
                border: 1px solid #e3e6f0;
                border-bottom: none;
                border-right: none;
                transform: rotate(45deg);
            }
            
            .notification-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 12px 16px;
                border-bottom: 1px solid #e3e6f0;
                background: #f8f9fa;
            }
            
            .notification-header h6 {
                margin: 0;
                font-size: 14px;
                font-weight: 600;
                color: #495057;
            }
            
            .btn-close {
                background: none;
                border: none;
                color: #6c757d;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                transition: all 0.2s ease;
            }
            
            .btn-close:hover {
                background: #e9ecef;
                color: #495057;
            }
            
            .notification-list {
                max-height: 300px;
                overflow-y: auto;
            }
            
            .notification-loading,
            .notification-empty {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 32px 16px;
                color: #6c757d;
                text-align: center;
            }
            
            .notification-loading i {
                font-size: 24px;
                margin-bottom: 8px;
            }
            
            .notification-empty i {
                font-size: 32px;
                margin-bottom: 12px;
                opacity: 0.5;
            }
            
            .notification-item {
                display: flex;
                padding: 12px 16px;
                border-bottom: 1px solid #f1f3f4;
                cursor: pointer;
                transition: all 0.2s ease;
                position: relative;
            }
            
            .notification-item:hover {
                background: #f8f9fa;
            }
            
            .notification-item.unread {
                background: linear-gradient(90deg, #fff 0%, #fef7f7 100%);
                border-left: 3px solid #e91e63;
            }
            
            .notification-item.unread::after {
                content: '';
                position: absolute;
                right: 12px;
                top: 16px;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #e91e63;
            }
            
            .notification-icon {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 14px;
                margin-right: 12px;
                flex-shrink: 0;
            }
            
            .notification-icon.bg-info { background: #17a2b8; }
            .notification-icon.bg-success { background: #28a745; }
            .notification-icon.bg-warning { background: #ffc107; color: #856404; }
            .notification-icon.bg-danger { background: #dc3545; }
            .notification-icon.bg-primary { background: #007bff; }
            
            .notification-content {
                flex: 1;
                min-width: 0;
            }
            
            .notification-title {
                font-size: 13px;
                font-weight: 600;
                color: #2c3e50;
                margin-bottom: 4px;
                line-height: 1.3;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }
            
            .notification-text {
                font-size: 12px;
                color: #6c757d;
                line-height: 1.4;
                margin-bottom: 4px;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }
            
            .notification-time {
                font-size: 11px;
                color: #adb5bd;
            }
            
            .notification-footer {
                padding: 12px 16px;
                border-top: 1px solid #e3e6f0;
                background: #f8f9fa;
                text-align: center;
            }
            
            .view-all-link {
                color: #e91e63;
                text-decoration: none;
                font-size: 13px;
                font-weight: 600;
                transition: all 0.2s ease;
            }
            
            .view-all-link:hover {
                color: #ad1457;
                text-decoration: none;
            }
            
            /* Scrollbar styles */
            .notification-list::-webkit-scrollbar {
                width: 4px;
            }
            
            .notification-list::-webkit-scrollbar-track {
                background: #f1f1f1;
            }
            
            .notification-list::-webkit-scrollbar-thumb {
                background: #c1c1c1;
                border-radius: 2px;
            }
            
            .notification-list::-webkit-scrollbar-thumb:hover {
                background: #a1a1a1;
            }
        `;
        
        document.head.appendChild(styles);
    }
    
    attachEventListeners() {
        const trigger = this.element.querySelector('.notification-trigger');
        const dropdown = this.element.querySelector('.notification-dropdown');
        const closeBtn = this.element.querySelector('.btn-close');
        const viewAllLink = this.element.querySelector('.view-all-link');
        
        // Toggle dropdown
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown();
        });
        
        // Close dropdown
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeDropdown();
        });
        
        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!this.element.contains(e.target)) {
                this.closeDropdown();
            }
        });
        
        // View all link
        viewAllLink.addEventListener('click', (e) => {
            e.preventDefault();
            const currentPath = window.location.pathname;
            const isAdmin = currentPath.includes('/admin/') || currentPath.includes('admin\\');
            
            if (isAdmin) {
                window.location.href = 'notifications.html';
            } else {
                window.location.href = 'profile/notifications.html';
            }
        });
        
        // Prevent dropdown close when clicking inside
        dropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
    
    async loadNotifications() {
        const listElement = this.element.querySelector('.notification-list');
        
        try {
            const response = await fetch('/api/thong_bao.php?action=get_recent&limit=' + this.options.maxItems);
            const data = await response.json();
            
            if (data.success && data.data) {
                this.notifications = data.data;
                this.updateUnreadCount();
                this.renderNotifications();
            } else {
                this.showEmpty();
            }
        } catch (error) {
            console.error('Failed to load notifications:', error);
            this.showError();
        }
    }
    
    updateUnreadCount() {
        this.unreadCount = this.notifications.filter(n => !n.read).length;
        
        const badge = this.element.querySelector('.notification-badge');
        const trigger = this.element.querySelector('.notification-trigger');
        
        if (this.unreadCount > 0) {
            badge.textContent = this.unreadCount > 9 ? '9+' : this.unreadCount;
            badge.style.display = 'flex';
            trigger.classList.add('has-notifications');
        } else {
            badge.style.display = 'none';
            trigger.classList.remove('has-notifications');
        }
    }
    
    renderNotifications() {
        const listElement = this.element.querySelector('.notification-list');
        
        if (this.notifications.length === 0) {
            this.showEmpty();
            return;
        }
        
        const html = this.notifications.map(notification => {
            const icon = this.getNotificationIcon(notification.type || 'system');
            const iconClass = this.getNotificationIconClass(notification.type || 'system');
            const timeAgo = this.getTimeAgo(notification.ngay_gui);
            const isUnread = !notification.read;
            
            return `
                <div class="notification-item ${isUnread ? 'unread' : ''}" data-id="${notification.id_thongbao}">
                    <div class="notification-icon ${iconClass}">
                        <i class="fas ${icon}"></i>
                    </div>
                    <div class="notification-content">
                        <div class="notification-title">${this.escapeHtml(notification.tieu_de)}</div>
                        <div class="notification-text">${this.escapeHtml(this.truncateText(notification.noi_dung, 80))}</div>
                        ${this.options.showTimestamps ? `<div class="notification-time">${timeAgo}</div>` : ''}
                    </div>
                </div>
            `;
        }).join('');
        
        listElement.innerHTML = html;
        
        // Add click handlers
        if (this.options.enableMarkAsRead) {
            listElement.querySelectorAll('.notification-item').forEach(item => {
                item.addEventListener('click', () => {
                    const id = item.getAttribute('data-id');
                    this.markAsRead(id);
                    item.classList.remove('unread');
                    this.updateUnreadCount();
                });
            });
        }
    }
    
    showEmpty() {
        const listElement = this.element.querySelector('.notification-list');
        listElement.innerHTML = `
            <div class="notification-empty">
                <i class="fas fa-bell-slash"></i>
                <div>Không có thông báo nào</div>
            </div>
        `;
    }
    
    showError() {
        const listElement = this.element.querySelector('.notification-list');
        listElement.innerHTML = `
            <div class="notification-empty">
                <i class="fas fa-exclamation-triangle"></i>
                <div>Không thể tải thông báo</div>
                <button onclick="this.parentElement.parentElement.parentElement.__widget__.loadNotifications()" 
                        style="margin-top: 8px; padding: 4px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f8f9fa; cursor: pointer;">
                    Thử lại
                </button>
            </div>
        `;
        
        // Store widget reference for retry button
        listElement.parentElement.parentElement.__widget__ = this;
    }
    
    toggleDropdown() {
        const dropdown = this.element.querySelector('.notification-dropdown');
        
        if (this.isOpen) {
            this.closeDropdown();
        } else {
            this.openDropdown();
        }
    }
    
    openDropdown() {
        const dropdown = this.element.querySelector('.notification-dropdown');
        dropdown.style.display = 'block';
        this.isOpen = true;
        
        // Load fresh data when opening
        this.loadNotifications();
    }
    
    closeDropdown() {
        const dropdown = this.element.querySelector('.notification-dropdown');
        dropdown.style.display = 'none';
        this.isOpen = false;
    }
    
    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id_thongbao == notificationId);
        if (notification) {
            notification.read = true;
        }
        
        // Trigger global notification system update if available
        if (window.NHAFLOWER_NOTIFICATIONS) {
            window.NHAFLOWER_NOTIFICATIONS.markAsRead(notificationId);
        }
    }
    
    startAutoUpdate() {
        setInterval(() => {
            this.loadNotifications();
        }, this.options.updateInterval);
    }
    
    // Utility methods
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
    
    // Public API
    refresh() {
        return this.loadNotifications();
    }
    
    getUnreadCount() {
        return this.unreadCount;
    }
    
    destroy() {
        this.element.innerHTML = '';
    }
}

// Auto-initialize for elements with notification-widget class
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.notification-widget-auto').forEach(element => {
        new NotificationWidget(element);
    });
});

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationWidget;
} else {
    window.NotificationWidget = NotificationWidget;
}
