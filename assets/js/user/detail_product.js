/**
 * NHAFLOWER - Product Detail Page JavaScript
 * File: detail_product.js
 * Author: NHAFLOWER Team
 * Created: 2025
 */

class ProductDetailManager {
  constructor() {
    this.API_BASE_URL = "../api/san_pham/";
    this.currentProduct = null;
    this.quantity = 1;
    this.isFavorite = false;
    this.init();
  }

  init() {
    $(document).ready(() => {
      console.log("Product Detail Manager initialized");
      this.loadProductDetail();
      this.setupEventListeners();
      this.loadRelatedProducts();
    });
  }

  setupEventListeners() {
    // Size selection
    $(".size-btn").on("click", (e) => {
      $(".size-btn").removeClass("active");
      $(e.target).addClass("active");
      this.selectedSize = $(e.target).data("size");
    });

    // Tab events
    $('a[data-toggle="tab"]').on("shown.bs.tab", (e) => {
      const targetTab = $(e.target).attr("href");
      if (targetTab === "#reviews-tab") {
        this.loadReviews();
      }
    });
  }

  // Lấy product ID từ URL parameters
  getProductIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("id") || 1; // Default to product ID 1 for demo
  }

  // Load thông tin chi tiết sản phẩm
  async loadProductDetail() {
    try {
      const productId = this.getProductIdFromUrl();
      console.log("Loading product detail for ID:", productId);

      // Show loading state
      this.showLoadingSkeleton();

      // Simulate API call - thay thế bằng API thật sau
      const mockProduct = this.getMockProductData(productId);

      // Uncomment dòng dưới khi có API thật
      // const response = await fetch(`${this.API_BASE_URL}get_product.php?id=${productId}`);
      // const product = await response.json();

      this.currentProduct = mockProduct;
      this.renderProductDetail(mockProduct);

      // Update page title
      document.title = `${mockProduct.name} - NHAFLOWER`;
    } catch (error) {
      console.error("Error loading product detail:", error);
      this.showErrorMessage("Không thể tải thông tin sản phẩm");
    }
  }

  // Mock data cho demo - sẽ thay thế bằng API call thật
  getMockProductData(productId) {
    const mockProducts = {
      1: {
        id: 1,
        name: "Hoa hồng đỏ tươi",
        price: 250000,
        originalPrice: 300000,
        description:
          "Hoa hồng đỏ tươi được chọn lọc kỹ càng, thể hiện tình yêu chân thành và sâu sắc. Với màu đỏ rực rỡ và hương thom quyến rũ, đây là lựa chọn hoàn hảo cho những dịp đặc biệt.",
        detailedDescription: `
          <h4>Đặc điểm nổi bật:</h4>
          <ul>
            <li>Hoa tươi, được cắt trong ngày</li>
            <li>Màu sắc rực rỡ, không phai màu</li>
            <li>Hương thơm tự nhiên, dịu nhẹ</li>
            <li>Thời gian tươi: 7-10 ngày với cách chăm sóc đúng</li>
          </ul>
          <h4>Ý nghĩa:</h4>
          <p>Hoa hồng đỏ là biểu tượng của tình yêu nồng nàn, sự đam mê và lòng trung thành. Thích hợp tặng người yêu, vợ/chồng trong các dịp Valentine, sinh nhật, kỷ niệm.</p>
        `,
        rating: 4.9,
        reviewCount: 156,
        category: "hoa-hong",
        images: [
          "../assets/img/products/rose-red-1.jpg",
          "../assets/img/products/rose-red-2.jpg",
          "../assets/img/products/rose-red-3.jpg",
        ],
        inStock: true,
        stockQuantity: 50,
      },
      2: {
        id: 2,
        name: "Hoa tulip vàng",
        price: 320000,
        originalPrice: 380000,
        description:
          "Hoa tulip vàng tươi sáng, mang đến niềm vui và hy vọng. Thích hợp trang trí nhà cửa hoặc làm quà tặng ý nghĩa.",
        rating: 4.8,
        reviewCount: 89,
        category: "hoa-tulip",
        images: [
          "../assets/img/products/tulip-yellow-1.jpg",
          "../assets/img/products/tulip-yellow-2.jpg",
        ],
      },
      // Thêm các sản phẩm khác...
    };

    return mockProducts[productId] || mockProducts[1];
  }

  // Hiển thị thông tin sản phẩm
  renderProductDetail(product) {
    // Update product name
    $("#productName").text(product.name);

    // Update price
    $("#productPrice").text(this.formatPrice(product.price));
    if (product.originalPrice && product.originalPrice > product.price) {
      $("#originalPrice").text(this.formatPrice(product.originalPrice)).show();
      const discount = Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      );
      $(".discount-badge").text(`-${discount}%`).show();
    } else {
      $("#originalPrice").hide();
      $(".discount-badge").hide();
    }

    // Update rating
    $("#ratingNumber").text(product.rating);
    $("#reviewCount, #tabReviewCount").text(product.reviewCount);
    this.renderStars(product.rating, "#productRating");

    // Update description
    $("#productDescription").text(product.description);
    $("#detailedDescription").html(
      product.detailedDescription || product.description
    );

    // Update images
    if (product.images && product.images.length > 0) {
      this.renderProductImages(product.images);
    }

    // Hide loading skeleton
    this.hideLoadingSkeleton();
  }

  // Render product images
  renderProductImages(images) {
    // Update main image
    $("#mainProductImage")
      .attr("src", images[0])
      .attr("alt", this.currentProduct.name);

    // Update thumbnails
    const thumbnailsHtml = images
      .map(
        (image, index) => `
      <div class="thumbnail-item ${
        index === 0 ? "active" : ""
      }" onclick="productDetailManager.changeMainImage(this)">
        <img src="${image}" alt="Hình ${index + 1}">
      </div>
    `
      )
      .join("");

    $(".thumbnail-images").html(thumbnailsHtml);
  }

  // Render rating stars
  renderStars(rating, container) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let starsHtml = "";

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        starsHtml += '<i class="fas fa-star"></i>';
      } else if (i === fullStars && hasHalfStar) {
        starsHtml += '<i class="fas fa-star-half-alt"></i>';
      } else {
        starsHtml += '<i class="far fa-star"></i>';
      }
    }

    $(container).html(starsHtml);
  }

  // Format price
  formatPrice(price) {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    })
      .format(price)
      .replace("₫", "VNĐ");
  }

  // Show loading skeleton
  showLoadingSkeleton() {
    $("#productName").addClass("loading-skeleton").text("");
    $("#productPrice").addClass("loading-skeleton").text("");
    $("#productDescription").addClass("loading-skeleton").text("");
  }

  // Hide loading skeleton
  hideLoadingSkeleton() {
    $(".loading-skeleton").removeClass("loading-skeleton");
  }

  // Show error message
  showErrorMessage(message) {
    const alertHtml = `
      <div class="alert alert-danger alert-dismissible fade show" role="alert">
        <i class="fas fa-exclamation-triangle"></i> ${message}
        <button type="button" class="close" data-dismiss="alert">
          <span>&times;</span>
        </button>
      </div>
    `;
    $(".product-detail-container").prepend(alertHtml);
  }

  // Load related products
  async loadRelatedProducts() {
    try {
      // Mock related products data
      const relatedProducts = [
        {
          id: 2,
          name: "Hoa tulip vàng",
          price: 320000,
          image: "../assets/img/products/tulip-yellow-1.jpg",
          rating: 4.8,
        },
        {
          id: 3,
          name: "Hoa lan tím",
          price: 450000,
          image: "../assets/img/products/orchid-purple-1.jpg",
          rating: 4.9,
        },
        {
          id: 4,
          name: "Hoa cúc họa mi",
          price: 180000,
          image: "../assets/img/products/daisy-white-1.jpg",
          rating: 4.7,
        },
      ];

      const relatedHtml = relatedProducts
        .map(
          (product) => `
        <div class="col-lg-4 col-md-6 mb-4">
          <div class="product-card" onclick="productDetailManager.goToProduct(${
            product.id
          })">
            <div class="product-image">
              <img src="${product.image}" alt="${
            product.name
          }" style="width: 100%; height: 200px; object-fit: cover; border-radius: 10px;">
            </div>
            <div class="product-info" style="padding: 15px; text-align: center;">
              <div class="product-name" style="font-weight: 600; margin-bottom: 10px;">${
                product.name
              }</div>
              <div class="product-price" style="color: #e74c3c; font-weight: 700;">${this.formatPrice(
                product.price
              )}</div>
              <div class="product-rating" style="margin-top: 8px;">
                ${this.getStarsHtml(product.rating)}
                <span style="margin-left: 5px; color: #6c757d;">${
                  product.rating
                }</span>
              </div>
            </div>
          </div>
        </div>
      `
        )
        .join("");

      $("#relatedProducts").html(relatedHtml);
    } catch (error) {
      console.error("Error loading related products:", error);
    }
  }

  // Get stars HTML for related products
  getStarsHtml(rating) {
    const fullStars = Math.floor(rating);
    let starsHtml = "";

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        starsHtml += '<i class="fas fa-star" style="color: #ffd700;"></i>';
      } else {
        starsHtml += '<i class="far fa-star" style="color: #ddd;"></i>';
      }
    }

    return starsHtml;
  }

  // Navigate to product
  goToProduct(productId) {
    window.location.href = `detail_product.html?id=${productId}`;
  }

  // Load reviews
  async loadReviews() {
    try {
      // Mock reviews data
      const reviews = [
        {
          id: 1,
          userName: "Nguyễn Thị Lan",
          rating: 5,
          comment: "Hoa rất tươi và đẹp, giao hàng nhanh. Tôi rất hài lòng!",
          date: "2025-07-28",
          avatar: "https://via.placeholder.com/50",
        },
        {
          id: 2,
          userName: "Trần Văn Minh",
          rating: 4,
          comment: "Chất lượng tốt, đóng gói cẩn thận. Sẽ mua lại.",
          date: "2025-07-25",
          avatar: "https://via.placeholder.com/50",
        },
      ];

      const reviewsHtml = reviews
        .map(
          (review) => `
        <div class="review-item" style="border-bottom: 1px solid #eee; padding: 20px 0;">
          <div class="d-flex">
            <img src="${review.avatar}" alt="${review.userName}" 
                 style="width: 50px; height: 50px; border-radius: 50%; margin-right: 15px;">
            <div class="flex-grow-1">
              <div class="d-flex justify-content-between align-items-start">
                <h6 style="margin: 0; color: #2c3e50;">${review.userName}</h6>
                <small style="color: #6c757d;">${review.date}</small>
              </div>
              <div style="margin: 5px 0;">
                ${this.getStarsHtml(review.rating)}
              </div>
              <p style="margin: 10px 0 0; color: #5a6c7d; line-height: 1.5;">${
                review.comment
              }</p>
            </div>
          </div>
        </div>
      `
        )
        .join("");

      $("#reviewsSection").html(reviewsHtml);
    } catch (error) {
      console.error("Error loading reviews:", error);
    }
  }
}

