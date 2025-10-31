// IFNT v6.2.17 full
const LS_KEY = 'ifnt_data_v6_2_17';
const $ = (sel)=>document.querySelector(sel);
const $$ = (sel)=>document.querySelectorAll(sel);

const state = (()=>{
  let d = localStorage.getItem(LS_KEY);
  if(d){ try{ return JSON.parse(d); }catch{ /* ignore */ } }
  const today = new Date().toISOString().slice(0,10);
  return {
    targets:{ recruit:1, bv:1500, ibv:300 },
    recruits:[],
    bv:[], // {date,name,item,amount}
    ibv:[],
    people:[], // {city,name,group,logs:[{date,note}]}
    lastDate: today
  };
})();

function save(){ localStorage.setItem(LS_KEY, JSON.stringify(state)); }

function initDates(){
  const today = new Date().toISOString().slice(0,10);
  ['bvDate','ibvDate','pdate'].forEach(id=>{ const el = $('#'+id); if(el && !el.value) el.value = today; });
}

function updateTargetsUI(){
  // inputs
  $('#targetRecruit').value = state.targets.recruit;
  $('#targetBV').value = state.targets.bv;
  $('#targetIBV').value = state.targets.ibv;
  // titles
  $('#bvTitleTarget').textContent = state.targets.bv;
  $('#ibvTitleTarget').textContent = state.targets.ibv;
  $('#bvTarget').textContent = state.targets.bv;
  $('#ibvTarget').textContent = state.targets.ibv;
  // progress
  refreshAll();
}

function sum(list){ return list.reduce((s,x)=>s + Number(x.amount||0),0); }
function groupByName(list){
  const m = new Map();
  list.forEach(it=>{
    const key = (it.name||'（未填）').trim();
    const rec = m.get(key) || { name:key, total:0, count:0, items:[] };
    rec.total += Number(it.amount||0);
    rec.count += 1;
    rec.items.push(it);
    m.set(key, rec);
  });
  return Array.from(m.values());
}

function renderTable(list, tbody, type){
  tbody.innerHTML = '';
  groupByName(list).forEach((rec, idx)=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${idx+1}</td>
      <td>${rec.name}</td>
      <td>${rec.total}</td>
      <td>${rec.count}</td>
      <td><button class="btn tiny ghost" data-view="${type}" data-name="${rec.name}">查看</button></td>
      <td><button class="btn tiny ghost danger" data-del="${type}" data-name="${rec.name}">刪除</button></td>`;
    tbody.appendChild(tr);
  });
}

function refreshBV(){
  $('#bvTotal').textContent = sum(state.bv);
  renderTable(state.bv, $('#bvTable'), 'bv');
  const ok = sum(state.bv) >= state.targets.bv;
  $('#bvReached').classList.toggle('hide', !ok);
}

function refreshIBV(){
  $('#ibvTotal').textContent = sum(state.ibv);
  renderTable(state.ibv, $('#ibvTable'), 'ibv');
  const ok = sum(state.ibv) >= state.targets.ibv;
  $('#ibvReached').classList.toggle('hide', !ok);
}

function percent(v, t){ return t<=0 ? 1 : Math.min(1, v/t); }
function setProg(fill, txt, curr, target){
  fill.style.width = (percent(curr,target)*100).toFixed(1)+'%';
  txt.textContent = `${curr} / ${target}`;
  fill.style.background = curr>=target ? 'linear-gradient(90deg,#39e07a,#1dd8b3)' : 'linear-gradient(90deg,#1dd8b3,#1dbad8)';
  txt.style.color = curr>=target ? '#39e07a' : '#e6fff7';
}

function refreshProgress(){
  const currRecruit = state.recruits.length;
  const currBV = sum(state.bv);
  const currIBV = sum(state.ibv);

  setProg($('#progRecruit'), $('#progRecruitText'), currRecruit, state.targets.recruit);
  setProg($('#progBV'), $('#progBVText'), currBV, state.targets.bv);
  setProg($('#progIBV'), $('#progIBVText'), currIBV, state.targets.ibv);

  $('#kpiRecruitLabel').textContent = `招募 ${currRecruit} / ${state.targets.recruit}`;
  $('#kpiBVLabel').textContent = `BV ${currBV} / ${state.targets.bv}`;
  $('#kpiIBVLabel').textContent = `IBV ${currIBV} / ${state.targets.ibv}`;
}

function refreshPeople(){
  // build name datalist
  const nameSet = new Set();
  state.bv.forEach(x=> nameSet.add((x.name||'').trim()));
  state.ibv.forEach(x=> nameSet.add((x.name||'').trim()));
  state.people.forEach(p=> nameSet.add((p.name||'').trim()));
  const dl = $('#nameList');
  dl.innerHTML = Array.from(nameSet).filter(Boolean).map(n=>`<option>${n}</option>`).join('');

  const tbody = $('#peopleTable');
  tbody.innerHTML = '';
  state.people.forEach((p, idx)=>{
    const latest = p.logs.length ? p.logs[p.logs.length-1].date : '';
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${idx+1}</td><td>${p.city||''}</td><td>${p.name||''}</td><td>${p.group||''}</td>
                    <td>${latest}</td><td>${p.logs.length}</td>
                    <td><button class="btn tiny ghost" data-view="p" data-idx="${idx}">查看</button></td>`;
    tbody.appendChild(tr);
  });
}

function refreshAll(){
  refreshBV();
  refreshIBV();
  refreshPeople();
  refreshProgress();
}

function playFireworksIfCrossed(prev, curr, target){
  if(prev < target && curr >= target){
    playFireworks();
  }
}

