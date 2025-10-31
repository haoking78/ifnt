
// IFNT minimal app with localStorage + progress + fireworks on reaching targets.

const LS = {
  goals: 'ifnt_goals_v1',
  recruit: 'ifnt_recruit_v1',
  bv: 'ifnt_bv_v1',
  ibv: 'ifnt_ibv_v1',
  list: 'ifnt_list_v1',
  fxState: 'ifnt_fx_state_v1'
};

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

function todayISO(){ const d = new Date(); return d.toISOString().slice(0,10); }

// --- State ---
let goals = JSON.parse(localStorage.getItem(LS.goals) || '{"recruit":1,"bv":1500,"ibv":300}');
let recruit = JSON.parse(localStorage.getItem(LS.recruit) || '[]');
let bv = JSON.parse(localStorage.getItem(LS.bv) || '[]');      // [{name,item,val,date}]
let ibv = JSON.parse(localStorage.getItem(LS.ibv) || '[]');    // [{name,item,val,date}]
let list = JSON.parse(localStorage.getItem(LS.list) || '[]');  // [{city,name,group,logs:[{date,note}], latest, times}]

// --- Elements ---
const goalRecruit = $('#goalRecruit'), goalBV = $('#goalBV'), goalIBV = $('#goalIBV');
const goalNow = $('#goalNow');
const pRecruit=$('#pRecruit'), pBV=$('#pBV'), pIBV=$('#pIBV');
const pRecruitVal=$('#pRecruitVal'), pBVVal=$('#pBVVal'), pIBVVal=$('#pIBVVal'), pNote=$('#pNote');
const goalRecruitShow=$('#goalRecruitShow'), goalBVShow=$('#goalBVShow'), goalIBVShow=$('#goalIBVShow');
const bvGoalTitle=$('#bvGoalTitle'), ibvGoalTitle=$('#ibvGoalTitle');

// Forms
$('#bvDate').value = todayISO();
$('#ibvDate').value = todayISO();
$('#listDate').value = todayISO();
$('#rDate').value = todayISO();

// --- Tabs ---
$$('.tab').forEach(btn=>{
  btn.addEventListener('click',()=>{
    $$('.tab').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const t = btn.dataset.tab;
    $$('.tabpane').forEach(p=>p.classList.remove('active'));
    $('#tab-'+t).classList.add('active');
  });
});

// --- Goal form toggle ---
const goalForm = $('#goalForm');
const toggleGoal = $('#toggleGoal');
let collapsed = JSON.parse(localStorage.getItem('ifnt_goal_collapsed') || 'true');
function renderGoalCollapsed(){
  goalForm.style.display = collapsed ? 'none' : 'block';
  toggleGoal.textContent = collapsed ? '展開' : '收合';
}
toggleGoal.addEventListener('click',()=>{
  collapsed = !collapsed; localStorage.setItem('ifnt_goal_collapsed', JSON.stringify(collapsed));
  renderGoalCollapsed();
});
renderGoalCollapsed();

// --- Save goals ---
goalRecruit.value = goals.recruit;
goalBV.value = goals.bv;
goalIBV.value = goals.ibv;

function saveGoals(){
  goals = { recruit: +goalRecruit.value||0, bv:+goalBV.value||0, ibv:+goalIBV.value||0 };
  localStorage.setItem(LS.goals, JSON.stringify(goals));
  goalNow.textContent = `目前目標：招募 ${goals.recruit}人 / BV ${goals.bv} / IBV ${goals.ibv}`;
  goalRecruitShow.textContent = goals.recruit;
  goalBVShow.textContent = goals.bv;
  goalIBVShow.textContent = goals.ibv;
  bvGoalTitle.textContent = `${goals.bv} BV`;
  ibvGoalTitle.textContent = `${goals.ibv} IBV`;
  updateProgress();
}
$('#saveGoals').addEventListener('click', saveGoals);
saveGoals();

