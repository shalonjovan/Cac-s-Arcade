from server.core.room import Room

WIN_PATTERNS = [
    (0,1,2),(3,4,5),(6,7,8),
    (0,3,6),(1,4,7),(2,5,8),
    (0,4,8),(2,4,6)
]

class TicTacToeGame:
    name = "tictactoe"
    max_players = 2

    async def on_start(self, room: Room):
        room.state = {
            "board": [""] * 9,
            "turn": 0
        }

        for i, ws in enumerate(room.players):
            await ws.send_json({
                "type": "start",
                "symbol": "X" if i == 0 else "O",
                "your_turn": i == 0,
                "board": room.state["board"]
            })

    async def on_message(self, room: Room, ws, msg):
        if msg.get("type") != "move":
            return

        player_index = room.players.index(ws)
        if player_index != room.state["turn"]:
            return

        idx = msg.get("index")
        if idx is None or room.state["board"][idx]:
            return

        symbol = "X" if player_index == 0 else "O"
        room.state["board"][idx] = symbol
        room.state["turn"] = 1 - room.state["turn"]

        winner = self.check_winner(room.state["board"])

        for i, p in enumerate(room.players):
            await p.send_json({
                "type": "update",
                "board": room.state["board"],
                "your_turn": i == room.state["turn"]
            })

        if winner or "" not in room.state["board"]:
            for i, p in enumerate(room.players):
                await p.send_json({
                    "type": "end",
                    "result": (
                        "draw" if not winner else
                        "win" if room.state["board"].count(
                            "X" if i == 0 else "O"
                        ) > room.state["board"].count(
                            "O" if i == 0 else "X"
                        ) else "lose"
                    )
                })

    async def on_disconnect(self, room: Room, ws):
        for p in room.players:
            if p != ws:
                await p.send_json({
                    "type": "end",
                    "result": "win",
                    "reason": "opponent_disconnected"
                })

    def check_winner(self, board):
        for a,b,c in WIN_PATTERNS:
            if board[a] and board[a] == board[b] == board[c]:
                return board[a]
        return None
