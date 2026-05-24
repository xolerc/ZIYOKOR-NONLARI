// ZIYOKOR NONLARI — Main Application
ZN.app = {
  init(){
    ZN.ui.init();
    document.getElementById('modalOverlay').addEventListener('click', e => { if(e.target === e.currentTarget) ZN.ui.closeModal(); });

    this.render();
    this.initFabs();

    // Auto-update delivery mini map
    setInterval(() => {
      const mini = document.getElementById('deliveryMiniMap');
      if(mini && !mini._leaflet_id && ZN.state.role === 'delivery' && ZN.state.currentTab === 2){
        ZN.map.deliveryMiniMap();
      }
    }, 2000);
  },

  switchTab(idx){
    ZN.state.currentTab = idx;
    document.querySelectorAll('.tab-btn').forEach((t,i) => t.classList.toggle('active', i === idx));
    this.render();
  },

  render(content){
    const app = document.getElementById('app');
    if(content){ app.innerHTML = content; return; }
    if(!ZN.state.role){ ZN.auth.show(); return; }

    const tabs = this.getTabs();
    const tabBar = ZN.ui.tabBar(tabs.map(t=>t.icon), ZN.state.currentTab);
    document.querySelector('.tab-bar')?.replaceWith ??
      (() => { const old = document.querySelector('.tab-bar'); if(old) old.remove(); document.querySelector('.nav').insertAdjacentHTML('afterend', tabBar); })();

    this.renderContent(app);
    this.injectGpsBar(app);
    this.initBottomNav();
  },

  getTabs(){
    if(ZN.state.role === 'seller') return [
      {icon:'\u{1F4CA}',label:'Boshqaruv',view:()=>ZN.seller.dashboard()},
      {icon:'\u{1F96E}',label:'Nonlarim',view:()=>ZN.seller.products()},
      {icon:'\u{1F4E6}',label:'Buyurtmalar',view:()=>ZN.seller.orders()},
      {icon:'\u{1F5FA}',label:'Xarita',view:()=>ZN.map.view('\u{1F5FA} Xarita')},
      {icon:'\u2699\uFE0F',label:'Sozlamalar',view:()=>this.settings()},
    ];
    if(ZN.state.role === 'customer') return [
      {icon:'\u{1F96E}',label:'Nonlar',view:()=>ZN.customer.products()},
      {icon:'\u{1F4CD}',label:'Nonvoyxona',view:()=>ZN.customer.bakeries()},
      {icon:'\u{1F4E6}',label:'Buyurtmalar',view:()=>ZN.customer.orders()},
      {icon:'\u{1F5FA}',label:'Xarita',view:()=>ZN.map.view('\u{1F5FA} Xarita')},
      {icon:'\u2699\uFE0F',label:'Sozlamalar',view:()=>this.settings()},
    ];
    if(ZN.state.role === 'delivery') return [
      {icon:'\u{1F4E6}',label:'Yetkazish',view:()=>ZN.delivery.orders()},
      {icon:'\u{1F5FA}',label:'Xarita',view:()=>ZN.map.view('\u{1F5FA} Xarita')},
      {icon:'\u{1F4CD}',label:'Mening joyim',view:()=>ZN.delivery.myLocation()},
      {icon:'\u2699\uFE0F',label:'Sozlamalar',view:()=>this.settings()},
    ];
    return [
      {icon:'\u{1F4CA}',label:'Monitor',view:()=>ZN.admin.monitor()},
      {icon:'\u{1F465}',label:'Foydalanuvchilar',view:()=>ZN.admin.users()},
      {icon:'\u{1F5FA}',label:'Xarita',view:()=>ZN.map.view('\u{1F5FA} Xarita')},
      {icon:'\u2699\uFE0F',label:'Sozlamalar',view:()=>this.settings()},
    ];
  },

  renderContent(app){
    const tabs = this.getTabs();
    if(ZN.state.currentTab < tabs.length){
      app.innerHTML = tabs[ZN.state.currentTab].view();
    }
  },

  injectGpsBar(app){
    if(document.getElementById('gpsBar')) return;
    const target = app.querySelector('.section-title, .stats-grid, .card, .empty-state');
    if(target){
      const bar = document.createElement('div'); bar.id = 'gpsBar'; bar.className = 'gps-bar off';
      bar.innerHTML = '<span class="pulse"></span><span>\u{1F4CD} GPS faol emas</span>';
      target.parentNode.insertBefore(bar, target);
      ZN.renderGpsBar();
    }
  },

  initBottomNav(){
    const tabs = this.getTabs();
    ZN.ui.bottomNav(tabs.map((t,i)=>({
      icon: t.icon,
      label: t.label,
      badge: i===2 && ZN.state.role==='seller' && Object.values(ZN.state.myOrders).filter(o=>o.status==='pending').length > 0,
    })), ZN.state.currentTab);
  },

  initFabs(){
    // Remove existing FABs
    document.querySelectorAll('.fab, #chatFab, #chatFabContainer').forEach(el => el.remove());

    // Chat FAB (all roles)
    const chatFab = document.createElement('button');
    chatFab.id = 'chatFab'; chatFab.className = 'fab';
    chatFab.style.bottom = '150px';
    chatFab.innerHTML = '\u{1F4AC}<span class="count"></span>';
    chatFab.onclick = ()=>ZN.chat.showContacts();
    document.body.appendChild(chatFab);

    // Cart FAB periodically updated
    setInterval(()=>ZN.cart.fab(), 1000);
    setInterval(()=>ZN.chat.updateBadge(), 2000);
  },

  settings(){
    const roleLabels = {customer:'\u{1F6D2} Xaridor',seller:'\u{1F3EA} Nonvoy',delivery:'\u{1F69A} Yetkazib beruvchi',admin:'\u2699\uFE0F Admin'};
    const totalPeers = Object.keys(ZN.state.liveLocations).filter(k=>ZN.state.liveLocations[k].online).length+1;
    return `
      <div class="section-title">\u2699\uFE0F Sozlamalar</div>
      <div class="section-sub">Ilova haqida va yangilanishlar</div>
      <div class="card" style="margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <span style="font-size:0.85rem;color:var(--text-bright);font-weight:600">\u{1F4F1} ZIYOKOR NONLARI</span>
          <span class="badge badge-blue">v3.0.0</span>
        </div>
        <div style="font-size:0.7rem;color:var(--text-dim);line-height:1.8">
          <div>\u{1F464} Siz: <span style="color:var(--text-bright)">${ZN.state.name}</span> · ${roleLabels[ZN.state.role]||ZN.state.role}</div>
          <div>\u{1F4DE} ${ZN.state.phone}</div>
          <div>\u{1F4E1} Peerlar: ${totalPeers} ta online</div>
          ${ZN.state.myLat&&ZN.state.myLng?'<div>\u{1F4CD} GPS: '+ZN.state.myLat.toFixed(4)+', '+ZN.state.myLng.toFixed(4)+'</div>':'<div>\u{1F4CD} GPS: <span style="color:var(--red)">faol emas</span></div>'}
          ${ZN.state.bakeryName?'<div>\u{1F3EA} '+ZN.state.bakeryName+'</div>':''}
          ${ZN.state.vehicle?'<div>\u{1F69A} Transport: '+ZN.state.vehicle+'</div>':''}
        </div>
      </div>
      <div class="card" style="margin-bottom:12px">
        <div style="font-size:0.85rem;color:var(--text-bright);font-weight:600;margin-bottom:10px">\u{1F4E5} Yangilanishlar</div>
        <button class="btn btn-primary btn-block" onclick="ZN.app.checkUpdate()" style="margin-bottom:8px">\u{1F504} Yangilanishni tekshirish</button>
        <button class="btn btn-success btn-block" onclick="ZN.app.downloadApk()">\u2B07\uFE0F APK yuklash (4.9 MB)</button>
        <p style="font-size:0.6rem;color:var(--text-dim);text-align:center;margin-top:8px">Android 6+ uchun</p>
      </div>
      <div class="card" style="margin-bottom:12px">
        <div style="font-size:0.85rem;color:var(--text-bright);font-weight:600;margin-bottom:10px">\u{1F5C4} Tarmoq</div>
        <div style="font-size:0.7rem;color:var(--text-dim);line-height:1.8">
          <div>\u{1F517} Relay: ${window.location.origin}/gun</div>
          <div>\u{1F194} ID: <span style="font-family:monospace;font-size:0.6rem">${ZN.state.uid}</span></div>
          <div style="margin-top:8px">
            <button class="btn btn-ghost btn-sm" onclick="ZN.app.logout()">\u{1F6AA} Chiqish</button>
          </div>
        </div>
      </div>
      <div style="text-align:center;padding:20px 0;font-size:0.6rem;color:var(--text-dim)">
        <div>ZIYOKOR NONLARI v3.0.0</div>
        <div style="margin-top:2px">P2P \u00B7 GPS \u00B7 Powered by Gun.js</div>
      </div>
    `;
  },

  logout(){
    ZN.ui.confirm('\u{1F6AA} Chiqish','Haqiqatan chiqmoqchimisiz?',()=>{
      ZN.stopGps();
      ZN.state.role = null; ZN.state.name = ''; ZN.state.phone = '';
      ZN.state.bakeryName = ''; ZN.state.cart = {}; ZN.state.myOrders = {};
      ZN.state.orders = {}; ZN.state.bakeries = {};
      document.querySelectorAll('.fab, #chatFab, #chatFabContainer, #cartFab, .bottom-nav').forEach(el => el?.remove());
      ZN.auth.show();
    });
  },

  checkUpdate(){
    ZN.ui.toast('\u{1F504} Tekshirilmoqda...');
    fetch('https://api.github.com/repos/Xolericuz/ZIYOKOR-NONLARI/releases/latest')
      .then(r=>r.json()).then(d=>{ZN.ui.toast((d.tag_name||'')>'v3.0.0'?'\u{1F4E5} Yangi versiya mavjud!':'\u2705 Eng songgi versiya');})
      .catch(()=>fetch('./version.json?_='+Date.now()).then(r=>r.json()).then(d=>ZN.ui.toast(d.version>'3.0.0'?'\u{1F4E5} Yangi versiya':'\u2705 Eng songgi')).catch(()=>ZN.ui.toast('\u26A0\uFE0F Tekshirib bolmadi')));
  },

  downloadApk(){
    const link = document.createElement('a'); link.href = 'nonlar.apk'; link.download = 'ziyokor-nonlari.apk';
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    ZN.ui.toast('\u{1F4E5} Yuklab olish boshlandi');
  },
};

// ====== STARTUP ======
document.addEventListener('DOMContentLoaded', () => {
  ZN.app.render('\u{1F4CD} Yuklanmoqda...');
  ZN.auth.show();
});
