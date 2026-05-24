// ZIYOKOR NONLARI — UI Components
window.ZN = window.ZN || {};

ZN.ui = {
  toast: null,
  init(){
    this.toast = document.getElementById('toast');
  },
  toast(msg, duration=3000){
    const el = this.toast;
    el.textContent = msg; el.classList.add('show');
    clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('show'), duration);
  },
  showModal(html){
    document.getElementById('modalContent').innerHTML = html;
    document.getElementById('modalOverlay').classList.add('active');
  },
  closeModal(){
    document.getElementById('modalOverlay').classList.remove('active');
  },
  confirm(title, msg, onConfirm, confirmText='Ha', cancelText='Yo\'q'){
    this.showModal(`
      <div class="modal-header"><span class="modal-title">${title}</span></div>
      <p style="color:var(--text-dim);font-size:0.85rem;margin-bottom:20px">${msg}</p>
      <div style="display:flex;gap:10px">
        <button class="btn btn-ghost btn-block" onclick="ZN.ui.closeModal()">${cancelText}</button>
        <button class="btn btn-primary btn-block" onclick="ZN.ui.closeModal();(${onConfirm.toString()})()">${confirmText}</button>
      </div>`);
  },
  prompt(title, placeholder, onConfirm, inputType='text'){
    this.showModal(`
      <div class="modal-header"><span class="modal-title">${title}</span></div>
      <input id="promptInput" type="${inputType}" placeholder="${placeholder}" style="margin-bottom:16px" autofocus>
      <div style="display:flex;gap:10px">
        <button class="btn btn-ghost btn-block" onclick="ZN.ui.closeModal()">Bekor qilish</button>
        <button class="btn btn-primary btn-block" onclick="const v=document.getElementById('promptInput').value;ZN.ui.closeModal();if(v)(${onConfirm.toString()})(v)">Tasdiqlash</button>
      </div>`);
    setTimeout(()=>document.getElementById('promptInput')?.focus(),100);
  },
  select(title, options, onSelect){
    this.showModal(`
      <div class="modal-header"><span class="modal-title">${title}</span></div>
      ${options.map((o,i)=>`<button class="btn btn-ghost btn-block" style="justify-content:flex-start;margin-bottom:4px;text-align:left" onclick="ZN.ui.closeModal();(${onSelect.toString()})('${o.id}','${ZN.util.escJs(o.name)}')">${o.icon||''} ${o.name}</button>`).join('')}
      <button class="btn btn-ghost btn-block" style="margin-top:4px" onclick="ZN.ui.closeModal()">Bekor qilish</button>`);
  },
  loading(show=true){
    if(show){
      this.showModal('<div style="text-align:center;padding:40px"><div style="font-size:3rem;margin-bottom:12px;animation:pulse 1.5s infinite">🍞</div><p style="color:var(--text-dim)">Yuklanmoqda...</p></div>');
    } else {
      this.closeModal();
    }
  },
  badge(text, type='gold'){
    return `<span class="badge badge-${type}">${text}</span>`;
  },
  statusBadge(text, status){
    return `<span class="status-badge status-${status}">${text}</span>`;
  },
  statCard(icon, num, label, opts=''){
    return `<div class="stat-card" ${opts}><div class="stat-icon">${icon}</div><div class="stat-num">${num}</div><div class="stat-label">${label}</div></div>`;
  },
  emptyState(icon, title, desc){
    return `<div class="empty-state"><span class="icon">${icon}</span><p>${title}</p><p class="hint">${desc}</p></div>`;
  },
  reviewStars(rating){
    return '<span class="review-stars">'+'★'.repeat(Math.floor(rating))+'☆'.repeat(5-Math.floor(rating))+'</span>';
  },
  productCard(p, onClick){
    const badgeColor = p.badge?.includes('Premium')?'gold':p.badge?.includes('Best')?'accent':p.badge?.includes('Organik')?'green':p.badge?.includes('Yangi')?'blue':'gold';
    return `<div class="prod-card" onclick="${onClick}">
      <div class="prod-img">${p.img||'🍞'}${p.badge?`<span class="badge badge-${badgeColor}">${p.badge}</span>`:''}</div>
      <div class="prod-info"><div class="prod-name">${p.name}</div><div class="prod-price">${p.price.toLocaleString()} <sub>so'm</sub></div></div>
    </div>`;
  },
  nav(logo, rightContent){
    return `<div class="nav"><div class="nav-logo">${logo}</div><div class="nav-info">${rightContent}</div></div>`;
  },
  tabBar(tabs, activeIdx=0){
    return `<div class="tab-bar">${tabs.map((t,i)=>`<button class="tab-btn ${i===activeIdx?'active':''}" onclick="ZN.app.switchTab(${i})">${t}</button>`).join('')}</div>`;
  },
  bottomNav(items, activeIdx=0){
    document.getElementById('bottomNav').innerHTML = `<div class="bottom-nav">${items.map((item,i)=>`<button class="nav-item ${i===activeIdx?'active':''}" onclick="ZN.app.switchTab(${i})"><span class="icon">${item.icon}</span>${item.label}${item.badge?'<span class="badge-dot"></span>':''}</button>`).join('')}</div>`;
  },
};
