# 🎮 Cac’s Arcade

Cac’s Arcade is a real-time, multiplayer browser arcade built from scratch using WebSockets.

It’s designed as a **shared multiplayer platform**, not a single game — meaning new games can be plugged in easily without rewriting matchmaking or server logic.

👉 **Play here:**  
https://cac-s-arcade.onrender.com/

---

## 🚀 What is Cac’s Arcade?

Cac’s Arcade is a central multiplayer lobby where players can:
- Enter with a name
- See how many players are online
- View per-game activity in real time
- Join a game instantly and get matched with another player

The entire system runs on a **single WebSocket server**, shared across all games.

---

## 🕹️ Current Games

### 🔥 Clicker
A fast-paced reflex game where two players compete to click as fast as possible within a time limit.

### ❌⭕ Tic Tac Toe
A real-time 2-player Tic Tac Toe game with proper turn handling and matchmaking.

---

## 🧠 Architecture Overview

- **Single WebSocket endpoint** for all games
- **Central matchmaking system**
- **Game registry** to plug in new games easily
- **Room abstraction** to isolate matches
- **Player state tracking** (lobby vs in-game)

Each game only needs to implement:
- Game start logic
- Message handling
- Disconnect handling

Everything else (connections, stats, matchmaking) is shared.

---

## 🧰 Tech Stack

- **Python**
- **FastAPI**
- **WebSockets**
- **HTML / CSS / JavaScript**

No frameworks on the frontend — everything is built with vanilla JS for clarity and control.

---

## 📊 Features

- Real-time player count
- Per-game activity tracking
- Live matchmaking
- Shared lobby
- Seamless transitions between lobby and games
- Deployed and playable online

---

## 🛠️ Running Locally

```bash
git clone https://github.com/your-username/cacs-arcade.git
cd cacs-arcade
python -m venv venv
source venv/bin/activate
pip install -r server/requirements.txt
uvicorn server.main:app --reload
