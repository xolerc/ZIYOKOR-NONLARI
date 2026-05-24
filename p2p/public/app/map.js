// ZIYOKOR NONLARI — GPS Map (2D Leaflet + 3D Three.js)
let _3dActive = false;

ZN.map = {
  init(){
    if(_3dActive) return;
    if(ZN.state._mapInstance){
      ZN.state._mapInstance.invalidateSize();
      this.updateMarkers();
      return;
    }
    const container = document.getElementById('map');
    if(!container || container._leaflet_id) return;
    const pos = ZN.state.myLat&&ZN.state.myLng ? [ZN.state.myLat, ZN.state.myLng] : [41.2995, 69.2401];
    ZN.state._mapInstance = L.map('map', { center: pos, zoom: 13, zoomControl: true, attributionControl: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(ZN.state._mapInstance);
    this.updateMarkers();
  },

  center(){
    if(ZN.state._mapInstance && ZN.state.myLat && ZN.state.myLng)
      ZN.state._mapInstance.setView([ZN.state.myLat, ZN.state.myLng], 14);
  },

  toggle3D(){
    _3dActive = !_3dActive;
    if(_3dActive){
      // Switch to 3D
      const mapCont = document.getElementById('map');
      if(!mapCont) return;
      if(ZN.state._mapInstance){ ZN.state._mapInstance.remove(); ZN.state._mapInstance = null; }
      mapCont.innerHTML = '';
      mapCont.style.background = 'transparent';
      if(window.ThreeMap){
        window.ThreeMap.init(mapCont);
        // Add existing bakeries as 3D buildings
        Object.values(ZN.state.bakeries).forEach(b => {
          if(b.location) window.ThreeMap.addBakery(b.location.lat, b.location.lng, b.name);
        });
        // Add live delivery cars
        Object.values(ZN.state.liveLocations).forEach(l => {
          if(l.role === 'delivery' && l.online) window.ThreeMap.addCar(l.lat, l.lng, 0xff6600);
        });
      }
    } else {
      // Switch back to 2D
      if(window.ThreeMap) window.ThreeMap.destroy();
      const mapCont = document.getElementById('map');
      if(mapCont) mapCont.innerHTML = '';
      ZN.state._mapInstance = null;
      setTimeout(() => { ZN.map.init(); ZN.map.updateMarkers(); }, 100);
    }
  },

  updateMarkers(){
    const map = ZN.state._mapInstance;
    if(!map || _3dActive) return;

    const activeIds = new Set(Object.keys(ZN.state.liveLocations));
    activeIds.add(ZN.state.uid);

    Object.keys(ZN.state._mapMarkers).forEach(id => {
      if(!activeIds.has(id)){ map.removeLayer(ZN.state._mapMarkers[id]); delete ZN.state._mapMarkers[id]; }
    });

    if(ZN.state.myLat && ZN.state.myLng)
      this._updateMarker(ZN.state.uid, ZN.state.myLat, ZN.state.myLng, 'me', ZN.state.name);

    Object.values(ZN.state.liveLocations).forEach(loc => {
      if(loc.id !== ZN.state.uid && loc.online)
        this._updateMarker(loc.id, loc.lat, loc.lng, loc.role, loc.name);
    });

    Object.values(ZN.state.myOrders).forEach(o => {
      if((o.status==='delivering'||o.status==='ready') && o.deliveryId && ZN.state.liveLocations[o.deliveryId]){
        const delLoc = ZN.state.liveLocations[o.deliveryId];
        const customerLoc = o.customerLat&&o.customerLng ? [o.customerLat, o.customerLng] : null;
        const bakeryLoc = ZN.state.bakeries[o.bakeryId]?.location;
        if(ZN.state._deliveryLines[o.id]) map.removeLayer(ZN.state._deliveryLines[o.id]);
        const pts = [];
        if(bakeryLoc) pts.push([bakeryLoc.lat, bakeryLoc.lng]);
        if(delLoc.lat&&delLoc.lng) pts.push([delLoc.lat, delLoc.lng]);
        if(customerLoc) pts.push(customerLoc);
        if(pts.length>=2)
          ZN.state._deliveryLines[o.id] = L.polyline(pts, {color:'#ffa726',weight:3,opacity:0.7,dashArray:'8,8'}).addTo(map);
      }
    });
  },

  _updateMarker(id, lat, lng, mRole, mName){
    const map = ZN.state._mapInstance;
    const isMe = id === ZN.state.uid;
    const colors = { seller:'#d4a574', customer:'#42a5f5', delivery:'#ab47bc', me:'#4caf50' };
    const c = isMe ? colors.me : (colors[mRole]||'#666');
    const label = isMe ? `${ZN.state.name} (siz)` : `${mName||'User'} ${mRole==='delivery'?'🚚':mRole==='seller'?'🏪':'🛒'}`;
    const icon = L.divIcon({
      html: `<div style="background:${c};width:${isMe?18:14}px;height:${isMe?18:14}px;border-radius:50%;border:3px solid rgba(255,255,255,0.8);box-shadow:0 2px 8px rgba(0,0,0,0.5)"></div>`,
      iconSize: isMe?[18,18]:[14,14], iconAnchor: isMe?[9,9]:[7,7], className:''
    });
    if(ZN.state._mapMarkers[id]){ ZN.state._mapMarkers[id].setLatLng([lat,lng]); }
    else { ZN.state._mapMarkers[id] = L.marker([lat,lng],{icon}).bindPopup(`<b>${label}</b>`).addTo(map); }
  },

  view(title){
    if(!_3dActive) setTimeout(()=>this.init(), 100);
    const roleCounts = {seller:0,customer:0,delivery:0};
    Object.values(ZN.state.liveLocations).forEach(l=>{if(l.online&&l.role)roleCounts[l.role]++;});
    return `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <div><div class="section-title">${title||'🗺 Jonli xarita'}</div><div class="section-sub">Real-time P2P GPS joylashuvlar</div></div>
        <div style="display:flex;gap:6px">
          <button class="btn btn-sm ${_3dActive?'btn-gold':'btn-ghost'}" onclick="ZN.map.toggle3D()" title="3D ko‘rinish">3D</button>
          <button class="btn btn-sm ${ZN.state.gpsActive?'btn-success':'btn-ghost'}" onclick="ZN.map.center()" title="Markazga">🎯</button>
        </div>
      </div>
      <div class="legend">
        <div class="legend-item"><span class="legend-dot seller"></span>Nonvoy (${roleCounts.seller})</div>
        <div class="legend-item"><span class="legend-dot customer"></span>Xaridor (${roleCounts.customer})</div>
        <div class="legend-item"><span class="legend-dot delivery"></span>Yetkazuvchi (${roleCounts.delivery})</div>
        <div class="legend-item"><span class="legend-dot me"></span>Siz</div>
        ${_3dActive ? '<div class="legend-item" style="color:var(--gold)">🎮 3D rejim — sichqoncha bilan aylantiring</div>' : ''}
      </div>
      <div id="map" style="${_3dActive ? 'height:500px;border-radius:16px;overflow:hidden' : ''}"></div>
      <div id="mapPeers" style="margin-top:6px;font-size:0.6rem;color:var(--text-dim)"></div>`;
  },

  deliveryMiniMap(){
    const mini = document.getElementById('deliveryMiniMap');
    if(!mini || mini._leaflet_id) return;
    const pos = ZN.state.myLat&&ZN.state.myLng ? [ZN.state.myLat,ZN.state.myLng] : [41.2995,69.2401];
    const m = L.map('deliveryMiniMap', {center:pos,zoom:13,zoomControl:false,attributionControl:false});
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom:19}).addTo(m);
    if(ZN.state.myLat&&ZN.state.myLng)
      L.marker([ZN.state.myLat,ZN.state.myLng],{icon:L.divIcon({html:'<div style="background:#ab47bc;width:16px;height:16px;border-radius:50%;border:3px solid #fff"></div>',iconSize:[16,16],iconAnchor:[8,8],className:''})}).addTo(m);
    Object.values(ZN.state.myOrders).forEach(o=>{
      if(o.status==='delivering'||o.status==='ready'){
        const bakeryLoc = ZN.state.bakeries[o.bakeryId]?.location;
        if(bakeryLoc) L.marker([bakeryLoc.lat,bakeryLoc.lng],{icon:L.divIcon({html:'<div style="background:var(--gold);width:12px;height:12px;border-radius:50%;border:2px solid #fff"></div>',iconSize:[12,12],iconAnchor:[6,6],className:''})}).bindPopup(`<b>🏪 ${o.bakeryName}</b>`).addTo(m);
        if(o.customerLat&&o.customerLng){
          L.marker([o.customerLat,o.customerLng],{icon:L.divIcon({html:'<div style="background:var(--blue);width:12px;height:12px;border-radius:50%;border:2px solid #fff"></div>',iconSize:[12,12],iconAnchor:[6,6],className:''})}).bindPopup(`<b>🛒 ${o.customerName}</b>`).addTo(m);
          if(ZN.state.myLat&&ZN.state.myLng) L.polyline([[ZN.state.myLat,ZN.state.myLng],[o.customerLat,o.customerLng]],{color:'#ab47bc',weight:2,dashArray:'5,5'}).addTo(m);
        }
      }
    });
    setTimeout(()=>m.invalidateSize(),200);
  },
};

setInterval(()=>{ if(ZN.state._mapInstance&&ZN.state.role) ZN.map.updateMarkers(); }, 3000);
