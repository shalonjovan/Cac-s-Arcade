/* =========================================================
   STATE
========================================================= */

let ws = null;
let active = false;
let playerName = "";

/* =========================================================
   ELEMENTS
========================================================= */

const nameScreen   = document.getElementById("nameScreen");
const gameUI       = document.getElementById("gameUI");
const nameInput    = document.getElementById("nameInput");
const startBtn     = document.getElementById("startBtn");

const btn          = document.getElementById("clickBtn");
const status       = document.getElementById("status");
const score        = document.getElementById("score");
const playfield    = document.getElementById("playfield");
const playAgainBtn = document.getElementById("playAgain");

/* =========================================================
   WEBSOCKET
========================================================= */

function connect() {
  ws = new WebSocket(
    location.protocol === "https:"
      ? `wss://${location.host}/ws`
      : `ws://${location.host}/ws`
  );

  ws.onopen = () => {
    ws.send(JSON.stringify({
      type: "join",
      game: "clicker",
      name: playerName
    }));

    status.textContent = "Waiting for opponent…";
    score.textContent = "";
    playAgainBtn.classList.add("hidden");
  };

  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);

    if (msg.type === "start") {
      active = true;
      status.textContent = "GO!";
      teleport();
    }

    if (msg.type === "end") {
      active = false;
      status.textContent = "Match Over!";
      score.textContent = `You: ${msg.you} | Opponent: ${msg.opp}`;
      playAgainBtn.classList.remove("hidden");
    }
  };

  ws.onclose = () => {
    active = false;
  };
}

/* =========================================================
   NAME ENTRY
========================================================= */

startBtn.onclick = () => {
  const name = nameInput.value.trim();
  if (!name) return;

  playerName = name;

  nameScreen.classList.add("hidden");
  gameUI.classList.remove("hidden");

  connect();
};

/* =========================================================
   TELEPORT (viewport safe)
========================================================= */

function teleport() {
  const btnRect = btn.getBoundingClientRect();
  const fieldRect = playfield.getBoundingClientRect();

  const maxX = Math.max(0, fieldRect.width - btnRect.width);
  const maxY = Math.max(0, fieldRect.height - btnRect.height);

  const x = Math.random() * maxX;
  const y = Math.random() * maxY;

  btn.style.left = `${x}px`;
  btn.style.top  = `${y}px`;
}

/* =========================================================
   VISUAL EFFECTS
========================================================= */

function spawnParticles(x, y) {
  for (let i = 0; i < 10; i++) {
    const p = document.createElement("div");
    p.className = "particle";

    p.style.left = `${x}px`;
    p.style.top  = `${y}px`;
    p.style.setProperty("--dx", `${(Math.random() - 0.5) * 120}px`);
    p.style.setProperty("--dy", `${(Math.random() - 0.5) * 120}px`);

    playfield.appendChild(p);
    setTimeout(() => p.remove(), 500);
  }
}

function shake() {
  playfield.classList.add("shake");
  setTimeout(() => playfield.classList.remove("shake"), 150);
}

function glow() {
  btn.classList.remove("glow");
  void btn.offsetWidth; // restart animation
  btn.classList.add("glow");
}

/* =========================================================
   CLICK HANDLER
========================================================= */

btn.addEventListener("click", (e) => {
  if (!active) return;

  ws.send(JSON.stringify({ type: "click" }));

  glow();
  shake();
  spawnParticles(e.clientX, e.clientY);
  teleport();
});

/* =========================================================
   PLAY AGAIN
========================================================= */

playAgainBtn.onclick = () => {
  if (ws) ws.close();
  connect();
};
