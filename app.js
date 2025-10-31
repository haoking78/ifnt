// IFNT v6.4 - core logic with 312 filters
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
};

const CITY_LIST = ["基隆市","台北市","新北市","桃園市","新竹市","新竹縣","苗栗縣","台中市","彰化縣","南投縣","雲林縣","嘉義市","嘉義縣","台南市","高雄市","屏東縣","宜蘭縣","花蓮縣","台東縣","澎湖縣","金門縣","連江縣"];

const K = {
  RC: 'IFNT_RECRUITS',
  BV: 'IFNT_BV',
  IBV: 'IFNT_IBV',
  CRM: 'IFNT_CRM',
  NAMES: 'IFNT_NAME_SET',
  GROUPS: 'IFNT_GROUP_SET'
};

// init sets
const nameSet = new Set(store.get(K.NAMES, []));
const groupSet = new Set(store.get(K.GROUPS, []));

// helpers
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
const fmt = (d) => d ? d : '';

function todayStr() {
  const d = new Date(); const m = String(d.getMonth()+1).padStart(2,'0'); const day = String(d.getDate()).padStart(2,'0');
  return d.getFullYear() + '-' + m + '-' + day;
}

function renderNameList() {
  const dl = $('#nameList');
  dl.innerHTML = Array.from(nameSet).map(n => `<option value="${n}"></option>`).join('');
}
function renderGroupList() {
  const dl = $('#groupList');
  dl.innerHTML = Array.from(groupSet).map(n => `<option value="${n}"></option>`).join('');
}

function saveSets() {
  store.set(K.NAMES, Array.from(nameSet));
  store.set(K.GROUPS, Array.from(groupSet));
}

// tabs
$$('.tab').forEach(t => t.addEventListener('click', e => {
  $$('.tab').forEach(x=>x.classList.remove('active')); t.classList.add('active');
  const id = t.dataset.tab;
  ['recruit','bv','ibv','crm'].forEach(k => $('#tab-'+k).style.display = (k===id?'block':'none'));
}));

// init inputs
$('#rcDate').value = todayStr();
$('#bvDate').value = todayStr();
$('#ibvDate').value = todayStr();
$('#crmDate').value = todayStr();

// fill city selects
function fillSelect(sel) {
  sel.innerHTML = CITY_LIST.map(c=>`<option value="${c}">${c}</option>`).join('');
}
fillSelect($('#crmCity')); fillSelect($('#fCity'));
renderNameList(); renderGroupList();

// load data
let rc = store.get(K.RC, []);
let bv = store.get(K.BV, []);
let ibv = store.get(K.IBV, []);
let crm = store.get(K.CRM, []);

// ===== Recruit =====
function renderRecruit() {
  $('#rcCount').textContent = rc.length;
  $('#rcHit').textContent = rc.length >= 1 ? '🎉 已達標' : '';
  const tb = $('#rcTable tbody'); tb.innerHTML = '';
  rc.forEach((r,i)=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${i+1}</td><td>${r.date}</td><td>${r.name}</td>
      <td><button data-i="${i}" class="del-rc">刪除</button></td>`;
    tb.appendChild(tr);
  });
  $$('.del-rc').forEach(b=>b.onclick = () => { rc.splice(b.dataset.i,1); store.set(K.RC, rc); renderRecruit(); });
}
$('#addRecruit').onclick = () => {
  const name = $('#rcName').value.trim(); const date = $('#rcDate').value || todayStr();
  if(!name) return alert('請輸入姓名');
  rc.push({date,name}); store.set(K.RC, rc); nameSet.add(name); saveSets(); renderNameList(); $('#rcName').value=''; renderRecruit();
};
renderRecruit();

// ===== BV =====
function bvTotals() {
  const tot = bv.reduce((s,x)=>s + (Number(x.value)||0), 0);
  const remain = Math.max(0, 1500 - tot);
  $('#bvTotal').textContent = tot;
  $('#bvRemain').textContent = remain;
  const hit = tot >= 1500;
  $('#bvStatus').textContent = hit ? '已達標' : '未達標';
  $('#bvStatus').className = 'v ' + (hit?'ok':'bad');
  $('#bvRemain').className = 'v ' + (hit?'ok':'bad');
  $('#bvBadge').style.display = hit ? 'inline-flex' : 'none';
}
function renderBV() {
  bvTotals();
  const tb = $('#bvTable tbody'); tb.innerHTML = '';
  bv.forEach((x,i)=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${i+1}</td><td>${x.date}</td><td>${fmt(x.customer)}</td><td>${fmt(x.item)}</td><td>${x.value}</td>
      <td><button data-i="${i}" class="del-bv">刪除</button></td>`;
    tb.appendChild(tr);
  });
  $$('.del-bv').forEach(b=>b.onclick = () => { bv.splice(b.dataset.i,1); store.set(K.BV, bv); renderBV(); });
}
$('#addBV').onclick = () => {
  const date=$('#bvDate').value||todayStr(); const customer=$('#bvCustomer').value.trim(); const item=$('#bvItem').value.trim();
  const value = Number($('#bvValue').value||0); if(!value) return alert('請輸入 BV 數值');
  bv.push({date, customer, item, value}); store.set(K.BV, bv);
  if(customer) nameSet.add(customer);
  saveSets(); renderNameList();
  $('#bvCustomer').value=''; $('#bvItem').value=''; $('#bvValue').value='';
  renderBV();
};
renderBV();

