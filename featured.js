const STORAGE_KEY = "pixnest_admin_data";

const heroSection = document.getElementById("heroSection");
const heroMeta = document.getElementById("heroMeta");
const featuredSearchInput = document.getElementById("featuredSearchInput");
const featuredFilter = document.getElementById("featuredFilter");
const featuredSearchBtn = document.getElementById("featuredSearchBtn");
const featuredSections = document.getElementById("featuredSections");
const featuredNote = document.getElementById("featuredNote");
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxClose = document.getElementById("lightboxClose");

const lightboxTitle = document.getElementById("lightboxTitle");
const lightboxCategory = document.getElementById("lightboxCategory");
const lightboxCredit = document.getElementById("lightboxCredit");
const lightboxTags = document.getElementById("lightboxTags");
const lightboxDescription = document.getElementById("lightboxDescription");
const lightboxPosted = document.getElementById("lightboxPosted");
const lightboxCreatorTop = document.getElementById("lightboxCreatorTop");
const lightboxCreatorBadges = document.getElementById("lightboxCreatorBadges");
const lightboxPostedMeta = document.getElementById("lightboxPostedMeta");
const lightboxStatsWrap = document.getElementById("lightboxStatsWrap");
const lightboxActions = document.getElementById("lightboxActions");
const creatorCover = document.getElementById("creatorCover");
const creatorAvatar = document.getElementById("creatorAvatar");
const creatorSocialProof = document.getElementById("creatorSocialProof");
const creatorMenuActions = document.getElementById("creatorMenuActions");
const creatorPostsGrid = document.getElementById("creatorPostsGrid");
const footerText = document.getElementById("footerText");

let siteData = {
  categories: [],
  homepage: {},
  footerText: ""
};

let allPhotos = [];
let filteredPhotos = [];

function loadAdminData(){
  try{
    const saved = localStorage.getItem(STORAGE_KEY);
    if(!saved){
      return {
        categories: [],
        homepage: {},
        footerText: ""
      };
    }

    const parsed = JSON.parse(saved);

    return {
      categories: Array.isArray(parsed.categories) ? parsed.categories : [],
      homepage: parsed.homepage && typeof parsed.homepage === "object" ? parsed.homepage : {},
      footerText: parsed.footerText || ""
    };
  }catch(error){
    console.error("Failed to load admin data:", error);
    return {
      categories: [],
      homepage: {},
      footerText: ""
    };
  }
}

function normalize(value){
  return String(value || "").trim().toLowerCase();
}

function isFeaturedPhoto(photo){
  return Boolean(
    photo?.featured === true ||
    photo?.is_featured === true ||
    normalize(photo?.status) === "featured" ||
    normalize(photo?.badge) === "featured"
  );
}

function isPremiumPhoto(photo){
  return Boolean(photo?.is_premium || photo?.premium_only);
}

function getDescription(photo){
  return String(
    photo?.description ||
    photo?.caption ||
    photo?.public_title ||
    photo?.title ||
    ""
  ).trim();
}

function getCreatorName(photo){
  return String(
    photo?.credit ||
    photo?.creator ||
    photo?.author ||
    photo?.user_name ||
    "Unknown creator"
  ).trim();
}

function getTags(photo){
  return String(photo?.tags || "")
    .split(/[,|]/)
    .map(tag => tag.trim())
    .filter(Boolean);
}

function getNumberValue(photo, keys = []){
  for(const key of keys){
    const value = photo?.[key];

    if(typeof value === "number" && Number.isFinite(value)){
      return value;
    }

    if(typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))){
      return Number(value);
    }
  }

  return 0;
}

function getViews(photo){
  return getNumberValue(photo, ["views", "view_count", "viewCount"]);
}

function getLikes(photo){
  return getNumberValue(photo, ["likes", "like_count", "likeCount"]);
}

function getFavourites(photo){
  return getNumberValue(photo, ["favourites", "favorites", "favourite_count", "favorite_count"]);
}

