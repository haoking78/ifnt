
// IFNT v6.2.6 - shared name-group memory & auto-fill
const $ = (s)=>document.querySelector(s);
const $$ = (s)=>document.querySelectorAll(s);
const store = {
  get:(k,d)=>{ try{ return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } },
  set:(k,v)=>localStorage.setItem(k,JSON.stringify(v))
};
const state = store.get('ifnt-state', {
  recruits: [],
  bvMap: {},
  ibvMap: {},
  people: [],
  settings: { bvTarget:1500, ibvTarget:300 },
  nameGroups: {} // NEW: { "姓名": "族群/關係" }
});
function save(){ store.set('ifnt-state', state); }

// Tabs
$$('.tab').forEach(t=>t.addEventListener('click', e=>{
  $$('.tab').forEach(x=>x.classList.remove('active'));
  e.currentTarget.classList.add('active');
  const id = e.currentTarget.dataset.tab;
  ['recruit','bv','ibv','list'].forEach(sec=>$('#'+sec).style.display = (sec===id?'block':'none'));
}));

['#rDate','#bvDate','#ibvDate','#pDate'].forEach(id=>{ const el=$(id); if(el) el.valueAsDate=new Date(); });

const cities=["基隆市","臺北市","新北市","桃園市","新竹市","新竹縣","苗栗縣","臺中市","彰化縣","南投縣","雲林縣","嘉義市","嘉義縣","臺南市","高雄市","屏東縣","宜蘭縣","花蓮縣","臺東縣","澎湖縣","金門縣","連江縣"];
$('#city').innerHTML = cities.map(c=>`<option value="${c}">${c}</option>`).join('');

const nz = v => (v ?? '').toString().trim();
const sum = (arr, pick= x => x) => arr.reduce((s,v)=>s+(typeof pick==='function'?pick(v):v),0);

// Settings
function openSettings(){ $('#inpTargetBV').value=state.settings.bvTarget||1500; $('#inpTargetIBV').value=state.settings.ibvTarget||300; $('#settingsModal').style.display='block'; }
function closeSettings(){ $('#settingsModal').style.display='none'; }
function saveSettings(){ const bv=Number($('#inpTargetBV').value||0), ibv=Number($('#inpTargetIBV').value||0); if(bv<=0||ibv<=0) return alert('請輸入大於 0 的目標數值'); state.settings.bvTarget=bv; state.settings.ibvTarget=ibv; save(); closeSettings(); updateTargetsBadge(); }
$('#btnOpenSettings').addEventListener('click', openSettings);
$('#btnCloseSettings').addEventListener('click', closeSettings);
$('#btnSaveSettings').addEventListener('click', saveSettings);
$('#settingsModal').addEventListener('click', (e)=>{ if(e.target.id==='settingsModal') closeSettings(); });

// Badges & fireworks
let _wasBVOK=false,_wasIBVOK=false;
function shootConfetti(anchorEl){
  const colors=["#22c55e","#86efac","#16a34a","#10b981","#34d399","#f59e0b","#f97316","#06b6d4","#3b82f6","#a78bfa"];
  const box=document.createElement('div'); box.className='confetti'; document.body.appendChild(box);
  const rect=anchorEl.getBoundingClientRect(); const cx=rect.left+rect.width/2;
  for(let i=0;i<24;i++){ const p=document.createElement('i'); p.style.setProperty('--x',(cx+(Math.random()*240-120))+'px'); p.style.setProperty('--c', colors[i%colors.length]); box.appendChild(p); }
  setTimeout(()=>box.remove(), 1000);
}
function celebrateBadge(el){ if(!el) return; el.classList.add('badge-achieved'); shootConfetti(el); setTimeout(()=>el.classList.remove('badge-achieved'),1200); }
const fwCanvas = document.getElementById('fwCanvas'); const fwCtx = fwCanvas.getContext('2d');
function resizeFW(){ fwCanvas.width=innerWidth; fwCanvas.height=innerHeight; } addEventListener('resize', resizeFW); resizeFW();
let fwAnim=null;
function fireworks(durationMs=1200){ fwCanvas.style.display='block'; const W=fwCanvas.width,H=fwCanvas.height; const cx=W/2,cy=H/3; const ps=[]; const cs=['#22c55e','#86efac','#16a34a','#10b981','#34d399','#f59e0b','#f97316','#06b6d4','#3b82f6','#a78bfa']; for(let i=0;i<150;i++){ const a=Math.PI*2*Math.random(); const s=2+Math.random()*4; ps.push({x:cx,y:cy,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:0,maxLife:40+Math.random()*20,color:cs[i%cs.length],size:2+Math.random()*2}); } cancelAnimationFrame(fwAnim); const start=performance.now(); function tick(t){ const e=t-start; fwCtx.clearRect(0,0,W,H); fwCtx.fillStyle='rgba(0,0,0,0.05)'; fwCtx.fillRect(0,0,W,H); ps.forEach(p=>{ p.x+=p.vx; p.y+=p.vy; p.vy+=0.03; p.life++; const a=Math.max(0,1-p.life/p.maxLife); fwCtx.globalAlpha=a; fwCtx.fillStyle=p.color; fwCtx.beginPath(); fwCtx.arc(p.x,p.y,p.size,0,Math.PI*2); fwCtx.fill(); }); fwCtx.globalAlpha=1; if(e<durationMs){ fwAnim=requestAnimationFrame(tick);} else { fwCtx.clearRect(0,0,W,H); fwCanvas.style.display='none'; } } fwAnim=requestAnimationFrame(tick); }

