// GLOBAL VARIABLES
let currentProduct = null; // Stores the currently displayed product
let allProducts = []; // Stores all products from the category (for related products)
let cart = []; // Shopping cart array

// HELPER FUNCTIONS
/**
 * Get URL parameter by name
 * Example: If URL is "ProductDetail.html?id=1&category=Electronics"
 * getURLParameter("id") returns "1"
 * @param {string} name - The parameter name to retrieve
 * @returns {string|null} The parameter value or null if not found
 */
function getURLParameter(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

// CATEGORY TO FILENAME MAPPING
/**
 * Convert category name to corresponding JSON filename
 * Example: "Electronics" → "Electronics.json"
 * @param {string} categoryName - Name of the category
 * @returns {string} JSON filename (defaults to "Clothing.json" if not found)
 */
function getCategoryFilename(categoryName) {
  const categoryMap = {
    Electronics: "Electronics.json",
    "Home & Kitchen": "Home & Kitchen.json",
    "Sports & Outdoors": "Sports & Outdoors.json",
    "Beauty & Personal Care": "Beauty & Personal Care.json",
    "Toys & Games": "Toys & Games.json",
    Clothing: "Clothing.json",
    Automotive: "Automotive.json",
    "Office Supplies": "Office Supplies.json",
    "Garden & Outdoors": "Garden & Outdoors.json",
    "Pet Supplies": "Pet Supplies.json",
  };

  return categoryMap[categoryName] || "Clothing.json";
}

// PAGE INITIALIZATION
/**
 * Initialize the page when DOM is ready
 * Loads product data, sets up event handlers, and loads cart
 */
$(document).ready(function () {
  loadProductFromJSON(); // Load and display product
  initializeEventHandlers(); // Set up button clicks, etc.
  loadCart(); // Load cart from localStorage
});

// LOAD PRODUCT DATA
/**
 * Load product data from JSON file based on URL parameters
 * Tries multiple methods to find the product:
 * 1. By ID from URL
 * 2. By array index
 * 3. By product name
 * 4. From sessionStorage as fallback
 */
async function loadProductFromJSON() {
  try {
    // Get product ID and category from URL
    const productId = getURLParameter("id");
    const category = getURLParameter("category");

    console.log("Loading product:", { productId, category });

    // If URL parameters are missing, try sessionStorage fallback
    if (!productId || !category) {
      const storedProduct = sessionStorage.getItem("selectedProduct");
      if (storedProduct) {
        console.log("Loading product from sessionStorage");
        currentProduct = JSON.parse(storedProduct);
        displayProduct();

        // Still need to load category products for related items
        const jsonFile = getCategoryFilename(currentProduct.category);
        const response = await $.getJSON(`../jsonFiles/${jsonFile}`);
        allProducts = Array.isArray(response)
          ? response
          : response.products || [];

        await loadReviews(currentProduct.id); // Pass product ID to load reviews
        loadRelatedProducts();
        return;
      }

      // No product data found anywhere
      showError("Product not found. Missing product information.");
      return;
    }

    // Load the JSON file for this product's category
    const jsonFile = getCategoryFilename(category);
    console.log("Loading JSON file:", jsonFile);

    const response = await $.getJSON(`../jsonFiles/${jsonFile}`);
    allProducts = Array.isArray(response) ? response : response.products || [];

    console.log("Loaded products count:", allProducts.length);
    console.log("First product sample:", allProducts[0]);

    // METHOD 1: Try to find product by ID
    currentProduct = allProducts.find(
      (p) => p.id && p.id.toString() === productId.toString()
    );

    // METHOD 2: Try to find by array index if ID didn't work
    if (!currentProduct && !isNaN(productId)) {
      const index = parseInt(productId);
      if (index >= 0 && index < allProducts.length) {
        currentProduct = allProducts[index];
        console.log("Found product by index:", index);
      }
    }

    // METHOD 3: Try to find by product name from URL
    if (!currentProduct) {
      const productName = getURLParameter("name");
      if (productName) {
        currentProduct = allProducts.find(
          (p) => p.name === decodeURIComponent(productName)
        );
      }
    }

    // METHOD 4: Try sessionStorage as last resort
    if (!currentProduct) {
      const storedProduct = sessionStorage.getItem("selectedProduct");
      if (storedProduct) {
        console.log("Using product from sessionStorage as fallback");
        currentProduct = JSON.parse(storedProduct);
      }
    }

    // If still no product found, show error
    if (!currentProduct) {
      console.error("Product not found with ID:", productId);
      console.error(
        "Available products:",
        allProducts.map((p, i) => ({ index: i, id: p.id, name: p.name }))
      );
      showError("Product not found in catalog.");
      return;
    }

    console.log("Successfully loaded product:", currentProduct.name);

    // Make sure product has a category property
    if (!currentProduct.category) {
      currentProduct.category = category;
    }

    // Display the product on the page
    displayProduct();
    await loadReviews(productId); // Pass productId to load reviews
    loadRelatedProducts();
  } catch (error) {
    console.error("Error loading product:", error);
    showError(`Error loading product: ${error.message}`);
  }
}

// DISPLAY PRODUCT DETAILS
/**
 * Display product information on the page
 * Updates title, price, images, description, availability, etc.
 */
function displayProduct() {
  const product = currentProduct;

  // Update browser tab title
  document.title = `${product.name} - LUMINA`;

  // Update product name and price
  $("#product-title").text(product.name);
  $("#product-price").text(`${parseFloat(product.price).toFixed(2)}`);
  $("#product-sku").text(product.sku || "N/A");

  // Update availability status based on stock
  const availabilityEl = $("#product-availability");
  const inStock = product.stock > 0;
  availabilityEl.text(inStock ? "In Stock" : "Out of Stock");
  availabilityEl.removeClass("in-stock out-of-stock");
  availabilityEl.addClass(inStock ? "in-stock" : "out-of-stock");

  // Handle product images (can be single image or array)
  if (product.image) {
    const images = Array.isArray(product.image)
      ? product.image
      : [product.image];

    // Set main product image
    $("#main-product-image").attr("src", images[0]);

    // Create thumbnail images
    const thumbnailContainer = $("#thumbnail-grid");
    thumbnailContainer.empty();

    images.forEach((img, index) => {
      const thumbnail = $(`
        <div class="thumbnail-item ${
          index === 0 ? "active" : ""
        }" data-index="${index}">
          <img src="${img}" alt="Product ${index + 1}" />
        </div>
      `);
      thumbnailContainer.append(thumbnail);
    });

    // Add click handlers to switch main image when thumbnail clicked
    $(".thumbnail-item").on("click", function () {
      const index = $(this).data("index");
      $("#main-product-image").attr("src", images[index]);
      $(".thumbnail-item").removeClass("active");
      $(this).addClass("active");
    });
  }

  // Display product description
  if (product.description) {
    $(".description-content").html(`<p>${product.description}</p>`);
  } else {
    // Use default description if none provided
    $(".description-content").html(`
      <p class="color-label">Product Details</p>
      <ul class="description-list">
        <li>High quality materials</li>
        <li>Premium construction</li>
        <li>Satisfaction guaranteed</li>
      </ul>
    `);
  }

  // Display size options if product has them
  if (product.sizes && Array.isArray(product.sizes)) {
    const sizeContainer = $("#size-options");
    sizeContainer.empty();
    product.sizes.forEach((size) => {
      const btn = $(`<button class="size-btn">${size}</button>`);
      sizeContainer.append(btn);
    });
  }

  // Store product data in button for later use
  $("#add-to-cart-btn").data("product", product);
}

// RENDER STAR RATINGS
/**
 * Display star rating (full stars, half stars, empty stars)
 * Example: 4.5 rating = 4 full stars + 1 half star
 * @param {string} selector - jQuery selector for where to put stars
 * @param {number} rating - Rating value (0-5)
 */
function renderStars(selector, rating) {
  const container = $(selector);
  container.empty();

  // Calculate how many of each star type
  const fullStars = Math.floor(rating); // Full stars (e.g., 4 from 4.5)
  const hasHalfStar = rating % 1 >= 0.5; // Check if we need half star

  // Add full stars
  for (let i = 0; i < fullStars; i++) {
    container.append('<i class="fas fa-star"></i>');
  }

  // Add half star if needed
  if (hasHalfStar) {
    container.append('<i class="fas fa-star-half-alt"></i>');
  }

  // Add empty stars to fill up to 5 total
  const emptyStars = 5 - Math.ceil(rating);
  for (let i = 0; i < emptyStars; i++) {
    container.append('<i class="far fa-star"></i>');
  }
}

// LOAD AND DISPLAY REVIEWS FROM JSON FILE
/**
 * Load product reviews from reviews.json file and display them
 * Shows average rating, rating breakdown, and individual reviews
 * @param {string} productId - The ID of the current product
 */
async function loadReviews(productId) {
  try {
    // Step 1: Load the reviews.json file
    const reviewsData = await $.getJSON("../jsonFiles/reviews.json");

    // Step 2: Find reviews for this specific product
    // The JSON file has an array of objects, each with product_id and reviews
    const productReviews = reviewsData.find(
      (item) => item.product_id === productId.toString()
    );

    // Step 3: Check if we found reviews for this product
    if (
      !productReviews ||
      !productReviews.reviews ||
      productReviews.reviews.length === 0
    ) {
      // No reviews found - display a "no reviews" message
      $("#reviews-list").html(
        '<p class="no-reviews">No reviews yet. Be the first to review this product!</p>'
      );
      $("#average-rating").text("N/A");
      $("#summary-stars").empty();
      $("#total-reviews").text("0 reviews");
      $("#rating-breakdown").empty();
      return;
    }

    // Step 4: Get the reviews array for this product
    const reviews = productReviews.reviews;

    // Step 5: Calculate average rating from all reviews
    // Add up all ratings and divide by number of reviews
    const avgRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    $("#average-rating").text(avgRating.toFixed(1)); // Show with 1 decimal place
    renderStars("#summary-stars", avgRating); // Show stars for average rating
    $("#total-reviews").text(
      `${reviews.length} review${reviews.length !== 1 ? "s" : ""}`
    );

    // Step 6: Count how many reviews for each star rating (1-5)
    const ratingCounts = [0, 0, 0, 0, 0]; // [1-star, 2-star, 3-star, 4-star, 5-star]
    reviews.forEach((r) => ratingCounts[r.rating - 1]++);

    // Step 7: Create rating breakdown bars (visual representation)
    const breakdownContainer = $("#rating-breakdown");
    breakdownContainer.empty(); // Clear any existing content

    // Loop from 5 stars down to 1 star
    for (let i = 4; i >= 0; i--) {
      const stars = i + 1; // Convert array index to star number (0→1, 1→2, etc.)
      const count = ratingCounts[i]; // How many reviews have this rating
      const percentage = (count / reviews.length) * 100; // Calculate percentage for bar width

      // Create the bar item HTML
      const barItem = $(`
        <div class="rating-bar-item">
          <span class="rating-bar-label">${stars} star${
        stars > 1 ? "s" : ""
      }</span>
          <div class="rating-bar">
            <div class="rating-bar-fill" style="width: ${percentage}%"></div>
          </div>
          <span class="rating-bar-count">${count}</span>
        </div>
      `);
      breakdownContainer.append(barItem);
    }

    // Step 8: Display individual review items
    const reviewsList = $("#reviews-list");
    reviewsList.empty(); // Clear any existing reviews

    reviews.forEach((review) => {
      // Get initials from user name (e.g., "Harvey J." → "HJ")
      const initials = review.user
        .split(" ")
        .map((n) => n[0]) // Take first letter of each word
        .join("")
        .toUpperCase(); // Convert to uppercase

      // Create review item HTML
      // Note: Using 'title' and 'comment' fields from JSON instead of 'date' and 'text'
      const reviewItem = $(`
        <div class="review-item">
          <div class="review-header">
            <div class="reviewer-info">
              <div class="reviewer-avatar">${initials}</div>
              <div class="reviewer-details">
                <h4>${review.user}</h4>
                <span class="review-title">${review.title || ""}</span>
              </div>
            </div>
            <div class="review-rating" data-rating="${review.rating}"></div>
          </div>
          <p class="review-text">${review.comment}</p>
        </div>
      `);

      // Add stars to this review
      renderStars(reviewItem.find(".review-rating"), review.rating);
      reviewsList.append(reviewItem);
    });
  } catch (error) {
    // If there's an error loading the reviews (file not found, etc.)
    console.error("Error loading reviews:", error);
    $("#reviews-list").html(
      '<p class="error-message">Unable to load reviews at this time.</p>'
    );
  }
}

// LOAD RELATED PRODUCTS
/**
 * Load and display related products from the same category
 * Shows 4 random products (excluding current product)
 */
function loadRelatedProducts() {
  const relatedContainer = $("#related-products");
  relatedContainer.empty();

  // Get random products from same category (but not the current product)
  const relatedProducts = allProducts
    .filter((p) => p.id !== currentProduct.id) // Exclude current product
    .sort(() => 0.5 - Math.random()) // Shuffle randomly
    .slice(0, 4); // Take first 4

  // Create card for each related product
  relatedProducts.forEach((product, index) => {
    const productIndex = allProducts.indexOf(product);
    const card = $(`
      <div class="related-product-card" data-product-id="${
        product.id || productIndex
      }" data-category="${product.category}">
        <div class="related-product-image">
          <img src="${product.image}" alt="${product.name}" />
        </div>
        <div class="related-product-info">
          <div class="related-product-category">${product.category}</div>
          <div class="related-product-name">${product.name}</div>
          <div class="related-product-price">$${parseFloat(
            product.price
          ).toFixed(2)}</div>
        </div>
      </div>
    `);

    // Add click handler to navigate to that product's detail page
    card.on("click", function () {
      const productId = $(this).data("product-id");
      const category = $(this).data("category");
      window.location.href = `ProductDetail.html?id=${productId}&category=${encodeURIComponent(
        category
      )}`;
    });

    relatedContainer.append(card);
  });
}

// EVENT HANDLERS SETUP
/**
 * Initialize all event handlers for interactive elements
 * Sets up size selection, quantity controls, and add to cart button
 */
function initializeEventHandlers() {
  // Size button selection (if product has sizes)
  $(document).on("click", ".size-btn", function () {
    $(".size-btn").removeClass("selected");
    $(this).addClass("selected");
  });

  // Decrease quantity button
  $("#qty-decrease").on("click", function () {
    const input = $("#quantity-input");
    const qty = parseInt(input.val());
    const min = parseInt(input.attr("min"));
    if (qty > min) {
      input.val(qty - 1);
    }
  });

  // Increase quantity button
  $("#qty-increase").on("click", function () {
    const input = $("#quantity-input");
    const qty = parseInt(input.val());
    const max = parseInt(input.attr("max"));
    if (qty < max) {
      input.val(qty + 1);
    }
  });

  // Prevent invalid quantity input (typing in the field)
  $("#quantity-input").on("input", function () {
    let val = parseInt($(this).val());
    const min = parseInt($(this).attr("min"));
    const max = parseInt($(this).attr("max"));

    // Ensure value is within valid range
    if (isNaN(val) || val < min) {
      $(this).val(min);
    } else if (val > max) {
      $(this).val(max);
    }
  });

  // Add to cart button
  $("#add-to-cart-btn").on("click", addToCart);
}

// ADD TO CART FUNCTIONALITY
/**
 * Add current product to shopping cart
 * Handles quantity and size selection
 * Updates cart in localStorage
 */
function addToCart() {
  const product = currentProduct;
  const quantity = parseInt($("#quantity-input").val()) || 1;
  const selectedSize = $(".size-btn.selected").text();

  // Validate product exists
  if (!product) {
    showNotification("Error: Product not found", "error");
    return;
  }

  // Check if product already exists in cart
  const existingItem = cart.find((item) => item.id === product.id);

  if (existingItem) {
    // If product already in cart, just increase quantity
    existingItem.quantity += quantity;
  } else {
    // Add new product to cart
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: Array.isArray(product.image) ? product.image[0] : product.image,
      quantity: quantity,
      size: selectedSize || "N/A",
      category: product.category,
    });
  }

  // Save cart to localStorage
  saveCart();
  // Update cart count badge
  updateCartCount();

  // Show success message to user
  showNotification(`${product.name} added to cart!`, "success");

  // Reset quantity back to 1
  $("#quantity-input").val(1);
}