function getPostedDate(photo){
  return String(photo?.posted || photo?.created_at || photo?.date || "").trim();
}

function getPhotoId(photo){
  return String(
    photo?.id ||
    photo?.photo_id ||
    photo?.image_url ||
    photo?.created_at ||
    `${photo?.category || ""}-${photo?.credit || ""}-${getDescription(photo)}`
  );
}

function collectAllPhotos(){
  const items = [];

  (siteData.categories || []).forEach(category => {
    const categoryName = String(category?.name || category?.title || category?.category || "Uncategorized").trim();
    const categoryDescription = String(category?.description || "").trim();
    const photos = Array.isArray(category?.photos) ? category.photos : [];

    photos.forEach(photo => {
      items.push({
        ...photo,
        category: String(photo?.category || categoryName).trim(),
        category_description: categoryDescription
      });
    });
  });

  return items;
}

function groupByCategory(photos){
  const grouped = new Map();

  photos.forEach(photo => {
    const name = String(photo?.category || "Uncategorized").trim() || "Uncategorized";
    if(!grouped.has(name)){
      grouped.set(name, []);
    }
    grouped.get(name).push(photo);
  });

  return [...grouped.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

function updateHeroImage(imageUrl){
  const safe = imageUrl || "naturecatimg.avif";
  heroSection.style.background =
    `linear-gradient(rgba(17,24,39,.62), rgba(17,24,39,.82)), url('${safe}') center/cover no-repeat`;
}

function renderHeroMeta(photos){
  const categoriesCount = new Set(photos.map(photo => normalize(photo.category)).filter(Boolean)).size;
  const premiumCount = photos.filter(isPremiumPhoto).length;

  heroMeta.innerHTML = `
    <span class="pill featured"><i class="fa-solid fa-bolt"></i> ${photos.length} Featured</span>
    <span class="pill category-tag"><i class="fa-solid fa-layer-group"></i> ${categoriesCount} Sections</span>
    ${premiumCount ? `<span class="pill premium"><i class="fa-solid fa-star"></i> ${premiumCount} Premium</span>` : ``}
  `;

  const cover = photos.find(photo => photo?.image_url)?.image_url || "naturecatimg.avif";
  updateHeroImage(cover);
}

function createPhotoCard(photo){
  const premiumBadge = isPremiumPhoto(photo)
    ? `<span class="pill premium"><i class="fa-solid fa-star"></i> Premium</span>`
    : ``;

  return `
    <article class="visual-card" data-photo-id="${getPhotoId(photo)}">
      <img src="${photo.image_url || ""}" alt="${getDescription(photo) || photo.category || "PixNest photo"}">

      <div class="card-top-row">
        <div class="card-top-left">
          <span class="pill featured"><i class="fa-solid fa-bolt"></i> Featured</span>
          <span class="pill category-tag">${photo.category || "Uncategorized"}</span>
        </div>
        <div class="card-top-right">
          ${premiumBadge}
        </div>
      </div>

      <div class="photo-overlay">
        <p class="overlay-desc">${getDescription(photo) || "Featured photo from PixNest."}</p>

        <div class="credit">
          <span>By ${getCreatorName(photo)}</span>
        </div>

        <div class="card-bottom">
          <div class="card-bottom-left">
            <div class="photo-stats">
              <span class="photo-stat"><i class="fa-solid fa-heart"></i> ${getLikes(photo)}</span>
              <span class="photo-stat"><i class="fa-solid fa-eye"></i> ${getViews(photo)}</span>
              <span class="photo-stat"><i class="fa-solid fa-star"></i> ${getFavourites(photo)}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  `;
}

function renderFeaturedSections(photos){
  if(!photos.length){
    featuredSections.innerHTML = `<div class="empty-box">No featured photos found for this search.</div>`;
    return;
  }

  const grouped = groupByCategory(photos);

  featuredSections.innerHTML = grouped.map(([categoryName, categoryPhotos]) => {
    return `
      <section style="padding:0 0 34px;">
        <div class="section-head" style="margin-bottom:16px;">
          <div>
            <h2>${categoryName}</h2>
            <p>${categoryPhotos.length} featured photo${categoryPhotos.length === 1 ? "" : "s"} in this section.</p>
          </div>
        </div>

        <div class="photo-grid">
          ${categoryPhotos.map(createPhotoCard).join("")}
        </div>
      </section>
    `;
  }).join("");

  featuredSections.querySelectorAll(".visual-card").forEach(card => {
    card.addEventListener("click", () => {
      const photoId = card.getAttribute("data-photo-id");
      const photo = allPhotos.find(item => getPhotoId(item) === photoId);
      if(photo){
        openLightbox(photo);
      }
    });
  });
}

function applyFilters(){
  const search = normalize(featuredSearchInput.value);
  const filter = featuredFilter.value;

  filteredPhotos = allPhotos.filter(photo => {
    if(!isFeaturedPhoto(photo)) return false;

    if(filter === "premium" && !isPremiumPhoto(photo)) return false;
    if(filter === "free" && isPremiumPhoto(photo)) return false;

    if(!search) return true;

    const haystack = [
      photo.category,
      getDescription(photo),
      getCreatorName(photo),
      ...getTags(photo)
    ].join(" ").toLowerCase();

    return haystack.includes(search);
  });

  featuredNote.textContent = `${filteredPhotos.length} featured photo${filteredPhotos.length === 1 ? "" : "s"} found.`;
  renderFeaturedSections(filteredPhotos);
}

function openLightbox(photo){
  lightboxImage.src = photo.image_url || "";
  lightboxImage.alt = getDescription(photo) || photo.category || "PixNest photo";

  lightboxTitle.textContent = getDescription(photo) || "Featured photo";
  lightboxCategory.textContent = photo.category || "Uncategorized";
  lightboxCredit.textContent = getCreatorName(photo);
  lightboxTags.textContent = getTags(photo).join(", ") || "—";
  lightboxDescription.textContent = getDescription(photo) || "—";
  lightboxPosted.textContent = getPostedDate(photo) || "—";
  lightboxCreatorTop.textContent = getCreatorName(photo);
  lightboxPostedMeta.textContent = getPostedDate(photo) ? `Posted ${getPostedDate(photo)}` : "";

  lightboxCreatorBadges.innerHTML = `
    ${photo?.verified ? `<span class="creator-badge verified"><i class="fa-solid fa-check"></i></span>` : ``}
    ${isPremiumPhoto(photo) ? `<span class="creator-badge premium"><i class="fa-solid fa-star"></i></span>` : ``}
  `;

  creatorCover.style.backgroundImage = `url('${photo.image_url || "naturecatimg.avif"}')`;
  creatorAvatar.innerHTML = photo?.avatar
    ? `<img src="${photo.avatar}" alt="${getCreatorName(photo)}">`
    : getCreatorName(photo).charAt(0).toUpperCase();

  creatorSocialProof.innerHTML = `
    <div class="creator-count"><strong>0</strong><span>Following</span></div>
    <div class="creator-count"><strong>0</strong><span>Followers</span></div>
    <div class="creator-count"><strong>${allPhotos.filter(item => getCreatorName(item) === getCreatorName(photo)).length}</strong><span>Posts</span></div>
  `;

  creatorMenuActions.innerHTML = `
    <button class="creator-action-btn" type="button"><i class="fa-solid fa-star"></i> Add Creator to Favourites</button>
    <button class="creator-action-btn" type="button"><i class="fa-solid fa-share-nodes"></i> Share Profile</button>
  `;

  lightboxStatsWrap.innerHTML = `
    <div class="lightbox-stats photo-stats">
      <span class="photo-stat"><i class="fa-solid fa-heart"></i> ${getLikes(photo)} Likes</span>
      <span class="photo-stat"><i class="fa-solid fa-eye"></i> ${getViews(photo)} Views</span>
      <span class="photo-stat"><i class="fa-solid fa-star"></i> ${getFavourites(photo)} Favourites</span>
    </div>
  `;

  lightboxActions.innerHTML = `
    <button class="lightbox-social" type="button"><i class="fa-brands fa-instagram"></i></button>
    <button class="lightbox-social" type="button"><i class="fa-brands fa-x-twitter"></i></button>
    <button class="lightbox-social" type="button"><i class="fa-brands fa-facebook-f"></i></button>
    <button class="lightbox-social" type="button"><i class="fa-solid fa-share-nodes"></i></button>
  `;

  const creatorName = getCreatorName(photo);
  const creatorPosts = allPhotos.filter(item => getCreatorName(item) === creatorName && getPhotoId(item) !== getPhotoId(photo));

  creatorPostsGrid.innerHTML = creatorPosts.length
    ? creatorPosts.slice(0, 6).map(item => `
        <button class="creator-post-card" type="button" data-photo-id="${getPhotoId(item)}">
          <img src="${item.image_url || ""}" alt="${getDescription(item) || item.category || "PixNest photo"}">
          <div class="creator-post-info">
            <small>${getDescription(item) || item.category || "Photo"}</small>
          </div>
        </button>
      `).join("")
    : `<div class="creator-post-empty">No more posts from this creator yet.</div>`;

  creatorPostsGrid.querySelectorAll(".creator-post-card").forEach(button => {
    button.addEventListener("click", () => {
      const photoId = button.getAttribute("data-photo-id");
      const nextPhoto = allPhotos.find(item => getPhotoId(item) === photoId);
      if(nextPhoto){
        openLightbox(nextPhoto);
      }
    });
  });

  lightbox.classList.add("show");
}

function closeLightbox(){
  lightbox.classList.remove("show");
}

function initMenu(){
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");

  if(menuToggle && navLinks){
    menuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("show");
      menuToggle.setAttribute("aria-expanded", navLinks.classList.contains("show") ? "true" : "false");
    });
  }
}