function updateTargetsBadge(){
  const bvTotal = Object.values(state.bvMap).reduce((s,p)=>s+p.total,0);
  const ibvTotal = Object.values(state.ibvMap).reduce((s,p)=>s+p.total,0);
  const bvBadge = $('#bvBadge'), ibvBadge = $('#ibvBadge');
  const bvOK = bvTotal >= state.settings.bvTarget;
  const ibvOK = ibvTotal >= state.settings.ibvTarget;

  if(bvOK){ bvBadge.textContent='已達標'; bvBadge.classList.remove('badge-red'); bvBadge.classList.add('badge-green'); if(!_wasBVOK){ celebrateBadge(bvBadge); fireworks(1200);} }
  else{ const left=state.settings.bvTarget-bvTotal; bvBadge.textContent='距離 '+left; bvBadge.classList.remove('badge-green'); bvBadge.classList.add('badge-red'); }

  if(ibvOK){ ibvBadge.textContent='已達標'; ibvBadge.classList.remove('badge-red'); ibvBadge.classList.add('badge-green'); if(!_wasIBVOK){ celebrateBadge(ibvBadge); fireworks(1200);} }
  else{ const left=state.settings.ibvTarget-ibvTotal; ibvBadge.textContent='距離 '+left; ibvBadge.textContent='距離 '+left; ibvBadge.classList.remove('badge-green'); ibvBadge.classList.add('badge-red'); }

  _wasBVOK=bvOK; _wasIBVOK=ibvOK;
}

// Recruit
$('#btnAddRecruit').addEventListener('click', ()=>{
  const date=$('#rDate').value, name=nz($('#rName').value);
  if(!name) return alert('請輸入姓名');
  state.recruits.push({date,name}); save(); renderRecruit();
});
function renderRecruit(){
  const tb=$('#rTable tbody');
  tb.innerHTML = state.recruits.map((r,i)=>`<tr>
    <td>${i+1}</td><td>${r.date}</td><td>${r.name}</td>
    <td><button class="btn warn" data-del="${i}">刪除</button></td>
  </tr>`).join('');
  tb.querySelectorAll('button[data-del]').forEach(b=>b.onclick=()=>{ state.recruits.splice(+b.dataset.del,1); save(); renderRecruit(); });
}

// BV
$('#btnAddBV').addEventListener('click', ()=>{
  const date=$('#bvDate').value, name=nz($('#bvName').value)||'（未填名）', item=nz($('#bvItem').value), val=Number($('#bvValue').value||0);
  if(!val) return alert('請填 BV 數值');
  if(!state.bvMap[name]) state.bvMap[name]={name,items:[],total:0};
  state.bvMap[name].items.push({date,item,bv:val});
  state.bvMap[name].total = sum(state.bvMap[name].items, x=>x.bv);
  save(); $('#bvName').value=''; $('#bvItem').value=''; $('#bvValue').value=''; $('#bvDate').valueAsDate=new Date();
  renderBV(); updateTargetsBadge(); refreshNameLists();
});
function renderBV(){
  const arr = Object.values(state.bvMap).sort((a,b)=>b.total-a.total);
  $('#bvTbody').innerHTML = arr.map((p,i)=>`<tr>
    <td>${i+1}</td><td>${p.name}</td><td>${p.items.length}</td><td>${p.total}</td>
    <td><button class="btn" onclick="viewBV('${p.name.replace(/'/g,\"\\'\")}')">查看</button>
        <button class="btn warn" onclick="delBV('${p.name.replace(/'/g,\"\\'\")}')">刪除</button></td>
  </tr>`).join('') || '<tr><td colspan="5" class="note">尚無資料</td></tr>';
}
window.viewBV = (name)=>{
  const p = state.bvMap[name]; if(!p) return;
  alert(`${name} 的 BV 記錄（共 ${p.total}）\n\n` + p.items.map(x=>`• ${x.date}｜${x.item}｜${x.bv}`).join('\n'));
};
window.delBV = (name)=>{
  if(confirm(`刪除「${name}」的所有 BV 記錄？`)){ delete state.bvMap[name]; save(); renderBV(); updateTargetsBadge(); refreshNameLists(); }
};

