// ZIYOKOR NONLARI — Cart & Payment
ZN.cart = {
  show(){
    const items = Object.values(ZN.state.cart);
    if(!items.length){ ZN.ui.toast('⚠️ Savat bo\'sh'); return; }
    const total = items.reduce((s,i) => s + i.price*i.qty, 0);
    const methods = ZN.PAYMENT_METHODS;
    ZN.ui.showModal(`
      <div class="modal-header">
        <span class="modal-title">🛒 Savat · ${items[0].bakeryName||''}</span>
        <button class="btn btn-ghost btn-sm" onclick="ZN.ui.closeModal()">✕</button>
      </div>
      ${items.map(i=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--glass-border)">
        <div><span style="font-size:0.85rem;color:var(--text-bright)">${i.name}</span><span style="color:var(--text-dim);font-size:0.7rem;margin-left:6px">x${i.qty}</span></div>
        <div style="display:flex;align-items:center;gap:8px">
          <button class="btn btn-ghost btn-sm" style="padding:2px 8px;font-size:0.7rem" onclick="ZN.cart.updateQty(${i.id},-1)">−</button>
          <span style="font-size:0.85rem;color:var(--gold);font-weight:600;min-width:60px;text-align:right">${(i.price*i.qty).toLocaleString()}</span>
          <button class="btn btn-ghost btn-sm" style="padding:2px 8px;font-size:0.7rem" onclick="ZN.cart.updateQty(${i.id},1)">+</button>
        </div>
      </div>`).join('')}
      <div style="display:flex;justify-content:space-between;font-size:1rem;font-weight:700;color:var(--gold);padding:12px 0;border-top:1px solid var(--glass-border);margin-top:4px">
        <span>Jami</span><span>${total.toLocaleString()} so'm</span>
      </div>
      <label style="margin-top:8px">Yetkazish manzili</label>
      <textarea id="cartAddress" rows="2" style="margin-top:4px;min-height:50px" placeholder="Manzilni kiriting">${ZN.state.user?.address||''}</textarea>
      <div style="font-size:0.6rem;color:var(--text-dim);margin-top:4px">📍 GPS joylashuv avtomatik yuboriladi</div>
      <h4 style="font-size:0.82rem;color:var(--text-bright);margin:12px 0 8px">💳 To'lov usuli</h4>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">
        ${methods.map(m=>`<button class="btn ${ZN.state.paymentMethod===m.id?'btn-primary':'btn-ghost'} btn-sm" onclick="ZN.state.paymentMethod='${m.id}';ZN.ui.closeModal();ZN.cart.show()">${m.icon} ${m.name}</button>`).join('')}
      </div>
      <button class="btn btn-primary btn-block btn-lg" onclick="ZN.cart.checkout()">📦 Buyurtma berish</button>
      <p style="font-size:0.6rem;color:var(--text-dim);margin-top:8px;text-align:center">${ZN.state.paymentMethod==='cash'?'💵 To\'lov yetkazib berishda':ZN.state.paymentMethod==='click'?'🔵 Click orqali to\'lov':'💳 Onlayn to\'lov'}</p>`);
  },

  updateQty(productId, delta){
    const item = ZN.state.cart[productId];
    if(!item) return;
    item.qty += delta;
    if(item.qty <= 0){ delete ZN.state.cart[productId]; }
    this.show();
  },

  checkout(){
    const address = document.getElementById('cartAddress')?.value?.trim();
    if(!address){ ZN.ui.toast('⚠️ Manzilni kiriting'); return; }
    const items = Object.values(ZN.state.cart);
    const total = items.reduce((s,i) => s + i.price*i.qty, 0);
    const orderId = 'ord_'+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
    const order = {
      id: orderId,
      bakeryId: ZN.state.selectedBakeryId||items[0]?.bakeryId||'unknown',
      bakeryName: items[0]?.bakeryName||'Nonvoy',
      customerId: ZN.state.uid,
      customerName: ZN.state.name,
      customerPhone: ZN.state.phone,
      customerLat: ZN.state.myLat,
      customerLng: ZN.state.myLng,
      items: items.map(i => ({productId: i.id, name: i.name, qty: i.qty, price: i.price})),
      total, address, status: 'pending', createdAt: Date.now(),
      paymentMethod: ZN.state.paymentMethod,
      paymentStatus: ZN.state.paymentMethod==='cash'?'pending':'pending',
    };
    if(ZN.gun){
      ZN.gun.get('orders').get(orderId).put(order);
      if(order.bakeryId) ZN.gun.get('bakeries').get(order.bakeryId).get('orders').get(orderId).put(order);
    }
    ZN.state.myOrders[orderId] = {...order, id: orderId};
    ZN.state.orders[orderId] = {...order, id: orderId};
    ZN.state.cart = {};
    ZN.state.selectedBakeryId = null;
    ZN.ui.closeModal();
    ZN.ui.toast('🎉 Buyurtma qabul qilindi!');
    setTimeout(()=>ZN.app.switchTab(2), 300);
  },

  fab(){
    const count = Object.values(ZN.state.cart).reduce((s,i)=>s+i.qty,0);
    const existing = document.getElementById('cartFab');
    if(count===0){ if(existing) existing.remove(); return; }
    if(!existing){
      const fab = document.createElement('button');
      fab.id = 'cartFab'; fab.className = 'fab';
      fab.innerHTML = `🛒<span class="count">${count}</span>`;
      fab.onclick = ()=>ZN.cart.show();
      document.body.appendChild(fab);
    } else {
      existing.innerHTML = `🛒<span class="count">${count}</span>`;
    }
  },
};
