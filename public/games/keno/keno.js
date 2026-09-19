const KENO_PAYTABLES = {
  classic: {
    1: [0.89, 1.28],
    2: [0.0, 1.35, 8.13],
    3: [0.0, 0.0, 5.57, 18.8],
    4: [0.0, 0.0, 2.69, 9.08, 24.2],
    5: [0.0, 0.0, 1.55, 5.22, 13.9, 32.6],
    6: [0.0, 0.0, 0.0, 4.87, 13.0, 30.4, 65.7],
    7: [0.0, 0.0, 0.0, 2.91, 7.77, 18.2, 39.3, 80.3],
    8: [0.0, 0.0, 0.0, 0.0, 8.8, 20.6, 44.5, 90.9, 178],
    9: [0.0, 0.0, 0.0, 0.0, 5.31, 12.4, 26.9, 54.9, 107, 204],
    10: [0.0, 0.0, 0.0, 0.0, 3.45, 8.08, 17.5, 35.6, 69.8, 133, 245],
  },
  low: {
    1: [0.89, 1.28],
    2: [0.0, 1.72, 5.71],
    3: [0.0, 1.0, 3.33, 7.63],
    4: [0.0, 0.66, 2.21, 5.05, 9.91],
    5: [0.0, 0.0, 1.96, 4.48, 8.79, 15.9],
    6: [0.0, 0.0, 1.35, 3.08, 6.04, 10.9, 18.7],
    7: [0.0, 0.0, 0.99, 2.25, 4.42, 7.98, 13.6, 22.5],
    8: [0.0, 0.0, 0.0, 2.34, 4.58, 8.27, 14.1, 23.3, 37.5],
    9: [0.0, 0.0, 0.0, 1.69, 3.32, 5.99, 10.2, 16.9, 27.1, 42.7],
    10: [0.0, 0.0, 0.0, 0.0, 4.0, 7.21, 12.3, 20.4, 32.7, 51.4, 79.6],
  },
  medium: {
    1: [0.0, 3.96],
    2: [0.0, 1.02, 10.4],
    3: [0.0, 0.0, 5.03, 24.9],
    4: [0.0, 0.0, 2.19, 10.9, 40.2],
    5: [0.0, 0.0, 1.14, 5.65, 20.9, 65.7],
    6: [0.0, 0.0, 0.0, 4.13, 15.3, 48.0, 136],
    7: [0.0, 0.0, 0.0, 0.0, 14.7, 46.2, 131, 347],
    8: [0.0, 0.0, 0.0, 0.0, 7.71, 24.2, 68.8, 182, 458],
    9: [0.0, 0.0, 0.0, 0.0, 4.47, 14.1, 39.9, 106, 265, 641],
    10: [0.0, 0.0, 0.0, 0.0, 0.0, 14.9, 42.3, 112, 282, 680, 1593],
  },
  high: {
    1: [0.0, 3.96],
    2: [0.0, 0.0, 17.2],
    3: [0.0, 0.0, 3.34, 43.9],
    4: [0.0, 0.0, 1.01, 13.3, 109],
    5: [0.0, 0.0, 0.0, 5.56, 45.7, 290],
    6: [0.0, 0.0, 0.0, 0.0, 25.9, 165, 888],
    7: [0.0, 0.0, 0.0, 0.0, 10.3, 65.7, 354, 1706],
    8: [0.0, 0.0, 0.0, 0.0, 0.0, 47.2, 254, 1225, 5433],
    9: [0.0, 0.0, 0.0, 0.0, 0.0, 20.8, 112, 540, 2395, 9975],
    10: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 98.2, 473, 2098, 8736, 34620],
  },
};

const $ = (id) => document.getElementById(id);
const TOTAL_NUMBERS = 40, DRAW_COUNT = 10, MAX_PICKS = 10;
let risk = "classic"; let selected = new Set(); let busy = false;

