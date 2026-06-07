# 🏢 ANTI-CORPORATE: Satirical Corporate Liability Board Game 📊

[![React Version](https://img.shields.io/badge/react-v19.0-blue.svg?logo=react&logoColor=white&style=flat-square)](https://react.dev)
[![Vite Version](https://img.shields.io/badge/vite-v6.2-646CFF.svg?logo=vite&logoColor=white&style=flat-square)](https://vitejs.dev)
[![Tailwind CSS v4](https://img.shields.io/badge/tailwindcss-v4.1-38B2AC.svg?logo=tailwind-css&logoColor=white&style=flat-square)](https://tailwindcss.com)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg?style=flat-square)]()
[![Type Safety](https://img.shields.io/badge/typescript-strict%20typed-blue.svg?logo=typescript&logoColor=white&style=flat-square)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)]()

An interactive, full-featured digital board game parody of generic corporate culture, toxic workplace expectations, micromanagement, presenteeism, and endless administrative loops. Heavily inspired by classic roll-and-move accumulation board games, **Anti-Corporate** turns standard capitalistic assumptions on their heads: **your ultimate objective is to pay down your outstanding Corporate Credit Card Debt to exactly $0** to win your freedom!

> 🚨 **PARODY DISCLAIMER:** Nothing in this game depicts real companies, live organizations, active consulting platforms, or real individuals. It is a work of pure satirical parody, survival commentary, and stress-humor. HR exists to protect the company, not you!

---

## 🎨 Visual Identity & Parchment Office Aesthetic
Instead of flashy modern hyper-gradients, *Anti-Corporate* is stylized with an intentional **drab office / paper document aesthetic**:
* **Cardstock Canvas (`bg-[#efebe4]`)**: Layout inspired by physical retro board designs, manila folders, and high-quality cabinet drawers.
* **Typographic Rigor**: Crisp custom fonts pair display titles with technical code font accents (`JetBrains Mono`).
* **Visual Stamps**: Decorative stamp badges (e.g. 🩹 "OUTSOURCED", 💼 "IN-HOUSED") and red warning status indicators simulate an active bureaucratic audit file.
* **Rhythmic Negative Space**: High-legibility elements that ensure no complex mouse hovers are needed—critical information is presented in-place with adaptive reading drawers below.

---

## 📈 Core Satirical Simulator Game Mechanics

### 1. The Reverse Victory Condition: Financial Freedom
Unlike traditional games where you amass properties and extract money, in this simulation:
* Every player starts the game burdened with **$2,500 of default corporate debt**.
* You must land on opponent-delegated departments to pay off your balance using your **Bandwidth**, or capture divisions yourself to offload your maintenance to other employees.
* The first player to reach **exactly $0 of Corporate Debt** buys their unilateral contract buyout and wins the game!

### 2. The 32-Space Modular Office Perimeter
The board maps a continuous 32-space corporate cycle, divided into high-fidelity custom departments and administrative structures:

| Axis / Division | Group Color | Key Premium Departments | Satirical Description |
| :--- | :--- | :--- | :--- |
| **Startup Valley** | 🟫 Brown | Synergy Task Force, Agile Alignment | Entry-level task forces with tiny budgets but infinite post-it note supplies. |
| **Shared Services** | 🟪 Purple | Interactive Onboarding, VR Training, Pizza Annex | Bureaucratic training courses and cost-of-living substitution schemes. |
| **Vaporware Tech** | 🟦 Dark Blue | Blockchain Lab, Quantum Machine Learning | Heavy buzzword ecosystems funded by empty venture capital promises. |
| **Administrative Loops** | 🟥 Red/Pink | Micromanaged Sandbox, Endless Reorg | VS Code screen-sharing monitors and bi-weekly chart updates. |
| **C-Suite Excess** | 🟧 Orange | Presentation Prep, Synergy Retreat, Air Filter Lease | Heavy luxury air filtering allocations billed automatically to standard staff. |
| **Meeting Overload** | 🟩 Green | Pre-Meeting Prep, Bureaucracy Incubator, Debrief Alignment | Continuous alignment summits to debrief about previous alignment debriefs. |
| **Extreme Presenteeism** | 🟥 Red | Presenteeism Attendance, Friday 4:59 PM Urgent Email | Staying late just to be seen by the executive assistant's laptop webcam. |

### 3. Action Deck Disasters & Events
Landing on action spots triggers satirical randomized reports:
* **HR Incident Audit (📝)**: HR letters reminding you that "the corporate ladder doesn't have a safety net".
* **C-Suite Town Hall (🎙️)**: Mandatory broadcast webinars from the CEO's holiday beach house resulting in random bandwidth freezes or compliance fees.

### 4. Stress & Burnout Overloads
Working consecutive overtime hours or landing on stress-prone departments scales your internal **Stress Meter (0% to 100%)**:
* Reaching 100% stress triggers an immediate **Clinical Burnout Warning**!
* If a player is burnt out, they must seek HR Counseling (which slashes their credit debt but forces them to skip their next active turn) or face heavy medical processing fees.

### 5. 🏛️ New: The Federal Corporate Bailout Emergency Clause
When operations near total disaster (outstanding debt reaches within **5% of your maximum credit limit** of $6,000), players are triggered with an emergency federal **Corporate Bailout Offer**:
* **The High-Stake Incentive**: Flipped passing interest rate parameters to **NEGATIVE** (e.g. Receive a refund credit instead of debt penalties each cycle) for **3 turns**.
* **The Austerity Trade-off**: Direct operation freeze! You must **skip 2 consecutive turns** while federal auditors evaluate your books.

---

## 🧪 System QA Unit Test Center & Interactive Sandbox
To ensure absolute gameplay stability and demonstrate production-grade frontend practices, the game includes a built-in toggleable **QA/Developer Sandbox Console** directly in the global header:

```
+-------------------------------------------------+
|               DEVELOPER QA REGISTRY             |
+-------------------------------------------------+
|  [ RUN AUTOMATED UNIT TESTS ]  --> (5 green stats)|
|                                                 |
|  Manual Override Tools:                         |
|  [Set Suresh Debt: $5900] [Force Roll: (4, 4)]   |
|  [Trigger Suresh PIP   ] [Toggle Sound Synthesizer]
+-------------------------------------------------+
```

1. **Automated Unit Tests**: Directly evaluates board coordinates, player debt-relief math formulas, interest restructuring curves, and perimeter dimension boundary checks.
2. **Interactive Manual Sandbox**: Allows developers to alter player parameters on the fly, force custom dice-rolls to test specific board cells, or easily toggle active PIP configurations instantly.

---

## 🛠️ Architecture & Modern Engineering Stack

The codebase is built on strict software design practices, ensuring high scalability and zero bloat:
* **Framework**: React 18+ powered by a rapid, modern **Vite dev engine**.
* **Type Safety**: Strictly modeled TypeScript state contracts, domain objects, and action interfaces (`/src/types.ts`).
* **Micro-Animations**: Staggered transition layout movements utilizing `motion` (from `motion/react`) for cards and actions.
* **Component Modularity**: Isolated layout pieces (`Board.tsx`, `PlayerCard.tsx`, `ActionDocket.tsx`, `CorporateBailoutModal.tsx`) keeping the codebase highly maintainable.
* **Browser-Standard Sound FX**: Built-in sound generation utilizing the browser's native **Web Audio API** (fully decoupled from external file dependencies to avoid load lag or asset rot).

---

## 🚀 Running the App Locally

To clone energy and deploy your own local simulated sandbox environment instantly:

### 1. Install Dependencies
```bash
npm install
```

### 2. Boot Up Development Server
```bash
npm run dev
```
The server will boot locally and expose ingress traffic on port **3000** (`http://localhost:3000`).

### 3. Build Production Target
To bundle the frontend with Vite's optimized tree-shaking asset compilers:
```bash
npm run build
```

### 4. LAN Multiplayer Lobby
The app includes built-in local network multiplayer support using a WebSocket-based lobby.

* Start the development server with `npm run dev`.
* Open the app in a browser on one machine and switch to the LAN multiplayer setup mode.
* Create a new room or join an existing room using the room code.
* Other players on the same network can discover active rooms via the app's lobby list.
* The host controls game start, and game state is synchronized across connected players using the server's `/ws/lan` and `/api/lan/rooms` endpoints.

---

## 📂 Core Structure Architecture
```
├── src/
│   ├── components/
│   │   ├── Board.tsx                  # Grid coordinates coordinate map for 32 spaces
│   │   ├── PlayerCard.tsx             # Interactive dashboard tracking individual debt
│   │   ├── ActionDocket.tsx           # Active card panel and alignment details
│   │   ├── CorporateBailoutModal.tsx  # Interactive high-stakes bailout choice modal
│   │   ├── TestSandbox.tsx            # Manual override tools and automated unit testers
│   │   └── RulesModal.tsx             # Overview handbook overlay
│   ├── utils/
│   │   ├── gameLogic.ts               # Core immutable state machines and dice engines
│   │   ├── gameLogic.test.ts          # Asynchronous rule verifications
│   │   └── sound.ts                   # Modular synthesizer generating Web Audio FX
│   ├── types.ts                       # Strong TypeScript model definitions
│   ├── constants.ts                   # Board spaces, departments, roles, and cards
│   ├── App.tsx                        # Main UI controller & local dockets synchronizer
│   └── index.css                      # Global Tailwind directives & manila styling rules
├── package.json
└── README.md
```

---

## 📄 License
This interactive project is distributed under the **MIT License**. Feel free to use, modify, or mock your own local company retreats!

*Created with passion, craftsmanship, and a severe overload of pre-meeting prep alignment summaries.*
