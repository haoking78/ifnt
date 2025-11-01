
const el=id=>document.getElementById(id);const qsa=s=>Array.from(document.querySelectorAll(s));
const defaultState={goals:{recruit:1,bv:1500,ibv:300},recruit:[],bv:[],ibv:[],list:{}};
let S=(()=>{try{const j=localStorage.getItem('IFNT_STATE');if(j)return JSON.parse(j)}catch(e){}return structuredClone(defaultState)})();const save=()=>localStorage.setItem('IFNT_STATE',JSON.stringify(S));
function todayISO(){const d=new Date();d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,10)}
function sum(a){return a.reduce((x,y)=>x+Number(y||0),0)}
function groupByName(list){const m=new Map();list.forEach(x=>{const k=(x.name||'（未填名）').trim();const o=m.get(k)||{name:k,total:0,count:0,items:[]};o.total+=Number(x.amount||0);o.count+=1;o.items.push(x);m.set(k,o)});return[...m.values()]}
function playFire(){try{const ac=new (window.AudioContext||window.webkitAudioContext)();const N=ac.sampleRate*.5, nb=ac.createBuffer(1,N,ac.sampleRate),data=nb.getChannelData(0);for(let i=0;i<N;i++)data[i]=(Math.random()*2-1)*Math.pow(1-i/N,2);const n=ac.createBufferSource();n.buffer=nb;const g=ac.createGain();g.gain.value=.2;n.connect(g).connect(ac.destination);n.start();const o=ac.createOscillator();o.type='triangle';o.frequency.value=160;const og=ac.createGain();og.gain.value=.001;o.connect(og).connect(ac.destination);o.start(ac.currentTime+.45);og.gain.exponentialRampToValueAtTime(.7,ac.currentTime+.55);og.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+.9);o.stop(ac.currentTime+1)}catch(e){}}
function confetti(){const c=document.createElement('div');c.className='confetti';for(let i=0;i<18;i++){const s=document.createElement('span');s.style.setProperty('--tx',(Math.random()*200-100).toFixed(0));s.style.setProperty('--ty',(Math.random()*-120-60).toFixed(0));s.style.left='50%';c.appendChild(s)}document.body.appendChild(c);setTimeout(()=>c.remove(),1500)}
(()=>{const st=document.createElement('style');st.textContent=`.confetti{position:fixed;inset:0;pointer-events:none}.confetti span{position:absolute;width:6px;height:10px;background:hsl(${Math.random()*360},80%,60%);transform:translate(-50%,-50%);animation:fly .9s ease-out forwards}@keyframes fly{to{transform:translate(calc(-50% + var(--tx)*1px),calc(-50% + var(--ty)*1px)) rotate(540deg);opacity:0}}`;document.head.appendChild(st)})();
function init(){
  const logo=document.getElementById('brandLogo');logo.addEventListener('error',()=>{logo.src='assets/logo.png'});
  ['recruitDate','bvDate','ibvDate','logDate'].forEach(id=>el(id).value=todayISO());
  qsa('.tab').forEach(b=>b.addEventListener('click',()=>{qsa('.tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');qsa('.tab-content').forEach(s=>s.classList.add('hidden'));document.getElementById('tab-'+b.dataset.tab).classList.remove('hidden')}));
  const t=el('toggleGoals');t.addEventListener('click',()=>{const p=el('goalsPanel');const show=p.hasAttribute('hidden');if(show){p.removeAttribute('hidden');t.textContent='收合'}else{p.setAttribute('hidden','');t.textContent='展開'}});
  el('goalRecruit').value=S.goals.recruit;el('goalBV').value=S.goals.bv;el('goalIBV').value=S.goals.ibv;miniGoalText();
  el('saveGoals').addEventListener('click',()=>{S.goals.recruit=Math.max(0,Number(el('goalRecruit').value||0));S.goals.bv=Math.max(0,Number(el('goalBV').value||0));S.goals.ibv=Math.max(0,Number(el('goalIBV').value||0));save();render()});
  el('addRecruit').addEventListener('click',addRecruit);el('addBV').addEventListener('click',addBV);el('addIBV').addEventListener('click',addIBV);
  el('addLog').addEventListener('click',addLog);el('clearInputs').addEventListener('click',()=>{el('personName').value='';el('group').value='';el('notes').value=''});
  el('closeDetail').addEventListener('click',()=>document.getElementById('detailDlg').close());
  el('exportBtn').addEventListener('click',exportCSV);
  render();
}
function miniGoalText(){el('currentGoal').textContent=`目前目標：招募 ${S.goals.recruit} / BV ${S.goals.bv} / IBV ${S.goals.ibv}`;el('goalRecruitTxt').textContent=S.goals.recruit;el('goalBVTxt').textContent=S.goals.bv;el('goalIBVTxt').textContent=S.goals.ibv}
function render(){
  const r=S.recruit.length, b=sum(S.bv.map(x=>x.amount)), i=sum(S.ibv.map(x=>x.amount));
  const rp=S.goals.recruit?Math.min(100,Math.round(100*r/S.goals.recruit)):0;
  const bp=S.goals.bv?Math.min(100,Math.round(100*b/S.goals.bv)):0;
  const ip=S.goals.ibv?Math.min(100,Math.round(100*i/S.goals.ibv)):0;
  el('recruitPct').textContent=rp+'%';el('bvPct').textContent=bp+'%';el('ibvPct').textContent=ip+'%';
  el('recruitBar').style.width=rp+'%';el('bvBar').style.width=bp+'%';el('ibvBar').style.width=ip+'%';
  el('recruitTxt').textContent=`${r}/${S.goals.recruit}`;el('bvTxt').textContent=`${b}/${S.goals.bv}`;el('ibvTxt').textContent=`${i}/${S.goals.ibv}`;
  el('recruitBadge').hidden=!(r>=S.goals.recruit&&S.goals.recruit>0);el('bvBadge').hidden=!(b>=S.goals.bv&&S.goals.bv>0);el('ibvBadge').hidden=!(i>=S.goals.ibv&&S.goals.ibv>0);
  const bvM=el('bvSum'), ibvM=el('ibvSum');bvM.textContent=b;ibvM.textContent=i;
  bvM.classList.toggle('green',b>=S.goals.bv&&S.goals.bv>0);bvM.classList.toggle('red',!(b>=S.goals.bv&&S.goals.bv>0));
  ibvM.classList.toggle('green',i>=S.goals.ibv&&S.goals.ibv>0);ibvM.classList.toggle('red',!(i>=S.goals.ibv&&S.goals.ibv>0));
  el('bvAchBadge').hidden=!(b>=S.goals.bv&&S.goals.bv>0);el('ibvAchBadge').hidden=!(i>=S.goals.ibv&&S.goals.ibv>0);
  const rtb=el('recruitTbody');rtb.innerHTML='';S.recruit.forEach((x,idx)=>{const tr=document.createElement('tr');tr.innerHTML=`<td>${idx+1}</td><td>${x.date||''}</td><td>${x.name||''}</td><td><button class="btn small secondary" data-del="${idx}">刪除</button></td>`;rtb.appendChild(tr)});
  rtb.querySelectorAll('[data-del]').forEach(b=>b.addEventListener('click',e=>{const i=Number(e.currentTarget.dataset.del);S.recruit.splice(i,1);save();render()}));
  el('recruitCount').textContent=r;
  const btb=el('bvAggTbody');btb.innerHTML='';groupByName(S.bv).forEach((g,idx)=>{const tr=document.createElement('tr');tr.innerHTML=`<td>${idx+1}</td><td>${g.name}</td><td>${g.total}</td><td>${g.count}</td><td><button class="btn small" data-view="bv:${g.name}">查看</button></td><td><button class="btn small secondary" data-delgroup="bv:${g.name}">刪除</button></td>`;btb.appendChild(tr)});
  btb.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',openDetail));
  btb.querySelectorAll('[data-delgroup]').forEach(b=>b.addEventListener('click',deleteGroup));
  const itb=el('ibvAggTbody');itb.innerHTML='';groupByName(S.ibv).forEach((g,idx)=>{const tr=document.createElement('tr');tr.innerHTML=`<td>${idx+1}</td><td>${g.name}</td><td>${g.total}</td><td>${g.count}</td><td><button class="btn small" data-view="ibv:${g.name}">查看</button></td><td><button class="btn small secondary" data-delgroup="ibv:${g.name}">刪除</button></td>`;itb.appendChild(tr)});
  itb.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',openDetail));
  itb.querySelectorAll('[data-delgroup]').forEach(b=>b.addEventListener('click',deleteGroup));
  refreshDatalists();const ltb=el('listTbody');ltb.innerHTML='';let k=0;Object.entries(S.list).forEach(([name,obj])=>{const last=obj.logs.length?obj.logs[obj.logs.length-1].date:'';const tr=document.createElement('tr');tr.innerHTML=`<td>${++k}</td><td>${obj.city||''}</td><td>${name}</td><td>${obj.group||''}</td><td>${last}</td><td>${obj.logs.length}</td><td><button class="btn small" data-view="list:${name}">查看</button></td>`;ltb.appendChild(tr)});
  ltb.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',openDetail));
}
function addRecruit(){const date=el('recruitDate').value||todayISO(), name=el('recruitName').value.trim();S.recruit.push({date,name});save();render();if(S.recruit.length>=S.goals.recruit&&S.goals.recruit>0){confetti();playFire()}}
function addBV(){const date=el('bvDate').value||todayISO(), name=el('bvCustomer').value.trim(), item=el('bvItem').value.trim(), amount=Number(el('bvAmount').value||0);if(!amount)return;S.bv.push({date,name,item,amount});save();render();const total=sum(S.bv.map(x=>x.amount));if(total>=S.goals.bv&&S.goals.bv>0){confetti();playFire()}el('bvItem').value='';el('bvAmount').value=''}
function addIBV(){const date=el('ibvDate').value||todayISO(), name=el('ibvName').value.trim(), item=el('ibvItem').value.trim(), amount=Number(el('ibvAmount').value||0);if(!amount)return;S.ibv.push({date,name,item,amount});save();render();const total=sum(S.ibv.map(x=>x.amount));if(total>=S.goals.ibv&&S.goals.ibv>0){confetti();playFire()}el('ibvItem').value='';el('ibvAmount').value=''}
function openDetail(e){const [kind,key]=e.currentTarget.dataset.view.split(':');let txt='';if(kind==='bv'){S.bv.filter(x=>(x.name||'（未填名）').trim()===key).forEach(x=>txt+=`${x.date}｜${x.item||''} ${x.amount}\n`);txt=`【${key}】\n`+txt}else if(kind==='ibv'){S.ibv.filter(x=>(x.name||'（未填名）').trim()===key).forEach(x=>txt+=`${x.date}｜${x.item||''} ${x.amount}\n`);txt=`【${key}】\n`+txt}else if(kind==='list'){const o=S.list[key];txt=`【${key}】（${o.city||''}｜${o.group||''}）\n`;o.logs.forEach(x=>txt+=`${x.date}｜${x.notes||''}\n`)}
  document.getElementById('detailContent').textContent=txt||'明細';document.getElementById('detailDlg').showModal()}
