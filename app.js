
// IFNT main scripts v6.2.2
const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

const store = {
  get(key, def){ try{ return JSON.parse(localStorage.getItem(key)) ?? def }catch(_){ return def } },
  set(key, val){ localStorage.setItem(key, JSON.stringify(val)) }
};

// data model
let data = store.get('ifnt-data', {
  recruit: [], // [{date,name}]
  bv: [],      // [{date, who, item, val}]
  ibv: [],     // [{date, who, item, val}]
  people: []   // [{city,name,group,logs:[{date,note}]}]
});

const VERSION = 'v6.2.2';

// Tabs
$$('.tab').forEach(t=>t.addEventListener('click', e=>{
  $$('.tab').forEach(x=>x.classList.remove('active'));
  e.currentTarget.classList.add('active');
  const id = e.currentTarget.dataset.tab;
  ['recruit','bv','ibv','list'].forEach(sec=>{ $('#'+sec).style.display = (sec===id?'block':'none'); });
}));

// Cities
const cities = ["基隆市","臺北市","新北市","桃園市","新竹市","新竹縣","苗栗縣","臺中市","彰化縣","南投縣","雲林縣","嘉義市","嘉義縣","臺南市","高雄市","屏東縣","宜蘭縣","花蓮縣","臺東縣","澎湖縣","金門縣","連江縣"];
const citySel = $('#city');
citySel.innerHTML = cities.map(c=>`<option value="${c}">${c}</option>`).join('');

// Defaults to today
function setToday(id){ const el = $(id); el.valueAsDate = new Date(); }
['#rDate','#bvDate','#ibvDate','#pDate'].forEach(setToday);

// Helpers
function save(){ store.set('ifnt-data', data); renderAll(); }
function del(arr, idx){ arr.splice(idx,1); save(); }
function csvRow(arr){ return arr.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(','); }

// Export CSV
$('#btnExport').addEventListener('click', ()=>{
  const lines = [];
  lines.push(`"IFNT 匯出", "${VERSION}", "${new Date().toISOString()}"`);
  lines.push('--- 招募');
  lines.push(csvRow(['日期','姓名']));
  data.recruit.forEach(x=>lines.push(csvRow([x.date,x.name])));

  lines.push('--- BV');
  lines.push(csvRow(['日期','姓名','品項','BV']));
  data.bv.forEach(x=>lines.push(csvRow([x.date,x.who,x.item,x.val])));

  lines.push('--- IBV');
  lines.push(csvRow(['日期','姓名','品項','IBV']));
  data.ibv.forEach(x=>lines.push(csvRow([x.date,x.who,x.item,x.val])));

  lines.push('--- 312 名單');
  lines.push(csvRow(['縣市','姓名','族群','最近互動日','次數','完整紀錄']));
  data.people.forEach(p=>{
    const latest = p.logs.length? p.logs[p.logs.length-1].date : '';
    const logs = p.logs.map(l=>`${l.date} ${l.note}`.trim()).join(' | ');
    lines.push(csvRow([p.city,p.name,p.group,latest,p.logs.length,logs]));
  });

  const blob = new Blob([lines.join('\n')], {type:'text/csv;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `IFNT_export_${Date.now()}.csv`; a.click();
  URL.revokeObjectURL(url);
});

// Clear helpers
$$('.btn.ghost').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const target = btn.dataset.clear;
    if(target==='recruit'){ $('#rName').value=''; setToday('#rDate'); }
    if(target==='bv'){ $('#bvWho').value=''; $('#bvItem').value=''; $('#bvVal').value=''; setToday('#bvDate'); }
    if(target==='ibv'){ $('#ibvWho').value=''; $('#ibvItem').value=''; $('#ibvVal').value=''; setToday('#ibvDate'); }
    if(target==='list'){ $('#pName').value=''; $('#pGroup').value=''; $('#pNote').value=''; setToday('#pDate'); }
  });
});

// Recruit
$('#btnAddRecruit').addEventListener('click', ()=>{
  const date = $('#rDate').value;
  const name = $('#rName').value.trim();
  if(!name) { alert('請輸入姓名'); return; }
  data.recruit.push({date,name});
  save();
});
function renderRecruit(){
  const tbody = $('#rTable tbody');
  tbody.innerHTML = data.recruit.map((r,i)=>`<tr>
    <td>${i+1}</td><td>${r.date}</td><td>${r.name}</td>
    <td><button class="btn warn" data-del-recruit="${i}">刪除</button></td>
  </tr>`).join('');
  tbody.querySelectorAll('[data-del-recruit]').forEach(b=>b.addEventListener('click',()=>{
    del(data.recruit, parseInt(b.dataset.delRecruit));
  }));
  $('#rSum').textContent = data.recruit.length;
  const hit = data.recruit.length >= 1;
  const flag = $('#rHit');
  flag.textContent = hit?'已達標':'未達標';
  flag.className = 'badge ' + (hit?'ok':'need');
}

