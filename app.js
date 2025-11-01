
/* Local storage keys */
const LS_KEY = 'ifnt_data_v6219';
const LS_GOAL = 'ifnt_goal_v6219';
const LS_PLAY = 'ifnt_played_flags_v6219';

const $ = (s,root=document)=>root.querySelector(s);
const $$ = (s,root=document)=>Array.from(root.querySelectorAll(s));

function load(k,d){ try{ return JSON.parse(localStorage.getItem(k)) ?? d }catch{ return d }}
function save(k,v){ localStorage.setItem(k, JSON.stringify(v)) }

const state = {
  data: load(LS_KEY, { recruit:{list:[]}, bv:{items:[], total:0}, ibv:{items:[], total:0}, people:{} }),
  goals: load(LS_GOAL,{ recruit:1, bv:1500, ibv:300 }),
  played: load(LS_PLAY,{ r:false, bv:false, ibv:false })
};

function today(){ return new Date().toISOString().slice(0,10); }
function num(x){ return Number(x||0) }

/* UI init */
$('#appVer').textContent = 'v6.2.19';
$('#goalRecruit').value = state.goals.recruit;
$('#goalBV').value = state.goals.bv;
$('#goalIBV').value = state.goals.ibv;
$('#rDate').value = today(); $('#bvDate').value = today(); $('#ibvDate').value = today(); $('#pDate')?.value = today();

$('#toggleGoal').addEventListener('click', ()=>{
  const p = $('#goalPanel');
  p.hidden = !p.hidden;
  $('#toggleGoal').textContent = p.hidden ? '展開' : '收合';
});

$('#btnSaveGoal').addEventListener('click', ()=>{
  state.goals.recruit = num($('#goalRecruit').value);
  state.goals.bv = num($('#goalBV').value);
  state.goals.ibv = num($('#goalIBV').value);
  save(LS_GOAL, state.goals);
  $('#goalDesc').textContent = `目前目標：招募 ${state.goals.recruit} / BV ${state.goals.bv} / IBV ${state.goals.ibv}`;
  updateKPI(false);
});

/* Tabs */
$$('.tab').forEach(b=>b.addEventListener('click', ()=>{
  $$('.tab').forEach(x=>x.classList.remove('active')); b.classList.add('active');
  $$('.tab-pane').forEach(p=>p.classList.remove('active'));
  $('#'+b.dataset.tab).classList.add('active');
}));

/* Helpers */
function setBadge(el, on){ if(!el) return; el.innerHTML = on ? '<span class="badge-done">已達標</span>' : ''; }
function setBar(el, now, goal){ const pct = goal>0 ? Math.min(100, Math.round(now/goal*100)) : 0; el.style.width = pct+'%'; }
function paintSum(sel, now, goal, badgeSel){
  const el = $(sel); if(!el) return;
  el.textContent = `${now} / ${goal}`;
  el.classList.toggle('kpi--ok', now>=goal);
  el.classList.toggle('kpi--warn', now<goal);
  setBadge($(badgeSel), now>=goal);
}
function groupByName(items){
  const map = new Map();
  items.forEach(r=>{
    const k = r.name || '未命名';
    if(!map.has(k)) map.set(k, {name:k, sum:0, count:0, list:[]});
    const g = map.get(k); g.sum += num(r.value); g.count += 1; g.list.push(r);
  });
  return Array.from(map.values()).sort((a,b)=>b.sum-a.sum || a.name.localeCompare(b.name));
}
function recalcTotals(){
  state.data.bv.total = state.data.bv.items.reduce((s,r)=>s+num(r.value),0);
  state.data.ibv.total = state.data.ibv.items.reduce((s,r)=>s+num(r.value),0);
  save(LS_KEY, state.data);
}

/* Celebrate once per target */
function maybeCelebrate(kind, before, after){
  const g = state.goals;
  const hit = {
    r:  before.r < g.recruit && after.r >= g.recruit,
    bv: before.bv < g.bv      && after.bv >= g.bv,
    ibv:before.ibv< g.ibv     && after.ibv>= g.ibv
  };
  const audio = $('#audioCelebrate');
  if(kind==='r' && hit.r && !state.played.r){ state.played.r=true; save(LS_PLAY,state.played); audio.currentTime=0; audio.play().catch(()=>{}); }
  if(kind==='bv'&& hit.bv&& !state.played.bv){state.played.bv=true;save(LS_PLAY,state.played); audio.currentTime=0; audio.play().catch(()=>{}); }
  if(kind==='ibv'&&hit.ibv&&!state.played.ibv){state.played.ibv=true;save(LS_PLAY,state.played);audio.currentTime=0; audio.play().catch(()=>{}); }
}

