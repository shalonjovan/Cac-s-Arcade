/* =========================================================
   ELEMENTS
========================================================= */

const nameScreen = document.getElementById("nameScreen");
const lobby = document.getElementById("lobby");
const nameInput = document.getElementById("nameInput");
const startBtn = document.getElementById("startBtn");

const totalOnline = document.getElementById("totalOnline");
const lobbyCount = document.getElementById("lobbyCount");
const gamesDiv = document.getElementById("games");

/* =========================================================
   PLAYER IDENTITY (CRITICAL)
========================================================= */

let playerId = localStorage.getItem("playerId");
if (!playerId) {
  playerId = crypto.randomUUID();
  localStorage.setItem("playerId", playerId);
}

const savedName = localStorage.getItem("playerName");

/* =========================================================
   STATE
========================================================= */

let ws = null;

const GAMES = [
  { id: "clicker", name: "🔥 Clicker" },
  { id: "tictactoe", name: "❌⭕ Tic Tac Toe" }
];

/* =========================================================
   AUTO SKIP NAME SCREEN IF NAME EXISTS
========================================================= */

if (savedName) {
  nameInput.value = savedName;
  nameScreen.classList.add("hidden");
  lobby.classList.remove("hidden");
  connect();
}

/* =========================================================
   START BUTTON
========================================================= */

startBtn.onclick = () => {
  const name = nameInput.value.trim();
  if (!name) return;

  localStorage.setItem("playerName", name);

  nameScreen.classList.add("hidden");
  lobby.classList.remove("hidden");

  connect();
};

/* =========================================================
   WEBSOCKET
========================================================= */

function connect() {
  // prevent duplicate connections
  if (ws && ws.readyState === WebSocket.OPEN) return;

  ws = new WebSocket(
    location.protocol === "https:"
      ? `wss://${location.host}/ws`
      : `ws://${location.host}/ws`
  );

  ws.onopen = () => {
    // 🔥 REQUIRED handshake for correct online counts
    ws.send(JSON.stringify({
      player_id: playerId
    }));
  };

  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.type === "stats") {
      renderStats(msg);
    }
  };

  ws.onclose = () => {
    ws = null;
  };
}

/* =========================================================
   RENDER LOBBY
========================================================= */

function renderStats(stats) {
  totalOnline.textContent = stats.total_online;
  lobbyCount.textContent = stats.lobby;

  gamesDiv.innerHTML = "";

  GAMES.forEach(g => {
    const count = stats.games[g.id] || 0;

    const card = document.createElement("div");
    card.className = `gameCard ${g.id}`;
    card.innerHTML = `
      <div class="badge">${count} online</div>
      <h3>${g.name}</h3>
      <p>Click to play</p>
    `;

    card.onclick = () => {
      window.location.href = `/games/${g.id}/`;
    };

    gamesDiv.appendChild(card);
  });
}
