// ZIYOKOR NONLARI — Admin Views
ZN.admin = {
  monitor(){
    const active = Object.values(ZN.state.orders).filter(o => o.status !== 'delivered' && o.status !== 'rejected');
    const revenue = Object.values(ZN.state.orders).reduce((s,o) => s + (o.total||0), 0);
    const users = Object.values(ZN.state.liveLocations);
    return `
      <div class="section-title">\u{1F4CA} Admin monitor</div>
      <div class="section-sub">Platformani boshqarish</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px">
        ${[['\u{1F465}',Object.keys(ZN.state.bakeries).length+users.length,'Foydalanuvchilar'],['\u{1F3EA}',Object.keys(ZN.state.bakeries).length,'Nonvoyxonalar'],['\u{1F69A}',users.filter(u=>u.role==='delivery').length,'Yetkazuvchilar'],['\u{1F4E6}',active.length,'Faol buyurtma'],['\u{1F4B0}',revenue.toLocaleString(),'Jami daromad'],['\u{1F4E1}',ZN.state.peerCount,'Peerlar']].map(s=>`
          <div class="stat-card"><div class="stat-icon">${s[0]}</div><div class="stat-num">${s[1]}</div><div class="stat-label">${s[2]}</div></div>`).join('')}
      </div>
      <div class="section-title" style="font-size:0.9rem">\u{1F7E2} Jonli buyurtmalar</div>
      <div class="section-sub">${active.length} ta faol</div>
      ${!active.length?'<div style="color:var(--text-dim);padding:20px 0;font-size:0.85rem">Faol buyurtma yoq</div>':
        active.map(o=>`<div class="card" style="margin-bottom:6px;padding:12px">
          <div style="display:flex;justify-content:space-between;font-size:0.72rem">
            <span>#${o.id.slice(-5)} · ${o.customerName||'\u2014'} \u2192 ${o.bakeryName||'\u2014'}</span>
            <span class="status-badge status-${o.status}" style="font-size:0.55rem">${o.status}</span>
          </div>
          <div style="font-size:0.65rem;color:var(--text-dim)">${(o.items||[]).map(i=>`${i.name||i.productName} x${i.qty||i.quantity}`).join(', ')} · ${(o.total||0).toLocaleString()} som</div>
          <div style="font-size:0.6rem;color:var(--text-dim);margin-top:2px">\u{1F4CD} ${o.address||'\u2014'} · ${o.paymentMethod||'Naqd'}</div>
        </div>`).join('')}
    `;
  },

  users(){
    const users = Object.values(ZN.state.liveLocations);
    const customerCount = users.filter(u=>u.role==='customer').length;
    return `
      <div class="section-title">\u{1F465} Foydalanuvchilar</div>
      <div class="section-sub">${Object.keys(ZN.state.bakeries).length} nonvoy · ${users.filter(u=>u.role==='delivery').length} yetkazuvchi · ${customerCount} xaridor</div>
      <div style="font-size:0.85rem;color:var(--text-bright);margin-bottom:8px;font-weight:600">\u{1F3EA} Nonvoyxonalar</div>
      ${Object.keys(ZN.state.bakeries).length===0?'<div style="color:var(--text-dim);font-size:0.78rem;padding:12px 0">Nonvoyxona yoq</div>':
        Object.values(ZN.state.bakeries).map(b=>`<div class="card" style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px;margin-bottom:6px">
          <div><div style="font-size:0.78rem;color:var(--text-bright)">\u{1F3EA} ${b.name}</div><div style="font-size:0.62rem;color:var(--text-dim)">${b.owner} · ${b.phone||'\u2014'}${b.products?' · '+(b.products.length||0)+' ta non':''}</div></div>
          <span class="status-badge ${b.online?'status-accepted':'status-rejected'}">${b.online?'\u{1F7E2} Online':'\u{1F534} Offline'}</span>
        </div>`).join('')}
      <div style="font-size:0.85rem;color:var(--text-bright);margin:12px 0 8px;font-weight:600">\u{1F69A} Yetkazuvchilar</div>
      ${users.filter(u=>u.role==='delivery').length===0?'<div style="color:var(--text-dim);font-size:0.78rem;padding:12px 0">Yetkazuvchi yoq</div>':
        users.filter(u=>u.role==='delivery').map(d=>`<div class="card" style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px;margin-bottom:6px">
          <div><div style="font-size:0.78rem;color:var(--text-bright)">\u{1F69A} ${d.name}</div><div style="font-size:0.62rem;color:var(--text-dim)">${d.phone||'\u2014'} · ${d.vehicle||'velo'}</div></div>
          <span style="font-size:0.6rem;color:${d.online?'var(--green)':'var(--red)'}">${d.online?'\u{1F7E2} Online':'\u{1F534} Offline'}</span>
        </div>`).join('')}
      <div style="font-size:0.85rem;color:var(--text-bright);margin:12px 0 8px;font-weight:600">\u{1F6D2} Xaridorlar</div>
      <div class="card" style="padding:14px;text-align:center;color:var(--text-dim);font-size:0.78rem">Xaridorlar buyurtma berganda royxatda korinadi</div>
    `;
  },
};