function deleteGroup(e){const [kind,key]=e.currentTarget.dataset.delgroup.split(':');if(!confirm(`刪除「${key}」的彙總資料與所有明細？`))return;if(kind==='bv'){S.bv=S.bv.filter(x=>(x.name||'（未填名）').trim()!==key)}else if(kind==='ibv'){S.ibv=S.ibv.filter(x=>(x.name||'（未填名）').trim()!==key)}save();render()}
function refreshDatalists(){const dn=el('nameList'),dg=el('groupList');dn.innerHTML='';dg.innerHTML='';const names=Object.keys(S.list).sort();names.forEach(n=>{const o=document.createElement('option');o.value=n;dn.appendChild(o)});const setG=new Set(Object.values(S.list).map(x=>x.group).filter(Boolean));[...setG].sort().forEach(g=>{const o=document.createElement('option');o.value=g;dg.appendChild(o)})}
function addLog(){const city=el('city').value.trim(),name=el('personName').value.trim(),group=el('group').value.trim(),date=el('logDate').value||todayISO(),notes=el('notes').value.trim();if(!name)return;const obj=S.list[name]||{city:'',group:'',logs:[]};obj.city=city||obj.city;obj.group=group||obj.group;obj.logs.push({date,notes});S.list[name]=obj;save();render();el('personName').value='';el('group').value=''}
function exportCSV(){const rows=[];rows.push(['類別','日期','姓名','品項','數量','備註/城市/族群']);S.recruit.forEach(x=>rows.push(['招募',x.date||'',x.name||'','','','']));S.bv.forEach(x=>rows.push(['BV',x.date||'',x.name||'',x.item||'',x.amount||'','']));Object.entries(S.list).forEach(([name,obj])=>{obj.logs.forEach(l=>rows.push(['312名單',l.date||'',name,'','',`${obj.city||''}/${obj.group||''} ${l.notes||''}`]))});S.ibv.forEach(x=>rows.push(['IBV',x.date||'',x.name||'',x.item||'',x.amount||'','']));const csv=rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='IFNT_export.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),3000)}
window.addEventListener('DOMContentLoaded',init);