function initPage(){
  siteData = loadAdminData();
  allPhotos = collectAllPhotos().filter(isFeaturedPhoto);

  footerText.textContent = siteData.footerText || "©️ 2026 PixNest. Discover and share powerful visual collections.";

  renderHeroMeta(allPhotos);
  applyFilters();
  initMenu();
}

featuredSearchBtn.addEventListener("click", applyFilters);
featuredFilter.addEventListener("change", applyFilters);
featuredSearchInput.addEventListener("input", applyFilters);

lightboxClose.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", event => {
  if(event.target === lightbox){
    closeLightbox();
  }
});

document.addEventListener("keydown", event => {
  if(event.key === "Escape"){
    closeLightbox();
  }
});

initPage();

const featuredRefs = {
  searchInput: document.getElementById("searchInput"),
  categoryFilter: document.getElementById("categoryFilter"),
  clearFiltersBtn: document.getElementById("clearFiltersBtn"),
  featuredSections: document.getElementById("featuredSections"),
  heroText: document.querySelector(".hero-content p"),
  footerText: document.querySelector(".footer-inner p")
};

let featuredCategories = [];
let featuredPreferenceProfile = {
  tagWeights: {},
  categoryWeights: {},
  creatorWeights: {},
  hasSignals: false
};

function pixNestAddWeight(bucket, key, amount) {
  const safeKey = pixNestNormalizeHashToken(key);
  if (!safeKey || !amount) return;
  bucket[safeKey] = (bucket[safeKey] || 0) + amount;
}

