from typing import TypedDict, List

class Move(TypedDict):
    type: str        # "move"
    index: int       # 0–8

class State(TypedDict):
    board: List[str]
    turn: int
