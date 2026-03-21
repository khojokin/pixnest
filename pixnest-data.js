const PIXNEST_STORAGE_KEY = "pixnest_admin_v1";

function pixNestCreateFallbackData() {
  return {
    siteName: "PixNest",
    siteTagline: "Free and premium photo collections",
    footerText: "©️ 2026 PixNest. Discover and share powerful visual collections.",
    homepage: {
      heroTag: "Discover fresh visual collections",
      heroTitle: "Discover beautiful photos for creative projects, brands, and inspiration.",
      heroText: "Browse categories, explore standout visuals, and find photos for websites, design work, social media, and creative ideas.",
      categoriesTitle: "All Categories",
      categoriesText: "Explore visual collections across different styles, themes, and creative topics.",
      featuredTitle: "Featured Photos",
      featuredText: "Latest standout visuals selected for the PixNest collection.",
      trendingTitle: "Trending This Week",
      trendingText: "Fresh visual picks to explore across multiple styles and categories.",
      ctaTitle: "Start exploring the PixNest collection today.",
      ctaText: "Browse curated categories, discover standout images, and enjoy a growing library of free and premium visuals."
    },
    contactPage: {
      heading: "Get in Touch",
      intro: "Use the contact details or the form below to reach the PixNest team.",
      email: "hello@pixnest.com",
      phone: "+44 0000 000000",
      location: "United Kingdom",
      responseTime: "Usually within 24 to 48 hours",
      instagram: "#",
      x: "#",
      facebook: "#",
      tiktok: "#"
    },
    aboutPage: {
      heroTitle: "About PixNest",
      heroText: "PixNest is a growing photo platform built to help people discover strong visuals across free and premium collections.",
      bodyTitle: "Our Story",
      bodyText: "PixNest brings together visual collections across different categories, styles, and creative topics for inspiration, design work, and modern digital projects."
    },
    categories: []
  };
}

function pixNestEscapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function pixNestNormalizeData(data) {
  const fallback = pixNestCreateFallbackData();
  const safe = data && typeof data === "object" ? data : {};
  const homepage = safe.homepage || {};
  const contactPage = safe.contactPage || {};
  const aboutPage = safe.aboutPage || {};

  return {
    siteName: safe.siteName || fallback.siteName,
    siteTagline: safe.siteTagline || fallback.siteTagline,
    footerText: safe.footerText || fallback.footerText,
    homepage: {
      heroTag: homepage.heroTag || fallback.homepage.heroTag,
      heroTitle: homepage.heroTitle || fallback.homepage.heroTitle,
      heroText: homepage.heroText || fallback.homepage.heroText,
      categoriesTitle: homepage.categoriesTitle || fallback.homepage.categoriesTitle,
      categoriesText: homepage.categoriesText || fallback.homepage.categoriesText,
      featuredTitle: homepage.featuredTitle || fallback.homepage.featuredTitle,
      featuredText: homepage.featuredText || fallback.homepage.featuredText,
      trendingTitle: homepage.trendingTitle || fallback.homepage.trendingTitle,
      trendingText: homepage.trendingText || fallback.homepage.trendingText,
      ctaTitle: homepage.ctaTitle || fallback.homepage.ctaTitle,
      ctaText: homepage.ctaText || fallback.homepage.ctaText
    },
    contactPage: {
      heading: contactPage.heading || fallback.contactPage.heading,
      intro: contactPage.intro || fallback.contactPage.intro,
      email: contactPage.email || fallback.contactPage.email,
      phone: contactPage.phone || fallback.contactPage.phone,
      location: contactPage.location || fallback.contactPage.location,
      responseTime: contactPage.responseTime || fallback.contactPage.responseTime,
      instagram: contactPage.instagram || fallback.contactPage.instagram,
      x: contactPage.x || fallback.contactPage.x,
      facebook: contactPage.facebook || fallback.contactPage.facebook,
      tiktok: contactPage.tiktok || fallback.contactPage.tiktok
    },
    aboutPage: {
      heroTitle: aboutPage.heroTitle || fallback.aboutPage.heroTitle,
      heroText: aboutPage.heroText || fallback.aboutPage.heroText,
      bodyTitle: aboutPage.bodyTitle || fallback.aboutPage.bodyTitle,
      bodyText: aboutPage.bodyText || fallback.aboutPage.bodyText
    },
    categories: Array.isArray(safe.categories)
      ? safe.categories.map((category) => ({
          id: category.id || "",
          name: category.name || "Untitled Category",
          description: category.description || "",
          photos: Array.isArray(category.photos)
            ? category.photos.map((photo) => ({
                id: photo.id || "",
                title: photo.title || "",
                description: photo.description || "",
                credit: photo.credit || "",
                tags: photo.tags || "",
                image: photo.image || "",
                fileName: photo.fileName || "",
                createdAt: photo.createdAt || "",
                featured: Boolean(photo.featured)
              }))
            : []
        }))
      : []
  };
}

