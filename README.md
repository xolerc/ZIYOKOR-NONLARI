# ZIYOKOR NONLARI 🍞

## Two Architecture Versions

### 1. Server-based (production) → `/apps/`
Full-stack monorepo with NestJS + Next.js + PostgreSQL + Redis + Docker

### 2. P2P Decentralized (futuristic) → `/p2p/`
Zero-server peer-to-peer marketplace using Gun.js

---

## P2P Architecture (v2 — Decentralized)

```
┌───────────────────────────────────────────────────────┐
│               ZIYOKOR NONLARI — P2P MARKETPLACE        │
│                                                       │
│  ┌──────────┐     ┌───────────┐     ┌──────────┐     │
│  │ NONVOY   │◄───►│ RELAY     │◄───►│ XARIDOR  │     │
│  │ (seller) │     │ (discovery│     │(customer)│     │
│  └──────────┘     │ only)     │     └──────────┘     │
│                   └───────────┘                      │
│                                                       │
│  Gun.js Graph Database (P2P sync)                    │
│  IndexedDB (local persistence)                        │
│  GPS-based bakery discovery                           │
│  Real-time P2P orders                                 │
└───────────────────────────────────────────────────────┘
```

### Quick Start (P2P)

```bash
cd p2p
npm install
node peer-relay.js     # Start P2P relay (terminal 1)
npx serve . -p 3000    # Serve app    (terminal 2)
# Open http://localhost:3000 in 2+ browser tabs
# Tab 1: Login as seller (nonvoy)
# Tab 2: Login as customer (xaridor)
```

### Features
- ✅ Zero central server
- ✅ Peer-to-peer data sync via Gun.js
- ✅ Offline-first with IndexedDB
- ✅ Real-time P2P order placement
- ✅ GPS-based bakery discovery
- ✅ Seller dashboard with live P2P orders

---

*v1: `/apps/` — NestJS + Next.js monorepo (server-based)*  
*v2: `/p2p/` — Gun.js decentralized (peer-to-peer)*

## 🔗 Rasmiy portfolio
Barcha XOLERIC loyihalari: **https://xolerc.github.io/mydrime/**
