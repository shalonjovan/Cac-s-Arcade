/* =========================================================
   PRE-CONDITION: NAME + PLAYER ID MUST EXIST
========================================================= */

const playerName = localStorage.getItem("playerName");

// generate once, persist forever
let playerId = localStorage.getItem("playerId");
if (!playerId) {
  playerId = crypto.randomUUID();
  localStorage.setItem("playerId", playerId);
}

if (!playerName) {
  window.location.href = "/";
}

/* =========================================================
   STATE
========================================================= */

let ws = null;
let active = false;

/* =========================================================
   ELEMENTS
========================================================= */

const btn          = document.getElementById("clickBtn");
const status       = document.getElementById("status");
const score        = document.getElementById("score");
const playfield    = document.getElementById("playfield");
const playAgainBtn = document.getElementById("playAgain");
const backBtn      = document.getElementById("backBtn");

/* =========================================================
   INITIAL UI STATE
========================================================= */

backBtn.classList.remove("hidden");   // visible while waiting
playAgainBtn.classList.add("hidden");

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
    // 🔐 REQUIRED HANDSHAKE (DO NOT REMOVE)
    ws.send(JSON.stringify({
      player_id: playerId
    }));

    // join game
    ws.send(JSON.stringify({
      type: "join",
      game: "clicker",
      name: playerName
    }));

    active = false;
    status.textContent = "Waiting for opponent…";
    score.textContent = "";

    playAgainBtn.classList.add("hidden");
    backBtn.classList.remove("hidden");
  };

  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);

    if (msg.type === "start") {
      active = true;
      status.textContent = "GO!";

      playAgainBtn.classList.add("hidden");
      backBtn.classList.add("hidden"); // 🔥 hide during match

      teleport();
    }

    if (msg.type === "end") {
      active = false;

      status.textContent = "Match Over!";
      score.textContent = `You: ${msg.you} | Opponent: ${msg.opp}`;

      playAgainBtn.classList.remove("hidden");
      backBtn.classList.remove("hidden");
    }
  };

  ws.onclose = () => {
    active = false;
    status.textContent = "Disconnected";

    backBtn.classList.remove("hidden");
  };
}

/* =========================================================
   TELEPORT (viewport-safe)
========================================================= */

function teleport() {
  const btnRect   = btn.getBoundingClientRect();
  const fieldRect = playfield.getBoundingClientRect();

  const maxX = Math.max(0, fieldRect.width  - btnRect.width);
  const maxY = Math.max(0, fieldRect.height - btnRect.height);

  btn.style.left = `${Math.random() * maxX}px`;
  btn.style.top  = `${Math.random() * maxY}px`;
}

/* =========================================================
   VISUAL EFFECTS
========================================================= */

function glow() {
  btn.classList.remove("glow");
  void btn.offsetWidth;
  btn.classList.add("glow");
}

function shake() {
  playfield.classList.add("shake");
  setTimeout(() => playfield.classList.remove("shake"), 150);
}

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
   PLAY AGAIN & BACK TO ARCADE
========================================================= */

playAgainBtn.onclick = () => {
  if (ws) ws.close();
  connect();
};

backBtn.onclick = () => {
  window.location.href = "/";
};

/* =========================================================
   START GAME
========================================================= */

connect();