const grid = $("kenoGrid");
function buildGrid() {
  grid.innerHTML = "";
  for (let n = 1; n <= TOTAL_NUMBERS; n++) {
    const cell = document.createElement("div");
    cell.className = "keno-cell"; cell.dataset.num = n; cell.textContent = n;
    cell.addEventListener("click", () => toggle(n));
    grid.appendChild(cell);
  }
}
function toggle(n) {
  if (busy) return;
  if (selected.has(n)) selected.delete(n);
  else { if (selected.size >= MAX_PICKS) { setResult("Maximal 10 Zahlen","loss"); return; } selected.add(n); }
  render();
}
function currentTable() { const p = selected.size; return p<1?null:KENO_PAYTABLES[risk][p]; }
function render() {
  $("balanceDisplay").textContent = fmt(save.balance);
  $("pickCount").textContent = selected.size;
  Array.from(grid.children).forEach(cell => { const n=+cell.dataset.num; cell.className="keno-cell"+(selected.has(n)?" selected":""); });
  renderPaytable();
}
function renderPaytable() {
  const strip = $("paytableStrip"); strip.innerHTML = "";
  const tbl = currentTable();
  if (!tbl) { strip.innerHTML = '<div class="pt-chip"><div class="pt-hits">\u2014</div><div class="pt-mult">Zahlen w\u00e4hlen</div></div>'; return; }
  const p = selected.size;
  for (let k = 0; k <= p; k++) {
    const m = tbl[k]; if (m === 0 && k < Math.ceil(p*0.3)) continue;
    const chip = document.createElement("div"); chip.className = "pt-chip";
    chip.innerHTML = '<div class="pt-hits">' + k + ' Treffer</div><div class="pt-mult">' + (m===0?"0x":m+"x") + '</div>';
    strip.appendChild(chip);
  }
}
function setResult(text, cls="") { const el=$("kenoResult"); el.textContent=text; el.className="keno-result"+(cls?" "+cls:""); }
function drawNumbers() {
  const pool = []; for (let i=1;i<=TOTAL_NUMBERS;i++) pool.push(i);
  for (let i=pool.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [pool[i],pool[j]]=[pool[j],pool[i]]; }
  return new Set(pool.slice(0, DRAW_COUNT));
}
function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }
async function play() {
  if (busy) return;
  if (selected.size < 1) { setResult("W\u00e4hle mindestens 1 Zahl","loss"); return; }
  let bet = parseInt($("betInput").value, 10);
  if (isNaN(bet) || bet < 1) { setResult("Ung\u00fcltiger Einsatz","loss"); return; }
  const bail = tryBailout(bet);
  if (bail) { setResult(bail.msg, bail.ok?"win":"loss"); render(); return; }
  if (bet > save.balance) { setResult("Nicht genug Chips","loss"); return; }
  busy = true; hideWinPopup();
  save.balance -= bet; accrueRakeback(bet); render();
  setResult("Ziehung l\u00e4uft...");
  const drawn = drawNumbers();
  Array.from(grid.children).forEach(c => c.classList.remove("hit","miss-draw"));
  const drawnArr = Array.from(drawn); let hits = 0;
  for (let i=0;i<drawnArr.length;i++) {
    await sleep(80);
    const n = drawnArr[i]; const cell = grid.querySelector('[data-num="' + n + '"]');
    if (selected.has(n)) { cell.classList.remove("selected"); cell.classList.add("hit"); hits++; }
    else cell.classList.add("miss-draw");
  }
  await sleep(250);
  const mult = KENO_PAYTABLES[risk][selected.size][hits] || 0;
  const winAmount = Math.floor(bet * mult);
  save.balance += winAmount;
  save.keno.rounds++;
  if (winAmount >= bet) save.keno.wins++; else save.keno.losses++;
  if (mult > save.keno.biggestMult) save.keno.biggestMult = mult;
  if (winAmount > save.keno.biggestWin) save.keno.biggestWin = winAmount;
  checkLevelUp(true); persist(); render();
  if (winAmount > 0) { setResult(hits + " Treffer", "win"); showWinPopup(mult, winAmount); }
  else setResult(hits + " Treffer \u00b7 0x \u00b7 verloren", "loss");
  await sleep(1300);
  Array.from(grid.children).forEach(c => { c.classList.remove("hit","miss-draw"); if (selected.has(+c.dataset.num)) c.classList.add("selected"); });
  busy = false; render();
}
function autoPick() {
  if (busy) return;
  const count = selected.size > 0 ? selected.size : Math.floor(Math.random()*5)+3;
  selected.clear();
  const pool = []; for (let i=1;i<=TOTAL_NUMBERS;i++) pool.push(i);
  for (let i=pool.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [pool[i],pool[j]]=[pool[j],pool[i]]; }
  pool.slice(0,count).forEach(n=>selected.add(n)); render();
}
$("playBtn").addEventListener("click", play);
$("autoPickBtn").addEventListener("click", autoPick);
$("clearBtn").addEventListener("click", () => { if(!busy){ selected.clear(); render(); setResult("W\u00e4hle 1\u201310 Zahlen"); } });
$("riskRow").addEventListener("click", (e) => {
  const btn = e.target.closest(".risk-btn"); if (!btn || busy) return;
  risk = btn.dataset.risk;
  document.querySelectorAll(".risk-btn").forEach(b => b.classList.toggle("active", b===btn));
  render();
});
document.querySelectorAll(".chip-btn[data-add]").forEach(b => b.addEventListener("click", () => {
  const cur = Math.max(0, parseInt($("betInput").value,10)||0); $("betInput").value = cur + parseInt(b.dataset.add,10);
}));
$("halveBtn").addEventListener("click", () => { $("betInput").value = Math.max(1, Math.floor((parseInt($("betInput").value,10)||0)/2)); });
$("doubleBtn").addEventListener("click", () => { $("betInput").value = Math.max(1, (parseInt($("betInput").value,10)||0)*2); });
$("maxBtn").addEventListener("click", () => { $("betInput").value = Math.max(1, save.balance); });
$("clrBetBtn").addEventListener("click", () => { $("betInput").value = 1; });

buildGrid(); checkLevelUp(false);
render();