// CART MANAGEMENT
/**
 * Load shopping cart from localStorage
 * Runs when page loads to restore user's cart
 */
function loadCart() {
  try {
    const savedCart = localStorage.getItem("lumina_cart");
    if (savedCart) {
      cart = JSON.parse(savedCart);
      updateCartCount();
    }
  } catch (error) {
    console.error("Error loading cart:", error);
    cart = [];
  }
}

/**
 * Save shopping cart to localStorage
 * Called whenever cart is modified
 */
function saveCart() {
  try {
    localStorage.setItem("lumina_cart", JSON.stringify(cart));
  } catch (error) {
    console.error("Error saving cart:", error);
  }
}

/**
 * Update cart count badge in header
 * Shows total number of items in cart
 */
function updateCartCount() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  $(".cart-count").text(totalItems);
}

// NOTIFICATION SYSTEM
/**
 * Show notification message to user
 * Appears in top-right corner and auto-dismisses after 3 seconds
 * @param {string} message - Message to display
 * @param {string} type - "success" or "error" (changes color and icon)
 */
function showNotification(message, type = "success") {
  // Remove any existing notification first
  $(".notification").remove();

  // Set colors and icons based on type
  const bgColor = type === "success" ? "#22c55e" : "#ef4444";
  const icon = type === "success" ? "fa-check-circle" : "fa-exclamation-circle";

  // Create notification element
  const notification = $(`
    <div class="notification">
      <i class="fas ${icon}"></i>
      <span>${message}</span>
    </div>
  `);

  $("body").append(notification);

  // Add CSS for notification if not already added
  if (!$("#notification-style").length) {
    $("head").append(`
      <style id="notification-style">
        .notification {
          position: fixed;
          top: 100px;
          right: 20px;
          background-color: ${bgColor};
          color: white;
          padding: 15px 25px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          display: flex;
          align-items: center;
          gap: 10px;
          z-index: 1000;
          animation: slideIn 0.3s ease-out;
        }
        
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .notification i {
          font-size: 20px;
        }
      </style>
    `);
  } else {
    // Update background color if style already exists
    $(".notification").css("background-color", bgColor);
  }

  // Auto-remove notification after 3 seconds
  setTimeout(() => {
    notification.fadeOut(300, function () {
      $(this).remove();
    });
  }, 3000);
}

// ERROR DISPLAY
/**
 * Show error message when product fails to load
 * Displays error in place of product content
 * @param {string} message - Error message to display
 */
function showError(message) {
  $("#main-product-image").parent().html(`
    <div style="text-align: center; padding: 60px 20px;">
      <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #ef4444; margin-bottom: 20px;"></i>
      <h2 style="margin-bottom: 10px;">${message}</h2>
      <p style="color: #666;">Please try again or return to the <a href="ListProduct.html" style="color: #333; text-decoration: underline;">product listing page</a>.</p>
    </div>
  `);

  // Clear product info section
  $(".product-info-section").html("");
}
