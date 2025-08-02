/* JAVASCRIPT CHO TRANG INDEX - NHAFLOWER */

$(document).ready(function () {
  // Auth logic đã được xử lý bởi auth.js, không cần kiểm tra ở đây
  console.log("Index.js: Auth check - letting AuthManager handle redirects");

  // Khởi tạo các chức năng
  initializeSearchFunctionality();
  initializePromotionSlider();
  initializeMobileMenu();
});

/* ===========================================
   KIỂM TRA TRẠNG THÁI ĐĂNG NHẬP - DISABLED
   Auth logic được xử lý bởi AuthManager trong auth.js
   =========================================== */

function checkAuthenticationStatus() {
  // DEPRECATED: Logic này đã được chuyển sang auth.js
  // Để tương thích, chỉ log trạng thái
  const userToken = localStorage.getItem("user_token");
  const userData = localStorage.getItem("user_data");

  if (userToken && userData) {
    console.log("User đã đăng nhập, để AuthManager xử lý redirect");
  } else {
    console.log("User chưa đăng nhập, ở lại trang index");
  }
}

/* ===========================================
   CÁC HÀM ĐIỀU HƯỚNG (Navigation Functions)
   =========================================== */

// showCategories(): Hàm hiển thị danh mục sản phẩm
function showCategories() {
  showNotification("Vui lòng đăng nhập để xem danh sách sản phẩm", "warning");
  setTimeout(() => {
    window.location.href = "login.html";
  }, 2000);
}

// viewMoreDeals(): Hàm xem thêm ưu đãi
function viewMoreDeals() {
  showNotification("Vui lòng đăng nhập để xem thêm ưu đãi", "warning");
  setTimeout(() => {
    window.location.href = "login.html";
  }, 2000);
}

/* ===========================================
   CHỨC NĂNG SLIDER KHUYẾN MÃI
   =========================================== */

let currentSlide = 0;
let totalSlides = 3; // Số slide khuyến mãi
let slideInterval;

// Dữ liệu slides khuyến mãi
const promoSlides = [
  {
    title: "Ưu đãi tháng 8",
    subtitle: "Giảm đến 50%",
    description: "Đến hẹn lại lên cho những khách hàng thân thiết",
    image: "../assets/img/user/promo1.jpg",
  },
  {
    title: "Flash Sale cuối tuần",
    subtitle: "Giảm đến 70%",
    description: "Săn sale ngay hôm nay để nhận ưu đãi tốt nhất",
    image: "../assets/img/user/promo2.jpg",
  },
  {
    title: "Khuyến mãi sinh nhật",
    subtitle: "Giảm đến 60%",
    description: "Chúc mừng sinh nhật NHAFLOWER với nhiều ưu đãi hấp dẫn",
    image: "../assets/img/user/promo3.jpg",
  },
];

// previousSlide(): Hàm chuyển về slide trước
function previousSlide() {
  currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
  updateSlideContent();
  resetSlideInterval();
}

// nextSlide(): Hàm chuyển đến slide sau
function nextSlide() {
  currentSlide = (currentSlide + 1) % totalSlides;
  updateSlideContent();
  resetSlideInterval();
}

// updateSlideContent(): Cập nhật nội dung slide
function updateSlideContent() {
  const slide = promoSlides[currentSlide];

  // Fade out effect
  $(".promo-content").fadeOut(300, function () {
    // Update content
    $(".promo-title").text(slide.title);
    $(".promo-subtitle").text(slide.subtitle);
    $(".promo-description").text(slide.description);

    // Fade in effect
    $(".promo-content").fadeIn(300);
  });

  console.log("Current slide:", currentSlide, slide);
}

// initializePromotionSlider(): Khởi tạo slider tự động
function initializePromotionSlider() {
  // Cập nhật slide đầu tiên
  updateSlideContent();

  // Tự động chuyển slide sau 5 giây
  slideInterval = setInterval(function () {
    nextSlide();
  }, 5000);

  // Dừng auto slide khi hover
  $(".promo-section").hover(
    function () {
      clearInterval(slideInterval);
    },
    function () {
      slideInterval = setInterval(function () {
        nextSlide();
      }, 5000);
    }
  );
}