function pixNestLoadFeaturedCategories() {
  const data = pixNestLoadAdminData();
  const categories = Array.isArray(data.categories) ? data.categories : [];

  if (featuredRefs.footerText) {
    featuredRefs.footerText.textContent =
      data.footerText || "©️ 2026 PixNest. Discover and share powerful visual collections.";
  }

  return categories
    .map(category => {
      const featuredPhotos = (Array.isArray(category.photos) ? category.photos : [])
        .filter(photo => photo && photo.featured)
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

      return {
        id: category.id || "",
        name: category.name || "Untitled Category",
        description: category.description || "Featured photos curated in this category.",
        photos: featuredPhotos
      };
    })
    .filter(category => category.photos.length > 0);
}

function pixNestBuildPreferenceProfile(categories = []) {
  const reactionState = pixNestLoadReactionState();

  const profile = {
    tagWeights: {},
    categoryWeights: {},
    creatorWeights: {},
    hasSignals: false
  };

  const photoMap = new Map();

  categories.forEach(category => {
    (category.photos || []).forEach(photo => {
      photoMap.set(String(photo.id || ""), {
        ...photo,
        categoryName: category.name || ""
      });
    });
  });

  Object.entries(reactionState || {}).forEach(([photoId, state]) => {
    const photo = photoMap.get(String(photoId));
    if (!photo) return;

    let weight = 0;
    if (state && state.liked) weight += 2;
    if (state && state.favourited) weight += 4;
    if (!weight) return;

    profile.hasSignals = true;

    pixNestGetPhotoTags(photo).forEach(tag => {
      pixNestAddWeight(profile.tagWeights, tag, weight);
    });

    pixNestAddWeight(profile.categoryWeights, photo.categoryName || "", weight + 1);
    pixNestAddWeight(profile.creatorWeights, photo.credit || "", Math.max(1, weight - 1));
  });

  return profile;
}

