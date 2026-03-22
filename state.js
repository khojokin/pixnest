function pixNestLoadAdminData() {
  try {
    if (typeof pixNestLoadData === "function") {
      const loaded = pixNestLoadData() || {};
      return {
        categories: Array.isArray(loaded.categories) ? loaded.categories : [],
        homepage: loaded.homepage && typeof loaded.homepage === "object" ? loaded.homepage : {},
        footerText: loaded.footerText || ""
      };
    }

    const raw = localStorage.getItem(PIXNEST_STORAGE_KEY);
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
    console.error("Could not load PixNest data:", error);
    return {
      categories: [],
      homepage: {},
      footerText: ""
    };
  }
}

function pixNestLoadReactionState() {
  try {
    const saved = localStorage.getItem(PIXNEST_REACTION_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    return {};
  }
}