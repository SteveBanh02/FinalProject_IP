// Handles user authentication, profile display, and logout functionality
// Initialize when page loads
$(document).ready(function () {
  checkUserAuthentication();
  loadCartCount();
  initializeSearch();
});

// SEARCH FUNCTIONALITY
/**
 * Handle search input and redirect to product list page with search query
 */
function handleSearch() {
  const searchInput = $("#search-input");
  const searchQuery = searchInput.val().trim();

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

/**
 * Check if user is logged in and display their information
 * If not logged in, redirect to login page
 */
function checkUserAuthentication() {
  try {
    // Get user data from localStorage
    const user = JSON.parse(localStorage.getItem("MyCanadaDeals_user"));

    if (!user) {
      // If no user is logged in, redirect to login page
      window.location.href = "LoginPage.html";
      return;
    }

    // User is logged in, display their information
    displayUserInfo(user);
  } catch (error) {
    console.error("Error checking authentication:", error);
    window.location.href = "LoginPage.html";
  }
}

/**
 * Display user information on the page
 */
function displayUserInfo(user) {
  // Extract user name from email if not provided
  const userName = user.name || user.email.split("@")[0];
  const userEmail = user.email;

  // Get the first letter for avatar
  const userInitial = userName.charAt(0).toUpperCase();

  // Update all user info elements
  $("#user-avatar").text(userInitial);
  $("#display-name").text(userName);
  $("#display-email").text(userEmail);
  $("#email-value").text(userEmail);
  $("#header-user-name").text(userName);

  // Set member since date
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  $("#member-since").text(today);

  // Load any additional user preferences or settings
  loadUserPreferences(user);
}

/**
 * Load user preferences and settings
 */
function loadUserPreferences(user) {
  // Check if user has any saved preferences
  const preferences = localStorage.getItem("MyCanadaDeals_user_preferences");

  if (preferences) {
    try {
      const prefs = JSON.parse(preferences);
      // Apply any saved preferences here
      console.log("User preferences loaded:", prefs);
    } catch (error) {
      console.error("Error loading preferences:", error);
    }
  }
}

/**
 * Load shopping cart count from localStorage
 */
function loadCartCount() {
  try {
    const savedCart = localStorage.getItem("MyCanadaDeals_cart");

    if (savedCart) {
      const cart = JSON.parse(savedCart);
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
      $(".cart-count").text(totalItems);
    } else {
      $(".cart-count").text(0);
    }
  } catch (error) {
    console.error("Error loading cart:", error);
    $(".cart-count").text(0);
  }
}

/**
 * Handle user logout
 * Clears user data from localStorage and redirects to home page
 */
function logout() {
  // Show confirmation dialog
  if (confirm("Are you sure you want to logout?")) {
    try {
      // Clear user data from localStorage
      localStorage.removeItem("MyCanadaDeals_user");

      // Show logout message
      showMessage("Logged out successfully!", "success");

      // Redirect to home page after a short delay
      setTimeout(() => {
        window.location.href = "HomePage.html";
      }, 1000);
    } catch (error) {
      console.error("Error during logout:", error);
      // Still redirect even if there's an error
      window.location.href = "HomePage.html";
    }
  }
}

/**
 * Show a temporary message to the user
 */
function showMessage(text, type) {
  // Create message element if it doesn't exist
  let messageEl = $("#user-message");

  if (messageEl.length === 0) {
    $("body").prepend('<div id="user-message" class="user-message"></div>');
    messageEl = $("#user-message");
  }

  // Set message content and style
  messageEl.text(text);
  messageEl.removeClass().addClass("user-message " + type);
  messageEl.fadeIn();

  // Hide after 3 seconds
  setTimeout(() => {
    messageEl.fadeOut();
  }, 3000);
}

/**
 * Navigate to different pages
 */
function navigateTo(page) {
  window.location.href = page;
}
