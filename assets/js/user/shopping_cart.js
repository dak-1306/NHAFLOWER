/**
 * NHAFLOWER - Shopping Cart Page JavaScript
 * File: shopping_cart.js
 * Author: NHAFLOWER Team
 * Created: 2025
 */

class ShoppingCartManager {
  constructor() {
    this.cartItems = [];
    this.shippingFee = 30000;
    this.discountAmount = 0;
    this.appliedCoupon = null;
    this.init();
  }

  init() {
    $(document).ready(() => {
      console.log("Shopping Cart Manager initialized");
      this.loadCartItems();
      this.updateCartDisplay();
      this.loadRelatedProducts();
    });
  }

  // Load giỏ hàng từ localStorage
  loadCartItems() {
    try {
      const savedCart = localStorage.getItem("nhaflower_cart");
      const cartVersion = localStorage.getItem("nhaflower_cart_version");
      const currentVersion = "2.0"; // Update when image paths change

      if (savedCart && cartVersion === currentVersion) {
        this.cartItems = JSON.parse(savedCart);
        // Validate and fix image paths
        this.cartItems = this.fixImagePaths(this.cartItems);
      } else {
        // Clear old data and use demo data
        if (savedCart) {
          console.log("Clearing old cart data due to version mismatch");
          localStorage.removeItem("nhaflower_cart");
        }
        localStorage.setItem("nhaflower_cart_version", currentVersion);

        // Demo data for testing
        this.cartItems = [
          {
            id: 1,
            name: "Hoa hồng đỏ",
            price: 250000,
            originalPrice: 300000,
            quantity: 2,
            size: "Vừa",
            image: "../assets/img/products/hoa_hong_do.jpg",
            inStock: true,
            stockQuantity: 10,
          },
          {
            id: 2,
            name: "Hoa tulip vàng",
            price: 180000,
            originalPrice: 200000,
            quantity: 1,
            size: "Nhỏ",
            image: "../assets/img/products/hoa_cuc_trang.jpg",
            inStock: true,
            stockQuantity: 5,
          },
        ];
      }
    } catch (error) {
      console.error("Error loading cart items:", error);
      this.cartItems = [];
    }
  }

  // Fix image paths to use existing files
  fixImagePaths(items) {
    const availableImages = [
      "../assets/img/products/hoa_hong_do.jpg",
      "../assets/img/products/hoa_cuc_trang.jpg",
      "../assets/img/products/default-flower.svg",
    ];

    const badImagePaths = [
      "default-flower.jpg",
      "default-flower-2.jpg",
      "default-flower-3.jpg",
      "default-flower-4.jpg",
      "default-flower-5.jpg",
    ];

    return items.map((item) => {
      // Check if image path contains any bad paths
      if (badImagePaths.some((badPath) => item.image.includes(badPath))) {
        console.warn("Fixing invalid image path:", item.image);
        // Assign available images based on item ID
        const imageIndex = (item.id - 1) % availableImages.length;
        item.image = availableImages[imageIndex];
      }
      return item;
    });
  }

  // Save giỏ hàng vào localStorage
  saveCartItems() {
    try {
      localStorage.setItem("nhaflower_cart", JSON.stringify(this.cartItems));
    } catch (error) {
      console.error("Error saving cart items:", error);
    }
  }

  // Cập nhật hiển thị giỏ hàng
  updateCartDisplay() {
    const itemCount = this.getTotalItems();

    if (itemCount === 0) {
      this.showEmptyCart();
    } else {
      this.showCartItems();
    }

    this.updateCartSummary();
  }

  // Hiển thị thông báo giỏ hàng trống
  showEmptyCart() {
    $("#emptyCartMessage").show();
    $("#cartItemsList").hide();
    $("#continueShoppingSection").hide();
    $("#cartSummarySection").hide();
    $("#relatedProductsSection").show();
    $("#cartItemCount").text("0 sản phẩm");
  }

