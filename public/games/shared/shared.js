/* SHARED CASINO CORE – gemeinsame Balance + Rakeback + VIP + Win-Screen für ALLE Spiele */
const SAVE_KEY = "casino_save_v1";
const START_BALANCE = 1000;
const WIN_BALANCE = 5_000_000;
const BAILOUT_AMOUNT = 500;
const BAILOUT_THRESHOLD = 10;
const BAILOUT_COOLDOWN_MS = 60_000;
const VIP_TIERS = [
  { name: "Ohne Rang", threshold: 0,          color: "#7f8fa5" },
  { name: "Bronze",    threshold: 10_000,     color: "#cd7f32" },
  { name: "Silver",    threshold: 50_000,     color: "#c0c0c0" },
  { name: "Gold",      threshold: 250_000,    color: "#f7c948" },
  { name: "Platinum",  threshold: 1_000_000,  color: "#00c6ff" },
  { name: "Diamond",   threshold: 5_000_000,  color: "#b388ff" },
];
const BASE_RAKEBACK_PCT = 1.0;
const PER_TIER_RAKEBACK = 0.5;
const LEVEL_UP_BONUS_PCT = 7.5;

/* Facettierter Stake-Diamant als SVG (skalierbar, scharf) */
function diamondSVG(size = 16) {
  return `<svg class="diamond-icon" width="${size}" height="${size}" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <polygon points="24,3 40,17 24,45 8,17" fill="#1fff8f"/>
    <polygon points="24,3 40,17 24,17" fill="#7dffbf"/>
    <polygon points="24,3 8,17 24,17" fill="#3dffa0"/>
    <polygon points="8,17 24,17 24,45" fill="#0fe07a"/>
    <polygon points="40,17 24,17 24,45" fill="#00b85f"/>
    <polygon points="24,3 24,17 8,17" fill="#a8ffd4" opacity="0.55"/>
  </svg>`;
}

function migrateOldSave() {
  try {
    const old = localStorage.getItem("bj_save_v1");
    if (old && !localStorage.getItem(SAVE_KEY)) {
      const d = JSON.parse(old);
      const migrated = { ...defaultSave(), ...d };
      migrated.bj = { handsPlayed:d.handsPlayed||0, handsWon:d.handsWon||0, handsLost:d.handsLost||0, handsPushed:d.handsPushed||0, blackjacks:d.blackjacks||0 };
      localStorage.setItem(SAVE_KEY, JSON.stringify(migrated));
    }
  } catch {}
}
const defaultSave = () => ({
  balance: START_BALANCE, rakebackPool: 0, rakebackClaimedTotal: 0, totalWagered: 0,
  vipTierReached: 0, gameWon: false, lastBailout: 0,
  bj:   { handsPlayed:0, handsWon:0, handsLost:0, handsPushed:0, blackjacks:0 },
  keno: { rounds:0, wins:0, losses:0, biggestMult:0, biggestWin:0 },
});
function loadSave() {
  migrateOldSave();
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return defaultSave();
    const data = JSON.parse(raw); const base = defaultSave();
    return { ...base, ...data, bj:{...base.bj,...(data.bj||{})}, keno:{...base.keno,...(data.keno||{})} };
  } catch { return defaultSave(); }
}
let save = loadSave();
function persist() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch {} }
const fmt = (n) => Math.floor(n).toLocaleString("de-DE");
const fmtFloat = (n) => n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
function currentVipIndex(balance) {
  let idx = 0;
  for (let i = VIP_TIERS.length - 1; i >= 0; i--) { if (balance >= VIP_TIERS[i].threshold) { idx = i; break; } }
  return idx;
}
function currentRakebackPct() { return BASE_RAKEBACK_PCT + PER_TIER_RAKEBACK * currentVipIndex(save.balance); }
function accrueRakeback(wagered) { if (wagered<=0) return; save.totalWagered += wagered; save.rakebackPool += wagered * currentRakebackPct() / 100; }
let _onLevelUp = null, _onGameWon = null;
function setLevelUpHandlers({ onLevelUp, onGameWon } = {}) { _onLevelUp = onLevelUp||null; _onGameWon = onGameWon||null; }
function checkLevelUp(showBonus = true) {
  const idx = currentVipIndex(save.balance);
  while (save.vipTierReached < idx) {
    save.vipTierReached++;
    const tier = VIP_TIERS[save.vipTierReached];
    const bonus = Math.floor(tier.threshold * LEVEL_UP_BONUS_PCT / 100);
    save.balance += bonus;
    if (showBonus && _onLevelUp) _onLevelUp(tier, bonus);
  }
  if (save.balance >= WIN_BALANCE && !save.gameWon) { save.gameWon = true; if (_onGameWon) _onGameWon(); }
}
function claimRakeback() {
  if (save.rakebackPool < 0.01) return 0;
  const amount = Math.floor(save.rakebackPool); let claimed;
  if (amount < 1) { claimed=save.rakebackPool; save.balance+=save.rakebackPool; save.rakebackClaimedTotal+=save.rakebackPool; save.rakebackPool=0; }
  else { claimed=amount; save.balance+=amount; save.rakebackClaimedTotal+=amount; save.rakebackPool-=amount; }
  checkLevelUp(true); persist();
  return Math.floor(claimed);
}
function resetAll() { localStorage.removeItem(SAVE_KEY); localStorage.removeItem("bj_save_v1"); save = defaultSave(); persist(); }
function tryBailout(bet) {
  if (save.balance < BAILOUT_THRESHOLD && bet > save.balance) {
    const now = Date.now();
    if (now - save.lastBailout > BAILOUT_COOLDOWN_MS) { save.balance+=BAILOUT_AMOUNT; save.lastBailout=now; persist(); return {ok:true,msg:`Bailout: +${BAILOUT_AMOUNT} Chips`}; }
    const wait = Math.ceil((BAILOUT_COOLDOWN_MS-(now-save.lastBailout))/1000);
    return {ok:false,msg:`Bailout-Cooldown: ${wait}s`};
  }
  return null;
}

