// ===== SUPABASE INIT (ONLY ONCE) =====
const supabase = window.supabase.createClient(
  "https://vigczssznfvujttdapbv.supabase.co",
  "YOUR_ANON_KEY"
);

// ===== AUTH STATE =====
let currentUser = null;

async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  currentUser = user;
  return user;
}

// ===== ONLINE TRACKING =====
async function updateOnlineStatus() {
  if (!currentUser) return;

  await supabase
    .from('profiles')
    .update({ last_seen: new Date().toISOString() })
    .eq('id', currentUser.id);
}

// ===== START APP =====
async function initApp() {
  await getUser();

  if (currentUser) {
    updateOnlineStatus();
    setInterval(updateOnlineStatus, 30000);
  }
}

initApp();