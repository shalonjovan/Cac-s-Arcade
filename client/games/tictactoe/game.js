/* =========================================================
   PRE-CONDITION: NAME + PLAYER ID MUST EXIST
========================================================= */

const playerName = localStorage.getItem("playerName");

// stable player identity
let playerId = localStorage.getItem("playerId");
if (!playerId) {
  playerId = crypto.randomUUID();
  localStorage.setItem("playerId", playerId);
}

if (!playerName) {
  window.location.href = "/";
}

/* =========================================================
   ELEMENTS
========================================================= */

const boardDiv = document.getElementById("board");
const status   = document.getElementById("status");
const playAgain = document.getElementById("playAgain");
const backBtn   = document.getElementById("back");

/* =========================================================
   STATE
========================================================= */

let ws = null;
let myTurn = false;

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
    // 🔐 REQUIRED HANDSHAKE
    ws.send(JSON.stringify({
      player_id: playerId
    }));

    // join game
    ws.send(JSON.stringify({
      type: "join",
      game: "tictactoe",
      name: playerName
    }));

    status.textContent = "Waiting for opponent…";
    playAgain.classList.add("hidden");
  };

  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);

    if (msg.type === "start") {
      myTurn = msg.your_turn;
      render(msg.board);
      status.textContent = myTurn ? "Your turn" : "Opponent's turn";
    }

    if (msg.type === "update") {
      myTurn = msg.your_turn;
      render(msg.board);
      status.textContent = myTurn ? "Your turn" : "Opponent's turn";
    }

    if (msg.type === "end") {
      status.textContent =
        msg.result === "win"  ? "You Win!" :
        msg.result === "lose" ? "You Lose!" :
        "Draw!";

      playAgain.classList.remove("hidden");
    }
  };

  ws.onclose = () => {
    status.textContent = "Disconnected";
  };
}

/* =========================================================
   RENDER BOARD
========================================================= */

function render(board) {
  boardDiv.innerHTML = "";

  board.forEach((v, i) => {
    const c = document.createElement("div");
    c.className = "cell";
    c.textContent = v;

    if (v === "X") c.classList.add("x");
    if (v === "O") c.classList.add("o");

    c.onclick = () => {
      if (!myTurn || v) return;
      ws.send(JSON.stringify({ type: "move", index: i }));
    };

    boardDiv.appendChild(c);
  });
}

/* =========================================================
   BUTTONS
========================================================= */

playAgain.onclick = () => {
  if (ws) ws.close();
  connect();
};

backBtn.onclick = () => {
  window.location.href = "/";
};

/* =========================================================
   START
========================================================= */

connect();
