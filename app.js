
// IFNT v6.2.15 – localStorage single-file app
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

const state = {
  bv: JSON.parse(localStorage.getItem('bv')||'[]'),
  ibv: JSON.parse(localStorage.getItem('ibv')||'[]'),
  p312: JSON.parse(localStorage.getItem('p312')||'[]'),
  recruit: JSON.parse(localStorage.getItem('recruit')||'[]'),
  targets: JSON.parse(localStorage.getItem('targets')||'{"r":1,"bv":1500,"ibv":300}'),
};

function save(key){ localStorage.setItem(key, JSON.stringify(state[key])); }
function todayStr(){
  const d = new Date(); const t = d.toISOString().slice(0,10);
  return t;
}
function setDefaultDates(){
  ['bvDate','ibvDate','pDate','rDate'].forEach(id => { const el = $('#'+id); if(el && !el.value) el.value = todayStr(); });
}

function loadOptions(){
  // targets
  $('#tRecruit').value = state.targets.r; $('#tBV').value = state.targets.bv; $('#tIBV').value = state.targets.ibv;
  $('#kRecruit').textContent = state.targets.r; $('#kBV').textContent = state.targets.bv; $('#kIBV').textContent = state.targets.ibv;
  $('#title-bv-target').textContent = state.targets.bv; $('#title-ibv-target').textContent = state.targets.ibv;
  $('#bvTarget').textContent = state.targets.bv; $('#ibvTarget').textContent = state.targets.ibv; $('#rTarget').textContent = state.targets.r;
}

function rememberName(n){ if(!n) return; const names = new Set(JSON.parse(localStorage.getItem('names')||'[]')); names.add(n); localStorage.setItem('names', JSON.stringify([...names])); refreshLists(); }
function rememberGroup(g){ if(!g) return; const groups = new Set(JSON.parse(localStorage.getItem('groups')||'[]')); groups.add(g); localStorage.setItem('groups', JSON.stringify([...groups])); refreshLists(); }
function refreshLists(){
  const names = JSON.parse(localStorage.getItem('names')||'[]').sort();
  const groups = JSON.parse(localStorage.getItem('groups')||'[]').sort();
  $('#nameList').innerHTML = names.map(n=>`<option value="${n}">`).join('');
  $('#groupList').innerHTML = groups.map(g=>`<option value="${g}">`).join('');
}
function groupByName(rows){
  const map = new Map();
  for (const r of rows){
    const k = (r.name||'').trim() || '（未填名）';
    if(!map.has(k)) map.set(k,{name:k,sum:0,logs:[]});
    const v = map.get(k);
    v.sum += Number(r.amt)||0;
    v.logs.push(r);
  }
  return Array.from(map.values()).sort((a,b)=>b.sum-a.sum);
}
function sumAmt(rows){ return rows.reduce((a,b)=>a+(Number(b.amt)||0),0); }

