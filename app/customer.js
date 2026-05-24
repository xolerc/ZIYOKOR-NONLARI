// ZIYOKOR NONLARI — Customer Views
ZN.customer = {
  products(){
    const ids = Object.keys(ZN.state.bakeries).filter(id => ZN.state.bakeries[id]?.products?.length);
    if(!ids.length) return ZN.ui.emptyState('\u{1F50D}','Tarmoqda nonvoy topilmadi','P2P tarmoqqa ulangan nonvoy bolishi kerak');
    return `
      <div class="section-title">\u{1F96E} Nonlar</div>
      <div class="section-sub">${ids.length} ta nonvoy · P2P tarmoq</div>
      ${ids.map(bId=>{
        const b = ZN.state.bakeries[bId]; const prods = b.products||[];
        const dist = b.location&&ZN.state.myLat&&ZN.state.myLng ? ZN.util.calcDist(ZN.state.myLat,ZN.state.myLng,b.location.lat,b.location.lng) : null;
        return `<div class="card" style="margin-bottom:14px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <div>
              <div style="font-size:0.9rem;font-weight:600;color:var(--text-bright)">\u{1F3EA} ${b.name}</div>
              <div style="font-size:0.65rem;color:var(--text-dim)">${b.owner}${dist?' · \u{1F4CD} '+dist+' km':''}</div>
            </div>
            <button class="btn btn-sm btn-ghost" onclick="ZN.chat.openChat('${bId}','\u{1F3EA} ${ZN.util.escJs(b.name)}')" style="font-size:0.7rem">\u{1F4AC}</button>
          </div>
          <div class="grid-2">${prods.map(p=>{
            const inCart = ZN.state.cart[p.id];
            return `<div class="prod-card" onclick="ZN.cart.add('${bId}','${ZN.util.escJs(b.name)}',${p.id},'${ZN.util.escJs(p.name)}',${p.price})">
              <div class="prod-img">${p.img||'\u{1F96E}'}${p.badge?'<span class="badge badge-gold">'+p.badge+'</span>':''}</div>
              <div class="prod-info">
                <div class="prod-name">${p.name}</div>
                <div class="prod-price">${p.price.toLocaleString()} <sub>som</sub></div>
                ${inCart?'<div style="font-size:0.6rem;color:var(--green);margin-top:2px">\u2705 Savatda: '+inCart.qty+'</div>':''}
              </div>
            </div>`;
          }).join('')}</div>
        </div>`;
      }).join('')}
    `;
  },

  bakeries(){
    const ids = Object.keys(ZN.state.bakeries);
    if(!ids.length) return ZN.ui.emptyState('\u{1F4CD}','Nonvoyxona topilmadi','P2P tarmoqqa ulanish kerak');
    let sorted = ids.map(id=>({...ZN.state.bakeries[id],id}));
    if(ZN.state.myLat&&ZN.state.myLng){
      sorted.forEach(b=>{if(b.location)b.dist=parseFloat(ZN.util.calcDist(ZN.state.myLat,ZN.state.myLng,b.location.lat,b.location.lng));});
      sorted.sort((a,b)=>(a.dist||999)-(b.dist||999));
    }
    const deliveryFolks = Object.values(ZN.state.liveLocations).filter(l=>l.role==='delivery'&&l.online);
    return `
      <div class="section-title">\u{1F4CD} Nonvoyxonalar</div>
      <div class="section-sub">${ids.length} ta nonvoy · ${deliveryFolks.length} ta yetkazuvchi</div>
      ${sorted.map(b=>{
        return `<div class="card" style="display:flex;align-items:center;gap:12px;margin-bottom:8px;padding:14px">
          <div class="avatar" style="width:44px;height:44px;border-radius:12px;font-size:1.2rem">\u{1F3EA}</div>
          <div style="flex:1">
            <div style="font-size:0.85rem;font-weight:600;color:var(--text-bright)">${b.name}</div>
            <div style="font-size:0.65rem;color:var(--text-dim)">${b.owner} · \u2B50 ${b.rating}${b.location?' · \u{1F4CD} '+b.location.lat?.toFixed(4)+','+b.location.lng?.toFixed(4):''}${b.dist?' · \u{1F6B6} '+b.dist+' km':''}</div>
          </div>
          <button class="btn btn-sm btn-ghost" onclick="ZN.chat.openChat('${b.id}','\u{1F3EA} ${ZN.util.escJs(b.name)}')" style="font-size:0.7rem">\u{1F4AC}</button>
          <span class="badge ${b.status==='open'?'badge-green':'badge-red'}">${b.status==='open'?'\u{1F513} Ochiq':'\u{1F512} Yopiq'}</span>
        </div>`;
      }).join('')}
      ${deliveryFolks.length?`
        <div class="section-title" style="font-size:0.9rem;margin-top:16px">\u{1F69A} Yetkazuvchilar</div>
        ${deliveryFolks.map(d=>{
          const dist=ZN.state.myLat&&ZN.state.myLng&&d.lat&&d.lng?ZN.util.calcDist(ZN.state.myLat,ZN.state.myLng,d.lat,d.lng)+' km':'';
          return `<div class="card" style="display:flex;align-items:center;gap:12px;margin-bottom:6px;padding:12px 14px">
            <div class="avatar" style="width:40px;height:40px;border-radius:10px;font-size:1rem">\u{1F69A}</div>
            <div style="flex:1"><div style="font-size:0.82rem;color:var(--text-bright)">${d.name}</div><div style="font-size:0.62rem;color:var(--text-dim)">${dist?'\u{1F4CD} '+dist:''}</div></div>
            <button class="btn btn-sm btn-ghost" onclick="ZN.chat.openChat('${d.id}','\u{1F69A} ${ZN.util.escJs(d.name)}')" style="font-size:0.7rem">\u{1F4AC}</button>
          </div>`;
        }).join('')}
      `:''}
    `;
  },

  orders(){
    const userOrders = Object.values(ZN.state.myOrders).filter(o=>o.customerId===ZN.state.uid);
    const sm = {pending:'\u{1F7E1} Kutilmoqda',accepted:'\u{1F535} Qabul qilindi',baking:'\u{1F7E0} Tayyorlanmoqda',ready:'\u2705 Tayyor',delivering:'\u{1F7E2} Yetkazilmoqda',delivered:'\u2705 Yetkazildi',rejected:'\u{1F534} Bekor qilindi'};
    return `
      <div class="section-title">\u{1F4E6} Buyurtmalarim</div>
      <div class="section-sub">${userOrders.length} ta buyurtma</div>
      ${!userOrders.length?ZN.ui.emptyState('\u{1F4E6}','Buyurtmalar yoq','Nonlardan tanlab buyurtma bering'):userOrders.reverse().map(o=>`
        <div class="card order-card ${o.status}" style="margin-bottom:8px">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px">
            <span style="font-size:0.62rem;color:var(--text-dim)">#${o.id.slice(-5)} · ${o.bakeryName||'Nonvoy'}</span>
            <span class="status-badge status-${o.status}">${sm[o.status]||o.status}</span>
          </div>
          <div style="font-size:0.78rem;color:var(--text);margin-bottom:4px">${(o.items||[]).map(i=>`${i.name||i.productName} x${i.qty||i.quantity}`).join(', ')}</div>
          <div style="font-size:0.75rem;font-weight:600;color:var(--gold)">${(o.total||0).toLocaleString()} som</div>
          <div style="font-size:0.6rem;color:var(--text-dim);margin-bottom:4px">\u{1F4CD} ${o.address||'—'} · ${o.paymentMethod||'Naqd'}</div>
          <div style="display:flex;gap:4px;flex-wrap:wrap">
            ${o.bakeryId?'<button class="btn btn-sm btn-ghost" style="padding:2px 8px;font-size:0.6rem" onclick="ZN.chat.openChat(\''+o.bakeryId+'\',\'\u{1F3EA} '+(o.bakeryName||'Nonvoy')+'\')">\u{1F4AC} Nonvoy</button>':''}
            ${o.deliveryId?'<button class="btn btn-sm btn-ghost" style="padding:2px 8px;font-size:0.6rem" onclick="ZN.chat.openChat(\''+o.deliveryId+'\',\'\u{1F69A} '+(o.deliveryName||'Yetkazuvchi')+'\')">\u{1F4AC} Yetkazuvchi</button>':''}
          </div>
          ${o.status==='delivering'&&o.deliveryId?'<div style="font-size:0.62rem;color:var(--green);margin-top:4px">\u{1F69A} '+o.deliveryName+' yetkazmoqda</div>':''}
          ${o.status==='delivered'?'<div style="font-size:0.62rem;color:var(--text-dim);margin-top:6px"><button class="btn btn-sm btn-ghost" onclick="ZN.customer.rateOrder(\''+o.id+'\')">\u2B50 Baholash</button></div>':''}
        </div>`).join('')}
    `;
  },

  rateOrder(orderId){
    ZN.ui.showModal(`
      <div class="modal-title" style="margin-bottom:12px">\u2B50 Buyurtmani baholash</div>
      <p style="color:var(--text-dim);font-size:0.8rem;margin-bottom:12px">Buyurtmangizni baholang</p>
      <div id="ratingStars" style="font-size:2rem;text-align:center;margin-bottom:16px;cursor:pointer">
        ${[1,2,3,4,5].map(i=>'<span class="rating-input" data-rating="'+i+'" onclick="ZN.customer.setRating('+i+')">\u2B50</span>').join('')}
      </div>
      <textarea id="reviewText" rows="2" placeholder="Izoh qoldirish..." style="margin-bottom:12px;min-height:50px"></textarea>
      <button class="btn btn-primary btn-block" onclick="ZN.ui.toast('\u2705 Baholash uchun rahmat!');ZN.ui.closeModal()">Yuborish</button>
    `);
  },

  setRating(rating){
    document.querySelectorAll('.rating-input').forEach((el,i)=>{
      el.style.color = i < rating ? 'var(--gold)' : 'var(--text-dim)';
    });
  },
};

ZN.cart.add = function(bakeryId, bakeryName, productId, productName, price){
  ZN.state.selectedBakeryId = bakeryId;
  if(ZN.state.cart[productId]) ZN.state.cart[productId].qty++;
  else ZN.state.cart[productId] = {id: productId, name: productName, price, qty: 1, bakeryId, bakeryName};
  ZN.ui.toast('\u2705 '+productName+' savatga qoshildi');
};
