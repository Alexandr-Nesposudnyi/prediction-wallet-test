Prediction Wallet

A small wallet dashboard.
The main idea is to demonstrate the architecture, working with server actions, the graph, and UI logic.
Next.js (App Router) + TypeScript
separate server/client components
All data and actions are handled through server actions
Token balance and history are taken from Etherscan
Graph with timeframes, hover, dates, and number animations
Server-side graph caching for 60 seconds (by publicKey + timeframe)
Buttons with animations (hover/tap)
Deposit and withdrawal flows are implemented
Deposits and withdrawals are handled entirely through the following flow:
UI -> server action -> transaction result.
Transaction signing is currently blocked and returns a TX hash.# Prediction Wallet
A small wallet dashboard, created as a demo project.
The main goal is to demonstrate the application architecture, working with server actions, the graph, and UI logic. The project is built on Next.js (App Router) using TypeScript.
## General Concept and Architecture
- Server and client components are clearly separated
- All data and user actions are processed through server actions
- The architecture is consistent with the production approach and allows for real on-chain transactions (for example, on a testnet) to be integrated without UI changes, if needed.
Token balance and history are downloaded via the Etherscan API.
## Functionality
- Chart with timeframes, hover states, dates, and number animations
Chart data is cached on the server for 60 seconds (by publicKey + timeframe)
- Buttons with hover/tap animations
- Deposit and withdrawal flows are implemented:
UI → server action → transaction result
Transaction signing is currently locked and returns a TX hash.
The real private key was not included because there was no explicit requirement for it in the test task.

## Environment Variables

All necessary variables are listed in `.env.example`.
Main ones:
- `WALLET_PUBLIC_KEY`
- `TOKEN_ADDRESS`
- `TOKEN_DECIMALS`
- `ETHERSCAN_API_KEY`
## How to run
```bash
npm install
npm run dev
I didn't include the real private key without an explicit requirement in the test task.
The architecture is the same as in production; if necessary, you can quickly enable real on-chain transactions (for example, on testnet) without changing the UI.
Environment Variables
All necessary variables are listed in .env.example.
Basic:
WALLET_PUBLIC_KEY
TOKEN_ADDRESS
TOKEN_DECIMALS
ETHERSCAN_API_KEY
How to run
npm install
npm run dev