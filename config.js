const PIXNEST_STORAGE_KEY = "pixnest_admin_v2";
const PIXNEST_REACTION_KEY = "pixnest_photo_reactions_v1";
const PIXNEST_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80";
const SUPABASE_URL = "https://vigczssznfvujttdapbv.supabase.co";
const SUPABASE_KEY = "sb_publishable_UmF-mmVS42XeF6PqsNnCSw_wpA35wg2";
window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
