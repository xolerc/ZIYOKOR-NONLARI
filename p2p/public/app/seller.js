// ZIYOKOR NONLARI — Seller Views
ZN.seller = {
  dashboard(){
    const active = Object.values(ZN.state.myOrders).filter(o => o.status !== 'delivered' && o.status !== 'rejected');
    const revenue = Object.values(ZN.state.myOrders).reduce((s,o) => s + (o.total||0), 0);
    const customers = Object.values(ZN.state.liveLocations).filter(l => l.role === 'customer' && l.online);
    const deliveryFolks = Object.values(ZN.state.liveLocations).filter(l => l.role === 'delivery' && l.online);
    return `
      <div class="section-title">\u{1F4CA} ${ZN.state.bakeryName||'Nonvoyxona'}</div>
      <div class="section-sub">\u{1F3EA} ${Object.keys(ZN.state.bakeries).length+1} nonvoy · \u{1F6D2} ${customers.length} xaridor · \u{1F69A} ${deliveryFolks.length} yetkazuvchi</div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px">
        ${[['\u{1F4E6}',Object.keys(ZN.state.myOrders).length,'Jami buyurtma'],['\u{1F4B0}',revenue.toLocaleString(),'Daromad (som)'],['\u{1F7E2}',active.length,'Faol buyurtma'],['\u{1F6D2}',customers.length,'Xaridor online']].map(s=>`
          <div class="stat-card"><div class="stat-num">${s[0]} ${s[1]}</div><div class="stat-label">${s[2]}</div></div>`).join('')}
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">
        ${customers.slice(0,5).map(c=>'<button class="btn btn-sm btn-ghost" style="padding:2px 10px;font-size:0.6rem" onclick="ZN.chat.openChat(\''+c.id+'\',\'\u{1F6D2} '+c.name+'\')">\u{1F4AC} '+c.name+'</button>').join('')}
        ${deliveryFolks.slice(0,3).map(d=>'<button class="btn btn-sm btn-ghost" style="padding:2px 10px;font-size:0.6rem" onclick="ZN.chat.openChat(\''+d.id+'\',\'\u{1F69A} '+d.name+'\')">\u{1F4AC} '+d.name+'</button>').join('')}
      </div>
      <div style="font-size:0.85rem;color:var(--text-bright);margin-bottom:10px;font-weight:600">\u{1F7E2} Jonli buyurtmalar</div>
      ${active.length===0?ZN.ui.emptyState('\u23F3','Hali buyurtma yoq','Xaridorlar buyurtma berganda shu yerda korinadi'):active.map(o=>ZN.seller.orderCard(o,true)).join('')}
    `;
  },

  products(){
    const prods = ZN.state.bakeries[ZN.state.uid]?.products||[];
    return `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <div><div class="section-title">\u{1F96E} Nonlarim</div><div class="section-sub">${prods.length} ta non</div></div>
        <button class="btn btn-primary btn-sm" onclick="ZN.seller.addProduct()">+ Non qoshish</button>
      </div>
      ${prods.length===0?ZN.ui.emptyState('\u{1F96E}','Non qoshilmagan','"Non qoshish" tugmasini bosing'):`
        <div class="grid-2">${prods.map(p=>`
          <div class="card" style="padding:12px;position:relative">
            <button onclick="ZN.seller.removeProduct(${p.id})" style="position:absolute;top:6px;right:6px;background:none;border:none;color:var(--red);font-size:0.9rem;cursor:pointer">\u2715</button>
            <div style="width:100%;aspect-ratio:1;border-radius:8px;background:linear-gradient(135deg,#1a1006,#2a1a0a);display:flex;align-items:center;justify-content:center;font-size:2.5rem">\u{1F96E}</div>
            <div class="prod-name">${p.name}</div>
            <div class="prod-price">${p.price.toLocaleString()} <sub>som</sub></div>
          </div>`).join('')}</div>`}
    `;
  },

  addProduct(){
    ZN.ui.prompt('\u{1F96E} Non nomi','Non nomi',(name)=>{
      ZN.ui.prompt('\u{1F4B5} Narxi (som)','Narx',(priceStr)=>{
        const price = parseInt(priceStr);
        if(isNaN(price)||price<500){ ZN.ui.toast('\u26A0\uFE0F Narx notogri'); return; }
        const prods = ZN.state.bakeries[ZN.state.uid]?.products||[];
        prods.push({id:Date.now(),name,price,desc:'',img:'\u{1F96E}'});
        ZN.gun.get('bakeries').get(ZN.state.uid).get('products').put(prods);
        ZN.ui.toast('\u2705 '+name+' qoshildi');
      },'number');
    });
  },

  removeProduct(id){
    let prods = ZN.state.bakeries[ZN.state.uid]?.products||[];
    prods = prods.filter(p=>p.id!==id);
    ZN.gun.get('bakeries').get(ZN.state.uid).get('products').put(prods);
    ZN.app.render();
  },

  orders(){
    const all = Object.values(ZN.state.myOrders);
    return `
      <div class="section-title">\u{1F4E6} Barcha buyurtmalar</div>
      <div class="section-sub">${all.length} ta buyurtma</div>
      ${all.length===0?ZN.ui.emptyState('\u{1F4E6}','Buyurtmalar yoq','Yangi buyurtma kelganda shu yerda korinadi'):all.reverse().map(o=>ZN.seller.orderCard(o,false)).join('')}
    `;
  },

  orderCard(o, showActions){
    const items = (o.items||[]).map(i=>`${i.name||i.productName} x${i.qty||i.quantity}`).join(', ');
    const sm = {pending:'\u{1F7E1} Kutilmoqda',accepted:'\u{1F535} Qabul qilindi',baking:'\u{1F7E0} Tayyorlanmoqda',ready:'\u2705 Tayyor',delivering:'\u{1F7E2} Yetkazilmoqda',delivered:'\u2705 Yetkazildi',rejected:'\u{1F534} Bekor qilindi'};
    return `<div class="card order-card ${o.status}" style="margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px">
        <span style="font-size:0.62rem;color:var(--text-dim)">#${o.id.slice(-5)} · ${o.customerName||'Xaridor'}</span>
        <span class="status-badge status-${o.status}">${sm[o.status]||o.status}</span>
      </div>
      <div style="font-size:0.8rem;color:var(--text);margin-bottom:4px">${items||'\u2014'}</div>
      <div style="font-size:0.78rem;font-weight:600;color:var(--gold);margin-bottom:4px">${(o.total||0).toLocaleString()} som</div>
      <div style="font-size:0.65rem;color:var(--text-dim);margin-bottom:4px">\u{1F4CD} ${o.address||'\u2014'} · \u{1F4DE} ${o.customerPhone||'\u2014'} · ${o.paymentMethod||'Naqd'}</div>
      <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:4px">
        ${o.customerId?'<button class="btn btn-sm btn-ghost" style="padding:2px 8px;font-size:0.6rem" onclick="ZN.chat.openChat(\''+o.customerId+'\',\'\u{1F6D2} '+(o.customerName||'Xaridor')+'\')">\u{1F4AC} Xaridor</button>':''}
        ${o.deliveryId?'<button class="btn btn-sm btn-ghost" style="padding:2px 8px;font-size:0.6rem" onclick="ZN.chat.openChat(\''+o.deliveryId+'\',\'\u{1F69A} '+(o.deliveryName||'Yetkazuvchi')+'\')">\u{1F4AC} Yetkazuvchi</button>':''}
      </div>
      ${showActions?ZN.seller.orderActions(o):''}
    </div>`;
  },

  orderActions(o){
    const actions = {
      pending: '<button class="btn btn-success btn-sm" onclick="ZN.seller.updateOrder(\''+o.id+'\',\'accepted\')">\u2705 Qabul qilish</button><button class="btn btn-danger btn-sm" onclick="ZN.seller.updateOrder(\''+o.id+'\',\'rejected\')">\u274C Rad etish</button>',
      accepted: '<button class="btn btn-primary btn-sm" onclick="ZN.seller.updateOrder(\''+o.id+'\',\'baking\')">\u{1F525} Tayyorlanmoqda</button>',
      baking: '<button class="btn btn-primary btn-sm" onclick="ZN.seller.updateOrder(\''+o.id+'\',\'ready\')">\u2705 Tayyor</button>',
      ready: '<span style="font-size:0.7rem;color:var(--gold)">\u2705 Tayyor · Yetkazuvchi kutilmoqda</span>',
      delivering: '<span style="font-size:0.72rem;color:var(--green)">\u{1F69A} '+(o.deliveryName||'Yetkazilmoqda')+'</span>',
      delivered: '<span style="font-size:0.72rem;color:var(--green)">\u2705 Yetkazildi</span>',
      rejected: '<span style="font-size:0.72rem;color:var(--red)">\u274C Bekor qilindi</span>',
    };
    return actions[o.status] ? '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px">'+actions[o.status]+'</div>' : '';
  },

  updateOrder(orderId, status){
    const order = ZN.state.orders[orderId] || ZN.state.myOrders[orderId];
    if(!order) return;
    order.status = status;
    if(ZN.gun) ZN.gun.get('orders').get(orderId).get('status').put(status);
    ZN.app.render();
    const msgs = {accepted:'\u2705 Buyurtma qabul qilindi',rejected:'\u274C Rad etildi',baking:'\u{1F7E0} Tayyorlanmoqda',ready:'\u2705 Tayyor'};
    ZN.ui.toast(msgs[status]||status);
  },

  settings(){
    return ZN.settings.view();
  },
};
