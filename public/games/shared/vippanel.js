/* GETEILTES VIP / RAKEBACK PANEL – Slide-in (Spiele) oder inline (Hub) */
function vipPanelInnerHTML() {
  return `
    <div class="vip-badge" id="vipBadge"><div class="vip-tier-name" id="vipTierName">—</div><div class="vip-sub" id="vipSub">—</div></div>
    <div class="vip-progress-wrap"><div class="vip-progress-bar"><div class="vip-progress-fill" id="vipProgressFill"></div></div><div class="vip-progress-label" id="vipProgressLabel"></div></div>
    <h3 class="section-title">Tier-Übersicht</h3>
    <ul class="tier-list" id="tierList"></ul>
    <div class="divider"></div>
    <h3 class="section-title">Rakeback (spielübergreifend)</h3>
    <div class="rb-box">
      <div class="rb-row"><span>Rate</span><span id="rbRate" class="rb-value accent">—</span></div>
      <div class="rb-row"><span>Verfügbar</span><span id="rbPool" class="rb-value">0</span></div>
      <button class="claim-btn" id="claimRbBtn">Rakeback einlösen</button>
      <div class="rb-total" id="rbTotal">Eingelöst insgesamt: 0</div>
    </div>
    <div class="divider"></div>
    <h3 class="section-title" id="statsTitle">Statistik</h3>
    <div class="stats-grid" id="statsGrid"></div>
    <div class="divider"></div>
    <button class="danger-btn" id="resetBtn">Alles zurücksetzen</button>`;
}
function wirePanel({ statsFn, onReset, renderPanel }) {
  const $ = (id) => document.getElementById(id);
  $("claimRbBtn").addEventListener("click", () => { const amt = claimRakeback(); renderPanel(); if (window.__afterClaim) window.__afterClaim(amt); });
  $("resetBtn").addEventListener("click", () => {
    if (confirm("Wirklich alles zurücksetzen? Balance, VIP-Fortschritt und Rakeback (für ALLE Spiele) gehen verloren.")) { resetAll(); renderPanel(); if (onReset) onReset(); }
  });
}
function renderVipContent(statsFn) {
  const $ = (id) => document.getElementById(id);
  const idx = currentVipIndex(save.balance); const tier = VIP_TIERS[idx];
  $("vipTierName").textContent = tier.name; $("vipTierName").style.color = tier.color;
  const next = VIP_TIERS[idx + 1];
  if (next) {
    const prev = tier.threshold, total = next.threshold - prev, done = Math.max(0, save.balance - prev);
    $("vipProgressFill").style.width = Math.min(100, done/total*100) + "%";
    $("vipProgressLabel").textContent = `${fmt(done)} / ${fmt(total)} zur Stufe ${next.name}`;
    $("vipSub").textContent = `Nächste Stufe: ${next.name}`;
  } else { $("vipProgressFill").style.width = "100%"; $("vipProgressLabel").textContent = "Höchste Stufe erreicht"; $("vipSub").textContent = "Diamond – Ende der Skala"; }
  const list = $("tierList"); list.innerHTML = "";
  VIP_TIERS.forEach((t, i) => {
    if (i === 0) return;
    const li = document.createElement("li");
    if (save.balance >= t.threshold) li.classList.add("reached");
    if (i === idx) li.classList.add("current");
    li.innerHTML = `<span class="dot" style="background:${t.color}"></span><span class="tier-name">${t.name}</span><span>${fmt(t.threshold)}</span>`;
    list.appendChild(li);
  });
  $("rbRate").textContent = currentRakebackPct().toFixed(1) + " %";
  $("rbPool").textContent = fmtFloat(save.rakebackPool);
  $("rbTotal").textContent = "Eingelöst insgesamt: " + fmt(save.rakebackClaimedTotal);
  $("claimRbBtn").disabled = save.rakebackPool < 0.01;
  const grid = $("statsGrid"); grid.innerHTML = "";
  (statsFn ? statsFn() : []).forEach(([label, val]) => {
    const cell = document.createElement("div"); cell.className = "stat-cell";
    cell.innerHTML = `<div class="label">${label}</div><div class="val">${val}</div>`;
    grid.appendChild(cell);
  });
}
function initSidePanel({ statsFn, onReset } = {}) {
  const html = `<aside class="side-panel" id="sidePanel" aria-hidden="true"><div class="side-header"><h2>VIP Club</h2><button class="close-btn" id="closeBtn" aria-label="Schließen">✕</button></div>${vipPanelInnerHTML()}</aside><div class="backdrop" id="backdrop"></div>`;
  document.body.insertAdjacentHTML("beforeend", html);
  const $ = (id) => document.getElementById(id);
  const sidePanel = $("sidePanel"), backdrop = $("backdrop");
  const renderPanel = () => renderVipContent(statsFn);
  const openSide = () => { sidePanel.classList.add("open"); sidePanel.setAttribute("aria-hidden","false"); backdrop.classList.add("show"); renderPanel(); };
  const closeSide = () => { sidePanel.classList.remove("open"); sidePanel.setAttribute("aria-hidden","true"); backdrop.classList.remove("show"); };
  $("closeBtn").addEventListener("click", closeSide); backdrop.addEventListener("click", closeSide);
  wirePanel({ statsFn, onReset, renderPanel });
  return { openSide, closeSide, renderPanel };
}
function initInlinePanel(containerEl, { statsFn, onReset } = {}) {
  containerEl.innerHTML = `<div class="side-header"><h2>👑 VIP Club</h2></div>${vipPanelInnerHTML()}`;
  const renderPanel = () => renderVipContent(statsFn);
  wirePanel({ statsFn, onReset, renderPanel }); renderPanel();
  return { renderPanel };
}
