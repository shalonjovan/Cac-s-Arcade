from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from server.core.connection import register, unregister, player_room
from server.core.matchmaking import try_match
from server.core.registry import GAMES

app = FastAPI()

@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    await register(ws)

    try:
        while True:
            msg = await ws.receive_json()

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

            else:
                room = player_room.get(ws)
                if room:
                    await room.game.on_message(room, ws, msg)
            print("\nRoom created for", game_name)

    except WebSocketDisconnect:
        room = player_room.get(ws)
        if room:
            await room.game.on_disconnect(room, ws)
        await unregister(ws)
