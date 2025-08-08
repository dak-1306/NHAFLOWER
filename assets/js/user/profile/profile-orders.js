/**
 * NHAFLOWER - Orders JavaScript
 * File: profile-orders.js
 * Author: NHAFLOWER Team
 * Created: 2025
 */

class OrdersManager extends BaseProfileManager {
  constructor() {
    super();
    this.apiBaseUrl = "../../api/don_hang";
    this.orders = [];
    this.init();
  }

  init() {
    $(document).ready(() => {
      console.log("Orders Manager initialized");
      this.getCurrentUser();
      this.setupEventListeners();
      this.loadOrders();
    });
  }

  async loadOrders() {
    try {
      console.log("Loading orders for user ID:", this.currentUserId);

      const response = await fetch(
        `${this.apiBaseUrl}/get_orders_by_customer.php?id_khachhang=${this.currentUserId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const orders = await response.json();

      if (Array.isArray(orders)) {
        this.orders = orders;
        this.renderOrders();
      } else {
        console.error(
          "Error loading orders:",
          orders.message || "Invalid data format"
        );
        this.showErrorMessage(
          "Không thể tải danh sách đơn hàng: " +
            (orders.message || "Dữ liệu không hợp lệ")
        );
        this.loadMockOrders();
      }
    } catch (error) {
      console.error("Error loading orders:", error);
      this.showErrorMessage("Lỗi kết nối server");
      this.loadMockOrders();
    }
  }

  // Fallback to mock data if API fails
  loadMockOrders() {
    this.orders = [
      {
        id_donhang: "DH001",
        ngay_dat: "2025-01-15 10:30:00",
        trang_thai: "hoan_tat",
        dia_chi_giao: "123 Đường ABC, Phường XYZ, Quận 1, TP.HCM",
        total: 350000,
        items: [
          { name: "Hoa hồng đỏ", quantity: 2, price: 150000 },
          { name: "Hoa cúc trắng", quantity: 1, price: 50000 },
        ],
      },
      {
        id_donhang: "DH002",
        ngay_dat: "2025-01-10 14:20:00",
        trang_thai: "dang_giao",
        dia_chi_giao: "456 Đường DEF, Phường UVW, Quận 3, TP.HCM",
        total: 280000,
        items: [
          { name: "Hoa tulip vàng", quantity: 3, price: 80000 },
          { name: "Hoa baby", quantity: 1, price: 40000 },
        ],
      },
      {
        id_donhang: "DH003",
        ngay_dat: "2025-01-05 09:15:00",
        trang_thai: "cho",
        dia_chi_giao: "789 Đường GHI, Phường RST, Quận 7, TP.HCM",
        total: 420000,
        items: [
          { name: "Hoa lan tím", quantity: 1, price: 200000 },
          { name: "Hoa hướng dương", quantity: 2, price: 110000 },
        ],
      },
    ];
    this.renderOrders();
  }

  renderOrders() {
    const ordersContainer = $("#ordersContainer");

    if (this.orders.length === 0) {
      ordersContainer.html(`
        <div class="text-center py-5">
          <i class="fas fa-shopping-bag fa-3x text-muted mb-3"></i>
          <h5 class="text-muted">Chưa có đơn hàng nào</h5>
          <p class="text-muted">Hãy mua sắm để tạo đơn hàng đầu tiên!</p>
          <a href="../list_product.html" class="btn btn-primary">
            <i class="fas fa-shopping-cart"></i> Mua sắm ngay
          </a>
        </div>
      `);
      return;
    }

    let ordersHtml = "";
    this.orders.forEach((order) => {
      ordersHtml += this.renderOrderCard(order);
    });

    ordersContainer.html(ordersHtml);
  }

  renderOrderCard(order) {
    const statusBadge = this.getStatusBadge(order.trang_thai);
    const formattedDate = this.formatDate(order.ngay_dat);
    const total = order.total || this.calculateOrderTotal(order.items || []);

    return `
      <div class="card mb-3 order-card" data-order-id="${order.id_donhang}">
        <div class="card-header d-flex justify-content-between align-items-center">
          <div>
            <h6 class="mb-0">Đơn hàng #${order.id_donhang}</h6>
            <small class="text-muted">${formattedDate}</small>
          </div>
          <div>
            ${statusBadge}
          </div>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-8">
              <h6><i class="fas fa-map-marker-alt text-primary"></i> Địa chỉ giao hàng:</h6>
              <p class="text-muted mb-2">${order.dia_chi_giao}</p>
              
              ${order.items ? this.renderOrderItems(order.items) : ""}
            </div>
            <div class="col-md-4 text-right">
              <h5 class="text-primary mb-3">${this.formatPrice(total)}</h5>
              <div class="btn-group-vertical" role="group">
                <button class="btn btn-outline-primary btn-sm" onclick="ordersManager.viewOrderDetails('${
                  order.id_donhang
                }')">
                  <i class="fas fa-eye"></i> Xem chi tiết
                </button>
                ${
                  order.trang_thai === "hoan_tat"
                    ? `<button class="btn btn-outline-success btn-sm mt-2" onclick="ordersManager.reorder('${order.id_donhang}')">
                    <i class="fas fa-redo"></i> Đặt lại
                  </button>`
                    : ""
                }
                ${
                  order.trang_thai === "cho"
                    ? `<button class="btn btn-outline-danger btn-sm mt-2" onclick="ordersManager.cancelOrder('${order.id_donhang}')">
                    <i class="fas fa-times"></i> Hủy đơn
                  </button>`
                    : ""
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderOrderItems(items) {
    if (!items || items.length === 0) return "";

    let itemsHtml =
      '<h6><i class="fas fa-list text-primary"></i> Sản phẩm:</h6><ul class="list-unstyled">';
    items.forEach((item) => {
      itemsHtml += `
        <li class="d-flex justify-content-between align-items-center mb-1">
          <span>${item.name} x${item.quantity}</span>
          <span class="text-primary">${this.formatPrice(
            item.price * item.quantity
          )}</span>
        </li>
      `;
    });
    itemsHtml += "</ul>";
    return itemsHtml;
  }

  getStatusBadge(status) {
    const statusMap = {
      cho: { text: "Chờ xác nhận", class: "warning" },
      dang_giao: { text: "Đang giao", class: "info" },
      hoan_tat: { text: "Hoàn tất", class: "success" },
    };

    const statusInfo = statusMap[status] || {
      text: "Không xác định",
      class: "secondary",
    };
    return `<span class="badge badge-${statusInfo.class}">${statusInfo.text}</span>`;
  }

  calculateOrderTotal(items) {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  setupEventListeners() {
    // Filter buttons
    $(".filter-btn").on("click", (e) => {
      const filter = $(e.target).data("filter");
      this.filterOrders(filter);

      // Update active button
      $(".filter-btn").removeClass("active");
      $(e.target).addClass("active");
    });

    // Search functionality
    $("#orderSearch").on("input", (e) => {
      this.searchOrders(e.target.value);
    });
  }

  filterOrders(status) {
    let filteredOrders = this.orders;

    if (status !== "all") {
      filteredOrders = this.orders.filter(
        (order) => order.trang_thai === status
      );
    }

    const ordersContainer = $("#ordersContainer");
    if (filteredOrders.length === 0) {
      ordersContainer.html(`
        <div class="text-center py-5">
          <i class="fas fa-search fa-2x text-muted mb-3"></i>
          <h5 class="text-muted">Không tìm thấy đơn hàng nào</h5>
        </div>
      `);
    } else {
      let ordersHtml = "";
      filteredOrders.forEach((order) => {
        ordersHtml += this.renderOrderCard(order);
      });
      ordersContainer.html(ordersHtml);
    }
  }

  searchOrders(query) {
    const searchResults = this.orders.filter(
      (order) =>
        order.id_donhang.toLowerCase().includes(query.toLowerCase()) ||
        order.dia_chi_giao.toLowerCase().includes(query.toLowerCase())
    );

    const ordersContainer = $("#ordersContainer");
    if (searchResults.length === 0) {
      ordersContainer.html(`
        <div class="text-center py-5">
          <i class="fas fa-search fa-2x text-muted mb-3"></i>
          <h5 class="text-muted">Không tìm thấy kết quả cho "${query}"</h5>
        </div>
      `);
    } else {
      let ordersHtml = "";
      searchResults.forEach((order) => {
        ordersHtml += this.renderOrderCard(order);
      });
      ordersContainer.html(ordersHtml);
    }
  }

  async viewOrderDetails(orderId) {
    try {
      // Find order in current orders array (since we already have the data)
      const order = this.orders.find((o) => o.id_donhang == orderId);
      if (order) {
        this.showOrderDetailsModal(order);
      } else {
        this.showErrorMessage("Không tìm thấy thông tin đơn hàng");
      }
    } catch (error) {
      console.error("Error loading order details:", error);
      this.showErrorMessage("Lỗi kết nối server");
    }
  }

  showOrderDetailsModal(order) {
    const modalContent = `
      <div class="modal fade" id="orderDetailsModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Chi tiết đơn hàng #${
                order.id_donhang
              }</h5>
              <button type="button" class="close" data-dismiss="modal">
                <span>&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <div class="row">
                <div class="col-md-6">
                  <h6>Thông tin đơn hàng</h6>
                  <p><strong>Mã đơn:</strong> ${order.id_donhang}</p>
                  <p><strong>Ngày đặt:</strong> ${this.formatDate(
                    order.ngay_dat
                  )}</p>
                  <p><strong>Trạng thái:</strong> ${this.getStatusBadge(
                    order.trang_thai
                  )}</p>
                </div>
                <div class="col-md-6">
                  <h6>Địa chỉ giao hàng</h6>
                  <p>${order.dia_chi_giao}</p>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-dismiss="modal">Đóng</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Remove existing modal
    $("#orderDetailsModal").remove();

    // Add new modal
    $("body").append(modalContent);
    $("#orderDetailsModal").modal("show");
  }

  async cancelOrder(orderId) {
    if (!confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) {
      return;
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/delete_donhang.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id_donhang: orderId }),
      });

      const result = await response.json();

      if (result.success) {
        this.showSuccessMessage("Đơn hàng đã được hủy thành công");
        this.loadOrders(); // Reload orders
      } else {
        this.showErrorMessage("Không thể hủy đơn hàng: " + result.message);
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      this.showErrorMessage("Lỗi kết nối server");
    }
  }

  reorder(orderId) {
    const order = this.orders.find((o) => o.id_donhang === orderId);
    if (!order) return;

    // Add items to cart and redirect to checkout
    if (order.items) {
      localStorage.setItem("nhaflower_reorder", JSON.stringify(order.items));
      alert("Sản phẩm đã được thêm vào giỏ hàng!");
      window.location.href = "../shopping_cart.html";
    } else {
      this.showErrorMessage("Không thể đặt lại đơn hàng này");
    }
  }
}

// Initialize manager
const ordersManager = new OrdersManager();