  // Hiển thị các sản phẩm trong giỏ hàng
  showCartItems() {
    $("#emptyCartMessage").hide();
    $("#cartItemsList").show();
    $("#continueShoppingSection").show();
    $("#cartSummarySection").show();
    $("#relatedProductsSection").show();

    const itemCount = this.getTotalItems();
    $("#cartItemCount").text(`${itemCount} sản phẩm`);

    this.renderCartItems();
  }

  // Render danh sách sản phẩm trong giỏ hàng
  renderCartItems() {
    const cartHtml = this.cartItems
      .map(
        (item) => `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item-image">
          <img src="${item.image}" alt="${item.name}" 
               onerror="this.src='../assets/img/products/default-flower.svg'; console.warn('Failed to load cart item image:', this.src);" />
        </div>
        
        <div class="cart-item-details">
          <div class="cart-item-name" onclick="goToProductDetail(${item.id})">
            ${item.name}
          </div>
          <div class="cart-item-price">
            ${this.formatPrice(item.price)}
            ${
              item.originalPrice && item.originalPrice > item.price
                ? `<del style="color: #999; margin-left: 10px;">${this.formatPrice(
                    item.originalPrice
                  )}</del>`
                : ""
            }
          </div>
          ${
            item.size
              ? `<div class="cart-item-size">Kích thước: ${item.size}</div>`
              : ""
          }
          <div class="cart-item-stock">
            ${
              item.inStock
                ? `<i class="fas fa-check-circle"></i> Còn hàng (${item.stockQuantity} sản phẩm)`
                : '<i class="fas fa-exclamation-circle"></i> Hết hàng'
            }
          </div>
        </div>
        
        <div class="cart-item-quantity">
          <span class="quantity-label">Số lượng:</span>
          <div class="quantity-controls">
            <button class="qty-btn" onclick="cartManager.decreaseQuantity(${
              item.id
            })">-</button>
            <input 
              type="number" 
              class="quantity-input" 
              value="${item.quantity}" 
              min="1" 
              max="${item.stockQuantity}"
              onchange="cartManager.updateQuantity(${item.id}, this.value)"
            />
            <button class="qty-btn" onclick="cartManager.increaseQuantity(${
              item.id
            })">+</button>
          </div>
        </div>
        
        <div class="cart-item-actions">
          <button class="remove-item-btn" onclick="cartManager.removeItem(${
            item.id
          })" title="Xóa sản phẩm">
            <i class="fas fa-trash"></i>
          </button>
          <div class="cart-item-total">
            ${this.formatPrice(item.price * item.quantity)}
          </div>
        </div>
      </div>
    `
      )
      .join("");

    $("#cartItemsList").html(cartHtml);
  }

  // Cập nhật tóm tắt đơn hàng
  updateCartSummary() {
    const subtotal = this.getSubtotal();
    const total = this.getTotal();

    $("#subtotalAmount").text(this.formatPrice(subtotal));
    $("#shippingFee").text(this.formatPrice(this.shippingFee));
    $("#discountAmount").text(`-${this.formatPrice(this.discountAmount)}`);
    $("#totalAmount").text(this.formatPrice(total));
  }

