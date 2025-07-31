/**
 * NHAFLOWER Admin - Customer Management
 * File: customers.js
 * Author: NHAFLOWER Team
 * Created: 2025
 */

class CustomerManager {
  constructor() {
    this.API_BASE_URL = "../api/khach_hang/";
    this.customersTable = null;
    this.init();
  }

  init() {
    $(document).ready(() => {
      console.log("Customer Manager initialized");
      this.loadCustomers();
    });
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
  }

  // Tải danh sách khách hàng
  async loadCustomers() {
    try {
      console.log("Loading customers...");
      const response = await fetch(this.API_BASE_URL + "get_customers.php");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const customers = await response.json();
      console.log("Customers loaded:", customers);

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
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">
                <i class="fas fa-exclamation-triangle mr-2"></i>
                Lỗi: ${error.message}
            </td></tr>`;
      this.showAlert(
        `Lỗi khi tải danh sách khách hàng: ${error.message}`,
        "danger"
      );
    }
  }

  // Khởi tạo DataTable
  initDataTable() {
    this.customersTable = $("#customersTable").DataTable({
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
      tbody.innerHTML =
        '<tr><td colspan="7" class="text-center">Không có dữ liệu khách hàng</td></tr>';
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

    const customerData = {
      ten_khachhang: formData.get("ten_khachhang"),
      so_dien_thoai: formData.get("so_dien_thoai"),
      dia_chi: formData.get("dia_chi"),
      id_taikhoan: formData.get("id_taikhoan"),
    };

    try {
      const response = await fetch(this.API_BASE_URL + "create_customer.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customerData),
      });

      const result = await response.json();

      if (result.success) {
        this.showAlert("Thêm khách hàng thành công!", "success");
        $("#addCustomerModal").modal("hide");
        form.reset();
        this.loadCustomers();
      } else {
        this.showAlert("Lỗi: " + result.error, "danger");
      }
    } catch (error) {
      console.error("Lỗi khi thêm khách hàng:", error);
      this.showAlert("Lỗi khi thêm khách hàng", "danger");
    }
  }

  // Chỉnh sửa khách hàng
  async editCustomer(id) {
    try {
      const response = await fetch(
        this.API_BASE_URL + `get_customer.php?id=${id}`
      );
      const customer = await response.json();

      // Điền dữ liệu vào form
      document.getElementById("editCustomerId").value = customer.id_khachhang;
      document.getElementById("editCustomerName").value = customer.ten;
      document.getElementById("editCustomerPhone").value = customer.sdt;
      document.getElementById("editCustomerAddress").value = customer.dia_chi;

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
    };

    try {
      const response = await fetch(
        this.API_BASE_URL + `update_customer.php?id=${customerId}`,
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
        this.API_BASE_URL + `delete_customer.php?id=${id}`
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
  customerManager.addCustomer();
}

function updateCustomer() {
  customerManager.updateCustomer();
}

// Initialize when DOM is ready
$(document).ready(function () {
  customerManager = new CustomerManager();
});
