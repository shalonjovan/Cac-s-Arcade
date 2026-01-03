const ws = new WebSocket(
  location.protocol === "https:"
    ? `wss://${location.host}/ws`
    : `ws://${location.host}/ws`
);

const btn = document.getElementById("clickBtn");
const status = document.getElementById("status");
const score = document.getElementById("score");
const playfield = document.getElementById("playfield");

let active = false;

/* ---------------- Multiplayer ---------------- */

ws.onopen = () => {
  ws.send(JSON.stringify({ type: "join", game: "clicker" }));
};

ws.onmessage = (e) => {
  const msg = JSON.parse(e.data);

  if (msg.type === "start") {
    status.textContent = "GO!";
    active = true;
    teleport();
  }

  if (msg.type === "end") {
    active = false;
    status.textContent = "Done!";
    score.textContent = `You: ${msg.you} | Opponent: ${msg.opp}`;
  }
};

/* ---------------- Teleport Logic ---------------- */

function teleport() {
  const btnRect = btn.getBoundingClientRect();
  const fieldRect = playfield.getBoundingClientRect();

  const maxX = fieldRect.width - btnRect.width;
  const maxY = fieldRect.height - btnRect.height;

  const x = Math.random() * maxX;
  const y = Math.random() * maxY;

  btn.style.left = `${x}px`;
  btn.style.top = `${y}px`;
}

/* ---------------- Click Handler ---------------- */

btn.addEventListener("click", () => {
  if (!active) return;

  ws.send(JSON.stringify({ type: "click" }));
  teleport();
});
