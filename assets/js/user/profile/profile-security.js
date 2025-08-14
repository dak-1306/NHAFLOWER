/**
 * NHAFLOWER - Profile Security
 * File: profile-security.js
 * Author: NHAFLOWER Team
 * Updated: 2025-08-13
 */

class ProfileSecurity extends BaseProfileManager {
  constructor() {
    super();
    this.apiUrl = "../../api/user/security.php"; // đường dẫn API đổi mật khẩu
    this.bindEvents();
  }

  /**
   * Gắn sự kiện khi DOM đã sẵn sàng
   */
  bindEvents() {
    $(document).ready(() => {
      $("#changePasswordForm").on("submit", (e) => {
        e.preventDefault();
        this.handleChangePassword();
      });
    });
  }

  /**
   * Xử lý đổi mật khẩu
   */
  async handleChangePassword() {
    const oldPassword = $("#oldPassword").val()?.trim();
    const newPassword = $("#newPassword").val()?.trim();
    const confirmPassword = $("#confirmPassword").val()?.trim();

    // Validate đầu vào
    if (!oldPassword || !newPassword || !confirmPassword) {
      return this.showErrorMessage("Vui lòng nhập đầy đủ thông tin.");
    }
    if (newPassword.length < 6) {
      return this.showErrorMessage("Mật khẩu mới phải từ 6 ký tự trở lên.");
    }
    if (newPassword !== confirmPassword) {
      return this.showErrorMessage("Mật khẩu xác nhận không khớp.");
    }

    try {
      this.setLoading(true);

      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: this.getCurrentUser(),
          old_password: oldPassword,
          new_password: newPassword,
        }),
      });

      const result = await response.json();

      if (result.success) {
        this.showSuccessMessage("Đổi mật khẩu thành công.");
        $("#changePasswordForm")[0].reset();
      } else {
        this.showErrorMessage(result.message || "Đổi mật khẩu thất bại.");
      }
    } catch (error) {
      console.error("Lỗi đổi mật khẩu:", error);
      this.showErrorMessage("Không thể kết nối tới máy chủ.");
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Hiển thị trạng thái loading
   */
  setLoading(isLoading) {
    const btn = $("#changePasswordBtn");
    if (isLoading) {
      btn
        .prop("disabled", true)
        .html(`<i class="fas fa-spinner fa-spin"></i> Đang xử lý...`);
    } else {
      btn.prop("disabled", false).text("Đổi mật khẩu");
    }
  }
}

// Khởi tạo
const profileSecurity = new ProfileSecurity();
