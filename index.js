function buildPhotoCard(photo, trendingSet = new Set()){
  const locked = isLockedPhoto(photo);
  const photoId = getPhotoId(photo);
  const creatorName = getCreatorName(photo) || "Unknown Creator";
  const description = locked ? "Premium members only." : getDescription(photo);
  const imageSrc = locked ? LOCKED_SVG : (photo._resolvedImageUrl || photo.image_url || FALLBACK_CATEGORY_IMAGE);
  const isTrending = trendingSet.has(photoId);

  return `
    <article class="visual-card ${locked ? "locked-card" : ""}" data-photo-id="${escapeHtml(photoId)}">
      <img src="${escapeHtml(imageSrc)}" alt="${escapeHtml(locked ? "Premium photo" : getPhotoAlt(photo))}">

      <div class="card-top-row">
        <div class="card-top-left">
          ${photo.featured ? `
            <span class="pill featured">
              <i class="fa-solid fa-bolt"></i>
              Featured
            </span>
          ` : ``}
        </div>

        <div class="card-top-right">
          ${isTrending ? `
            <span class="pill trending">
              <i class="fa-solid fa-fire"></i>
              Trending
            </span>
          ` : ``}

          ${isPremiumPhoto(photo) ? `
            <span class="pill premium">
              <i class="fa-solid fa-crown"></i>
              Premium
            </span>
          ` : ``}
        </div>
      </div>

      <div class="photo-overlay">
        <div class="overlay-category">
          <span class="pill category-tag">${escapeHtml(photo.category || "Photo")}</span>
        </div>

        ${description ? `<p class="overlay-desc">${escapeHtml(description)}</p>` : ""}

        <div class="credit">By ${buildInlineVerifiedName(creatorName, isCreatorVerified(photo))}</div>

        <div class="card-bottom">
          <div class="card-bottom-left">
            ${locked ? `
              <div class="lock-note">Join premium to enlarge, share, or download.</div>
            ` : buildPhotoStats(photo)}
          </div>

          <div class="card-bottom-right">
            ${locked ? `
              <a
                class="action-icon"
                href="premium.html"
                aria-label="Unlock premium"
                title="Unlock premium"
                data-stop-card
              >
                <i class="fa-solid fa-crown"></i>
              </a>
            ` : ``}
          </div>
        </div>
      </div>
    </article>
  `;
}