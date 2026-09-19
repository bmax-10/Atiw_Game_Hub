/* Blackjack – nutzt geteilte save aus shared.js */
const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const RED_SUITS = new Set(["♥", "♦"]);
const NUM_DECKS = 6;
const RESHUFFLE_AT = 52;
const BJ_PAYOUT = 1.5;

// ---------- Deck ----------
let shoe = [];
function buildShoe() {
  shoe = [];
  for (let d = 0; d < NUM_DECKS; d++) {
    for (const s of SUITS) for (const r of RANKS) shoe.push({ rank: r, suit: s });
  }
  // Fisher-Yates
  for (let i = shoe.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shoe[i], shoe[j]] = [shoe[j], shoe[i]];
  }
}
function drawCard() {
  if (shoe.length <= RESHUFFLE_AT) buildShoe();
  return shoe.pop();
}
buildShoe();

// ---------- Hand-Bewertung ----------
function cardValue(card) {
  if (card.rank === "A") return 11;
  if (["J", "Q", "K"].includes(card.rank)) return 10;
  return parseInt(card.rank, 10);
}
function handValue(cards) {
  let total = 0, aces = 0;
  for (const c of cards) {
    total += cardValue(c);
    if (c.rank === "A") aces++;
  }
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  return total;
}
const isBlackjack = (cards) => cards.length === 2 && handValue(cards) === 21;
const isBust = (cards) => handValue(cards) > 21;

// ---------- Spielzustand ----------
const state = {
  phase: "bet",   // bet | deal | player | dealer | payout
  dealer: [],
  dealerHidden: false,
  hands: [],      // { cards, bet, done, doubled, surrendered, split, isSplitAce }
  activeHandIdx: 0,
  currentBet: 0,
  insuranceBet: 0,
  insurancePaid: false,
};

// ---------- DOM Refs ----------
const $ = (id) => document.getElementById(id);
const balanceEl = $("balanceDisplay");
const dealerCardsEl = $("dealerCards");
const dealerValueEl = $("dealerValue");
const playerHandsEl = $("playerHands");
const playerActiveEl = $("playerActive");
const potEl = $("potAmount");
const messageEl = $("message");
const dealBtn = $("dealBtn");
const betInput = $("betInput");
const actionButtons = $("actionButtons");
const flyLayer = $("flyLayer");
const winOverlay = $("winOverlay");
const levelOverlay = $("levelOverlay");

// ---------- Kartendarstellung ----------
function cardKey(card, faceDown) {
  return faceDown ? "back" : `${card.rank}|${card.suit}`;
}
function makeCardEl(card, faceDown = false) {
  const el = document.createElement("div");
  el.className = "card";
  el.dataset.key = cardKey(card, faceDown);
  fillCardEl(el, card, faceDown);
  return el;
}
function fillCardEl(el, card, faceDown) {
  el.classList.remove("back", "face", "red", "black");
  el.innerHTML = "";
  if (faceDown) {
    el.classList.add("back");
    const t = document.createElement("div");
    t.className = "brand-text";
    t.textContent = "BJ";
    el.appendChild(t);
    return;
  }
  el.classList.add("face");
  el.classList.add(RED_SUITS.has(card.suit) ? "red" : "black");
  el.innerHTML = `
    <div class="corner tl"><div class="rank">${card.rank}</div><div class="suit">${card.suit}</div></div>
    <div class="center-suit">${card.suit}</div>
    <div class="corner br"><div class="rank">${card.rank}</div><div class="suit">${card.suit}</div></div>
  `;
}
function diffCardsInto(container, cards, hiddenIdx = -1) {
  const existing = Array.from(container.children);
  cards.forEach((card, i) => {
    const faceDown = i === hiddenIdx;
    const key = cardKey(card, faceDown);
    const el = existing[i];
    if (!el) {
      const fresh = makeCardEl(card, faceDown);
      container.appendChild(fresh);
    } else if (el.dataset.key !== key) {
      el.style.animation = "none";
      fillCardEl(el, card, faceDown);
      el.dataset.key = key;
    }
  });
  for (let i = container.children.length - 1; i >= cards.length; i--) {
    container.children[i].remove();
  }
}

