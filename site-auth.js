(function(){
  const SUPABASE_URL = 'https://vigczssznfvujttdapbv.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_UmF-mmVS42XeF6PqsNnCSw_wpA35wg2';
  const IDLE_LIMIT_MS = 30 * 60 * 1000;
  const LAST_ACTIVE_KEY = 'pixnest_last_active_at';
  const LOGOUT_NOTICE_KEY = 'pixnest_idle_logout_notice';

  const NAV_ITEMS = [
    { href:'index.html', label:'Home', keys:['index.html',''] },
    { href:'explore.html', label:'Explore', keys:['explore.html'] },
    { href:'category.html', label:'Categories', keys:['category.html'] },
    { href:'featured.html', label:'Featured', keys:['featured.html','features.html','premiumplans.html'] },
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
    return page === 'account.html' || page === 'profile.html' || page === 'professional-dashboard.html' || page === 'boss-admin.html';
  }

  function isPublicAuthPage(){
    const page = currentPage();
    return page === 'login.html' || page === 'signup.html' || page === 'reset-password.html';
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
      .site-auth-modal-backdrop{ position:fixed; inset:0; background:rgba(2,6,23,.72); display:none; align-items:center; justify-content:center; padding:18px; z-index:2500; }
      .site-auth-modal-backdrop.show{ display:flex; }
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

      .nav-links a{ position:relative; }
      .nav-links a.active{ color:#facc15 !important; font-weight:700 !important; }
      .nav-links a.active::after{ content:''; position:absolute; left:0; right:0; bottom:-8px; height:2px; border-radius:999px; background:#facc15; box-shadow:0 0 12px rgba(250,204,21,.35); }
      .creator-badge.premium,
      .member-badge.premium,
      .status-badge.premium,
      .pill.premium,
      .auth-pill.premium,
      .nav-chip.premium{ background:rgba(250,204,21,.12) !important; color:#facc15 !important; border-color:rgba(250,204,21,.28) !important; }
      .pixnest-site-toast{ position:fixed; left:50%; bottom:22px; transform:translateX(-50%) translateY(20px); min-width:min(92vw,420px); background:rgba(15,23,42,.96); color:#e5e7eb; border:1px solid rgba(250,204,21,.22); border-radius:14px; box-shadow:0 18px 40px rgba(0,0,0,.3); padding:12px 16px; font-size:14px; line-height:1.45; z-index:2800; opacity:0; pointer-events:none; transition:.25s; }
      .pixnest-site-toast.show{ opacity:1; transform:translateX(-50%) translateY(0); }
      .pixnest-extra-actions{ display:flex; gap:8px; flex-wrap:wrap; margin-left:6px; }
      .pixnest-extra-actions .photo-stat{ border:1px solid rgba(255,255,255,.08); background:rgba(15,23,42,.82); color:#e5e7eb; }
      .pixnest-extra-actions .photo-stat.active{ color:#facc15; border-color:rgba(250,204,21,.28); }
      #viewCreatorProfileBtn{ display:none !important; }
      .photo-stats{ gap:10px !important; align-items:stretch !important; flex-wrap:wrap !important; }
      .photo-stat[data-label]{ display:flex !important; flex-direction:column !important; align-items:center !important; justify-content:center !important; gap:6px !important; min-width:82px !important; min-height:76px !important; padding:10px 12px !important; border-radius:18px !important; background:rgba(255,255,255,.08) !important; border:1px solid rgba(255,255,255,.12) !important; line-height:1.1 !important; }
      .photo-stat[data-label] > span{ font-size:14px !important; font-weight:800 !important; color:#f8fafc !important; }
      .photo-stat[data-label] i{ font-size:15px !important; color:#facc15 !important; }
      .photo-stat[data-label]::after{ content:attr(data-label); font-size:11px; font-weight:600; color:#cbd5e1; }
      .pixnest-extra-actions{ margin-left:0 !important; }
      @media (max-width:860px){
        .nav-links a.active::after{ display:block !important; bottom:-4px !important; }
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
  }

  function standardizeFooter(isPremium, hasAccount){
    const footerLinks = document.querySelector('.footer-links');
    if(!footerLinks) return;
    const items = (isPremium || hasAccount) ? PREMIUM_FOOTER_ITEMS : NON_PREMIUM_FOOTER_ITEMS;
    footerLinks.innerHTML = items.map(item => `<a href="${item.href}">${item.label}</a>`).join('');
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
      return;
    }

    const menuWrap = document.createElement('div');
    menuWrap.className = 'site-account-menu-wrap';
    menuWrap.id = 'siteAccountMenuWrap';
    menuWrap.innerHTML = `
      <button class="site-account-menu-toggle" id="siteAccountMenuToggle" aria-label="Open account menu"><i class="fa-solid fa-bars"></i></button>
      <div class="site-account-dropdown" id="siteAccountDropdown">
        <a href="account.html"><i class="fa-solid fa-user"></i>My Account</a>
        <a href="account.html"><i class="fa-solid fa-sliders"></i>Profile Settings</a>
        <a href="upload.html"><i class="fa-solid fa-upload"></i>Upload</a>
        <a href="professional-dashboard.html"><i class="fa-solid fa-chart-line"></i>Creator Dashboard</a>
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
      }catch(_err){
        alert('Could not log out.');
      }
    });
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



  const REPOST_KEY = 'pixnest_photo_reposts_v1';
  const REPORT_KEY = 'pixnest_post_reports_v1';

  function showSiteToast(message){
    let toast = document.getElementById('pixnestSiteToast');
    if(!toast){
      toast = document.createElement('div');
      toast.id = 'pixnestSiteToast';
      toast.className = 'pixnest-site-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showSiteToast._timer);
    showSiteToast._timer = setTimeout(() => toast.classList.remove('show'), 2400);
  }

  function loadJsonStorage(key){
    try{
      const parsed = JSON.parse(localStorage.getItem(key) || '{}');
      return parsed && typeof parsed === 'object' ? parsed : {};
    }catch(_error){
      return {};
    }
  }

  function saveJsonStorage(key, value){
    localStorage.setItem(key, JSON.stringify(value));
  }

  function getRepostState(){
    return loadJsonStorage(REPOST_KEY);
  }

  function setRepostState(next){
    saveJsonStorage(REPOST_KEY, next);
  }

  function getReportState(){
    return loadJsonStorage(REPORT_KEY);
  }

  function currentSignedUser(){
    return window.pixnestAuthUser || null;
  }

  function getCurrentUserIdentity(){
    const user = currentSignedUser();
    if(!user) return null;
    return {
      id: String(user.id || '').trim(),
      email: String(user.email || '').trim().toLowerCase()
    };
  }

  function getPhotoIdFromCard(card){
    return String(card?.getAttribute('data-photo-id') || '').trim();
  }

  function getRepostInfo(photoId){
    const state = getRepostState();
    const entry = state[String(photoId)] || { count:0, by:{} };
    const identity = getCurrentUserIdentity();
    const key = identity?.id || identity?.email || '';
    const active = Boolean(key && entry.by && entry.by[key]);
    return {
      count: Number(entry.count || 0),
      active
    };
  }

  function toggleRepost(photoId){
    const identity = getCurrentUserIdentity();
    if(!identity){
      if(typeof window.pixnestPromptAuthRequired === 'function') window.pixnestPromptAuthRequired('repost photos');
      return;
    }

    const state = getRepostState();
    const key = identity.id || identity.email;
    const entry = state[String(photoId)] || { count:0, by:{} };
    entry.by = entry.by || {};

    if(entry.by[key]){
      delete entry.by[key];
      entry.count = Math.max(0, Number(entry.count || 0) - 1);
      showSiteToast('Repost removed.');
    }else{
      entry.by[key] = {
        user_id: identity.id,
        email: identity.email,
        created_at: new Date().toISOString()
      };
      entry.count = Number(entry.count || 0) + 1;
      showSiteToast('Photo reposted to your profile.');
    }

    state[String(photoId)] = entry;
    setRepostState(state);
    refreshExtraPhotoActions();
    window.dispatchEvent(new CustomEvent('pixnest-repost-change', { detail:{ photoId } }));
  }

  async function submitPostReport(client, photoId, reason){
    const identity = getCurrentUserIdentity();
    if(!identity){
      if(typeof window.pixnestPromptAuthRequired === 'function') window.pixnestPromptAuthRequired('report posts');
      return;
    }

    const trimmed = String(reason || '').trim();
    if(!trimmed) return;

    let savedToDb = false;
    if(client){
      try{
        const { error } = await client.from('post_reports').insert({
          photo_id: String(photoId),
          reporter_user_id: identity.id || null,
          reporter_email: identity.email || null,
          reason: trimmed,
          status: 'submitted'
        });
        if(!error) savedToDb = true;
      }catch(_error){}
    }

    if(!savedToDb){
      const reports = getReportState();
      const bucket = reports[String(photoId)] || [];
      bucket.push({
        reporter_user_id: identity.id || null,
        reporter_email: identity.email || null,
        reason: trimmed,
        created_at: new Date().toISOString()
      });
      reports[String(photoId)] = bucket;
      saveJsonStorage(REPORT_KEY, reports);
    }

    showSiteToast('Report sent. Thanks for letting us know.');
  }

  function addExtraActionsToStats(statsWrap){
    if(!statsWrap || statsWrap.querySelector('.pixnest-extra-actions')) return;
    const card = statsWrap.closest('.visual-card');
    const photoId = getPhotoIdFromCard(card);
    if(!photoId) return;

    const info = getRepostInfo(photoId);
    const holder = document.createElement('div');
    holder.className = 'pixnest-extra-actions';
    holder.innerHTML = `
      <button type="button" class="photo-stat pixnest-repost-btn ${info.active ? 'active' : ''}" data-photo-id="${photoId}" data-stop-card title="Repost photo" aria-label="Repost photo" data-label="Reposts">
        <i class="fa-solid fa-retweet"></i>
        <span>${info.count}</span>
      </button>
      <button type="button" class="photo-stat pixnest-report-btn" data-photo-id="${photoId}" data-stop-card title="Report photo" aria-label="Report photo" data-label="Report">
        <i class="fa-solid fa-flag"></i>
        <span>1</span>
      </button>
    `;
    statsWrap.appendChild(holder);
  }

  function refreshExtraPhotoActions(){
    document.querySelectorAll('.photo-stats').forEach(addExtraActionsToStats);
    document.querySelectorAll('.pixnest-repost-btn').forEach(button => {
      const photoId = String(button.getAttribute('data-photo-id') || '');
      const info = getRepostInfo(photoId);
      button.classList.toggle('active', info.active);
      const countSpan = button.querySelector('span');
      if(countSpan) countSpan.textContent = String(info.count);
    });
    document.querySelectorAll('.creator-badge.premium i, .member-badge.premium i, .status-badge.premium i, .pill.premium i, .auth-pill.premium i, .nav-chip.premium i').forEach(icon => {
      icon.className = 'fa-solid fa-circle-check';
    });
  }

  function bindGlobalExtraActions(client){
    document.addEventListener('click', async (event) => {
      const repostBtn = event.target.closest('.pixnest-repost-btn');
      if(repostBtn){
        event.preventDefault();
        event.stopPropagation();
        toggleRepost(repostBtn.getAttribute('data-photo-id'));
        return;
      }

      const reportBtn = event.target.closest('.pixnest-report-btn');
      if(reportBtn){
        event.preventDefault();
        event.stopPropagation();
        const reason = window.prompt('Why are you reporting this post?', '');
        if(reason === null) return;
        await submitPostReport(client, reportBtn.getAttribute('data-photo-id'), reason);
      }
    });

    const observer = new MutationObserver(() => refreshExtraPhotoActions());
    observer.observe(document.body, { childList:true, subtree:true });
    refreshExtraPhotoActions();
    window.addEventListener('pixnest-repost-change', refreshExtraPhotoActions);
  }

  function init(){
    ensureGlobalStyles();
    ensureFooterFlex();
    standardizeNav();
    removeHelpTeamSection();
    showIdleNoticeIfNeeded();
    ensureAuthPromptShell();

    ensureSupabase(async function(){
      try{
        const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        setupIdleLogout(client);

        bindGlobalExtraActions(client);

        const updateUi = async (sessionUser) => {
          window.pixnestAuthUser = sessionUser || null;
          window.pixnestPromptAuthRequired = function(actionText){
            openAuthPrompt(actionText);
          };
          const isPremium = await getPremiumState(sessionUser, client);
          window.pixnestUserIsPremium = isPremium;
          standardizeFooter(isPremium, Boolean(sessionUser));
          buildAuthUI(sessionUser, client);
          refreshExtraPhotoActions();
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