// IBV
$('#btnAddIBV').addEventListener('click', ()=>{
  const date=$('#ibvDate').value, name=nz($('#ibvName').value)||'（未填名）', item=nz($('#ibvItem').value), val=Number($('#ibvValue').value||0);
  if(!val) return alert('請填 IBV 數值');
  if(!state.ibvMap[name]) state.ibvMap[name]={name,items:[],total:0};
  state.ibvMap[name].items.push({date,item,ibv:val});
  state.ibvMap[name].total = sum(state.ibvMap[name].items, x=>x.ibv);
  save(); $('#ibvName').value=''; $('#ibvItem').value=''; $('#ibvValue').value=''; $('#ibvDate').valueAsDate=new Date();
  renderIBV(); updateTargetsBadge(); refreshNameLists();
});
function renderIBV(){
  const arr = Object.values(state.ibvMap).sort((a,b)=>b.total-a.total);
  $('#ibvTbody').innerHTML = arr.map((p,i)=>`<tr>
    <td>${i+1}</td><td>${p.name}</td><td>${p.items.length}</td><td>${p.total}</td>
    <td><button class="btn" onclick="viewIBV('${p.name.replace(/'/g,\"\\'\")}')">查看</button>
        <button class="btn warn" onclick="delIBV('${p.name.replace(/'/g,\"\\'\")}')">刪除</button></td>
  </tr>`).join('') || '<tr><td colspan="5" class="note">尚無資料</td></tr>';
}
window.viewIBV = (name)=>{
  const p = state.ibvMap[name]; if(!p) return;
  alert(`${name} 的 IBV 記錄（共 ${p.total}）\n\n` + p.items.map(x=>`• ${x.date}｜${x.item}｜${x.ibv}`).join('\n'));
};
window.delIBV = (name)=>{
  if(confirm(`刪除「${name}」的所有 IBV 記錄？`)){ delete state.ibvMap[name]; save(); renderIBV(); updateTargetsBadge(); refreshNameLists(); }
};

// 312 - auto-fill group by name & shared names
$('#btnAddLog').addEventListener('click', ()=>{
  const city=$('#city').value, name=nz($('#pName').value), group=nz($('#pGroup').value), date=$('#pDate').value, note=nz($('#pNote').value);
  if(!name) return alert('請輸入姓名');
  let p = state.people.find(x=>x.name===name);
  if(!p){ p={city,name,group,logs:[]}; state.people.push(p); }
  p.city = city || p.city;
  if(group){ p.group = group; state.nameGroups[name]=group; } // update name→group memory
  p.logs.push({date, note}); save();
  $('#pName').value=''; $('#pGroup').value=''; $('#pNote').value=''; $('#pDate').valueAsDate=new Date();
  renderPeople(); refreshNameLists();
});

// When typing/choosing a name, auto-fill group if we have memory
function hookAutoFill(){
  const np=$('#pName'); const gp=$('#pGroup');
  if(!np || !gp) return;
  const apply = ()=>{
    const name = np.value.trim();
    if(name && state.nameGroups[name]){
      gp.value = state.nameGroups[name];
    }
  };
  np.addEventListener('change', apply);
  np.addEventListener('blur', apply);
  np.addEventListener('input', ()=>{
    // if user typed a full existing name, also apply
    const nm = np.value.trim();
    if(state.nameGroups[nm]) gp.value = state.nameGroups[nm];
  });
}
hookAutoFill();

