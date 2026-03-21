(function(){
  if(window.__pixnestSiteAuthBooted) return;
  window.__pixnestSiteAuthBooted = true;
  const SUPABASE_URL = 'https://vigczssznfvujttdapbv.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_UmF-mmVS42XeF6PqsNnCSw_wpA35wg2';
  const IDLE_LIMIT_MS = 30 * 60 * 1000;
  const LAST_ACTIVE_KEY = 'pixnest_last_active_at';
  const LOGOUT_NOTICE_KEY = 'pixnest_idle_logout_notice';

  const NAV_ITEMS = [
    { href:'index.html', label:'Home', keys:['index.html',''] },
    { href:'explore.html', label:'Explore', keys:['explore.html'] },
    { href:'category.html', label:'Categories', keys:['category.html'] },
    { href:'featured.html', label:'Featured', keys:['featured.html','features.html'] },
    { href:'premium.html', label:'Premium', keys:['premium.html','checkout.html','payment.html'] },
    { href:'contact.html', label:'Contact', keys:['contact.html','help.html'] }
  ];

  const PREMIUM_FOOTER_ITEMS = [
    { href:'about.html', label:'About' },
    { href:'license.html', label:'License' },
    { href:'privacy.html', label:'Privacy' },
    { href:'terms.html', label:'Terms' },
    { href:'contact.html', label:'Contact' }
  ];

  const NON_PREMIUM_FOOTER_ITEMS = [
    { href:'premium.html', label:'Join Premium Membership' }
  ];

  function currentPage(){
    return (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  }

  function isCustomAccountPage(){
    const page = currentPage();
    return page === 'account.html' || page === 'profile.html' || page === 'creator-studio.html' || page === 'professional-dashboard.html' || page === 'boss-admin.html';
  }

  function isPublicAuthPage(){
    const page = currentPage();
    return page === 'login.html' || page === 'signup.html';
  }

  function isCustomMenuPage(){
    const page = currentPage();
    return page === 'premium.html';
  }

  function shouldSkipAuthInjection(){
    return isCustomAccountPage() || isPublicAuthPage() || isCustomMenuPage();
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
      #authNavLinks[data-auth-pending="true"]{ visibility:hidden; opacity:0; pointer-events:none; }
      #authNavLinks[data-auth-ready="true"]{ visibility:visible; opacity:1; pointer-events:auto; }
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
      .site-auth-modal-backdrop{ position:fixed; inset:0; background:rgba(2,6,23,.72); display:none; pointer-events:none; align-items:center; justify-content:center; padding:18px; z-index:2500; }
      .site-auth-modal-backdrop.show{ display:flex; pointer-events:auto; }
      .site-auth-modal{ width:min(460px,100%); background:linear-gradient(180deg, rgba(17,24,39,.98), rgba(15,23,42,.98)); border:1px solid rgba(250,204,21,.22); border-radius:22px; box-shadow:0 24px 60px rgba(0,0,0,.38); padding:22px; color:#e5e7eb; }
      .site-auth-modal h3{ margin:0 0 10px; font-size:24px; line-height:1.2; color:#facc15; }
      .site-auth-modal p{ margin:0; color:#cbd5e1; line-height:1.6; }
      .site-auth-modal-actions{ display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:10px; margin-top:18px; }
      .site-auth-modal-actions button,
      .site-auth-modal-actions a{ min-height:46px; border-radius:14px; font-size:14px; font-weight:700; border:1px solid rgba(255,255,255,.1); cursor:pointer; text-decoration:none; display:flex; align-items:center; justify-content:center; gap:8px; padding:0 14px; }
      .site-auth-modal-actions .site-auth-login{ background:#facc15; color:#111827; border:none; }
      .site-auth-modal-actions .site-auth-signup{ background:rgba(250,204,21,.12); color:#facc15; }
      .site-auth-modal-actions .site-auth-cancel{ background:transparent; color:#e5e7eb; }
      .site-auth-modal-actions .site-auth-login:hover,
      .site-auth-modal-actions .site-auth-signup:hover,
      .site-auth-modal-actions .site-auth-cancel:hover{ transform:translateY(-1px); }
      .site-header .container,
      header .container{
        max-width:1200px;
        margin:0 auto;
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:18px;
      }
      .nav-links{
        display:flex;
        align-items:center;
        gap:24px;
        flex-wrap:wrap;
      }
      .nav-links a{
        position:relative;
        display:inline-flex;
        align-items:center;
        min-height:42px;
        padding:8px 0;
        color:#e5e7eb;
        font-size:15px;
        font-weight:700;
        text-decoration:none;
        transition:color .2s ease;
      }
      .nav-links a::after{
        content:'';
        position:absolute;
        left:0;
        right:0;
        bottom:-4px;
        height:3px;
        border-radius:999px;
        background:#facc15;
        opacity:0;
        transform:scaleX(.55);
        transition:opacity .2s ease, transform .2s ease;
      }
      .nav-links a:hover,
      .nav-links a.active,
      .nav-links a[aria-current="page"]{
        color:#facc15;
      }
      .nav-links a:hover::after,
      .nav-links a.active::after,
      .nav-links a[aria-current="page"]::after{
        opacity:1;
        transform:scaleX(1);
      }
      .footer-links{
        display:flex;
        align-items:center;
        justify-content:center;
        gap:18px;
        flex-wrap:wrap;
      }
      .footer-links a{
        color:#cbd5e1;
        font-size:15px;
        font-weight:600;
        text-decoration:none;
      }
      .footer-links a:hover{ color:#facc15; }
      .photo-stats{ gap:6px !important; }
      .photo-stat{
        padding:5px 8px !important;
        font-size:10px !important;
        gap:5px !important;
      }
      .photo-stat i{ font-size:10px !important; }
      .action-icon,
      .lightbox-social{
        width:34px !important;
        height:34px !important;
        font-size:13px !important;
      }
      .lightbox:not(.show),
      .photo-lightbox:not(.show),
      .profile-overlay:not(.show),
      .site-auth-modal-backdrop:not(.show){
        pointer-events:none !important;
        visibility:hidden;
      }
      .lightbox.show,
      .photo-lightbox.show,
      .profile-overlay.show,
      .site-auth-modal-backdrop.show{
        pointer-events:auto !important;
        visibility:visible;
      }
      @media (max-width:860px){
        .site-auth-modal-actions{ grid-template-columns:1fr; }
        .site-auth-links{ width:100%; flex-direction:column; align-items:stretch; padding-top:10px; }
        .site-auth-links .nav-auth-btn,
        .site-auth-links a,
        .site-auth-links{ width:100%; flex-direction:column; align-items:stretch; padding-top:10px; }
        .site-auth-links .nav-auth-btn,
        .site-auth-links a,
        .site-account-menu-wrap,
        .site-account-menu-toggle{ width:100%; }
        .site-account-menu-toggle{ min-height:42px; border-radius:12px; }
        .nav-links{
          width:100%;
          gap:14px;
        }
        .nav-links a{
          min-height:36px;
          padding:6px 0;
        }
        .footer-links{
          gap:14px;
        }
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

  function ensureAuthPromptShell(){
    if(document.getElementById('siteAuthPromptBackdrop')) return;

    const backdrop = document.createElement('div');
    backdrop.className = 'site-auth-modal-backdrop';
    backdrop.id = 'siteAuthPromptBackdrop';
    backdrop.innerHTML = `
      <div class="site-auth-modal" role="dialog" aria-modal="true" aria-labelledby="siteAuthPromptTitle">
        <h3 id="siteAuthPromptTitle">Sign in required</h3>
        <p id="siteAuthPromptMessage">Please log in or sign up to continue.</p>
        <div class="site-auth-modal-actions">
          <button type="button" class="site-auth-login" id="siteAuthPromptLogin">Login</button>
          <button type="button" class="site-auth-signup" id="siteAuthPromptSignup">Sign Up</button>
          <button type="button" class="site-auth-cancel" id="siteAuthPromptCancel">Stay Here</button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    const closePrompt = () => backdrop.classList.remove('show');

    backdrop.addEventListener('click', (event) => {
      if(event.target === backdrop) closePrompt();
    });

    document.getElementById('siteAuthPromptCancel').addEventListener('click', closePrompt);

    document.getElementById('siteAuthPromptLogin').addEventListener('click', () => {
      const next = encodeURIComponent(window.location.href);
      closePrompt();
      window.location.href = `login.html?next=${next}`;
    });

    document.getElementById('siteAuthPromptSignup').addEventListener('click', () => {
      const next = encodeURIComponent(window.location.href);
      closePrompt();
      window.location.href = `signup.html?next=${next}`;
    });

    document.addEventListener('keydown', (event) => {
      if(event.key === 'Escape' && backdrop.classList.contains('show')){
        closePrompt();
      }
    });
  }

  function openAuthPrompt(actionText){
    ensureAuthPromptShell();
    markAuthNavPending();
    const backdrop = document.getElementById('siteAuthPromptBackdrop');
    const message = document.getElementById('siteAuthPromptMessage');
    const action = String(actionText || 'continue').trim();
    if(message){
      message.textContent = `Please log in or sign up to ${action}. Choose where to go, or stay on this page.`;
    }
    if(backdrop){
      backdrop.classList.add('show');
    }
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

  function standardizeNav(){
    const navLinks = document.getElementById('navLinks') || document.querySelector('.nav-links');
    if(!navLinks) return;

    const preserved = [];
    Array.from(navLinks.children).forEach(child => {
      if(
        child.classList?.contains('site-auth-links') ||
        child.classList?.contains('site-account-menu-wrap') ||
        child.classList?.contains('nav-auth') ||
        child.id === 'authNavLinks'
      ){
        preserved.push(child);
      }
    });

    navLinks.innerHTML = '';
    const page = currentPage();

    NAV_ITEMS.forEach(item => {
      const a = document.createElement('a');
      a.href = item.href;
      a.textContent = item.label;
      if(item.keys.includes(page)) a.classList.add('active');
      navLinks.appendChild(a);
    });

    preserved.forEach(node => navLinks.appendChild(node));
    document.dispatchEvent(new Event('pixnest:nav-updated'));
  }

  function standardizeFooter(isPremium){
    const footerLinks = document.querySelector('.footer-links');
    if(!footerLinks) return;
    const items = isPremium ? PREMIUM_FOOTER_ITEMS : NON_PREMIUM_FOOTER_ITEMS;
    footerLinks.innerHTML = items.map(item => `<a href="${item.href}">${item.label}</a>`).join('');
  }

  function markAuthNavPending(){
    const authNav = document.getElementById('authNavLinks');
    if(authNav){
      authNav.setAttribute('data-auth-pending','true');
      authNav.removeAttribute('data-auth-ready');
    }
  }

  function markAuthNavReady(){
    const authNav = document.getElementById('authNavLinks');
    if(authNav){
      authNav.removeAttribute('data-auth-pending');
      authNav.setAttribute('data-auth-ready','true');
    }
  }


  async function getPremiumState(user, client){
    if(!user) return false;

    const appPlan = String(user?.app_metadata?.membership_plan || '').toLowerCase();
    if(appPlan.includes('premium')) return true;

    try{
      const [profileRes, creatorRes] = await Promise.all([
        client.from('profiles').select('premium_member').eq('id', user.id).maybeSingle(),
        client.from('creator_profiles').select('premium_member').eq('user_id', user.id).maybeSingle()
      ]);
      return Boolean(profileRes.data?.premium_member || creatorRes.data?.premium_member);
    }catch(_error){
      return false;
    }
  }

  function setupIdleLogout(client){
    if(window.__pixnestIdleLogoutBound) return;
    window.__pixnestIdleLogoutBound = true;
    const markActive = () => localStorage.setItem(LAST_ACTIVE_KEY, String(Date.now()));
    ['mousemove','mousedown','keydown','scroll','touchstart','click'].forEach(eventName => {
      window.addEventListener(eventName, markActive, { passive:true });
    });
    markActive();

    setInterval(async () => {
      try{
        const { data } = await client.auth.getSession();
        const session = data?.session || null;
        if(!session) return;
        const last = Number(localStorage.getItem(LAST_ACTIVE_KEY) || 0);
        if(last && (Date.now() - last) > IDLE_LIMIT_MS){
          await client.auth.signOut();
          localStorage.removeItem(LAST_ACTIVE_KEY);
          sessionStorage.setItem(LOGOUT_NOTICE_KEY, 'true');
          window.location.href = 'login.html?reason=inactive';
        }
      }catch(_error){}
    }, 60000);
  }

  function buildAuthUI(user, client){
    ensureGlobalStyles();
    ensureFooterFlex();
    standardizeNav();

    if(shouldSkipAuthInjection()) return;

    removeExistingAuthBits();

    const navLinks = document.getElementById('navLinks') || document.querySelector('.nav-links');
    if(!navLinks) return;

    const authLinks = document.createElement('div');
    authLinks.className = 'site-auth-links';
    authLinks.id = 'siteAuthLinks';

    if(!user){
      authLinks.innerHTML = `
        <a href="login.html" class="nav-auth-btn secondary"><i class="fa-solid fa-right-to-bracket"></i>Login</a>
        <a href="signup.html" class="nav-auth-btn primary"><i class="fa-solid fa-user-plus"></i>Sign Up</a>
      `;
      navLinks.appendChild(authLinks);
      markAuthNavReady();
      window.__pixnestManagedAuthNav = true;
      document.dispatchEvent(new Event('pixnest:auth-ui-updated'));
      return;
    }

    authLinks.innerHTML = `
      <a href="account.html" class="nav-auth-btn secondary"><i class="fa-solid fa-user"></i>Account</a>
      <a href="upload.html" class="nav-auth-btn primary"><i class="fa-solid fa-upload"></i>Upload</a>
      <button type="button" class="nav-auth-btn secondary" id="siteLogoutBtn"><i class="fa-solid fa-right-from-bracket"></i>Logout</button>
    `;

    navLinks.appendChild(authLinks);
    markAuthNavReady();
    window.__pixnestManagedAuthNav = true;
    document.dispatchEvent(new Event('pixnest:auth-ui-updated'));

    const logoutBtn = document.getElementById('siteLogoutBtn');
    if(logoutBtn){
      logoutBtn.addEventListener('click', async () => {
        try{
          await client.auth.signOut();
          window.location.href = 'index.html';
        }catch(_err){
          alert('Could not log out.');
        }
      });
    }
  }

  function removeHelpTeamSection(){
    if(currentPage() !== 'help.html') return;
    const section = document.getElementById('teamSection');
    if(section) section.remove();
    const statusWrap = document.querySelector('.status-row');
    if(statusWrap){
      Array.from(statusWrap.querySelectorAll('.pill')).forEach(pill => {
        if(pill.textContent.toLowerCase().includes('team directory')) pill.remove();
      });
    }
  }

  function showIdleNoticeIfNeeded(){
    if(sessionStorage.getItem(LOGOUT_NOTICE_KEY) === 'true'){
      sessionStorage.removeItem(LOGOUT_NOTICE_KEY);
      setTimeout(() => {
        alert('You were logged out after 30 minutes of inactivity.');
      }, 100);
    }
  }

  function init(){
    ensureGlobalStyles();
    ensureFooterFlex();
    standardizeNav();
    removeHelpTeamSection();
    showIdleNoticeIfNeeded();
    ensureAuthPromptShell();
    markAuthNavPending();

    ensureSupabase(async function(){
      try{
        const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        setupIdleLogout(client);

        const updateUi = async (sessionUser) => {
          window.pixnestAuthUser = sessionUser || null;
          window.pixnestPromptAuthRequired = function(actionText){
            openAuthPrompt(actionText);
          };
          const isPremium = await getPremiumState(sessionUser, client);
          window.pixnestUserIsPremium = isPremium;
          standardizeFooter(isPremium);
          buildAuthUI(sessionUser, client);
        };

        const { data } = await client.auth.getSession();
        await updateUi(data?.session?.user || null);

        client.auth.onAuthStateChange(async (_event, session) => {
          await updateUi(session?.user || null);
        });
      }catch(err){
        console.error('site-auth init failed', err);
      }
    });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
