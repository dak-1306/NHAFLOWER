/**
 * NHAFLOWER - Personal Info JavaScript
 * File: profile-personal-info.js
 * Author: NHAFLOWER Team
 * Created: 2025
 */

class PersonalInfoManager extends BaseProfileManager {
  constructor() {
    super();
    this.isEditing = false;
    this.apiBaseUrl = "../../auth/profile.php";
    this.init();
  }

  init() {
    $(document).ready(() => {
      console.log("Personal Info Manager initialized");
      this.getCurrentUser();
      this.loadUserData();
      this.setupEventListeners();
    });
  }

  async loadUserData() {
    try {
      console.log("Loading user data for ID:", this.currentUserId);

      const response = await fetch(
        `${this.apiBaseUrl}?id_taikhoan=${this.currentUserId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        const userData = result.data;
        this.populateForm(userData);
        this.updateSidebarInfo(userData);
      } else {
        console.error("Error loading user data:", result.message);
        this.showErrorMessage(
          "Không thể tải thông tin người dùng: " + result.message
        );
        // Fallback to mock data
        this.loadMockData();
      }
    } catch (error) {
      console.error("Error:", error);
      this.showErrorMessage("Lỗi kết nối server");
      // Fallback to mock data
      this.loadMockData();
    }
  }

  populateForm(userData) {
    // Populate form fields
    $("#fullName").val(userData.ten || "");
    $("#email").val(userData.email || "");
    $("#phone").val(userData.sdt || "");
    $("#birthDate").val(userData.ngay_sinh || "");
    $("#address").val(userData.dia_chi || "");

    // Set default values for fields not in database
    $("#gender").val("male");
    $("#occupation").val("Khách hàng");
  }

  // Fallback to mock data if API fails
  loadMockData() {
    const mockData = {
      ten: "Nguyễn Văn An (Demo)",
      email: "demo@nhaflower.com",
      sdt: "0123456789",
      ngay_sinh: "1990-01-01",
      dia_chi: "123 Đường ABC, Phường XYZ, Quận 1, TP.HCM",
    };

    this.populateForm(mockData);
    this.updateSidebarInfo(mockData);
  }

  setupEventListeners() {
    // Form submission
    $("#personalInfoForm").on("submit", (e) => {
      e.preventDefault();
      if (this.isEditing) {
        this.savePersonalInfo();
      }
    });
  }

  enableEditing() {
    this.isEditing = true;

    // Enable form fields
    $(
      "#personalInfoForm input, #personalInfoForm textarea, #personalInfoForm select"
    )
      .prop("readonly", false)
      .prop("disabled", false);

    // Show form actions
    $(".form-actions").show();

    // Update button
    $(".card-header .btn-primary").html('<i class="fas fa-times"></i> Hủy');
  }

  disableEditing() {
    this.isEditing = false;

    // Disable form fields
    $("#personalInfoForm input, #personalInfoForm textarea").prop(
      "readonly",
      true
    );
    $("#personalInfoForm select").prop("disabled", true);

    // Hide form actions
    $(".form-actions").hide();

    // Update button
    $(".card-header .btn-primary").html(
      '<i class="fas fa-edit"></i> Chỉnh sửa'
    );
  }

  savePersonalInfo() {
    // Get form data
    const formData = {
      id_taikhoan: this.currentUserId,
      ten: $("#fullName").val(),
      email: $("#email").val(),
      sdt: $("#phone").val(),
      ngay_sinh: $("#birthDate").val(),
      dia_chi: $("#address").val(),
    };

    // Validate data
    if (!this.validatePersonalInfo(formData)) {
      return;
    }

    // Show loading
    $(".form-actions .btn-success")
      .prop("disabled", true)
      .html('<i class="fas fa-spinner fa-spin"></i> Đang lưu...');

    // Call API
    this.callSaveAPI(formData);
  }

  async callSaveAPI(formData) {
    try {
      console.log("Saving user data:", formData);

      const response = await fetch(this.apiBaseUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        this.showSuccessMessage(
          "Thông tin cá nhân đã được cập nhật thành công!"
        );
        this.disableEditing();

        // Update sidebar
        $("#profileName").text(formData.ten);
        $("#profileEmail").text(formData.email);
      } else {
        this.showErrorMessage("Lỗi cập nhật: " + result.message);
      }
    } catch (error) {
      console.error("Error:", error);
      this.showErrorMessage("Lỗi kết nối server");
    }

    // Reset button
    $(".form-actions .btn-success")
      .prop("disabled", false)
      .html('<i class="fas fa-save"></i> Lưu thay đổi');
  }

  validatePersonalInfo(data) {
    // Basic validation
    if (!data.ten || !data.ten.trim()) {
      this.showErrorMessage("Vui lòng nhập họ và tên");
      return false;
    }

    if (!data.email || !data.email.trim()) {
      this.showErrorMessage("Vui lòng nhập email");
      return false;
    }

    if (!this.isValidEmail(data.email)) {
      this.showErrorMessage("Email không hợp lệ");
      return false;
    }

    if (!data.sdt || !data.sdt.trim()) {
      this.showErrorMessage("Vui lòng nhập số điện thoại");
      return false;
    }

    if (!this.isValidPhone(data.sdt)) {
      this.showErrorMessage("Số điện thoại không đúng định dạng");
      return false;
    }

    return true;
  }
}

// Global functions
function editPersonalInfo() {
  if (personalInfoManager.isEditing) {
    personalInfoManager.disableEditing();
  } else {
    personalInfoManager.enableEditing();
  }
}

function cancelEdit() {
  personalInfoManager.disableEditing();
  personalInfoManager.loadUserData(); // Reset form data
}

function changeAvatar() {
  personalInfoManager.changeAvatar();
}

function logout() {
  personalInfoManager.logout();
}

// Initialize manager
const personalInfoManager = new PersonalInfoManager();
