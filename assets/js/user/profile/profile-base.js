/**
 * NHAFLOWER - Base Profile Manager
 * File: profile-base.js
 * Author: NHAFLOWER Team
 * Created: 2025
 */

class BaseProfileManager {
  constructor() {
    this.currentUserId = null;
  }

  /**
   * Get current user from localStorage
   * @returns {number} User ID
   */
  getCurrentUser() {
    // Try to get from localStorage first (if user logged in)
    const userData = JSON.parse(
      localStorage.getItem("nhaflower_user") || "null"
    );
    if (userData && userData.id_taikhoan) {
      this.currentUserId = userData.id_taikhoan;
      return userData.id_taikhoan;
    } else {
      // For demo purposes, use first user from database
      this.currentUserId = 1;
      return 1;
    }
  }

  /**
   * Update sidebar user info
   * @param {Object} userData - User data object
   */
  updateSidebarInfo(userData) {
    $("#profileName").text(
      userData.ten || userData.email || "Người dùng NHAFLOWER"
    );
    $("#profileEmail").text(userData.email || "");
    // Keep default avatar for now
    $("#profileAvatar").attr("src", "../../assets/img/user/default-avatar.png");
  }

  /**
   * Show success message with auto-dismiss
   * @param {string} message - Success message
   */
  showSuccessMessage(message) {
    const alert = `
      <div class="alert alert-success alert-dismissible fade show" role="alert">
        <i class="fas fa-check-circle"></i> ${message}
        <button type="button" class="close" data-dismiss="alert">
          <span>&times;</span>
        </button>
      </div>
    `;
    $(".container-fluid, .card-body").first().prepend(alert);

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      $(".alert-success").alert("close");
    }, 5000);
  }

  /**
   * Show error message
   * @param {string} message - Error message
   */
  showErrorMessage(message) {
    const alert = `
      <div class="alert alert-danger alert-dismissible fade show" role="alert">
        <i class="fas fa-exclamation-circle"></i> ${message}
        <button type="button" class="close" data-dismiss="alert">
          <span>&times;</span>
        </button>
      </div>
    `;
    $(".container-fluid, .card-body").first().prepend(alert);
  }

  /**
   * Format price to Vietnamese currency
   * @param {number} price - Price value
   * @returns {string} Formatted price
   */
  formatPrice(price) {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  }

  /**
   * Format date to Vietnamese format
   * @param {string} dateString - Date string
   * @returns {string} Formatted date
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} Is valid email
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number format (Vietnamese)
   * @param {string} phone - Phone number to validate
   * @returns {boolean} Is valid phone
   */
  isValidPhone(phone) {
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    return phoneRegex.test(phone);
  }

  /**
   * Global logout function
   */
  logout() {
    if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      localStorage.removeItem("nhaflower_user");
      localStorage.removeItem("nhaflower_cart");
      window.location.href = "../login.html";
    }
  }

  /**
   * Change avatar function
   */
  changeAvatar() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = function (e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          $("#profileAvatar").attr("src", e.target.result);
        };
        reader.readAsDataURL(file);
      }
    };

    input.click();
  }
}
