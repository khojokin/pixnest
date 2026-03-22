const exploreRefs = {
  heroSection: document.getElementById("heroSection"),
  heroTag: document.getElementById("heroTag"),
  heroTitle: document.getElementById("heroTitle"),
  heroDescription: document.getElementById("heroDescription"),
  heroMeta: document.getElementById("heroMeta"),
  exploreHeading: document.getElementById("exploreHeading"),
  exploreText: document.getElementById("exploreText"),
  searchInput: document.getElementById("searchInput"),
  categoryFilter: document.getElementById("categoryFilter"),
  photoFilter: document.getElementById("photoFilter"),
  searchBtn: document.getElementById("searchBtn"),
  exploreNote: document.getElementById("exploreNote"),
  photoGrid: document.getElementById("photoGrid"),
  footerText: document.getElementById("footerText")
};

const EXPLORE_STORAGE_KEY = "pixnest_admin_v2";
const DEFAULT_EXPLORE_HERO = "explorepageimg.avif";
const DEFAULT_EXPLORE_IMAGE = "naturecatimg.avif";

let exploreSiteData = {
  categories: [],
  homepage: {},
  footerText: ""
};

let exploreAllPhotos = [];

function esc(value = "") {
  if (typeof pixNestEscapeHtml === "function") return pixNestEscapeHtml(value);
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeText(value = "") {
  return String(value || "").trim().toLowerCase();
}

function normalizeHashToken(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^#+/, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_-]+/g, "")
    .trim();
}

function loadExploreAdminData() {
  try {
    if (typeof pixNestLoadData === "function") {
      const loaded = pixNestLoadData() || {};
      return {
        categories: Array.isArray(loaded.categories) ? loaded.categories : [],
        homepage: loaded.homepage && typeof loaded.homepage === "object" ? loaded.homepage : {},
        footerText: loaded.footerText || ""
      };
    }

    const raw = localStorage.getItem(EXPLORE_STORAGE_KEY);
    if (!raw) {
      return {
        categories: [],
        homepage: {},
        footerText: ""
      };
    }

    const parsed = JSON.parse(raw);
    return {
      categories: Array.isArray(parsed.categories) ? parsed.categories : [],
      homepage: parsed.homepage && typeof parsed.homepage === "object" ? parsed.homepage : {},
      footerText: parsed.footerText || ""
    };
  } catch (error) {
    console.error("Could not load explore data:", error);
    return {
      categories: [],
      homepage: {},
      footerText: ""
    };
  }
}

function getPhotoId(photo) {
  return String(
    photo?.id ||
    photo?.photo_id ||
    photo?.image_url ||
    photo?.createdAt ||
    `${photo?.category || ""}-${photo?.credit || ""}-${photo?.title || ""}`
  );
}

function getPhotoTitle(photo) {
  return String(
    photo?.title ||
    photo?.public_title ||
    photo?.description ||
    "Untitled photo"
  ).trim();
}

function getPhotoDescription(photo) {
  return String(
    photo?.description ||
    photo?.caption ||
    photo?.public_title ||
    photo?.title ||
    ""
  ).trim();
}

function getCreatorName(photo) {
  return String(
    photo?.credit ||
    photo?.creator ||
    photo?.author ||
    photo?.user_name ||
    "Unknown creator"
  ).trim();
}

function getPhotoTags(photo) {
  if (typeof pixNestGetPhotoTags === "function") {
    return pixNestGetPhotoTags(photo);
  }

  const explicitTags = String(photo?.tags || "")
    .split(/[,|]/)
    .map(tag => String(tag).trim())
    .filter(Boolean)
    .map(tag => tag.replace(/^#+/, "").trim())
    .filter(Boolean);

  const titleHashes = String(photo?.title || "").match(/#([a-z0-9_-]+)/gi) || [];
  const descHashes = String(photo?.description || "").match(/#([a-z0-9_-]+)/gi) || [];

  return [...new Set(
    [...explicitTags, ...titleHashes, ...descHashes]
      .map(tag => String(tag).replace(/^#+/, "").trim())
      .filter(Boolean)
  )];
}

function getNumberValue(photo, keys = []) {
  for (const key of keys) {
    const value = photo?.[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }
  return 0;
}

function getLikes(photo) {
  return getNumberValue(photo, ["likes", "like_count", "likes_count", "total_likes"]);
}

function getViews(photo) {
  return getNumberValue(photo, ["views", "view_count", "views_count", "total_views"]);
}

function getFavourites(photo) {
  return getNumberValue(photo, ["favourites", "favorites", "favourite_count", "favorite_count"]);
}

function isPremiumPhoto(photo) {
  return Boolean(photo?.is_premium || photo?.premium_only || normalizeText(photo?.access) === "premium");
}

function isFeaturedPhoto(photo) {
  return Boolean(photo?.featured || photo?.is_featured || normalizeText(photo?.status) === "featured");
}

function getPostDateValue(photo) {
  return photo?.createdAt || photo?.created_at || photo?.posted || photo?.date || "";
}

function flattenExplorePhotos() {
  const rows = [];

  (exploreSiteData.categories || []).forEach(category => {
    const categoryName = String(category?.name || category?.title || category?.category || "Uncategorized").trim();
    const categoryDescription = String(category?.description || "").trim();
    const photos = Array.isArray(category?.photos) ? category.photos : [];

    photos.forEach(photo => {
      rows.push({
        ...photo,
        category: String(photo?.category || categoryName).trim(),
        categoryDescription
      });
    });
  });

  return rows;
}

function getMergedExploreCategories() {
  const names = [...new Set(
    exploreAllPhotos
      .map(photo => String(photo?.category || "").trim())
      .filter(Boolean)
  )].sort((a, b) => a.localeCompare(b));

  return names;
}

function fillExploreCategoryFilter() {
  const selectedBefore = exploreRefs.categoryFilter.value;
  const requestedCategory = new URLSearchParams(window.location.search).get("category");
  const categories = getMergedExploreCategories();

  exploreRefs.categoryFilter.innerHTML = `
    <option value="all">All Categories</option>
    ${categories.map(name => `<option value="${esc(name)}">${esc(name)}</option>`).join("")}
  `;

  if (requestedCategory && categories.some(name => name.toLowerCase() === requestedCategory.toLowerCase())) {
    const match = categories.find(name => name.toLowerCase() === requestedCategory.toLowerCase());
    exploreRefs.categoryFilter.value = match;
  } else if (categories.includes(selectedBefore)) {
    exploreRefs.categoryFilter.value = selectedBefore;
  } else {
    exploreRefs.categoryFilter.value = "all";
  }
}

function buildPhotoSearchBlob(photo) {
  const tags = getPhotoTags(photo);
  const hashtags = tags.map(tag => `#${normalizeHashToken(tag)}`).filter(Boolean);

  const helpValue = Array.isArray(photo?.help)
    ? photo.help.join(" ")
    : String(photo?.help || photo?.support || photo?.tips || "");

  const faqValue = Array.isArray(photo?.faqs)
    ? photo.faqs.join(" ")
    : String(photo?.faqs || photo?.faq || "");

  return [
    getPhotoTitle(photo),
    getPhotoDescription(photo),
    getCreatorName(photo),
    photo?.category || "",
    photo?.categoryDescription || "",
    photo?.tags || "",
    helpValue,
    faqValue,
    ...tags,
    ...hashtags
  ].join(" ").toLowerCase();
}

function getTrendingIds(rows) {
  const ranked = [...rows].sort((a, b) => {
    const as = (getViews(a) * 2) + (getLikes(a) * 3) + (getFavourites(a) * 3) + (isFeaturedPhoto(a) ? 10 : 0);
    const bs = (getViews(b) * 2) + (getLikes(b) * 3) + (getFavourites(b) * 3) + (isFeaturedPhoto(b) ? 10 : 0);
    return bs - as;
  });

  return new Set(ranked.slice(0, 12).map(getPhotoId));
}

function buildPreferenceProfile(rows = []) {
  const reactionState = typeof pixNestLoadReactionState === "function"
    ? pixNestLoadReactionState()
    : (() => {
        try {
          const saved = localStorage.getItem("pixnest_photo_reactions_v1");
          return saved ? JSON.parse(saved) : {};
        } catch {
          return {};
        }
      })();

  const profile = {
    tagWeights: {},
    categoryWeights: {},
    creatorWeights: {},
    hasSignals: false
  };

  const photoMap = new Map();
  rows.forEach(photo => {
    photoMap.set(String(getPhotoId(photo)), photo);
  });

  Object.entries(reactionState || {}).forEach(([photoId, state]) => {
    const photo = photoMap.get(String(photoId));
    if (!photo) return;

    let weight = 0;
    if (state?.liked) weight += 2;
    if (state?.favourited) weight += 4;
    if (!weight) return;

    profile.hasSignals = true;

    getPhotoTags(photo).forEach(tag => {
      const key = normalizeHashToken(tag);
      profile.tagWeights[key] = (profile.tagWeights[key] || 0) + weight;
    });

    const categoryKey = normalizeHashToken(photo?.category || "");
    profile.categoryWeights[categoryKey] = (profile.categoryWeights[categoryKey] || 0) + (weight + 1);

    const creatorKey = normalizeHashToken(getCreatorName(photo));
    profile.creatorWeights[creatorKey] = (profile.creatorWeights[creatorKey] || 0) + Math.max(1, weight - 1);
  });

  return profile;
}

function getPreferenceScore(photo, profile) {
  if (!profile?.hasSignals) return 0;

  let score = 0;

  getPhotoTags(photo).forEach(tag => {
    score += profile.tagWeights[normalizeHashToken(tag)] || 0;
  });

  score += (profile.categoryWeights[normalizeHashToken(photo?.category || "")] || 0) * 2;
  score += profile.creatorWeights[normalizeHashToken(getCreatorName(photo))] || 0;

  return score;
}

function buildHero(rows = exploreAllPhotos) {
  const homepage = exploreSiteData.homepage || {};
  const selectedCategory = exploreRefs.categoryFilter.value || "all";
  const categoryCount = getMergedExploreCategories().length;
  const featuredCount = rows.filter(isFeaturedPhoto).length;
  const premiumCount = rows.filter(isPremiumPhoto).length;
  const heroImage = rows[0]?.image_url || DEFAULT_EXPLORE_HERO;

  exploreRefs.heroSection.style.background =
    `linear-gradient(rgba(15,23,42,.70), rgba(15,23,42,.92)), url('${heroImage}') center/cover no-repeat`;

  if (selectedCategory !== "all") {
    exploreRefs.heroTag.textContent = "Explore Category";
    exploreRefs.heroTitle.textContent = selectedCategory;
    exploreRefs.heroDescription.textContent = `Browse photos, creators, hashtags, help topics, and FAQs inside the ${selectedCategory} collection.`;
    exploreRefs.exploreHeading.textContent = `${selectedCategory} Photos`;
    exploreRefs.exploreText.textContent = `Explore all visuals currently available in ${selectedCategory}.`;
    document.title = `PixNest | Explore ${selectedCategory}`;
  } else {
    exploreRefs.heroTag.textContent = "Explore Gallery";
    exploreRefs.heroTitle.textContent = homepage.exploreTitle || "Explore Photos";
    exploreRefs.heroDescription.textContent = homepage.exploreText || "Browse different photos, creators, hashtags, help topics, FAQs, featured visuals, and premium photography from creators on PixNest.";
    exploreRefs.exploreHeading.textContent = homepage.exploreTitle || "Explore Photos";
    exploreRefs.exploreText.textContent = homepage.exploreText || "Search across creators, categories, hashtags, help topics, FAQs, descriptions, and trending photo collections.";
    document.title = "PixNest | Explore";
  }

  exploreRefs.heroMeta.innerHTML = `
    <span class="pill category-tag">${rows.length} photo${rows.length === 1 ? "" : "s"}</span>
    <span class="pill trending"><i class="fa-solid fa-layer-group"></i> ${categoryCount} categor${categoryCount === 1 ? "y" : "ies"}</span>
    ${featuredCount ? `<span class="pill featured"><i class="fa-solid fa-bolt"></i> Featured ${featuredCount}</span>` : ``}
    ${premiumCount ? `<span class="pill premium"><i class="fa-solid fa-star"></i> Premium ${premiumCount}</span>` : ``}
  `;
}

function buildExploreCard(photo, trendingIds) {
  const photoId = getPhotoId(photo);
  const image = photo?.image_url || DEFAULT_EXPLORE_IMAGE;
  const description = getPhotoDescription(photo) || "Photo from the PixNest collection.";
  const creator = getCreatorName(photo);
  const tags = getPhotoTags(photo).slice(0, 3);

  return `
    <article class="visual-card" data-photo-id="${esc(photoId)}">
      <img src="${esc(image)}" alt="${esc(getPhotoTitle(photo))}">

      <div class="card-top-row">
        <div class="card-top-left">
          <span class="pill category-tag">${esc(photo.category || "Uncategorized")}</span>
          ${isFeaturedPhoto(photo) ? `<span class="pill featured"><i class="fa-solid fa-bolt"></i> Featured</span>` : ``}
          ${trendingIds.has(photoId) ? `<span class="pill trending"><i class="fa-solid fa-fire"></i> Trending</span>` : ``}
        </div>

        <div class="card-top-right">
          ${isPremiumPhoto(photo) ? `<span class="pill premium"><i class="fa-solid fa-star"></i> Premium</span>` : ``}
        </div>
      </div>

      <div class="photo-overlay">
        <div class="overlay-category">
          ${tags.map(tag => `<span class="pill"><i class="fa-solid fa-hashtag"></i> ${esc(tag)}</span>`).join("")}
        </div>

        <p class="overlay-desc">${esc(description)}</p>

        <div class="credit">By ${esc(creator)}</div>

        <div class="card-bottom">
          <div class="card-bottom-left">
            <div class="photo-stats">
              <span class="photo-stat"><i class="fa-solid fa-heart"></i> ${getLikes(photo)}</span>
              <span class="photo-stat"><i class="fa-solid fa-eye"></i> ${getViews(photo)}</span>
              <span class="photo-stat"><i class="fa-solid fa-star"></i> ${getFavourites(photo)}</span>
            </div>
          </div>

          <div class="card-bottom-right">
            <a class="action-icon" href="category.html?category=${encodeURIComponent(photo.category || "")}" aria-label="Open category">
              <i class="fa-solid fa-arrow-up-right-from-square"></i>
            </a>
          </div>
        </div>
      </div>
    </article>
  `;
}

function getFilteredRows() {
  const searchValue = normalizeText(exploreRefs.searchInput.value);
  const selectedCategory = exploreRefs.categoryFilter.value;
  const filterValue = exploreRefs.photoFilter.value;
  const trendingIds = getTrendingIds(exploreAllPhotos);
  const profile = buildPreferenceProfile(exploreAllPhotos);

  let rows = exploreAllPhotos.filter(photo => {
    const matchesText = !searchValue || buildPhotoSearchBlob(photo).includes(searchValue);
    const matchesCategory = selectedCategory === "all" || String(photo.category || "") === selectedCategory;

    let matchesFilter = true;
    if (filterValue === "featured") {
      matchesFilter = isFeaturedPhoto(photo);
    } else if (filterValue === "premium") {
      matchesFilter = isPremiumPhoto(photo);
    } else if (filterValue === "trending") {
      matchesFilter = trendingIds.has(getPhotoId(photo));
    } else if (filterValue === "recent") {
      matchesFilter = true;
    }

    return matchesText && matchesCategory && matchesFilter;
  });

  rows = [...rows].sort((a, b) => {
    if (filterValue === "recent") {
      const ad = new Date(getPostDateValue(a) || 0).getTime();
      const bd = new Date(getPostDateValue(b) || 0).getTime();
      if (bd !== ad) return bd - ad;
    }

    const prefDiff = getPreferenceScore(b, profile) - getPreferenceScore(a, profile);
    if (prefDiff !== 0) return prefDiff;

    const as = (getViews(a) * 2) + (getLikes(a) * 3) + (getFavourites(a) * 3) + (isFeaturedPhoto(a) ? 10 : 0);
    const bs = (getViews(b) * 2) + (getLikes(b) * 3) + (getFavourites(b) * 3) + (isFeaturedPhoto(b) ? 10 : 0);
    return bs - as;
  });

  return rows;
}

function renderExplorePhotos() {
  const rows = getFilteredRows();
  const trendingIds = getTrendingIds(exploreAllPhotos);

  buildHero(rows.length ? rows : exploreAllPhotos);

  const categoryLabel = exploreRefs.categoryFilter.value === "all"
    ? "all categories"
    : exploreRefs.categoryFilter.value;

  exploreRefs.exploreNote.textContent =
    `${rows.length} photo${rows.length === 1 ? "" : "s"} found in ${categoryLabel}. Search matches creators, categories, hashtags, help topics, and FAQs.`;

  if (!rows.length) {
    exploreRefs.photoGrid.innerHTML =
      `<div class="empty-box">No photos matched your search. Try another creator name, category, hashtag, help word, or FAQ keyword.</div>`;
    return;
  }

  exploreRefs.photoGrid.innerHTML = rows.map(photo => buildExploreCard(photo, trendingIds)).join("");

  if (typeof activatePhotoCards === "function") {
    activatePhotoCards(rows, exploreRefs.photoGrid);
  }
}

function initExplorePage() {
  exploreSiteData = loadExploreAdminData();
  exploreAllPhotos = flattenExplorePhotos();

  if (exploreRefs.footerText) {
    exploreRefs.footerText.textContent =
      exploreSiteData.footerText || "©️ 2026 PixNest. Discover and share powerful visual collections.";
  }

  fillExploreCategoryFilter();
  renderExplorePhotos();

  const requestedSearch = new URLSearchParams(window.location.search).get("search");
  if (requestedSearch) {
    exploreRefs.searchInput.value = decodeURIComponent(requestedSearch);
    renderExplorePhotos();
  }
}

exploreRefs.searchBtn?.addEventListener("click", renderExplorePhotos);
exploreRefs.searchInput?.addEventListener("input", renderExplorePhotos);
exploreRefs.searchInput?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    renderExplorePhotos();
  }
});
exploreRefs.categoryFilter?.addEventListener("change", renderExplorePhotos);
exploreRefs.photoFilter?.addEventListener("change", renderExplorePhotos);

initExplorePage();