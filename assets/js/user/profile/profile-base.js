/**
 * NHAFLOWER - Base Profile Manager
 * File: profile-base.js
 * Author: NHAFLOWER Team
 * Updated: 2025-08-13
 */

class BaseProfileManager {
  constructor() {
    this.currentUserId = null;
  }

  /**
   * Lấy thông tin người dùng hiện tại từ localStorage
   * @returns {number|null} User ID hoặc null nếu chưa đăng nhập
   */
  getCurrentUser() {
    try {
      const userData = JSON.parse(
        localStorage.getItem("nhaflower_user") || "null"
      );
      if (userData && userData.id_taikhoan) {
        this.currentUserId = userData.id_taikhoan;
        return this.currentUserId;
      }
      console.warn("Không tìm thấy ID người dùng, dùng mặc định (demo).");
      this.currentUserId = 1; // fallback demo
      return this.currentUserId;
    } catch (e) {
      console.error("Lỗi khi lấy thông tin người dùng:", e);
      return null;
    }
  }

  /**
   * Cập nhật thông tin user ở sidebar
   * @param {Object} userData
   */
  updateSidebarInfo(userData) {
    const name = userData?.ten || userData?.email || "Người dùng NHAFLOWER";
    const email = userData?.email || "user@nhaflower.com";
    $("#profileName").text(this.escapeHTML(name));
    $("#profileEmail").text(this.escapeHTML(email));
    $("#profileAvatar").attr(
      "src",
      userData?.avatar || "../../assets/img/user/default-avatar.png"
    );
  }

  /**
   * Hiển thị thông báo thành công (auto ẩn sau 5 giây)
   */
  showSuccessMessage(message) {
    this.showAlert(message, "success", true);
  }

  /**
   * Hiển thị thông báo lỗi
   */
  showErrorMessage(message) {
    this.showAlert(message, "danger", false);
  }

  /**
   * Hàm chung để hiển thị alert
   */
  showAlert(message, type = "info", autoDismiss = false) {
    const alertHTML = `
      <div class="alert alert-${type} alert-dismissible fade show" role="alert">
        <i class="fas fa-${
          type === "success"
            ? "check-circle"
            : type === "danger"
            ? "exclamation-circle"
            : "info-circle"
        }"></i> ${this.escapeHTML(message)}
        <button type="button" class="close" data-dismiss="alert"><span>&times;</span></button>
      </div>
    `;
    $(".container-fluid, .card-body").first().prepend(alertHTML);
    if (autoDismiss) {
      setTimeout(() => $(".alert").alert("close"), 5000);
    }
  }

  /**
   * Hiển thị thông báo nổi góc màn hình
   */
  showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `alert alert-${
      type === "error" ? "danger" : type
    } alert-dismissible fade show position-fixed`;
    notification.style.cssText =
      "top:20px; right:20px; z-index:9999; min-width:300px;";
    notification.innerHTML = `
      ${this.escapeHTML(message)}
      <button type="button" class="close" data-dismiss="alert"><span>&times;</span></button>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
  }

  /**
   * Định dạng giá VNĐ
   */
  formatPrice(price) {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price || 0);
  }

  /**
   * Định dạng ngày giờ
   */
  formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  /**
   * Lấy text trạng thái đơn hàng
   */
  getStatusText(status) {
    const map = {
      cho: "Chờ xử lý",
      dang_giao: "Đang giao",
      hoan_tat: "Hoàn tất",
      huy: "Đã hủy",
    };
    return map[status] || status || "";
  }

  /**
   * Lấy icon thông báo
   */
  getNotificationIcon(type) {
    const map = {
      order: "fa-shopping-bag",
      promotion: "fa-gift",
      system: "fa-info-circle",
      delivery: "fa-truck",
    };
    return map[type] || "fa-bell";
  }

  /**
   * Logout (dùng chung)
   */
  logout() {
    if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      [
        "nhaflower_user",
        "user_token",
        "user_data",
        "pending_search",
        "nhaflower_cart",
      ].forEach((key) => localStorage.removeItem(key));
      window.location.href = "../login.html";
    }
  }

  /**
   * Kiểm tra đăng nhập
   */
  checkLogin() {
    const token = localStorage.getItem("user_token");
    if (!token) {
      window.location.href = "../login.html";
      return false;
    }
    return true;
  }

  /**
   * Escape HTML để tránh XSS
   */
  escapeHTML(str) {
    return String(str).replace(
      /[&<>"']/g,
      (match) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;",
        }[match])
    );
  }
}
