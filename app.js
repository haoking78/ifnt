document.addEventListener('DOMContentLoaded',()=>{
  const sfx=document.getElementById('sfxFireworks');
  const recruits=[],bv=[],ibv=[],people=[];
  function sum(a){return a.reduce((s,x)=>s+(x.amount||0),0)}
  function addRow(tb,cols){const tr=document.createElement('tr');tr.innerHTML=cols;tb.appendChild(tr)}
  document.getElementById('addRecruit').onclick=()=>{
    const n=document.getElementById('recName').value.trim()||'未命名';
    const d=document.getElementById('recDate').value;
    recruits.push({name:n,date:d});renderRecruit()
  }
  function renderRecruit(){const tb=document.getElementById('recTable');tb.innerHTML='';recruits.forEach((r,i)=>addRow(tb,`<td>${i+1}</td><td>${r.name}</td><td>${r.date}</td><td><button data-del="${i}">刪</button></td>`));document.getElementById('recTotal').textContent=recruits.length}
  document.getElementById('recTable').onclick=e=>{if(e.target.dataset.del){recruits.splice(e.target.dataset.del,1);renderRecruit()}};
  document.getElementById('addPerson').onclick=()=>{
    const c=document.getElementById('city').value,n=document.getElementById('pname').value,g=document.getElementById('group').value,d=document.getElementById('pdate').value,t=document.getElementById('pnote').value;
    if(!n)return;let p=people.find(x=>x.name===n);if(!p){p={city:c,name:n,group:g,logs:[]};people.push(p);}p.logs.push({date:d,note:t});renderPeople();
  };
  function renderPeople(){const tb=document.getElementById('peopleTable');tb.innerHTML='';people.forEach((p,i)=>addRow(tb,`<td>${i+1}</td><td>${p.city}</td><td>${p.name}</td><td>${p.group}</td><td>${p.logs[p.logs.length-1].date}</td><td>${p.logs.length}</td><td><button class='btn-view' data-idx='${i}'>查看</button></td>`));}
  document.getElementById('list312').onclick=e=>{const idx=e.target.dataset.idx;if(e.target.classList.contains('btn-view')){const p=people[idx];const lines=p.logs.map(l=>`${l.date} | ${l.note}`).join('<br>');document.getElementById('modalText').innerHTML=`<b>${p.name}</b><br>${lines}`;document.getElementById('modal').classList.remove('hide');}};
  document.getElementById('closeModal').onclick=()=>document.getElementById('modal').classList.add('hide');
});