function renderBV(){
  const list = groupByName(state.bv);
  const tb = $('#tblBV tbody'); tb.innerHTML = '';
  list.forEach((g,i)=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${i+1}</td><td>${g.name}</td><td>${g.sum}</td><td>${g.logs.length}</td>
    <td><button class="btn btn-small" data-v="bv-view" data-i="${i}">查看</button></td>
    <td><button class="btn btn-small" data-v="bv-del" data-i="${i}">刪除</button></td>`;
    tb.appendChild(tr);
  });
  // sum
  const s=sumAmt(state.bv), t=state.targets.bv;
  $('#bvSum').textContent = s;
  const badge = $('#bvBadge');
  if (s>=t && t>0){ badge.textContent='已達標！'; badge.className='badge ok'; $('#bvSum').classList.add('oktxt'); $('#bvSum').classList.remove('warntxt'); }
  else { badge.textContent='未達標'; badge.className='badge warn'; $('#bvSum').classList.add('warntxt'); $('#bvSum').classList.remove('oktxt'); }
}
function renderIBV(){
  const list = groupByName(state.ibv);
  const tb = $('#tblIBV tbody'); tb.innerHTML = '';
  list.forEach((g,i)=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${i+1}</td><td>${g.name}</td><td>${g.sum}</td><td>${g.logs.length}</td>
    <td><button class="btn btn-small" data-v="ibv-view" data-i="${i}">查看</button></td>
    <td><button class="btn btn-small" data-v="ibv-del" data-i="${i}">刪除</button></td>`;
    tb.appendChild(tr);
  });
  const s=sumAmt(state.ibv), t=state.targets.ibv;
  $('#ibvSum').textContent = s;
  const badge = $('#ibvBadge');
  if (s>=t && t>0){ badge.textContent='已達標！'; badge.className='badge ok'; $('#ibvSum').classList.add('oktxt'); $('#ibvSum').classList.remove('warntxt'); }
  else { badge.textContent='未達標'; badge.className='badge warn'; $('#ibvSum').classList.add('warntxt'); $('#ibvSum').classList.remove('oktxt'); }
}
function renderRecruit(){
  const tb = $('#tblR tbody'); tb.innerHTML='';
  state.recruit.forEach((r,i)=>{
    const tr=document.createElement('tr');
    tr.innerHTML = `<td>${i+1}</td><td>${r.date}</td><td>${r.name}</td>
      <td><button class="btn btn-small" data-v="r-del" data-i="${i}">刪除</button></td>`;
    tb.appendChild(tr);
  });
  const s=state.recruit.length, t=state.targets.r;
  $('#rSum').textContent = s;
  const badge = $('#rBadge');
  if (s>=t && t>0){ badge.textContent='已達標！'; badge.className='badge ok'; $('#rSum').classList.add('oktxt'); $('#rSum').classList.remove('warntxt'); }
  else { badge.textContent='未達標'; badge.className='badge warn'; $('#rSum').classList.add('warntxt'); $('#rSum').classList.remove('oktxt'); }
}

function key312(city,name,group){ return [city||'',name||'',group||''].join('|'); }
function renderP(){
  // compress to one line per city|name|group, keep logs
  const map = new Map();
  for(const r of state.p312){
    const k = key312(r.city,r.name,r.group);
    if(!map.has(k)) map.set(k,{ city:r.city, name:r.name, group:r.group, logs:[] });
    map.get(k).logs.push({ date:r.date, note:r.note });
  }
  const list = Array.from(map.values()).sort((a,b)=> (b.logs[0]?.date||'').localeCompare(a.logs[0]?.date||''));
  const tb=$('#tblP tbody'); tb.innerHTML='';
  list.forEach((g,i)=>{
    const latest = g.logs.map(l=>l.date).sort().reverse()[0]||'';
    const tr=document.createElement('tr');
    tr.innerHTML = `<td>${i+1}</td><td>${g.city}</td><td>${g.name}</td><td>${g.group}</td><td>${latest}</td>
    <td>${g.logs.length}</td><td><button class="btn btn-small" data-v="p-view" data-k="${key312(g.city,g.name,g.group)}">查看</button></td>
    <td><button class="btn btn-small" data-v="p-del" data-k="${key312(g.city,g.name,g.group)}">刪除</button></td>`;
    tb.appendChild(tr);
  });
}

function openModal(title, body){
  $('#mTitle').textContent = title;
  $('#mBody').textContent = body;
  $('#modal').classList.add('active');
}
$('#mClose').addEventListener('click', ()=> $('#modal').classList.remove('active'));

