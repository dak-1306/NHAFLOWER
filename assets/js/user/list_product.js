class ProductList {
  constructor() {
    this.products = [];
    this.allProducts = [];
    this.categories = [];
    this.currentFilter = "all";
    this.init();
  }

  init() {
    // Load categories first, then products
    this.loadCategories().then(() => {
      this.loadProducts();
      this.setupEventListeners();
      this.checkAuth();
      this.handlePendingSearch();
      this.initializeSearchFunctionality();
    });
  }

  checkAuth() {
    const token = localStorage.getItem("userToken");
    const userData = localStorage.getItem("userData");

    if (token && userData) {
      this.updateUIForAuthenticatedUser();
    }
  }

  updateUIForAuthenticatedUser() {
    $("#loginBtn").hide();
    $("#registerBtn").hide();
    $("#userDropdown").show();

    try {
      const userData = JSON.parse(localStorage.getItem("userData"));
      if (userData.ho_ten) {
        $("#userName").text(userData.ho_ten);
      }
    } catch (e) {
      console.log("Error parsing user data:", e);
    }
  }

  async loadCategories() {
    try {
      console.log("Loading categories from API...");

      const response = await $.ajax({
        url: "/NHAFLOWER/api/san_pham/get_categories.php",
        method: "GET",
        dataType: "json",
      });

      console.log("Categories response:", response);

      if (Array.isArray(response)) {
        this.categories = response;
        console.log("Categories loaded successfully:", this.categories);
        this.renderFilterButtons();
      } else {
        console.warn("Categories API returned unexpected format");
        this.renderDefaultFilterButtons();
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      this.renderDefaultFilterButtons();
    }
  }

  renderFilterButtons() {
    console.log("Rendering filter buttons with categories:", this.categories);

    const $filterButtons = $(".filter-buttons");

    // Start with ALL button
    let buttonsHTML =
      '<button class="filter-btn active" data-filter="all">TẤT CẢ</button>';

    // Add category buttons from database
    this.categories.forEach((category) => {
      const categorySlug = this.createCategorySlug(category.ten_loai);
      console.log(
        `Creating button for ${category.ten_loai} with slug: ${categorySlug}`
      );
      buttonsHTML += `<button class="filter-btn" data-filter="${categorySlug}" data-id="${category.id_loaihoa}">${category.ten_loai}</button>`;
    });

    console.log("Final buttons HTML:", buttonsHTML);
    $filterButtons.html(buttonsHTML);

    // Re-setup event listeners for new buttons
    this.setupFilterEventListeners();
  }

  renderDefaultFilterButtons() {
    // Fallback to hardcoded buttons if API fails
    const $filterButtons = $(".filter-buttons");
    $filterButtons.html(`
      <button class="filter-btn active" data-filter="all">TẤT CẢ</button>
      <button class="filter-btn" data-filter="hoa-hong">Hoa hồng</button>
      <button class="filter-btn" data-filter="hoa-tulip">Hoa tulip</button>
      <button class="filter-btn" data-filter="hoa-lan">Hoa lan</button>
      <button class="filter-btn" data-filter="hoa-cuc">Hoa cúc</button>
      <button class="filter-btn" data-filter="hoa-huong-duong">Hoa hướng dương</button>
      <button class="filter-btn" data-filter="hoa-lily">Hoa lily</button>
    `);

    this.setupFilterEventListeners();
  }

  createCategorySlug(categoryName) {
    return categoryName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .trim();
  }

  async loadProducts() {
    try {
      $("#loading").show();

      const response = await $.ajax({
        url: "/NHAFLOWER/api/san_pham/get_all_sanpham.php",
        method: "GET",
        dataType: "json",
      });

      // Check if data is array (direct format) or has success property
      if (Array.isArray(response)) {
        this.allProducts = response;
        this.products = [...this.allProducts];
        this.renderProducts();
      } else if (response.success && response.data) {
        this.allProducts = response.data;
        this.products = [...this.allProducts];
        this.renderProducts();
      } else {
        throw new Error("Không thể tải sản phẩm");
      }
    } catch (error) {
      console.error("Error loading products:", error);
      this.showError("Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.");
    } finally {
      $("#loading").hide();
    }
  }

  getCategorySlug(categoryId) {
    // Find category in loaded categories
    const category = this.categories.find(
      (cat) => cat.id_loaihoa == categoryId
    );
    if (category) {
      return this.createCategorySlug(category.ten_loai);
    }

    // Fallback to hardcoded mapping
    const categoryMap = {
      1: "hoa-hong",
      2: "hoa-cuc",
      3: "hoa-lan",
      4: "hoa-ly",
      5: "hoa-tulip",
      6: "hoa-cam-chuong",
      7: "hoa-huong-duong",
    };
    return categoryMap[categoryId] || "khac";
  }

  formatPrice(price) {
    return new Intl.NumberFormat("vi-VN").format(price) + " VNĐ";
  }

  createProductCard(product) {
    const categorySlug = this.getCategorySlug(product.id_loaihoa);
    const formattedPrice = this.formatPrice(product.gia);

    return `
      <div class="product-card" data-category="${categorySlug}" onclick="goToProductDetail(${
      product.id_sanpham
    })">
        <div class="product-image">
          ${
            product.hinh_anh
              ? `<img src="/NHAFLOWER/assets/img/products/${product.hinh_anh}" alt="${product.ten_hoa}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.parentElement.innerHTML='<div class=\\'placeholder-image\\'><i class=\\'fas fa-image\\' style=\\'font-size: 48px; color: #ddd;\\'></i><p style=\\'margin: 10px 0 0 0; color: #999; font-size: 14px;\\'>Hình ảnh sản phẩm</p></div>'">`
              : `<div class="placeholder-image"><i class="fas fa-image" style="font-size: 48px; color: #ddd;"></i><p style="margin: 10px 0 0 0; color: #999; font-size: 14px;">Hình ảnh sản phẩm</p></div>`
          }
        </div>
        <div class="product-info">
          <div class="product-name">${product.ten_hoa}</div>
          <div class="product-price">${formattedPrice}</div>
          <div class="product-rating">
            <div class="rating-stars">
              <i class="fas fa-star"></i>
              <i class="fas fa-star"></i>
              <i class="fas fa-star"></i>
              <i class="fas fa-star"></i>
              <i class="fas fa-star"></i>
            </div>
            <span class="rating-number">4.8</span>
          </div>
          <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCartFromList(${
            product.id_sanpham
          })">
            Thêm vào giỏ
          </button>
        </div>
      </div>
    `;
  }

  renderProducts() {
    const $productsGrid = $("#productsGrid");

    if (this.products.length === 0) {
      $productsGrid.html(`
        <div class="no-products text-center">
          <p>Không có sản phẩm nào được tìm thấy.</p>
        </div>
      `);
      return;
    }

    const productsHTML = this.products
      .map((product) => this.createProductCard(product))
      .join("");
    $productsGrid.html(productsHTML);

    // Apply hover effects to dynamically created cards
    this.applyHoverEffects();
  }

  applyHoverEffects() {
    $(".product-card").each(function () {
      $(this).css("cursor", "pointer");

      $(this).on("mouseenter", function () {
        $(this).css({
          transform: "translateY(-5px)",
          "box-shadow": "0 10px 25px rgba(139, 90, 150, 0.15)",
        });
      });

      $(this).on("mouseleave", function () {
        $(this).css({
          transform: "translateY(0)",
          "box-shadow": "none",
        });
      });
    });
  }

  setupEventListeners() {
    this.setupFilterEventListeners();

    // Logout functionality
    $("#logoutBtn").on("click", this.logout);
  }

  setupFilterEventListeners() {
    // Category filter buttons
    $(".filter-btn")
      .off("click")
      .on("click", (e) => {
        const $btn = $(e.currentTarget);

        // Remove active class from all buttons
        $(".filter-btn").removeClass("active");
        // Add active class to clicked button
        $btn.addClass("active");

        // Get filter value and apply filter
        const filter = $btn.data("filter") || $btn.data("category");
        this.filterProducts(filter);
      });
  }

  filterProducts(category) {
    this.currentFilter = category;

    if (category === "all") {
      this.products = [...this.allProducts];
    } else {
      this.products = this.allProducts.filter((product) => {
        const categorySlug = this.getCategorySlug(product.id_loaihoa);
        return categorySlug === category;
      });
    }

    this.renderProducts();
  }

  searchProducts(searchTerm) {
    const term = searchTerm.toLowerCase().trim();

    if (term === "") {
      this.filterProducts(this.currentFilter);
      return;
    }

    let filteredProducts = this.allProducts;

    // Apply current category filter first
    if (this.currentFilter !== "all") {
      filteredProducts = filteredProducts.filter((product) => {
        const categorySlug = this.getCategorySlug(product.id_loaihoa);
        return categorySlug === this.currentFilter;
      });
    }

    // Then apply search filter
    this.products = filteredProducts.filter(
      (product) =>
        product.ten_hoa.toLowerCase().includes(term) ||
        (product.mo_ta && product.mo_ta.toLowerCase().includes(term))
    );

    this.renderProducts();
  }

  showError(message) {
    $("#productsGrid").html(`
      <div class="error-message text-center">
        <div class="alert alert-danger" role="alert">
          <i class="fas fa-exclamation-triangle"></i>
          <p>${message}</p>
          <button class="btn btn-primary" onclick="location.reload()">Thử lại</button>
        </div>
      </div>
    `);
  }

  logout() {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userData");
    window.location.href = "/NHAFLOWER/user/login.html";
  }

  handlePendingSearch() {
    const pendingSearch = localStorage.getItem("pending_search");
    if (pendingSearch) {
      // Xóa pending search
      localStorage.removeItem("pending_search");

      // Thực hiện tìm kiếm
      $(".search-input").val(pendingSearch);
      showNotification(`Đang tìm kiếm: "${pendingSearch}"`, "info");

      // Search products
      this.searchProducts(pendingSearch);
    }
  }

  /* ===========================================
     CHỨC NĂNG TÌM KIẾM (Search Functionality - jQuery)
     =========================================== */

  // initializeSearchFunctionality(): Khởi tạo chức năng tìm kiếm
  initializeSearchFunctionality() {
    const $searchInput = $(".search-input");
    const $searchBtn = $(".search-btn");

    if ($searchInput.length && $searchBtn.length) {
      // jQuery keypress event: Lắng nghe sự kiện nhấn phím
      $searchInput.on("keypress", (e) => {
        if (e.which === 13) {
          // Enter key
          this.performSearch($(e.target).val());
        }
      });

      // jQuery click event: Lắng nghe sự kiện click chuột
      $searchBtn.on("click", () => {
        this.performSearch($searchInput.val());
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
      $searchInput.on("input", (e) => {
        const term = $(e.target).val();
        if (term.length > 2) {
          // TODO: Implement auto-complete
          console.log("Auto-complete for:", term);
        }
      });
    }
  }

  // performSearch(): Thực hiện tìm kiếm
  performSearch(searchTerm) {
    if (searchTerm.trim()) {
      // Hiển thị loading animation
      $(".search-btn").html('<i class="fas fa-spinner fa-spin"></i>');

      // Simulate search delay
      setTimeout(() => {
        $(".search-btn").html('<i class="fas fa-search"></i>');
        showNotification("Tìm kiếm: " + searchTerm, "success");

        // Perform actual search
        this.searchProducts(searchTerm);
      }, 1000);
    } else {
      showNotification("Vui lòng nhập từ khóa tìm kiếm", "warning");
      $(".search-input").focus();
    }
  }
}

// Global functions for product interactions
function goToProductDetail(productId) {
  // Navigate to product detail page
  window.location.href = `/NHAFLOWER/user/detail_product.html?id=${productId}`;
}

function addToCartFromList(productId) {
  // Prevent navigation when clicking add to cart button
  event.stopPropagation();

  // Get product info from the global product list
  const productList = window.productListInstance;
  if (productList && productList.allProducts) {
    const product = productList.allProducts.find(
      (p) => p.id_sanpham == productId
    );
    if (product) {
      // Add to cart logic here
      console.log(`Adding product ${productId} to cart:`, {
        id: productId,
        name: product.ten_hoa,
        price: product.gia,
      });

      // Show success message
      showSuccessNotification(`Đã thêm "${product.ten_hoa}" vào giỏ hàng!`);
    }
  }
}

// Global notification function cho jQuery
function showNotification(message, type = "success") {
  const iconMap = {
    success: "check-circle",
    warning: "exclamation-triangle",
    info: "info-circle",
    danger: "exclamation-triangle",
  };

  const $notification = $("<div>").addClass(
    `alert alert-${type} position-fixed`
  );
  $notification.css({
    top: "100px",
    right: "20px",
    "z-index": "9999",
    "min-width": "300px",
    opacity: "0",
    transition: "opacity 0.3s ease",
  });

  $notification.html(`
    <i class="fas fa-${iconMap[type]}"></i> ${message}
    <button type="button" class="close">
      <span>&times;</span>
    </button>
  `);

  // Close button event
  $notification.find(".close").on("click", function () {
    $(this).parent().remove();
  });

  // Add to page
  $("body").append($notification);

  // Show with animation
  setTimeout(() => {
    $notification.css("opacity", "1");
  }, 100);

  // Auto remove after 3 seconds
  setTimeout(() => {
    $notification.animate({ opacity: 0 }, 300, function () {
      $(this).remove();
    });
  }, 3000);
}

// Show success notification
function showSuccessNotification(message) {
  // Create notification element với jQuery
  const $notification = $("<div>").addClass(
    "alert alert-success position-fixed"
  );
  $notification.css({
    top: "100px",
    right: "20px",
    "z-index": "9999",
    "min-width": "300px",
    opacity: "0",
    transition: "opacity 0.3s ease",
  });

  $notification.html(`
    <i class="fas fa-check-circle"></i> ${message}
    <button type="button" class="close">
      <span>&times;</span>
    </button>
  `);

  // Close button event
  $notification.find(".close").on("click", function () {
    $(this).parent().remove();
  });

  // Add to page
  $("body").append($notification);

  // Show with animation
  setTimeout(() => {
    $notification.css("opacity", "1");
  }, 100);

  // Auto remove after 3 seconds
  setTimeout(() => {
    $notification.animate({ opacity: 0 }, 300, function () {
      $(this).remove();
    });
  }, 3000);
}

// Header navigation functions
function showSearchModal() {
  const searchTerm = prompt("Tìm kiếm sản phẩm:");
  if (searchTerm && window.productListInstance) {
    window.productListInstance.searchProducts(searchTerm);
  }
}

function showUserProfile() {
  alert("Chuyển đến trang thông tin cá nhân");
  // Sau này có thể redirect đến profile.html
  // window.location.href = "profile.html";
}

function showCart() {
  alert("Chuyển đến giỏ hàng");
  // Sau này có thể redirect đến cart.html
  // window.location.href = "cart.html";
}

function showCategories() {
  alert("Hiển thị danh mục sản phẩm");
}

// Initialize when DOM is loaded với jQuery
$(document).ready(function () {
  window.productListInstance = new ProductList();
});
