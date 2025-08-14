/**
 * NHAFLOWER - Orders JavaScript (refactor)
 * File: profile-orders.js
 * Author: NHAFLOWER Team
 * Updated: 2025-08
 */

class OrdersManager extends BaseProfileManager {
  constructor() {
    super();
    this.apiBaseUrl = "../../api/don_hang.php";
    this.orders = [];
    this.$ordersContainer = null;
    this.$search = null;
    this.init();
  }

  init() {
    $(document).ready(() => {
      this.getCurrentUser();

      // Cập nhật sidebar nhanh từ localStorage
      const userData = JSON.parse(
        localStorage.getItem("nhaflower_user") || "null"
      );
      new BaseProfileManager().updateSidebarInfo(userData);

      this.cacheDom();
      this.bindEvents();
      this.loadOrders();
    });
  }

  cacheDom() {
    this.$ordersContainer = $("#ordersContainer");
    this.$search = $("#orderSearch");
  }

  bindEvents() {
    // Filter: dùng currentTarget để không dính vào <i> bên trong button
    $(".filter-btn").on("click", (e) => {
      const $btn = $(e.currentTarget);
      const filter = $btn.data("filter");
      $(".filter-btn").removeClass("active");
      $btn.addClass("active");
      this.filterOrders(filter);
    });

    // Search
    this.$search.on("input", (e) => {
      this.searchOrders(e.target.value || "");
    });
  }

  async loadOrders() {
    try {
      const res = await fetch(
        `${this.apiBaseUrl}?action=get_by_customer&id_khachhang=${this.currentUserId}`,
        { method: "GET", headers: { "Content-Type": "application/json" } }
      );
      const payload = await res.json();

      // Hỗ trợ 2 kiểu payload: Array hoặc {success, data}
      const data = Array.isArray(payload) ? payload : payload?.data || [];
      if (!Array.isArray(data)) throw new Error("Invalid data format");

      this.orders = data;
      this.renderOrders();
    } catch (err) {
      console.error(err);
      this.showErrorMessage("Không thể tải danh sách đơn hàng");
      this.$ordersContainer.html(`
        <div class="text-center py-5">
          <i class="fas fa-exclamation-circle fa-2x text-muted mb-3"></i>
          <h5 class="text-muted">Lỗi tải dữ liệu</h5>
        </div>
      `);
    }
  }