// ---------- Chip-Flug (visuell) ----------
function flyChipsToPot(amount) {
  const potRect = $("potAmount").getBoundingClientRect();
  const flyRect = flyLayer.getBoundingClientRect();
  const startX = flyRect.width / 2;
  const startY = flyRect.height - 100;
  const endX = potRect.left - flyRect.left + potRect.width / 2 - 17;
  const endY = potRect.top - flyRect.top + potRect.height / 2 - 17;

  const colors = [
    { val: 500, bg: "#8b5cf6", border: "#6b3fc7" },
    { val: 100, bg: "#111", border: "#333" },
    { val: 25,  bg: "#10b981", border: "#0a8963" },
    { val: 5,   bg: "#ef4444", border: "#b91c1c" },
    { val: 1,   bg: "#fff", border: "#ccc" },
  ];
  const chips = [];
  let remaining = Math.floor(amount);
  for (const c of colors) {
    const q = Math.floor(remaining / c.val);
    for (let i = 0; i < Math.min(q, 5); i++) { chips.push(c); remaining -= c.val; }
  }
  if (chips.length === 0) chips.push(colors[colors.length - 1]);

  chips.slice(0, 8).forEach((c, i) => {
    const chip = document.createElement("div");
    chip.className = "fly-chip";
    chip.style.background = c.bg;
    chip.style.borderColor = c.border;
    chip.style.color = c.bg === "#fff" ? "#000" : "#fff";
    chip.textContent = c.val;
    chip.style.left = (startX - 17 + (i - chips.length/2) * 4) + "px";
    chip.style.top = startY + "px";
    flyLayer.appendChild(chip);

    requestAnimationFrame(() => {
      chip.style.transform = `translate(${endX - startX + (i - chips.length/2) * 4}px, ${endY - startY}px) scale(0.8)`;
      chip.style.opacity = "0.9";
    });
    setTimeout(() => {
      chip.style.opacity = "0";
      setTimeout(() => chip.remove(), 400);
    }, 600 + i * 30);
  });
}
function flyChipsFromPot() {
  const potRect = $("potAmount").getBoundingClientRect();
  const flyRect = flyLayer.getBoundingClientRect();
  const startX = potRect.left - flyRect.left + potRect.width / 2 - 17;
  const startY = potRect.top - flyRect.top + potRect.height / 2 - 17;
  const balRect = $("balanceDisplay").parentElement.getBoundingClientRect();
  const endX = balRect.left - flyRect.left + balRect.width / 2 - 17;
  const endY = balRect.top - flyRect.top + balRect.height / 2 - 17;

  for (let i = 0; i < 6; i++) {
    const chip = document.createElement("div");
    chip.className = "fly-chip";
    chip.style.background = "#00e701";
    chip.style.borderColor = "#00a800";
    chip.style.color = "#0f212e";
    chip.textContent = "$";
    chip.style.left = (startX + (Math.random() - 0.5) * 20) + "px";
    chip.style.top = (startY + (Math.random() - 0.5) * 20) + "px";
    flyLayer.appendChild(chip);
    requestAnimationFrame(() => {
      chip.style.transform = `translate(${endX - startX}px, ${endY - startY}px) scale(0.6)`;
      chip.style.opacity = "0.8";
    });
    setTimeout(() => {
      chip.style.opacity = "0";
      setTimeout(() => chip.remove(), 400);
    }, 500 + i * 50);
  }
}

