// ZIYOKOR NONLARI — Core State & Engine
window.ZN = window.ZN || {};

ZN.util = {
  escJs(s){ return (s||'').replace(/'/g,"\\'").replace(/"/g,'&quot;'); },
  escHtml(s){ const d=document.createElement('div'); d.textContent=s; return d.innerHTML; },
  calcDist(lat1,lng1,lat2,lng2){
    const R=6371; const dLat=(lat2-lat1)*Math.PI/180; const dLng=(lng2-lng1)*Math.PI/180;
    const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
    return (R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))).toFixed(1);
  },
  timeAgo(ts){
    const diff=Date.now()-ts; const mins=Math.floor(diff/60000);
    if(mins<1)return 'hozir'; if(mins<60)return mins+' min';
    const hrs=Math.floor(mins/60); if(hrs<24)return hrs+' soat';
    return Math.floor(hrs/24)+' kun';
  },
  formatPhone(s){ return s.replace(/[^0-9+]/g,''); },
  generateId(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,7); },
  truncate(s,n=50){ return s.length>n?s.slice(0,n)+'...':s; },
};

// ====== APP STATE ======
ZN.state = {
  user: null,           // { id, name, phone, role, avatar }
  role: null,           // 'customer' | 'seller' | 'delivery' | 'admin'
  name: '',
  phone: '',
  bakeryName: '',
  vehicle: 'velo',
  uid: localStorage.getItem('zn_uid') || (()=>{const u='u'+Date.now().toString(36)+Math.random().toString(36).slice(2,8);localStorage.setItem('zn_uid',u);return u})(),
  currentTab: 0,
  cart: {},
  selectedBakeryId: null,
  favorites: new Set(),
  myLat: null,
  myLng: null,
  gpsWatchId: null,
  gpsActive: false,
  peerCount: 0,

  // P2P data
  bakeries: {},
  orders: {},
  myOrders: {},
  liveLocations: {},
  deliveryPeers: {},

  // Chat
  chatContact: null,
  chatMessages: {},
  chatUnread: {},

  // Payment
  paymentMethod: 'cash',

  // Initialized
  _init: false,
  _mapInstance: null,
  _mapMarkers: {},
  _deliveryLines: {},
};

ZN.gun = null;

// ====== INIT GUN ======
ZN.initGun = function(){
  if(ZN.gun) return ZN.gun;
  const IS_CAPACITOR = !!(window.Capacitor && window.Capacitor.isNativePlatform());
  const relay = IS_CAPACITOR ? null : (window.location.origin + '/gun');
  ZN.gun = Gun({ peers: relay ? [relay] : [], localStorage: true, radisk: true });

  ZN.gun.on('hi', p => { ZN.state.peerCount = Object.keys(Gun.peers||{}).length+1; ZN.updatePeerUI(); });
  ZN.gun.on('bye', p => { ZN.state.peerCount = Object.keys(Gun.peers||{}).length; ZN.updatePeerUI(); });

  return ZN.gun;
};

ZN.updatePeerUI = function(){
  const dot = document.getElementById('statusDot');
  const st = document.getElementById('peerStatus');
  if(!dot||!st) return;
  const online = ZN.state.peerCount > 0;
  dot.style.background = online ? '#4caf50' : '#666';
  dot.style.boxShadow = online ? '0 0 6px rgba(76,175,80,0.5)' : 'none';
  st.textContent = online ? ZN.state.peerCount+' peer(s)' : 'offline';
  st.style.color = online ? '#4caf50' : 'var(--text-dim)';
};

// ====== GPS ======
ZN.startGps = function(){
  if(ZN.state.gpsWatchId !== null) return;
  if(!navigator.geolocation){ ZN.ui.toast('⚠️ GPS qo\'llab-quvvatlanmaydi'); return; }
  ZN.state.gpsWatchId = navigator.geolocation.watchPosition(pos => {
    ZN.state.myLat = pos.coords.latitude;
    ZN.state.myLng = pos.coords.longitude;
    ZN.state.gpsActive = true;
    if(ZN.gun && ZN.state.role){
      ZN.gun.get('locations').get(ZN.state.uid).put({
        lat: ZN.state.myLat, lng: ZN.state.myLng, role: ZN.state.role,
        name: ZN.state.name, bakery: ZN.state.bakeryName, online: true, updatedAt: Date.now()
      });
      if(ZN.state.role === 'seller'){
        ZN.gun.get('bakeries').get(ZN.state.uid).get('location').put({ lat: ZN.state.myLat, lng: ZN.state.myLng });
      }
    }
    ZN.renderGpsBar();
  }, err => { ZN.state.gpsActive = false; ZN.renderGpsBar(); }, { enableHighAccuracy: true, timeout: 5000, maximumAge: 3000 });
};

ZN.stopGps = function(){
  if(ZN.state.gpsWatchId !== null){ navigator.geolocation.clearWatch(ZN.state.gpsWatchId); ZN.state.gpsWatchId = null; }
  ZN.state.gpsActive = false;
  if(ZN.gun) ZN.gun.get('locations').get(ZN.state.uid).put({ online: false, updatedAt: Date.now() });
  ZN.renderGpsBar();
};

ZN.renderGpsBar = function(){
  const el = document.getElementById('gpsBar');
  if(!el||!ZN.state.role) return;
  if(ZN.state.gpsActive && ZN.state.myLat && ZN.state.myLng){
    el.className = 'gps-bar';
    el.innerHTML = `<span class="pulse"></span><span>📍 ${ZN.state.myLat.toFixed(5)}, ${ZN.state.myLng.toFixed(5)}</span><span style="margin-left:auto;font-size:0.6rem;opacity:0.6">${ZN.state.myLat.toFixed(2)}°N, ${ZN.state.myLng.toFixed(2)}°E</span>`;
  } else {
    el.className = 'gps-bar off';
    el.innerHTML = `<span class="pulse"></span><span>📍 GPS: ${ZN.state.gpsWatchId!==null?'kutilyapti...':'faol emas'}</span><button class="btn btn-sm btn-ghost" style="margin-left:auto;padding:2px 10px;font-size:0.6rem" onclick="ZN.startGps()">Yoqish</button>`;
  }
};

// ====== LOCATIONS SUBSCRIPTION ======
ZN.subscribeLocations = function(){
  if(!ZN.gun) return;
  ZN.gun.get('locations').map().on((loc, id) => {
    if(loc && loc.lat && loc.lng) ZN.state.liveLocations[id] = { ...loc, id };
  });
};
