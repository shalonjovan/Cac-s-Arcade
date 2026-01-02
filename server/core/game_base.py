from abc import ABC, abstractmethod

class Game(ABC):
    name: str
    max_players: int

    @abstractmethod
    async def on_start(self, room):
        pass

    @abstractmethod
    async def on_message(self, room, player, msg):
        pass

    @abstractmethod
    async def on_disconnect(self, room, player):
        pass