// ===== IBV =====
function ibvTotals() {
  const tot = ibv.reduce((s,x)=>s + (Number(x.value)||0), 0);
  const remain = Math.max(0, 300 - tot);
  $('#ibvTotal').textContent = tot;
  $('#ibvRemain').textContent = remain;
  const hit = tot >= 300;
  $('#ibvStatus').textContent = hit ? '已達標' : '未達標';
  $('#ibvStatus').className = 'v ' + (hit?'ok':'bad');
  $('#ibvRemain').className = 'v ' + (hit?'ok':'bad');
  $('#ibvBadge').style.display = hit ? 'inline-flex' : 'none';
}
function renderIBV() {
  ibvTotals();
  const tb = $('#ibvTable tbody'); tb.innerHTML='';
  ibv.forEach((x,i)=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${i+1}</td><td>${x.date}</td><td>${fmt(x.name)}</td><td>${fmt(x.item)}</td><td>${x.value}</td>
      <td><button data-i="${i}" class="del-ibv">刪除</button></td>`;
    tb.appendChild(tr);
  });
  $$('.del-ibv').forEach(b=>b.onclick = () => { ibv.splice(b.dataset.i,1); store.set(K.IBV, ibv); renderIBV(); });
}
$('#addIBV').onclick = () => {
  const date=$('#ibvDate').value||todayStr(); const name=$('#ibvName').value.trim(); const item=$('#ibvItem').value.trim();
  const value = Number($('#ibvValue').value||0); if(!value) return alert('請輸入 IBV 數值');
  ibv.push({date, name, item, value}); store.set(K.IBV, ibv);
  if(name) nameSet.add(name); saveSets(); renderNameList();
  $('#ibvName').value=''; $('#ibvItem').value=''; $('#ibvValue').value='';
  renderIBV();
};
renderIBV();

// ===== CRM =====
function fillCitySelects() { fillSelect($('#crmCity')); fillSelect($('#fCity')); }
fillCitySelects();

function renderCRM(filter=null) {
  // filter: {city?, name?, group?, kw?, from?, to?}
  let list = [...crm];
  if(filter) {
    if(filter.city) list = list.filter(x=>x.city===filter.city);
    if(filter.name) list = list.filter(x=>x.name.includes(filter.name));
    if(filter.group) list = list.filter(x=>x.group.includes(filter.group));
    if(filter.kw) list = list.filter(x=> x.logs.some(l => (l.note||'').includes(filter.kw)));
    if(filter.from) list = list.filter(x=> x.latest >= filter.from);
    if(filter.to) list = list.filter(x=> x.latest <= filter.to);
  }
  const tb = $('#crmTable tbody'); tb.innerHTML = '';
  list.forEach((p,i)=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${i+1}</td><td>${p.city}</td><td>${p.name}</td><td>${p.group}</td><td>${p.latest}</td><td>${p.logs.length}</td>
      <td><button class="view-crm" data-id="${p.id}">查看</button> <button class="del-crm" data-id="${p.id}">刪除</button></td>`;
    tb.appendChild(tr);
  });
  $$('.view-crm').forEach(b=>b.onclick = () => viewCRM(b.dataset.id));
  $$('.del-crm').forEach(b=>b.onclick = () => delCRM(b.dataset.id));
}

