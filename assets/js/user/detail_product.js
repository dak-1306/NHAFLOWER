/**
 * NHAFLOWER - Product Detail Page JavaScript
 * File: detail_product.js
 * Author: NHAFLOWER Team
 * Created: 2025
 */

class ProductDetailManager {
  async loadProductComments(productId) {
    console.log("[DEBUG] productId:", productId);
    try {
      const response = await fetch(`../api/danh_gia.php?action=get_all`);
      const result = await response.json();
      console.log("[DEBUG] API result:", result);
      if (result && result.data) {
        console.dir(result.data);
      }
      if (result.success && Array.isArray(result.data)) {
        // Lọc bình luận theo sản phẩm
        const comments = result.data.filter(
          (c) => String(c.id_sanpham) == String(productId)
        );
        // Tính số lượng và trung bình số sao
        const reviewCount = comments.length;
        const avgRating = reviewCount
          ? comments.reduce((sum, c) => sum + Number(c.sao || 0), 0) /
            reviewCount
          : 0;
        // Hiển thị số sao và số lượng đánh giá thật
        if (document.getElementById("productRating")) {
          document.getElementById(
            "productRating"
          ).innerHTML = `${this.getStarsHtml(
            avgRating
          )} <span style="margin-left:6px;color:#6c757d;">${avgRating.toFixed(
            1
          )} (${reviewCount} đánh giá)</span>`;
        }
        this.renderProductComments(comments);
      } else {
        $("#productComments").html(
          '<div class="text-muted">Chưa có bình luận nào.</div>'
        );
      }
    } catch (err) {
      $("#productComments").html(
        '<div class="text-danger">Lỗi tải bình luận.</div>'
      );
    }
  }

  renderProductComments(comments) {
    if (!comments.length) {
      $("#productComments").html(
        '<div class="text-muted">Chưa có bình luận nào.</div>'
      );
      return;
    }
    const html = comments
      .map(
        (c) => `
      <div class="comment-item mb-3 p-3 border rounded">
        <div class="d-flex align-items-center mb-1">
          <span class="font-weight-bold mr-2">${
            c.ten_khachhang || "Ẩn danh"
          }</span>
          <span class="text-warning">${"★".repeat(c.sao || 0)}${"☆".repeat(
          5 - (c.sao || 0)
        )}</span>
          <span class="ml-2 text-muted" style="font-size:13px;">${
            c.ngay_danhgia ? c.ngay_danhgia.split(" ")[0] : ""
          }</span>
        </div>
        <div class="comment-content">${c.noi_dung || ""}</div>
      </div>
    `
      )
      .join("");
    $("#productComments").html(html);
  }
  constructor() {
    this.API_BASE_URL = "../api/products.php";
    this.currentProduct = null;
    this.quantity = 1;
    this.isFavorite = false;
    this.init();
  }

  init() {
    $(document).ready(() => {
      this.loadProductDetail();
      this.setupEventListeners();
      this.setupCommentForm();
    });
  }

  setupCommentForm() {
    $(document).on("submit", "#addCommentForm", async (e) => {
      e.preventDefault();
      const content = $("#commentContent").val().trim();
      const rating = parseInt($("#commentRating").val(), 10);
      if (!content || !rating) {
        $("#commentMsg")
          .text("Vui lòng nhập nội dung và chọn số sao.")
          .addClass("text-danger");
        return;
      }
      // Lấy thông tin user từ localStorage
      const user = JSON.parse(localStorage.getItem("nhaflower_user") || "{}");
      if (!user.id_khachhang) {
        $("#commentMsg")
          .text("Bạn cần đăng nhập để bình luận.")
          .addClass("text-danger");
        return;
      }
      // Gửi bình luận lên API
      const payload = {
        id_khachhang: user.id_khachhang,
        id_sanpham: this.currentProduct.id,
        sao: rating,
        noi_dung: content,
      };
      try {
        const res = await fetch("../api/danh_gia.php?action=add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (result.success) {
          $("#commentMsg")
            .text("Gửi bình luận thành công!")
            .removeClass("text-danger")
            .addClass("text-success");
          $("#addCommentForm")[0].reset();
          this.loadProductComments(this.currentProduct.id);
        } else {
          $("#commentMsg")
            .text(result.message || "Gửi bình luận thất bại.")
            .addClass("text-danger");
        }
      } catch (err) {
        $("#commentMsg").text("Lỗi gửi bình luận.").addClass("text-danger");
      }
    });
  }

