/* JAVASCRIPT TÙY CHỈNH CHO TRANG HOME - NHAFLOWER (Sử dụng jQuery) */

// Đợi trang và jQuery load xong trước khi chạy code
$(document).ready(function () {
  // KHỞI TẠO CÁC CHỨC NĂNG
  initializeSearchFunctionality();
  initializePromotionSlider();
  initializeMobileMenu();
});

/* ===========================================
   CÁC HÀM ĐIỀU HƯỚNG (Navigation Functions)
   =========================================== */

// showCategories(): Hàm hiển thị danh mục sản phẩm
function showCategories() {
  showNotification("Tính năng danh sách đang được phát triển", "info");
  // TODO: Implement actual categories display
  // $('#categories-modal').modal('show'); // Example with Bootstrap modal
}

// viewMoreDeals(): Hàm xem thêm ưu đãi
function viewMoreDeals() {
  showNotification("Tính năng xem thêm ưu đãi đang được phát triển", "info");
  // TODO: Redirect to deals page or open modal
  // window.location.href = 'deals.html';
}

/* ===========================================
   CHỨC NĂNG SLIDER KHUYẾN MÃI (jQuery)
   =========================================== */

let currentSlide = 0;
let totalSlides = 1; // Sẽ được cập nhật khi có nhiều slide
let slideInterval;

// previousSlide(): Hàm chuyển về slide trước
function previousSlide() {
  currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
  updateSlideContent();
  console.log("Previous slide:", currentSlide);
}

// nextSlide(): Hàm chuyển đến slide sau
function nextSlide() {
  currentSlide = (currentSlide + 1) % totalSlides;
  updateSlideContent();
  console.log("Next slide:", currentSlide);
}

// updateSlideContent(): Cập nhật nội dung slide
function updateSlideContent() {
  const slides = [
    {
      title: "Ưu đãi tháng 7...",
      subtitle: "Giảm đến 50%...",
      description: "Đến hẹn lại lên, chương trình khuyến mãi lớn nhất năm...",
    },
    // TODO: Thêm nhiều slide khác
  ];

  if (slides[currentSlide]) {
    $(".promo-title").fadeOut(200, function () {
      $(this).text(slides[currentSlide].title).fadeIn(200);
    });
    $(".promo-subtitle").fadeOut(200, function () {
      $(this).text(slides[currentSlide].subtitle).fadeIn(200);
    });
    $(".promo-description").fadeOut(200, function () {
      $(this).text(slides[currentSlide].description).fadeIn(200);
    });
  }
}

// initializePromotionSlider(): Khởi tạo slider khuyến mãi
function initializePromotionSlider() {
  // Auto slide every 5 seconds
  slideInterval = setInterval(nextSlide, 5000);

  // Pause auto slide when hover
  $(".promo-section").hover(
    function () {
      clearInterval(slideInterval);
    },
    function () {
      slideInterval = setInterval(nextSlide, 5000);
    }
  );

  // Smooth animation for navigation arrows
  $(".navigation-arrows").hover(
    function () {
      $(this).addClass("animate__pulse");
    },
    function () {
      $(this).removeClass("animate__pulse");
    }
  );
}

/* ===========================================
   CHỨC NĂNG TÌM KIẾM (Search Functionality - jQuery)
   =========================================== */

// initializeSearchFunctionality(): Khởi tạo chức năng tìm kiếm
function initializeSearchFunctionality() {
  const $searchInput = $(".search-input");
  const $searchBtn = $(".search-btn");

  if ($searchInput.length && $searchBtn.length) {
    // jQuery keypress event: Lắng nghe sự kiện nhấn phím
    $searchInput.on("keypress", function (e) {
      if (e.which === 13) {
        // Enter key
        performSearch($(this).val());
      }
    });

    // jQuery click event: Lắng nghe sự kiện click chuột
    $searchBtn.on("click", function () {
      performSearch($searchInput.val());
    });

    // Focus/blur effects với jQuery
    $searchInput
      .on("focus", function () {
        $(this).parent().addClass("search-focused");
      })
      .on("blur", function () {
        $(this).parent().removeClass("search-focused");
      });

    // Auto-complete suggestion (placeholder)
    $searchInput.on("input", function () {
      const term = $(this).val();
      if (term.length > 2) {
        // TODO: Implement auto-complete
        console.log("Auto-complete for:", term);
      }
    });
  }
}