// --- Helpers: aggregate by name ---
function aggregateByName(rows){
  const map = new Map();
  rows.forEach(r=>{
    const key = r.name?.trim() || '(未填)';
    const cur = map.get(key) || {name:key, sum:0, count:0, items:[]};
    cur.sum += (+r.val||0);
    cur.count += 1;
    cur.items.push(r);
    map.set(key, cur);
  });
  return Array.from(map.values()).sort((a,b)=>b.sum-a.sum);
}

// --- Render tables ---
function renderRecruit(){
  const tb = $('#rTable tbody'); tb.innerHTML='';
  recruit.forEach((r,i)=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${i+1}</td><td>${r.date||''}</td><td>${r.name||''}</td>
    <td><button class="btn ghost small" data-del="${i}" data-type="recruit">刪除</button></td>`;
    tb.appendChild(tr);
  });
  $('#rTotal').textContent = recruit.length;
}

function renderBV(){
  const tb = $('#bvTable tbody'); tb.innerHTML='';
  const agg = aggregateByName(bv);
  agg.forEach((g,i)=>{
    const tr=document.createElement('tr');
    tr.innerHTML = `<td>${i+1}</td><td>${g.name}</td><td>${g.sum}</td><td>${g.count}</td>
      <td><button class="btn ghost small" data-view="${g.name}" data-type="bv">查看</button></td>
      <td><button class="btn ghost small" data-delname="${g.name}" data-type="bv">刪除</button></td>`;
    tb.appendChild(tr);
  });
  $('#bvSum').textContent = agg.reduce((s,a)=>s+a.sum,0);
}

function renderIBV(){
  const tb = $('#ibvTable tbody'); tb.innerHTML='';
  const agg = aggregateByName(ibv);
  agg.forEach((g,i)=>{
    const tr=document.createElement('tr');
    tr.innerHTML = `<td>${i+1}</td><td>${g.name}</td><td>${g.sum}</td><td>${g.count}</td>
      <td><button class="btn ghost small" data-view="${g.name}" data-type="ibv">查看</button></td>
      <td><button class="btn ghost small" data-delname="${g.name}" data-type="ibv">刪除</button></td>`;
    tb.appendChild(tr);
  });
  $('#ibvSum').textContent = agg.reduce((s,a)=>s+a.sum,0);
}

function renderList(){
  const tb = $('#listTable tbody'); tb.innerHTML='';
  list.forEach((p,i)=>{
    const tr=document.createElement('tr');
    tr.innerHTML = `<td>${i+1}</td><td>${p.city||''}</td><td>${p.name||''}</td><td>${p.group||''}</td>
      <td>${p.latest||''}</td><td>${p.times||0}</td>
      <td><button class="btn ghost small" data-view="${p.name}" data-type="list">查看</button></td>`;
    tb.appendChild(tr);
  });
}

// --- Progress & FX ---
function perc(n,d){ return d<=0 ? 0 : Math.min(100, Math.round(n*100/d)); }

function updateProgress(){
  const rNow = recruit.length;
  const bvNow = aggregateByName(bv).reduce((s,a)=>s+a.sum,0);
  const ibvNow = aggregateByName(ibv).reduce((s,a)=>s+a.sum,0);

  const rp = perc(rNow, goals.recruit), bp = perc(bvNow, goals.bv), ip = perc(ibvNow, goals.ibv);
  pRecruit.style.width = rp+'%'; pRecruitVal.textContent = rp+'%';
  pBV.style.width = bp+'%'; pBVVal.textContent = bp+'%';
  pIBV.style.width = ip+'%'; pIBVVal.textContent = ip+'%';
  pNote.textContent = `招募 ${rNow}/${goals.recruit} · BV ${bvNow}/${goals.bv} · IBV ${ibvNow}/${goals.ibv}`;

  // fire only when crossing threshold (per type)
  const state = JSON.parse(localStorage.getItem(LS.fxState)||'{}');
  function check(key, now, goal){
    const hit = now>=goal, prev = !!state[key];
    if(hit && !prev){ playFireworks(); state[key]=true; }
    if(!hit && prev){ state[key]=false; } // reset if goals change
  }
  check('recruit', rNow, goals.recruit);
  check('bv', bvNow, goals.bv);
  check('ibv', ibvNow, goals.ibv);
  localStorage.setItem(LS.fxState, JSON.stringify(state));
}

// Fireworks + sound
const fxCanvas = $('#fxCanvas'), ctx = fxCanvas.getContext('2d');
const fxAudio = $('#fxAudio');
function resizeCanvas(){ fxCanvas.width = window.innerWidth; fxCanvas.height = window.innerHeight; }
resizeCanvas(); window.addEventListener('resize', resizeCanvas);

function playFireworks(){
  // sound
  try{ fxAudio.currentTime = 0; fxAudio.volume = 1.0; fxAudio.play().catch(()=>{});}catch(e){}
  // simple particles
  fxCanvas.classList.remove('hidden');
  const particles = [];
  const centerX = fxCanvas.width/2, centerY = fxCanvas.height/3;
  const colors = ['#6df3d8','#fff387','#ff8e53','#6cc3ff','#9cffb7'];
  for(let i=0;i<220;i++){
    const ang = Math.random()*Math.PI*2, spd = Math.random()*4+2;
    particles.push({
      x:centerX, y:centerY,
      vx: Math.cos(ang)*spd, vy: Math.sin(ang)*spd,
      life: 60+Math.random()*30, color: colors[i%colors.length]
    });
  }
  let t=0;
  function tick(){
    ctx.clearRect(0,0,fxCanvas.width,fxCanvas.height);
    particles.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy; p.vy+=0.03; p.life--;
      ctx.fillStyle=p.color; ctx.globalAlpha=Math.max(0,p.life/90);
      ctx.fillRect(p.x,p.y,2,2);
      ctx.globalAlpha=1;
    });
    t++;
    if(t<90) requestAnimationFrame(tick); else fxCanvas.classList.add('hidden');
  }
  tick();
}

// --- Add handlers ---
$('#addRecruit').addEventListener('click', ()=>{
  const date=$('#rDate').value || todayISO();
  const name=$('#rName').value.trim();
  recruit.push({date,name});
  localStorage.setItem(LS.recruit, JSON.stringify(recruit));
  $('#rName').value='';
  renderRecruit(); updateProgress();
});

$('#addBV').addEventListener('click', ()=>{
  const date=$('#bvDate').value || todayISO();
  const name=$('#bvName').value.trim();
  const item=$('#bvItem').value.trim();
  const val= +$('#bvValue').value || 0;
  if(val<=0) return;
  bv.push({date,name,item,val});
  localStorage.setItem(LS.bv, JSON.stringify(bv));
  $('#bvItem').value=''; $('#bvValue').value=''; $('#bvName').value='';
  renderBV(); updateProgress();
});

$('#addIBV').addEventListener('click', ()=>{
  const date=$('#ibvDate').value || todayISO();
  const name=$('#ibvName').value.trim();
  const item=$('#ibvItem').value.trim();
  const val= +$('#ibvValue').value || 0;
  if(val<=0) return;
  ibv.push({date,name,item,val});
  localStorage.setItem(LS.ibv, JSON.stringify(ibv));
  $('#ibvItem').value=''; $('#ibvValue').value=''; $('#ibvName').value='';
  renderIBV(); updateProgress();
});

$('#addList').addEventListener('click', ()=>{
  const city=$('#citySelect').value;
  const name=$('#listName').value.trim();
  const group=$('#listGroup').value.trim();
  const date=$('#listDate').value || todayISO();
  const note=$('#listNote').value.trim();
  if(!name){ alert('請輸入姓名'); return; }
  let p = list.find(x=>x.name===name);
  if(!p){ p={city,name,group,logs:[],latest:'',times:0}; list.unshift(p); }
  p.city = city; p.group = group||p.group;
  p.logs.push({date,note}); p.latest=date; p.times=(p.times||0)+1;
  localStorage.setItem(LS.list, JSON.stringify(list));
  // auto clear inputs
  $('#listName').value=''; $('#listGroup').value=''; $('#listNote').value='';
  renderList();
});
$('#clearListInputs').addEventListener('click', ()=>{
  $('#listName').value=''; $('#listGroup').value=''; $('#listNote').value='';
});

// Delegated table actions
document.body.addEventListener('click', e=>{
  const t=e.target;
  if(t.dataset?.del!==undefined && t.dataset.type==='recruit'){
    const i=+t.dataset.del; recruit.splice(i,1);
    localStorage.setItem(LS.recruit, JSON.stringify(recruit));
    renderRecruit(); updateProgress();
  }
  if(t.dataset?.delname && t.dataset.type==='bv'){
    const name=t.dataset.delname; bv=bv.filter(x=> (x.name?.trim()||'(未填)') !== name);
    localStorage.setItem(LS.bv, JSON.stringify(bv)); renderBV(); updateProgress();
  }
  if(t.dataset?.delname && t.dataset.type==='ibv'){
    const name=t.dataset.delname; ibv=ibv.filter(x=> (x.name?.trim()||'(未填)') !== name);
    localStorage.setItem(LS.ibv, JSON.stringify(ibv)); renderIBV(); updateProgress();
  }
  if(t.dataset?.view && t.dataset.type==='bv'){
    const name=t.dataset.view;
    const rows = bv.filter(x=> (x.name?.trim()||'(未填)') === name);
    openModal(renderPersonDetail(name, rows));
  }
  if(t.dataset?.view && t.dataset.type==='ibv'){
    const name=t.dataset.view;
    const rows = ibv.filter(x=> (x.name?.trim()||'(未填)') === name);
    openModal(renderPersonDetail(name, rows));
  }
  if(t.dataset?.view && t.dataset.type==='list'){
    const name=t.dataset.view;
    const p = list.find(x=>x.name===name);
    const lines = (p?.logs||[]).map(l=>`${l.date} | ${l.note||''}`).join('\n');
    openModal(`【${p.name}】(${p.city}｜${p.group||''})\n${lines}`);
  }
});

function renderPersonDetail(name, rows){
  const lines = rows.sort((a,b)=> (a.date>b.date?-1:1))
    .map(r=>`${r.date} | ${r.item||''} ${r.val||0}`).join('\n');
  return `【${name}】\n${lines}`;
}

// Modal
const modal=$('#modal'), modalContent=$('#modalContent');
$('#modalClose').addEventListener('click', ()=> modal.classList.add('hidden'));
function openModal(text){
  modalContent.innerHTML = `<pre>${text}</pre>`;
  modal.classList.remove('hidden');
}

// CSV export
$('#exportCsvBtn').addEventListener('click', ()=>{
  const rows = [['類別','日期','姓名','品項','數值','備註']];
  recruit.forEach(r=>rows.push(['招募', r.date||'', r.name||'', '', '', '']));
  bv.forEach(r=>rows.push(['BV', r.date||'', r.name||'', r.item||'', r.val||0, '']));
  ibv.forEach(r=>rows.push(['IBV', r.date||'', r.name||'', r.item||'', r.val||0, '']));
  list.forEach(p=> (p.logs||[]).forEach(l=> rows.push(['312', l.date||'', p.name||'', p.group||'', '', l.note||''])) );
  const csv = rows.map(r=>r.map(x=> `"${String(x).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = 'IFNT_export.csv'; a.click(); URL.revokeObjectURL(a.href);
});

// Initial render
renderRecruit(); renderBV(); renderIBV(); renderList(); updateProgress();
