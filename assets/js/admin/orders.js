/**
 * NHAFLOWER - Order Management JavaScript
 * Quản lý đơn hàng cho admin panel
 */

let ordersTable;
let currentFilters = {};

// Document ready
$(document).ready(function () {
  console.log("Orders page initializing...");
  initializeOrdersTable();
  bindEvents();
  loadOrders();
  console.log("Orders page initialized.");
});

/**
 * Initialize DataTable for orders
 */
function initializeOrdersTable() {
  console.log("Initializing DataTable for orders...");
  try {
    ordersTable = $("#ordersTable").DataTable({
      processing: true,
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
      serverSide: false,
      pageLength: 10,
      lengthMenu: [
        [10, 25, 50, -1],
        [10, 25, 50, "Tất cả"],
      ],
      order: [[2, "desc"]], // Sort by date descending
      columnDefs: [
        {
          targets: [6], // Actions column
          orderable: false,
          searchable: false,
        },
      ],
    });
    console.log("DataTable initialized successfully");
  } catch (error) {
    console.error("Error initializing DataTable:", error);
  }
}

/**
 * Bind event handlers
 */
function bindEvents() {
  console.log("Binding events...");

  // Filter form
  $("#statusFilter, #dateFromFilter, #dateToFilter").on("change", function () {
    applyFilters();
  });

  // Search functionality
  $(".navbar-search input").on("keyup", function () {
    if (ordersTable) {
      ordersTable.search(this.value).draw();
    }
  });
}

/**
 * Load orders from API
 */
function loadOrders() {
  console.log("Loading orders...");

  $.ajax({
    url: "../api/don_hang.php?action=get_all",
    type: "GET",
    dataType: "json",
    data: currentFilters,
    success: function (data) {
      console.log("Orders loaded successfully:", data);
      if (data.success && Array.isArray(data.data)) {
        displayOrders(data.data);
      } else {
        console.error("Invalid data format:", data);
        showError("Dữ liệu trả về không hợp lệ");
      }
    },
    error: function (xhr, status, error) {
      console.error("Error loading orders:", error, xhr.responseText);
      showError("Không thể tải dữ liệu đơn hàng. Vui lòng thử lại.");
    },
  });
}

/**
 * Display orders in DataTable
 */
function displayOrders(orders) {
  console.log("Displaying orders:", orders);

  // Clear existing data
  ordersTable.clear();

  if (!orders || orders.length === 0) {
    console.log("No orders to display");
    ordersTable.draw();
    return;
  }

  console.log("Processing", orders.length, "orders");

  // Add rows to DataTable
  orders.forEach(function (order) {
    const statusBadge = getStatusBadge(order.trang_thai || "cho");
    const paymentBadge = getPaymentBadge("pending");
    const formattedDate = formatDate(order.ngay_dat);
    const formattedTotal = formatCurrency(0); // Default since we don't have total calculation

    const actions = `
            <div class="btn-group" role="group">
                <button type="button" class="btn btn-info btn-sm" onclick="viewOrderDetails(${
                  order.id_donhang
                })" title="Xem chi tiết">
                    <i class="fas fa-eye"></i>
                </button>
                <button type="button" class="btn btn-warning btn-sm" onclick="showUpdateStatusModal(${
                  order.id_donhang
                }, '${order.trang_thai || "cho"}')" title="Cập nhật trạng thái">
                    <i class="fas fa-edit"></i>
                </button>
                <button type="button" class="btn btn-danger btn-sm" onclick="deleteOrder(${
                  order.id_donhang
                })" title="Xóa đơn hàng">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

    const row = [
      `#${order.id_donhang}`,
      order.ten_khachhang || "N/A",
      formattedDate,
      formattedTotal,
      statusBadge,
      paymentBadge,
      actions,
    ];

    console.log("Adding row:", row);
    ordersTable.row.add(row);
  });

  ordersTable.draw();
  console.log("DataTable drawn");
}

/**
 * Apply filters to order list
 */
function applyFilters() {
  currentFilters = {};

  const status = $("#statusFilter").val();
  const dateFrom = $("#dateFromFilter").val();
  const dateTo = $("#dateToFilter").val();

  if (status) {
    currentFilters.status = status;
  }

  if (dateFrom) {
    currentFilters.date_from = dateFrom;
  }

  if (dateTo) {
    currentFilters.date_to = dateTo;
  }

  loadOrders();
}

/**
 * View order details (placeholder)
 */
function viewOrderDetails(orderId) {
  alert("Xem chi tiết đơn hàng #" + orderId);
}

/**
 * Show update status modal (placeholder)
 */
function showUpdateStatusModal(orderId, currentStatus) {
  alert(
    "Cập nhật trạng thái đơn hàng #" +
      orderId +
      " (hiện tại: " +
      currentStatus +
      ")"
  );
}

/**
 * Delete order (placeholder)
 */
function deleteOrder(orderId) {
  if (confirm("Bạn có chắc chắn muốn xóa đơn hàng #" + orderId + " không?")) {
    alert("Xóa đơn hàng #" + orderId);
  }
}

/**
 * Export orders (placeholder)
 */
function exportOrders() {
  alert("Xuất Excel danh sách đơn hàng");
}

// Utility Functions

/**
 * Get status badge HTML
 */
function getStatusBadge(status) {
  const statusMap = {
    cho: { class: "warning", text: "Chờ xác nhận" },
    dang_giao: { class: "info", text: "Đang giao" },
    hoan_tat: { class: "success", text: "Hoàn thành" },
    huy: { class: "danger", text: "Đã hủy" },
  };

  const statusInfo = statusMap[status] || { class: "secondary", text: status };
  return `<span class="badge badge-${statusInfo.class}">${statusInfo.text}</span>`;
}

/**
 * Get payment status badge HTML
 */
function getPaymentBadge(status) {
  const statusMap = {
    pending: { class: "warning", text: "Chờ thanh toán" },
    paid: { class: "success", text: "Đã thanh toán" },
    failed: { class: "danger", text: "Thanh toán lỗi" },
    refunded: { class: "info", text: "Đã hoàn tiền" },
  };

  const statusInfo = statusMap[status] || { class: "secondary", text: status };
  return `<span class="badge badge-${statusInfo.class}">${statusInfo.text}</span>`;
}

/**
 * Format date
 */
function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN");
}

/**
 * Format currency
 */
function formatCurrency(amount) {
  if (!amount) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

/**
 * Show success message
 */
function showSuccess(message) {
  alert("Thành công: " + message);
}

/**
 * Show error message
 */
function showError(message) {
  alert("Lỗi: " + message);
}
