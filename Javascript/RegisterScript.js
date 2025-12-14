// REAL REGISTRATION SCRIPT WITH USER DATABASE
// Stores registered users and enables real authentication

document.addEventListener('DOMContentLoaded', function() {
  
  const registerForm = document.getElementById("register-form");

  if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
      e.preventDefault();
      
      // Get form values
      const fullname = document.getElementById("fullname").value.trim();
      const email = document.getElementById("email").value.trim().toLowerCase();
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirm-password").value;
      const termsAccepted = document.getElementById("terms").checked;

      // Validate passwords match
      if (password !== confirmPassword) {
        showMessage("Passwords do not match!", "error");
        return;
      }

      // Validate password length
      if (password.length < 6) {
        showMessage("Password must be at least 6 characters long!", "error");
        return;
      }

      // Validate terms acceptance
      if (!termsAccepted) {
        showMessage("Please accept the Terms & Conditions", "error");
        return;
      }

      // Get submit button
      const btn = e.target.querySelector(".register-btn");
      const originalText = btn.textContent;
      btn.textContent = "Creating Account...";
      btn.disabled = true;

      // Simulate API delay
      setTimeout(() => {
        
        // ========== REAL AUTHENTICATION LOGIC ==========
        
        // Get existing users database from localStorage
        let usersDB = [];
        try {
          const usersData = localStorage.getItem("lumina_users_db");
          if (usersData) {
            usersDB = JSON.parse(usersData);
          }
        } catch (error) {
          console.error("Error loading users database:", error);
          usersDB = [];
        }

        // Check if email already exists
        const existingUser = usersDB.find(user => user.email === email);
        if (existingUser) {
          btn.textContent = originalText;
          btn.disabled = false;
          showMessage("Email already registered! Please login instead.", "error");
          console.log("Registration failed: Email already exists");
          return;
        }

        // Create new user object
        const newUser = {
          id: Date.now(), // Unique ID
          email: email,
          name: fullname,
          password: password, // ⚠️ In production, this should be hashed!
          registeredDate: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };

        // Add user to database
        usersDB.push(newUser);

        // Save updated database back to localStorage
        try {
          localStorage.setItem("lumina_users_db", JSON.stringify(usersDB));
          console.log("✅ New user registered:", { email, name: fullname });
          console.log("📊 Total users in database:", usersDB.length);
        } catch (error) {
          btn.textContent = originalText;
          btn.disabled = false;
          showMessage("Error creating account. Please try again.", "error");
          console.error("Error saving to database:", error);
          return;
        }

        // Log user in by saving current user session
        const userSession = {
          email: newUser.email,
          name: newUser.name,
          loginTime: new Date().toISOString()
        };
        localStorage.setItem("lumina_user", JSON.stringify(userSession));

        // ========== END AUTHENTICATION LOGIC ==========

        btn.textContent = originalText;
        btn.disabled = false;

        showMessage("Account created successfully! Redirecting...", "success");

        // Redirect to homepage
        setTimeout(() => {
          window.location.href = "HomePage.html";
        }, 1500);
        
      }, 1500);
    });
  }

  // Social signup handlers
  const googleSignup = document.getElementById("google-signup");
  if (googleSignup) {
    googleSignup.addEventListener("click", function(e) {
      e.preventDefault();
      showMessage("Google signup coming soon!", "error");
    });
  }

  const facebookSignup = document.getElementById("facebook-signup");
  if (facebookSignup) {
    facebookSignup.addEventListener("click", function(e) {
      e.preventDefault();
      showMessage("Facebook signup coming soon!", "error");
    });
  }

  // Terms link handler
  const termsLink = document.querySelector(".terms-link");
  if (termsLink) {
    termsLink.addEventListener("click", function(e) {
      e.preventDefault();
      alert("Terms & Conditions:\n\n1. You must be 18 or older to create an account.\n2. Provide accurate information.\n3. Keep your password secure.\n4. Follow our community guidelines.\n\n(Full terms would be displayed on a dedicated page)");
    });
  }

  // Real-time password matching validation
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirm-password");
  
  if (confirmPasswordInput && passwordInput) {
    confirmPasswordInput.addEventListener("input", function() {
      if (passwordInput.value && confirmPasswordInput.value) {
        if (passwordInput.value !== confirmPasswordInput.value) {
          confirmPasswordInput.style.borderColor = "#f44336";
        } else {
          confirmPasswordInput.style.borderColor = "#4caf50";
        }
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
    messageEl.textContent = text;
    messageEl.className = "message " + type;
    messageEl.style.display = "block";

    setTimeout(() => {
      messageEl.style.display = "none";
    }, 5000);
  }
}