/* Render KPI & badges */
function updateKPI(maybePlay){
  const rNow = state.data.recruit.list.length;
  const bvNow = state.data.bv.total;
  const ibvNow = state.data.ibv.total;
  $('#goalDesc').textContent = `目前目標：招募 ${state.goals.recruit} / BV ${state.goals.bv} / IBV ${state.goals.ibv}`;
  setBar($('#barRecruit'), rNow, state.goals.recruit);
  setBar($('#barBV'), bvNow, state.goals.bv);
  setBar($('#barIBV'), ibvNow, state.goals.ibv);
  setBadge($('#badgeRecruit'), rNow>=state.goals.recruit);
  setBadge($('#badgeBV'), bvNow>=state.goals.bv);
  setBadge($('#badgeIBV'), ibvNow>=state.goals.ibv);
  paintSum('#sumRecruitVal', rNow, state.goals.recruit, '#sumBadgeRecruit');
  paintSum('#sumBVVal',      bvNow, state.goals.bv,      '#sumBadgeBV');
  paintSum('#sumIBVVal',     ibvNow, state.goals.ibv,    '#sumBadgeIBV');
  // 下方區塊的顏色/徽章
  $('#sumRecruit').textContent = `${rNow} / ${state.goals.recruit}`;
  $('#sumRecruit').className = (rNow>=state.goals.recruit ? 'kpi--ok':'kpi--warn');
  setBadge($('#sumBadgeRecruit2'), rNow>=state.goals.recruit);
  $('#sumBV').textContent = `${bvNow} / ${state.goals.bv}`;
  $('#sumBV').className = (bvNow>=state.goals.bv ? 'kpi--ok':'kpi--warn');
  setBadge($('#sumBadgeBV2'), bvNow>=state.goals.bv);
  $('#sumIBV').textContent = `${ibvNow} / ${state.goals.ibv}`;
  $('#sumIBV').className = (ibvNow>=state.goals.ibv ? 'kpi--ok':'kpi--warn');
  setBadge($('#sumBadgeIBV2'), ibvNow>=state.goals.ibv);
}

/* Render tables */
function renderRecruit(){
  const tb = $('#rTbody'); tb.innerHTML='';
  state.data.recruit.list.forEach((r,i)=>{
    const row = document.createElement('div');
    row.className='tbody-row';
    row.innerHTML = `
      <span>${i+1}</span>
      <span>${r.date}</span>
      <span>${r.name}</span>
      <span class="right"><button class="btn-line btn-danger" data-del-r="${i}">刪除</button></span>`;
    tb.appendChild(row);
  });
  tb.querySelectorAll('button[data-del-r]').forEach(btn=>{
    btn.addEventListener('click', e=>{
      const i = Number(e.currentTarget.dataset.delR || e.currentTarget.getAttribute('data-del-r'));
      if(!confirm('確定刪除此筆？')) return;
      state.data.recruit.list.splice(i,1); save(LS_KEY,state.data);
      renderRecruit(); updateKPI(false);
    });
  });
}

function openDetail(type, name, list, onDeleteOne){
  $('#modalTitle').textContent = `【${name}】${type} 明細`;
  const box = $('#detailList'); box.innerHTML='';
  list.forEach((r, idx)=>{
    const row = document.createElement('div');
    row.className='detail-row';
    row.innerHTML = `<span>${r.date}｜${r.item} ${r.value}</span><button class="btn-line btn-danger" data-idx="${idx}">單筆刪除</button>`;
    box.appendChild(row);
  });
  $('#modal').hidden = false;
  $('#modalClose').onclick = ()=> $('#modal').hidden = true;
  box.querySelectorAll('button[data-idx]').forEach(b=>{
    b.addEventListener('click', e=>{
      const i = Number(e.currentTarget.dataset.idx);
      if(!confirm('確定刪除此筆紀錄？')) return;
      onDeleteOne(i);
    });
  });
}