function findCRM(name) { return crm.find(x=>x.name===name); }

function addCRM() {
  const city=$('#crmCity').value; const name=$('#crmName').value.trim(); const group=$('#crmGroup').value.trim();
  const date=$('#crmDate').value||todayStr(); const note=$('#crmNote').value.trim();
  if(!name) return alert('請輸入姓名');
  let p = findCRM(name);
  if(!p) {
    p = { id: Date.now().toString(36), city, name, group, latest: date, logs: [] };
    crm.push(p);
  }
  // 更新 city/group（以最新為準）
  p.city = city; if(group) p.group = group;
  p.logs.push({date, note});
  p.latest = date;
  store.set(K.CRM, crm);

  // 記憶清單
  nameSet.add(name); if(group) groupSet.add(group); saveSets(); renderNameList(); renderGroupList();

  // 清空欄位以便下一筆
  $('#crmName').value=''; $('#crmGroup').value=''; $('#crmNote').value='';

  renderCRM();
}

function viewCRM(id) {
  const p = crm.find(x=>x.id===id); if(!p) return;
  const lines = p.logs.map(l=>`• ${l.date}  ${l.note||''}`).join('\n');
  alert(`[ ${p.city} ] ${p.name}（${p.group||'-'}）\n最近互動：${p.latest}\n——\n${lines||'尚無內容'}`);
}

function delCRM(id) {
  if(!confirm('確定刪除此人以及其所有互動紀錄？')) return;
  crm = crm.filter(x=>x.id!==id); store.set(K.CRM, crm); renderCRM();
}

$('#addCRM').onclick = addCRM;
$('#clearCRMRow').onclick = () => { $('#crmName').value=''; $('#crmGroup').value=''; $('#crmNote').value=''; };

$('#applyFilter').onclick = () => {
  const f = {
    city: $('#fCity').value || null,
    name: $('#fName').value.trim() || null,
    group: $('#fGroup').value.trim() || null,
    kw: $('#fKeyword').value.trim() || null,
    from: $('#fFrom').value || null,
    to: $('#fTo').value || null,
  };
  renderCRM(f);
};
$('#resetFilter').onclick = () => { $('#fCity').value=''; $('#fName').value=''; $('#fGroup').value=''; $('#fKeyword').value=''; $('#fFrom').value=''; $('#fTo').value=''; renderCRM(); };

renderCRM();

// ===== Export CSV =====
function toCSV(rows) {
  const esc = v => '"' + String(v).replaceAll('"','""') + '"';
  return rows.map(r=>r.map(esc).join(',')).join('\n');
}

$('#exportCsvBtn').onclick = () => {
  const rows = [];
  rows.push(['類別','日期','姓名','品項/族群','BV/IBV','備註']);
  rc.forEach(x=> rows.push(['Recruit', x.date, x.name, '', '', '']));
  bv.forEach(x=> rows.push(['BV', x.date, x.customer||'', x.item||'', x.value||'', '']));
  ibv.forEach(x=> rows.push(['IBV', x.date, x.name||'', x.item||'', x.value||'', '']));
  crm.forEach(p=> p.logs.forEach(l=> rows.push(['CRM', l.date, p.name, p.group||'', '', l.note||''])));
  const blob = new Blob([toCSV(rows)], {type:'text/csv;charset=utf-8'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = 'IFNT_export_'+ new Date().toISOString().slice(0,10) + '.csv';
  a.click();
};

// Service Worker
if('serviceWorker' in navigator) { navigator.serviceWorker.register('./service-worker.js'); }