function pixNestLoadData() {
  try {
    const raw = localStorage.getItem(PIXNEST_STORAGE_KEY);
    if (raw) {
      return pixNestNormalizeData(JSON.parse(raw));
    }
  } catch (error) {
    console.error("Failed to load PixNest data:", error);
  }
  return pixNestNormalizeData(pixNestCreateFallbackData());
}

function pixNestSetText(id, value) {
  const el = document.getElementById(id);
  if (el && value !== undefined && value !== null) {
    el.textContent = value;
  }
}

function pixNestSetHref(id, value) {
  const el = document.getElementById(id);
  if (el && value) {
    el.href = value;
  }
}

function pixNestSetMailto(id, email) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = email || "";
  el.href = `mailto:${email || ""}`;
}

function pixNestSetPhone(id, phone) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = phone || "";
  el.href = `tel:${phone || ""}`;
}

function pixNestNormalizeTagToken(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/^#+/, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_-]+/g, "")
    .trim();
}

function pixNestExtractHashtagsFromText(value = "") {
  const matches = String(value || "").match(/#[a-z0-9_-]+/gi) || [];
  return [...new Set(matches.map((tag) => pixNestNormalizeTagToken(tag)).filter(Boolean))];
}

function pixNestGetPhotoTags(photo) {
  const explicitTags = String(photo && photo.tags ? photo.tags : "")
    .split(/[,|]/)
    .map((tag) => String(tag).trim())
    .filter(Boolean)
    .map((tag) => tag.replace(/^#+/, "").trim())
    .filter(Boolean);

  const hashtags = [
    photo && photo.tags,
    photo && photo.title,
    photo && photo.description,
    photo && photo.categoryName,
    photo && photo.category,
    photo && photo.credit
  ].flatMap((value) => pixNestExtractHashtagsFromText(value));

  return [...new Set([...explicitTags, ...hashtags])];
}

function pixNestBuildPhotoSearchBlob(photo, extraParts = []) {
  const tags = pixNestGetPhotoTags(photo);
  const hashtags = tags.map((tag) => `#${pixNestNormalizeTagToken(tag)}`).filter(Boolean);

  return [
    photo && photo.title,
    photo && photo.description,
    photo && photo.credit,
    photo && photo.tags,
    photo && photo.categoryName,
    photo && photo.category,
    ...tags,
    ...hashtags,
    ...extraParts
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function pixNestFlattenPhotos(categories = []) {
  return categories.flatMap((category) =>
    (category.photos || []).map((photo) => ({
      ...photo,
      categoryId: category.id,
      categoryName: category.name || "Uncategorized",
      categoryDescription: category.description || ""
    }))
  );
}

function pixNestSortNewest(items = []) {
  return [...items].sort((a, b) => {
    const aTime = new Date(a.createdAt || 0).getTime();
    const bTime = new Date(b.createdAt || 0).getTime();
    return bTime - aTime;
  });
}

function pixNestGetCategoryCover(category) {
  if (category && Array.isArray(category.photos) && category.photos.length && category.photos[0].image) {
    return category.photos[0].image;
  }

  return "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80";
}

function pixNestInitMenu() {
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");

  if (!menuToggle || !navLinks) return;

  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("show");
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
  });

  document.querySelectorAll(".nav-links a").forEach((link) => {
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

function pixNestApplyBranding(data) {
  pixNestSetText("brandTitle", data.siteName || "PixNest");
  pixNestSetText("brandSubtitle", data.siteTagline || "Photo Collection Site");
  pixNestSetText("footerText", data.footerText || "©️ 2026 PixNest. Discover and share powerful visual collections.");
}

function pixNestBuildLinkedOverlayCard(photo) {
  const tags = pixNestGetPhotoTags(photo).slice(0, 4);
  const description = (photo.description || "").trim();
  const credit = (photo.credit || "").trim();
  const href = `category.html?category=${encodeURIComponent(photo.categoryName || "")}&photo=${encodeURIComponent(photo.id || "")}`;

  return `
    <a class="visual-card" href="${href}">
      <img src="${pixNestEscapeHtml(photo.image || "")}" alt="${pixNestEscapeHtml(photo.categoryName || "Photo")}">
      <div class="photo-overlay">
        <div class="meta">
          <span class="pill">${pixNestEscapeHtml(photo.categoryName || "Photo")}</span>
          ${tags.map((tag) => `<span class="pill">${pixNestEscapeHtml(tag)}</span>`).join("")}
        </div>
        ${description ? `<p class="overlay-desc">${pixNestEscapeHtml(description)}</p>` : ""}
        ${credit ? `<div class="credit">By ${pixNestEscapeHtml(credit)}</div>` : ""}
      </div>
    </a>
  `;
}

function pixNestBuildCategoryOverlayCard(category, photo) {
  const tags = pixNestGetPhotoTags(photo).slice(0, 4);
  const description = (photo.description || "").trim();
  const credit = (photo.credit || "").trim();
  const fileName = (photo.fileName || "").trim();

  return `
    <article class="visual-card" data-photo-id="${pixNestEscapeHtml(photo.id || "")}">
      <img src="${pixNestEscapeHtml(photo.image || "")}" alt="${pixNestEscapeHtml(category.name || "Photo")}">
      <div class="photo-overlay">
        <div class="meta">
          <span class="pill">${pixNestEscapeHtml(category.name || "Photo")}</span>
          ${tags.map((tag) => `<span class="pill">${pixNestEscapeHtml(tag)}</span>`).join("")}
        </div>
        ${description ? `<p class="overlay-desc">${pixNestEscapeHtml(description)}</p>` : ""}
        ${credit ? `<div class="credit">By ${pixNestEscapeHtml(credit)}</div>` : ""}
        ${fileName ? `<div class="file-name">${pixNestEscapeHtml(fileName)}</div>` : ""}
      </div>
    </article>
  `;
}

function pixNestRenderHomePage(data) {
  const categoriesContainer = document.getElementById("categoriesContainer");
  const featuredContainer = document.getElementById("featuredPhotosContainer");
  const trendingContainer = document.getElementById("trendingPhotosContainer");

  if (!categoriesContainer && !featuredContainer && !trendingContainer) return;

  const categories = Array.isArray(data.categories) ? data.categories : [];
  const allPhotos = pixNestSortNewest(pixNestFlattenPhotos(categories));
  const homepage = data.homepage || {};

  pixNestSetText("heroTag", homepage.heroTag || "Discover fresh visual collections");
  pixNestSetText("heroTitle", homepage.heroTitle || "Discover beautiful photos for creative projects, brands, and inspiration.");
  pixNestSetText("heroText", homepage.heroText || "Browse categories, explore standout visuals, and find photos for websites, design work, social media, and creative ideas.");
  pixNestSetText("categoriesSectionTitle", homepage.categoriesTitle || "All Categories");
  pixNestSetText("categoriesSectionText", homepage.categoriesText || "Explore visual collections across different styles, themes, and creative topics.");
  pixNestSetText("featuredSectionTitle", homepage.featuredTitle || "Featured Photos");
  pixNestSetText("featuredSectionText", homepage.featuredText || "Latest standout visuals selected for the PixNest collection.");
  pixNestSetText("trendingSectionTitle", homepage.trendingTitle || "Trending This Week");
  pixNestSetText("trendingSectionText", homepage.trendingText || "Fresh visual picks to explore across multiple styles and categories.");
  pixNestSetText("ctaTitle", homepage.ctaTitle || "Start exploring the PixNest collection today.");
  pixNestSetText("ctaText", homepage.ctaText || "Browse curated categories, discover standout images, and enjoy a growing library of free and premium visuals.");
  pixNestSetText("photoCountStat", `${allPhotos.length}+`);
  pixNestSetText("categoryCountStat", `${categories.length}+`);

  if (categoriesContainer) {
    if (!categories.length) {
      categoriesContainer.innerHTML = `<div class="empty-box">Categories will appear here soon.</div>`;
    } else {
      categoriesContainer.innerHTML = categories.map((category) => `
        <article class="category-card">
          <img src="${pixNestEscapeHtml(pixNestGetCategoryCover(category))}" alt="${pixNestEscapeHtml(category.name || "Category")}">
          <div class="category-content">
            <h3>${pixNestEscapeHtml(category.name || "Untitled Category")}</h3>
            <p>${pixNestEscapeHtml(category.description || "No description added yet.")}</p>
            <div class="category-footer">
              <span class="photo-count-badge">${(category.photos || []).length} photo${(category.photos || []).length === 1 ? "" : "s"}</span>
              <a href="category.html?category=${encodeURIComponent(category.name || "")}" class="link-btn">View Photos →</a>
            </div>
          </div>
        </article>
      `).join("");
    }
  }

  function renderFeatured(photos) {
    if (!featuredContainer) return;

    const featuredPhotos = photos.filter((photo) => photo.featured);

    if (!featuredPhotos.length) {
      featuredContainer.innerHTML = `<div class="empty-box">No featured photos available yet. Check back soon for fresh highlights.</div>`;
      return;
    }

    featuredContainer.innerHTML = featuredPhotos.slice(0, 6).map(pixNestBuildLinkedOverlayCard).join("");
  }

  function renderTrending(photos) {
    if (!trendingContainer) return;

    if (!photos.length) {
      trendingContainer.innerHTML = `<div class="empty-box">No photos available yet. Check back soon for new additions.</div>`;
      return;
    }

    trendingContainer.innerHTML = photos.slice(0, 8).map(pixNestBuildLinkedOverlayCard).join("");
  }

  renderFeatured(allPhotos);
  renderTrending(allPhotos);

  const searchInput = document.getElementById("homeSearchInput");
  const searchBtn = document.getElementById("homeSearchBtn");
  const searchStatus = document.getElementById("searchStatus");

  function runHomeSearch() {
    if (!searchInput) return;

    const query = searchInput.value.toLowerCase().trim();

    if (!query) {
      renderFeatured(allPhotos);
      renderTrending(allPhotos);
      if (searchStatus) searchStatus.textContent = "";
      return;
    }

    const filtered = allPhotos.filter((photo) => {
      const haystack = [
        photo.description,
        photo.credit,
        photo.tags,
        photo.categoryName
      ].join(" ").toLowerCase();

      return haystack.includes(query);
    });

    renderFeatured(filtered);
    renderTrending(filtered);

    if (searchStatus) {
      searchStatus.textContent = `${filtered.length} result${filtered.length === 1 ? "" : "s"} for "${searchInput.value.trim()}"`;
    }
  }

  if (searchBtn && searchInput) {
    searchBtn.addEventListener("click", runHomeSearch);
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        runHomeSearch();
      }
    });
  }
}

function pixNestRenderExplorePage(data) {
  const exploreGrid = document.getElementById("exploreGrid");
  if (!exploreGrid) return;

  const categories = Array.isArray(data.categories) ? data.categories : [];
  const allPhotos = pixNestSortNewest(pixNestFlattenPhotos(categories));
  const exploreSearchInput = document.getElementById("exploreSearchInput");
  const exploreCategoryFilter = document.getElementById("exploreCategoryFilter");
  const exploreResultsText = document.getElementById("exploreResultsText");

  if (exploreCategoryFilter) {
    const currentValue = exploreCategoryFilter.value || "all";
    exploreCategoryFilter.innerHTML = `<option value="all">All Categories</option>` + categories.map((category) => {
      return `<option value="${pixNestEscapeHtml(category.id || "")}">${pixNestEscapeHtml(category.name || "Category")}</option>`;
    }).join("");

    const exists = [...exploreCategoryFilter.options].some((option) => option.value === currentValue);
    exploreCategoryFilter.value = exists ? currentValue : "all";
  }

  function renderExploreList() {
    const searchValue = exploreSearchInput ? exploreSearchInput.value.toLowerCase().trim() : "";
    const categoryValue = exploreCategoryFilter ? exploreCategoryFilter.value : "all";

    const filtered = allPhotos.filter((photo) => {
      const categoryMatch = categoryValue === "all" || photo.categoryId === categoryValue;

      const textMatch = !searchValue || [
        photo.description,
        photo.credit,
        photo.tags,
        photo.categoryName
      ].join(" ").toLowerCase().includes(searchValue);

      return categoryMatch && textMatch;
    });

    if (!filtered.length) {
      exploreGrid.innerHTML = `<div class="empty-box">No photos found for this search or category.</div>`;
    } else {
      exploreGrid.innerHTML = filtered.map(pixNestBuildLinkedOverlayCard).join("");
    }

    if (exploreResultsText) {
      exploreResultsText.textContent = `${filtered.length} photo${filtered.length === 1 ? "" : "s"} found`;
    }
  }

  if (exploreSearchInput) {
    exploreSearchInput.addEventListener("input", renderExploreList);
  }

  if (exploreCategoryFilter) {
    exploreCategoryFilter.addEventListener("change", renderExploreList);
  }

  renderExploreList();
}

function pixNestRenderCategoryPage(data) {
  const photoGrid = document.getElementById("photoGrid");
  if (!photoGrid) return;

  const categories = Array.isArray(data.categories) ? data.categories : [];
  const params = new URLSearchParams(window.location.search);
  const selectedCategoryName = params.get("category") || "";
  const selectedPhotoId = params.get("photo") || "";

  const activeCategory =
    categories.find((category) => (category.name || "").toLowerCase() === selectedCategoryName.toLowerCase()) ||
    categories[0] ||
    null;

  const categorySwitcher = document.getElementById("categorySwitcher");
  if (categorySwitcher) {
    if (!categories.length) {
      categorySwitcher.innerHTML = "";
    } else {
      categorySwitcher.innerHTML = categories.map((category) => `
        <a
          href="category.html?category=${encodeURIComponent(category.name || "")}"
          class="category-pill ${activeCategory && activeCategory.id === category.id ? "active" : ""}"
        >
          ${pixNestEscapeHtml(category.name || "Category")}
        </a>
      `).join("");
    }
  }

  if (!activeCategory) {
    pixNestSetText("categoryTitle", "No Category Found");
    pixNestSetText("categoryDescription", "There are no categories available yet.");
    pixNestSetText("galleryHeading", "Photos");
    pixNestSetText("galleryCountText", "0 photos in this category.");
    photoGrid.innerHTML = `<div class="empty-box">No photos found in this category yet.</div>`;
    return;
  }

  pixNestSetText("categoryTitle", activeCategory.name || "Category");
  pixNestSetText("categoryDescription", activeCategory.description || "Browse the photos in this collection and open any image in a larger view.");
  pixNestSetText("galleryHeading", `${activeCategory.name || "Category"} Photos`);
  pixNestSetText("galleryCountText", `${(activeCategory.photos || []).length} photo${(activeCategory.photos || []).length === 1 ? "" : "s"} in this category.`);

  const photos = Array.isArray(activeCategory.photos) ? activeCategory.photos : [];

  if (!photos.length) {
    photoGrid.innerHTML = `<div class="empty-box">No photos found in this category yet.</div>`;
    return;
  }

  photoGrid.innerHTML = photos.map((photo) => pixNestBuildCategoryOverlayCard(activeCategory, photo)).join("");

  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightboxImage");
  const lightboxClose = document.getElementById("lightboxClose");

  function openLightbox(photo) {
    if (!lightbox || !lightboxImage) return;

    lightboxImage.src = photo.image || "";
    lightboxImage.alt = photo.fileName || activeCategory.name || "Large photo";

    pixNestSetText("lightboxTitle", photo.fileName || photo.title || "Photo");
    pixNestSetText("lightboxDesc", photo.description || "No description added.");
    pixNestSetText("lightboxCategory", activeCategory.name || "Uncategorized");
    pixNestSetText("lightboxCredit", photo.credit || "Unknown");
    pixNestSetText("lightboxTags", pixNestGetPhotoTags(photo).join(", ") || "No tags");
    pixNestSetText("lightboxFileName", photo.fileName || "No file name");

    lightbox.classList.add("show");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("show");
    document.body.style.overflow = "";
  }

  document.querySelectorAll(".visual-card[data-photo-id]").forEach((card) => {
    const photoId = card.getAttribute("data-photo-id");
    const photo = photos.find((item) => String(item.id) === String(photoId));
    if (!photo) return;

    card.addEventListener("click", () => {
      openLightbox(photo);
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener("click", closeLightbox);
  }

  if (lightbox) {
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeLightbox();
    }
  });

  if (selectedPhotoId) {
    const targetPhoto = photos.find((photo) => String(photo.id) === String(selectedPhotoId));
    if (targetPhoto) {
      setTimeout(() => {
        openLightbox(targetPhoto);
      }, 100);
    }
  }
}

function pixNestRenderAboutPage(data) {
  pixNestSetText("aboutHeroTitle", data.aboutPage.heroTitle || "About PixNest");
  pixNestSetText("aboutHeroText", data.aboutPage.heroText || "PixNest is a growing photo platform.");
  pixNestSetText("aboutBodyTitle", data.aboutPage.bodyTitle || "Our Story");
  pixNestSetText("aboutBodyText", data.aboutPage.bodyText || "PixNest brings together strong visual collections.");
}

function pixNestRenderContactPage(data) {
  pixNestSetText("contactHeading", data.contactPage.heading || "Get in Touch");
  pixNestSetText("contactIntro", data.contactPage.intro || "Use the contact details or the form below to reach the PixNest team.");
  pixNestSetText("contactLocation", data.contactPage.location || "United Kingdom");
  pixNestSetText("contactResponseTime", data.contactPage.responseTime || "Usually within 24 to 48 hours");

  pixNestSetMailto("contactEmail", data.contactPage.email || "hello@pixnest.com");
  pixNestSetPhone("contactPhone", data.contactPage.phone || "+44 0000 000000");

  pixNestSetHref("instagramLink", data.contactPage.instagram || "#");
  pixNestSetHref("xLink", data.contactPage.x || "#");
  pixNestSetHref("facebookLink", data.contactPage.facebook || "#");
  pixNestSetHref("tiktokLink", data.contactPage.tiktok || "#");
}

document.addEventListener("DOMContentLoaded", () => {
  const data = pixNestLoadData();

  pixNestInitMenu();
  pixNestApplyBranding(data);
  pixNestRenderHomePage(data);
  pixNestRenderExplorePage(data);
  pixNestRenderCategoryPage(data);
  pixNestRenderAboutPage(data);
  pixNestRenderContactPage(data);
});