function pixNestGetPreferenceScore(photo, categoryName, profile) {
  if (!profile || !profile.hasSignals || !photo) return 0;

  let score = 0;

  pixNestGetPhotoTags(photo).forEach(tag => {
    score += profile.tagWeights[pixNestNormalizeHashToken(tag)] || 0;
  });

  score += (profile.categoryWeights[pixNestNormalizeHashToken(categoryName)] || 0) * 2;
  score += profile.creatorWeights[pixNestNormalizeHashToken(photo.credit || "")] || 0;

  return score;
}

function pixNestBuildSearchBlob(photo, categoryName) {
  const tags = pixNestGetPhotoTags(photo);
  const hashtags = tags.map(tag => `#${pixNestNormalizeHashToken(tag)}`).filter(Boolean);

  return [
    photo.title,
    photo.description,
    photo.credit,
    photo.tags,
    categoryName,
    ...tags,
    ...hashtags
  ].filter(Boolean).join(" ").toLowerCase();
}

function pixNestFillFeaturedCategoryFilter() {
  featuredRefs.categoryFilter.innerHTML = '<option value="all">All Featured Categories</option>';

  featuredCategories.forEach(category => {
    const option = document.createElement("option");
    option.value = category.name;
    option.textContent = `${category.name} (${category.photos.length})`;
    featuredRefs.categoryFilter.appendChild(option);
  });
}

