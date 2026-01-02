from collections import defaultdict
from server.core.room import Room

waiting = defaultdict(list)

async def try_match(game_name, game, player):
    queue = waiting[game_name]
    queue.append(player)

    if len(queue) >= game.max_players:
        players = queue[:game.max_players]
        del queue[:game.max_players]
        return Room(game, players)

    print("\nQueue size:", len(queue))

    return None