function playFireworks(){
  const audio = $('#sfxFireworks');
  try{
    audio.currentTime = 0;
    audio.volume = 1.0;
    audio.play().catch(()=>{});
    setTimeout(()=>{
      audio.currentTime = 0;
      audio.play().catch(()=>{});
    }, 600);
  }catch(e){}

  // simple confetti
  const canvas = $('#fx');
  const ctx = canvas.getContext('2d');
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  const parts = Array.from({length:120},()=> ({
    x: canvas.width/2, y: canvas.height*0.6,
    vx: (Math.random()-0.5)*6,
    vy: -Math.random()*6-2,
    g: 0.12 + Math.random()*0.08,
    a: 1, r: 3+Math.random()*3,
    c: `hsl(${Math.random()*360},90%,60%)`
  }));
  let t=0;
  function step(){
    t++;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    parts.forEach(p=>{
      p.x += p.vx; p.y += p.vy; p.vy += p.g; p.a -= 0.008;
      ctx.globalAlpha = Math.max(0,p.a);
      ctx.fillStyle = p.c;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
    });
    if(t<180) requestAnimationFrame(step); else { ctx.clearRect(0,0,canvas.width,canvas.height); }
  }
  step();
}

function bind(){
  // tabs
  $$('.tab').forEach(btn=>btn.addEventListener('click', e=>{
    $$('.tab').forEach(b=>b.classList.remove('active'));
    e.currentTarget.classList.add('active');
    const tab = e.currentTarget.dataset.tab;
    $$('.tab-pane').forEach(p=>p.classList.remove('active'));
    $('#tab-'+tab).classList.add('active');
  }));

  // export
  $('#exportBtn').addEventListener('click', ()=>{
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], {type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'ifnt_data.json';
    a.click();
  });

  // toggle targets
  const bodyEl = $('#targetsBody');
  $('#toggleTargets').addEventListener('click', ()=>{
    bodyEl.style.display = bodyEl.style.display==='none' ? '' : 'none';
  });

  // save targets
  $('#saveTargets').addEventListener('click', ()=>{
    state.targets.recruit = Number($('#targetRecruit').value||0);
    state.targets.bv = Number($('#targetBV').value||0);
    state.targets.ibv = Number($('#targetIBV').value||0);
    save();
    updateTargetsUI();
    // collapse after save
    $('#targetsBody').style.display = 'none';
  });

  // add BV
  $('#addBV').addEventListener('click', ()=>{
    const before = sum(state.bv);
    const item = {
      date: $('#bvDate').value,
      name: $('#bvName').value.trim(),
      item: $('#bvItem').value.trim(),
      amount: Number($('#bvAmount').value||0)
    };
    if(item.amount>0){
      state.bv.push(item); save();
      refreshBV(); refreshProgress(); refreshPeople();
      const after = sum(state.bv);
      playFireworksIfCrossed(before, after, state.targets.bv);
      // clear amount but retain fields for quick input
      $('#bvAmount').value = '';
    }
  });

  // add IBV
  $('#addIBV').addEventListener('click', ()=>{
    const before = sum(state.ibv);
    const item = {
      date: $('#ibvDate').value,
      name: $('#ibvName').value.trim(),
      item: $('#ibvItem').value.trim(),
      amount: Number($('#ibvAmount').value||0)
    };
    if(item.amount>0){
      state.ibv.push(item); save();
      refreshIBV(); refreshProgress(); refreshPeople();
      const after = sum(state.ibv);
      playFireworksIfCrossed(before, after, state.targets.ibv);
      $('#ibvAmount').value = '';
    }
  });

  // table actions (view / delete by name)
  document.body.addEventListener('click', (e)=>{
    const v = e.target.getAttribute('data-view');
    const d = e.target.getAttribute('data-del');
    if(v==='bv' || v==='ibv'){
      const name = e.target.getAttribute('data-name');
      const list = v==='bv'? state.bv : state.ibv;
      const rows = list.filter(x=>(x.name||'（未填）').trim()===name.trim());
      const lines = rows.map(r => `${r.date} | ${r.item}  ${r.amount}`).join('<br>');
      $('#modalText').innerHTML = `【${name}】<br>${lines || '無資料'}`;
      $('#modal').classList.remove('hide');
      return;
    }
    if(d==='bv' || d==='ibv'){
      const name = e.target.getAttribute('data-name');
      if(confirm(`刪除 ${name} 的所有${d.toUpperCase()}紀錄？`)){
        if(d==='bv') state.bv = state.bv.filter(x=> (x.name||'').trim()!==name.trim());
        else state.ibv = state.ibv.filter(x=> (x.name||'').trim()!==name.trim());
        save(); refreshAll();
      }
      return;
    }
    if(e.target.id==='closeModal'){ $('#modal').classList.add('hide'); }
  });

  // 312 add / accumulate
  $('#addPerson').addEventListener('click', ()=>{
    const city = $('#city').value.trim();
    const name = $('#pname').value.trim();
    const group = $('#group').value.trim();
    const date = $('#pdate').value;
    const note = $('#pnote').value.trim();
    if(!name) return;
    let p = state.people.find(x=>x.name===name);
    if(!p){
      p = { city, name, group, logs:[] };
      state.people.push(p);
    }else{
      if(city) p.city = city;
      if(group) p.group = group;
    }
    p.logs.push({date, note});
    save();
    refreshPeople();
    // clear name/group for fast next entry
    $('#pname').value = '';
    $('#group').value = '';
    $('#pnote').value = '';
  });

  $('#clearPersonFields').addEventListener('click', ()=>{
    ['city','pname','group','pdate','pnote'].forEach(id=>$('#'+id).value='');
  });

  // modal close
  $('#closeModal').addEventListener('click', ()=>$('#modal').classList.add('hide'));
}

document.addEventListener('DOMContentLoaded', ()=>{
  initDates();
  updateTargetsUI();
  bind();
});
