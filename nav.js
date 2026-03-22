function pixNestInitMenu() {
  const navLinks = document.getElementById("navLinks");
  // Support both `navToggle` (used in index.html) and `menuToggle` (used in other pages)
  const menuToggle = document.getElementById("navToggle") || document.getElementById("menuToggle");

  // If either the toggle button or the navLinks element is missing, do nothing
  if (!menuToggle || !navLinks) return;

  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("show");
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
  });

  document.addEventListener("click", (event) => {
    if (window.innerWidth <= 860 && navLinks.classList.contains("show")) {
      // Close the mobile navigation when clicking outside the navLinks or toggle button
      if (!navLinks.contains(event.target) && !menuToggle.contains(event.target)) {
        navLinks.classList.remove("show");
        menuToggle.setAttribute("aria-expanded", "false");
      }
    }
  });

  window.addEventListener("resize", () => {
    // When resizing to desktop width, ensure the mobile menu is closed
    if (window.innerWidth > 860) {
      navLinks.classList.remove("show");
      menuToggle.setAttribute("aria-expanded", "false");
    }
  });
}

function getNavUserArea() {
  return document.getElementById("navUserArea");
}

function getStoredUser() {
  try {
    const raw = localStorage.getItem("pixnest_current_user");
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function renderLoggedOutNav() {
  const navUserArea = getNavUserArea();
  if (!navUserArea) return;

  navUserArea.innerHTML = `
    <div class="logged-out-actions">
      <a href="login.html" class="nav-auth-btn login">Log In</a>
      <a href="signup.html" class="nav-auth-btn signup">Sign Up</a>
    </div>
  `;
}

function renderLoggedInNav(user) {
  const navUserArea = getNavUserArea();
  if (!navUserArea) return;

  const displayName =
    user?.user_metadata?.full_name ||
    user?.full_name ||
    user?.name ||
    user?.email?.split("@")[0] ||
    "My Account";

  navUserArea.innerHTML = `
    <button class="user-menu-btn" id="userMenuBtn" aria-label="Open account menu" aria-expanded="false">
      <i class="fa-solid fa-bars"></i>
    </button>

    <div class="user-menu-panel" id="userMenuPanel">
      <div class="user-menu-list">
        <a class="user-menu-item" href="account.html#edit-profile">
          <i class="fa-solid fa-user-pen"></i>
          <span>Edit profile</span>
        </a>

        <a class="user-menu-item" href="account.html#change-profile-picture">
          <i class="fa-solid fa-camera"></i>
          <span>Change profile picture</span>
        </a>

        <a class="user-menu-item" href="account.html#change-cover-photo">
          <i class="fa-solid fa-image"></i>
          <span>Change cover photo</span>
        </a>

        <a class="user-menu-item" href="account.html#verification-request">
          <i class="fa-solid fa-circle-check"></i>
          <span>Submit verification request</span>
        </a>

        <a class="user-menu-item" href="account.html#dashboard-request">
          <i class="fa-solid fa-chart-line"></i>
          <span>Submit dashboard request</span>
        </a>

        <a class="user-menu-item" href="premium.html">
          <i class="fa-solid fa-crown"></i>
          <span>Buy premium membership</span>
        </a>

        <a class="user-menu-item" href="account.html#muted-accounts">
          <i class="fa-solid fa-volume-xmark"></i>
          <span>Muted accounts</span>
        </a>

        <a class="user-menu-item" href="account.html#content-preferences">
          <i class="fa-solid fa-sliders"></i>
          <span>Content preferences</span>
        </a>

        <a class="user-menu-item" href="account.html#accessibility">
          <i class="fa-solid fa-universal-access"></i>
          <span>Accessibility</span>
        </a>

        <a class="user-menu-item" href="account.html#language-translations">
          <i class="fa-solid fa-language"></i>
          <span>Language and translations</span>
        </a>

        <a class="user-menu-item" href="account.html#media-quality">
          <i class="fa-solid fa-image"></i>
          <span>Media quality</span>
        </a>

        <a class="user-menu-item" href="account.html#privacy-centre">
          <i class="fa-solid fa-shield-heart"></i>
          <span>Privacy Centre</span>
        </a>

        <a class="user-menu-item" href="account.html#account-status">
          <i class="fa-solid fa-circle-info"></i>
          <span>Account Status</span>
        </a>

        <div class="user-menu-divider"></div>

        <button class="user-menu-item" id="logoutBtn" type="button">
          <i class="fa-solid fa-right-from-bracket"></i>
          <span>Log out</span>
        </button>
      </div>
    </div>
  `;

  const userMenuBtn = document.getElementById("userMenuBtn");
  const userMenuPanel = document.getElementById("userMenuPanel");
  const logoutBtn = document.getElementById("logoutBtn");

  if (userMenuBtn && userMenuPanel) {
    userMenuBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      const isOpen = userMenuPanel.classList.toggle("show");
      userMenuBtn.setAttribute("aria-expanded", String(isOpen));
    });

    document.addEventListener("click", (event) => {
      if (!navUserArea.contains(event.target)) {
        userMenuPanel.classList.remove("show");
        userMenuBtn.setAttribute("aria-expanded", "false");
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        if (window.supabaseClient?.auth) {
          await window.supabaseClient.auth.signOut();
        }
      } catch (error) {
        console.error(error);
      }

      localStorage.removeItem("pixnest_current_user");
      window.location.href = "login.html";
    });
  }
}

async function renderNavByAuth() {
  let user = null;

  try {
    if (window.supabaseClient?.auth?.getUser) {
      const { data } = await window.supabaseClient.auth.getUser();
      user = data?.user || null;
    }
  } catch (error) {
    console.error(error);
  }

  if (!user) {
    user = getStoredUser();
  }

  if (user) {
    renderLoggedInNav(user);
  } else {
    renderLoggedOutNav();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  pixNestInitMenu();
  renderNavByAuth();
});
