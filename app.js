
const $ = (s)=>document.querySelector(s);
const $$ = (s)=>document.querySelectorAll(s);
const store = (k,v)=>localStorage.setItem(k,JSON.stringify(v));
const load  = (k,d)=>{ try{ return JSON.parse(localStorage.getItem(k)) ?? d }catch{ return d }};

const goals = load('goals',{recruit:1,bv:1500,ibv:300});
const data  = load('data',{
  recruit:[], // {date,name}
  bv:[],      // {date,name,item,qty}
  ibv:[],     // {date,name,item,qty}
  people:{}   // name -> {city, group, logs:[{date,note}]}
});

function setToday(id){ const el=$(id); if(!el.value){ el.value = new Date().toISOString().slice(0,10); } }
['#rDate','#bvDate','#ibvDate','#pDate'].forEach(setToday);

$('#goalRecruit').value = goals.recruit; $('#goalBV').value=goals.bv; $('#goalIBV').value=goals.ibv;
function updateGoalCurrent(){ $('#goalCurrent').textContent = `目前目標：招募 ${goals.recruit} / BV ${goals.bv} / IBV ${goals.ibv}` }
updateGoalCurrent();

$('#toggleGoals').addEventListener('click', ()=>{
  const pnl = $('#goalPanel'); const open = pnl.hasAttribute('hidden');
  if(open){ pnl.removeAttribute('hidden'); $('#toggleGoals').textContent='收合'; }
  else{ pnl.setAttribute('hidden',''); $('#toggleGoals').textContent='展開'; }
});
$('#saveGoals').addEventListener('click', ()=>{
  goals.recruit = +$('#goalRecruit').value||0;
  goals.bv = +$('#goalBV').value||0;
  goals.ibv = +$('#goalIBV').value||0;
  store('goals',goals); updateBars(); updateGoalCurrent();
  $('#goalPanel').setAttribute('hidden',''); $('#toggleGoals').textContent='展開';
});

$$('.tab').forEach(btn=>btn.addEventListener('click',()=>{
  $$('.tab').forEach(b=>b.classList.remove('active')); btn.classList.add('active');
  $$('.tab-pane').forEach(p=>p.classList.remove('show'));
  $('#pane-'+btn.dataset.tab).classList.add('show');
}));

function addNameToList(id,value){ if(!value) return; const dl=$(id); if([...dl.options].some(o=>o.value===value)) return; const o=document.createElement('option'); o.value=value; dl.appendChild(o); }

$('#addRecruit').addEventListener('click', ()=>{
  data.recruit.push({date:$('#rDate').value, name:$('#rName').value.trim()});
  store('data',data); $('#rName').value=''; renderRecruit(); updateBars(true);
});
function renderRecruit(){
  const tb=$('#tblRecruit tbody'); tb.innerHTML='';
  data.recruit.forEach((r,i)=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`<td>${i+1}</td><td>${r.date}</td><td>${r.name||''}</td>
    <td><button class="btn secondary" data-i="${i}" data-kind="recruit-del">刪除</button></td>`;
    tb.appendChild(tr);
  });
  $('#sumRecruit').textContent = `${data.recruit.length}/${goals.recruit}`;
}
$('#tblRecruit').addEventListener('click',(e)=>{
  const b=e.target.closest('button[data-kind="recruit-del"]'); if(!b) return;
  const i=+b.dataset.i; data.recruit.splice(i,1); store('data',data); renderRecruit(); updateBars();
});

function groupByName(list){
  const map=new Map();
  list.forEach(x=>{
    const key=x.name||'(未填)';
    if(!map.has(key)) map.set(key,{name:key,sum:0,count:0,items:[]});
    const g=map.get(key); g.sum+=(+x.qty||0); g.count+=1; g.items.push(x);
  });
  return [...map.values()];
}
function renderGrouped(sel, list, kind){
  const tb=document.querySelector(sel); tb.innerHTML='';
  groupByName(list).forEach((g,i)=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`<td>${i+1}</td><td>${g.name}</td><td>${g.sum}</td><td>${g.count}</td>
    <td><button class="btn secondary" data-kind="${kind}-view" data-name="${g.name}">查看</button></td>
    <td><button class="btn secondary" data-kind="${kind}-del" data-name="${g.name}">刪除</button></td>`;
    tb.appendChild(tr);
  });
}
function viewLines(kind,name){
  const arr=(kind==='bv'?data.bv:data.ibv).filter(x=>(x.name||'(未填)')===name);
  const body=arr.map(x=>`${x.date} | ${x.item} ${x.qty}`).join('\n');
  $('#dialogContent').innerHTML=`<div style="white-space:pre-line;font-size:18px">【${name}】\n${body||'—'}</div>`;
  $('#viewDialog').showModal();
}
function delGroup(kind,name){
  if(kind==='bv') data.bv = data.bv.filter(x=>(x.name||'(未填)')!==name);
  else data.ibv = data.ibv.filter(x=>(x.name||'(未填)')!==name);
  store('data',data);
  renderGrouped(kind==='bv'?'#tblBV tbody':'#tblIBV tbody', kind==='bv'?data.bv:data.ibv, kind);
  updateBars();
}
document.body.addEventListener('click',(e)=>{
  const b=e.target.closest('button'); if(!b) return;
  const k=b.dataset.kind;
  if(k==='bv-view') viewLines('bv', b.dataset.name);
  if(k==='ibv-view') viewLines('ibv', b.dataset.name);
  if(k==='bv-del') delGroup('bv', b.dataset.name);
  if(k==='ibv-del') delGroup('ibv', b.dataset.name);
  if(b.id==='closeDialog') $('#viewDialog').close();
});