// Global functions for onclick events
function changeMainImage(thumbnail) {
  const newSrc = $(thumbnail).find("img").attr("src");
  const newAlt = $(thumbnail).find("img").attr("alt");

  $("#mainProductImage").attr("src", newSrc).attr("alt", newAlt);

  // Update active thumbnail
  $(".thumbnail-item").removeClass("active");
  $(thumbnail).addClass("active");
}

function openImageModal() {
  const mainImageSrc = $("#mainProductImage").attr("src");
  $("#modalImage").attr("src", mainImageSrc);
  $("#imageModal").modal("show");
}

function decreaseQuantity() {
  const currentQty = parseInt($("#quantity").val());
  if (currentQty > 1) {
    $("#quantity").val(currentQty - 1);
    productDetailManager.quantity = currentQty - 1;
  }
}

function increaseQuantity() {
  const currentQty = parseInt($("#quantity").val());
  const maxQty = 99; // Hoặc lấy từ stock quantity
  if (currentQty < maxQty) {
    $("#quantity").val(currentQty + 1);
    productDetailManager.quantity = currentQty + 1;
  }
}

function addToCart() {
  if (!productDetailManager.currentProduct) {
    alert("Đang tải thông tin sản phẩm...");
    return;
  }

  const cartItem = {
    productId: productDetailManager.currentProduct.id,
    name: productDetailManager.currentProduct.name,
    price: productDetailManager.currentProduct.price,
    quantity: productDetailManager.quantity,
    size: productDetailManager.selectedSize,
    image: productDetailManager.currentProduct.images
      ? productDetailManager.currentProduct.images[0]
      : "",
  };

  // Thêm vào localStorage hoặc gửi API
  console.log("Adding to cart:", cartItem);

  // Show success message
  showSuccessMessage("Đã thêm sản phẩm vào giỏ hàng!");
}