/* ===== STAKE WIN-SCREEN =====
   Grüne gerahmte Box mit großem Multiplikator + Gewinnbetrag & Diamant.
   Erwartet ein Element #winPopup im DOM. */
let _winPopupTimer = null;
function showWinPopup(multiplier, winAmount) {
  const el = document.getElementById("winPopup");
  if (!el) return;
  const multStr = (Math.round(multiplier * 100) / 100).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "×";
  el.innerHTML = `
    <div class="win-mult">${multStr}</div>
    <div class="win-divider"></div>
    <div class="win-amount">${fmt(winAmount)} ${diamondSVG(18)}</div>`;
  el.classList.remove("show"); void el.offsetWidth;
  el.classList.add("show");
  clearTimeout(_winPopupTimer);
  _winPopupTimer = setTimeout(() => el.classList.remove("show"), 2600);
}
function hideWinPopup() {
  const el = document.getElementById("winPopup");
  if (el) el.classList.remove("show");
  clearTimeout(_winPopupTimer);
}
const CACHE = "steak-casino-v4";
const ASSETS = ["index.html","blackjack.html","keno.html","shared.css","shared.js","vippanel.js","blackjack.js","keno.js","manifest.webmanifest","icon-192.png","icon-512.png"];
self.addEventListener("install", e => e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(res => { const copy=res.clone(); caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{}); return res; }).catch(()=>caches.match("index.html"))));
});

// GAME HUB INTEGRATION OVERRIDE
window.addEventListener("load", () => {
  if (window.parent !== window) {
    const path = window.location.pathname;
    let gameId = "unknown";
    if (path.includes("/blackjack/")) gameId = "blackjack";
    if (path.includes("/keno/")) gameId = "keno";
    
    // Notify hub that game is ready
    window.parent.postMessage({ type: "GAME_STARTED", gameId, version: "1.0.0" }, window.location.origin);

    // Override the back button to save score and close
    const backBtn = document.querySelector(".back-btn");
    if (backBtn) {
      backBtn.onclick = (e) => {
        e.preventDefault();
        persist(); // Ensure score is saved
        window.parent.postMessage({ type: "GAME_OVER", gameId, version: "1.0.0", score: save.balance }, window.location.origin);
      };
    }
  }
});
