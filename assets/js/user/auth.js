/* ====================================
   AUTHENTICATION MANAGER - NHAFLOWER
   ==================================== */

class AuthManager {
  constructor() {
    this.userToken = localStorage.getItem("user_token");
    this.userData = localStorage.getItem("user_data");
    this.nhaflowerUser = localStorage.getItem("nhaflower_user");
  }

  // Kiểm tra xem user đã đăng nhập chưa
  isAuthenticated() {
    return !!(this.userToken && this.userData);
  }

  // Lấy thông tin user hiện tại
  getCurrentUser() {
    if (!this.isAuthenticated()) return null;
    try {
      // Ưu tiên trả về nhaflower_user nếu có
      if (this.nhaflowerUser) {
        return JSON.parse(this.nhaflowerUser);
      }
      return JSON.parse(this.userData);
    } catch (error) {
      console.error("Error parsing user data:", error);
      this.logout();
      return null;
    }
  }

  // Đăng nhập user
  login(token, userData) {
    localStorage.setItem("user_token", token);
    localStorage.setItem("user_data", JSON.stringify(userData));
    // Đồng bộ lưu nhaflower_user
    localStorage.setItem(
      "nhaflower_user",
      JSON.stringify({
        id_taikhoan: userData.id_taikhoan,
        id_khachhang: userData.id_khachhang || null,
        email: userData.email,
        ten: userData.ten || userData.ho_ten || "",
        sdt: userData.sdt || "",
        dia_chi: userData.dia_chi || "",
        ngay_sinh: userData.ngay_sinh || "",
      })
    );
    this.userToken = token;
    this.userData = JSON.stringify(userData);
  }

  // Đăng xuất user
  logout() {
    localStorage.removeItem("user_token");
    localStorage.removeItem("user_data");
    localStorage.removeItem("pending_search");
    this.userToken = null;
    this.userData = null;

    // Redirect về trang login
    window.location.href = "login.html";
  }

  // Chuyển hướng dựa trên trạng thái đăng nhập
  redirectBasedOnAuth() {
    const currentPage = window.location.pathname;
    const isAuthenticated = this.isAuthenticated();

    console.log("=== AUTH REDIRECT CHECK ===");
    console.log("Current Page:", currentPage);
    console.log("Is Authenticated:", isAuthenticated);

    // PRIORITY 1: Xử lý login/register pages TRƯỚC
    if (
      currentPage.includes("login.html") ||
      currentPage.includes("register.html")
    ) {
      if (isAuthenticated) {
        console.log("Redirect: login/register -> home (already authenticated)");
        window.location.href = "home.html";
        return;
      } else {
        console.log("Stay on login/register page (not authenticated)");
        return; // ← Quan trọng: ở lại trang login/register
      }
    }

    // PRIORITY 2: Xử lý index và home
    if (currentPage.includes("index.html") && isAuthenticated) {
      console.log("Redirect: index -> home");
      window.location.href = "home.html";
      return;
    }

    if (currentPage.includes("home.html") && !isAuthenticated) {
      console.log("Redirect: home -> index");
      window.location.href = "index.html";
      return;
    }

    // PRIORITY 3: Xử lý protected pages
    const protectedPages = [
      "profile/",
      "shopping_cart.html",
      "list_product.html",
      "detail_product.html",
    ];
    const isProtectedPage = protectedPages.some((page) =>
      currentPage.includes(page)
    );

    if (isProtectedPage && !isAuthenticated) {
      console.log("Redirect: protected page -> login");
      localStorage.setItem("redirect_after_login", currentPage);
      window.location.href = "login.html";
      return;
    }

    console.log("No redirect needed");
  }

  // Cập nhật UI dựa trên trạng thái đăng nhập
  updateNavigationUI() {
    const user = this.getCurrentUser();

    if (user) {
      // Cập nhật avatar nếu có
      const userAvatarElement = document.querySelector(".user-avatar");
      if (userAvatarElement && user.avatar) {
        userAvatarElement.innerHTML = `<img src="${user.avatar}" alt="Avatar" class="rounded-circle" width="100%" height="100%">`;
      }

      // Cập nhật tooltip
      if (userAvatarElement) {
        userAvatarElement.setAttribute(
          "title",
          `${user.ho_ten || user.email} - Trang cá nhân`
        );
      }

      // Hiển thị/ẩn các element dựa trên auth status
      document.querySelectorAll('[data-auth="required"]').forEach((el) => {
        el.style.display = "block";
      });

      document.querySelectorAll('[data-auth="guest"]').forEach((el) => {
        el.style.display = "none";
      });
    } else {
      // Hiển thị/ẩn các element cho guest
      document.querySelectorAll('[data-auth="required"]').forEach((el) => {
        el.style.display = "none";
      });

      document.querySelectorAll('[data-auth="guest"]').forEach((el) => {
        el.style.display = "block";
      });
    }
  }

  // Xử lý redirect sau khi đăng nhập thành công
  handlePostLoginRedirect() {
    const redirectUrl = localStorage.getItem("redirect_after_login");

    if (redirectUrl) {
      localStorage.removeItem("redirect_after_login");
      window.location.href = redirectUrl;
    } else {
      window.location.href = "home.html";
    }
  }

  // Kiểm tra và xử lý pending search
  handlePendingSearch() {
    const pendingSearch = localStorage.getItem("pending_search");

    if (pendingSearch && this.isAuthenticated()) {
      localStorage.removeItem("pending_search");

      // Hiển thị notification
      if (typeof showNotification === "function") {
        showNotification(`Đang tìm kiếm: "${pendingSearch}"`, "info");
      }

      // Chuyển hướng tới trang tìm kiếm
      setTimeout(() => {
        window.location.href = `list_product.html?search=${encodeURIComponent(
          pendingSearch
        )}`;
      }, 1500);

      return true;
    }

    return false;
  }
}

// Tạo instance global
window.authManager = new AuthManager();

// Utility functions
function requireAuth() {
  if (!window.authManager.isAuthenticated()) {
    if (typeof showNotification === "function") {
      showNotification("Vui lòng đăng nhập để tiếp tục", "warning");
    }

    setTimeout(() => {
      window.location.href = "login.html";
    }, 2000);

    return false;
  }
  return true;
}

function redirectToLogin(message = "Vui lòng đăng nhập để tiếp tục") {
  if (typeof showNotification === "function") {
    showNotification(message, "info");
  }

  setTimeout(() => {
    window.location.href = "login.html";
  }, 2000);
}

function logout() {
  if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
    window.authManager.logout();

    if (typeof showNotification === "function") {
      showNotification("Đã đăng xuất thành công!", "success");
    }

    setTimeout(() => {
      window.location.href = "index.html";
    }, 1500);
  }
}

// Auto-initialize on page load
document.addEventListener("DOMContentLoaded", function () {
  // Kiểm tra và chuyển hướng dựa trên auth status
  window.authManager.redirectBasedOnAuth();

  // Cập nhật UI
  window.authManager.updateNavigationUI();

  // Xử lý pending search nếu có
  window.authManager.handlePendingSearch();
});
