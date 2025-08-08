/**
 * NHAFLOWER - Profile Dashboard JavaScript
 * File: profile-dashboard.js
 * Author: NHAFLOWER Team
 * Created: 2025
 */

class ProfileDashboard {
  constructor() {
    this.init();
  }

  init() {
    $(document).ready(() => {
      console.log("Profile Dashboard initialized");
      this.loadUserData();
      this.loadDashboardStats();
      this.loadRecentOrders();
    });
  }

  loadUserData() {
    // Mock user data
    const userData = {
      name: "Nguyễn Văn An",
      email: "nguyenvanan@email.com",
      avatar: "../../assets/img/user/default-avatar.png",
    };

    $("#profileName").text(userData.name);
    $("#profileEmail").text(userData.email);
    $("#profileAvatar").attr("src", userData.avatar);
  }

  loadDashboardStats() {
    // Mock stats data
    const stats = {
      totalOrders: 12,
      totalFavorites: 8,
      totalAddresses: 2,
      unreadNotifications: 3,
    };

    $("#totalOrders").text(stats.totalOrders);
    $("#totalFavorites").text(stats.totalFavorites);
    $("#totalAddresses").text(stats.totalAddresses);
    $("#unreadNotifications").text(stats.unreadNotifications);
  }

  loadRecentOrders() {
    // Mock recent orders
    const recentOrders = [
      {
        id: "DH001",
        date: "15/12/2024",
        status: "completed",
        statusText: "Hoàn thành",
        total: "530,000 VNĐ",
        productName: "Hoa hồng đỏ tươi",
      },
      {
        id: "DH002",
        date: "10/12/2024",
        status: "shipping",
        statusText: "Đang giao",
        total: "380,000 VNĐ",
        productName: "Hoa cúc trắng thanh khiết",
      },
    ];

    const ordersHtml = recentOrders
      .map(
        (order) => `
      <div class="recent-order-item">
        <div class="order-info">
          <h6>${order.id}</h6>
          <p>${order.productName}</p>
          <small>${order.date}</small>
        </div>
        <div class="order-status">
          <span class="badge badge-${
            order.status === "completed" ? "success" : "warning"
          }">
            ${order.statusText}
          </span>
          <div class="order-total">${order.total}</div>
        </div>
      </div>
    `
      )
      .join("");

    $("#recentOrdersList").html(ordersHtml);
  }
}

// Global functions
function changeAvatar() {
  alert("Tính năng thay đổi avatar đang được phát triển");
}

function logout() {
  if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
    localStorage.removeItem("nhaflower_user");
    localStorage.removeItem("nhaflower_cart");
    window.location.href = "../login.html";
  }
}

// Initialize dashboard
const profileDashboard = new ProfileDashboard();
