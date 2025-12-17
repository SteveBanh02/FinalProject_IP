let cart = [];
let shippingCost = 0.0;

$(document).ready(function () {
  loadCart();
  displayCart();
  calculateTotals();
  initializeValidation();
  updateCartCount();
  initializeSearch(); // Initialize search functionality

  // Shipping method change handler
  $("#shipping-method").on("change", function () {
    const method = $(this).val();
    updateShippingCost(method);
  });

  // Place order button
  $("#place-order-btn").on("click", function () {
    if (validateForm()) {
      placeOrder();
    }
  });
});

// SEARCH FUNCTIONALITY
/**
 * Handle search input and redirect to product list page with search query
 */
function handleSearch() {
  const searchInput = $("#search-input");
  const searchQuery = searchInput.val().trim(); // Get trimmed search query

  // Only proceed if search query is not empty
  if (searchQuery) {
    // Redirect to ListProduct page with search query parameter
    window.location.href = `ListProduct.html?search=${encodeURIComponent(
      searchQuery
    )}`;
  }
}

/**
 * Set up search bar event listeners
 */
function initializeSearch() {
  const searchInput = $("#search-input");
  // Handle Enter key press in search input
  searchInput.on("keypress", function (e) {
    // Check if Enter key (key code 13) is pressed
    if (e.which === 13) {
      // Enter key
      e.preventDefault();
      handleSearch();
    }
  });
}

// Load cart from localStorage
function loadCart() {
  try {
    const savedCart = localStorage.getItem("MyCanadaDeals_cart");
    if (savedCart) {
      cart = JSON.parse(savedCart);
    }
  } catch (error) {
    console.error("Error loading cart:", error);
    cart = [];
  }
}

// Update cart count in header
function updateCartCount() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  $(".cart-count").text(totalItems);
}

// Display cart items
function displayCart() {
  const cartContainer = $("#cart-items");
  const productPreview = $("#product-preview");

  if (cart.length === 0) {
    cartContainer.html(
      '<p style="text-align: center; color: #999;">Your cart is empty</p>'
    );
    productPreview.html(
      '<p style="text-align: center; color: #999;">No items to display</p>'
    );
    return;
  }

  // Display first item in preview
  const firstItem = cart[0];
  productPreview.html(`
    <div class="preview-image">
      <img src="${firstItem.image}" alt="${firstItem.name}" />
    </div>
  `);

  // Display all cart items
  cartContainer.empty();
  cart.forEach((item) => {
    const itemHtml = `
      <div class="cart-item">
        <div class="item-image">
          <img src="${item.image}" alt="${item.name}" />
        </div>
        <div class="item-details">
          <div class="item-name">${item.name}</div>
          <div class="item-description">${item.category || "Product"}</div>
          <div class="item-price">$${parseFloat(item.price).toFixed(2)}</div>
        </div>
      </div>
    `;
    cartContainer.append(itemHtml);
  });
}

// Calculate totals
function calculateTotals() {
  const subtotal = cart.reduce((sum, item) => {
    return sum + parseFloat(item.price) * item.quantity;
  }, 0);

  const total = subtotal + shippingCost;

  $("#subtotal").text(`$${subtotal.toFixed(2)}`);
  $("#subtotal-display").text(`$${subtotal.toFixed(2)}`);
  $("#shipping-display").text("FREE");
  $("#total").text(`$${total.toFixed(2)}`);
}

// Initialize form validation
function initializeValidation() {
  // Email validation
  $("#email").on("blur", function () {
    validateEmail();
  });

  // Phone validation
  $("#phone").on("blur", function () {
    validatePhone();
  });

  // Address validation
  $("#address").on("blur", function () {
    validateAddress();
  });

  // City validation
  $("#city").on("blur", function () {
    validateCity();
  });

  // Clear error on input
  $("input").on("input", function () {
    $(this).removeClass("error");
    $(`#${$(this).attr("id")}-error`).text("");
  });
}

// Validate email
function validateEmail() {
  const email = $("#email").val().trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) {
    showError("email", "Email is required");
    return false;
  }

  if (!emailRegex.test(email)) {
    showError("email", "Please enter a valid email address");
    return false;
  }

  clearError("email");
  return true;
}

// Validate phone
function validatePhone() {
  const phone = $("#phone").val().trim();
  const phoneRegex = /^[\d\s\-\(\)\+]+$/;

  if (!phone) {
    showError("phone", "Phone number is required");
    return false;
  }

  if (phone.length < 10) {
    showError("phone", "Please enter a valid phone number");
    return false;
  }

  if (!phoneRegex.test(phone)) {
    showError("phone", "Please enter a valid phone number");
    return false;
  }

  clearError("phone");
  return true;
}

// Validate address
function validateAddress() {
  const address = $("#address").val().trim();

  if (!address) {
    showError("address", "Address is required");
    return false;
  }

  if (address.length < 5) {
    showError("address", "Please enter a complete address");
    return false;
  }

  clearError("address");
  return true;
}

// Validate city
function validateCity() {
  const city = $("#city").val().trim();

  if (!city) {
    showError("city", "City is required");
    return false;
  }

  if (city.length < 2) {
    showError("city", "Please enter a valid city");
    return false;
  }

  clearError("city");
  return true;
}

// Show error message
function showError(field, message) {
  $(`#${field}`).addClass("error");
  $(`#${field}-error`).text(message);
}

// Clear error message
function clearError(field) {
  $(`#${field}`).removeClass("error");
  $(`#${field}-error`).text("");
}

// Validate entire form
function validateForm() {
  const isEmailValid = validateEmail();
  const isPhoneValid = validatePhone();
  const isAddressValid = validateAddress();
  const isCityValid = validateCity();

  return isEmailValid && isPhoneValid && isAddressValid && isCityValid;
}

// Place order
function placeOrder() {
  // Get form data
  const orderData = {
    email: $("#email").val(),
    phone: $("#phone").val(),
    address: $("#address").val(),
    city: $("#city").val(),
    shippingMethod: $("#shipping-method").val(),
    cart: cart,
    subtotal: cart.reduce(
      (sum, item) => sum + parseFloat(item.price) * item.quantity,
      0
    ),
    shipping: shippingCost,
    total:
      cart.reduce(
        (sum, item) => sum + parseFloat(item.price) * item.quantity,
        0
      ) + shippingCost,
  };

  // Store order data for confirmation page
  localStorage.setItem("MyCanadaDeals_order", JSON.stringify(orderData));

  // Show loading state
  $("#place-order-btn").text("Processing...").prop("disabled", true);

  // Simulate API call delay
  setTimeout(() => {
    // Clear cart
    localStorage.removeItem("MyCanadaDeals_cart");

    // Redirect to confirmation page
    window.location.href = "../HTML/OrderConfirmPage.html";
  }, 1500);
}
