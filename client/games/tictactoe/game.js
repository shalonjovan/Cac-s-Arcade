const name = localStorage.getItem("playerName");
if (!name) location.href = "/";

const ws = new WebSocket(
  location.protocol === "https:"
    ? `wss://${location.host}/ws`
    : `ws://${location.host}/ws`
);

const boardDiv = document.getElementById("board");
const status = document.getElementById("status");
const playAgain = document.getElementById("playAgain");

let myTurn = false;

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: "join",
    game: "tictactoe",
    name
  }));
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
      msg.result === "win" ? "You Win!" :
      msg.result === "lose" ? "You Lose!" :
      "Draw!";
    playAgain.classList.remove("hidden");
  }
};

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


playAgain.onclick = () => location.reload();

const backBtn = document.getElementById("back");

backBtn.onclick = () => {
  window.location.href = "/";
};