// ---------- Rendering ----------
function render() {
  balanceEl.textContent = fmt(save.balance);

  // Dealer
  diffCardsInto(dealerCardsEl, state.dealer, state.dealerHidden ? 1 : -1);
  if (state.dealer.length === 0) {
    dealerValueEl.textContent = "";
    dealerValueEl.className = "value-badge";
  } else if (state.dealerHidden) {
    dealerValueEl.textContent = handValue([state.dealer[0]]).toString();
    dealerValueEl.className = "value-badge";
  } else {
    const v = handValue(state.dealer);
    dealerValueEl.textContent = v.toString();
    dealerValueEl.className = "value-badge" +
      (isBust(state.dealer) ? " bust" : (isBlackjack(state.dealer) ? " blackjack" : ""));
  }

  const existingHands = Array.from(playerHandsEl.children);
  state.hands.forEach((h, i) => {
    let wrap = existingHands[i];
    let row, badge, bet;
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.className = "player-hand";
      row = document.createElement("div");
      row.className = "cards-row";
      badge = document.createElement("span");
      bet = document.createElement("div");
      bet.className = "bet-label";
      wrap.append(row, badge, bet);
      playerHandsEl.appendChild(wrap);
    } else {
      row = wrap.children[0];
      badge = wrap.children[1];
      bet = wrap.children[2];
    }
    wrap.className = "player-hand" + (i === state.activeHandIdx && state.phase === "player" ? " active" : "");
    diffCardsInto(row, h.cards);
    const v = handValue(h.cards);
    badge.className = "value-badge" +
      (isBust(h.cards) ? " bust" : (isBlackjack(h.cards) ? " blackjack" : ""));
    badge.textContent = v.toString();
    bet.textContent = "Einsatz: " + fmt(h.bet);
  });
  for (let i = playerHandsEl.children.length - 1; i >= state.hands.length; i--) {
    playerHandsEl.children[i].remove();
  }
  playerActiveEl.textContent = "";
  playerActiveEl.className = "value-badge";

  let pot = 0;
  state.hands.forEach(h => { pot += h.bet; });
  pot += state.insuranceBet;
  potEl.textContent = pot > 0 ? fmt(pot) : "";

  updateActionButtons();
}

function updateActionButtons() {
  const btns = actionButtons.querySelectorAll(".act-btn");
  btns.forEach(b => b.disabled = true);

  if (state.phase !== "player") return;
  const h = state.hands[state.activeHandIdx];
  if (!h || h.done) return;

  const canHit = !h.isSplitAce; 
  const canStand = true;
  const canDouble = h.cards.length === 2 && !h.doubled && save.balance >= h.bet && !h.isSplitAce;
  const canSplit = h.cards.length === 2 &&
    cardValue(h.cards[0]) === cardValue(h.cards[1]) &&
    state.hands.length < 4 &&
    save.balance >= h.bet;
  const canSurrender = h.cards.length === 2 && state.hands.length === 1 && !h.doubled;
  const canInsurance = state.hands.length === 1 && h.cards.length === 2 &&
    state.dealer[0].rank === "A" && !state.insurancePaid && save.balance >= Math.floor(h.bet / 2);

  btns.forEach(b => {
    switch (b.dataset.act) {
      case "hit": b.disabled = !canHit; break;
      case "stand": b.disabled = !canStand; break;
      case "double": b.disabled = !canDouble; break;
      case "split": b.disabled = !canSplit; break;
      case "surrender": b.disabled = !canSurrender; break;
      case "insurance": b.disabled = !canInsurance; break;
    }
  });
}

function setMessage(text, tone = "") {
  messageEl.textContent = text;
  messageEl.className = "message" + (tone ? " " + tone : "");
}

