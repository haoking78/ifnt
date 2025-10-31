/* IFNT v6.2.1 */
const STORE_KEY = 'ifnt_v621_store';
const $ = (s,p=document)=>p.querySelector(s);
const $$ = (s,p=document)=>Array.from(p.querySelectorAll(s));
const today = ()=>{const d=new Date();const p=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`};

const DB = ( ()=>{
  try{ return JSON.parse(localStorage.getItem(STORE_KEY) || '') || {}; }catch{return {}}
})();

// default shape
DB.recruits ||= [];   // {date,name}
DB.bv ||= [];         // {date,name,item,amount}
DB.ibv ||= [];        // {date,name,item,amount}
DB.people ||= {};     // name -> { city, group, logs:[{date,note}], last, count }
DB.banks ||= { names: [], groups: [] };

function save(){ localStorage.setItem(STORE_KEY, JSON.stringify(DB)); }

// init selects
const CITIES = ['基隆市','臺北市','新北市','桃園市','新竹市','新竹縣','苗栗縣','臺中市','彰化縣','南投縣','雲林縣','嘉義市','嘉義縣','臺南市','高雄市','屏東縣','宜蘭縣','花蓮縣','臺東縣','澎湖縣','金門縣','連江縣'];
$('#city').innerHTML = CITIES.map(c=>`<option>${c}</option>`).join('');

// default dates
$('#rDate').value = $('#bvDate').value = $('#ibvDate').value = $('#pDate').value = today();

// Tabs
$('#tabs').addEventListener('click', e=>{
  const b = e.target.closest('.tabbtn'); if(!b) return;
  $$('.tabbtn').forEach(x=>x.classList.toggle('active', x===b));
  ['t1','t2','t3','t4'].forEach(id=> { $('#'+id).hidden = (b.dataset.tab!==id); });
});

// helpers
function addBank(type, val){ if(!val) return; const arr = DB.banks[type]; if(!arr.includes(val)) arr.push(val); }
function fmt(n){ return Number(n||0).toLocaleString(); }

// Recruit
function renderRecruit(){
  $('#rTotal').textContent = DB.recruits.length;
  $('#rStatus').textContent = (DB.recruits.length>=1) ? '🎉 已達標' : '尚未達標';
  $('#rStatus').className = 'pill ' + (DB.recruits.length>=1 ? 'ok' : '');
  $('#rList').innerHTML = DB.recruits.map((r,i)=>`
    <tr><td>${i+1}</td><td>${r.date||''}</td><td>${r.name||''}</td>
    <td><button class="chip" data-del-r="${i}">刪除</button></td></tr>
  `).join('');
}
$('#btnAddRecruit').addEventListener('click', ()=>{
  const date = $('#rDate').value || today();
  const name = $('#rName').value.trim();
  if(!name){ alert('請輸入姓名'); return; }
  DB.recruits.push({date,name}); addBank('names', name); save(); renderRecruit();
  $('#rName').value='';
});
$('#rList').addEventListener('click', e=>{
  const i = e.target?.dataset?.delR; if(i==null) return; DB.recruits.splice(Number(i),1); save(); renderRecruit();
});

// BV
function renderBV(){
  let sum=0;
  $('#bvList').innerHTML = DB.bv.map((b,i)=>{
    sum += Number(b.amount||0);
    return `<tr><td>${i+1}</td><td>${b.date||''}</td><td>${b.name||''}</td><td>${b.item||''}</td><td class="mono">${fmt(b.amount)}</td>
      <td><button class="chip" data-del-bv="${i}">刪除</button></td></tr>`;
  }).join('');
  $('#bvSum').textContent = fmt(sum);
  $('#bvRemain').textContent = fmt(Math.max(1500-sum,0));
}
$('#btnAddBV').addEventListener('click', ()=>{
  const date=$('#bvDate').value||today();
  const name=$('#bvName').value.trim();
  const item=$('#bvItem').value.trim();
  const amount=Number($('#bvAmount').value||0);
  if(!name||!amount){ alert('請輸入姓名與 BV'); return; }
  DB.bv.push({date,name,item,amount}); addBank('names',name); save(); renderBV();
  $('#bvName').value=''; $('#bvItem').value=''; $('#bvAmount').value='';
});
$('#bvList').addEventListener('click', e=>{
  const i=e.target?.dataset?.delBv; if(i==null) return; DB.bv.splice(Number(i),1); save(); renderBV();
});

// IBV
function renderIBV(){
  let sum=0;
  $('#ibvList').innerHTML = DB.ibv.map((b,i)=>{
    sum += Number(b.amount||0);
    return `<tr><td>${i+1}</td><td>${b.date||''}</td><td>${b.name||''}</td><td>${b.item||''}</td><td class="mono">${fmt(b.amount)}</td>
      <td><button class="chip" data-del-ibv="${i}">刪除</button></td></tr>`;
  }).join('');
  $('#ibvSum').textContent = fmt(sum);
  $('#ibvRemain').textContent = fmt(Math.max(300-sum,0));
}
$('#btnAddIBV').addEventListener('click', ()=>{
  const date=$('#ibvDate').value||today();
  const name=$('#ibvName').value.trim();
  const item=$('#ibvItem').value.trim();
  const amount=Number($('#ibvAmount').value||0);
  if(!name||!amount){ alert('請輸入姓名與 IBV'); return; }
  DB.ibv.push({date,name,item,amount}); addBank('names',name); save(); renderIBV();
  $('#ibvName').value=''; $('#ibvItem').value=''; $('#ibvAmount').value='';
});
$('#ibvList').addEventListener('click', e=>{
  const i=e.target?.dataset?.delIbv; if(i==null) return; DB.ibv.splice(Number(i),1); save(); renderIBV();
});

// 312 People
function ensurePerson(name){
  if(!DB.people[name]) DB.people[name] = { city: CITIES[0], group:'', logs:[], last:'', count:0 };
  return DB.people[name];
}
function renderPeople(){
  const entries = Object.entries(DB.people).map(([name,p])=>({name, ...p})).sort((a,b)=>(b.last||'').localeCompare(a.last||''));
  $('#pList').innerHTML = entries.map((p,i)=>`
    <tr><td>${i+1}</td><td>${p.city||''}</td><td>${p.name||''}</td><td>${p.group||''}</td><td>${p.last||''}</td>
    <td class="mono">${p.count||0}</td>
    <td><button class="chip" data-view="${p.name}">查看</button> <button class="chip" data-delp="${p.name}">刪除</button></td></tr>
  `).join('');
}
$('#btnAddInteract').addEventListener('click', ()=>{
  const name=$('#pName').value.trim(); if(!name){ alert('請輸入姓名'); return; }
  const city=$('#city').value; const group=$('#pGroup').value.trim();
  const date=$('#pDate').value||today(); const note=$('#pNote').value.trim();
  const p=ensurePerson(name); p.city=city; if(group) p.group=group;
  p.logs.push({date,note}); p.count=p.logs.length; p.last=date;
  addBank('names',name); if(group) addBank('groups',group);
  save(); renderPeople(); $('#pName').value=''; $('#pGroup').value=''; $('#pNote').value='';
});
$('#pList').addEventListener('click', e=>{
  const n=e.target?.dataset?.view; const d=e.target?.dataset?.delp;
  if(n){ const p=DB.people[n]; const detail=(p.logs||[]).map(l=>`${l.date}｜${l.note}`).join('\n'); alert(`【${n}】(${p.city}｜${p.group||''})\n`+(detail||'尚無紀錄')); }
  if(d){ if(confirm(`刪除「${d}」整筆 312 名單？`)){ delete DB.people[d]; save(); renderPeople(); } }
});

// Export CSV
$('#btnExport').addEventListener('click', ()=>{
  const out=[]; const now=new Date().toISOString().slice(0,10);
  out.push('=== 招募 1 人 ==='); out.push('日期,姓名'); DB.recruits.forEach(r=>out.push(`${r.date},${r.name}`)); out.push('');
  out.push('=== 零售＋自購 1500 BV ==='); out.push('日期,姓名,品項,BV'); DB.bv.forEach(b=>out.push(`${b.date},${b.name},${(b.item||'').replace(/,/g,'、')},${b.amount}`)); out.push('');
  out.push('=== 家庭轉移 300 IBV ==='); out.push('日期,姓名,品項,IBV'); DB.ibv.forEach(b=>out.push(`${b.date},${b.name},${(b.item||'').replace(/,/g,'、')},${b.amount}`)); out.push('');
  out.push('=== 312 互動名單 ==='); out.push('姓名,縣市,族群,最近互動,次數,所有互動(日期｜內容；…)');
  Object.entries(DB.people).forEach(([name,p])=>{
    const joined=(p.logs||[]).map(l=>`${l.date}｜${(l.note||'').replace(/,/g,'、')}`).join('；');
    out.push(`${name},${p.city||''},${(p.group||'').replace(/,/g,'、')},${p.last||''},${p.count||0},${joined}`);
  });
  const blob=new Blob([out.join('\n')],{type:'text/csv;charset=utf-8;'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`IFNT_export_${now}.csv`; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000);
});

// PWA install
let deferredPrompt=null;
window.addEventListener('beforeinstallprompt', e=>{ e.preventDefault(); deferredPrompt=e; $('#btnInstall').style.display='inline-flex'; });
$('#btnInstall').addEventListener('click', async()=>{ if(!deferredPrompt) return; deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt=null; $('#btnInstall').style.display='none'; });

// default render
renderRecruit(); renderBV(); renderIBV(); renderPeople();

// SW register
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('./service-worker.js').catch(()=>{});
}