function renderPeople(){
  const names=[...new Set(state.people.map(p=>p.name)
    .concat(Object.keys(state.bvMap))
    .concat(Object.keys(state.ibvMap)))];
  const groups=[...new Set(state.people.map(p=>p.group).filter(Boolean)
    .concat(Object.values(state.nameGroups||{})))];
  $('#nameList').innerHTML = names.map(n=>`<option value="${n}">`).join('');
  $('#groupList').innerHTML = groups.map(g=>`<option value="${g}">`).join('');

  const tb = $('#peopleTable tbody');
  tb.innerHTML = state.people.map((p,i)=>{
    const latest = p.logs.length? p.logs[p.logs.length-1].date : '';
    return `<tr>
      <td>${i+1}</td><td>${p.city||''}</td><td>${p.name}</td><td>${p.group||''}</td>
      <td>${latest}</td><td>${p.logs.length}</td>
      <td><button class="btn" data-view="${i}">查看</button>
          <button class="btn warn" data-del="${i}">刪除</button></td>
    </tr>`;
  }).join('') || '<tr><td colspan="7" class="note">尚無資料</td></tr>';
  tb.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{ state.people.splice(+b.dataset.del,1); save(); renderPeople(); refreshNameLists(); });
  tb.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{
    const p = state.people[+b.dataset.view];
    alert(`${p.name}（${p.city||''} / ${p.group||''}）\n\n` + p.logs.map(l=>`${l.date}  ${l.note}`).join('\n'));
  });
}

function refreshNameLists(){
  // refresh all datalists for name inputs
  const names=[...new Set(state.people.map(p=>p.name)
    .concat(Object.keys(state.bvMap))
    .concat(Object.keys(state.ibvMap)))].sort();
  const html = names.map(n=>`<option value="${n}">`).join('');
  const lists=['#nameList','#nameList2'];
  lists.forEach(id=>{ const dl=document.querySelector(id); if(dl) dl.innerHTML = html; });
}

// CSV export
$('#btnExport').addEventListener('click', ()=>{
  const L=[]; L.push('"IFNT 匯出","v6.2.6","'+new Date().toISOString()+'"');
  L.push('--- 招募'); L.push('"日期","姓名"'); state.recruits.forEach(x=>L.push(`"${x.date}","${x.name.replace(/"/g,'""')}"`));
  L.push('--- BV(每人彙總)'); L.push('"姓名","筆數","小計BV","明細"');
  Object.values(state.bvMap).forEach(p=>{ const d=p.items.map(x=>`${x.date} ${x.item} ${x.bv}`).join(' | '); L.push(`"${p.name.replace(/"/g,'""')}",${p.items.length},${p.total},"${d.replace(/"/g,'""')}"`); });
  L.push('--- IBV(每人彙總)'); L.push('"姓名","筆數","小計IBV","明細"');
  Object.values(state.ibvMap).forEach(p=>{ const d=p.items.map(x=>`${x.date} ${x.item} ${x.ibv}`).join(' | '); L.push(`"${p.name.replace(/"/g,'""')}",${p.items.length},${p.total},"${d.replace(/"/g,'""')}"`); });
  L.push('--- 312 名單'); L.push('"縣市","姓名","族群","最近互動日","次數","完整紀錄"');
  state.people.forEach(p=>{ const latest=p.logs.length?p.logs[p.logs.length-1].date:''; const logs=p.logs.map(l=>`${l.date} ${l.note}`).join(' | ');
    L.push(`"${(p.city||'').replace(/"/g,'""')}","${p.name.replace(/"/g,'""')}","${(p.group||'').replace(/"/g,'""')}","${latest}",${p.logs.length},"${logs.replace(/"/g,'""')}"`);
  });
  const blob=new Blob([L.join('\n')],{type:'text/csv;charset=utf-8'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='IFNT_export_v6.2.6.csv'; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),500);
});

// Clear buttons
$$('.btn.ghost').forEach(b=>b.addEventListener('click',()=>{
  const k=b.dataset.clear;
  if(k==='recruit'){ $('#rName').value=''; $('#rDate').valueAsDate=new Date(); }
  if(k==='bv'){ $('#bvName').value=''; $('#bvItem').value=''; $('#bvValue').value=''; $('#bvDate').valueAsDate=new Date(); }
  if(k==='ibv'){ $('#ibvName').value=''; $('#ibvItem').value=''; $('#ibvValue').value=''; $('#ibvDate').valueAsDate=new Date(); }
  if(k==='list'){ $('#pName').value=''; $('#pGroup').value=''; $('#pNote').value=''; $('#pDate').valueAsDate=new Date(); }
}));

function renderAll(){ renderRecruit(); renderBV(); renderIBV(); renderPeople(); refreshNameLists(); updateTargetsBadge(); }
document.addEventListener('DOMContentLoaded', renderAll);
window.addEventListener('pageshow', e=>{ if(e.persisted) renderAll(); });
