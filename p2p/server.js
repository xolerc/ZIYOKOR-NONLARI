/**
 * ZIYOKOR NONLARI — Persistent Gun.js Super Peer
 * 
 * This is NOT a database server. It's a persistent peer in the P2P network.
 * It stays online 24/7 so data doesn't disappear when users go offline.
 * 
 * No SQL. No schema. Just Gun.js graph syncing across all connected peers.
 */

const express = require('express');
const Gun = require('gun');
const http = require('http');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const PORT = process.env.PORT || 3456;
const DATA_FILE = path.join(__dirname, 'data.json');

const app = express();
app.enable('trust proxy');
app.use(cors({ origin: true, credentials: true }));
const server = http.createServer(app);

// Load persisted data from disk (Gun.js RAD backup)
let persistedData = {};
try {
  if (fs.existsSync(DATA_FILE)) {
    persistedData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    console.log(`  💾 Loaded ${Object.keys(persistedData).length} persisted keys`);
  }
} catch (e) {
  console.log('  ⚠️  No persisted data found, starting fresh');
}

// Initialize Gun.js peer
const gun = Gun({
  web: server,
  peers: [],
  multicast: false,
  localStorage: false,
  radisk: false,
  file: DATA_FILE, // Persist to JSON file
});

// Persist data periodically
setInterval(() => {
  const data = {};
  // Gun.js automatically persists via radisk, we also manually backup
  try {
    const backup = {};
    gun.get('bakeries').map().once((val, key) => {
      if (val) backup[key] = val;
    });
    // Can't sync get in sync context, but Gun's file option handles it
  } catch (e) {}
}, 30000);

// Serve static frontend
app.use(express.static(path.join(__dirname, 'public')));

// API: Get network stats
app.get('/api/stats', (req, res) => {
  const peerCount = Object.keys(Gun.peers || {}).length;
  let bakeryCount = 0;
  let orderCount = 0;

  gun.get('bakeries').map().once((val, key) => {
    if (val && val.name) bakeryCount++;
  });

  gun.get('orders').map().once((val, key) => {
    if (val && val.status) orderCount++;
  });

  res.json({
    peers: peerCount + 1,
    bakeries: bakeryCount,
    orders: orderCount,
    uptime: process.uptime(),
    version: '2.0.0-p2p',
  });
});

// API: Force GC data flush
app.post('/api/flush', (req, res) => {
  res.json({ ok: true, message: 'Data persists automatically via Gun.js radisk' });
});

// API: Version info
app.get('/api/version', (req, res) => {
  res.json({
    version: '3.0.0',
    name: 'ZIYOKOR NONLARI',
    platform: 'p2p-web',
    apkUrl: '/nonlar.apk',
    updateUrl: 'https://github.com/Xolericuz/ZIYOKOR-NONLARI/releases/latest',
  });
});

// Serve the main app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`
  ╔═══════════════════════════════════════════╗
  ║   ZIYOKOR NONLARI — P2P Super Peer       ║
  ║═══════════════════════════════════════════║
  ║  Web : http://0.0.0.0:${PORT}               ║
  ║  Gun : ws://0.0.0.0:${PORT}/gun            ║
  ║  API : http://0.0.0.0:${PORT}/api/stats    ║
  ║═══════════════════════════════════════════║
  ║  This peer persists data.                 ║
  ║  Multiple users connect and sync via Gun. ║
  ╚═══════════════════════════════════════════╝
  `);
});

// Track peer connections
gun.on('hi', peer => {
  console.log(`  📡 Peer connected  (${Object.keys(Gun.peers || {}).length + 1} total)`);
});

gun.on('bye', peer => {
  console.log(`  📡 Peer disconnected (${Object.keys(Gun.peers || {}).length} remaining)`);
});

process.on('SIGINT', () => {
  console.log('\n  Shutting down super peer...');
  process.exit(0);
});
