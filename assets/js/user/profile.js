/* ====================================
   PROFILE PAGE JAVASCRIPT
   ==================================== */

class ProfileManager {
  constructor() {
    this.currentTab = "personal-info";
    this.userToken = localStorage.getItem("user_token");
    this.userData = JSON.parse(localStorage.getItem("user_data") || "{}");
    this.apiBaseUrl = "../auth/profile.php";

    this.init();
  }

  init() {
    this.bindEvents();
    this.loadUserData();
    this.loadOrders();
    this.loadAddresses();
    this.loadFavorites();
    this.loadNotifications();

    // Set active tab from URL or default
    const urlTab = new URLSearchParams(window.location.search).get("tab");
    if (urlTab) {
      this.switchTab(urlTab);
    }
  }

  bindEvents() {
    // Navigation events
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const tab = item.getAttribute("data-tab");
        if (tab && tab !== "logout") {
          this.switchTab(tab);
        }
      });
    });

    // Logout event
    document
      .querySelector('[data-tab="logout"]')
      ?.addEventListener("click", (e) => {
        e.preventDefault();
        this.logout();
      });

    // Form submissions
    document
      .getElementById("personalInfoForm")
      ?.addEventListener("submit", (e) => {
        e.preventDefault();
        this.updatePersonalInfo();
      });

    document.getElementById("passwordForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.updatePassword();
    });

    document.getElementById("addressForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.saveAddress();
    });

    // Avatar change
    document.getElementById("avatarInput")?.addEventListener("change", (e) => {
      this.handleAvatarChange(e);
    });

    // Filter events
    document
      .getElementById("orderStatusFilter")
      ?.addEventListener("change", (e) => {
        this.filterOrders(e.target.value);
      });

    // Mark all notifications as read
    document.getElementById("markAllRead")?.addEventListener("click", () => {
      this.markAllNotificationsRead();
    });

    // Address actions
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("edit-address")) {
        this.editAddress(e.target.dataset.addressId);
      } else if (e.target.classList.contains("delete-address")) {
        this.deleteAddress(e.target.dataset.addressId);
      } else if (e.target.classList.contains("set-default-address")) {
        this.setDefaultAddress(e.target.dataset.addressId);
      } else if (e.target.classList.contains("remove-favorite")) {
        this.removeFavorite(e.target.dataset.productId);
      }
    });
  }

  // ====================================
  // TAB MANAGEMENT
  // ====================================
  switchTab(tabName) {
    // Update navigation
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.classList.remove("active");
    });
    document.querySelector(`[data-tab="${tabName}"]`)?.classList.add("active");

    // Update content
    document.querySelectorAll(".tab-content").forEach((content) => {
      content.classList.remove("active");
    });
    document.getElementById(tabName)?.classList.add("active");

    this.currentTab = tabName;

    // Update URL
    const url = new URL(window.location);
    url.searchParams.set("tab", tabName);
    window.history.pushState({}, "", url);

    // Load tab-specific data
    this.loadTabData(tabName);
  }

  loadTabData(tabName) {
    switch (tabName) {
      case "orders":
        this.loadOrders();
        break;
      case "addresses":
        this.loadAddresses();
        break;
      case "favorites":
        this.loadFavorites();
        break;
      case "notifications":
        this.loadNotifications();
        break;
    }
  }

  // ====================================
  // USER DATA MANAGEMENT
  // ====================================
  async loadUserData() {
    try {
      // Check if user is logged in
      if (!this.userData.id_taikhoan) {
        this.showNotification("Vui lòng đăng nhập để xem thông tin", "error");
        window.location.href = "login.html";
        return;
      }

      const response = await fetch(
        `${this.apiBaseUrl}?id_taikhoan=${this.userData.id_taikhoan}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          this.populateUserData(data.data);
        } else {
          this.showNotification("Lỗi: " + data.message, "error");
        }
      } else {
        throw new Error("Network response was not ok");
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      this.showNotification("Lỗi khi tải thông tin người dùng", "error");
    }
  }

  populateUserData(user) {
    // Update name in sidebar
    const nameElement = document.getElementById("profileName");
    if (nameElement) {
      nameElement.textContent = user.ten || "Người dùng";
    }

    // Update email in sidebar
    const emailElement = document.getElementById("profileEmail");
    if (emailElement) {
      emailElement.textContent = user.email || "";
    }

    // Populate form fields with correct field names
    const fieldMapping = {
      fullName: user.ten,
      email: user.email,
      phone: user.sdt,
      birthDate: user.ngay_sinh,
      address: user.dia_chi,
    };

    Object.keys(fieldMapping).forEach((fieldId) => {
      const input = document.getElementById(fieldId);
      if (input && fieldMapping[fieldId]) {
        input.value = fieldMapping[fieldId];
      }
    });
  }

  async updatePersonalInfo() {
    const form = document.getElementById("personalInfoForm");

    // Get form data using getElementById for each field
    const userData = {
      id_taikhoan: this.userData.id_taikhoan,
      ten: document.getElementById("fullName").value.trim(),
      sdt: document.getElementById("phone").value.trim(),
      dia_chi: document.getElementById("address").value.trim(),
      ngay_sinh: document.getElementById("birthDate").value,
    };

    // Validate required fields
    if (
      !userData.ten ||
      !userData.sdt ||
      !userData.dia_chi ||
      !userData.ngay_sinh
    ) {
      this.showNotification("Vui lòng điền đầy đủ thông tin", "error");
      return;
    }

    try {
      const response = await fetch(this.apiBaseUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success) {
        this.showNotification("Cập nhật thông tin thành công!", "success");
        this.loadUserData(); // Reload user data
        this.cancelEdit(); // Exit edit mode
      } else {
        this.showNotification(
          data.message || "Lỗi khi cập nhật thông tin",
          "error"
        );
      }
    } catch (error) {
      console.error("Error updating user info:", error);
      this.showNotification("Lỗi khi cập nhật thông tin", "error");
    }
  }

  async updatePassword() {
    const currentPassword = document.getElementById("current_password").value;
    const newPassword = document.getElementById("new_password").value;
    const confirmPassword = document.getElementById("confirm_password").value;

    if (newPassword !== confirmPassword) {
      this.showNotification("Mật khẩu xác nhận không khớp", "error");
      return;
    }

    if (newPassword.length < 6) {
      this.showNotification("Mật khẩu mới phải có ít nhất 6 ký tự", "error");
      return;
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}update_password.php`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${this.userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        this.showNotification("Đổi mật khẩu thành công!", "success");
        document.getElementById("passwordForm").reset();
      } else {
        this.showNotification(data.message || "Lỗi khi đổi mật khẩu", "error");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      this.showNotification("Lỗi khi đổi mật khẩu", "error");
    }
  }

  async handleAvatarChange(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      this.showNotification("Kích thước ảnh không được vượt quá 2MB", "error");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const response = await fetch(`${this.apiBaseUrl}upload_avatar.php`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.userToken}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        document.getElementById("profileAvatar").src = data.avatar_url;
        this.showNotification("Cập nhật ảnh đại diện thành công!", "success");
      } else {
        this.showNotification(
          data.message || "Lỗi khi cập nhật ảnh đại diện",
          "error"
        );
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      this.showNotification("Lỗi khi cập nhật ảnh đại diện", "error");
    }
  }

  // ====================================
  // ORDERS MANAGEMENT
  // ====================================
  async loadOrders() {
    const container = document.getElementById("ordersContainer");
    if (!container) return;

    container.innerHTML =
      '<div class="text-center"><i class="fas fa-spinner fa-spin"></i> Đang tải...</div>';

    try {
      const response = await fetch(`api/don_hang/get_orders_by_customer.php`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.userToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          this.renderOrders(data.orders);
        } else {
          this.renderEmptyOrders();
        }
      } else {
        this.renderEmptyOrders();
      }
    } catch (error) {
      console.error("Error loading orders:", error);
      this.renderEmptyOrders();
    }
  }

  renderOrders(orders) {
    const container = document.getElementById("ordersContainer");

    if (!orders || orders.length === 0) {
      this.renderEmptyOrders();
      return;
    }

    container.innerHTML = orders
      .map(
        (order) => `
            <div class="order-item">
                <div class="order-header">
                    <div>
                        <div class="order-id">Đơn hàng #${order.id}</div>
                        <div class="order-date">${this.formatDate(
                          order.ngay_dat
                        )}</div>
                    </div>
                    <span class="order-status ${
                      order.trang_thai
                    }">${this.getStatusText(order.trang_thai)}</span>
                </div>
                
                <div class="order-products">
                    ${
                      order.products
                        ? order.products
                            .map(
                              (product) => `
                        <div class="order-product-item">
                            <img src="${product.hinh_anh}" alt="${
                                product.ten_san_pham
                              }" class="order-product-img">
                            <div class="order-product-info">
                                <h6>${product.ten_san_pham}</h6>
                                <p>Số lượng: ${
                                  product.so_luong
                                } | Giá: ${this.formatPrice(product.gia)}</p>
                            </div>
                        </div>
                    `
                            )
                            .join("")
                        : ""
                    }
                </div>
                
                <div class="order-total">
                    Tổng tiền: ${this.formatPrice(order.tong_tien)}
                </div>
            </div>
        `
      )
      .join("");
  }

  renderEmptyOrders() {
    const container = document.getElementById("ordersContainer");
    container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-shopping-bag"></i>
                <h4>Chưa có đơn hàng nào</h4>
                <p>Bạn chưa có đơn hàng nào. Hãy mua sắm ngay!</p>
                <a href="list_product.html" class="btn btn-primary">Mua sắm ngay</a>
            </div>
        `;
  }

  filterOrders(status) {
    const orders = document.querySelectorAll(".order-item");
    orders.forEach((order) => {
      const orderStatus = order.querySelector(".order-status").classList;
      if (status === "all" || orderStatus.contains(status)) {
        order.style.display = "block";
      } else {
        order.style.display = "none";
      }
    });
  }

  // ====================================
  // ADDRESS MANAGEMENT
  // ====================================
  async loadAddresses() {
    const container = document.getElementById("addressesContainer");
    if (!container) return;

    container.innerHTML =
      '<div class="text-center"><i class="fas fa-spinner fa-spin"></i> Đang tải...</div>';

    try {
      const response = await fetch(`api/dia_chi/get_addresses.php`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.userToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          this.renderAddresses(data.addresses);
        } else {
          this.renderEmptyAddresses();
        }
      } else {
        this.renderEmptyAddresses();
      }
    } catch (error) {
      console.error("Error loading addresses:", error);
      this.renderEmptyAddresses();
    }
  }

  renderAddresses(addresses) {
    const container = document.getElementById("addressesContainer");

    if (!addresses || addresses.length === 0) {
      this.renderEmptyAddresses();
      return;
    }

    container.innerHTML = addresses
      .map(
        (address) => `
            <div class="address-item ${address.mac_dinh ? "default" : ""}">
                <div class="address-header">
                    <div class="address-name">${address.ten_nguoi_nhan}</div>
                    ${
                      address.mac_dinh
                        ? '<span class="default-badge">Mặc định</span>'
                        : ""
                    }
                </div>
                <div class="address-info">
                    <div>${address.dia_chi}</div>
                    <div>Điện thoại: ${address.so_dien_thoai}</div>
                </div>
                <div class="address-actions">
                    <button class="btn btn-sm btn-outline-secondary edit-address" data-address-id="${
                      address.id
                    }">Sửa</button>
                    ${
                      !address.mac_dinh
                        ? `<button class="btn btn-sm btn-outline-secondary set-default-address" data-address-id="${address.id}">Đặt làm mặc định</button>`
                        : ""
                    }
                    <button class="btn btn-sm btn-outline-danger delete-address" data-address-id="${
                      address.id
                    }">Xóa</button>
                </div>
            </div>
        `
      )
      .join("");
  }

  renderEmptyAddresses() {
    const container = document.getElementById("addressesContainer");
    container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-map-marker-alt"></i>
                <h4>Chưa có địa chỉ nào</h4>
                <p>Thêm địa chỉ để giao hàng thuận tiện hơn.</p>
                <button class="btn btn-primary" data-toggle="modal" data-target="#addressModal">Thêm địa chỉ</button>
            </div>
        `;
  }

  async saveAddress() {
    const form = document.getElementById("addressForm");
    const formData = new FormData(form);

    const addressData = {
      ten_nguoi_nhan: formData.get("ten_nguoi_nhan"),
      so_dien_thoai: formData.get("so_dien_thoai"),
      dia_chi: formData.get("dia_chi"),
      mac_dinh: formData.get("mac_dinh") === "on",
    };

    const addressId = form.dataset.addressId;
    const isEdit = !!addressId;

    try {
      const url = isEdit
        ? `api/dia_chi/update_address.php`
        : `api/dia_chi/create_address.php`;
      const method = isEdit ? "PUT" : "POST";

      if (isEdit) {
        addressData.id = addressId;
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${this.userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(addressData),
      });

      const data = await response.json();

      if (data.success) {
        this.showNotification(
          isEdit ? "Cập nhật địa chỉ thành công!" : "Thêm địa chỉ thành công!",
          "success"
        );
        $("#addressModal").modal("hide");
        form.reset();
        delete form.dataset.addressId;
        this.loadAddresses();
      } else {
        this.showNotification(data.message || "Lỗi khi lưu địa chỉ", "error");
      }
    } catch (error) {
      console.error("Error saving address:", error);
      this.showNotification("Lỗi khi lưu địa chỉ", "error");
    }
  }

  editAddress(addressId) {
    // Implementation would fetch address data and populate the modal form
    console.log("Edit address:", addressId);
  }

  async deleteAddress(addressId) {
    if (!confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) return;

    try {
      const response = await fetch(`api/dia_chi/delete_address.php`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${this.userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: addressId }),
      });

      const data = await response.json();

      if (data.success) {
        this.showNotification("Xóa địa chỉ thành công!", "success");
        this.loadAddresses();
      } else {
        this.showNotification(data.message || "Lỗi khi xóa địa chỉ", "error");
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      this.showNotification("Lỗi khi xóa địa chỉ", "error");
    }
  }

  async setDefaultAddress(addressId) {
    try {
      const response = await fetch(`api/dia_chi/set_default.php`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${this.userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: addressId }),
      });

      const data = await response.json();

      if (data.success) {
        this.showNotification("Đặt địa chỉ mặc định thành công!", "success");
        this.loadAddresses();
      } else {
        this.showNotification(
          data.message || "Lỗi khi đặt địa chỉ mặc định",
          "error"
        );
      }
    } catch (error) {
      console.error("Error setting default address:", error);
      this.showNotification("Lỗi khi đặt địa chỉ mặc định", "error");
    }
  }

  // ====================================
  // FAVORITES MANAGEMENT
  // ====================================
  async loadFavorites() {
    const container = document.getElementById("favoritesContainer");
    if (!container) return;

    container.innerHTML =
      '<div class="text-center"><i class="fas fa-spinner fa-spin"></i> Đang tải...</div>';

    try {
      const response = await fetch(`api/yeu_thich/get_favorites.php`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.userToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          this.renderFavorites(data.favorites);
        } else {
          this.renderEmptyFavorites();
        }
      } else {
        this.renderEmptyFavorites();
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
      this.renderEmptyFavorites();
    }
  }

  renderFavorites(favorites) {
    const container = document.getElementById("favoritesContainer");

    if (!favorites || favorites.length === 0) {
      this.renderEmptyFavorites();
      return;
    }

    container.innerHTML = `
            <div class="row">
                ${favorites
                  .map(
                    (product) => `
                    <div class="col-md-4 favorite-item">
                        <div class="favorite-card position-relative">
                            <img src="${product.hinh_anh}" alt="${
                      product.ten_san_pham
                    }" class="favorite-img">
                            <button class="remove-favorite" data-product-id="${
                              product.id
                            }">
                                <i class="fas fa-times"></i>
                            </button>
                            <div class="favorite-body">
                                <h6 class="favorite-name">${
                                  product.ten_san_pham
                                }</h6>
                                <div class="favorite-price">${this.formatPrice(
                                  product.gia
                                )}</div>
                                <a href="detail_product.html?id=${
                                  product.id
                                }" class="btn btn-sm btn-primary">Xem chi tiết</a>
                            </div>
                        </div>
                    </div>
                `
                  )
                  .join("")}
            </div>
        `;
  }

  renderEmptyFavorites() {
    const container = document.getElementById("favoritesContainer");
    container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-heart"></i>
                <h4>Chưa có sản phẩm yêu thích</h4>
                <p>Thêm sản phẩm vào danh sách yêu thích để xem lại sau.</p>
                <a href="list_product.html" class="btn btn-primary">Khám phá sản phẩm</a>
            </div>
        `;
  }

  async removeFavorite(productId) {
    try {
      const response = await fetch(`api/yeu_thich/remove_favorite.php`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${this.userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ product_id: productId }),
      });

      const data = await response.json();

      if (data.success) {
        this.showNotification("Đã xóa khỏi danh sách yêu thích", "success");
        this.loadFavorites();
      } else {
        this.showNotification(
          data.message || "Lỗi khi xóa sản phẩm yêu thích",
          "error"
        );
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
      this.showNotification("Lỗi khi xóa sản phẩm yêu thích", "error");
    }
  }

  // ====================================
  // NOTIFICATIONS MANAGEMENT
  // ====================================
  async loadNotifications() {
    const container = document.getElementById("notificationsContainer");
    if (!container) return;

    container.innerHTML =
      '<div class="text-center"><i class="fas fa-spinner fa-spin"></i> Đang tải...</div>';

    try {
      const response = await fetch(`api/thong_bao/get_notifications.php`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.userToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          this.renderNotifications(data.notifications);
        } else {
          this.renderEmptyNotifications();
        }
      } else {
        this.renderEmptyNotifications();
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
      this.renderEmptyNotifications();
    }
  }

  renderNotifications(notifications) {
    const container = document.getElementById("notificationsContainer");

    if (!notifications || notifications.length === 0) {
      this.renderEmptyNotifications();
      return;
    }

    container.innerHTML = notifications
      .map(
        (notification) => `
            <div class="notification-item ${
              notification.da_doc ? "" : "unread"
            }">
                <div class="notification-icon">
                    <i class="fas ${this.getNotificationIcon(
                      notification.loai
                    )}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-title">${
                      notification.tieu_de
                    }</div>
                    <div class="notification-message">${
                      notification.noi_dung
                    }</div>
                    <div class="notification-time">${this.formatDate(
                      notification.ngay_tao
                    )}</div>
                </div>
            </div>
        `
      )
      .join("");
  }

  renderEmptyNotifications() {
    const container = document.getElementById("notificationsContainer");
    container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bell"></i>
                <h4>Chưa có thông báo nào</h4>
                <p>Các thông báo về đơn hàng và khuyến mãi sẽ hiển thị ở đây.</p>
            </div>
        `;
  }

  async markAllNotificationsRead() {
    try {
      const response = await fetch(`api/thong_bao/mark_all_read.php`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${this.userToken}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        this.showNotification(
          "Đã đánh dấu tất cả thông báo là đã đọc",
          "success"
        );
        this.loadNotifications();
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  }

  // ====================================
  // UTILITY FUNCTIONS
  // ====================================
  formatPrice(price) {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  getStatusText(status) {
    const statusMap = {
      cho: "Chờ xử lý",
      dang_giao: "Đang giao",
      hoan_tat: "Hoàn tất",
      huy: "Đã hủy",
    };
    return statusMap[status] || status;
  }

  getNotificationIcon(type) {
    const iconMap = {
      order: "fa-shopping-bag",
      promotion: "fa-gift",
      system: "fa-info-circle",
      delivery: "fa-truck",
    };
    return iconMap[type] || "fa-bell";
  }

  showNotification(message, type = "info") {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = `alert alert-${
      type === "error" ? "danger" : type
    } alert-dismissible fade show position-fixed`;
    notification.style.cssText = `
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
        `;

    notification.innerHTML = `
            ${message}
            <button type="button" class="close" data-dismiss="alert">
                <span>&times;</span>
            </button>
        `;

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
  }

  logout() {
    if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      // Clear localStorage và redirect
      localStorage.removeItem("user_token");
      localStorage.removeItem("user_data");
      localStorage.removeItem("pending_search");
      window.location.href = "login.html";
    }
  }

  // Edit mode functions
  editPersonalInfo() {
    // Enable form fields for editing
    const fields = ["fullName", "phone", "address", "birthDate"];
    fields.forEach((fieldId) => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.readOnly = false;
        field.disabled = false;
      }
    });

    // Show form actions
    const formActions = document.querySelector(".form-actions");
    if (formActions) {
      formActions.style.display = "block";
    }

    // Hide edit button
    const editBtn = document.querySelector(".card-header .btn-primary");
    if (editBtn) {
      editBtn.style.display = "none";
    }
  }

  cancelEdit() {
    // Disable form fields
    const fields = ["fullName", "phone", "address", "birthDate"];
    fields.forEach((fieldId) => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.readOnly = true;
        field.disabled = false;
      }
    });

    // Hide form actions
    const formActions = document.querySelector(".form-actions");
    if (formActions) {
      formActions.style.display = "none";
    }

    // Show edit button
    const editBtn = document.querySelector(".card-header .btn-primary");
    if (editBtn) {
      editBtn.style.display = "inline-block";
    }

    // Reload original data
    this.loadUserData();
  }
}