function pixNestRenderFeatured() {
  const searchTerm = featuredRefs.searchInput.value.trim().toLowerCase();
  const selectedCategory = featuredRefs.categoryFilter.value;

  const filteredCategories = featuredCategories
    .map(category => ({
      ...category,
      photos: category.photos
        .filter(photo => {
          const categoryMatch = selectedCategory === "all" || category.name === selectedCategory;
          const searchMatch = !searchTerm || pixNestBuildSearchBlob(photo, category.name).includes(searchTerm);
          return categoryMatch && searchMatch;
        })
        .sort((a, b) => {
          const preferenceDiff =
            pixNestGetPreferenceScore(b, category.name, featuredPreferenceProfile) -
            pixNestGetPreferenceScore(a, category.name, featuredPreferenceProfile);

          if (preferenceDiff !== 0) return preferenceDiff;
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        })
    }))
    .filter(category => category.photos.length > 0)
    .sort((a, b) => {
      const aScore = Math.max(...a.photos.map(photo => pixNestGetPreferenceScore(photo, a.name, featuredPreferenceProfile)), 0);
      const bScore = Math.max(...b.photos.map(photo => pixNestGetPreferenceScore(photo, b.name, featuredPreferenceProfile)), 0);

      if (bScore !== aScore) return bScore - aScore;
      return b.photos.length - a.photos.length;
    });

  if (!filteredCategories.length) {
    featuredRefs.featuredSections.innerHTML =
      '<div class="empty-box">No featured photos matched your search yet. Try another category or clear the filters.</div>';
    return;
  }

  featuredRefs.featuredSections.innerHTML = filteredCategories.map(category => {
    const cards = category.photos.map(photo => {
      const formattedDate = pixNestFormatDate(photo.createdAt);
      const tags = pixNestGetPhotoTags(photo).slice(0, 3);
      const image = photo.image || PIXNEST_FALLBACK_IMAGE;
      const categoryLink = `category.html?category=${encodeURIComponent(category.name)}`;

      return `
        <article class="photo-card">
          <div class="photo-card-image">
            <img src="${pixNestSafeText(image)}" alt="${pixNestSafeText(photo.title || category.name)}" loading="lazy">
          </div>

          <div class="photo-card-body">
            <div class="photo-card-top">
              <div>
                <h4>${pixNestSafeText(photo.title || "Featured photo")}</h4>
                <p>${pixNestSafeText(photo.description || "A highlighted visual from the PixNest collection.")}</p>
              </div>
            </div>

            <div class="photo-meta">
              <span class="tag"><i class="fa-solid fa-bolt"></i> Featured</span>
              <span class="tag"><i class="fa-regular fa-calendar"></i> ${pixNestSafeText(formattedDate)}</span>
              ${photo.credit ? `<span class="tag"><i class="fa-solid fa-user"></i> ${pixNestSafeText(photo.credit)}</span>` : ""}
              ${tags.map(tag => `<span class="tag"><i class="fa-solid fa-hashtag"></i> ${pixNestSafeText(tag)}</span>`).join("")}
            </div>

            <div class="photo-card-footer">
              <span class="tag"><i class="fa-solid fa-folder"></i> ${pixNestSafeText(category.name)}</span>
              <a class="view-link" href="${categoryLink}">View category <i class="fa-solid fa-arrow-right"></i></a>
            </div>
          </div>
        </article>
      `;
    }).join("");

    return `
      <section class="category-block">
        <div class="category-top">
          <div>
            <h3>${pixNestSafeText(category.name)}</h3>
            <p>${pixNestSafeText(category.description)}</p>
          </div>

          <div class="category-badges">
            <span class="mini-pill"><i class="fa-solid fa-images"></i> ${category.photos.length} featured</span>
            <a class="mini-pill" href="category.html?category=${encodeURIComponent(category.name)}"><i class="fa-solid fa-arrow-up-right-from-square"></i> Open category</a>
          </div>
        </div>

        <div class="photo-grid">${cards}</div>
      </section>
    `;
  }).join("");
}

function pixNestInitFeaturedPage() {
  pixNestInitMenu();
  featuredCategories = pixNestLoadFeaturedCategories();
  featuredPreferenceProfile = pixNestBuildPreferenceProfile(featuredCategories);
  pixNestFillFeaturedCategoryFilter();

  if (featuredPreferenceProfile.hasSignals && featuredRefs.heroText) {
    featuredRefs.heroText.textContent =
      "Discover standout photos selected across the PixNest collection, with featured results weighted toward the hashtags, creators, and categories you like most.";
  }

  pixNestRenderFeatured();

  featuredRefs.searchInput.addEventListener("input", pixNestRenderFeatured);
  featuredRefs.categoryFilter.addEventListener("change", pixNestRenderFeatured);
  featuredRefs.clearFiltersBtn.addEventListener("click", () => {
    featuredRefs.searchInput.value = "";
    featuredRefs.categoryFilter.value = "all";
    pixNestRenderFeatured();
  });
}

pixNestInitFeaturedPage();