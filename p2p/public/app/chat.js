// ZIYOKOR NONLARI — P2P Chat
ZN.chat = {
  contact: null,
  open: false,

  subscribe(){
    if(!ZN.gun) return;
    ZN.gun.get('chat_messages').map().on((msgs, roomId) => {
      if(!roomId||!roomId.includes(ZN.state.uid)||!msgs) return;
      const list = Object.values(msgs).filter(m => m && m.t);
      ZN.state.chatMessages[roomId] = list.sort((a,b) => (a.t||0) - (b.t||0));
      if(this.open) this.render();
      this.updateBadge();
    });
  },

  roomId(peerId){ return [ZN.state.uid, peerId].sort().join('_'); },

  openChat(peerId, peerName){
    this.contact = { id: peerId, name: peerName || 'Foydalanuvchi' };
    this.open = true;
    ZN.state.chatUnread[this.roomId(peerId)] = 0;
    ZN.ui.showModal(this.modalHtml());
    this.render();
  },

  modalHtml(){
    if(!this.contact) return '<div class="empty-state"><span class="icon">💬</span><p>Tanlanmagan</p></div>';
    const room = this.roomId(this.contact.id);
    const msgs = ZN.state.chatMessages[room] || [];
    const otherLoc = ZN.state.liveLocations[this.contact.id];
    const online = otherLoc?.online ? '🟢 Online' : '🔴 Offline';
    return `
      <div style="display:flex;flex-direction:column;height:60vh">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
          <div>
            <div style="font-weight:600;color:var(--text-bright);font-size:0.9rem">💬 ${ZN.util.escHtml(this.contact.name)}</div>
            <div style="font-size:0.6rem;color:var(--text-dim)">${online}</div>
          </div>
          <button class="btn btn-ghost btn-sm" onclick="ZN.chat.close()">✕</button>
        </div>
        <div id="chatMessages" style="flex:1;overflow-y:auto;padding:10px;background:var(--glass);border-radius:var(--radius);margin-bottom:8px;display:flex;flex-direction:column;gap:6px">
          ${msgs.length===0?'<div style="text-align:center;padding:20px;color:var(--text-dim);font-size:0.75rem">Xabarlar yo\'q</div>':msgs.map(m=>{
            const isMe=m.f===ZN.state.uid;
            const time=m.t?new Date(m.t).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):'';
            let content=ZN.util.escHtml(m.text||'');
            if(m.type==='image') content=`<img src="${m.data}" style="max-width:200px;border-radius:8px;cursor:pointer" onclick="window.open('${m.data}','_blank')" />`;
            if(m.type==='video') content=`<video src="${m.data}" controls style="max-width:200px;border-radius:8px"></video>`;
            return `<div style="display:flex;flex-direction:column;align-items:${isMe?'flex-end':'flex-start'}">
              <div style="background:${isMe?'var(--gold)':'var(--card)'};color:${isMe?'#000':'var(--text)'};padding:8px 12px;border-radius:12px;font-size:0.78rem;max-width:80%;word-break:break-word">${content}</div>
              <div style="font-size:0.5rem;color:var(--text-dim);margin-top:2px">${time}</div>
            </div>`;
          }).join('')}
        </div>
        <div style="display:flex;gap:6px">
          <button class="btn btn-ghost btn-sm" onclick="ZN.chat.attachImage()" style="font-size:1.1rem;padding:8px 10px">📷</button>
          <input id="chatInput" style="flex:1" placeholder="Xabar yozing..." onkeydown="if(event.key==='Enter')ZN.chat.send()" />
          <button class="btn btn-primary" onclick="ZN.chat.send()" style="padding:8px 16px">➤</button>
        </div>
      </div>`;
  },

  send(){
    const input = document.getElementById('chatInput');
    const text = input?.value?.trim();
    if(!text||!this.contact) return;
    input.value = '';
    const room = this.roomId(this.contact.id);
    const msgId = 'msg_'+Date.now().toString(36)+Math.random().toString(36).slice(2,4);
    ZN.gun.get('chat_messages').get(room).get(msgId).put({ f: ZN.state.uid, t: Date.now(), text, type: 'text' });
  },

  attachImage(){
    const input = document.createElement('input');
    input.type='file'; input.accept='image/*,video/*';
    input.onchange=e=>{
      const file=e.target.files[0]; if(!file) return;
      if(file.size>500000){ ZN.ui.toast('⚠️ Fayl juda katta (max 500KB)'); return; }
      const reader=new FileReader();
      reader.onload=ev=>{
        const room=this.roomId(this.contact.id);
        const msgId='msg_'+Date.now().toString(36)+Math.random().toString(36).slice(2,4);
        ZN.gun.get('chat_messages').get(room).get(msgId).put({ f:ZN.state.uid, t:Date.now(), text:file.name, type:file.type.startsWith('video/')?'video':'image', data:ev.target.result });
        ZN.ui.toast('📷 Yuborildi');
      };
      reader.readAsDataURL(file);
    };
    input.click();
  },

  render(){
    const container = document.getElementById('chatMessages');
    if(!container||!this.contact) return;
    const room = this.roomId(this.contact.id);
    container.innerHTML = (ZN.state.chatMessages[room]||[]).map(m=>{
      const isMe=m.f===ZN.state.uid;
      const time=m.t?new Date(m.t).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):'';
      let content=ZN.util.escHtml(m.text||'');
      if(m.type==='image') content=`<img src="${m.data}" style="max-width:200px;border-radius:8px;cursor:pointer" onclick="window.open('${m.data}','_blank')" />`;
      if(m.type==='video') content=`<video src="${m.data}" controls style="max-width:200px;border-radius:8px"></video>`;
      return `<div style="display:flex;flex-direction:column;align-items:${isMe?'flex-end':'flex-start'}">
        <div style="background:${isMe?'var(--gold)':'var(--card)'};color:${isMe?'#000':'var(--text)'};padding:8px 12px;border-radius:12px;font-size:0.78rem;max-width:80%;word-break:break-word">${content}</div>
        <div style="font-size:0.5rem;color:var(--text-dim);margin-top:2px">${time}</div>
      </div>`;
    }).join('');
    container.scrollTop = container.scrollHeight;
  },

  close(){ this.open=false; this.contact=null; ZN.ui.closeModal(); },

  allContacts(){
    const c = [];
    Object.entries(ZN.state.liveLocations).forEach(([id,loc])=>{
      if(id===ZN.state.uid) return;
      c.push({id,name:loc.role==='seller'?'🏪 '+(loc.bakery||loc.name):loc.role==='delivery'?'🚚 '+loc.name:'🛒 '+loc.name,role:loc.role,online:loc.online});
    });
    Object.entries(ZN.state.bakeries).forEach(([id,b])=>{
      if(id!==ZN.state.uid&&!c.find(x=>x.id===id)) c.push({id,name:'🏪 '+(b.name||b.owner),role:'seller',online:b.online});
    });
    return c;
  },

  showContacts(){
    const contacts = this.allContacts();
    if(!contacts.length){ ZN.ui.toast('💬 Tarmoqda foydalanuvchi yo\'q'); return; }
    ZN.ui.showModal(`
      <div style="min-height:40vh">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <span style="font-weight:600;color:var(--text-bright);font-size:0.95rem">💬 Xabarlar</span>
          <button class="btn btn-ghost btn-sm" onclick="ZN.ui.closeModal()">✕</button>
        </div>
        ${contacts.map(c=>{
          const unread = ZN.state.chatUnread[this.roomId(c.id)]||0;
          return `<div class="card" style="display:flex;align-items:center;gap:12px;cursor:pointer;margin-bottom:6px;padding:12px 14px" onclick="ZN.ui.closeModal();ZN.chat.openChat('${c.id}','${ZN.util.escJs(c.name)}')">
            <div class="avatar" style="width:40px;height:40px;font-size:1rem">${c.online?'🟢':'🔴'}</div>
            <div style="flex:1"><div style="font-size:0.82rem;color:var(--text-bright)">${c.name}</div><div style="font-size:0.6rem;color:var(--text-dim)">${c.online?'Online':'Offline'}${unread?` · <span style="color:var(--gold);font-weight:600">${unread} ta</span>`:''}</div></div>
            <span style="font-size:1rem;color:var(--text-dim)">💬</span>
          </div>`;
        }).join('')}
      </div>`);
  },

  updateBadge(){
    const fab = document.getElementById('chatFab');
    if(!fab) return;
    const total = Object.values(ZN.state.chatUnread).reduce((s,v)=>s+v,0);
    const badge = fab.querySelector('.count');
    if(badge) badge.textContent = total || '';
  },
};