// BV
$('#btnAddBV').addEventListener('click', ()=>{
  const date=$('#bvDate').value, who=$('#bvWho').value.trim(), item=$('#bvItem').value.trim(), val=Number($('#bvVal').value||0);
  if(!val){ alert('請填 BV 數值'); return; }
  data.bv.push({date,who,item,val});
  save();
});
function renderBV(){
  const tbody = $('#bvTable tbody');
  tbody.innerHTML = data.bv.map((x,i)=>`<tr>
    <td>${i+1}</td><td>${x.date}</td><td>${x.who||''}</td><td>${x.item||''}</td><td>${x.val}</td>
    <td><button class="btn warn" data-del-bv="${i}">刪除</button></td>
  </tr>`).join('');
  tbody.querySelectorAll('[data-del-bv]').forEach(b=>b.addEventListener('click',()=>{
    del(data.bv, parseInt(b.dataset.delBv));
  }));
  const sum = data.bv.reduce((a,b)=>a+(Number(b.val)||0),0);
  $('#bvSum').textContent = sum;
  const remain = Math.max(0,1500-sum);
  $('#bvRemain').textContent = remain;
  const ok = sum>=1500;
  $('#bvSum').className = 'val ' + (ok?'green':'red');
  $('#bvRemain').className = 'val ' + (ok?'green':'red');
}

// IBV
$('#btnAddIBV').addEventListener('click', ()=>{
  const date=$('#ibvDate').value, who=$('#ibvWho').value.trim(), item=$('#ibvItem').value.trim(), val=Number($('#ibvVal').value||0);
  if(!val){ alert('請填 IBV 數值'); return; }
  data.ibv.push({date,who,item,val});
  save();
});
function renderIBV(){
  const tbody = $('#ibvTable tbody');
  tbody.innerHTML = data.ibv.map((x,i)=>`<tr>
    <td>${i+1}</td><td>${x.date}</td><td>${x.who||''}</td><td>${x.item||''}</td><td>${x.val}</td>
    <td><button class="btn warn" data-del-ibv="${i}">刪除</button></td>
  </tr>`).join('');
  tbody.querySelectorAll('[data-del-ibv]').forEach(b=>b.addEventListener('click',()=>{
    del(data.ibv, parseInt(b.dataset.delIbv));
  }));
  const sum = data.ibv.reduce((a,b)=>a+(Number(b.val)||0),0);
  $('#ibvSum').textContent = sum;
  const remain = Math.max(0,300-sum);
  $('#ibvRemain').textContent = remain;
  const ok = sum>=300;
  $('#ibvSum').className = 'val ' + (ok?'green':'red');
  $('#ibvRemain').className = 'val ' + (ok?'green':'red');
}

// 312 people
$('#btnAddLog').addEventListener('click', ()=>{
  const city=$('#city').value, name=$('#pName').value.trim(), group=$('#pGroup').value.trim(),
        date=$('#pDate').value, note=$('#pNote').value.trim();
  if(!name){ alert('請輸入姓名'); return; }
  let p = data.people.find(x=>x.name===name);
  if(!p){ p = {city,name,group,logs:[]}; data.people.push(p); }
  // auto update city/group if newly provided
  if(city) p.city = city;
  if(group) p.group = group;
  p.logs.push({date, note});
  save();
  // clear fields for fast next entry
  $('#pName').value=''; $('#pGroup').value=''; $('#pNote').value=''; setToday('#pDate');
});

function renderPeople(){
  // Suggestions
  const names = [...new Set(data.people.map(p=>p.name))];
  $('#nameList').innerHTML = names.map(n=>`<option value="${n}">`).join('');
  const groups = [...new Set(data.people.map(p=>p.group).filter(Boolean))];
  $('#groupList').innerHTML = groups.map(g=>`<option value="${g}">`).join('');

  const tbody = $('#peopleTable tbody');
  tbody.innerHTML = data.people.map((p,i)=>{
    const latest = p.logs.length? p.logs[p.logs.length-1].date : '';
    return `<tr>
      <td>${i+1}</td><td>${p.city||''}</td><td>${p.name}</td><td>${p.group||''}</td>
      <td>${latest}</td><td>${p.logs.length}</td>
      <td>
        <button class="btn" data-view="${i}">查看</button>
        <button class="btn warn" data-del-person="${i}">刪除</button>
      </td>
    </tr>`;
  }).join('');

  tbody.querySelectorAll('[data-del-person]').forEach(b=>b.addEventListener('click',()=>{
    del(data.people, parseInt(b.dataset.delPerson));
  }));
  tbody.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{
    const p = data.people[parseInt(b.dataset.view)];
    alert(`${p.name}（${p.city || ''} / ${p.group || ''}）\n\n` + p.logs.map(l=>`${l.date}  ${l.note}`).join('\n'));
  }));
}

function renderAll(){
  renderRecruit(); renderBV(); renderIBV(); renderPeople();
}

renderAll();

// PWA
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('./service-worker.js');
}
