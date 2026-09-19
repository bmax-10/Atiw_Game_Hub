(() => {
  const GAME_ID = "snake";
  const VERSION = "1.0.0";
  const SIZE = 20;
  const CELL = 30;
  const canvas = document.querySelector("#game");
  const context = canvas.getContext("2d");
  const scoreElement = document.querySelector("#score");
  const finalScoreElement = document.querySelector("#final-score");
  const gameOverElement = document.querySelector("#game-over");
  const gameStartElement = document.querySelector("#game-start");
  const startGameButton = document.querySelector("#start-game");
  const restartButton = document.querySelector("#restart");
  const playAgainButton = document.querySelector("#play-again");

  let snake;
  let apple;
  let direction;
  let queuedDirection;
  let score;
  let isGameOver;
  let timerId;

  function samePosition(a, b) {
    return a.x === b.x && a.y === b.y;
  }

  function randomApple() {
    let next;
    do {
      next = { x: Math.floor(Math.random() * SIZE), y: Math.floor(Math.random() * SIZE) };
    } while (snake.some((segment) => samePosition(segment, next)));
    return next;
  }

  function notify(type, payload = {}) {
    if (window.parent === window) return;
    window.parent.postMessage({ type, gameId: GAME_ID, version: VERSION, ...payload }, window.location.origin);
  }

  function reset() {
    snake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ];
    direction = { x: 1, y: 0 };
    queuedDirection = direction;
    apple = randomApple();
    score = 0;
    isGameOver = false;
    scoreElement.textContent = String(score);
    gameOverElement.hidden = true;
    gameStartElement.hidden = true;
    notify("GAME_STARTED");
    draw();
    if (timerId) window.clearInterval(timerId);
    timerId = window.setInterval(tick, 118);
  }

  function setDirection(next) {
    if (!next || (next.x === -direction.x && next.y === -direction.y)) return;
    queuedDirection = next;
  }

  function endGame() {
    isGameOver = true;
    finalScoreElement.textContent = `${score} Punkte`;
    gameOverElement.hidden = false;
    notify("GAME_OVER", { score });
    if (timerId) window.clearInterval(timerId);
  }

  function tick() {
    if (isGameOver) return;
    direction = queuedDirection;
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    const hitWall = head.x < 0 || head.x >= SIZE || head.y < 0 || head.y >= SIZE;
    const hitSelf = snake.some((segment) => samePosition(segment, head));
    if (hitWall || hitSelf) {
      endGame();
      return;
    }
    snake.unshift(head);
    if (samePosition(head, apple)) {
      score += 10;
      scoreElement.textContent = String(score);
      apple = randomApple();
    } else {
      snake.pop();
    }
    draw();
  }

  function drawCell(position, color, inset = 2) {
    context.fillStyle = color;
    context.fillRect(position.x * CELL + inset, position.y * CELL + inset, CELL - inset * 2, CELL - inset * 2);
  }

  function draw() {
    context.fillStyle = "#20291d";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "rgba(201, 218, 187, .09)";
    context.lineWidth = 1;
    for (let i = 0; i <= SIZE; i += 1) {
      context.beginPath();
      context.moveTo(i * CELL, 0);
      context.lineTo(i * CELL, canvas.height);
      context.stroke();
      context.beginPath();
      context.moveTo(0, i * CELL);
      context.lineTo(canvas.width, i * CELL);
      context.stroke();
    }
    drawCell(apple, "#f26e2c", 4);
    snake.forEach((segment, index) => drawCell(segment, index === 0 ? "#d2ff79" : "#b6f544"));
    const head = snake[0];
    context.fillStyle = "#1c2418";
    context.fillRect(head.x * CELL + 8, head.y * CELL + 8, 5, 5);
    context.fillRect(head.x * CELL + 18, head.y * CELL + 8, 5, 5);
  }

  const controls = {
    arrowup: { x: 0, y: -1 }, w: { x: 0, y: -1 },
    arrowdown: { x: 0, y: 1 }, s: { x: 0, y: 1 },
    arrowleft: { x: -1, y: 0 }, a: { x: -1, y: 0 },
    arrowright: { x: 1, y: 0 }, d: { x: 1, y: 0 },
  };

  window.addEventListener("keydown", (event) => {
    const control = controls[event.key.toLowerCase()];
    if (!control) return;
    event.preventDefault();
    setDirection(control);
  });

  window.addEventListener("message", (event) => {
    if (event.origin !== window.location.origin || event.data?.type !== "GAME_HUB_CONTROL") return;
    const control = event.data.control;
    if (control === "restart") return reset();
    setDirection({
      up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 },
    }[control]);
  });

  startGameButton.addEventListener("click", reset);
  restartButton.addEventListener("click", reset);
  playAgainButton.addEventListener("click", reset);
  
  // Initiale Anzeige ohne Start
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];
  apple = randomApple();
  draw();
})();
