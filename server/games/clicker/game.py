import asyncio
import time
from server.core.game_base import Game

class ClickerGame(Game):
    name = "clicker"
    max_players = 2

    async def on_start(self, room):
        room.state = {
            "scores": {p: 0 for p in room.players},
            "ended": False
        }

        for p in room.players:
            await p.send_json({"type": "start", "duration": 10})

        asyncio.create_task(self.timer(room))

    async def timer(self, room):
        await asyncio.sleep(10)
        room.state["ended"] = True

        p1, p2 = room.players
        s1 = room.state["scores"][p1]
        s2 = room.state["scores"][p2]

        await p1.send_json({"type": "end", "you": s1, "opp": s2})
        await p2.send_json({"type": "end", "you": s2, "opp": s1})

    async def on_message(self, room, player, msg):
        if room.state["ended"]:
            return

        if msg["type"] == "click":
            room.state["scores"][player] += 1

    async def on_disconnect(self, room, player):
        for p in room.players:
            if p != player:
                await p.send_json({"type": "end", "reason": "disconnect"})