// Celebration sound and confetti
let audioCtx;
function fireworksSfx(times=2){
  if (!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)();
  const playOne = () => {
    const t0 = audioCtx.currentTime;
    // whoosh (noise + LPF)
    const noise = audioCtx.createBufferSource();
    const len = audioCtx.sampleRate*0.35;
    const buf = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
    const d = buf.getChannelData(0);
    for(let i=0;i<len;i++) d[i] = (Math.random()*2-1) * (1 - i/len);
    noise.buffer = buf;
    const lpf=audioCtx.createBiquadFilter(); lpf.type='lowpass';
    lpf.frequency.setValueAtTime(6000, t0);
    lpf.frequency.exponentialRampToValueAtTime(500, t0+0.28);
    const g1=audioCtx.createGain(); g1.gain.value = 0.9;
    noise.connect(lpf).connect(g1).connect(audioCtx.destination);
    noise.start();

    // boom (descending sine)
    const osc = audioCtx.createOscillator(); osc.type='sine';
    const t1 = t0+0.28;
    osc.frequency.setValueAtTime(220, t1);
    osc.frequency.exponentialRampToValueAtTime(60, t1+0.9);
    const g2=audioCtx.createGain(); g2.gain.setValueAtTime(1.1, t1);
    g2.gain.exponentialRampToValueAtTime(0.01, t1+1.0);
    osc.connect(g2).connect(audioCtx.destination);
    osc.start(t1); osc.stop(t1+1.05);
  };
  for(let i=0;i<times;i++) setTimeout(playOne, i*250);
  confettiBurst();
}
function confettiBurst(){
  // simple burst of emojis as a quick confetti replacement
  const el = document.createElement('div');
  el.style.position='fixed'; el.style.inset='0'; el.style.pointerEvents='none';
  document.body.appendChild(el);
  const N=24;
  for(let i=0;i<N;i++){
    const s=document.createElement('div');
    s.textContent = ['🎉','✨','🎊','🌟'][i%4];
    s.style.position='absolute';
    s.style.left = (50 + (Math.random()*40-20))+'%';
    s.style.top = '35%';
    s.style.fontSize = (18+Math.random()*18)+'px';
    s.style.transform = `translate(-50%, -50%) rotate(${Math.random()*360}deg)`;
    s.style.transition='all 1.3s cubic-bezier(.2,.8,.2,1)';
    el.appendChild(s);
    requestAnimationFrame(()=>{
      s.style.top = (5 + Math.random()*60)+'%';
      s.style.left = (10 + Math.random()*80)+'%';
      s.style.opacity='0';
    });
  }
  setTimeout(()=>document.body.removeChild(el), 1500);
}

function checkCelebrate(kind){
  // kind: 'bv','ibv','r'
  let sum=0, tgt=0, prevKey='';
  if (kind==='bv'){ sum = sumAmt(state.bv); tgt = state.targets.bv; prevKey='_bv_prev'; }
  if (kind==='ibv'){ sum = sumAmt(state.ibv); tgt = state.targets.ibv; prevKey='_ibv_prev'; }
  if (kind==='r'){ sum = state.recruit.length; tgt = state.targets.r; prevKey='_r_prev'; }
  const prev = Number(localStorage.getItem(prevKey)||'0');
  if (prev < tgt && sum >= tgt && tgt>0){
    fireworksSfx(2);
  }
  localStorage.setItem(prevKey, String(sum));
}

