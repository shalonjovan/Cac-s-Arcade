from pathlib import Path
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from server.core.connection import register, unregister, player_room
from server.core.matchmaking import try_match
from server.core.registry import GAMES

app = FastAPI()

# ------------------------------------------------------------------
# Paths
# ------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent
CLIENT_DIR = BASE_DIR / "client"

# ------------------------------------------------------------------
# Static files (JS, CSS)
# ------------------------------------------------------------------
app.mount("/static", StaticFiles(directory=CLIENT_DIR), name="static")

# ------------------------------------------------------------------
# Arcade lobby
# ------------------------------------------------------------------
@app.get("/")
async def arcade():
    return FileResponse(CLIENT_DIR / "index.html")

# ------------------------------------------------------------------
# Game pages (e.g. /games/clicker)
# ------------------------------------------------------------------
@app.get("/games/{game}/")
async def serve_game(game: str):
    game_dir = CLIENT_DIR / "games" / game / "index.html"
    if game_dir.exists():
        return FileResponse(game_dir)
    return {"error": "Game not found"}

# ------------------------------------------------------------------
# WebSocket endpoint (shared for ALL games)
# ------------------------------------------------------------------
@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    await register(ws)

    try:
        while True:
            msg = await ws.receive_json()

            # Join request
            if msg["type"] == "join":
                game_name = msg["game"]
                game = GAMES.get(game_name)

                if not game:
                    await ws.send_json({"error": "invalid_game"})
                    continue

                room = await try_match(game_name, game, ws)
                if room:
                    for p in room.players:
                        player_room[p] = room
                    await game.on_start(room)

            # Game message
            else:
                room = player_room.get(ws)
                if room:
                    await room.game.on_message(room, ws, msg)

    except WebSocketDisconnect:
        room = player_room.get(ws)
        if room:
            await room.game.on_disconnect(room, ws)
        await unregister(ws)