  // Tính tổng số sản phẩm
  getTotalItems() {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  // Tính tạm tính
  getSubtotal() {
    return this.cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }

  // Tính tổng cộng
  getTotal() {
    const subtotal = this.getSubtotal();
    return subtotal + this.shippingFee - this.discountAmount;
  }

  // Tăng số lượng sản phẩm
  increaseQuantity(itemId) {
    const item = this.cartItems.find((item) => item.id === itemId);
    if (item && item.quantity < item.stockQuantity) {
      item.quantity += 1;
      this.saveCartItems();
      this.updateCartDisplay();
    } else {
      this.showNotification("Đã đạt số lượng tối đa có thể mua!", "warning");
    }
  }

  // Giảm số lượng sản phẩm
  decreaseQuantity(itemId) {
    const item = this.cartItems.find((item) => item.id === itemId);
    if (item && item.quantity > 1) {
      item.quantity -= 1;
      this.saveCartItems();
      this.updateCartDisplay();
    }
  }

  // Cập nhật số lượng sản phẩm
  updateQuantity(itemId, newQuantity) {
    const quantity = parseInt(newQuantity);
    const item = this.cartItems.find((item) => item.id === itemId);

    if (item && quantity >= 1 && quantity <= item.stockQuantity) {
      item.quantity = quantity;
      this.saveCartItems();
      this.updateCartDisplay();
    } else {
      this.showNotification("Số lượng không hợp lệ!", "error");
      this.updateCartDisplay(); // Refresh để reset input
    }
  }

  // Xóa sản phẩm khỏi giỏ hàng
  removeItem(itemId) {
    if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?")) {
      this.cartItems = this.cartItems.filter((item) => item.id !== itemId);
      this.saveCartItems();
      this.updateCartDisplay();
      this.showNotification("Đã xóa sản phẩm khỏi giỏ hàng!", "success");
    }
  }

  // Áp dụng mã giảm giá
  applyCoupon(couponCode) {
    // Mock coupon validation
    const validCoupons = {
      GIAM10: { discount: 0.1, type: "percentage", minOrder: 100000 },
      GIAM20K: { discount: 20000, type: "fixed", minOrder: 200000 },
      FREESHIP: { discount: 30000, type: "shipping", minOrder: 150000 },
    };

    const coupon = validCoupons[couponCode.toUpperCase()];
    const subtotal = this.getSubtotal();

    if (!coupon) {
      this.showNotification("Mã giảm giá không hợp lệ!", "error");
      return;
    }

    if (subtotal < coupon.minOrder) {
      this.showNotification(
        `Đơn hàng phải từ ${this.formatPrice(
          coupon.minOrder
        )} để áp dụng mã này!`,
        "warning"
      );
      return;
    }

    if (this.appliedCoupon === couponCode.toUpperCase()) {
      this.showNotification("Mã giảm giá đã được áp dụng!", "info");
      return;
    }

    // Apply coupon
    this.appliedCoupon = couponCode.toUpperCase();

    if (coupon.type === "percentage") {
      this.discountAmount = subtotal * coupon.discount;
    } else if (coupon.type === "fixed") {
      this.discountAmount = coupon.discount;
    } else if (coupon.type === "shipping") {
      this.shippingFee = 0;
      this.discountAmount = coupon.discount;
    }

    this.updateCartSummary();
    this.showNotification("Áp dụng mã giảm giá thành công!", "success");
    $("#couponCode").val("").prop("disabled", true);
  }

  // Load sản phẩm liên quan
  loadRelatedProducts() {
    // Mock related products
    const relatedProducts = [
      {
        id: 3,
        name: "Hoa cúc họa mi",
        price: 150000,
        originalPrice: 180000,
        image: "../assets/img/products/hoa_cuc_trang.jpg",
        rating: 4.8,
      },
      {
        id: 4,
        name: "Hoa lavender",
        price: 120000,
        image: "../assets/img/products/hoa_hong_do.jpg",
        rating: 4.6,
      },
      {
        id: 5,
        name: "Hoa hướng dương",
        price: 200000,
        image: "../assets/img/products/default-flower.svg",
        rating: 4.9,
      },
    ];

    const productsHtml = relatedProducts
      .map(
        (product) => `
      <div class="col-md-4 mb-4">
        <div class="card product-card">
          <img src="${product.image}" class="card-img-top" alt="${
          product.name
        }" onerror="this.src='../assets/img/products/default-flower.svg'; console.warn('Failed to load shopping cart related product image:', this.src);">
          <div class="card-body">
            <h6 class="card-title">${product.name}</h6>
            <div class="product-price">
              <span class="current-price">${this.formatPrice(
                product.price
              )}</span>
              ${
                product.originalPrice
                  ? `<del class="original-price">${this.formatPrice(
                      product.originalPrice
                    )}</del>`
                  : ""
              }
            </div>
            <div class="product-rating">
              ${this.generateStars(product.rating)} ${product.rating}
            </div>
            <button class="btn btn-sm btn-outline-primary" onclick="addToCartFromRelated(${
              product.id
            })">
              Thêm vào giỏ
            </button>
          </div>
        </div>
      </div>
    `
      )
      .join("");

    $("#relatedProducts").html(productsHtml);
  }

