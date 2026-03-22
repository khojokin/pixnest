function setAuthMessage(target, message = "", type = "") {
  if (!target) return;
  target.textContent = message;
  target.className = `auth-message${type ? ` ${type}` : ""}`;
}

function storePixNestUser(user) {
  if (!user) return;
  const payload = {
    id: user.id,
    email: user.email,
    full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "PixNest User"
  };
  localStorage.setItem("pixnest_current_user", JSON.stringify(payload));
}

function initPasswordToggle(buttonId, inputId) {
  const button = document.getElementById(buttonId);
  const input = document.getElementById(inputId);
  if (!button || !input) return;

  button.addEventListener("click", () => {
    const isPassword = input.type === "password";
    input.type = isPassword ? "text" : "password";
    const icon = button.querySelector("i");
    if (icon) {
      icon.className = isPassword ? "fa-solid fa-eye-slash" : "fa-solid fa-eye";
    }
  });
}

async function handleSignupSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const messageEl = document.getElementById("authMessage");
  const button = document.getElementById("signupBtn");

  const fullName = document.getElementById("fullName")?.value.trim() || "";
  const email = document.getElementById("email")?.value.trim() || "";
  const password = document.getElementById("password")?.value || "";
  const confirmPassword = document.getElementById("confirmPassword")?.value || "";
  const agree = document.getElementById("agreeTerms")?.checked;

  if (!fullName || !email || !password || !confirmPassword) {
    setAuthMessage(messageEl, "Fill in all the fields.", "error");
    return;
  }

  if (password.length < 6) {
    setAuthMessage(messageEl, "Password should be at least 6 characters.", "error");
    return;
  }

  if (password !== confirmPassword) {
    setAuthMessage(messageEl, "Passwords do not match.", "error");
    return;
  }

  if (!agree) {
    setAuthMessage(messageEl, "Please agree to the terms before creating your account.", "error");
    return;
  }

  try {
    button.disabled = true;
    button.textContent = "Creating...";
    setAuthMessage(messageEl, "", "");

    const { data, error } = await window.supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}${window.location.pathname.replace(/[^/]+$/, "login.html")}`
      }
    });

    if (error) throw error;

    if (data?.user) {
      storePixNestUser(data.user);
    }

    if (data?.session) {
      setAuthMessage(messageEl, "Account created. Redirecting...", "success");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1200);
    } else {
      setAuthMessage(messageEl, "Account created. Check your inbox to verify your email, then log in.", "success");
      form.reset();
    }
  } catch (error) {
    setAuthMessage(messageEl, error.message || "Could not create your account.", "error");
  } finally {
    button.disabled = false;
    button.textContent = "Create Account";
  }
}

async function handleLoginSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const messageEl = document.getElementById("authMessage");
  const button = document.getElementById("loginBtn");
  const email = document.getElementById("email")?.value.trim() || "";
  const password = document.getElementById("password")?.value || "";

  if (!email || !password) {
    setAuthMessage(messageEl, "Enter your email and password.", "error");
    return;
  }

  try {
    button.disabled = true;
    button.textContent = "Logging in...";
    setAuthMessage(messageEl, "", "");

    const { data, error } = await window.supabaseClient.auth.signInWithPassword({ email, password });
    if (error) throw error;

    if (data?.user) {
      storePixNestUser(data.user);
    }

    setAuthMessage(messageEl, "Login successful. Redirecting...", "success");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1000);
  } catch (error) {
    setAuthMessage(messageEl, error.message || "Could not log in.", "error");
  } finally {
    button.disabled = false;
    button.textContent = "Log In";
  }
}

async function handleForgotPassword(event) {
  event.preventDefault();
  const email = document.getElementById("email")?.value.trim() || "";
  const messageEl = document.getElementById("authMessage");

  if (!email) {
    setAuthMessage(messageEl, "Enter your email first, then tap forgot password.", "error");
    return;
  }

  try {
    const { error } = await window.supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}${window.location.pathname.replace(/[^/]+$/, "login.html")}`
    });
    if (error) throw error;
    setAuthMessage(messageEl, "Password reset email sent. Check your inbox.", "success");
  } catch (error) {
    setAuthMessage(messageEl, error.message || "Could not send password reset email.", "error");
  }
}

async function initAuthPage() {
  try {
    const { data } = await window.supabaseClient.auth.getUser();
    if (data?.user && (window.location.pathname.endsWith("login.html") || window.location.pathname.endsWith("signup.html"))) {
      storePixNestUser(data.user);
    }
  } catch (error) {
    console.error(error);
  }

  initPasswordToggle("togglePassword", "password");
  initPasswordToggle("toggleConfirmPassword", "confirmPassword");

  const signupForm = document.getElementById("signupForm");
  if (signupForm) signupForm.addEventListener("submit", handleSignupSubmit);

  const loginForm = document.getElementById("loginForm");
  if (loginForm) loginForm.addEventListener("submit", handleLoginSubmit);

  const forgotPasswordLink = document.getElementById("forgotPasswordLink");
  if (forgotPasswordLink) forgotPasswordLink.addEventListener("click", handleForgotPassword);
}

document.addEventListener("DOMContentLoaded", initAuthPage);
