// IFNT app v6.2.11
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const todayStr = () => new Date().toISOString().slice(0,10);

const store = {
  key:'IFNT_DATA_V6211',
  data:{recruits:[], bv:[], ibv:[], book:[], cities:[]},
  load(){ try{ this.data = JSON.parse(localStorage.getItem(this.key)) || this.data }catch(e){} },
  save(){ localStorage.setItem(this.key, JSON.stringify(this.data)) }
};

function initTabs(){
  $$('.tab').forEach(btn=>btn.addEventListener('click',e=>{
    $$('.tab').forEach(b=>b.classList.remove('active'));
    e.currentTarget.classList.add('active');
    const t = e.currentTarget.dataset.tab;
    $$('.panel').forEach(p=>p.classList.remove('show'));
    $('#'+t).classList.add('show');
  }));
}

function renderRecruit(){
  const box = $('#recList'); box.innerHTML = '';
  store.data.recruits.forEach((r,i)=>{
    const div = document.createElement('div');
    div.className='item';
    div.innerHTML = `<small>${i+1}</small><div>${r.date}</div><div>${r.name}</div>
      <div></div><button class="btn del" data-i="${i}" data-type="rec">刪除</button>`;
    box.appendChild(div);
  });
  $('#recCount').textContent = store.data.recruits.length;
  const badge = $('#recBadge');
  if (store.data.recruits.length >= 1){ badge.classList.remove('hidden'); successFX('招募 1 已達標'); }
  else { badge.classList.add('hidden'); }
}

function sum(list){ return list.reduce((a,b)=>a+Number(b.val||0),0); }

function renderBV(){
  $('#bvSum').textContent = sum(store.data.bv);
  const badge = $('#bvBadge');
  if (sum(store.data.bv) >= 1500){ badge.classList.remove('hidden'); successFX(`BV 1500 已達標（${todayStr()}）`); }
  else badge.classList.add('hidden');
  const box = $('#bvList'); box.innerHTML='';
  store.data.bv.forEach((r,i)=>{
    const div=document.createElement('div');
    div.className='item';
    div.innerHTML = `<small>${i+1}</small><div>${r.date}</div><div>${r.name||''} ${r.item?`<small>${r.item}</small>`:''}</div>
    <div><b>${r.val}</b></div><button class="btn del" data-i="${i}" data-type="bv">刪除</button>`;
    box.appendChild(div);
  });
}

function renderIBV(){
  $('#ibvSum').textContent = sum(store.data.ibv);
  const badge = $('#ibvBadge');
  if (sum(store.data.ibv) >= 300){ badge.classList.remove('hidden'); successFX(`IBV 300 已達標（${todayStr()}）`); }
  else badge.classList.add('hidden');
  const box = $('#ibvList'); box.innerHTML='';
  store.data.ibv.forEach((r,i)=>{
    const div=document.createElement('div');
    div.className='item';
    div.innerHTML = `<small>${i+1}</small><div>${r.date}</div><div>${r.name||''} ${r.item?`<small>${r.item}</small>`:''}</div>
    <div><b>${r.val}</b></div><button class="btn del" data-i="${i}" data-type="ibv">刪除</button>`;
    box.appendChild(div);
  });
}

const TAIWAN_CITIES = ["基隆市","臺北市","新北市","桃園市","新竹市","新竹縣","苗栗縣","臺中市","彰化縣","南投縣","雲林縣","嘉義市","嘉義縣","臺南市","高雄市","屏東縣","宜蘭縣","花蓮縣","臺東縣","澎湖縣","金門縣","連江縣"];
function initCities(){
  const sel = $('#bkCity');
  sel.innerHTML = TAIWAN_CITIES.map(c=>`<option>${c}</option>`).join('');
}