$('#addBV').addEventListener('click', ()=>{
  const entry={date:$('#bvDate').value,name:$('#bvName').value.trim(),item:$('#bvItem').value.trim(),qty:+$('#bvQty').value||0};
  if(entry.qty>0){ data.bv.push(entry); store('data',data); }
  addNameToList('#bvNameList', entry.name);
  $('#bvItem').value=''; $('#bvQty').value='';
  renderGrouped('#tblBV tbody', data.bv, 'bv'); updateBars(true);
});
$('#addIBV').addEventListener('click', ()=>{
  const entry={date:$('#ibvDate').value,name:$('#ibvName').value.trim(),item:$('#ibvItem').value.trim(),qty:+$('#ibvQty').value||0};
  if(entry.qty>0){ data.ibv.push(entry); store('data',data); }
  addNameToList('#ibvNameList', entry.name);
  $('#ibvItem').value=''; $('#ibvQty').value='';
  renderGrouped('#tblIBV tbody', data.ibv, 'ibv'); updateBars(true);
});

$('#addPerson').addEventListener('click', ()=>{
  const name=$('#pName').value.trim(); if(!name) return;
  const city=$('#city').value; const group=$('#pGroup').value.trim();
  const note=$('#pNote').value.trim(); const date=$('#pDate').value;
  if(!data.people[name]) data.people[name]={city,group,logs:[]};
  data.people[name].city=city; data.people[name].group=group;
  data.people[name].logs.push({date,note});
  store('data',data);
  addNameToList('#pNameList', name); if(group) addNameToList('#pGroupList', group);
  $('#pName').value=''; $('#pGroup').value=''; $('#pNote').value='';
  renderPeople();
});
$('#clearPersonForm').addEventListener('click', ()=>{ $('#pName').value=''; $('#pGroup').value=''; $('#pNote').value=''; });

function renderPeople(){
  const tb=$('#tblPeople tbody'); tb.innerHTML='';
  const entries=Object.entries(data.people).map(([name,info])=>{
    const last = (info.logs||[]).slice().sort((a,b)=>b.date.localeCompare(a.date))[0]?.date||'';
    return {name, city:info.city, group:info.group, last, count:(info.logs||[]).length};
  }).sort((a,b)=>a.name.localeCompare(b.name));
  entries.forEach((p,i)=>{
    const tr=document.createElement('tr');
    tr.innerHTML = `<td>${i+1}</td><td>${p.city}</td><td>${p.name}</td><td>${p.group||''}</td><td>${p.last||''}</td><td>${p.count}</td>
    <td><button class="btn secondary" data-kind="p-view" data-name="${p.name}">查看</button></td>`;
    tb.appendChild(tr);
  });
}
document.body.addEventListener('click',(e)=>{
  const b=e.target.closest('button[data-kind="p-view"]'); if(!b) return;
  const name=b.dataset.name; const info=data.people[name]; if(!info) return;
  const header=`【${name}】(${info.city}｜${info.group||''})`;
  const lines=(info.logs||[]).slice().sort((a,b)=>a.date.localeCompare(b.date)).map(x=>`${x.date}｜${x.note||''}`).join('\n');
  $('#dialogContent').innerHTML=`<div style="white-space:pre-line;font-size:18px">${header}\n${lines}</div>`;
  $('#viewDialog').showModal();
});

