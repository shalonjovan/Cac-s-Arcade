connected = set()
player_room = {}

async def register(ws):
    connected.add(ws)

async def unregister(ws):
    connected.discard(ws)
    player_room.pop(ws, None)
