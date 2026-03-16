# Country Guessing Game

> An interactive world geography game with 8 game modes, real-time multiplayer, and a progression system.

Test your geography knowledge by finding countries on a world map — using hints, flags, capitals, and your memory. Compete against other players in real-time ranked matches.

![Game Modes](https://via.placeholder.com/800x400?text=Country+Guessing+Game)

## Game Modes

| Mode | Description |
|---|---|
| 🗺️ Classic | Click the correct country — use hints if stuck |
| 💡 Hint-Based | Clues revealed one by one — fewer hints = more XP |
| 🏳️ Flag Quiz | A flag is shown — find the country on the map |
| 🏛️ Capitals | A capital city is named — find its country |
| ⚡ Speed Round | Find as many countries as possible before time runs out |
| 📅 Daily Challenge | One puzzle per day — shareable results |
| 📚 Study Mode | Learn countries continent by continent |
| ⚔️ Multiplayer | Real-time 1v1 ranked matches with hints and rank points |

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Styling | Tailwind CSS |
| Animations | Motion (Framer Motion) |
| Map | SVG world map |
| 3D Globe | Three.js |
| Build | Vite |
| UI Components | shadcn/ui |

## Features

- **8 game modes** — varying difficulty and playstyle
- **Real-time multiplayer** — WebSocket-based 1v1 ranked matches
- **Hint system** — ordered hints (continent → flag → capital → facts)
- **XP & leveling** — earn XP, level up, unlock rank tiers
- **Rank ladder** — Bronze → Silver → Gold → Platinum → Diamond → Master → Challenger
- **Global leaderboard**
- **Daily challenge** — shareable results
- **Sound effects** — Web Audio API
- **TV / display mode** — optimized for large screens
- **Guest access** — play solo modes without an account

## Getting Started

### Prerequisites

- Node.js 18+
- The [backend](https://github.com/YOURUSERNAME/country-guessing-game-backend) running locally

### Installation

```bash
git clone https://github.com/YOURUSERNAME/Country-Guessing-Game.git
cd Country-Guessing-Game
npm install
npm run dev
```

Open `http://localhost:5173`.

### Backend Connection

Update `src/api/client.ts` if your backend runs on a different port:

```typescript
const BASE_URL = "http://localhost:8000/api/v1";
const WS_BASE  = "ws://localhost:8000/ws";
```

## Project Structure

```
src/
├── api/
│   └── client.ts          # All backend API calls
├── app/
│   ├── components/        # Game mode + UI components
│   ├── data/              # Country hints, facts, capitals
│   ├── hooks/             # useAuth, useCountryData, useGameState
│   └── utils/             # XP system, sound effects
└── main.tsx
```

## Roadmap

- [ ] Party mode — multiplayer on TV/smartboard with room codes
- [ ] Mobile layout polish
- [ ] Match history screen
- [ ] Teacher / classroom mode

## Related

- [Backend — Country Guessing Game](https://github.com/BeyzaAkgun/country-guessing-game-backend)

## License

This project is publicly visible for portfolio purposes.
Not licensed for reuse or redistribution.