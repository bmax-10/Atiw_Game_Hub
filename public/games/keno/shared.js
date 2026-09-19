// Globals for Game Hub Integration
const GAME_ID = "keno";
const VERSION = "1.0.0";

const save = {
  balance: 1000,
  bj: {
    handsPlayed: 0,
    handsWon: 0,
    handsLost: 0,
    handsPushed: 0,
    blackjacks: 0,
  },
  keno: { rounds: 0, wins: 0, losses: 0, biggestMult: 0, biggestWin: 0 },
  gameWon: false,
};

function fmt(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function tryBailout(bet) {
  return null;
}

function accrueRakeback(bet) {
  // Do nothing
}

function showWinPopup(mult, amt) {
  const winPopup = document.getElementById("winPopup");
  if (!winPopup) return;
  winPopup.textContent = `+${fmt(amt)} Chips`;
  winPopup.classList.add("show");
  setTimeout(() => winPopup.classList.remove("show"), 2000);
}

function hideWinPopup() {
  const winPopup = document.getElementById("winPopup");
  if (winPopup) winPopup.classList.remove("show");
}

function checkLevelUp(show) {
  // Check if balance is <= 0 for game over
  if (save.balance <= 0) {
    save.gameWon = true; // using this flag for game over
    const overlay = document.getElementById("winOverlay");
    if (overlay) overlay.hidden = false;
  }
}

function persist() {
  // Do nothing for now
}

function currentRakebackPct() {
  return 0;
}

function setLevelUpHandlers(obj) {
  // Do nothing
}

function initSidePanel(obj) {
  return { renderPanel: () => {}, openSide: () => {} };
}

function diamondSVG(size) {
  return "💎";
}

// Notify Hub
function notify(type, payload = {}) {
  if (window.parent === window) return;
  window.parent.postMessage({ type, gameId: GAME_ID, version: VERSION, ...payload }, window.location.origin);
}

// Initial Hub Game Start
window.addEventListener("load", () => {
  notify("GAME_STARTED");
  document.getElementById("endGameBtn")?.addEventListener("click", () => {
    notify("GAME_OVER", { score: save.balance });
    const overlay = document.getElementById("winOverlay");
    if (overlay) {
      overlay.querySelector("h2").textContent = "Score gespeichert!";
      overlay.querySelector("p").textContent = `Dein Score: ${fmt(save.balance)} Chips.`;
      overlay.hidden = false;
    }
  });
  
  const winClose = document.getElementById("winClose");
  if (winClose) {
    winClose.addEventListener("click", () => {
      save.balance = 1000;
      save.gameWon = false;
      document.getElementById("winOverlay").hidden = true;
      notify("GAME_STARTED");
      if (typeof render === "function") render();
    });
  }
});