// performSearch(): Thực hiện tìm kiếm
function performSearch(searchTerm) {
  if (searchTerm.trim()) {
    // Hiển thị loading animation
    $(".search-btn").html('<i class="fas fa-spinner fa-spin"></i>');

    // Simulate search delay
    setTimeout(function () {
      $(".search-btn").html('<i class="fas fa-search"></i>');
      showNotification("Tìm kiếm: " + searchTerm, "success");

      // TODO: Implement actual search functionality
      // $.ajax({
      //     url: 'search.php',
      //     method: 'GET',
      //     data: { q: searchTerm },
      //     success: function(response) {
      //         // Handle search results
      //     }
      // });

      console.log("Searching for:", searchTerm);
    }, 1000);
  } else {
    showNotification("Vui lòng nhập từ khóa tìm kiếm", "warning");
    $(".search-input").focus();
  }
}

/* ===========================================
   CHỨC NĂNG RESPONSIVE & UI (jQuery)
   =========================================== */

// initializeMobileMenu(): Khởi tạo menu mobile
function initializeMobileMenu() {
  $(".navbar-toggler").on("click", function () {
    $(".navbar-collapse").slideToggle(300);
  });

  // Close mobile menu when clicking outside
  $(document).on("click", function (e) {
    if (!$(e.target).closest(".navbar").length) {
      $(".navbar-collapse").slideUp(300);
    }
  });
}

// handleMobileMenu(): Xử lý menu mobile (deprecated - use initializeMobileMenu)
function handleMobileMenu() {
  console.log("Use initializeMobileMenu() instead");
}

// smoothScroll(): Cuộn mượt đến phần tử
function smoothScroll(targetId) {
  const $element = $("#" + targetId);
  if ($element.length) {
    $("html, body").animate(
      {
        scrollTop: $element.offset().top - 100,
      },
      800,
      "easeInOutQuart"
    );
  }
}

// addScrollAnimations(): Thêm animation khi scroll
function addScrollAnimations() {
  $(window).on("scroll", function () {
    const scrollTop = $(this).scrollTop();

    // Navbar background opacity effect
    if (scrollTop > 50) {
      $(".navbar-custom").addClass("navbar-scrolled");
    } else {
      $(".navbar-custom").removeClass("navbar-scrolled");
    }

    // Parallax effect for main content
    $(".main-content").css(
      "transform",
      "translateY(" + scrollTop * 0.1 + "px)"
    );
  });
}

/* ===========================================
   UTILITY FUNCTIONS (jQuery)
   =========================================== */

// showNotification(): Hiển thị thông báo với jQuery
function showNotification(message, type = "info") {
  // Remove existing notifications
  $(".notification").remove();

  // Create notification element
  const notificationClass = `notification alert alert-${getBootstrapClass(
    type
  )} alert-dismissible fade show`;
  const notification = $(`
        <div class="${notificationClass}" style="position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 300px;">
            <strong>${type.toUpperCase()}:</strong> ${message}
            <button type="button" class="close" data-dismiss="alert">
                <span>&times;</span>
            </button>
        </div>
    `);

  // Add to body and auto-remove after 3 seconds
  $("body").append(notification);
  setTimeout(function () {
    notification.fadeOut(500, function () {
      $(this).remove();
    });
  }, 3000);
}

// getBootstrapClass(): Chuyển đổi type thành Bootstrap class
function getBootstrapClass(type) {
  const classMap = {
    info: "info",
    success: "success",
    warning: "warning",
    error: "danger",
    danger: "danger",
  };
  return classMap[type] || "info";
}

// validateForm(): Kiểm tra form hợp lệ với jQuery
function validateForm($formElement) {
  let isValid = true;

  // Reset previous validation
  $formElement.find(".is-invalid").removeClass("is-invalid");

  // Validate required fields
  $formElement.find("[required]").each(function () {
    const $field = $(this);
    if (!$field.val().trim()) {
      $field.addClass("is-invalid");
      isValid = false;
    }
  });

  // Validate email fields
  $formElement.find('input[type="email"]').each(function () {
    const $field = $(this);
    const email = $field.val();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email && !emailRegex.test(email)) {
      $field.addClass("is-invalid");
      isValid = false;
    }
  });

  return isValid;
}

// debounce(): Hàm delay execution để tối ưu performance
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// fadeInElements(): Animation fade in cho elements
function fadeInElements() {
  $(".fade-in").each(function () {
    const $element = $(this);
    const elementTop = $element.offset().top;
    const windowBottom = $(window).scrollTop() + $(window).height();

    if (elementTop < windowBottom - 100) {
      $element.addClass("fade-in-visible");
    }
  });
}
