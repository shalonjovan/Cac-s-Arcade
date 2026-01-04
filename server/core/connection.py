connected = set()
player_room = {}
player_game = {}  # ws -> game name or None


async def register(ws):
    connected.add(ws)
    player_game[ws] = None


async def unregister(ws):
    connected.discard(ws)
    player_room.pop(ws, None)
    player_game.pop(ws, None)


def stats():
    total_online = len(connected)

    per_game = {}
    for g in player_game.values():
        if g:
            per_game[g] = per_game.get(g, 0) + 1

    lobby_count = sum(1 for g in player_game.values() if g is None)

    return {
        "total_online": total_online,
        "lobby": lobby_count,
        "games": per_game
    }