function refreshBook(){
  // populate name/group datalist
  const names = [...new Set(store.data.book.map(b=>b.name).filter(Boolean))];
  const groups = [...new Set(store.data.book.map(b=>b.group).filter(Boolean))];
  $('#bkNames').innerHTML = names.map(n=>`<option value="${n}">`).join('');
  $('#bkGroups').innerHTML = groups.map(n=>`<option value="${n}">`).join('');

  const box = $('#bkList'); box.innerHTML='';
  store.data.book.forEach((p,idx)=>{
    const last = p.logs.at(-1)?.date || '';
    const div = document.createElement('div');
    div.className='item';
    div.innerHTML = `<small>${idx+1}</small><div>${p.city}</div><div>${p.name}</div><div>${p.group}</div>
    <div>${last}</div>
    <button class="btn" data-view="${idx}">查看</button>`;
    box.appendChild(div);

    // detail collapsible
    const detail = document.createElement('div');
    detail.className='list';
    detail.style.display='none';
    p.logs.forEach(l=>{
      const it = document.createElement('div');
      it.className='item';
      it.style.gridTemplateColumns='100px 1fr';
      it.innerHTML = `<div>${l.date}</div><div>${l.note}</div>`;
      detail.appendChild(it);
    });
    box.appendChild(detail);

    div.querySelector('button').addEventListener('click',()=>{
      detail.style.display = detail.style.display==='none' ? 'grid' : 'none';
    });
  });
}

function bindEvents(){
  $('#recDate').value = todayStr();
  $('#bvDate').value = todayStr();
  $('#ibvDate').value = todayStr();
  $('#bkDate').value = todayStr();

  $('#btnRecAdd').onclick = () => {
    const name = $('#recName').value.trim();
    if(!name) return alert('請輸入招募姓名');
    store.data.recruits.push({date: $('#recDate').value || todayStr(), name});
    $('#recName').value='';
    store.save(); renderRecruit();
  };

  $('#btnBvAdd').onclick = () => {
    const v = Number($('#bvVal').value||0);
    if(!v) return alert('請輸入 BV 數值');
    store.data.bv.push({date: $('#bvDate').value||todayStr(), name: $('#bvName').value.trim(), item: $('#bvItem').value.trim(), val: v});
    $('#bvVal').value=''; $('#bvItem').value=''; $('#bvName').value='';
    store.save(); renderBV();
  };

  $('#btnIbvAdd').onclick = () => {
    const v = Number($('#ibvVal').value||0);
    if(!v) return alert('請輸入 IBV 數值');
    store.data.ibv.push({date: $('#ibvDate').value||todayStr(), name: $('#ibvName').value.trim(), item: $('#ibvItem').value.trim(), val: v});
    $('#ibvVal').value=''; $('#ibvItem').value=''; $('#ibvName').value='';
    store.save(); renderIBV();
  };

  $('#btnBkAdd').onclick = () => {
    const city = $('#bkCity').value;
    const name = $('#bkName').value.trim();
    const group = $('#bkGroup').value.trim();
    const date = $('#bkDate').value || todayStr();
    const note = $('#bkNote').value.trim();
    if(!name) return alert('請輸入姓名');
    let rec = store.data.book.find(p => p.name===name);
    if(!rec){ rec = {city,name,group,logs:[]}; store.data.book.push(rec); }
    if(group) rec.group = group;
    rec.city = city;
    rec.logs.push({date,note});
    $('#bkNote').value=''; // keep name/group for next entry
    store.save(); refreshBook();
  };

  $('#btnBkClear').onclick = () => { $('#bkName').value=''; $('#bkGroup').value=''; $('#bkNote').value=''; };

  document.body.addEventListener('click',e=>{
    const t = e.target;
    if(t.classList.contains('del')){
      const i = Number(t.dataset.i); const type = t.dataset.type;
      if(type==='rec'){ store.data.recruits.splice(i,1); renderRecruit(); }
      if(type==='bv'){ store.data.bv.splice(i,1); renderBV(); }
      if(type==='ibv'){ store.data.ibv.splice(i,1); renderIBV(); }
      store.save();
    }
  });

  $('#btnExport').onclick = exportCSV;
}

