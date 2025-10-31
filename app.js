
const VERSION='v6.1.4';
const $=(s,root=document)=>root.querySelector(s);
const $$=(s,root=document)=>Array.from(root.querySelectorAll(s));
const storageKey='ifnt:data';
const load=()=>{try{return JSON.parse(localStorage.getItem(storageKey))||{}}catch{return {}}};
const save=(d)=>localStorage.setItem(storageKey,JSON.stringify(d));
const data=Object.assign({recruits:[],bv:[],ibv:[],crm:[],names:[],groups:[]},load());
const today=()=>new Date().toISOString().slice(0,10);
const fmt=(d)=>d||'';
function persist(){save(data); renderAll();}

$('#tabs').addEventListener('click',e=>{const t=e.target.closest('.tab');if(!t)return;$$('.tab').forEach(x=>x.classList.toggle('active',x===t));$$('section.card[data-panel]').forEach(p=>p.hidden=p.dataset.panel!==t.dataset.tab);});

// Recruit
$('#rDate').value=today();
$('#btnAddRecruit').onclick=()=>{const d=$('#rDate').value||today();const name=$('#rName').value.trim();if(!name)return alert('請輸入姓名');data.recruits.push({date:d,name});$('#rName').value='';persist();};
function renderRecruit(){$('#rTotal').textContent=data.recruits.length;const tb=$('#rTable');tb.innerHTML='';data.recruits.forEach((r,i)=>{const tr=document.createElement('tr');tr.innerHTML=`<td>${i+1}</td><td>${fmt(r.date)}</td><td>${r.name}</td><td class='right'><button class='btn' data-del='r${i}'>刪除</button></td>`;tb.appendChild(tr);});tb.onclick=e=>{const b=e.target.closest('button[data-del]');if(!b)return;const i=+b.dataset.del.slice(1);data.recruits.splice(i,1);persist();};$('#barRecruit').style.width=Math.min(100,data.recruits.length*100/1)+'%';$('#flagRecruit').textContent=(data.recruits.length>=1)?'已達標':'未達標';}

// BV
$('#bDate').value=today();
$('#btnAddBV').onclick=()=>{const d=$('#bDate').value||today();const customer=$('#bCustomer').value.trim();const item=$('#bItem').value.trim();const bv=parseInt($('#bBV').value,10)||0;if(!customer||!bv)return alert('請輸入顧客與 BV');data.bv.push({date:d,customer,item,bv});if(!data.names.includes(customer))data.names.push(customer);$('#bCustomer').value='';$('#bItem').value='';$('#bBV').value='';persist();};
function renderBV(){const sum=data.bv.reduce((s,x)=>s+(x.bv||0),0);$('#bRemain').textContent=Math.max(0,1500-sum);$('#barBV').style.width=Math.min(100,sum*100/1500)+'%';$('#flagBV').textContent=(sum>=1500)?'已達標':'未達標';const tb=$('#bTable');tb.innerHTML='';data.bv.forEach((r,i)=>{const tr=document.createElement('tr');tr.innerHTML=`<td>${i+1}</td><td>${fmt(r.date)}</td><td>${r.customer}</td><td>${r.item||''}</td><td>${r.bv}</td><td class='right'><button class='btn' data-del='b${i}'>刪除</button></td>`;tb.appendChild(tr);});tb.onclick=e=>{const b=e.target.closest('button[data-del]');if(!b)return;const i=+b.dataset.del.slice(1);data.bv.splice(i,1);persist();};}

// IBV
$('#iDate').value=today();
$('#btnAddIBV').onclick=()=>{const d=$('#iDate').value||today();const who=$('#iWho').value.trim();const item=$('#iItem').value.trim();const ibv=parseInt($('#iIBV').value,10)||0;if(!who||!ibv)return alert('請輸入姓名與 IBV');data.ibv.push({date:d,who,item,ibv});if(!data.names.includes(who))data.names.push(who);$('#iWho').value='';$('#iItem').value='';$('#iIBV').value='';persist();};
function renderIBV(){const sum=data.ibv.reduce((s,x)=>s+(x.ibv||0),0);$('#iRemain').textContent=Math.max(0,300-sum);$('#barIBV').style.width=Math.min(100,sum*100/300)+'%';$('#flagIBV').textContent=(sum>=300)?'已達標':'未達標';const tb=$('#iTable');tb.innerHTML='';data.ibv.forEach((r,i)=>{const tr=document.createElement('tr');tr.innerHTML=`<td>${i+1}</td><td>${fmt(r.date)}</td><td>${r.who}</td><td>${r.item||''}</td><td>${r.ibv}</td><td class='right'><button class='btn' data-del='i${i}'>刪除</button></td>`;tb.appendChild(tr);});tb.onclick=e=>{const b=e.target.closest('button[data-del]');if(!b)return;const i=+b.dataset.del.slice(1);data.ibv.splice(i,1);persist();};}

