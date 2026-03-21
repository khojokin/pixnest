
(function(){
  if(window.__pixnestActiveNavFixBooted) return;
  window.__pixnestActiveNavFixBooted = true;

  const GROUPS = {
    home: ['index.html', ''],
    explore: ['explore.html'],
    categories: ['category.html'],
    featured: ['features.html', 'featured.html', 'premiumplans.html'],
    premium: ['premium.html', 'checkout.html', 'payment.html'],
    about: ['about.html'],
    contact: ['contact.html', 'help.html'],
    account: ['account.html', 'profile.html', 'loggedinuseracc.html', 'boss-admin.html', 'professional-dashboard.html', 'upload.html']
  };

  const KNOWN = new Set(Object.values(GROUPS).flat().filter(Boolean));
  const DIRECT_ONLY = new Set(['login.html','signup.html','privacy.html','terms.html','license.html']);

  function basename(href){
    try{
      if(!href) return '';
      if(href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) return '';
      const url = new URL(href, window.location.href);
      let page = (url.pathname.split('/').pop() || 'index.html').toLowerCase();
      if(!page) page = 'index.html';
      return page;
    }catch(_err){
      return '';
    }
  }

  function currentPage(){
    return basename(window.location.href) || 'index.html';
  }

  function activeGroup(page){
    for(const [group, pages] of Object.entries(GROUPS)){
      if(pages.includes(page)) return group;
    }
    return null;
  }

  function ensureStyle(){
    if(document.getElementById('pixnest-active-nav-fix-style')) return;
    const style = document.createElement('style');
    style.id = 'pixnest-active-nav-fix-style';
    style.textContent = `
      header .nav-links a.active,
      header .nav-links a[aria-current="page"],
      header nav a.active,
      header nav a[aria-current="page"],
      .site-account-dropdown a.active,
      .site-account-dropdown a[aria-current="page"],
      .mobile-menu a.active,
      .mobile-menu a[aria-current="page"],
      .menu-panel a.active,
      .menu-panel a[aria-current="page"],
      .sidebar-nav a.active,
      .sidebar-nav a[aria-current="page"],
      .account-menu a.active,
      .account-menu a[aria-current="page"],
      .dropdown-menu a.active,
      .dropdown-menu a[aria-current="page"],
      .dropdown a.active,
      .dropdown a[aria-current="page"]{
        color:#facc15 !important;
        position:relative;
      }
      header .nav-links a.active::after,
      header .nav-links a[aria-current="page"]::after,
      header nav a.active::after,
      header nav a[aria-current="page"]::after,
      .site-account-dropdown a.active::after,
      .site-account-dropdown a[aria-current="page"]::after,
      .mobile-menu a.active::after,
      .mobile-menu a[aria-current="page"]::after,
      .menu-panel a.active::after,
      .menu-panel a[aria-current="page"]::after,
      .sidebar-nav a.active::after,
      .sidebar-nav a[aria-current="page"]::after,
      .account-menu a.active::after,
      .account-menu a[aria-current="page"]::after,
      .dropdown-menu a.active::after,
      .dropdown-menu a[aria-current="page"]::after,
      .dropdown a.active::after,
      .dropdown a[aria-current="page"]::after{
        content:'' !important;
        position:absolute !important;
        left:0 !important;
        right:0 !important;
        bottom:-4px !important;
        height:3px !important;
        border-radius:999px !important;
        background:#facc15 !important;
        opacity:1 !important;
        transform:none !important;
        display:block !important;
      }
      @media (max-width: 860px){
        .site-account-dropdown a.active::after,
        .site-account-dropdown a[aria-current="page"]::after,
        .mobile-menu a.active::after,
        .mobile-menu a[aria-current="page"]::after,
        .menu-panel a.active::after,
        .menu-panel a[aria-current="page"]::after,
        .sidebar-nav a.active::after,
        .sidebar-nav a[aria-current="page"]::after,
        .account-menu a.active::after,
        .account-menu a[aria-current="page"]::after,
        .dropdown-menu a.active::after,
        .dropdown-menu a[aria-current="page"]::after,
        .dropdown a.active::after,
        .dropdown a[aria-current="page"]::after{
          bottom:4px !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function candidateAnchors(){
    return Array.from(document.querySelectorAll('a[href]')).filter((a) => {
      const href = basename(a.getAttribute('href') || '');
      if(!href) return false;
      if(!KNOWN.has(href) && !DIRECT_ONLY.has(href)) return false;
      return Boolean(a.closest('header, nav, .nav-links, .site-account-dropdown, .mobile-menu, .menu-panel, .sidebar-nav, .account-menu, .dropdown-menu, .dropdown, .drawer, .hamburger-menu, .menu-list, .menu-links'));
    });
  }

  function markActive(){
    ensureStyle();
    const page = currentPage();
    const group = activeGroup(page);
    const groupPages = new Set(group ? GROUPS[group] : [page]);
    const directPages = new Set([page]);

    candidateAnchors().forEach((a) => {
      a.classList.remove('active');
      a.removeAttribute('aria-current');
      const href = basename(a.getAttribute('href') || '');
      if(!href) return;
      if(groupPages.has(href) || directPages.has(href)){
        a.classList.add('active');
        a.setAttribute('aria-current', 'page');
      }
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', markActive, { once:true });
  } else {
    markActive();
  }

  window.addEventListener('pageshow', markActive);
  window.addEventListener('load', markActive);
  document.addEventListener('pixnest:nav-updated', markActive);
  document.addEventListener('pixnest:auth-ui-updated', markActive);
  setTimeout(markActive, 150);
  setTimeout(markActive, 700);
})();