// Global variable to hold the ProfileManager instance
let profileManager;

// Global functions for HTML to call
function editPersonalInfo() {
  if (profileManager) {
    profileManager.editPersonalInfo();
  }
}

function cancelEdit() {
  if (profileManager) {
    profileManager.cancelEdit();
  }
}

function changeAvatar() {
  // TODO: Implement avatar upload functionality
  alert("Chức năng thay đổi avatar sẽ được cập nhật trong phiên bản tiếp theo");
}

// Global logout function
function logout() {
  if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
    // Sử dụng AuthManager nếu có
    if (window.authManager) {
      // AuthManager.logout() đã có confirm và redirect
      localStorage.removeItem("user_token");
      localStorage.removeItem("user_data");
      localStorage.removeItem("pending_search");
      window.location.href = "login.html";
    } else {
      // Fallback logout
      localStorage.removeItem("user_token");
      localStorage.removeItem("user_data");
      window.location.href = "login.html";
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Check if user is logged in
  const userToken = localStorage.getItem("user_token");
  if (!userToken) {
    window.location.href = "login.html";
    return;
  }

  // Initialize profile manager
  profileManager = new ProfileManager();
});

// Handle modal reset when closed
$(document).ready(function () {
  $("#addressModal").on("hidden.bs.modal", function () {
    const form = document.getElementById("addressForm");
    form.reset();
    delete form.dataset.addressId;
    $("#addressModalTitle").text("Thêm địa chỉ mới");
  });
});