function renderBV(){
  const tb = $('#bvTbody'); tb.innerHTML='';
  const grouped = groupByName(state.data.bv.items);
  grouped.forEach((g,i)=>{
    const row = document.createElement('div');
    row.className='tbody-row';
    row.innerHTML = `
      <span>${i+1}</span>
      <span>${g.name}</span>
      <span>${g.sum}</span>
      <span>${g.count}</span>
      <span><button class="btn-line" data-view-bv="${g.name}">查看</button></span>
      <span class="right"><button class="btn-line btn-danger" data-delall-bv="${g.name}">刪除</button></span>`;
    tb.appendChild(row);
  });
  tb.querySelectorAll('button[data-view-bv]').forEach(b=>{
    b.addEventListener('click', e=>{
      const name = e.currentTarget.dataset.viewBv || e.currentTarget.getAttribute('data-view-bv');
      const list = state.data.bv.items.filter(x=>x.name===name);
      openDetail('BV', name, list, (idx)=>{
        const real = state.data.bv.items.filter(x=>x.name===name)[idx];
        const at = state.data.bv.items.indexOf(real);
        if(at>-1){ state.data.bv.items.splice(at,1); recalcTotals(); renderBV(); updateKPI(false); }
      });
    });
  });
  tb.querySelectorAll('button[data-delall-bv]').forEach(b=>{
    b.addEventListener('click', e=>{
      const name = e.currentTarget.dataset.delallBv || e.currentTarget.getAttribute('data-delall-bv');
      if(!confirm(`確定刪除「${name}」的所有 BV 紀錄？`)) return;
      state.data.bv.items = state.data.bv.items.filter(x=>x.name!==name);
      recalcTotals(); renderBV(); updateKPI(false);
    });
  });
}

function renderIBV(){
  const tb = $('#ibvTbody'); tb.innerHTML='';
  const grouped = groupByName(state.data.ibv.items);
  grouped.forEach((g,i)=>{
    const row = document.createElement('div');
    row.className='tbody-row';
    row.innerHTML = `
      <span>${i+1}</span>
      <span>${g.name}</span>
      <span>${g.sum}</span>
      <span>${g.count}</span>
      <span><button class="btn-line" data-view-ibv="${g.name}">查看</button></span>
      <span class="right"><button class="btn-line btn-danger" data-delall-ibv="${g.name}">刪除</button></span>`;
    tb.appendChild(row);
  });
  tb.querySelectorAll('button[data-view-ibv]').forEach(b=>{
    b.addEventListener('click', e=>{
      const name = e.currentTarget.dataset.viewIbv || e.currentTarget.getAttribute('data-view-ibv');
      const list = state.data.ibv.items.filter(x=>x.name===name);
      openDetail('IBV', name, list, (idx)=>{
        const real = state.data.ibv.items.filter(x=>x.name===name)[idx];
        const at = state.data.ibv.items.indexOf(real);
        if(at>-1){ state.data.ibv.items.splice(at,1); recalcTotals(); renderIBV(); updateKPI(false); }
      });
    });
  });
  tb.querySelectorAll('button[data-delall-ibv]').forEach(b=>{
    b.addEventListener('click', e=>{
      const name = e.currentTarget.dataset.delallIbv || e.currentTarget.getAttribute('data-delall-ibv');
      if(!confirm(`確定刪除「${name}」的所有 IBV 紀錄？`)) return;
      state.data.ibv.items = state.data.ibv.items.filter(x=>x.name!==name);
      recalcTotals(); renderIBV(); updateKPI(false);
    });
  });
}

/* Button binds */
$('#btnAddRecruit').addEventListener('click', ()=>{
  const before = { r: state.data.recruit.list.length, bv: state.data.bv.total, ibv: state.data.ibv.total };
  const date = $('#rDate').value || today();
  const name = $('#rName').value.trim() || '未命名';
  state.data.recruit.list.push({date,name}); save(LS_KEY,state.data);
  $('#rName').value='';
  renderRecruit();
  const after = { r: state.data.recruit.list.length, bv: state.data.bv.total, ibv: state.data.ibv.total };
  updateKPI(false);
  maybeCelebrate('r', before, after);
});

$('#btnAddBV').addEventListener('click', ()=>{
  const before = { r: state.data.recruit.list.length, bv: state.data.bv.total, ibv: state.data.ibv.total };
  const date=$('#bvDate').value||today(), name=($('#bvName').value.trim()||'未命名');
  const item=$('#bvItem').value.trim()||'-', val=num($('#bvValue').value);
  if(!val){ alert('請輸入 BV 數值'); return; }
  state.data.bv.items.push({date,name,item,value:val}); recalcTotals();
  $('#bvItem').value=''; $('#bvValue').value='';
  renderBV();
  const after = { r: state.data.recruit.list.length, bv: state.data.bv.total, ibv: state.data.ibv.total };
  updateKPI(false);
  maybeCelebrate('bv', before, after);
});

$('#btnAddIBV').addEventListener('click', ()=>{
  const before = { r: state.data.recruit.list.length, bv: state.data.bv.total, ibv: state.data.ibv.total };
  const date=$('#ibvDate').value||today(), name=($('#ibvName').value.trim()||'未命名');
  const item=$('#ibvItem').value.trim()||'-', val=num($('#ibvValue').value);
  if(!val){ alert('請輸入 IBV 數值'); return; }
  state.data.ibv.items.push({date,name,item,value:val}); recalcTotals();
  $('#ibvItem').value=''; $('#ibvValue').value='';
  renderIBV();
  const after = { r: state.data.recruit.list.length, bv: state.data.bv.total, ibv: state.data.ibv.total };
  updateKPI(false);
  maybeCelebrate('ibv', before, after);
});

