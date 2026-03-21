(function(){
  if(window.__PIXNEST_SITE_AUTH_INIT__) return;
  window.__PIXNEST_SITE_AUTH_INIT__ = true;
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
    { href:'premium.html', label:'Premium', keys:['premium.html','premiumplans.html','checkout.html','payment.html'] },
    { href:'contact.html', label:'Contact', keys:['contact.html','help.html','about.html','privacy.html','terms.html','license.html'] }
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


  function getActiveNavHref(page = currentPage()){
    const normalized = (page || 'index.html').toLowerCase();
    const item = NAV_ITEMS.find(entry => entry.keys.includes(normalized));
    return item ? item.href : '';
  }

  function syncActiveNavLinks(root = document){
    const activeHref = getActiveNavHref();
    root.querySelectorAll('.nav-links a[href]').forEach(link => {
      const href = String(link.getAttribute('href') || '').toLowerCase();
      link.classList.toggle('active', Boolean(activeHref) && href === activeHref);
    });
  }

  function isCustomAccountPage(){
    const page = currentPage();
    return page === 'account.html' || page === 'profile.html' || page === 'creator-studio.html' || page === 'professional-dashboard.html' || page === 'boss-admin.html';
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
      .site-auth-links{ display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin-left:auto; }
      .nav{ align-items:center !important; }
      .nav-links{ margin-left:auto !important; justify-content:flex-end !important; }
      .menu-toggle{ flex-shrink:0 !important; }
      .site-auth-links .nav-auth-btn,
      .site-auth-links a{ display:inline-flex; align-items:center; justify-content:center; gap:8px; min-height:42px; padding:10px 14px; border-radius:12px; font-size:14px; font-weight:700; text-decoration:none; }
      .site-auth-links .secondary{ background:transparent; color:#fff; border:1px solid rgba(255,255,255,.15); }
      .site-auth-links .secondary:hover{ background:rgba(255,255,255,.06); color:#facc15; border-color:rgba(250,204,21,.28); }
      .site-auth-links .primary{ background:#facc15; color:#111827; border:none; }
      .site-auth-links .primary:hover{ transform:translateY(-2px); box-shadow:0 10px 24px rgba(250,204,21,.18); }
      .site-auth-links .site-danger{ background:transparent; color:#fecaca; border:1px solid rgba(239,68,68,.25); }
      .site-auth-links .site-danger:hover{ background:rgba(239,68,68,.10); color:#fecaca; }
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

      .pixnest-extra-actions{ display:flex; gap:8px; flex-wrap:wrap; margin-left:0 !important; }
      .pixnest-extra-actions .pixnest-repost-btn{
        width:48px !important;
        height:48px !important;
        min-width:48px !important;
        min-height:48px !important;
        padding:0 !important;
        border-radius:999px !important;
        position:relative;
        display:inline-flex !important;
        align-items:center !important;
        justify-content:center !important;
        background:rgba(15,23,42,.86) !important;
        border:1px solid rgba(255,255,255,.12) !important;
        color:#fff !important;
        backdrop-filter:blur(10px);
      }
      .pixnest-extra-actions .pixnest-repost-btn i{ font-size:15px !important; color:#fff !important; }
      .pixnest-extra-actions .pixnest-repost-btn.active i{ color:#facc15 !important; }
      .pixnest-extra-actions .pixnest-repost-count{
        position:absolute;
        right:-4px;
        bottom:-4px;
        min-width:18px;
        height:18px;
        padding:0 4px;
        border-radius:999px;
        display:flex;
        align-items:center;
        justify-content:center;
        background:#facc15;
        color:#111827;
        font-size:10px;
        font-weight:800;
        line-height:1;
        box-shadow:0 6px 16px rgba(0,0,0,.22);
      }
      #viewCreatorProfileBtn{ display:none !important; }
      .photo-stats{ gap:10px !important; align-items:center !important; flex-wrap:wrap !important; }
      .visual-card .photo-stat,
      .card-bottom-right .photo-stat,
      .pixnest-compact-stats .photo-stat{
        width:56px !important;
        height:56px !important;
        min-width:56px !important;
        min-height:56px !important;
        padding:0 !important;
        border-radius:999px !important;
        display:inline-flex !important;
        flex-direction:column !important;
        align-items:center !important;
        justify-content:center !important;
        gap:4px !important;
        background:rgba(15,23,42,.82) !important;
        border:1px solid rgba(255,255,255,.12) !important;
        box-shadow:none !important;
        line-height:1 !important;
      }
      .visual-card .photo-stat i,
      .card-bottom-right .photo-stat i,
      .pixnest-compact-stats .photo-stat i{ font-size:14px !important; color:#facc15 !important; }
      .visual-card .photo-stat > span,
      .card-bottom-right .photo-stat > span,
      .pixnest-compact-stats .photo-stat > span{ font-size:12px !important; font-weight:800 !important; color:#f8fafc !important; }
      .visual-card .photo-stat::after,
      .card-bottom-right .photo-stat::after,
      .pixnest-compact-stats .photo-stat::after{ display:none !important; content:none !important; }
      .visual-card .photo-stat.react-btn.active,
      .card-bottom-right .photo-stat.react-btn.active,
      .pixnest-compact-stats .photo-stat.react-btn.active{
        background:rgba(250,204,21,.16) !important;
        border-color:rgba(250,204,21,.32) !important;
      }
      .lightbox .photo-stats{ gap:12px !important; align-items:center !important; }
      .lightbox .photo-stat{
        width:66px !important;
        height:66px !important;
        min-width:66px !important;
        min-height:66px !important;
        padding:0 !important;
        border-radius:999px !important;
        display:inline-flex !important;
        flex-direction:column !important;
        align-items:center !important;
        justify-content:center !important;
        gap:5px !important;
        background:rgba(15,23,42,.96) !important;
        border:1px solid rgba(255,255,255,.18) !important;
        box-shadow:0 10px 24px rgba(0,0,0,.18) !important;
      }
      .lightbox .photo-stat i{ font-size:16px !important; color:#facc15 !important; }
      .lightbox .photo-stat > span{ font-size:13px !important; font-weight:800 !important; color:#fff !important; }
      .lightbox .photo-stat::after{ display:none !important; content:none !important; }
      .lightbox .photo-stat.react-btn.active{ background:rgba(250,204,21,.18) !important; border-color:rgba(250,204,21,.34) !important; }

      .lightbox .creator-action-btn{ min-height:44px !important; }
      .lightbox .creator-social-proof{ grid-template-columns:repeat(3,minmax(0,1fr)) !important; }
      .lightbox .creator-count{ min-width:0 !important; }
      .lightbox .creator-count strong{ font-size:15px !important; }
      .lightbox .creator-count span{ font-size:11px !important; }
      .lightbox .lightbox-actions{ gap:12px !important; }
      .lightbox .lightbox-social{ background:#0f172a !important; border-color:rgba(255,255,255,.14) !important; }

      .account-menu-wrap,
      .account-menu-toggle,
      .account-menu-btn,
      #accountMenuWrap,
      #accountMenuToggle,
      #accountMenuBtn,
      #accountDropdown,
      #accountMenuDropdown{ display:none !important; }
      .site-unified-menu-wrap{ position:relative; display:flex; align-items:center; flex-shrink:0; margin-left:8px; }
      .site-unified-menu-panel{ position:absolute; top:calc(100% + 12px); right:0; width:min(360px,92vw); max-height:min(76vh,760px); overflow:auto; background:linear-gradient(180deg, rgba(15,23,42,.99), rgba(17,24,39,.98)); border:1px solid rgba(250,204,21,.18); border-radius:24px; box-shadow:0 26px 60px rgba(0,0,0,.38); padding:14px; z-index:2600; display:none; }
      .site-unified-menu-panel.open{ display:block; }
      .site-unified-menu-head{ display:flex; align-items:center; gap:12px; padding:6px 6px 14px; border-bottom:1px solid rgba(255,255,255,.08); margin-bottom:12px; }
      .site-unified-menu-avatar{ width:42px; height:42px; border-radius:14px; background:linear-gradient(135deg,#facc15,#fb7185); color:#111827; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:18px; }
      .site-unified-menu-head strong{ display:block; color:#f8fafc; font-size:15px; }
      .site-unified-menu-head small{ color:#94a3b8; font-size:12px; }
      .site-unified-menu-section{ display:grid; gap:6px; margin-bottom:10px; }
      .site-unified-menu-section-title{ font-size:11px; text-transform:uppercase; letter-spacing:.12em; color:#94a3b8; padding:4px 8px; }
      .site-unified-menu-link,
      .site-unified-menu-action{ width:100%; display:flex; align-items:center; gap:12px; min-height:46px; padding:11px 12px; border-radius:16px; border:1px solid transparent; background:transparent; color:#e5e7eb; text-decoration:none; font-weight:700; font-size:14px; cursor:pointer; }
      .site-unified-menu-link:hover,
      .site-unified-menu-action:hover{ background:rgba(250,204,21,.10); border-color:rgba(250,204,21,.18); color:#facc15; }
      .site-unified-menu-link.active{ background:rgba(250,204,21,.10); color:#facc15; border-color:rgba(250,204,21,.18); }
      .site-unified-menu-action.site-danger{ color:#fecaca; }
      .site-unified-menu-action.site-danger:hover{ color:#fff; background:rgba(239,68,68,.14); border-color:rgba(239,68,68,.24); }
      .site-unified-menu-sep{ height:1px; background:rgba(255,255,255,.08); margin:6px 0 10px; }
      @media (max-width:860px){
        .site-unified-menu-panel{ left:18px; right:18px; width:auto; }
      }
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
        .site-auth-links{ width:100%; }
        .site-auth-links .nav-auth-btn,
        .site-auth-links a{ width:100%; }
        .lightbox{ padding:0 !important; }
        .lightbox .lightbox-panel{ width:100vw !important; height:100dvh !important; max-height:100dvh !important; border-radius:0 !important; grid-template-columns:1fr !important; }
        .lightbox .lightbox-image-wrap{ height:34vh !important; min-height:220px !important; padding:10px !important; }
        .lightbox .lightbox-image-wrap img{ border-radius:16px !important; }
        .lightbox .lightbox-info{ padding:12px 12px 18px !important; }
        .lightbox .lightbox-close{ top:10px !important; right:10px !important; width:40px !important; height:40px !important; }
        .lightbox .creator-cover{ height:84px !important; }
        .lightbox .creator-profile-card{ margin-top:-24px !important; padding:0 12px 12px !important; }
        .lightbox .creator-top{ padding-right:46px !important; gap:12px !important; align-items:flex-end !important; }
        .lightbox .creator-avatar{ width:60px !important; height:60px !important; font-size:21px !important; }
        .lightbox .creator-top-main{ min-width:0 !important; }
        .lightbox .creator-name-link strong{ font-size:17px !important; }
        .lightbox .follow-btn{ width:100% !important; }
        .lightbox .creator-social-proof{ grid-template-columns:repeat(3,minmax(0,1fr)) !important; gap:8px !important; }
        .lightbox .creator-count{ padding:8px 6px !important; border-radius:14px !important; }
        .lightbox .photo-stats{ display:grid !important; grid-template-columns:repeat(3,minmax(0,1fr)) !important; }
        .lightbox .photo-stat[data-label]{ min-width:0 !important; min-height:76px !important; padding:10px 8px !important; border-radius:18px !important; }
        .lightbox .lightbox-actions{ display:grid !important; grid-template-columns:repeat(4,minmax(0,1fr)) !important; }
        .lightbox .lightbox-social{ margin:0 auto !important; }
        .lightbox .creator-menu-actions{ flex-direction:column !important; }
        .lightbox .creator-action-btn{ width:100% !important; }
        .lightbox .creator-posts-grid{ grid-template-columns:repeat(2,minmax(0,1fr)) !important; }
      }
      @media (max-width:480px){
        .lightbox .creator-posts-grid{ grid-template-columns:1fr !important; }
        .lightbox .lightbox-actions{ grid-template-columns:repeat(4,minmax(0,1fr)) !important; gap:10px !important; }
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

  function removeLegacyMenus(){
    document.querySelectorAll('.account-menu-wrap,.account-menu-toggle,.account-menu-btn').forEach(el => {
      if(el.id === 'menuToggle' || el.id === 'navToggle') return;
      if(el.classList.contains('menu-toggle') || el.classList.contains('nav-toggle')) return;
      el.remove();
    });
    document.querySelectorAll('#accountDropdown,#accountMenuDropdown').forEach(el => el.remove());
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
      if(item.href === getActiveNavHref(page)) a.classList.add('active');
      navLinks.appendChild(a);
    });

    preserved.forEach(node => navLinks.appendChild(node));
    syncActiveNavLinks();
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


  async function getAdminState(user, client){
    if(!user) return false;

    const role = String(user?.app_metadata?.role || '').toLowerCase();
    if(role === 'admin' || role === 'founder' || user?.app_metadata?.is_admin === true) return true;

    try{
      const [profileRes, creatorRes] = await Promise.all([
        client.from('profiles').select('site_admin,super_admin,role').eq('id', user.id).maybeSingle(),
        client.from('creator_profiles').select('site_admin,super_admin,role').eq('user_id', user.id).maybeSingle()
      ]);
      const p = profileRes.data || {};
      const c = creatorRes.data || {};
      const pRole = String(p.role || '').toLowerCase();
      const cRole = String(c.role || '').toLowerCase();
      return Boolean(
        p.site_admin === true ||
        p.super_admin === true ||
        c.site_admin === true ||
        c.super_admin === true ||
        pRole === 'admin' ||
        pRole === 'founder' ||
        cRole === 'admin' ||
        cRole === 'founder'
      );
    }catch(_error){
      return false;
    }
  }

  function getAccountTargetPath(){
    return window.pixnestUserIsAdmin ? 'boss-admin.html' : 'account.html';
  }

  function getCreatorStudioTargetPath(){
    return window.pixnestUserIsAdmin ? 'boss-admin.html' : 'creator-studio.html';
  }

  async function getCreatorStudioAccess(user, client){
    if(!user) return false;
    if(window.pixnestUserIsAdmin) return true;

    try{
      const [profileRes, creatorRes, photoRes] = await Promise.all([
        client.from('profiles').select('followers_count,total_views,professional_dashboard_approved,creator_approved').eq('id', user.id).maybeSingle(),
        client.from('creator_profiles').select('followers_count,total_views,professional_dashboard_approved,creator_approved').eq('user_id', user.id).maybeSingle(),
        client.from('photos').select('views,view_count,total_views').or(`uploaded_by.eq.${user.id},user_id.eq.${user.id},auth_user_id.eq.${user.id},creator_id.eq.${user.id},profile_id.eq.${user.id}`)
      ]);

      const profile = profileRes?.data || {};
      const creator = creatorRes?.data || {};
      const rows = Array.isArray(photoRes?.data) ? photoRes.data : [];
      const followers = Number(creator.followers_count ?? profile.followers_count ?? 0);
      const storedViews = Number(creator.total_views ?? profile.total_views ?? 0);
      const countedViews = rows.reduce((sum, row) => sum + Number(row?.views ?? row?.view_count ?? row?.total_views ?? 0), 0);
      const totalViews = Math.max(storedViews, countedViews);
      const approved = Boolean(creator.professional_dashboard_approved || creator.creator_approved || profile.professional_dashboard_approved || profile.creator_approved || user?.user_metadata?.professional_dashboard_approved || user?.user_metadata?.creator_approved);
      return approved || (followers >= 10000 && totalViews >= 100000);
    }catch(_error){
      return Boolean(user?.user_metadata?.professional_dashboard_approved || user?.user_metadata?.creator_approved);
    }
  }

  function setupIdleLogout(client){
    if(window.__PIXNEST_IDLE_LOGOUT_BOUND__) return;
    window.__PIXNEST_IDLE_LOGOUT_BOUND__ = true;
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

    authLinks.innerHTML = ``;
    authLinks.style.display = 'none';
    navLinks.appendChild(authLinks);
  }


  function buildUnifiedMenuLink(href, label, icon, extraClass = ''){
    const activeHref = getActiveNavHref();
    const isActive = href && activeHref && href.toLowerCase() === activeHref.toLowerCase();
    return `<a href="${href}" class="site-unified-menu-link ${extraClass} ${isActive ? 'active' : ''}"><i class="${icon}"></i><span>${label}</span></a>`;
  }

  function buildUnifiedActionLink(href, label, icon, dataAction = ''){
    const actionAttr = dataAction ? ` data-site-action="${dataAction}"` : '';
    return `<a href="${href}" class="site-unified-menu-link"${actionAttr}><i class="${icon}"></i><span>${label}</span></a>`;
  }

  function getUnifiedMenuMarkup(user){
    const accountTarget = getAccountTargetPath();
    const name = String(user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || 'PixNest User').trim();
    const email = String(user?.email || 'Signed in').trim();
    const initial = (name[0] || email[0] || 'P').toUpperCase();

    const navSection = `
      <div class="site-unified-menu-section">
        <div class="site-unified-menu-section-title">Browse</div>
        ${buildUnifiedMenuLink('index.html','Home','fa-solid fa-house')}
        ${buildUnifiedMenuLink('explore.html','Explore','fa-solid fa-compass')}
        ${buildUnifiedMenuLink('category.html','Categories','fa-solid fa-layer-group')}
        ${buildUnifiedMenuLink('featured.html','Featured','fa-solid fa-star')}
        ${buildUnifiedMenuLink('premium.html','Premium','fa-solid fa-crown')}
        ${buildUnifiedMenuLink('contact.html','Contact','fa-solid fa-envelope')}
      </div>`;

    if(!user){
      return `
        <div class="site-unified-menu-head">
          <div class="site-unified-menu-avatar">P</div>
          <div><strong>PixNest Menu</strong><small>Browse or sign in</small></div>
        </div>
        ${navSection}
        <div class="site-unified-menu-sep"></div>
        <div class="site-unified-menu-section">
          <div class="site-unified-menu-section-title">Account</div>
          <a href="login.html" class="site-unified-menu-link"><i class="fa-solid fa-right-to-bracket"></i><span>Login</span></a>
          <a href="signup.html" class="site-unified-menu-link"><i class="fa-solid fa-user-plus"></i><span>Create Account</span></a>
        </div>`;
    }

    const adminSection = window.pixnestUserIsAdmin ? `
      <div class="site-unified-menu-section">
        <div class="site-unified-menu-section-title">Admin</div>
        <a href="boss-admin.html" class="site-unified-menu-link"><i class="fa-solid fa-shield-halved"></i><span>Admin Interface</span></a>
      </div>` : '';

    return `
      <div class="site-unified-menu-head">
        <div class="site-unified-menu-avatar">${initial}</div>
        <div><strong>${name}</strong><small>${email}</small></div>
      </div>
      ${navSection}
      ${adminSection}
      <div class="site-unified-menu-section">
        <div class="site-unified-menu-section-title">Account</div>
        ${buildUnifiedActionLink(accountTarget,'Account','fa-solid fa-user')}
        ${buildUnifiedActionLink('account.html#edit-profile','Edit profile','fa-solid fa-user-pen','edit-profile')}
        ${buildUnifiedActionLink('account.html#change-profile-picture','Change profile picture','fa-solid fa-camera','change-profile-picture')}
        ${buildUnifiedActionLink('account.html#change-cover-photo','Change cover photo','fa-solid fa-image','change-cover-photo')}
        ${buildUnifiedActionLink('account.html#verification-request','Submit verification request','fa-solid fa-badge-check','verification-request')}
        ${buildUnifiedActionLink('account.html#dashboard-request','Submit creator studio request','fa-solid fa-chart-line','dashboard-request')}
        ${buildUnifiedActionLink('upload.html','Upload','fa-solid fa-cloud-arrow-up')}
        ${window.pixnestUserHasStudioAccess ? buildUnifiedActionLink(getCreatorStudioTargetPath(),'Creator Studio','fa-solid fa-chart-pie') : ''}
        ${buildUnifiedActionLink('premium.html','Buy premium membership','fa-solid fa-crown')}
        ${buildUnifiedActionLink('account.html#muted-accounts','Muted accounts','fa-solid fa-volume-xmark')}
        ${buildUnifiedActionLink('account.html#content-preferences','Content preferences','fa-solid fa-sliders')}
        ${buildUnifiedActionLink('account.html#accessibility','Accessibility','fa-solid fa-universal-access')}
        ${buildUnifiedActionLink('account.html#language-and-translations','Language and translations','fa-solid fa-language')}
        ${buildUnifiedActionLink('account.html#media-quality','Media quality','fa-solid fa-photo-film')}
        ${buildUnifiedActionLink('privacy.html','Privacy Centre','fa-solid fa-shield-heart')}
        ${buildUnifiedActionLink('account.html#account-status','Account Status','fa-solid fa-circle-info')}
      </div>
      <div class="site-unified-menu-sep"></div>
      <div class="site-unified-menu-section">
        <button type="button" class="site-unified-menu-action site-danger" data-site-action="logout"><i class="fa-solid fa-right-from-bracket"></i><span>Log out</span></button>
      </div>`;
  }

  function ensurePrimaryMenuToggle(){
    let toggle = document.getElementById('menuToggle') || document.getElementById('navToggle') || document.querySelector('.menu-toggle') || document.querySelector('.nav-toggle');
    if(toggle) return toggle;
    const navLinks = document.getElementById('navLinks') || document.querySelector('.nav-links');
    const host = navLinks?.parentElement || document.querySelector('.nav-right') || document.querySelector('header .nav') || document.querySelector('header');
    if(!host) return null;
    toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.id = 'menuToggle';
    toggle.className = 'menu-toggle';
    toggle.setAttribute('aria-label', 'Open menu');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = '<span></span><span></span><span></span>';
    host.appendChild(toggle);
    return toggle;
  }

  function bindAccountShortcutInterception(){
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[href]');
      if(!link) return;
      const href = String(link.getAttribute('href') || '').trim();
      if(!window.pixnestUserIsAdmin) return;
      if(href === 'account.html' || href === './account.html'){
        event.preventDefault();
        window.location.href = 'boss-admin.html';
      }
    }, true);
  }

  function bindAccountActionLinks(panel){
    if(!panel) return;
    const actionMap = {
      'edit-profile':'editProfileMenuBtn',
      'change-profile-picture':'changeAvatarMenuBtn',
      'change-cover-photo':'changeCoverMenuBtn',
      'verification-request':'verificationRequestBtn',
      'dashboard-request':'dashboardRequestBtn'
    };

    panel.querySelectorAll('[data-site-action]').forEach(el => {
      const action = el.getAttribute('data-site-action');
      if(action === 'logout') return;
      el.addEventListener('click', (event) => {
        if(currentPage() !== 'account.html') return;
        const targetId = actionMap[action];
        const target = targetId ? document.getElementById(targetId) : null;
        if(target){
          event.preventDefault();
          target.click();
          const panelEl = document.getElementById('siteUnifiedMenuPanel');
          if(panelEl) panelEl.classList.remove('open');
          const toggle = ensurePrimaryMenuToggle();
          if(toggle) toggle.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  function setupUnifiedPageMenu(user, client){
    ensureGlobalStyles();
    removeLegacyMenus();
    const toggle = ensurePrimaryMenuToggle();
    if(!toggle) return;

    let wrap = document.getElementById('siteUnifiedMenuWrap');
    if(!wrap){
      wrap = document.createElement('div');
      wrap.className = 'site-unified-menu-wrap';
      wrap.id = 'siteUnifiedMenuWrap';
      const panel = document.createElement('div');
      panel.className = 'site-unified-menu-panel';
      panel.id = 'siteUnifiedMenuPanel';
      wrap.appendChild(panel);
      toggle.insertAdjacentElement('afterend', wrap);
    }

    const panel = document.getElementById('siteUnifiedMenuPanel');
    if(!panel) return;
    panel.innerHTML = getUnifiedMenuMarkup(user);
    bindAccountActionLinks(panel);

    const closeMenu = () => {
      panel.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    };
    const openMenu = () => {
      panel.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
    };

    if(!toggle.dataset.siteUnifiedMenuBound){
      toggle.dataset.siteUnifiedMenuBound = 'true';
      toggle.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        if(panel.classList.contains('open')) closeMenu();
        else openMenu();
      }, true);

      document.addEventListener('click', (event) => {
        if(!panel.classList.contains('open')) return;
        const clickedInside = panel.contains(event.target) || toggle.contains(event.target);
        if(!clickedInside) closeMenu();
      }, true);

      window.addEventListener('resize', () => {
        if(window.innerWidth > 860) closeMenu();
      });
    }

    panel.querySelectorAll('a[href]').forEach(link => {
      link.addEventListener('click', () => closeMenu());
    });

    const logoutBtn = panel.querySelector('[data-site-action="logout"]');
    if(logoutBtn){
      logoutBtn.addEventListener('click', async (event) => {
        event.preventDefault();
        closeMenu();
        try{
          if(client) await client.auth.signOut();
          window.location.href = 'index.html';
        }catch(_err){
          alert('Could not log out.');
        }
      });
    }
  }

  function handlePrivateSelfVsPublicRouting(user){
    const page = currentPage();
    const accountTarget = getAccountTargetPath();
    const creatorId = String(new URLSearchParams(window.location.search).get('creator') || '').trim();
    const viewingSelf = Boolean(user && creatorId && creatorId === String(user.id || '').trim());

    if(page === 'account.html' && user && window.pixnestUserIsAdmin && !window.location.hash && !window.location.search){
      window.location.replace('boss-admin.html');
      return true;
    }

    if(page === 'profile.html' && user && viewingSelf){
      window.location.replace(accountTarget);
      return true;
    }

    return false;
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

  async function submitUserReport(client, targetUserId, targetName, reason){
    const identity = getCurrentUserIdentity();
    if(!identity){
      if(typeof window.pixnestPromptAuthRequired === 'function') window.pixnestPromptAuthRequired('report creators');
      return;
    }

    const trimmed = String(reason || '').trim();
    if(!trimmed) return;

    const rawTarget = String(targetUserId || '').trim();
    const safeTargetUserId = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(rawTarget) ? rawTarget : null;
    let savedToDb = false;

    if(client){
      try{
        const payload = {
          photo_id: '',
          report_type: 'user',
          target_user_id: safeTargetUserId,
          reporter_user_id: identity.id || null,
          reporter_email: identity.email || null,
          reason: trimmed,
          status: 'submitted',
          severity: 'medium'
        };
        const { error } = await client.from('post_reports').insert(payload);
        if(!error) savedToDb = true;
      }catch(_error){}
    }

    if(!savedToDb){
      const reports = getReportState();
      const key = `creator:${safeTargetUserId || String(targetName || 'unknown').toLowerCase()}`;
      const bucket = reports[key] || [];
      bucket.push({
        report_type: 'user',
        target_user_id: safeTargetUserId,
        target_name: String(targetName || '').trim(),
        reporter_user_id: identity.id || null,
        reporter_email: identity.email || null,
        reason: trimmed,
        created_at: new Date().toISOString()
      });
      reports[key] = bucket;
      saveJsonStorage(REPORT_KEY, reports);
    }

    showSiteToast('Creator report sent. Thanks for letting us know.');
  }

  function addExtraActionsToStats(statsWrap){
    if(!statsWrap || statsWrap.classList.contains('lightbox-stats') || statsWrap.querySelector('.pixnest-extra-actions')) return;
    const card = statsWrap.closest('.visual-card');
    const photoId = getPhotoIdFromCard(card);
    if(!photoId) return;

    const info = getRepostInfo(photoId);
    const holder = document.createElement('div');
    holder.className = 'pixnest-extra-actions';
    holder.innerHTML = `
      <button type="button" class="pixnest-repost-btn ${info.active ? 'active' : ''}" data-photo-id="${photoId}" data-stop-card title="Repost photo" aria-label="Repost photo">
        <i class="fa-solid fa-retweet"></i>
        <span class="pixnest-repost-count">${info.count}</span>
      </button>
    `;
    statsWrap.appendChild(holder);
  }

  function refreshExtraPhotoActions(){
    document.querySelectorAll('.visual-card .photo-stats').forEach(addExtraActionsToStats);
    document.querySelectorAll('.pixnest-repost-btn').forEach(button => {
      const photoId = String(button.getAttribute('data-photo-id') || '');
      const info = getRepostInfo(photoId);
      button.classList.toggle('active', info.active);
      const countSpan = button.querySelector('.pixnest-repost-count');
      if(countSpan) countSpan.textContent = String(info.count);
    });
    document.querySelectorAll('.creator-badge.premium i, .member-badge.premium i, .status-badge.premium i, .pill.premium i, .auth-pill.premium i, .nav-chip.premium i').forEach(icon => {
      icon.className = 'fa-solid fa-circle-check';
    });
  }

  function bindGlobalExtraActions(client){
    if(window.__PIXNEST_EXTRA_ACTIONS_BOUND__) {
      if(typeof window.pixnestRefreshExtraPhotoActions === 'function') window.pixnestRefreshExtraPhotoActions();
      return;
    }
    window.__PIXNEST_EXTRA_ACTIONS_BOUND__ = true;

    document.addEventListener('click', async (event) => {
      const repostBtn = event.target.closest('.pixnest-repost-btn');
      if(repostBtn){
        event.preventDefault();
        event.stopPropagation();
        toggleRepost(repostBtn.getAttribute('data-photo-id'));
        return;
      }
    });

    let refreshQueued = false;
    const queueRefresh = () => {
      if(refreshQueued) return;
      refreshQueued = true;
      window.requestAnimationFrame(() => {
        refreshQueued = false;
        refreshExtraPhotoActions();
      });
    };

    window.pixnestRefreshExtraPhotoActions = queueRefresh;
    queueRefresh();
    window.addEventListener('load', queueRefresh, { once:true });
    window.addEventListener('resize', queueRefresh, { passive:true });
    window.addEventListener('pixnest-repost-change', queueRefresh);
    window.addEventListener('pixnest-content-rendered', queueRefresh);
    document.addEventListener('DOMContentLoaded', queueRefresh, { once:true });
  }

  function init(){
    ensureGlobalStyles();
    ensureFooterFlex();
    standardizeNav();
    removeHelpTeamSection();
    showIdleNoticeIfNeeded();
    ensureAuthPromptShell();
    removeLegacyMenus();
    bindAccountShortcutInterception();
    syncActiveNavLinks();

    ensureSupabase(async function(){
      try{
        const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        setupIdleLogout(client);

        bindGlobalExtraActions(client);
        window.pixnestSubmitUserReport = async (targetUserId, targetName, reason) => submitUserReport(client, targetUserId, targetName, reason);

        const updateUi = async (sessionUser) => {
          window.pixnestAuthUser = sessionUser || null;
          window.pixnestPromptAuthRequired = function(actionText){
            openAuthPrompt(actionText);
          };
          const isPremium = await getPremiumState(sessionUser, client);
          const isAdmin = await getAdminState(sessionUser, client);
          window.pixnestUserIsPremium = isPremium;
          window.pixnestUserIsAdmin = isAdmin;
          window.pixnestUserHasStudioAccess = isAdmin ? true : await getCreatorStudioAccess(sessionUser, client);
          standardizeFooter(isPremium, Boolean(sessionUser));
          buildAuthUI(sessionUser, client);
          setupUnifiedPageMenu(sessionUser, client);
          if(handlePrivateSelfVsPublicRouting(sessionUser)) return;
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