// resetSlideInterval(): Reset interval khi user tương tác
function resetSlideInterval() {
  clearInterval(slideInterval);
  slideInterval = setInterval(function () {
    nextSlide();
  }, 5000);
}

/* ===========================================
   CHỨC NĂNG TÌM KIẾM
   =========================================== */

function initializeSearchFunctionality() {
  const $searchInput = $(".search-input");
  const $searchBtn = $(".search-btn");

  // Xử lý sự kiện nhấn nút tìm kiếm
  $searchBtn.on("click", function () {
    handleSearch();
  });

  // Xử lý sự kiện nhấn Enter trong ô tìm kiếm
  $searchInput.on("keypress", function (e) {
    if (e.which === 13) {
      // Enter key
      handleSearch();
    }
  });

  // Placeholder animation
  $searchInput.on("focus", function () {
    $(this).addClass("focused");
  });

  $searchInput.on("blur", function () {
    if ($(this).val() === "") {
      $(this).removeClass("focused");
    }
  });
}

// handleSearch(): Xử lý tìm kiếm
function handleSearch() {
  const searchTerm = $(".search-input").val().trim();

  if (searchTerm === "") {
    showNotification("Vui lòng nhập từ khóa tìm kiếm", "warning");
    return;
  }

  // Yêu cầu đăng nhập để tìm kiếm
  showNotification("Vui lòng đăng nhập để tìm kiếm sản phẩm", "info");

  // Lưu từ khóa tìm kiếm để dùng sau khi đăng nhập
  localStorage.setItem("pending_search", searchTerm);

  setTimeout(() => {
    window.location.href = "login.html";
  }, 2000);
}

// showSearchModal(): Hiển thị modal tìm kiếm (cho mobile)
function showSearchModal() {
  showNotification("Vui lòng đăng nhập để tìm kiếm", "info");
  setTimeout(() => {
    window.location.href = "login.html";
  }, 2000);
}

/* ===========================================
   RESPONSIVE MENU
   =========================================== */

function initializeMobileMenu() {
  // Xử lý toggle menu trên mobile
  $(".navbar-toggler").on("click", function () {
    const $navbarNav = $("#navbarNav");
    $navbarNav.toggleClass("show");
  });

  // Đóng menu khi click outside
  $(document).on("click", function (e) {
    if (!$(e.target).closest(".navbar").length) {
      $("#navbarNav").removeClass("show");
    }
  });
}

/* ===========================================
   NOTIFICATION SYSTEM
   =========================================== */

function showNotification(message, type = "info", duration = 3000) {
  // Remove existing notifications
  $(".notification-toast").remove();

  // Determine notification class and icon
  let notificationClass = "notification-info";
  let iconClass = "fa-info-circle";

  switch (type) {
    case "success":
      notificationClass = "notification-success";
      iconClass = "fa-check-circle";
      break;
    case "error":
      notificationClass = "notification-error";
      iconClass = "fa-exclamation-circle";
      break;
    case "warning":
      notificationClass = "notification-warning";
      iconClass = "fa-exclamation-triangle";
      break;
    default:
      notificationClass = "notification-info";
      iconClass = "fa-info-circle";
  }

  // Create notification element
  const notification = $(`
    <div class="notification-toast ${notificationClass}">
      <div class="notification-content">
        <i class="fas ${iconClass}"></i>
        <span class="notification-message">${message}</span>
      </div>
      <button class="notification-close">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `);

  // Add to page
  $("body").append(notification);

  // Show with animation
  setTimeout(() => {
    notification.addClass("show");
  }, 100);

  // Auto hide
  setTimeout(() => {
    notification.removeClass("show");
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, duration);

  // Manual close
  notification.find(".notification-close").on("click", function () {
    notification.removeClass("show");
    setTimeout(() => {
      notification.remove();
    }, 300);
  });
}
