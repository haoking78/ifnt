// IFNT v6.4.1-20251031-3 - single-file logic
const STORE_KEY = 'ifnt_v6_data';
const NAME_KEY = 'ifnt_names';
const GROUP_KEY = 'ifnt_groups';

const state = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
state.recruits = state.recruits || [];
state.bv = state.bv || [];
state.ibv = state.ibv || [];
state.interacts = state.interacts || []; // {id, city, name, group, logs:[{date,memo}]}

const nameSet = new Set(JSON.parse(localStorage.getItem(NAME_KEY) || '[]'));
const groupSet = new Set(JSON.parse(localStorage.getItem(GROUP_KEY) || '[]'));

function save() {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

function q(id){return document.getElementById(id)}
function formatDateInput(d=new Date()){ return d.toISOString().slice(0,10); }

function setToday() {
  q('r_date').value = formatDateInput();
  q('bv_date').value = formatDateInput();
  q('ibv_date').value = formatDateInput();
  q('i_date').value = formatDateInput();
}

function renderTabs() {
  document.querySelectorAll('.chip').forEach(ch => ch.addEventListener('click', () => {
    document.querySelectorAll('.chip').forEach(c=>c.classList.remove('active'));
    ch.classList.add('active');
    const id = ch.dataset.tab;
    document.querySelectorAll('section.card').forEach(sec=>sec.style.display='none');
    q(id).style.display='block';
  }));
}

function badge(el, ok, target) {
  if(ok>=target) { el.className='pill ok'; el.textContent='已達標 ' + ok; }
  else { el.className='pill danger'; el.textContent='小計 ' + ok + ' / 距離 ' + (target-ok); }
}

// recruits
function renderRecruits() {
  const tb = q('r_table').querySelector('tbody');
  tb.innerHTML='';
  state.recruits.forEach((r,idx)=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>\${idx+1}</td><td>\${r.date}</td><td>\${r.name}</td>
    <td class='right'><button class='btn line' data-del='\${idx}'>刪除</button></td>`;
    tb.appendChild(tr);
  });
  const pill = q('r_count_pill');
  if(state.recruits.length>=1) pill.className='pill ok', pill.textContent='🎉 已達標';
  else pill.className='pill warn', pill.textContent='累計 0 / 目標 1';
  tb.querySelectorAll('button[data-del]').forEach(b=>b.onclick=()=>{
    state.recruits.splice(Number(b.dataset.del),1); save(); renderRecruits();
  });
}

function addRecruit(){
  const date = q('r_date').value; const name = q('r_name').value.trim();
  if(!date||!name) return alert('請輸入日期與姓名');
  state.recruits.push({date,name}); if(name) nameSet.add(name);
  save(); localStorage.setItem(NAME_KEY, JSON.stringify([...nameSet]));
  q('r_name').value=''; renderDatalists(); renderRecruits();
}

// BV
function renderBV(){
  const tb = q('bv_table').querySelector('tbody'); tb.innerHTML='';
  let sum=0;
  state.bv.forEach((o,idx)=>{ sum+=Number(o.value)||0;
    const tr=document.createElement('tr');
    tr.innerHTML = `<td>\${idx+1}</td><td>\${o.date}</td><td>\${o.customer||''}</td><td>\${o.item||''}</td><td>\${o.value}</td>
    <td class='right'><button class='btn line' data-del='\${idx}'>刪除</button></td>`; tb.appendChild(tr);
  });
  badge(q('bv_status'), sum, 1500);
  tb.querySelectorAll('button[data-del]').forEach(b=>b.onclick=()=>{ state.bv.splice(Number(b.dataset.del),1); save(); renderBV(); });
}
function addBV(){
  const date=q('bv_date').value, customer=q('bv_customer').value.trim(), item=q('bv_item').value.trim(), value=Number(q('bv_value').value);
  if(!date || !value) return alert('請填日期與 BV 數值');
  state.bv.push({date,customer,item,value}); if(customer) nameSet.add(customer);
  save(); localStorage.setItem(NAME_KEY, JSON.stringify([...nameSet]));
  q('bv_customer').value=''; q('bv_item').value=''; q('bv_value').value=''; renderDatalists(); renderBV();
}

// IBV
function renderIBV(){
  const tb = q('ibv_table').querySelector('tbody'); tb.innerHTML='';
  let sum=0;
  state.ibv.forEach((o,idx)=>{ sum+=Number(o.value)||0;
    const tr=document.createElement('tr');
    tr.innerHTML = `<td>\${idx+1}</td><td>\${o.date}</td><td>\${o.person||''}</td><td>\${o.item||''}</td><td>\${o.value}</td>
    <td class='right'><button class='btn line' data-del='\${idx}'>刪除</button></td>`; tb.appendChild(tr);
  });
  badge(q('ibv_status'), sum, 300);
  tb.querySelectorAll('button[data-del]').forEach(b=>b.onclick=()=>{ state.ibv.splice(Number(b.dataset.del),1); save(); renderIBV(); });
}
function addIBV(){
  const date=q('ibv_date').value, person=q('ibv_person').value.trim(), item=q('ibv_item').value.trim(), value=Number(q('ibv_value').value);
  if(!date || !value) return alert('請填日期與 IBV 數值');
  state.ibv.push({date,person,item,value}); if(person) nameSet.add(person);
  save(); localStorage.setItem(NAME_KEY, JSON.stringify([...nameSet]));
  q('ibv_person').value=''; q('ibv_item').value=''; q('ibv_value').value=''; renderDatalists(); renderIBV();
}

// 312
const TAIWAN_CITIES = ["基隆市","臺北市","新北市","桃園市","新竹市","新竹縣","苗栗縣","臺中市","彰化縣","南投縣","雲林縣","嘉義市","嘉義縣","臺南市","高雄市","屏東縣","宜蘭縣","花蓮縣","臺東縣","澎湖縣","金門縣","連江縣"];
function initCities() {
  const sel = q('i_city'); sel.innerHTML = TAIWAN_CITIES.map(c=>`<option value="\${c}">\${c}</option>`).join('');
}
function renderDatalists(){
  q('names_datalist').innerHTML = [...nameSet].map(n=>`<option value="\${n}">`).join('');
  q('groups_datalist').innerHTML = [...groupSet].map(n=>`<option value="\${n}">`).join('');
}
function renderInteracts(){
  const tb = q('i_table').querySelector('tbody'); tb.innerHTML='';
  state.interacts.forEach((p,idx)=>{
    const latest = p.logs.length? p.logs[p.logs.length-1].date : '';
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>\${idx+1}</td><td>\${p.city}</td><td>\${p.name}</td><td>\${p.group}</td><td>\${latest}</td><td>\${p.logs.length}</td>
    <td class='right'>
      <button class='btn line' data-view='\${idx}'>查看</button>
      <button class='btn line' data-del='\${idx}'>刪除</button>
    </td>`;
    tb.appendChild(tr);
  });
  tb.querySelectorAll('button[data-del]').forEach(b=>b.onclick=()=>{ state.interacts.splice(Number(b.dataset.del),1); save(); renderInteracts(); });
  tb.querySelectorAll('button[data-view]').forEach(b=>b.onclick=()=>{
    const i = state.interacts[Number(b.dataset.view)];
    alert(i.logs.map(l=>`${l.date}  ${
      l.memo.replace(/\n/g,' ')}`).join('\n') || '無紀錄');
  });
}
function addInteract(){
  const city=q('i_city').value, name=q('i_name').value.trim(), group=q('i_group').value.trim(), date=q('i_date').value, memo=q('i_memo').value.trim();
  if(!city||!name||!date) return alert('請填縣市、姓名、日期');
  let obj = state.interacts.find(x=>x.name===name);
  if(!obj) { obj={city,name,group,logs:[]}; state.interacts.push(obj); }
  else { obj.city=city; if(group) obj.group=group; }
  obj.logs.push({date, memo});
  if(name) nameSet.add(name); if(group) groupSet.add(group);
  save(); localStorage.setItem(NAME_KEY, JSON.stringify([...nameSet])); localStorage.setItem(GROUP_KEY, JSON.stringify([...groupSet]));
  q('i_name').value=''; q('i_group').value=''; q('i_memo').value='';
  renderDatalists(); renderInteracts();
}