  // Generate stars rating
  generateStars(rating) {
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

    return starsHtml;
  }

  // Format giá tiền
  formatPrice(price) {
    return new Intl.NumberFormat("vi-VN").format(price) + " VNĐ";
  }

  // Hiển thị thông báo
  showNotification(message, type = "info") {
    // Simple alert for now - can be enhanced with toast notifications
    const alertClass = {
      success: "alert-success",
      error: "alert-danger",
      warning: "alert-warning",
      info: "alert-info",
    };

    const notification = `
      <div class="alert ${alertClass[type]} alert-dismissible fade show position-fixed" 
           style="top: 100px; right: 20px; z-index: 9999; max-width: 400px;">
        ${message}
        <button type="button" class="close" data-dismiss="alert">
          <span>&times;</span>
        </button>
      </div>
    `;

    $("body").append(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
      $(".alert").fadeOut(() => {
        $(".alert").remove();
      });
    }, 3000);
  }

  // Tiến hành thanh toán
  proceedToCheckout() {
    if (this.cartItems.length === 0) {
      this.showNotification("Giỏ hàng của bạn đang trống!", "warning");
      return;
    }

    // Check stock availability
    const outOfStockItems = this.cartItems.filter((item) => !item.inStock);
    if (outOfStockItems.length > 0) {
      this.showNotification("Có sản phẩm hết hàng trong giỏ hàng!", "error");
      return;
    }

    // Redirect to checkout page (to be implemented)
    this.showNotification("Chuyển đến trang thanh toán...", "info");

    // For now, just show order summary
    const orderSummary = {
      items: this.cartItems,
      subtotal: this.getSubtotal(),
      shipping: this.shippingFee,
      discount: this.discountAmount,
      total: this.getTotal(),
      coupon: this.appliedCoupon,
    };

    console.log("Order Summary:", orderSummary);

    // TODO: Redirect to checkout page
    // window.location.href = 'checkout.html';
  }
}

// Global functions
function applyCoupon() {
  const couponCode = $("#couponCode").val().trim();
  if (couponCode) {
    cartManager.applyCoupon(couponCode);
  } else {
    cartManager.showNotification("Vui lòng nhập mã giảm giá!", "warning");
  }
}

function proceedToCheckout() {
  cartManager.proceedToCheckout();
}

function goToProductDetail(productId) {
  window.location.href = `detail_product.html?id=${productId}`;
}

function addToCartFromRelated(productId) {
  // TODO: Implement add to cart from related products
  cartManager.showNotification("Tính năng đang được phát triển!", "info");
}

// Common navigation functions (if not already defined)
function showCategories() {
  // Implementation for showing categories
  console.log("Show categories");
}

function showSearchModal() {
  // Implementation for search modal
  console.log("Show search modal");
}

function showUserProfile() {
  // Implementation for user profile
  console.log("Show user profile");
}

function showCart() {
  // Already on cart page
  console.log("Already on cart page");
}

// Initialize cart manager
let cartManager;
$(document).ready(() => {
  cartManager = new ShoppingCartManager();
});

// Development utility function - clear cart localStorage
function clearCartData() {
  localStorage.removeItem("nhaflower_cart");
  console.log("Cart localStorage cleared. Refresh page to load demo data.");
}

// Add to window for debugging
window.clearCartData = clearCartData;