async function startDeal() {
  if (state.phase !== "bet" && state.phase !== "payout") return;
  if (state.phase === "payout") {
    hideWinPopup();
    state.phase = "bet";
    state.dealer = [];
    state.hands = [];
    state.activeHandIdx = 0;
    state.insuranceBet = 0;
    state.insurancePaid = false;
  }
  let bet = parseInt(betInput.value, 10);
  if (isNaN(bet) || bet < 1) { setMessage("Ungültiger Einsatz", "warn"); return; }

  const bail = tryBailout(bet);
  if (bail) { setMessage(bail.msg, bail.ok ? "accent" : "warn"); render(); return; }

  if (bet > save.balance) { setMessage("Nicht genug Chips", "warn"); return; }
  bet = Math.min(bet, save.balance);

  state.currentBet = bet;
  state.dealer = [];
  state.dealerHidden = true;
  state.hands = [{
    cards: [], bet, done: false, doubled: false,
    surrendered: false, split: false, isSplitAce: false,
  }];
  state.activeHandIdx = 0;
  state.insuranceBet = 0;
  state.insurancePaid = false;
  save.balance -= bet;
  state.phase = "deal";
  setMessage("Karten werden ausgeteilt...");
  flyChipsToPot(bet);
  render();

  const dealSeq = [
    () => state.hands[0].cards.push(drawCard()),
    () => state.dealer.push(drawCard()),
    () => state.hands[0].cards.push(drawCard()),
    () => state.dealer.push(drawCard()),
  ];
  for (const step of dealSeq) {
    await sleep(280);
    step();
    render();
  }

  const playerBJ = isBlackjack(state.hands[0].cards);
  const dealerUp = state.dealer[0];
  if (dealerUp.rank === "A" || cardValue(dealerUp) === 10) {
    if (isBlackjack(state.dealer)) {
      await sleep(400);
      state.dealerHidden = false;
      render();
      await sleep(500);
      if (state.insurancePaid && state.insuranceBet > 0) {
        save.balance += state.insuranceBet * 3;
      }
      const bet = state.hands[0].bet;
      accrueRakeback(bet);
      if (playerBJ) {
        save.balance += bet; // Push
        save.bj.handsPushed++;
        setMessage("Beide Blackjack – Push", "accent");
        flyChipsFromPot();
      } else {
        save.bj.handsLost++;
        setMessage("Dealer Blackjack – Verloren", "danger");
      }
      state.hands[0].done = true;
      save.bj.handsPlayed++;
      state.phase = "payout";
      finishRound();
      return;
    }
  }
  if (playerBJ) {
    await sleep(300);
    state.dealerHidden = false;
    const bet = state.hands[0].bet;
    accrueRakeback(bet);
    const win = Math.floor(bet * BJ_PAYOUT);
    save.balance += bet + win;
    save.bj.handsWon++;
    save.bj.blackjacks++;
    save.bj.handsPlayed++;
    state.hands[0].done = true;
    setMessage(`Blackjack!`, "accent");
    flyChipsFromPot();
    showWinPopup(1 + BJ_PAYOUT, bet + win);
    state.phase = "payout";
    finishRound();
    return;
  }
  state.phase = "player";
  setMessage("Deine Aktion");
  render();
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function playerHit() {
  const h = state.hands[state.activeHandIdx];
  h.cards.push(drawCard());
  render();
  if (isBust(h.cards)) {
    h.done = true;
    await sleep(500);
    await nextHandOrDealer();
  } else if (handValue(h.cards) === 21) {
    h.done = true;
    await sleep(400);
    await nextHandOrDealer();
  }
}
async function playerStand() {
  state.hands[state.activeHandIdx].done = true;
  await nextHandOrDealer();
}
async function playerDouble() {
  const h = state.hands[state.activeHandIdx];
  if (save.balance < h.bet) { setMessage("Nicht genug", "warn"); return; }
  save.balance -= h.bet;
  flyChipsToPot(h.bet);
  h.bet *= 2;
  h.doubled = true;
  h.cards.push(drawCard());
  h.done = true;
  render();
  await sleep(500);
  await nextHandOrDealer();
}
async function playerSplit() {
  const h = state.hands[state.activeHandIdx];
  if (state.hands.length >= 4) return;
  if (save.balance < h.bet) return;
  save.balance -= h.bet;
  flyChipsToPot(h.bet);
  const cards = h.cards;
  const isAce = cards[0].rank === "A";
  const newHand = {
    cards: [cards[1]], bet: h.bet, done: false, doubled: false,
    surrendered: false, split: true, isSplitAce: isAce,
  };
  h.cards = [cards[0]];
  h.split = true;
  h.isSplitAce = isAce;
  h.cards.push(drawCard());
  newHand.cards.push(drawCard());
  state.hands.splice(state.activeHandIdx + 1, 0, newHand);
  if (isAce) {
    h.done = true;
    newHand.done = true;
  }
  render();
  if (isAce) {
    await sleep(600);
    await nextHandOrDealer();
  }
}
async function playerSurrender() {
  const h = state.hands[state.activeHandIdx];
  h.surrendered = true;
  h.done = true;
  save.balance += Math.floor(h.bet / 2);
  save.bj.handsLost++;
  save.bj.handsPlayed++;
  accrueRakeback(h.bet);
  setMessage(`Aufgegeben – ${fmt(Math.floor(h.bet / 2))} zurück`, "warn");
  await sleep(400);
  await nextHandOrDealer();
}
async function playerInsurance() {
  const h = state.hands[0];
  const ins = Math.floor(h.bet / 2);
  if (save.balance < ins) return;
  save.balance -= ins;
  state.insuranceBet = ins;
  state.insurancePaid = true;
  setMessage(`Insurance: ${fmt(ins)}`, "accent");
  flyChipsToPot(ins);
  render();
}

async function nextHandOrDealer() {
  let idx = state.activeHandIdx + 1;
  while (idx < state.hands.length && state.hands[idx].done) idx++;
  if (idx < state.hands.length) {
    state.activeHandIdx = idx;
    render();
    setMessage(`Hand ${idx + 1}`);
    return;
  }
  await dealerTurn();
}

async function dealerTurn() {
  state.phase = "dealer";
  state.dealerHidden = false;
  render();
  const anyAlive = state.hands.some(h => !isBust(h.cards) && !h.surrendered);
  if (anyAlive) {
    await sleep(500);
    while (handValue(state.dealer) < 17) {
      state.dealer.push(drawCard());
      render();
      await sleep(400);
    }
  }
  if (state.insurancePaid) state.insuranceBet = 0;
  await payout();
}

async function payout() {
  state.phase = "payout";
  const dealerV = handValue(state.dealer);
  const dealerBust = dealerV > 21;
  let anyWin = false;
  let totalWagered = 0;
  let totalReturned = 0;
  const results = [];

  for (const h of state.hands) {
    save.bj.handsPlayed++;
    if (h.surrendered) { results.push("Aufgegeben"); continue; }
    totalWagered += h.bet;
    if (isBust(h.cards)) {
      save.bj.handsLost++;
      results.push("Bust");
      continue;
    }
    const pv = handValue(h.cards);
    if (dealerBust || pv > dealerV) {
      save.balance += h.bet * 2;
      totalReturned += h.bet * 2;
      save.bj.handsWon++;
      anyWin = true;
      results.push(dealerBust ? "Sieg (Dealer Bust)" : "Sieg");
    } else if (pv === dealerV) {
      save.balance += h.bet;
      totalReturned += h.bet;
      save.bj.handsPushed++;
      results.push("Push");
    } else {
      save.bj.handsLost++;
      results.push("Verloren");
    }
  }

  if (totalWagered > 0) accrueRakeback(totalWagered);

  if (anyWin) flyChipsFromPot();

  const msg = results.length === 1 ? results[0] : results.join(" · ");
  const anyLoss = results.some((r) => r === "Bust" || r === "Verloren");
  const tone = anyWin ? "accent" : (anyLoss ? "danger" : "");
  setMessage(msg, tone);
  if (anyWin && totalWagered > 0) {
    showWinPopup(totalReturned / totalWagered, totalReturned);
  }

  finishRound();
}

function finishRound() {
  checkLevelUp(true);
  persist();
  render();
  setTimeout(() => {
    if (state.phase === "payout") {
      state.phase = "bet";
      state.dealer = [];
      state.hands = [];
      state.activeHandIdx = 0;
      state.insuranceBet = 0;
      state.insurancePaid = false;
      render();
      setMessage("Bereit für die nächste Runde");
    }
  }, 900);
}

$("dealBtn").addEventListener("click", startDeal);
actionButtons.addEventListener("click", (e) => {
  const btn = e.target.closest(".act-btn");
  if (!btn || btn.disabled) return;
  switch (btn.dataset.act) {
    case "hit": playerHit(); break;
    case "stand": playerStand(); break;
    case "double": playerDouble(); break;
    case "split": playerSplit(); break;
    case "surrender": playerSurrender(); break;
    case "insurance": playerInsurance(); break;
  }
});
document.querySelectorAll(".chip-btn[data-add]").forEach(b => {
  b.addEventListener("click", () => {
    const cur = Math.max(0, parseInt(betInput.value, 10) || 0);
    betInput.value = cur + parseInt(b.dataset.add, 10);
  });
});
$("halveBtn").addEventListener("click", () => { betInput.value = Math.max(1, Math.floor((parseInt(betInput.value,10)||0)/2)); });
$("doubleBtn").addEventListener("click", () => { betInput.value = Math.max(1, (parseInt(betInput.value,10)||0)*2); });
$("maxBtn").addEventListener("click", () => { betInput.value = Math.max(1, save.balance); });
$("clrBtn").addEventListener("click", () => { betInput.value = 1; });

render();
setMessage("Setze deinen Einsatz und tippe BET");
