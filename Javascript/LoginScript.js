// Form submission handler
document.getElementById("login-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const remember = document.getElementById("remember").checked;

  // Show loading state
  const btn = e.target.querySelector(".login-btn");
  const originalText = btn.textContent;
  btn.textContent = "Signing in...";
  btn.disabled = true;

  // Simulate login API call
  setTimeout(() => {
    // Reset button
    btn.textContent = originalText;
    btn.disabled = false;

    // For demo purposes - show success message
    showMessage("Login successful! Redirecting...", "success");

    // Simulate redirect
    setTimeout(() => {
      // In real app: window.location.href = 'index.html';
      console.log("Login:", { email, password, remember });
    }, 1500);
  }, 1500);
});

// Social login handlers
document.getElementById("google-login").addEventListener("click", function () {
  showMessage("Google login coming soon...", "error");
});

document
  .getElementById("facebook-login")
  .addEventListener("click", function () {
    showMessage("Facebook login coming soon...", "error");
  });

// Show message helper
function showMessage(text, type) {
  const messageEl = document.getElementById("message");
  messageEl.textContent = text;
  messageEl.className = "message " + type;
  messageEl.style.display = "block";

  setTimeout(() => {
    messageEl.style.display = "none";
  }, 3000);
}

// Forgot password handler
document
  .querySelector(".forgot-password")
  .addEventListener("click", function (e) {
    e.preventDefault();
    showMessage("Password reset link sent to your email!", "success");
  });
