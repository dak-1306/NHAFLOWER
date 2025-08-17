/**
 * NHAFLOWER - Profile Security
 * File: profile-security.js
 * Author: NHAFLOWER Team
 * Updated: 2025-08-13
 */

class ProfileSecurity extends BaseProfileManager {
  constructor() {
    super();
    this.apiUrl = "../../api/tai_khoan.php?action=change_password"; // đường dẫn API đổi mật khẩu
    this.bindEvents();
  }

  /**
   * Gắn sự kiện khi DOM đã sẵn sàng
   */
  bindEvents() {
    $(document).ready(() => {
      $("#securityForm").on("submit", (e) => {
        e.preventDefault();
        this.handleChangePassword();
      });
    });
  }

  /**
   * Hiển thị thông báo thành công/thất bại
   */
  showAlert(message, type = "success") {
    const $alert = $("#securityAlert");
    $alert.removeClass("d-none");
    $alert.removeClass("alert-success alert-danger");
    $alert.addClass(type === "success" ? "alert-success" : "alert-danger");
    $alert.text(message);
    setTimeout(() => {
      $alert.addClass("d-none");
    }, 4000);
  }

  /**
   * Xử lý đổi mật khẩu
   */
  async handleChangePassword() {
    const oldPassword = $("#currentPassword").val()?.trim();
    const newPassword = $("#newPassword").val()?.trim();
    const confirmPassword = $("#confirmPassword").val()?.trim();

    // Validate đầu vào
    if (!oldPassword || !newPassword || !confirmPassword) {
      return this.showAlert("Vui lòng nhập đầy đủ thông tin.", "danger");
    }
    if (newPassword.length < 6) {
      return this.showAlert("Mật khẩu mới phải từ 6 ký tự trở lên.", "danger");
    }
    if (newPassword !== confirmPassword) {
      return this.showAlert("Mật khẩu xác nhận không khớp.", "danger");
    }

    // Lấy id_taikhoan từ localStorage
    const user = JSON.parse(localStorage.getItem("nhaflower_user") || "null");
    const id_taikhoan = user && user.id_taikhoan ? user.id_taikhoan : null;
    if (!id_taikhoan) {
      return this.showAlert("Không tìm thấy thông tin tài khoản.", "danger");
    }

    try {
      this.setLoading(true);
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_taikhoan: id_taikhoan,
          old_password: oldPassword,
          new_password: newPassword,
        }),
      });
      const result = await response.json();
      if (result.success) {
        this.showAlert("Đổi mật khẩu thành công!", "success");
        $("#securityForm")[0].reset();
      } else {
        this.showAlert(result.message || "Đổi mật khẩu thất bại.", "danger");
      }
    } catch (error) {
      console.error("Lỗi đổi mật khẩu:", error);
      this.showAlert("Không thể kết nối tới máy chủ.", "danger");
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

// Đảm bảo hàm logout() luôn gọi đúng hàm logout của BaseProfileManager
function logout() {
  new BaseProfileManager().logout();
}

// Khởi tạo
const profileSecurity = new ProfileSecurity();
