from server.games.clicker.game import ClickerGame
from server.games.tictactoe.game import TicTacToeGame

GAMES = {
    "clicker": ClickerGame(),
    "tictactoe": TicTacToeGame(),
}