  setupEventListeners() {
    // Nút tăng/giảm số lượng (nếu có trong DOM)
    $(document).on("click", ".qty-plus", () => {
      this.setQuantity(this.quantity + 1);
    });

    $(document).on("click", ".qty-minus", () => {
      this.setQuantity(Math.max(1, this.quantity - 1));
    });

    $(document).on("input", "#quantity", (e) => {
      const n = parseInt(e.target.value || "1", 10);
      if (!isNaN(n) && n > 0) {
        this.setQuantity(n);
      }
    });

    // Thêm vào giỏ (nếu có id hoặc class)
    $(document).on("click", "#addToCart, .add-to-cart", () => this.addToCart());

    // Mua ngay
    $(document).on("click", "#buyNow, .buy-now", () => this.buyNow());

    // Yêu thích
    $(document).on("click", ".favorite-btn", () => this.toggleFavorite());
  }

  // --- Helpers ---

  getProductIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("id") || 1; // fallback demo
  }

  formatPrice(price) {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    })
      .format(price)
      .replace("₫", "VNĐ");
  }

  getStarsHtml(rating = 4.8) {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return (
      "<span class='rating-stars'>" +
      "★".repeat(full) +
      (half ? "☆" : "") +
      "☆".repeat(empty) +
      "</span>"
    );
  }

  showLoadingSkeleton() {
    $("#productName").addClass("loading-skeleton").text("");
    $("#productPrice").addClass("loading-skeleton").text("");
    $("#productDescription").addClass("loading-skeleton").text("");
    $("#productGallery").addClass("loading-skeleton").empty();
  }

  hideLoadingSkeleton() {
    $(".loading-skeleton").removeClass("loading-skeleton");
  }

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

  // --- Data ---

  async loadProductDetail() {
    try {
      const productId = this.getProductIdFromUrl();
      this.showLoadingSkeleton();

      const response = await fetch(
        `${this.API_BASE_URL}?action=get_sanpham&id=${productId}`
      );
      const result = await response.json();

      let productRaw = null;
      if (result && result.success && result.data) {
        productRaw = result.data;
      } else {
        // fallback mock nếu API lỗi
        productRaw = this.getMockProductData(productId);
        if (!productRaw) throw new Error("Không tìm thấy sản phẩm");
      }

      this.currentProduct = {
        id: productRaw.id_sanpham ?? productRaw.id,
        name: productRaw.ten_hoa ?? productRaw.name,
        price: Number(productRaw.gia ?? productRaw.price ?? 0),
        originalPrice: Number(
          productRaw.gia_goc ?? productRaw.originalPrice ?? productRaw.gia ?? 0
        ),
        description: productRaw.mo_ta ?? productRaw.description ?? "",
        detailedDescription:
          productRaw.mo_ta_chi_tiet ??
          productRaw.detailedDescription ??
          productRaw.mo_ta ??
          "",
        rating: Number(productRaw.danh_gia ?? productRaw.rating ?? 4.8),
        reviewCount: Number(
          productRaw.so_danh_gia ?? productRaw.reviewCount ?? 0
        ),
        category: productRaw.id_loaihoa ?? productRaw.category ?? "",
        images:
          productRaw.hinh_anh && productRaw.hinh_anh.trim()
            ? [`../assets/img/products/${productRaw.hinh_anh}`]
            : ["../assets/img/products/default-flower.svg"],
        inStock: (productRaw.so_luong ?? productRaw.stockQuantity ?? 0) > 0,
        stockQuantity: Number(
          productRaw.so_luong ?? productRaw.stockQuantity ?? 0
        ),
      };

      this.renderProductDetail(this.currentProduct);
      document.title = `${this.currentProduct.name} - NHAFLOWER`;

      // Tải sản phẩm liên quan
      this.loadRelatedProducts();

      // Tải bình luận sản phẩm
      this.loadProductComments(this.currentProduct.id);
    } catch (error) {
      console.error("Error loading product detail:", error);
      this.showErrorMessage("Không thể tải thông tin sản phẩm");
    } finally {
      this.hideLoadingSkeleton();
    }
  }

  getMockProductData(productId) {
    const mockProducts = {
      1: {
        id: 1,
        name: "Hoa hồng đỏ tươi",
        price: 250000,
        originalPrice: 300000,
        description:
          "Hoa hồng đỏ tươi được chọn lọc kỹ càng, thể hiện tình yêu chân thành và sâu sắc.",
        detailedDescription:
          "<h4>Đặc điểm nổi bật:</h4><ul><li>Đỏ rực rỡ</li><li>Hương thơm dịu</li></ul>",
        rating: 4.8,
        reviewCount: 21,
        category: 10,
        images: ["../assets/img/products/hoa_hong_do.jpg"],
        stockQuantity: 12,
      },
    };
    return mockProducts[productId] || null;
  }

  async loadRelatedProducts() {
    try {
      // Ưu tiên API thật nếu có category
      if (this.currentProduct && this.currentProduct.category) {
        const res = await fetch(
          `${this.API_BASE_URL}?action=get_all&category=${this.currentProduct.category}`
        );
        const result = await res.json();
        if (result && result.success && Array.isArray(result.data)) {
          const relatedProducts = result.data
            .filter((p) => (p.id_sanpham ?? p.id) != this.currentProduct.id)
            .slice(0, 3);

          if (relatedProducts.length) {
            this.renderRelatedProductsFromApi(relatedProducts);
            return;
          }
        }
      }
      // Fallback mock nếu API không trả được
      this.renderRelatedProductsMock();
    } catch (err) {
      console.warn("loadRelatedProducts fallback to mock:", err);
      this.renderRelatedProductsMock();
    }
  }

  renderRelatedProductsFromApi(list) {
    const relatedHtml = list
      .map(
        (product) => `
        <div class="col-lg-4 col-md-6 mb-4">
          <div class="product-card" onclick="productDetailManager.goToProduct(${
            product.id_sanpham ?? product.id
          })" style="cursor:pointer;">
            <div class="product-image">
              <img src="../assets/img/products/${
                product.hinh_anh || "default-flower.svg"
              }" alt="${product.ten_hoa ?? product.name}"
               style="width:100%;height:200px;object-fit:cover;border-radius:10px;"
               onerror="this.src='../assets/img/products/default-flower.svg';">
            </div>
            <div class="product-info" style="padding:15px;text-align:center;">
              <div class="product-name" style="font-weight:600;margin-bottom:10px;">
                ${product.ten_hoa ?? product.name}
              </div>
              <div class="product-price" style="color:#e74c3c;font-weight:700;">
                ${this.formatPrice(product.gia ?? product.price ?? 0)}
              </div>
              <div class="product-rating" style="margin-top:8px;">
                ${this.getStarsHtml(product.danh_gia ?? product.rating ?? 4.8)}
                <span style="margin-left:5px;color:#6c757d;">
                  ${(product.danh_gia ?? product.rating ?? 4.8).toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        </div>`
      )
      .join("");
    $("#relatedProducts").html(relatedHtml);
  }

  renderRelatedProductsMock() {
    const relatedProducts = [
      {
        id: 2,
        name: "Hoa tulip vàng",
        price: 320000,
        image: "../assets/img/products/hoa_cuc_trang.jpg",
        rating: 4.8,
      },
      {
        id: 3,
        name: "Hoa lan tím",
        price: 450000,
        image: "../assets/img/products/hoa_hong_do.jpg",
        rating: 4.9,
      },
      {
        id: 4,
        name: "Hoa cúc họa mi",
        price: 180000,
        image: "../assets/img/products/default-flower.svg",
        rating: 4.7,
      },
    ];

    const relatedHtml = relatedProducts
      .map(
        (p) => `
        <div class="col-lg-4 col-md-6 mb-4">
          <div class="product-card" onclick="productDetailManager.goToProduct(${
            p.id
          })" style="cursor:pointer;">
            <div class="product-image">
              <img src="${p.image}" alt="${p.name}"
               style="width:100%;height:200px;object-fit:cover;border-radius:10px;"
               onerror="this.src='../assets/img/products/default-flower.svg';">
            </div>
            <div class="product-info" style="padding:15px;text-align:center;">
              <div class="product-name" style="font-weight:600;margin-bottom:10px;">${
                p.name
              }</div>
              <div class="product-price" style="color:#e74c3c;font-weight:700;">${this.formatPrice(
                p.price
              )}</div>
              <div class="product-rating" style="margin-top:8px;">
                ${this.getStarsHtml(p.rating)}
                <span style="margin-left:5px;color:#6c757d;">${p.rating.toFixed(
                  1
                )}</span>
              </div>
            </div>
          </div>
        </div>`
      )
      .join("");
    $("#relatedProducts").html(relatedHtml);
  }

  // --- Render UI ---

  renderProductDetail(product) {
    // Tên
    $("#productName").text(product.name);

    // Giá
    const priceHtml = `
        <span class="current-price">${this.formatPrice(product.price)}</span>
        ${
          product.originalPrice && product.originalPrice > product.price
            ? `<span class="original-price" style="text-decoration:line-through;margin-left:8px;color:#888;">
                 ${this.formatPrice(product.originalPrice)}
               </span>`
            : ""
        }`;
    $("#productPrice").html(priceHtml);

    // Hiển thị badge khuyến mãi nếu có id_khuyenmai
    if (
      product.id_khuyenmai &&
      product.id_khuyenmai !== "0" &&
      product.id_khuyenmai !== 0
    ) {
      $("#discountBadge").show().text("Khuyến mãi");
    } else {
      $("#discountBadge").hide();
    }

    // Mô tả
    $("#productDescription").html(product.description || "");

    // Mô tả chi tiết (nếu có khung)
    if ($("#productDetailedDescription").length) {
      $("#productDetailedDescription").html(product.detailedDescription || "");
    }

    // Rating
    if ($("#productRating").length) {
      $("#productRating").html(
        `${this.getStarsHtml(
          product.rating
        )} <span style="margin-left:6px;color:#6c757d;">${product.rating.toFixed(
          1
        )} (${product.reviewCount} đánh giá)</span>`
      );
    }

    // Tồn kho
    if ($("#stockStatus").length) {
      $("#stockStatus")
        .text(product.inStock ? "Còn hàng" : "Hết hàng")
        .toggleClass("text-success", product.inStock)
        .toggleClass("text-danger", !product.inStock);
    }
    // Hiển thị số lượng tồn kho
    if ($("#stockQuantityInfo").length) {
      if (product.inStock) {
        $("#stockQuantityInfo").html(
          `<span class='text-info'>Còn lại: <b>${product.stockQuantity}</b> sản phẩm</span>`
        );
      } else {
        $("#stockQuantityInfo").html(
          `<span class='text-danger'>Hết hàng</span>`
        );
      }
    }

    // DEBUG: Log đường dẫn ảnh và dữ liệu images
    console.log("[DEBUG] product.images:", product.images);
    if (product.images && product.images.length) {
      product.images.forEach((img, idx) => {
        console.log(`[DEBUG] Gallery img[${idx}]:`, img);
      });
    }

    // Hiển thị ảnh sản phẩm chính
    const mainImg =
      product.images && product.images.length
        ? product.images[0]
        : "../assets/img/products/default-flower.svg";
    if ($("#mainProductImage").length) {
      $("#mainProductImage").attr("src", mainImg);
      $("#mainProductImage").attr(
        "onerror",
        "this.src='../assets/img/products/default-flower.svg';"
      );
    }

    // Số lượng
    this.setQuantity(1);
    if ($("#quantity").length) $("#quantity").val(this.quantity);

    // Nút
    $("#addToCart, .add-to-cart").prop("disabled", !product.inStock);
    $("#buyNow, .buy-now").prop("disabled", !product.inStock);
  }

  // --- Actions ---

  setQuantity(n) {
    this.quantity = Math.max(1, Math.min(999, n));
    if ($("#quantity").length) {
      $("#quantity").val(this.quantity);
    }
  }

  addToCart() {
    if (!this.currentProduct) return;
    if (!this.currentProduct.inStock) {
      this.showToast("Sản phẩm tạm hết hàng", "danger");
      return;
    }
    // Kiểm tra đăng nhập
    if (!localStorage.getItem("nhaflower_user")) {
      if (confirm("Bạn cần đăng nhập để mua hàng. Đăng nhập ngay?")) {
        window.location.href = "login.html";
      }
      return;
    }
    const cart = JSON.parse(localStorage.getItem("nhaflower_cart") || "[]");
    const idx = cart.findIndex((i) => i.id === this.currentProduct.id);
    if (idx >= 0) {
      cart[idx].quantity += this.quantity;
    } else {
      cart.push({
        id: this.currentProduct.id,
        name: this.currentProduct.name,
        price: this.currentProduct.price,
        image:
          (this.currentProduct.images || [])[0] ||
          "../assets/img/products/default-flower.svg",
        quantity: this.quantity,
      });
    }
    localStorage.setItem("nhaflower_cart", JSON.stringify(cart));
    this.showToast("Đã thêm vào giỏ hàng!", "success");
  }

  buyNow() {
    this.addToCart();
    setTimeout(() => {
      window.location.href = "checkout.html";
    }, 400);
  }

  toggleFavorite() {
    this.isFavorite = !this.isFavorite;
    const btn = $(".favorite-btn");
    if (this.isFavorite) {
      btn.addClass("active");
      btn.find("i").removeClass("far").addClass("fas");
      this.showToast("Đã thêm vào yêu thích!", "success");
    } else {
      btn.removeClass("active");
      btn.find("i").removeClass("fas").addClass("far");
      this.showToast("Đã xóa khỏi yêu thích!", "success");
    }
  }

  goToProduct(id) {
    window.location.href = `detail_product.html?id=${id}`;
  }

  showToast(message, type = "success") {
    const id = `toast-${Date.now()}`;
    const html = `
      <div id="${id}" class="alert alert-${type} alert-dismissible fade show position-fixed"
           style="top:100px;right:20px;z-index:9999;min-width:300px;" role="alert">
        <i class="fas ${
          type === "success" ? "fa-check-circle" : "fa-exclamation-triangle"
        }"></i> ${message}
        <button type="button" class="close" data-dismiss="alert"><span>&times;</span></button>
      </div>`;
    $("body").append(html);
    setTimeout(() => $(`#${id}`).alert("close"), 3000);
  }
}

// Khởi tạo
const productDetailManager = new ProductDetailManager();

// (Tuỳ chọn) Expose global wrappers nếu HTML đang gọi các hàm này
function buyNow() {
  productDetailManager.buyNow();
}
function toggleFavorite() {
  productDetailManager.toggleFavorite();
  // Hiển thị badge khuyến mãi nếu có id_khuyenmai
  if (
    product.id_khuyenmai &&
    product.id_khuyenmai !== "0" &&
    product.id_khuyenmai !== 0
  ) {
    $("#discountBadge").show().text("Khuyến mãi");
  } else {
    $("#discountBadge").hide();
  }
}
function showSearchModal() {
  console.log("Show search modal");
}
function showUserProfile() {
  console.log("Show user profile");
}
// Xử lý mở modal xem ảnh sản phẩm
function openImageModal(imageUrl) {
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImage");
  if (modal && modalImg) {
    modalImg.src = imageUrl;
    if (typeof $ !== "undefined" && $(modal).modal) {
      $(modal).modal("show");
    } else {
      modal.style.display = "block";
    }
  }
}
