/**
 * NHAFLOWER Admin - Customer Management
 * File: customers.js
 * Author: NHAFLOWER Team
 * Created: 2025
 */
// ...existing code...
// Fixed URL to match actual API structure
class CustomerManager {
  constructor() {
    // Khôi phục relative URL
    this.API_BASE_URL = "../api/khach_hang.php";
    this.customersTable = null;
    this.init();
  }

  init() {
    $(document).ready(() => {
      console.log("Customer Manager initialized");
      this.loadCustomers();
      this.setupEventListeners();
    });
  }

  setupEventListeners() {
    // Add customer button
    const addBtn = document.getElementById("addCustomerBtn");
    if (addBtn) {
      addBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.addCustomer();
      });
    }

    // Update customer button
    const updateBtn = document.getElementById("updateCustomerBtn");
    if (updateBtn) {
      updateBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.updateCustomer();
      });
    }
  }

  // Hiển thị thông báo
  showAlert(message, type = "success") {
    const alertHtml = `
            <div class="alert alert-${type} alert-dismissible fade show alert-custom" role="alert">
                ${message}
                <button type="button" class="close" data-dismiss="alert">
                    <span>&times;</span>
                </button>
            </div>
        `;
    $("body").append(alertHtml);

    // Tự động ẩn sau 3 giây
    setTimeout(() => {
      $(".alert-custom").fadeOut();
    }, 3000);
  }  // Tải danh sách khách hàng
  async loadCustomers() {
    try {
      console.log("Loading customers...");
      const response = await fetch(this.API_BASE_URL + "?action=get_all");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the raw text first to debug JSON parsing issues
      const responseText = await response.text();
      console.log("Raw API response:", responseText);

      // Try to parse JSON
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (jsonError) {
        console.error("JSON Parse Error:", jsonError);
        console.error("Response was:", responseText);
        throw new Error(`Invalid JSON response: ${jsonError.message}. Response: ${responseText.substring(0, 200)}...`);
      }

      console.log("Parsed API response:", result);

      // Check if the API response has success and data properties
      let customers;
      if (result.success && result.data) {
        customers = result.data;
      } else if (Array.isArray(result)) {
        customers = result;
      } else {
        throw new Error("Invalid API response format");
      }

      // Destroy existing DataTable if exists
      if (this.customersTable) {
        this.customersTable.destroy();
        this.customersTable = null;
      }

      this.displayCustomers(customers);
      this.initDataTable();
    } catch (error) {
      console.error("Lỗi khi tải danh sách khách hàng:", error);
      const tbody = document.getElementById("customersTableBody");
      // Remove colspan to avoid DataTables conflicts
      tbody.innerHTML = `<tr><td class="text-center text-danger" style="padding: 20px;">
                <i class="fas fa-exclamation-triangle mr-2"></i>
                Lỗi: ${error.message}
            </td><td></td><td></td><td></td><td></td><td></td><td></td></tr>`;
      this.showAlert(
        `Lỗi khi tải danh sách khách hàng: ${error.message}`,
        "danger"
      );
    }
  }
  // Khởi tạo DataTable
  initDataTable() {
    this.customersTable = $("#customersTable").DataTable({
      processing: true, // Enable processing indicator
      language: {
        decimal: "",
        emptyTable: "Không có dữ liệu trong bảng",
        info: "Hiển thị _START_ đến _END_ của _TOTAL_ mục",
        infoEmpty: "Hiển thị 0 đến 0 của 0 mục",
        infoFiltered: "(lọc từ _MAX_ tổng số mục)",
        lengthMenu: "Hiển thị _MENU_ mục",
        loadingRecords: "Đang tải...",
        processing: "Đang xử lý...",
        search: "Tìm kiếm:",
        zeroRecords: "Không tìm thấy kết quả phù hợp",
        paginate: {
          first: "Đầu",
          last: "Cuối",
          next: "Tiếp",
          previous: "Trước",
        },
      },
      responsive: true,
      pageLength: 10,
      order: [[0, "desc"]], // Sort by ID descending
      columnDefs: [
        { targets: [6], orderable: false }, // Disable sorting for action column
      ],
    });
  }

  // Hiển thị danh sách khách hàng
  displayCustomers(customers) {
    const tbody = document.getElementById("customersTableBody");
    if (!customers || customers.length === 0) {
      // Avoid colspan to prevent DataTables issues
      tbody.innerHTML =
        '<tr><td class="text-center" style="padding: 20px;">Không có dữ liệu khách hàng</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>';
      return;
    }

    const html = customers
      .map(
        (customer) => `
                <tr>
                    <td>${customer.id_khachhang || "N/A"}</td>
                    <td>${customer.ten || "N/A"}</td>
                    <td>${customer.sdt || "N/A"}</td>
                    <td>${customer.dia_chi || "N/A"}</td>
                    <td>${customer.ngay_sinh || "N/A"}</td>
                    <td>${customer.id_taikhoan || "N/A"}</td>
                    <td class="table-actions">
                        <button class="btn btn-sm btn-info" onclick="customerManager.editCustomer(${
                          customer.id_khachhang
                        })" title="Chỉnh sửa">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="customerManager.deleteCustomer(${
                          customer.id_khachhang
                        })" title="Xóa">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `
      )
      .join("");

    tbody.innerHTML = html;
    console.log(`Displayed ${customers.length} customers`);
  }

  // Thêm khách hàng mới
  async addCustomer() {
    const form = document.getElementById("addCustomerForm");
    const formData = new FormData(form);
    const addBtn = document.getElementById("addCustomerBtn");

    // Disable button để tránh double click
    if (addBtn) {
      addBtn.disabled = true;
      addBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin mr-1"></i>Đang xử lý...';
    }

    try {
      const customerData = {
        ten_khachhang: formData.get("ten_khachhang"),
        so_dien_thoai: formData.get("so_dien_thoai"),
        dia_chi: formData.get("dia_chi"),
        ngay_sinh: formData.get("ngay_sinh"), // Thêm ngày sinh
        email_taikhoan: formData.get("email_taikhoan"),
        mat_khau_taikhoan: formData.get("mat_khau_taikhoan"),
      };

      // Debug: Log dữ liệu trước khi gửi
      console.log("Customer data to send:", customerData);
      console.log("Form validation check:");
      console.log(
        "- ten_khachhang:",
        customerData.ten_khachhang,
        "Empty?",
        !customerData.ten_khachhang
      );
      console.log(
        "- so_dien_thoai:",
        customerData.so_dien_thoai,
        "Empty?",
        !customerData.so_dien_thoai
      );
      console.log(
        "- dia_chi:",
        customerData.dia_chi,
        "Empty?",
        !customerData.dia_chi
      );
      console.log(
        "- email_taikhoan:",
        customerData.email_taikhoan,
        "Empty?",
        !customerData.email_taikhoan
      );
      console.log(
        "- mat_khau_taikhoan:",
        customerData.mat_khau_taikhoan,
        "Empty?",
        !customerData.mat_khau_taikhoan
      );

      // Validation frontend
      if (
        !customerData.ten_khachhang ||
        !customerData.so_dien_thoai ||
        !customerData.dia_chi ||
        !customerData.email_taikhoan ||
        !customerData.mat_khau_taikhoan
      ) {
        console.log("❌ Validation failed - missing required fields");
        this.showAlert("Vui lòng điền đầy đủ thông tin", "danger");
        return;
      }

      console.log("✅ Validation passed - proceeding with account creation");

      // Bước 1: Tạo tài khoản trước
      const accountData = {
        email: customerData.email_taikhoan,
        mat_khau: customerData.mat_khau_taikhoan,
        vai_tro: "khach",
        trang_thai: 1,
      };

      console.log("Creating account with data:", accountData);

      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const accountResponse = await fetch("../api/tai_khoan.php?action=add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(accountData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log(
        "Account response status:",
        accountResponse.status,
        accountResponse.statusText
      );

      if (!accountResponse.ok) {
        throw new Error(`Account API error: ${accountResponse.status}`);
      }

      const accountResult = await accountResponse.json();
      console.log("Account creation result:", accountResult);

      if (!accountResult.success) {
        this.showAlert(
          "Lỗi tạo tài khoản: " + (accountResult.error || "Unknown error"),
          "danger"
        );
        return;
      }

      // Bước 2: Tạo khách hàng với ID tài khoản vừa tạo
      const finalCustomerData = {
        ten_khachhang: customerData.ten_khachhang,
        so_dien_thoai: customerData.so_dien_thoai,
        dia_chi: customerData.dia_chi,
        ngay_sinh: customerData.ngay_sinh || null, // Thêm ngày sinh (có thể null)
        id_taikhoan: accountResult.id,
      };

      console.log("Creating customer with data:", finalCustomerData);

      const controller2 = new AbortController();
      const timeoutId2 = setTimeout(() => controller2.abort(), 10000);

      const apiUrl = this.API_BASE_URL + "?action=add";
      console.log("API URL:", apiUrl);
      console.log("Full URL:", window.location.origin + "/" + apiUrl);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalCustomerData),
        signal: controller2.signal,
      });

      clearTimeout(timeoutId2);
      console.log(
        "Customer response status:",
        response.status,
        response.statusText
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(
          `Customer API error: ${response.status} - ${errorText.substring(
            0,
            100
          )}`
        );
      }

      const responseText = await response.text();
      console.log("Raw response:", responseText);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error("JSON parse error:", e);
        console.error("Response that failed to parse:", responseText);
        throw new Error(
          `Invalid JSON response: ${responseText.substring(0, 100)}`
        );
      }

      console.log("Customer creation result:", result);

      if (result.success) {
        this.showAlert(
          `Thêm khách hàng thành công! Tài khoản: ${customerData.email_taikhoan}`,
          "success"
        );
        $("#addCustomerModal").modal("hide");
        form.reset();
        this.loadCustomers();
      } else {
        this.showAlert(
          "Lỗi tạo khách hàng: " + (result.error || "Unknown error"),
          "danger"
        );
      }
    } catch (error) {
      console.error("Lỗi khi thêm khách hàng:", error);

      let errorMessage = "Lỗi khi thêm khách hàng";
      if (error.name === "AbortError") {
        errorMessage = "Timeout: API phản hồi quá chậm, vui lòng thử lại";
      } else if (error.message) {
        errorMessage += ": " + error.message;
      }

      this.showAlert(errorMessage, "danger");
    } finally {
      // Restore button state
      if (addBtn) {
        addBtn.disabled = false;
        addBtn.innerHTML = '<i class="fas fa-save mr-1"></i>Lưu';
      }
    }
  }
  // Chỉnh sửa khách hàng
  async editCustomer(id) {
    try {
      const response = await fetch(
        this.API_BASE_URL + `khach_hang.php?action=get_by_id&id=${id}`
      );
      const result = await response.json();

      let customer;
      if (result.success && result.data) {
        customer = result.data;
      } else if (result.id_khachhang) {
        customer = result;
      } else {
        throw new Error("Customer not found");
      }

      // Điền dữ liệu vào form
      document.getElementById("editCustomerId").value = customer.id_khachhang;
      document.getElementById("editCustomerName").value = customer.ten;
      document.getElementById("editCustomerPhone").value = customer.sdt;
      document.getElementById("editCustomerAddress").value = customer.dia_chi;
      document.getElementById("editCustomerBirthday").value =
        customer.ngay_sinh || "";

      $("#editCustomerModal").modal("show");
    } catch (error) {
      console.error("Lỗi khi lấy thông tin khách hàng:", error);
      this.showAlert("Lỗi khi lấy thông tin khách hàng", "danger");
    }
  }

  // Cập nhật khách hàng
  async updateCustomer() {
    const form = document.getElementById("editCustomerForm");
    const formData = new FormData(form);
    const customerId = formData.get("customer_id");

    const customerData = {
      ten_khachhang: formData.get("ten_khachhang"),
      so_dien_thoai: formData.get("so_dien_thoai"),
      dia_chi: formData.get("dia_chi"),
      ngay_sinh: formData.get("ngay_sinh"),
    };

    try {
      const response = await fetch(
        this.API_BASE_URL + `khach_hang.php?action=update&id=${customerId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(customerData),
        }
      );

      const result = await response.json();

      if (result.success) {
        this.showAlert("Cập nhật khách hàng thành công!", "success");
        $("#editCustomerModal").modal("hide");
        this.loadCustomers();
      } else {
        this.showAlert("Lỗi: " + result.error, "danger");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật khách hàng:", error);
      this.showAlert("Lỗi khi cập nhật khách hàng", "danger");
    }
  }

  // Xóa khách hàng
  async deleteCustomer(id) {
    if (!confirm("Bạn có chắc chắn muốn xóa khách hàng này?")) {
      return;
    }

    try {
      const response = await fetch(
        this.API_BASE_URL + `khach_hang.php?action=delete&id=${id}`
      );
      const result = await response.json();

      if (result.success) {
        this.showAlert("Xóa khách hàng thành công!", "success");
        this.loadCustomers();
      } else {
        this.showAlert("Lỗi: " + result.error, "danger");
      }
    } catch (error) {
      console.error("Lỗi khi xóa khách hàng:", error);
      this.showAlert("Lỗi khi xóa khách hàng", "danger");
    }
  }
}

// Khởi tạo Customer Manager
let customerManager;

// Global functions for onclick events
function addCustomer() {
  if (customerManager) {
    customerManager.addCustomer();
  } else {
    console.error("CustomerManager not initialized");
  }
}

function updateCustomer() {
  if (customerManager) {
    customerManager.updateCustomer();
  } else {
    console.error("CustomerManager not initialized");
  }
}

// Initialize when DOM is ready
$(document).ready(function () {
  customerManager = new CustomerManager();
});
