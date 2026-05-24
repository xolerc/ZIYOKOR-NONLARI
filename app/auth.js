// ZIYOKOR NONLARI — Authentication
ZN.auth = {
  step: 'phone', // phone | otp | profile
  phone: '',
  otpCode: '',

  show(){
    this.step = 'phone'; this.phone = ''; this.otpCode = '';
    this.renderPhone();
  },

  renderPhone(){
    ZN.app.render(`
      <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px">
        <div style="width:100%;max-width:400px;text-align:center">
          <div style="font-size:4rem;margin-bottom:12px">🍞</div>
          <h1 style="font-size:1.8rem;font-weight:800;color:var(--text-bright);margin-bottom:4px">ZIYOKOR <span style="color:var(--gold)">NONLARI</span></h1>
          <p style="color:var(--text-dim);font-size:0.82rem;margin-bottom:30px">Non marketplace platformasi</p>
          <div class="card" style="text-align:left;padding:24px">
            <label>Telefon raqam</label>
            <input id="authPhone" type="tel" placeholder="+998 XX XXX XX XX" style="margin-bottom:12px;font-size:1.1rem" value="+998" autofocus>
            <button class="btn btn-primary btn-block btn-lg" onclick="ZN.auth.sendOtp()">Davom etish →</button>
            <p style="color:var(--text-dim);font-size:0.62rem;margin-top:12px;text-align:center">SMS orqali kod yuboriladi</p>
          </div>
          <div style="margin-top:24px;display:flex;gap:8px;justify-content:center;font-size:0.65rem;color:var(--text-dim)">
            <button class="btn btn-ghost btn-sm" onclick="ZN.auth.quickLogin('customer')">🛒 Xaridor</button>
            <button class="btn btn-ghost btn-sm" onclick="ZN.auth.quickLogin('seller')">🏪 Nonvoy</button>
            <button class="btn btn-ghost btn-sm" onclick="ZN.auth.quickLogin('delivery')">🚚 Yetkazuvchi</button>
            <button class="btn btn-ghost btn-sm" onclick="ZN.auth.quickLogin('admin')">⚙️ Admin</button>
          </div>
        </div>
      </div>`);
    setTimeout(()=>{
      const inp = document.getElementById('authPhone');
      if(inp) inp.focus();
    },100);
  },

  quickLogin(role){
    ZN.state.role = role;
    ZN.state.name = role==='seller'?'Raximjon':role==='delivery'?'Akmal':role==='admin'?'Xoleric':'Xaridor';
    ZN.state.phone = '+998993921157';
    ZN.state.bakeryName = role==='seller'?'ZIYOKOR Nonlari':'';
    ZN.state.vehicle = role==='delivery'?'moto':'velo';
    this.completeLogin();
  },

  sendOtp(){
    const phone = document.getElementById('authPhone')?.value?.trim();
    if(!phone||phone.length<9){ ZN.ui.toast('⚠️ Telefon raqamni to\'liq kiriting'); return; }
    this.phone = phone;
    ZN.ui.toast('✅ SMS kod yuborildi: 1234');
    this.renderOtp();
  },

  renderOtp(){
    ZN.app.render(`
      <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px">
        <div style="width:100%;max-width:400px;text-align:center">
          <div style="font-size:3rem;margin-bottom:12px">📱</div>
          <h2 style="font-size:1.3rem;font-weight:700;color:var(--text-bright);margin-bottom:4px">SMS kodni kiriting</h2>
          <p style="color:var(--text-dim);font-size:0.8rem;margin-bottom:20px">${this.phone} raqamiga kod yuborildi</p>
          <div class="otp-input">
            ${[0,1,2,3].map(i=>`<input type="text" maxlength="1" id="otp${i}" class="otp-digit" inputmode="numeric" pattern="[0-9]" autocomplete="off">`).join('')}
          </div>
          <button class="btn btn-primary btn-block btn-lg" onclick="ZN.auth.verifyOtp()" style="margin-bottom:8px">Tasdiqlash</button>
          <button class="btn btn-ghost btn-block" onclick="ZN.auth.renderPhone()">Orqaga</button>
        </div>
      </div>`);
    setTimeout(()=>{
      document.getElementById('otp0')?.focus();
      document.querySelectorAll('.otp-digit').forEach((inp,i,arr)=>{
        inp.addEventListener('input',e=>{if(e.target.value&&i<arr.length-1)arr[i+1].focus();});
        inp.addEventListener('keydown',e=>{if(e.key==='Backspace'&&!e.target.value&&i>0)arr[i-1].focus();});
      });
    },100);
  },

  verifyOtp(){
    const code = [0,1,2,3].map(i=>document.getElementById('otp'+i)?.value||'').join('');
    if(code.length<4){ ZN.ui.toast('⚠️ Kodni to\'liq kiriting'); return; }
    ZN.ui.toast('✅ Telefon tasdiqlandi');
    this.renderRoleSelect();
  },

  renderRoleSelect(){
    ZN.app.render(`
      <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px">
        <div style="width:100%;max-width:400px;text-align:center">
          <div style="font-size:3rem;margin-bottom:12px">👤</div>
          <h2 style="font-size:1.3rem;font-weight:700;color:var(--text-bright);margin-bottom:4px">Profilingizni yarating</h2>
          <p style="color:var(--text-dim);font-size:0.8rem;margin-bottom:20px">Kim sifatida kirishni xohlaysiz?</p>
          <div class="card" style="text-align:left;padding:24px">
            <label>Rolni tanlang</label>
            <select id="regRole" style="margin-bottom:12px" onchange="ZN.auth.toggleFields()">
              <option value="customer">🛒 Xaridor</option>
              <option value="seller">🏪 Nonvoy (sotuvchi)</option>
              <option value="delivery">🚚 Yetkazib beruvchi</option>
              <option value="admin">⚙️ Administrator</option>
            </select>
            <label>Ismingiz</label>
            <input id="regName" placeholder="Ismingiz" style="margin-bottom:12px">
            <div id="regBakeryField" style="display:none;margin-bottom:12px">
              <label>Nonvoyxona nomi</label>
              <input id="regBakery" placeholder="Nonvoyxona nomi">
            </div>
            <div id="regVehicleField" style="display:none;margin-bottom:12px">
              <label>Transport turi</label>
              <select id="regVehicle">
                <option value="velo">🚲 Velosiped</option>
                <option value="moto">🏍 Mototsikl</option>
                <option value="car">🚗 Mashina</option>
                <option value="foot">🚶 Piyoda</option>
              </select>
            </div>
            <button class="btn btn-primary btn-block btn-lg" onclick="ZN.auth.completeRegistration()">Kirish →</button>
          </div>
          <button class="btn btn-ghost" style="margin-top:12px" onclick="ZN.auth.renderPhone()">Orqaga</button>
        </div>
      </div>`);
    this.toggleFields();
  },

  toggleFields(){
    const role = document.getElementById('regRole')?.value;
    document.getElementById('regBakeryField').style.display = role==='seller'?'block':'none';
    document.getElementById('regVehicleField').style.display = role==='delivery'?'block':'none';
  },

  completeRegistration(){
    const role = document.getElementById('regRole')?.value;
    const name = document.getElementById('regName')?.value?.trim();
    const bakery = document.getElementById('regBakery')?.value?.trim()||'';
    const vehicle = document.getElementById('regVehicle')?.value||'velo';
    if(!name){ ZN.ui.toast('⚠️ Ismingizni kiriting'); return; }
    if(role==='seller'&&!bakery){ ZN.ui.toast('⚠️ Nonvoyxona nomini kiriting'); return; }
    ZN.state.role = role;
    ZN.state.name = name;
    ZN.state.phone = this.phone;
    ZN.state.bakeryName = bakery;
    ZN.state.vehicle = vehicle;
    this.completeLogin();
  },

  completeLogin(){
    ZN.state.uid = localStorage.getItem('zn_uid') || ZN.state.uid;
    ZN.initGun();
    ZN.subscribeLocations();
    ZN.chat.subscribe();

    // Role init
    const gun = ZN.gun;
    if(ZN.state.role==='seller'){
      gun.get('bakeries').get(ZN.state.uid).put({
        id: ZN.state.uid, name: ZN.state.bakeryName, owner: ZN.state.name,
        phone: ZN.state.phone, status:'open', joinedAt:Date.now(), online:true, role:'seller'
      });
      gun.get('orders').map().on((order,orderId)=>{
        if(order&&order.bakeryId===ZN.state.uid){ ZN.state.orders[orderId]={...order,id:orderId}; ZN.state.myOrders[orderId]={...order,id:orderId}; ZN.app.render(); if(order.status==='pending') ZN.ui.toast(`🆕 #${orderId.slice(-5)} yangi buyurtma`); }
      });
    } else if(ZN.state.role==='customer'){
      gun.get('bakeries').map().on((bakery,id)=>{ if(bakery&&bakery.name){ ZN.state.bakeries[id]={...bakery,id}; ZN.app.render(); }});
      gun.get('orders').map().on((order,orderId)=>{ if(order&&order.customerId===ZN.state.uid){ ZN.state.orders[orderId]={...order,id:orderId}; ZN.state.myOrders[orderId]={...order,id:orderId}; ZN.app.render(); }});
    } else if(ZN.state.role==='delivery'){
      gun.get('delivery').get(ZN.state.uid).put({id:ZN.state.uid,name:ZN.state.name,phone:ZN.state.phone,vehicle:ZN.state.vehicle,online:true,busy:false});
      gun.get('orders').map().on((order,orderId)=>{ if(order){ if(order.deliveryId===ZN.state.uid||order.status==='ready'||order.status==='delivering'){ ZN.state.myOrders[orderId]={...order,id:orderId}; ZN.state.orders[orderId]={...order,id:orderId}; ZN.app.render(); }}});
    } else {
      gun.get('bakeries').map().on((bakery,id)=>{ if(bakery&&bakery.name){ ZN.state.bakeries[id]={...bakery,id}; ZN.app.render(); }});
      gun.get('orders').map().on((order,orderId)=>{ if(order){ ZN.state.orders[orderId]={...order,id:orderId}; ZN.app.render(); }});
    }
    ZN.startGps();
    ZN.app.init();
  },
};
