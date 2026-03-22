function pixNestEscapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function pixNestNormalizeText(value = "") {
  return String(value || "").trim().toLowerCase();
}

function pixNestNormalizeHashToken(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^#+/, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_-]+/g, "")
    .trim();
}

function pixNestSafeText(value = "") {
  return pixNestEscapeHtml(value);
}

function pixNestGetPhotoTags(photo) {
  const explicitTags = String(photo && photo.tags ? photo.tags : "")
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

function pixNestFormatDate(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "Recently added";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}