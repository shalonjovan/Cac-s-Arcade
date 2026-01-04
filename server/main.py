from pathlib import Path
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from server.core.connection import (
    register,
    unregister,
    player_room,
    player_game,
    stats
)
from server.core.matchmaking import try_match
from server.core.registry import GAMES

app = FastAPI()

# ------------------------------------------------------------------
# Paths
# ------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent
CLIENT_DIR = BASE_DIR / "client"

# ------------------------------------------------------------------
# Static files
# ------------------------------------------------------------------
app.mount(
    "/static",
    StaticFiles(directory=CLIENT_DIR),
    name="static"
)

# ------------------------------------------------------------------
# Arcade lobby
# ------------------------------------------------------------------
@app.get("/", include_in_schema=False)
async def arcade():
    return FileResponse(CLIENT_DIR / "index.html")

# ------------------------------------------------------------------
# Game pages
# ------------------------------------------------------------------
@app.get("/games/{game}/", include_in_schema=False)
async def serve_game(game: str):
    game_index = CLIENT_DIR / "games" / game / "index.html"
    if game_index.exists():
        return FileResponse(game_index)
    return FileResponse(CLIENT_DIR / "index.html")

# ------------------------------------------------------------------
# WebSocket endpoint
# ------------------------------------------------------------------
@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()

    # First message MUST contain player_id
    hello = await ws.receive_json()
    player_id = hello.get("player_id")

    if not player_id:
        await ws.close()
        return

    await register(ws, player_id)

    async def broadcast_stats():
        payload = {"type": "stats", **stats()}
        for sock in list(player_game.keys()):
            try:
                await sock.send_json(payload)
            except:
                pass

    await broadcast_stats()

    try:
        while True:
            msg = await ws.receive_json()

            # ---------------- JOIN GAME ----------------
            if msg.get("type") == "join":
                game_name = msg["game"]
                game = GAMES.get(game_name)
                if not game:
                    continue

                player_game[ws] = game_name
                await broadcast_stats()

                room = await try_match(game_name, game, ws)
                if room:
                    for p in room.players:
                        player_room[p] = room
                    await game.on_start(room)

            # ---------------- GAME MESSAGE ----------------
            else:
                room = player_room.get(ws)
                if room:
                    await room.game.on_message(room, ws, msg)

    except WebSocketDisconnect:
        room = player_room.get(ws)
        if room:
            await room.game.on_disconnect(room, ws)

        await unregister(ws)
        await broadcast_stats()