// CRM
const TAIWAN_CITIES=['基隆市','臺北市','新北市','桃園市','新竹市','新竹縣','苗栗縣','臺中市','彰化縣','南投縣','雲林縣','嘉義市','嘉義縣','臺南市','高雄市','屏東縣','宜蘭縣','花蓮縣','臺東縣','澎湖縣','金門縣','連江縣'];
$('#cCity').innerHTML=TAIWAN_CITIES.map(c=>`<option value="${'{}'}">${'{}'}</option>`.replace('${'+'{}'+'}',c).replace('${'+'{}'+'}',c)).join('');
$('#cDate').value=today();
function upsertCRM(city,name,group,date,note){let p=data.crm.find(x=>x.name===name);if(!p){p={city,name,group,logs:[]};data.crm.push(p);}else{p.city=city;p.group=group||p.group;}p.logs.push({date,note});if(!data.names.includes(name))data.names.push(name);if(group&&!data.groups.includes(group))data.groups.push(group);}
$('#btnAddCRM').onclick=()=>{const city=$('#cCity').value;const name=$('#cName').value.trim();const group=$('#cGroup').value.trim();const date=$('#cDate').value||today();const note=$('#cNote').value.trim();if(!name)return alert('請輸入姓名');upsertCRM(city,name,group,date,note);$('#cName').value='';$('#cGroup').value='';$('#cNote').value='';persist();};
$('#btnClearForm').onclick=()=>{$('#cName').value='';$('#cGroup').value='';$('#cNote').value='';};
function renderCRM(){const addOpt=(el,arr)=>el.innerHTML=arr.map(v=>`<option value='${'{}'}'>`.replace('${'+'{}'+'}',v)).join('');addOpt($('#nameList'),data.names);addOpt($('#groupList'),data.groups);const tb=$('#cTable');tb.innerHTML='';const summary=data.crm.map(p=>({name:p.name,city:p.city,group:p.group,count:p.logs.length,last:(p.logs.map(l=>l.date).sort().slice(-1)[0]||'')})).sort((a,b)=>(b.last||'').localeCompare(a.last||''));summary.forEach((r,i)=>{const tr=document.createElement('tr');tr.innerHTML=`<td>${i+1}</td><td>${r.city||''}</td><td>${r.name}</td><td>${r.group||''}</td><td>${fmt(r.last)}</td><td>${r.count}</td><td class='right'><button class='btn' data-view='${r.name}'>查看</button> <button class='btn' data-del='${r.name}'>刪除</button></td>`;tb.appendChild(tr);});tb.onclick=e=>{const v=e.target.closest('button[data-view]');if(v){showDetail(v.dataset.view);return;}const d=e.target.closest('button[data-del]');if(d){const n=d.dataset.del;const i=data.crm.findIndex(x=>x.name===n);if(i>-1&&confirm('確定刪除此人所有互動紀錄？')){data.crm.splice(i,1);persist();}}};$('#crmSummary').textContent=`共 ${summary.length} 位，已依最近互動排序`;};
function showDetail(name){const p=data.crm.find(x=>x.name===name);if(!p)return;const logs=p.logs.sort((a,b)=>(a.date||'').localeCompare(b.date||''));$('#crmDetail').innerHTML=`<div class='chip'>${p.city||''} · ${p.group||''} · ${p.name}</div>`+'<ul style="margin:6px 0 0;padding:0 0 0 18px">' + logs.map(l=>`<li>${fmt(l.date)} — ${(l.note||'').replace(/[<>]/g,'')}</li>`).join('') + '</ul>';}

function renderKPI(){/* placeholder KPI if needed */}
function renderAll(){renderRecruit();renderBV();renderIBV();renderCRM();renderKPI();}
renderAll();

// CSV export (kept)
function toCSV(rows, headers){const esc=v=>(''+(v==null?'':v)).replace(/"/g,'""');return [headers.join(','),...rows.map(r=>headers.map(h=>/[,
]/.test(r[h])?`"${esc(r[h])}"`:(r[h]??'')).join(','))].join('\n');}
document.body.addEventListener('click',e=>{const btn=e.target.closest('#btnExport');if(!btn)return;const files=[];files.push({name:'recruits.csv',data:toCSV(data.recruits,['date','name'])});files.push({name:'bv.csv',data:toCSV(data.bv,['date','customer','item','bv'])});files.push({name:'ibv.csv',data:toCSV(data.ibv,['date','who','item','ibv'])});const crmFlat=data.crm.flatMap(p=>p.logs.map(l=>({city:p.city,name:p.name,group:p.group,date:l.date,note:l.note})));files.push({name:'crm.csv',data:toCSV(crmFlat,['city','name','group','date','note'])});const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';s.onload=()=>{const zip=new JSZip();files.forEach(f=>zip.file(f.name,'\ufeff'+f.data));zip.generateAsync({type:'blob'}).then(b=>{const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='IFNT_export_'+new Date().toISOString().slice(0,10)+'.zip';a.click();URL.revokeObjectURL(a.href);});};document.body.appendChild(s);});

if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('service-worker.js?v=v6.1.4').then(reg=>{if(reg.waiting)reg.waiting.postMessage({type:'SKIP_WAITING'});}));}
