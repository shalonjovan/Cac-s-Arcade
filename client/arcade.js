export function connect(game) {
  const ws = new WebSocket(
    location.protocol === "https:"
      ? `wss://${location.host}/ws`
      : `ws://${location.host}/ws`
  );

  ws.onopen = () => {
    ws.send(JSON.stringify({ type: "join", game }));
  };

  return ws;
}