$('#btnAddPerson')?.addEventListener('click', ()=>{
  const name = $('#pName').value.trim(); if(!name) return;
  const city = $('#city').value; const group = $('#pGroup').value.trim();
  const date = $('#pDate').value||today(); const note = $('#pNote').value.trim();
  if(!state.data.people[name]) state.data.people[name] = {city, group, logs:[]};
  state.data.people[name].city = city; state.data.people[name].group = group;
  state.data.people[name].logs.push({date, note});
  save(LS_KEY,state.data);
  // datalist memory
  addToDatalist('#pNameList', name); if(group) addToDatalist('#pGroupList', group);
  // clear fields for next input
  $('#pName').value=''; $('#pGroup').value=''; $('#pNote').value='';
  renderPeople();
});
$('#btnClearPerson')?.addEventListener('click', ()=>{ $('#pName').value=''; $('#pGroup').value=''; $('#pNote').value=''; });

function addToDatalist(sel, val){
  const dl = $(sel); if(!dl || !val) return;
  if([...(dl.options||[])].some(o=>o.value===val)) return;
  const o = document.createElement('option'); o.value = val; dl.appendChild(o);
}

function renderPeople(){
  const tb = $('#peopleTbody'); if(!tb) return; tb.innerHTML='';
  const entries = Object.entries(state.data.people).map(([name,info])=>{
    const last = (info.logs||[]).slice().sort((a,b)=>b.date.localeCompare(a.date))[0]?.date || '';
    return {name, city:info.city, group:info.group, last, count:(info.logs||[]).length};
  }).sort((a,b)=>a.name.localeCompare(b.name));
  entries.forEach((p,i)=>{
    const row = document.createElement('div');
    row.className='tbody-row';
    row.innerHTML = `
      <span>${i+1}</span>
      <span>${p.city||''}</span>
      <span>${p.name}</span>
      <span>${p.group||''}</span>
      <span>${p.last||''}</span>
      <span>${p.count}</span>
      <span class="right"><button class="btn-line" data-view-person="${p.name}">查看</button></span>`;
    tb.appendChild(row);
  });
  tb.querySelectorAll('button[data-view-person]').forEach(b=>{
    b.addEventListener('click', e=>{
      const name = e.currentTarget.dataset.viewPerson || e.currentTarget.getAttribute('data-view-person');
      const info = state.data.people[name]; if(!info) return;
      const list = (info.logs||[]).slice().sort((a,b)=>a.date.localeCompare(b.date)).map(x=>({date:x.date, item:'', value:x.note}));
      $('#modalTitle').textContent = `【${name}】(${info.city}｜${info.group||''}) 互動紀錄`;
      const box = $('#detailList'); box.innerHTML='';
      list.forEach((r, idx)=>{
        const row = document.createElement('div'); row.className='detail-row';
        row.innerHTML = `<span>${r.date}｜${r.value}</span>`;
        box.appendChild(row);
      });
      $('#modal').hidden=false;
      $('#modalClose').onclick = ()=> $('#modal').hidden=true;
    });
  });
}

/* CSV export */
$('#btnCSV').addEventListener('click', ()=>{
  const rows = [];
  rows.push(['type','date','name','item','value','city','group','note'].join(','));
  state.data.recruit.list.forEach(r=>rows.push(['RECRUIT',r.date,r.name,'',''].join(',')));
  state.data.bv.items.forEach(r=>rows.push(['BV',r.date,r.name,r.item,r.value].join(',')));
  state.data.ibv.items.forEach(r=>rows.push(['IBV',r.date,r.name,r.item,r.value].join(',')));
  Object.entries(state.data.people).forEach(([name,p])=> (p.logs||[]).forEach(l=> rows.push(['312',l.date,name,'','',p.city,p.group,l.note.replaceAll(',',' ')].join(',')) ));
  const blob = new Blob([rows.join('\n')],{type:'text/csv;charset=utf-8;'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='ifnt.csv'; a.click();
});

/* Initial render */
function initListsFromData(){
  // This project uses free typing; datalist for 312 only
  const names = Object.keys(state.data.people);
  names.forEach(n=>addToDatalist('#pNameList', n));
  const groups = [...new Set(Object.values(state.data.people).map(p=>p.group).filter(Boolean))];
  groups.forEach(g=>addToDatalist('#pGroupList', g));
}
function renderAll(){
  recalcTotals();
  renderRecruit();
  renderBV();
  renderIBV();
  renderPeople();
  updateKPI(false);
}
renderAll();
initListsFromData();