function exportCSV(){
  const rows = [];
  rows.push(['類別','日期','姓名','品項/備註','數值'].join(','));
  store.data.recruits.forEach(r=>rows.push(['招募',r.date,r.name,'', ''].join(',')));
  store.data.bv.forEach(r=>rows.push(['BV',r.date,r.name,r.item,r.val].join(',')));
  store.data.ibv.forEach(r=>rows.push(['IBV',r.date,r.name,r.item,r.val].join(',')));
  store.data.book.forEach(p=>p.logs.forEach(l=>rows.push(['312',l.date,p.name, l.note.replaceAll(',',';'),''].join(','))));
  const blob = new Blob(['﻿'+rows.join('\n')],{type:'text/csv;charset=utf-8;'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'IFNT_export_'+new Date().toISOString().slice(0,10)+'.csv';
  a.click();
}

// ---- 成功動畫 + 音效（2秒，含兩段叮、三段爆破） ----
let fxTimer;
function successFX(text='已達標！'){
  // 中央徽章
  const badge = $('#centerBadge');
  badge.textContent = '🎉 '+text+' 🎉';
  badge.classList.remove('hidden');

  // 音效
  playSuccessSound();

  // 煙火
  fireworkStart();

  clearTimeout(fxTimer);
  fxTimer = setTimeout(()=>{
    badge.classList.add('hidden');
    fireworkStop();
  }, 2000);
}

// WebAudio 合成：兩段「叮」+ 三段「啪/嘭/咚」
function playSuccessSound(){
  const ctx = new (window.AudioContext||window.webkitAudioContext)();
  const now = ctx.currentTime;
  function bell(t, f){
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type='sine'; o.frequency.setValueAtTime(f, now+t);
    g.gain.setValueAtTime(0.0001, now+t);
    g.gain.exponentialRampToValueAtTime(0.6, now+t+0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now+t+0.30);
    o.connect(g).connect(ctx.destination); o.start(now+t); o.stop(now+t+0.35);
  }
  // 兩段叮（上行）
  bell(0.00, 880); bell(0.15, 1175);
  // 三段爆破模擬
  function boom(t){
    const n = ctx.createBufferSource();
    const len = 22050; const buf = ctx.createBuffer(1,len,44100);
    const d = buf.getChannelData(0);
    for(let i=0;i<len;i++){ d[i] = (Math.random()*2-1)*Math.exp(-i/2000); }
    n.buffer = buf; const g = ctx.createGain();
    g.gain.value = 0.7; n.connect(g).connect(ctx.destination);
    n.start(now+t);
  }
  boom(0.40); boom(0.75); boom(1.10);
}

// ---- 煙火 Canvas ----
let fxCtx, fxRAF;
function fireworkStart(){
  const canvas = $('#fxCanvas');
  const dpr = window.devicePixelRatio||1;
  canvas.width = innerWidth*dpr; canvas.height = innerHeight*dpr;
  fxCtx = canvas.getContext('2d'); fxCtx.scale(dpr,dpr);
  const particles = [];
  function spawn(){
    const colors = ['#ffec6e','#ff8b8b','#2afece','#7ad1ff','#ffa94d'];
    const cx = innerWidth/2, cy = innerHeight/2;
    for(let i=0;i<70;i++){
      const a = Math.random()*Math.PI*2;
      const v = 2+Math.random()*4;
      particles.push({x:cx,y:cy, vx:Math.cos(a)*v, vy:Math.sin(a)*v, life:60+Math.random()*30, c:colors[(Math.random()*colors.length)|0]});
    }
  }
  spawn();
  const loop=()=>{
    fxCtx.fillStyle = 'rgba(14,49,56,.18)';
    fxCtx.fillRect(0,0,innerWidth,innerHeight);
    particles.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy; p.vy+=0.03; p.life--;
      fxCtx.fillStyle=p.c; fxCtx.fillRect(p.x,p.y,2,2);
    });
    for(let i=particles.length-1;i>=0;i--) if(particles[i].life<=0) particles.splice(i,1);
    fxRAF = requestAnimationFrame(loop);
  };
  loop();
}
function fireworkStop(){
  cancelAnimationFrame(fxRAF);
  const canvas = $('#fxCanvas'); const ctx = canvas.getContext('2d'); ctx && ctx.clearRect(0,0,canvas.width,canvas.height);
}

// PWA
if('serviceWorker' in navigator){
  window.addEventListener('load',()=>navigator.serviceWorker.register('service-worker.js'));
}

// init
store.load();
initTabs();
initCities();
bindEvents();
renderRecruit(); renderBV(); renderIBV(); refreshBook();