function buyNow() {
  addToCart();
  // Redirect to checkout
  setTimeout(() => {
    window.location.href = "checkout.html";
  }, 1000);
}

function toggleFavorite() {
  productDetailManager.isFavorite = !productDetailManager.isFavorite;
  const favoriteBtn = $(".favorite-btn");

  if (productDetailManager.isFavorite) {
    favoriteBtn.addClass("active");
    favoriteBtn.find("i").removeClass("far").addClass("fas");
    showSuccessMessage("Đã thêm vào danh sách yêu thích!");
  } else {
    favoriteBtn.removeClass("active");
    favoriteBtn.find("i").removeClass("fas").addClass("far");
    showSuccessMessage("Đã xóa khỏi danh sách yêu thích!");
  }
}

function showSuccessMessage(message) {
  const alertHtml = `
    <div class="alert alert-success alert-dismissible fade show position-fixed" 
         style="top: 100px; right: 20px; z-index: 9999; min-width: 300px;" role="alert">
      <i class="fas fa-check-circle"></i> ${message}
      <button type="button" class="close" data-dismiss="alert">
        <span>&times;</span>
      </button>
    </div>
  `;
  $("body").append(alertHtml);

  // Auto hide after 3 seconds
  setTimeout(() => {
    $(".alert-success").alert("close");
  }, 3000);
}

// Navigation functions (placeholder)
function showCategories() {
  window.location.href = "list_product.html";
}

function showSearchModal() {
  // Implement search modal
  console.log("Show search modal");
}

function showUserProfile() {
  // Implement user profile
  console.log("Show user profile");
}

function showCart() {
  // Implement cart
  console.log("Show cart");
}

// Initialize the product detail manager
const productDetailManager = new ProductDetailManager();