function sumQty(arr){ return arr.reduce((s,x)=>s+(+x.qty||0),0); }
const fired={recruit:false,bv:false,ibv:false};
function updateBars(play=false){
  const rec=data.recruit.length, bv=sumQty(data.bv), ibv=sumQty(data.ibv);
  const pct=(v,g)=>g>0?Math.min(100,Math.round(v/g*100)):0;
  const pr=pct(rec,goals.recruit), pb=pct(bv,goals.bv), pi=pct(ibv,goals.ibv);
  $('#barRecruit').style.width=pr+'%'; $('#pctRecruit').textContent=pr+'%'; $('#txtRecruit').textContent=`${rec}/${goals.recruit}`;
  $('#barBV').style.width=pb+'%'; $('#pctBV').textContent=pb+'%'; $('#txtBV').textContent=`${bv}/${goals.bv}`;
  $('#barIBV').style.width=pi+'%'; $('#pctIBV').textContent=pi+'%'; $('#txtIBV').textContent=`${ibv}/${goals.ibv}`;
  $('#sumRecruit').textContent=`${rec}/${goals.recruit}`; $('#sumBV').textContent=`${bv}/${goals.bv}`; $('#sumIBV').textContent=`${ibv}/${goals.ibv}`;
  celebrate('recruit', rec>=goals.recruit && goals.recruit>0, play);
  celebrate('bv', bv>=goals.bv && goals.bv>0, play);
  celebrate('ibv', ibv>=goals.ibv && goals.ibv>0, play);
}
function celebrate(key,hit,play){
  if(hit && !fired[key] && play){ fired[key]=true; fireworks(); sfxFirework(); }
  if(!hit) fired[key]=false;
}

// fireworks
function fireworks(){
  const cv=$('#fx'); const ctx=cv.getContext('2d');
  cv.style.display='block'; cv.width=innerWidth; cv.height=innerHeight;
  const cx=cv.width/2, cy=cv.height*0.35;
  const dots=Array.from({length:90},()=>({x:cx, y:cy, vx:(Math.random()*2-1)*4, vy:(Math.random()*2-1)*4, life:70+Math.random()*40 }));
  let t=0; const id=setInterval(()=>{
    ctx.fillStyle='rgba(15,47,47,.25)'; ctx.fillRect(0,0,cv.width,cv.height);
    dots.forEach(p=>{ p.x+=p.vx; p.y+=p.vy; p.vy+=0.05; p.life--; ctx.fillStyle=`hsl(${(p.life*4)%360} 90% 60%)`; ctx.fillRect(p.x,p.y,3,3); });
    if(++t>90){ clearInterval(id); cv.style.display='none'; }
  },16);
}
// audio
function sfxFirework(){
  const AC = window.AudioContext||window.webkitAudioContext; const ctx=new AC();
  const o=ctx.createOscillator(), g=ctx.createGain();
  o.type='sawtooth'; o.frequency.setValueAtTime(250,ctx.currentTime); o.frequency.exponentialRampToValueAtTime(1200,ctx.currentTime+0.9);
  g.gain.setValueAtTime(0.0001,ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.35,ctx.currentTime+0.2); g.gain.exponentialRampToValueAtTime(0.0001,ctx.currentTime+0.9);
  o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime+0.95);
  const dur=0.8, sr=ctx.sampleRate, len=Math.floor(sr*dur);
  const buf=ctx.createBuffer(1,len,sr); const ch=buf.getChannelData(0);
  for(let i=0;i<len;i++){ ch[i]=(Math.random()*2-1)*Math.exp(-3*i/len); }
  const noise=ctx.createBufferSource(); noise.buffer=buf;
  const g2=ctx.createGain(); g2.gain.value=0.9; noise.connect(g2).connect(ctx.destination);
  noise.start(ctx.currentTime+0.9); noise.stop(ctx.currentTime+1.7);
}

function initListsFromData(){
  [...new Set(data.bv.map(x=>x.name).filter(Boolean))].forEach(n=>addNameToList('#bvNameList',n));
  [...new Set(data.ibv.map(x=>x.name).filter(Boolean))].forEach(n=>addNameToList('#ibvNameList',n));
  Object.keys(data.people).forEach(n=>addNameToList('#pNameList',n));
  [...new Set(Object.values(data.people).map(p=>p.group).filter(Boolean))].forEach(g=>addNameToList('#pGroupList',g));
}
renderRecruit(); renderGrouped('#tblBV tbody', data.bv, 'bv'); renderGrouped('#tblIBV tbody', data.ibv, 'ibv'); renderPeople(); initListsFromData(); updateBars();

$('#exportCsv').addEventListener('click', ()=>{
  const rows=[['type','date','name','item','qty','city','group','note']];
  data.recruit.forEach(r=>rows.push(['recruit',r.date,r.name,'','']));
  data.bv.forEach(x=>rows.push(['bv',x.date,x.name,x.item,x.qty]));
  data.ibv.forEach(x=>rows.push(['ibv',x.date,x.name,x.item,x.qty]));
  Object.entries(data.people).forEach(([name,p])=>(p.logs||[]).forEach(l=>rows.push(['312',l.date,name,'','',p.city,p.group,l.note])));
  const csv=rows.map(r=>r.map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(',')).join('\n');
  const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})); a.download='ifnt.csv'; a.click();
});
