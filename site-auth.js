(function(){
  const SUPABASE_URL = 'https://vigczssznfvujttdapbv.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_UmF-mmVS42XeF6PqsNnCSw_wpA35wg2';

  function currentPage(){
    return (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  }

  function isAuthPage(){
    const page = currentPage();
    return page === 'login.html' || page === 'signup.html';
  }

  function isCustomAccountPage(){
    const page = currentPage();
    return page === 'account.html' || page === 'profile.html' || page === 'professional-dashboard.html' || page === 'boss-admin.html';
  }

  function pageHasOwnAuthUI(){
    return Boolean(
      document.getElementById('navAuth') ||
      document.getElementById('accountMenuWrap') ||
      document.getElementById('authNavLinks') ||
      document.getElementById('topMenuBtn') ||
      document.getElementById('authMenuBtn')
    );
  }

  function shouldSkipInjection(){
    return isAuthPage() || isCustomAccountPage() || pageHasOwnAuthUI();
  }

  function ensureGlobalStyles(){
    if(document.getElementById('site-auth-global-style')) return;
    const style = document.createElement('style');
    style.id = 'site-auth-global-style';
    style.textContent = `
      html, body { min-height:100%; }
      body.site-flex-page { min-height:100vh !important; display:flex !important; flex-direction:column !important; }
      body.site-flex-page > footer { margin-top:auto !important; }
      .site-auth-links{ display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
      .site-auth-links .nav-auth-btn,
      .site-auth-links a{ display:inline-flex; align-items:center; justify-content:center; gap:8px; min-height:42px; padding:10px 14px; border-radius:12px; font-size:14px; font-weight:700; text-decoration:none; }
      .site-auth-links .secondary{ background:transparent; color:#fff; border:1px solid rgba(255,255,255,.15); }
      .site-auth-links .secondary:hover{ background:rgba(255,255,255,.06); color:#facc15; border-color:rgba(250,204,21,.28); }
      .site-auth-links .primary{ background:#facc15; color:#111827; border:none; }
      .site-auth-links .primary:hover{ transform:translateY(-2px); box-shadow:0 10px 24px rgba(250,204,21,.18); }
      .site-account-menu-wrap{ position:relative; display:inline-flex; align-items:center; }
      .site-account-menu-toggle{ width:46px; height:46px; border-radius:12px; border:1px solid rgba(250,204,21,.35); background:#111827; color:#facc15; display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0; font-size:17px; }
      .site-account-menu-toggle:hover{ transform:translateY(-2px); border-color:rgba(250,204,21,.45); }
      .site-account-dropdown{ position:absolute; top:calc(100% + 10px); right:0; width:min(320px,90vw); background:#111827; border:1px solid rgba(255,255,255,.08); border-radius:18px; padding:10px; box-shadow:0 18px 36px rgba(0,0,0,.28); display:none; z-index:1500; }
      .site-account-dropdown.show{ display:block; }
      .site-account-dropdown a,
      .site-account-dropdown button{ width:100%; display:flex; align-items:center; gap:10px; padding:12px 12px; border:none; background:transparent; color:#e5e7eb; border-radius:12px; font-size:14px; cursor:pointer; text-align:left; text-decoration:none; }
      .site-account-dropdown a:hover,
      .site-account-dropdown button:hover{ background:rgba(250,204,21,.10); color:#facc15; }
      .site-account-dropdown button.site-danger{ color:#fecaca; }
      .site-account-dropdown button.site-danger:hover{ background:rgba(239,68,68,.10); color:#fecaca; }
      @media (max-width:860px){
        .site-auth-links{ width:100%; flex-direction:column; align-items:stretch; padding-top:10px; }
        .site-auth-links .nav-auth-btn,
        .site-auth-links a,
        .site-account-menu-wrap,
        .site-account-menu-toggle{ width:100%; }
        .site-account-menu-toggle{ min-height:42px; border-radius:12px; }
      }
    `;
    document.head.appendChild(style);
  }

  function ensureSupabase(callback){
    if(window.supabase && typeof window.supabase.createClient === 'function') return callback();
    const existing = document.getElementById('site-auth-supabase-loader');
    if(existing){
      existing.addEventListener('load', callback, { once:true });
      return;
    }
    const script = document.createElement('script');
    script.id = 'site-auth-supabase-loader';
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    script.onload = callback;
    document.head.appendChild(script);
  }

  function getDisplayName(user){
    return String(user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Account').trim();
  }

  const IDLE_LIMIT_MS = 30 * 60 * 1000;
  const ACTIVITY_KEY = 'pixnest_last_activity_v1';
  let inactivityInterval = null;
  let activityBound = false;
  let idleSigningOut = false;
  let lastActivityWrite = 0;

  function markActivity(){
    const now = Date.now();
    if(now - lastActivityWrite < 5000) return;
    lastActivityWrite = now;
    try{
      localStorage.setItem(ACTIVITY_KEY, String(now));
    }catch(err){}
  }

  function bindActivityListeners(){
    if(activityBound) return;
    activityBound = true;
    ['click','keydown','mousemove','scroll','touchstart'].forEach(eventName => {
      window.addEventListener(eventName, markActivity, { passive:true });
    });
  }

  function stopInactivityWatch(){
    if(inactivityInterval){
      clearInterval(inactivityInterval);
      inactivityInterval = null;
    }
  }

  function startInactivityWatch(user, client){
    stopInactivityWatch();
    if(!user) return;
    bindActivityListeners();
    markActivity();
    inactivityInterval = setInterval(async () => {
      if(idleSigningOut) return;
      let last = Date.now();
      try{
        const raw = localStorage.getItem(ACTIVITY_KEY);
        if(raw && !Number.isNaN(Number(raw))) last = Number(raw);
      }catch(err){}
      if(Date.now() - last < IDLE_LIMIT_MS) return;
      idleSigningOut = true;
      try{ await client.auth.signOut(); } catch(err){}
      if(!isAuthPage()) window.location.href = 'login.html?reason=inactive';
      idleSigningOut = false;
    }, 60000);
  }

  function findNavLinks(){
    return document.getElementById('navLinks') || document.querySelector('.nav-links');
  }

  function removeExistingAuthBits(){
    document.querySelectorAll('.site-auth-links,#siteAccountMenuWrap').forEach(el => el.remove());
    document.querySelectorAll('.auth-links,.nav-auth,#authNavLinks').forEach(el => {
      if(el.id === 'authNavLinks') el.innerHTML = '';
      else el.remove();
    });
  }

  function ensureFooterFlex(){
    document.body.classList.add('site-flex-page');
  }

  function buildAuthUI(user, client){
    ensureGlobalStyles();
    ensureFooterFlex();

    if(shouldSkipInjection()) return;

    removeExistingAuthBits();

    const nav = document.querySelector('.nav');
    const navLinks = findNavLinks();
    if(!nav || !navLinks) return;

    const authLinks = document.createElement('div');
    authLinks.className = 'site-auth-links';
    authLinks.id = 'siteAuthLinks';

    if(!user){
      authLinks.innerHTML = `
        <a href="login.html" class="nav-auth-btn secondary"><i class="fa-solid fa-right-to-bracket"></i>Login</a>
        <a href="signup.html" class="nav-auth-btn primary"><i class="fa-solid fa-user-plus"></i>Sign Up</a>
      `;
      navLinks.appendChild(authLinks);
      return;
    }

    const menuWrap = document.createElement('div');
    menuWrap.className = 'site-account-menu-wrap';
    menuWrap.id = 'siteAccountMenuWrap';
    menuWrap.innerHTML = `
      <button class="site-account-menu-toggle" id="siteAccountMenuToggle" aria-label="Open account menu"><i class="fa-solid fa-bars"></i></button>
      <div class="site-account-dropdown" id="siteAccountDropdown">
        <a href="account.html"><i class="fa-solid fa-user"></i>My Account</a>
        <a href="profile.html"><i class="fa-solid fa-address-card"></i>Profile</a>
        <a href="upload.html"><i class="fa-solid fa-upload"></i>Upload</a>
        <a href="premium.html"><i class="fa-solid fa-crown"></i>Premium</a>
        <a href="contact.html"><i class="fa-solid fa-envelope"></i>Contact</a>
        <button type="button" class="site-danger" id="siteLogoutBtn"><i class="fa-solid fa-right-from-bracket"></i>Logout</button>
      </div>
    `;
    navLinks.appendChild(menuWrap);

    const toggle = document.getElementById('siteAccountMenuToggle');
    const dropdown = document.getElementById('siteAccountDropdown');
    toggle.addEventListener('click', e => {
      e.stopPropagation();
      dropdown.classList.toggle('show');
    });
    document.addEventListener('click', e => {
      if(!dropdown.contains(e.target) && !toggle.contains(e.target)) dropdown.classList.remove('show');
    });
    document.getElementById('siteLogoutBtn').addEventListener('click', async () => {
      try{
        await client.auth.signOut();
        dropdown.classList.remove('show');
        window.location.href = 'index.html';
      }catch(err){
        alert('Could not log out.');
      }
    });
  }

  function init(){
    ensureGlobalStyles();
    ensureFooterFlex();

    ensureSupabase(async function(){
      try{
        const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        const { data } = await client.auth.getSession();
        if(!shouldSkipInjection()) buildAuthUI(data?.session?.user || null, client);
        startInactivityWatch(data?.session?.user || null, client);
        client.auth.onAuthStateChange((_event, session) => {
          if(!shouldSkipInjection()) buildAuthUI(session?.user || null, client);
          startInactivityWatch(session?.user || null, client);
        });
      }catch(err){
        console.error('site-auth init failed', err);
      }
    });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
