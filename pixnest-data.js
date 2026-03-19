(() => {
  const STORAGE_KEY = "pixnest_admin_v1";

  function byId(id) {
    return document.getElementById(id);
  }

  function escapeHtml(value = "") {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.error("Could not load PixNest data:", error);
      return null;
    }
  }

  function flattenPhotos(categories = []) {
    return categories.flatMap(category =>
      (category.photos || []).map(photo => ({
        ...photo,
        categoryId: category.id,
        categoryName: category.name || "Uncategorized",
        categoryDescription: category.description || ""
      }))
    );
  }

  function sortNewest(items = []) {
    return [...items].sort((a, b) => {
      const aTime = new Date(a.createdAt || 0).getTime();
      const bTime = new Date(b.createdAt || 0).getTime();
      return bTime - aTime;
    });
  }

  function getPhotoTags(photo) {
    return (photo.tags || "")
      .split(",")
      .map(tag => tag.trim())
      .filter(Boolean);
  }

  function getCategoryCover(category) {
    if (category.photos && category.photos.length) {
      return category.photos[0].image;
    }
    return "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80";
  }

  function setText(id, value) {
    const el = byId(id);
    if (el && value !== undefined && value !== null) {
      el.textContent = value;
    }
  }

  function slugifyFileName(text = "photo") {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "photo";
  }

  function applyBranding(data) {
    if (!data) return;

    setText("brandTitle", data.siteName || "PixNest");
    setText("brandSubtitle", data.siteTagline || "Photo Collection Site");
    setText("heroSiteName", data.siteName || "PixNest");
    setText("footerText", `©️ 2026 ${data.siteName || "PixNest"}. Discover and share powerful visual collections.`);
  }

  function initMenu() {
    const menuToggle = byId("menuToggle");
    const navLinks = byId("navLinks");

    if (!menuToggle || !navLinks) return;

    menuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("show");
      const expanded = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!expanded));
    });

    document.querySelectorAll(".nav-links a").forEach(link => {
      link.addEventListener("click", () => {
        if (window.innerWidth <= 768) {
          navLinks.classList.remove("show");
          menuToggle.setAttribute("aria-expanded", "false");
        }
      });
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) {
        navLinks.classList.remove("show");
        menuToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  function renderStats(categories, photos) {
    setText("photoCountStat", `${photos.length}+`);
    setText("categoryCountStat", `${categories.length}+`);
  }

  function renderHomeCategories(categories = []) {
    const container = byId("categoriesContainer");
    if (!container) return;

    if (!categories.length) {
      container.innerHTML = `
        <div class="empty-box">
          No categories yet. Add categories in the admin page and they will appear here.
        </div>
      `;
      return;
    }

    container.innerHTML = categories.map(category => `
      <article class="category-card">
        <img src="${escapeHtml(getCategoryCover(category))}" alt="${escapeHtml(category.name || "Category")}">
        <div class="category-content">
          <h3>${escapeHtml(category.name || "Untitled Category")}</h3>
          <p>${escapeHtml(category.description || "No description added yet.")}</p>
          <a href="category.html?category=${encodeURIComponent(category.name || "")}" class="link-btn">Open Category →</a>
        </div>
      </article>
    `).join("");
  }

  function renderFeaturedPhotos(photos = []) {
    const container = byId("featuredPhotosContainer");
    if (!container) return;

    if (!photos.length) {
      container.innerHTML = `
        <div class="empty-box">
          No featured photos yet. Upload pictures from the admin page and they will show here.
        </div>
      `;
      return;
    }

    const featured = photos.slice(0, 3);

    container.innerHTML = featured.map(photo => `
      <article class="photo-card">
        <img src="${escapeHtml(photo.image || "")}" alt="${escapeHtml(photo.title || "Photo")}">
        <div class="photo-content">
          <div class="meta">
            <span class="pill">${escapeHtml(photo.categoryName || "Photo")}</span>
            ${getPhotoTags(photo).slice(0, 1).map(tag => `<span class="pill">${escapeHtml(tag)}</span>`).join("")}
          </div>
          <h3>${escapeHtml(photo.title || "Untitled Photo")}</h3>
          <p>${escapeHtml(photo.description || "No description added.")}</p>
          <div class="credit">By ${escapeHtml(photo.credit || "Unknown")}</div>
        </div>
      </article>
    `).join("");
  }

  function renderTrendingPhotos(photos = []) {
    const container = byId("trendingPhotosContainer");
    if (!container) return;

    if (!photos.length) {
      container.innerHTML = `
        <div class="empty-box">
          No photos found. Upload pictures from the admin page and they will show here.
        </div>
      `;
      return;
    }

    const trending = photos.slice(0, 8);

    container.innerHTML = trending.map(photo => `
      <article class="masonry-item">
        <img src="${escapeHtml(photo.image || "")}" alt="${escapeHtml(photo.title || "Photo")}">
        <div class="info">
          <h4>${escapeHtml(photo.title || "Untitled Photo")}</h4>
          <p>${escapeHtml(photo.categoryName || "Photo")} • ${escapeHtml(getPhotoTags(photo)[0] || "Gallery")}</p>
        </div>
      </article>
    `).join("");
  }

  function renderSearchResultsLabel(text = "") {
    const label = byId("searchStatus");
    if (!label) return;
    label.textContent = text;
  }

  function setupHomeSearch(allPhotos) {
    const input = byId("homeSearchInput");
    const button = byId("homeSearchBtn");
    if (!input || !button) return;

    function runSearch() {
      const query = input.value.toLowerCase().trim();

      if (!query) {
        renderFeaturedPhotos(allPhotos);
        renderTrendingPhotos(allPhotos);
        renderSearchResultsLabel("");
        return;
      }

      const filtered = allPhotos.filter(photo => {
        const searchText = [
          photo.title,
          photo.description,
          photo.credit,
          photo.tags,
          photo.categoryName
        ].join(" ").toLowerCase();

        return searchText.includes(query);
      });

      renderFeaturedPhotos(filtered);
      renderTrendingPhotos(filtered);
      renderSearchResultsLabel(`${filtered.length} result${filtered.length === 1 ? "" : "s"} for "${input.value.trim()}"`);
    }

    button.addEventListener("click", runSearch);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        runSearch();
      }
    });
  }

  function renderExploreCategories(categories = []) {
    const container = byId("exploreCategoriesContainer");
    if (!container) return;

    if (!categories.length) {
      container.innerHTML = `
        <div class="empty-box">
          No categories yet. Add categories from the admin page.
        </div>
      `;
      return;
    }

    container.innerHTML = categories.map(category => `
      <article class="category-box">
        <img src="${escapeHtml(getCategoryCover(category))}" alt="${escapeHtml(category.name || "Category")}">
        <div class="category-box-content">
          <h3>${escapeHtml(category.name || "Category")}</h3>
          <p>${escapeHtml(category.description || "No description added.")}</p>
          <div class="category-box-foot">
            <span class="small-pill">${(category.photos || []).length} photo${(category.photos || []).length === 1 ? "" : "s"}</span>
            <a href="category.html?category=${encodeURIComponent(category.name || "")}" class="link-btn">View Photos →</a>
          </div>
        </div>
      </article>
    `).join("");
  }

  function renderExplorePhotos(photos = []) {
    const container = byId("exploreGridContainer");
    if (!container) return;

    if (!photos.length) {
      container.innerHTML = `
        <div class="empty-box">
          No photos match this search or category.
        </div>
      `;
      return;
    }

    container.innerHTML = photos.map(photo => `
      <article class="explore-photo-card">
        <img src="${escapeHtml(photo.image || "")}" alt="${escapeHtml(photo.title || "Photo")}">
        <div class="explore-photo-content">
          <div class="meta">
            <span class="pill">${escapeHtml(photo.categoryName || "Photo")}</span>
            ${getPhotoTags(photo).slice(0, 2).map(tag => `<span class="pill">${escapeHtml(tag)}</span>`).join("")}
          </div>
          <h3>${escapeHtml(photo.title || "Untitled Photo")}</h3>
          <p>${escapeHtml(photo.description || "No description added.")}</p>
          <div class="credit">By ${escapeHtml(photo.credit || "Unknown")}</div>
        </div>
      </article>
    `).join("");
  }

  function setupExplorePage(categories, allPhotos) {
    const searchInput = byId("exploreSearchInput");
    const categorySelect = byId("exploreCategorySelect");
    const searchBtn = byId("exploreSearchBtn");
    const countLabel = byId("exploreCountText");

    if (!searchInput || !categorySelect || !searchBtn || !countLabel) return;

    categorySelect.innerHTML = `<option value="all">All Categories</option>` +
      categories.map(category => `
        <option value="${escapeHtml(category.name || "")}">${escapeHtml(category.name || "")}</option>
      `).join("");

    const params = new URLSearchParams(window.location.search);
    const categoryFromUrl = params.get("category");

    if (categoryFromUrl) {
      categorySelect.value = categoryFromUrl;
      const matched = categories.find(cat => cat.name === categoryFromUrl);
      if (matched) {
        setText("exploreHeroTitle", `${matched.name} Photos`);
        setText("exploreHeroDesc", matched.description || `Browse photos from the ${matched.name} collection.`);
      }
    }

    function runExploreFilter() {
      const searchValue = searchInput.value.toLowerCase().trim();
      const selectedCategory = categorySelect.value;

      const filtered = allPhotos.filter(photo => {
        const matchesCategory = selectedCategory === "all" || photo.categoryName === selectedCategory;

        const text = [
          photo.title,
          photo.description,
          photo.credit,
          photo.tags,
          photo.categoryName
        ].join(" ").toLowerCase();

        const matchesSearch = !searchValue || text.includes(searchValue);

        return matchesCategory && matchesSearch;
      });

      countLabel.textContent = `${filtered.length} photo${filtered.length === 1 ? "" : "s"} found`;
      renderExplorePhotos(filtered);
    }

    searchBtn.addEventListener("click", runExploreFilter);
    categorySelect.addEventListener("change", runExploreFilter);
    searchInput.addEventListener("input", runExploreFilter);

    runExploreFilter();
  }

  function renderCategoryHero(category, photoCount) {
    setText("categoryHeroTitle", category.name || "Category");
    setText("categoryHeroDesc", category.description || "Browse this category collection.");
    setText("categoryCountText", `${photoCount} photo${photoCount === 1 ? "" : "s"}`);
  }

  function renderRelatedCategories(categories = [], currentCategoryName = "") {
    const container = byId("relatedCategoriesContainer");
    if (!container) return;

    const related = categories.filter(cat => cat.name !== currentCategoryName).slice(0, 3);

    if (!related.length) {
      container.innerHTML = `
        <div class="empty-box">
          No other categories yet.
        </div>
      `;
      return;
    }

    container.innerHTML = related.map(category => `
      <article class="category-box">
        <img src="${escapeHtml(getCategoryCover(category))}" alt="${escapeHtml(category.name || "Category")}">
        <div class="category-box-content">
          <h3>${escapeHtml(category.name || "Category")}</h3>
          <p>${escapeHtml(category.description || "No description added.")}</p>
          <div class="category-box-foot">
            <span class="small-pill">${(category.photos || []).length} photo${(category.photos || []).length === 1 ? "" : "s"}</span>
            <a href="category.html?category=${encodeURIComponent(category.name || "")}" class="link-btn">Open Category →</a>
          </div>
        </div>
      </article>
    `).join("");
  }

  function renderCategoryPhotos(photos = []) {
    const container = byId("categoryGridContainer");
    if (!container) return;

    if (!photos.length) {
      container.innerHTML = `
        <div class="empty-box">
          No photos in this category yet.
        </div>
      `;
      return;
    }

    container.innerHTML = photos.map(photo => {
      const fileName = photo.fileName || `${slugifyFileName(photo.title || "photo")}.jpg`;

      return `
        <article class="explore-photo-card">
          <img src="${escapeHtml(photo.image || "")}" alt="${escapeHtml(photo.title || "Photo")}">
          <div class="explore-photo-content">
            <div class="meta">
              ${getPhotoTags(photo).slice(0, 2).map(tag => `<span class="pill">${escapeHtml(tag)}</span>`).join("")}
            </div>
            <h3>${escapeHtml(photo.title || "Untitled Photo")}</h3>
            <p>${escapeHtml(photo.description || "No description added.")}</p>
            <div class="credit">By ${escapeHtml(photo.credit || "Unknown")}</div>

            <div class="photo-actions">
              <button
                class="action-btn view-btn"
                data-src="${escapeHtml(photo.image || "")}"
                data-title="${escapeHtml(photo.title || "Photo")}"
                type="button"
              >
                View Bigger
              </button>

              <a
                class="action-btn download-btn"
                href="${escapeHtml(photo.image || "")}"
                download="${escapeHtml(fileName)}"
              >
                Download
              </a>

              <button
                class="action-btn share-btn"
                data-title="${escapeHtml(photo.title || "Photo")}"
                data-category="${escapeHtml(photo.categoryName || "Category")}"
                type="button"
              >
                Share
              </button>
            </div>
          </div>
        </article>
      `;
    }).join("");

    attachCategoryActionHandlers();
  }

  function openLightbox(src, title) {
    const modal = byId("imageLightbox");
    const modalImg = byId("lightboxImage");
    const modalTitle = byId("lightboxTitle");

    if (!modal || !modalImg || !modalTitle) return;

    modalImg.src = src;
    modalImg.alt = title;
    modalTitle.textContent = title;
    modal.classList.add("show");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    const modal = byId("imageLightbox");
    if (!modal) return;
    modal.classList.remove("show");
    document.body.style.overflow = "";
  }

  async function sharePhoto(title, category) {
    const shareText = `Check out "${title}" in the ${category} category on PixNest`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: shareUrl
        });
        return;
      } catch (error) {}
    }

    const fallbackText = `${shareText} - ${shareUrl}`;

    try {
      await navigator.clipboard.writeText(fallbackText);
      alert("Photo link copied to clipboard.");
    } catch (error) {
      alert(fallbackText);
    }
  }

  function attachCategoryActionHandlers() {
    document.querySelectorAll(".view-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        openLightbox(btn.dataset.src || "", btn.dataset.title || "Photo");
      });
    });

    document.querySelectorAll(".share-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        sharePhoto(btn.dataset.title || "Photo", btn.dataset.category || "Category");
      });
    });
  }

  function setupLightbox() {
    const modal = byId("imageLightbox");
    const closeBtn = byId("lightboxClose");

    if (!modal || !closeBtn) return;

    closeBtn.addEventListener("click", closeLightbox);

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeLightbox();
      }
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeLightbox();
      }
    });
  }

  function setupCategoryPage(categories = []) {
    const params = new URLSearchParams(window.location.search);
    const categoryName = params.get("category");
    const searchInput = byId("categorySearchInput");
    const searchBtn = byId("categorySearchBtn");
    const countLabel = byId("categoryResultCount");

    setupLightbox();

    if (!categoryName) {
      setText("categoryHeroTitle", "Category Not Found");
      setText("categoryHeroDesc", "No category was selected.");
      if (countLabel) countLabel.textContent = "0 photos found";
      renderCategoryPhotos([]);
      renderRelatedCategories(categories, "");
      return;
    }

    const category = categories.find(cat => cat.name === categoryName);

    if (!category) {
      setText("categoryHeroTitle", "Category Not Found");
      setText("categoryHeroDesc", "This category does not exist in your admin data.");
      if (countLabel) countLabel.textContent = "0 photos found";
      renderCategoryPhotos([]);
      renderRelatedCategories(categories, "");
      return;
    }

    const allCategoryPhotos = sortNewest(
      (category.photos || []).map(photo => ({
        ...photo,
        categoryName: category.name,
        categoryDescription: category.description
      }))
    );

    renderCategoryHero(category, allCategoryPhotos.length);
    renderRelatedCategories(categories, category.name);

    function runCategorySearch() {
      const searchValue = searchInput ? searchInput.value.toLowerCase().trim() : "";

      const filtered = allCategoryPhotos.filter(photo => {
        if (!searchValue) return true;

        const text = [
          photo.title,
          photo.description,
          photo.credit,
          photo.tags,
          photo.categoryName
        ].join(" ").toLowerCase();

        return text.includes(searchValue);
      });

      if (countLabel) {
        countLabel.textContent = `${filtered.length} photo${filtered.length === 1 ? "" : "s"} found`;
      }

      renderCategoryPhotos(filtered);
    }

    if (searchBtn) searchBtn.addEventListener("click", runCategorySearch);
    if (searchInput) {
      searchInput.addEventListener("input", runCategorySearch);
      searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") runCategorySearch();
      });
    }

    runCategorySearch();
  }

  document.addEventListener("DOMContentLoaded", () => {
    initMenu();

    const data = loadData();
    if (!data) return;

    const categories = data.categories || [];
    const allPhotos = sortNewest(flattenPhotos(categories));

    applyBranding(data);

    const page = document.body.dataset.page || "home";

    if (page === "home") {
      renderStats(categories, allPhotos);
      renderHomeCategories(categories);
      renderFeaturedPhotos(allPhotos);
      renderTrendingPhotos(allPhotos);
      setupHomeSearch(allPhotos);
    }

    if (page === "explore") {
      setText("exploreHeroTitle", `${data.siteName || "PixNest"} Explore`);
      setText("exploreHeroDesc", "Browse all uploaded photos, search by keyword, and filter by category.");
      renderExploreCategories(categories);
      setupExplorePage(categories, allPhotos);
    }

    if (page === "category") {
      setupCategoryPage(categories);
    }
  });
})();