// Events
function initEvents(){
  // tab switching
  $$('.tab').forEach(t=> t.addEventListener('click', ()=>{
    $$('.tab').forEach(x=>x.classList.remove('active')); t.classList.add('active');
    const tab = t.dataset.tab;
    $('#sec-bv').hidden = tab!=='bv';
    $('#sec-ibv').hidden = tab!=='ibv';
    $('#sec-312').hidden = tab!=='p312';
    $('#sec-recruit').hidden = tab!=='recruit';
  }));

  $('#btnSaveTarget').addEventListener('click', ()=>{
    state.targets.r = Math.max(0, Number($('#tRecruit').value||1));
    state.targets.bv= Math.max(0, Number($('#tBV').value||1500));
    state.targets.ibv=Math.max(0, Number($('#tIBV').value||300));
    localStorage.setItem('targets', JSON.stringify(state.targets));
    loadOptions(); renderBV(); renderIBV(); renderRecruit();
  });

  // add BV
  $('#addBV').addEventListener('click', ()=>{
    const r = { date: $('#bvDate').value || todayStr(), name: $('#bvName').value.trim(), item: $('#bvItem').value.trim(), amt: Number($('#bvAmt').value||0) };
    if (!r.amt) return;
    state.bv.push(r); save('bv'); rememberName(r.name);
    renderBV();
    checkCelebrate('bv');
    // clear amount to加速輸入
    $('#bvAmt').value='';
  });

  // add IBV
  $('#addIBV').addEventListener('click', ()=>{
    const r = { date: $('#ibvDate').value || todayStr(), name: $('#ibvName').value.trim(), item: $('#ibvItem').value.trim(), amt: Number($('#ibvAmt').value||0) };
    if (!r.amt) return;
    state.ibv.push(r); save('ibv'); rememberName(r.name);
    renderIBV();
    checkCelebrate('ibv');
    $('#ibvAmt').value='';
  });

  // add recruit
  $('#addR').addEventListener('click', ()=>{
    const r = { date: $('#rDate').value || todayStr(), name: $('#rName').value.trim() };
    if (!r.name) return;
    state.recruit.push(r); save('recruit');
    renderRecruit();
    checkCelebrate('r');
    $('#rName').value='';
  });

  // 312 add
  $('#addP').addEventListener('click', ()=>{
    const r = { city: $('#pCity').value, name: $('#pName').value.trim(), group: $('#pGroup').value.trim(), date: $('#pDate').value || todayStr(), note: $('#pNote').value.trim() };
    if (!r.name) return;
    state.p312.push(r); save('p312'); rememberName(r.name); rememberGroup(r.group);
    renderP();
    // auto clear for next input
    $('#pName').value=''; $('#pGroup').value=''; $('#pNote').value='';
  });
  $('#clearInputs').addEventListener('click', ()=>{ $('#pName').value=''; $('#pGroup').value=''; $('#pNote').value=''; });

  // tables delegation
  $('#tblBV').addEventListener('click', (e)=>{
    const t = e.target.closest('button'); if(!t) return;
    const list = groupByName(state.bv); const i = Number(t.dataset.i);
    if (t.dataset.v==='bv-view'){
      const g = list[i];
      const body = `【${g.name}】（BV）\n` + g.logs.map(l=>`${l.date} ｜ ${l.item} ${l.amt}`).join('\n');
      openModal('查看 BV', body);
    } else if (t.dataset.v==='bv-del'){
      // 刪除該姓名的全部 BV
      const g = list[i]; state.bv = state.bv.filter(r=> (r.name||'').trim() !== g.name); save('bv'); renderBV();
    }
  });
  $('#tblIBV').addEventListener('click', (e)=>{
    const t = e.target.closest('button'); if(!t) return;
    const list = groupByName(state.ibv); const i = Number(t.dataset.i);
    if (t.dataset.v==='ibv-view'){
      const g = list[i];
      const body = `【${g.name}】（IBV）\n` + g.logs.map(l=>`${l.date} ｜ ${l.item} ${l.amt}`).join('\n');
      openModal('查看 IBV', body);
    } else if (t.dataset.v==='ibv-del'){
      const g = list[i]; state.ibv = state.ibv.filter(r=> (r.name||'').trim() !== g.name); save('ibv'); renderIBV();
    }
  });
  $('#tblP').addEventListener('click', (e)=>{
    const t = e.target.closest('button'); if(!t) return;
    const k = t.dataset.k;
    if (t.dataset.v==='p-view'){
      const logs = state.p312.filter(r=> key312(r.city,r.name,r.group)===k).sort((a,b)=> (a.date||'').localeCompare(b.date||''));
      const head = `【${logs[0]?.name||''}】（${logs[0]?.city||''}｜${logs[0]?.group||''}）`;
      const body = head + '\n' + logs.map(l=>`${l.date} ｜ ${l.note||''}`).join('\n');
      openModal('查看 312', body);
    } else if (t.dataset.v==='p-del'){
      state.p312 = state.p312.filter(r=> key312(r.city,r.name,r.group)!==k); save('p312'); renderP();
    }
  });
}

function init(){
  setDefaultDates();
  loadOptions();
  refreshLists();
  renderBV(); renderIBV(); renderRecruit(); renderP();
  initEvents();
  // set BV/IBV sums to prev to avoid false firework on first render
  localStorage.setItem('_bv_prev', String(sumAmt(state.bv)));
  localStorage.setItem('_ibv_prev', String(sumAmt(state.ibv)));
  localStorage.setItem('_r_prev', String(state.recruit.length));
}
document.addEventListener('DOMContentLoaded', init);

// PWA minimal
if ('serviceWorker' in navigator){ window.addEventListener('load', ()=> navigator.serviceWorker.register('service-worker.js')); }