function exportCSV(){
  // export four sheets merged with section name
  let rows = [];
  rows.push('Section,Date,Name,Item,Value,City,Group,Memo');
  state.recruits.forEach(r=>rows.push(`Recruit,\${r.date},\${r.name},,,,,`));
  state.bv.forEach(o=>rows.push(`BV,\${o.date},\${o.customer},\${o.item},\${o.value},,,`));
  state.ibv.forEach(o=>rows.push(`IBV,\${o.date},\${o.person},\${o.item},\${o.value},,,`));
  state.interacts.forEach(p=>p.logs.forEach(l=>rows.push(`312,\${l.date},\${p.name},,,\${p.city},\${p.group},"\${l.memo.replaceAll('"','""')}"`)));
  const blob = new Blob([rows.join('\n')], {type:'text/csv;charset=utf-8;'});
  const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='IFNT_export_v6.4.1-20251031-3.csv'; a.click();
}

function init(){
  setToday(); renderTabs(); initCities(); renderDatalists();
  renderRecruits(); renderBV(); renderIBV(); renderInteracts();
  q('btnAddRecruit').onclick=addRecruit;
  q('btnAddBV').onclick=addBV;
  q('btnAddIBV').onclick=addIBV;
  q('btnAddInteract').onclick=addInteract;
  q('btnClearInputs').onclick=()=>{ q('i_name').value=''; q('i_group').value=''; q('i_memo').value=''; };
  q('exportCsvBtn').onclick=exportCSV;
}

document.addEventListener('DOMContentLoaded', init);
