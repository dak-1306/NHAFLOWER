/**
 * NHAFLOWER - Personal Info JavaScript (refactor)
 * File: profile-personal-info.js
 * Author: NHAFLOWER Team
 * Updated: 2025-08
 */

class PersonalInfoManager extends BaseProfileManager {
  constructor() {
    super();
    this.apiBaseUrl = "../../auth/profile.php";
    this.isEditing = false;
    this.$form = null;
    this.$actions = null;
    this.$btnEdit = null;
    this.init();
  }

  init() {
    $(document).ready(() => {
      this.getCurrentUser();
      // Cập nhật sidebar từ localStorage (nhanh) — có thể thay bằng call API nếu muốn
      const userData = JSON.parse(
        localStorage.getItem("nhaflower_user") || "null"
      );
      new BaseProfileManager().updateSidebarInfo(userData);

      this.cacheDom();
      this.bindEvents();
      this.disableEditing();
      this.loadUserData();
    });
  }

  cacheDom() {
    this.$form = $("#personalInfoForm");
    this.$actions = $(".form-actions");
    this.$btnEdit = $(".card-header .btn-primary");
  }

  bindEvents() {
    this.$form.on("submit", (e) => {
      e.preventDefault();
      if (!this.isEditing) return;
      const data = this.getFormData();
      if (!this.validatePersonalInfo(data)) return;
      this.savePersonalInfo(data);
    });
    // Sử dụng event delegation cho các nút chỉnh sửa/hủy
    $(document).on("click", ".btn-edit-info", () => {
      this.enableEditing();
    });
    $(document).on("click", ".btn-cancel-edit", () => {
      this.cancelEdit();
    });
  }

  async loadUserData() {
    try {
      const res = await fetch(
        `${this.apiBaseUrl}?id_taikhoan=${this.currentUserId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      const payload = await res.json();
      if (payload && payload.success && payload.data) {
        const user = payload.data;
        this.populateForm(user);
        this.updateSidebarInfo(user);
      } else {
        this.showErrorMessage("Không thể tải thông tin người dùng.");
      }
    } catch (err) {
      console.error(err);
      this.showErrorMessage("Lỗi kết nối server");
    }
  }

  populateForm(user) {
    $("#fullName").val(user.ten || "");
    $("#email").val(user.email || "");
    $("#phone").val(user.sdt || "");
    $("#birthDate").val(user.ngay_sinh || "");
    $("#address").val(user.dia_chi || "");

    // Nếu có trong DB thì map thêm; nếu không có thì giữ mặc định UI
    if (user.gioi_tinh) $("#gender").val(user.gioi_tinh);
    if (user.nghe_nghiep) $("#occupation").val(user.nghe_nghiep);
  }

  getFormData() {
    return {
      id_taikhoan: this.currentUserId,
      ten: ($("#fullName").val() || "").trim(),
      email: ($("#email").val() || "").trim(),
      sdt: ($("#phone").val() || "").trim(),
      ngay_sinh: ($("#birthDate").val() || "").trim(),
      dia_chi: ($("#address").val() || "").trim(),
      gioi_tinh: ($("#gender").val() || "").trim(),
      nghe_nghiep: ($("#occupation").val() || "").trim(),
    };
  }

  enableEditing() {
    this.isEditing = true;
    $(
      "#personalInfoForm input, #personalInfoForm textarea, #personalInfoForm select"
    )
      .prop("readonly", false)
      .prop("disabled", false);
    this.$actions.removeClass("hidden").show();
    this.$btnEdit.html('<i class="fas fa-times"></i> Hủy');
  }

  disableEditing() {
    this.isEditing = false;
    $("#personalInfoForm input, #personalInfoForm textarea").prop(
      "readonly",
      true
    );
    $("#personalInfoForm select").prop("disabled", true);
    this.$actions.addClass("hidden").hide();
    this.$btnEdit.html('<i class="fas fa-edit"></i> Chỉnh sửa');
  }

  toggleEditing() {
    this.isEditing ? this.disableEditing() : this.enableEditing();
  }

  async savePersonalInfo(formData) {
    // Đảm bảo có id_taikhoan từ localStorage nếu chưa có
    if (!formData.id_taikhoan) {
      const user = JSON.parse(localStorage.getItem("nhaflower_user") || "null");
      if (user && user.id_taikhoan) {
        formData.id_taikhoan = user.id_taikhoan;
      }
    }
    const $btnSave = this.$actions.find(".btn-success");
    $btnSave
      .prop("disabled", true)
      .html('<i class="fas fa-spinner fa-spin"></i> Đang lưu...');
    try {
      const res = await fetch(this.apiBaseUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (result && result.success) {
        this.showSuccessMessage("Cập nhật thông tin cá nhân thành công!");
        this.disableEditing();
        // Cập nhật sidebar nhanh
        $("#profileName").text(formData.ten || "");
        $("#profileEmail").text(formData.email || "");
      } else {
        this.showErrorMessage(
          "Lỗi cập nhật: " + (result?.message || "Không xác định")
        );
      }
    } catch (err) {
      console.error(err);
      this.showErrorMessage("Lỗi kết nối server");
    } finally {
      $btnSave
        .prop("disabled", false)
        .html('<i class="fas fa-save"></i> Lưu thay đổi');
    }
  }

  validatePersonalInfo(data) {
    if (!data.ten) {
      this.showErrorMessage("Vui lòng nhập họ và tên");
      return false;
    }
    if (!data.email) {
      this.showErrorMessage("Vui lòng nhập email");
      return false;
    }
    if (!this.isValidEmail(data.email)) {
      this.showErrorMessage("Email không hợp lệ");
      return false;
    }
    if (!data.sdt) {
      this.showErrorMessage("Vui lòng nhập số điện thoại");
      return false;
    }
    if (!this.isValidPhone(data.sdt)) {
      this.showErrorMessage("Số điện thoại không đúng định dạng");
      return false;
    }
    return true;
  }

  isValidEmail(email) {
    // Regex email nhẹ nhàng, đủ dùng
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  isValidPhone(phone) {
    // VN (10–11 số), chấp nhận 0, +84
    return /^(?:\+?84|0)(?:\d){9,10}$/.test(phone.replace(/\s+/g, ""));
  }

  cancelEdit() {
    this.disableEditing();
    this.loadUserData(); // reload dữ liệu thật
  }
}

/* ===== Global bindings để tương thích HTML sẵn có ===== */
const personalInfoManager = new PersonalInfoManager();

function editPersonalInfo() {
  personalInfoManager.toggleEditing();
}
function cancelEdit() {
  personalInfoManager.cancelEdit();
}
function changeAvatar() {
  // tuỳ dự án, hiện không làm gì
}
function logout() {
  personalInfoManager.logout();
}
