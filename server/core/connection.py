# server/core/connection.py

connected = {}      # player_id -> ws
player_room = {}    # ws -> room
player_game = {}    # ws -> game_name or None


async def register(ws, player_id: str):
    """
    Register a player by ID.
    If the same player reconnects, replace the old socket.
    """
    # If player reconnects, drop old ws
    if player_id in connected:
        old_ws = connected[player_id]
        player_room.pop(old_ws, None)
        player_game.pop(old_ws, None)

    connected[player_id] = ws
    player_game[ws] = None


async def unregister(ws):
    """
    Remove ws from tracking.
    """
    # Remove from connected dict
    for pid, sock in list(connected.items()):
        if sock is ws:
            connected.pop(pid)
            break

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
