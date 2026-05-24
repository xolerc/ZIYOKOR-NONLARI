// ZIYOKOR NONLARI — Delivery Views
ZN.delivery = {
  orders(){
    const available = Object.values(ZN.state.orders).filter(o => o.status === 'ready');
    const myDeliveries = Object.values(ZN.state.myOrders).filter(o => o.deliveryId === ZN.state.uid && o.status !== 'delivered');
    return `
      <div class="section-title">\u{1F69A} Yetkazish</div>
      <div class="section-sub">${myDeliveries.length} ta faol · ${available.length} ta mavjud</div>
      ${available.length>0?`
        <div style="margin-bottom:14px">
          <div style="font-size:0.85rem;color:var(--text-bright);margin-bottom:8px;font-weight:600">\u{1F7E2} Olish mumkin</div>
          ${available.map(o=>`
            <div class="card" style="margin-bottom:8px;border-color:var(--green)">
              <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                <span style="font-size:0.62rem;color:var(--text-dim)">#${o.id.slice(-5)} · ${o.bakeryName} \u2192 ${o.customerName}</span>
                <span class="status-badge status-ready">tayyor</span>
              </div>
              <div style="font-size:0.75rem;color:var(--text);margin-bottom:4px">${(o.items||[]).map(i=>`${i.name||i.productName} x${i.qty||i.quantity}`).join(', ')}</div>
              <div style="font-size:0.72rem;color:var(--gold);margin-bottom:4px">${(o.total||0).toLocaleString()} som</div>
              <div style="font-size:0.62rem;color:var(--text-dim);margin-bottom:8px">\u{1F4CD} ${o.address||'\u2014'} · ${o.paymentMethod||'Naqd'}</div>
              <div style="display:flex;gap:4px;flex-wrap:wrap">
                <button class="btn btn-sm btn-ghost" style="padding:2px 8px;font-size:0.6rem" onclick="ZN.chat.openChat('${o.bakeryId}','\u{1F3EA} ${ZN.util.escJs(o.bakeryName||'Nonvoy')}')">\u{1F4AC}</button>
                <button class="btn btn-sm btn-ghost" style="padding:2px 8px;font-size:0.6rem" onclick="ZN.chat.openChat('${o.customerId}','\u{1F6D2} ${ZN.util.escJs(o.customerName||'Xaridor')}')">\u{1F4AC}</button>
                <button class="btn btn-success btn-sm" onclick="ZN.delivery.claim('${o.id}')">\u{1F69A} Olish</button>
              </div>
            </div>`).join('')}
        </div>
      `:''}
      <div style="font-size:0.85rem;color:var(--text-bright);margin-bottom:8px;font-weight:600">\u{1F4E6} Mening yetkazishlarim</div>
      ${myDeliveries.length===0?ZN.ui.emptyState('\u{1F69A}','Faol yetkazish yoq','Tayyor buyurtmalarni oling'):myDeliveries.map(o=>`
        <div class="card" style="margin-bottom:8px">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px">
            <span style="font-size:0.62rem;color:var(--text-dim)">#${o.id.slice(-5)} · ${o.bakeryName} \u2192 ${o.customerName}</span>
            <span class="status-badge status-${o.status}">${o.status}</span>
          </div>
          <div style="font-size:0.75rem;color:var(--text);margin-bottom:4px">${(o.items||[]).map(i=>`${i.name||i.productName} x${i.qty||i.quantity}`).join(', ')}</div>
          <div style="font-size:0.7rem;color:var(--gold);margin-bottom:4px">${(o.total||0).toLocaleString()} som</div>
          <div style="font-size:0.6rem;color:var(--text-dim);margin-bottom:6px">\u{1F4CD} ${o.address||'\u2014'} · \u{1F4DE} ${o.customerPhone||'\u2014'}</div>
          <div style="display:flex;gap:4px;flex-wrap:wrap">
            <button class="btn btn-sm btn-ghost" style="padding:2px 8px;font-size:0.6rem" onclick="ZN.chat.openChat('${o.bakeryId}','\u{1F3EA} ${ZN.util.escJs(o.bakeryName||'Nonvoy')}')">\u{1F4AC}</button>
            <button class="btn btn-sm btn-ghost" style="padding:2px 8px;font-size:0.6rem" onclick="ZN.chat.openChat('${o.customerId}','\u{1F6D2} ${ZN.util.escJs(o.customerName||'Xaridor')}')">\u{1F4AC}</button>
            ${o.status==='delivering'?'<button class="btn btn-success btn-sm" onclick="ZN.delivery.complete(\''+o.id+'\')">\u2705 Yetkazildi</button>':''}
          </div>
          ${o.status==='delivering'?'<div style="font-size:0.6rem;color:var(--blue);margin-top:4px"><button class="btn btn-sm btn-ghost" onclick="ZN.app.switchTab(1)">\u{1F5FA} Xaritada korish</button></div>':''}
        </div>`).join('')}
    `;
  },

  claim(orderId){
    const order = ZN.state.orders[orderId]; if(!order) return;
    order.status = 'delivering'; order.deliveryId = ZN.state.uid; order.deliveryName = ZN.state.name; order.deliveryPhone = ZN.state.phone;
    if(ZN.gun) ZN.gun.get('orders').get(orderId).put(order);
    ZN.state.myOrders[orderId] = {...order, id: orderId};
    ZN.ui.toast('\u{1F69A} #'+orderId.slice(-6)+' buyurtma olindi');
    ZN.app.render();
  },

  complete(orderId){
    const order = ZN.state.orders[orderId] || ZN.state.myOrders[orderId];
    if(!order) return;
    order.status = 'delivered';
    if(ZN.gun) ZN.gun.get('orders').get(orderId).get('status').put('delivered');
    ZN.ui.toast('\u2705 Yetkazildi');
    ZN.app.render();
  },

  myLocation(){
    return `
      <div class="section-title">\u{1F4CD} Mening joyim</div>
      <div class="section-sub">GPS malumotlari real-time P2P tarmoqqa yuboriladi</div>
      <div class="card" style="margin-bottom:12px">
        <div style="display:flex;gap:8px;align-items:center;margin-bottom:10px">
          <span class="badge badge-purple">\u{1F69A} Yetkazib beruvchi</span>
          <span style="color:var(--text-bright);font-size:0.85rem">${ZN.state.name}</span>
          <span style="color:var(--text-dim);font-size:0.7rem">${ZN.state.vehicle||'velo'}</span>
        </div>
        ${ZN.state.myLat&&ZN.state.myLng?`
          <div style="font-size:0.78rem;color:var(--text-dim);margin-bottom:8px">
            <div>Kenglik: <span style="font-family:monospace">${ZN.state.myLat.toFixed(6)}</span></div>
            <div>Uzunlik: <span style="font-family:monospace">${ZN.state.myLng.toFixed(6)}</span></div>
            <div style="margin-top:6px"><a href="https://www.openstreetmap.org/?mlat=${ZN.state.myLat}&mlon=${ZN.state.myLng}&zoom=15" target="_blank" style="color:var(--gold);font-size:0.7rem">\u{1F310} Ochiq xaritada korish</a></div>
          </div>
        `:'<div style="color:var(--text-dim);font-size:0.78rem">\u{1F4CD} GPS malumot olinmoqda...</div>'}
        <button class="btn ${ZN.state.gpsActive?'btn-danger':'btn-primary'} btn-sm" onclick="${ZN.state.gpsActive?'ZN.stopGps()':'ZN.startGps()'}" style="margin-top:6px">${ZN.state.gpsActive?'\u23F9 GPS toxtatish':'\u25B6 GPS yoqish'}</button>
      </div>
      <div id="deliveryMiniMap" style="width:100%;height:300px;border-radius:var(--radius);overflow:hidden;border:1px solid var(--glass-border)"></div>
    `;
  },
};
