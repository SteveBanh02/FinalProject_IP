// only registered users can login
document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("login-form");

  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const email = document.getElementById("email").value.trim().toLowerCase();
      const password = document.getElementById("password").value;
      const remember = document.getElementById("remember").checked;

      // Validate inputs
      if (!email || !password) {
        showMessage("Please enter both email and password", "error");
        return;
      }

      const btn = e.target.querySelector(".login-btn");
      const originalText = btn.textContent;
      btn.textContent = "Signing in...";
      btn.disabled = true;

      // Simulate API call delay
      setTimeout(() => {
        // REAL AUTHENTICATION CHECK
        // Get users database from localStorage
        let usersDB = [];
        try {
          const usersData = localStorage.getItem("MyCanadaDeals_users_db");
          if (usersData) {
            usersDB = JSON.parse(usersData);
          }
        } catch (error) {
          console.error("Error loading users database:", error);
          usersDB = [];
        }

        // Check if user exists in database
        const user = usersDB.find((u) => u.email === email);

        if (!user) {
          // User not found - account doesn't exist
          btn.textContent = originalText;
          btn.disabled = false;
          showMessage("Account not found. Please register first.", "error");
          return;
        }

        // Check if password matches
        if (user.password !== password) {
          // Wrong password
          btn.textContent = originalText;
          btn.disabled = false;
          showMessage("Incorrect password. Please try again.", "error");
          return;
        }

        // LOGIN SUCCESSFUL - proceed to create session
        // Update last login time in database
        user.lastLogin = new Date().toISOString();
        const userIndex = usersDB.findIndex((u) => u.email === email);
        usersDB[userIndex] = user;
        localStorage.setItem("MyCanadaDeals_users_db", JSON.stringify(usersDB));

        // Create user session
        const userSession = {
          email: user.email,
          name: user.name,
          loginTime: new Date().toISOString(),
          rememberMe: remember,
        };

        // Save to localStorage
        localStorage.setItem("MyCanadaDeals_user", JSON.stringify(userSession));

        console.log("User session created:", userSession);

        btn.textContent = originalText;
        btn.disabled = false;

        showMessage("Login successful! Redirecting...", "success");

        // Redirect to homepage
        setTimeout(() => {
          window.location.href = "HomePage.html";
        }, 1500);
      }, 1000);
    });
  }

  // Forgot password handler
  const forgotPasswordLink = document.querySelector(".forgot-password");
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener("click", function (e) {
      e.preventDefault();

      const email = document.getElementById("email").value.trim().toLowerCase();

      if (!email) {
        showMessage("Please enter your email address first", "error");
        return;
      }

      // Check if email exists in database
      let usersDB = [];
      try {
        const usersData = localStorage.getItem("MyCanadaDeals_users_db");
        if (usersData) {
          usersDB = JSON.parse(usersData);
        }
      } catch (error) {
        console.error("Error loading users database:", error);
      }

      const user = usersDB.find((u) => u.email === email);

      if (user) {
        showMessage("Password reset link sent to your email!", "success");
      } else {
        showMessage(
          "Email not found. Please check your email or register.",
          "error"
        );
      }
    });
  }
});

/**
 * Display message to user
 */
function showMessage(text, type) {
  const messageEl = document.getElementById("message");
  if (messageEl) {
    messageEl.innerHTML = text; // Changed to innerHTML to support links
    messageEl.className = "message " + type;
    messageEl.style.display = "block";

    setTimeout(() => {
      messageEl.style.display = "none";
    }, 5000);
  }
}
