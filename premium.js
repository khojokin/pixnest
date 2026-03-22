async function initAuthState(){
  try{
    const { data } = await supabaseClient.auth.getSession();
    currentSession = data?.session || null;
  }catch(error){
    currentSession = null;
  }

  if(typeof renderNavByAuth === "function"){
    await renderNavByAuth();
  }

  supabaseClient.auth.onAuthStateChange(async (_event, session) => {
    currentSession = session || null;

    if(typeof renderNavByAuth === "function"){
      await renderNavByAuth();
    }

    await checkPremiumAccess();
    await loadUnlockedPurchases();
    await loadPremiumPhotos();
    renderPremiumState();
  });
}function renderPremiumGate(){
  premiumGateSection.classList.remove("hidden");
  premiumContentSection.classList.add("hidden");

  const user = getSessionUser();

  if(!user){
    premiumGateCard.innerHTML = `
      <h2>Log in to view premium content</h2>
      <p>You need an account and an active premium membership before you can view this premium content page.</p>

      <div class="gate-actions">
        <a href="signup.html?plan=premium" class="btn primary">
          <i class="fa-solid fa-crown"></i>
          Subscribe
        </a>
        <a href="login.html" class="btn">
          <i class="fa-solid fa-right-to-bracket"></i>
          Login
        </a>
      </div>
    `;
    return;
  }

  premiumGateCard.innerHTML = `
    <h2>Premium membership required</h2>
    <p>Your account is logged in, but premium content is only visible to users with active premium access.</p>

    <div class="gate-actions">
      <a href="payment.html?plan=premium" class="btn primary">
        <i class="fa-solid fa-crown"></i>
        Subscribe
      </a>
      <a href="account.html" class="btn">
        <i class="fa-solid fa-user"></i>
        Back to Account
      </a>
    </div>
  `;
}