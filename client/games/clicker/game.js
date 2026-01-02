const WS_URL =
  location.hostname === "localhost"
    ? "ws://localhost:8000/ws"
    : (location.protocol === "https:"
        ? `wss://${location.host}/ws`
        : `ws://${location.host}/ws`);

const ws = new WebSocket(WS_URL);


const btn = document.getElementById("btn");
const status = document.getElementById("status");
const score = document.getElementById("score");

ws.onopen = () => {
  ws.send(JSON.stringify({ type: "join", game: "clicker" }));
};

ws.onmessage = (e) => {
  const msg = JSON.parse(e.data);

  if (msg.type === "start") {
    status.textContent = "GO!";
    btn.disabled = false;
  }

  if (msg.type === "end") {
    btn.disabled = true;
    score.textContent = `You: ${msg.you}, Opponent: ${msg.opp}`;
  }
};

btn.onclick = () => {
  ws.send(JSON.stringify({ type: "click" }));
};
