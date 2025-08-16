/**
 * NHAFLOWER - Profile Dashboard
 * File: profile-dashboard.js
 * Author: NHAFLOWER Team
 * Updated: 2025-08-13
 */

class ProfileDashboard extends BaseProfileManager {
  /**
   * Lấy số lượng thông báo và cập nhật dashboard
   */
  async loadDashboardNotifications() {
    try {
      const res = await fetch(
        "../../api/thong_bao.php?action=get_notifications",
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await res.json();
      const count =
        data && data.success && Array.isArray(data.data) ? data.data.length : 0;
      $("#totalNotifications").text(count);
    } catch (err) {
      $("#totalNotifications").text(0);
    }
  }
  constructor() {
    super();
    this.apiProfile = "../../api/khach_hang.php?action=get_by_taikhoan";
    this.apiOrders = "../../api/don_hang.php?action=get_by_customer";
    this.init();
  }

  /**
   * Tính thống kê từ danh sách đơn hàng
   */
  calculateStats(orders) {
    const stats = {
      total_orders: orders.length,
      pending_orders: 0,
      completed_orders: 0,
      cancelled_orders: 0,
    };
    orders.forEach((order) => {
      switch (order.trang_thai) {
        case "pending":
        case "chờ xác nhận":
        case "0":
          stats.pending_orders++;
          break;
        case "completed":
        case "đã giao":
        case "1":
          stats.completed_orders++;
          break;
        case "cancelled":
        case "đã hủy":
        case "2":
          stats.cancelled_orders++;
          break;
        default:
          break;
      }
    });
    return stats;
  }

  /**
   * Khởi tạo dashboard
   */
  init() {
    $(document).ready(() => {
      if (!this.checkLogin()) return;

      console.log("Profile Dashboard initialized");

      this.loadUserData();
      this.loadRecentOrders();
      this.loadDashboardNotifications();
    });
  }

  /**
   * Lấy dữ liệu người dùng từ API
   */
  async loadUserData() {
    try {
      // Lấy id_khachhang và email từ localStorage
      const user = JSON.parse(localStorage.getItem("nhaflower_user"));
      if (!user || !user.id_khachhang) {
        this.showErrorMessage("Không tìm thấy thông tin khách hàng.");
        return;
      }
      const res = await fetch(
        `../../api/khach_hang.php?action=get_by_id&id=${user.id_khachhang}`
      );
      const data = await res.json();
      if (data.success && data.data) {
        // Luôn ưu tiên email từ localStorage
        const userData = { ...data.data, email: user.email };
        this.updateSidebarInfo(userData);
      } else {
        this.showErrorMessage(
          data.message || "Không thể tải thông tin khách hàng."
        );
      }
    } catch (error) {
      console.error("Lỗi loadUserData:", error);
      this.showErrorMessage("Không thể kết nối máy chủ.");
    }
  }

  /**
   * Lấy thống kê dashboard
   */
  async loadDashboardStats() {
    // Không dùng API riêng, sẽ tính thống kê từ danh sách đơn hàng trong loadRecentOrders
  }

  /**
   * Lấy đơn hàng gần đây
   */
  async loadRecentOrders() {
    try {
      // Lấy id_khachhang từ localStorage
      const user = JSON.parse(localStorage.getItem("nhaflower_user"));
      if (!user || !user.id_khachhang) {
        this.showErrorMessage("Không tìm thấy thông tin khách hàng.");
        return;
      }
      // Gọi API lấy đơn hàng đúng chuẩn mới
      const resOrders = await fetch(
        `../../api/orders.php?customer_id=${user.id_khachhang}`
      );
      const dataOrders = await resOrders.json();
      if (dataOrders.success && Array.isArray(dataOrders.data)) {
        this.renderOrders(dataOrders.data);
        // Tính thống kê từ đơn hàng
        this.renderStats(this.calculateStats(dataOrders.data));
      } else {
        this.renderOrders([]);
        this.renderStats({});
      }
    } catch (error) {
      console.error("Lỗi loadRecentOrders:", error);
      this.showErrorMessage("Không thể tải đơn hàng.");
    }
  }

  /**
   * Tính thống kê từ danh sách đơn hàng
   */
  calculateStats(orders) {
    const stats = {
      total_orders: orders.length,
      pending_orders: 0,
      completed_orders: 0,
      cancelled_orders: 0,
    };
    orders.forEach((order) => {
      switch (order.trang_thai) {
        case "pending":
        case "chờ xác nhận":
        case "0":
          stats.pending_orders++;
          break;
        case "completed":
        case "đã giao":
        case "1":
          stats.completed_orders++;
          break;
        case "cancelled":
        case "đã hủy":
        case "2":
          stats.cancelled_orders++;
          break;
        default:
          break;
      }
    });
    return stats;
  }

  /**
   * Render thống kê ra UI
   */
  renderStats(stats) {
    $("#totalOrders").text(stats.total_orders || 0);
    $("#pendingOrders").text(stats.pending_orders || 0);
    $("#completedOrders").text(stats.completed_orders || 0);
    $("#cancelledOrders").text(stats.cancelled_orders || 0);
  }

  /**
   * Render danh sách đơn hàng gần đây
   */
  renderOrders(orders) {
    const list = $("#recentOrders");
    list.empty();

    if (!orders.length) {
      list.html(`<div class="empty-state">Không có đơn hàng gần đây.</div>`);
      return;
    }

    orders.forEach((order) => {
      list.append(`
        <div class="order-item">
          <div><strong>Mã đơn:</strong> ${order.id_donhang}</div>
          <div><strong>Ngày:</strong> ${this.formatDate(order.ngay_dat)}</div>
          <div><strong>Trạng thái:</strong> ${order.trang_thai}</div>
          <div><strong>Tổng tiền:</strong> ${this.formatPrice(
            order.tong_tien
          )}</div>
        </div>
      `);
    });
  }
}

// Khởi tạo dashboard
const profileDashboard = new ProfileDashboard();

/**
 * Hàm đổi avatar (tạm thời)
 */
function changeAvatar() {
  alert("Tính năng thay đổi avatar đang được phát triển");
}
// Đảm bảo hàm logout() luôn gọi đúng hàm logout của BaseProfileManager
function logout() {
  new BaseProfileManager().logout();
}