  renderOrders(list = this.orders) {
    if (!list.length) {
      this.$ordersContainer.html(`
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

    const html = list.map((order) => this.renderOrderCard(order)).join("");
    this.$ordersContainer.html(html);
  }

  renderOrderCard(order) {
    const statusBadge = this.getStatusBadge(order.trang_thai);
    const formattedDate = this.formatDate(order.ngay_dat);
    const total =
      Number(order.total) || this.calculateOrderTotal(order.items || []);

    return `
      <div class="card mb-3 order-card" data-order-id="${order.id_donhang}">
        <div class="card-header d-flex justify-content-between align-items-center">
          <div>
            <h6 class="mb-0">Đơn hàng #${order.id_donhang}</h6>
            <small class="text-muted">${formattedDate}</small>
          </div>
          <div>${statusBadge}</div>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-8">
              <h6><i class="fas fa-map-marker-alt text-primary"></i> Địa chỉ giao hàng:</h6>
              <p class="text-muted mb-2">${order.dia_chi_giao || ""}</p>
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
    if (!Array.isArray(items) || !items.length) return "";
    const lis = items
      .map((it) => {
        const qty = Number(it.quantity) || 0;
        const price = Number(it.price) || 0;
        return `
          <li class="d-flex justify-content-between align-items-center mb-1">
            <span>${it.name || "Sản phẩm"} x${qty}</span>
            <span class="text-primary">${this.formatPrice(qty * price)}</span>
          </li>`;
      })
      .join("");
    return `<h6><i class="fas fa-list text-primary"></i> Sản phẩm:</h6><ul class="list-unstyled">${lis}</ul>`;
  }

  getStatusBadge(status) {
    const map = {
      cho: { text: "Chờ xác nhận", cls: "warning" },
      dang_giao: { text: "Đang giao", cls: "info" },
      hoan_tat: { text: "Hoàn tất", cls: "success" },
      huy: { text: "Đã hủy", cls: "secondary" },
    };
    const s = map[status] || { text: "Không xác định", cls: "secondary" };
    return `<span class="badge badge-${s.cls}">${s.text}</span>`;
  }

  calculateOrderTotal(items) {
    return (items || []).reduce((sum, it) => {
      const qty = Number(it.quantity) || 0;
      const price = Number(it.price) || 0;
      return sum + qty * price;
    }, 0);
  }

  filterOrders(status) {
    const list =
      status === "all"
        ? this.orders
        : this.orders.filter((o) => o.trang_thai === status);
    if (!list.length) {
      this.$ordersContainer.html(`
        <div class="text-center py-5">
          <i class="fas fa-search fa-2x text-muted mb-3"></i>
          <h5 class="text-muted">Không tìm thấy đơn hàng nào</h5>
        </div>
      `);
      return;
    }
    this.renderOrders(list);
  }

  searchOrders(query) {
    const q = (query || "").toLowerCase().trim();
    if (!q) return this.renderOrders();

    const list = this.orders.filter((o) => {
      const idStr = String(o.id_donhang || "").toLowerCase();
      const addr = String(o.dia_chi_giao || "").toLowerCase();
      return idStr.includes(q) || addr.includes(q);
    });

    if (!list.length) {
      this.$ordersContainer.html(`
        <div class="text-center py-5">
          <i class="fas fa-search fa-2x text-muted mb-3"></i>
          <h5 class="text-muted">Không tìm thấy kết quả cho "${this.escapeHtml(
            query
          )}"</h5>
        </div>
      `);
      return;
    }
    this.renderOrders(list);
  }

  escapeHtml(s) {
    return String(s).replace(
      /[&<>"']/g,
      (m) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;",
        }[m])
    );
  }

  async viewOrderDetails(orderId) {
    const order = this.orders.find(
      (o) => String(o.id_donhang) === String(orderId)
    );
    if (!order)
      return this.showErrorMessage("Không tìm thấy thông tin đơn hàng");

    const modal = `
      <div class="modal fade" id="orderDetailsModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Chi tiết đơn hàng #${
                order.id_donhang
              }</h5>
              <button type="button" class="close" data-dismiss="modal"><span>&times;</span></button>
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
                  <p>${order.dia_chi_giao || ""}</p>
                </div>
              </div>
              ${this.renderOrderItems(order.items || [])}
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-dismiss="modal">Đóng</button>
            </div>
          </div>
        </div>
      </div>`;
    $("#orderDetailsModal").remove();
    $("body").append(modal);
    $("#orderDetailsModal").modal("show");
  }

  async cancelOrder(orderId) {
    if (!confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) return;

    try {
      // Khuyến nghị: chuyển về 1 endpoint duy nhất: this.apiBaseUrl?action=cancel (POST)
      const res = await fetch(`${this.apiBaseUrl}/delete_donhang.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_donhang: orderId }),
      });
      const result = await res.json();

      if (result && result.success) {
        this.showSuccessMessage("Đơn hàng đã được hủy thành công");
        this.loadOrders();
      } else {
        this.showErrorMessage(
          "Không thể hủy đơn hàng: " + (result?.message || "Không xác định")
        );
      }
    } catch (err) {
      console.error(err);
      this.showErrorMessage("Lỗi kết nối server");
    }
  }

  reorder(orderId) {
    const order = this.orders.find(
      (o) => String(o.id_donhang) === String(orderId)
    );
    if (!order || !Array.isArray(order.items) || !order.items.length) {
      return this.showErrorMessage("Không thể đặt lại đơn hàng này");
    }
    localStorage.setItem("nhaflower_reorder", JSON.stringify(order.items));
    alert("Sản phẩm đã được thêm vào giỏ hàng!");
    window.location.href = "../shopping_cart.html";
  }
}

// Global instance cho các onclick trong HTML
window.ordersManager = new OrdersManager();
