
const $ = (s)=>document.querySelector(s);

function scrollToTop(){ window.scrollTo({ top: 0, behavior: "smooth" }); }
function scrollToId(id){
  const el = document.getElementById(id);
  if(!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 66; // sticky header offset
  window.scrollTo({ top, behavior: "smooth" });
}

let recruitList = JSON.parse(localStorage.getItem("recruitList") || "[]");
let bvTotal = parseInt(localStorage.getItem("bvTotal") || 0);
let ibvTotal = parseInt(localStorage.getItem("ibvTotal") || 0);
let interactions = JSON.parse(localStorage.getItem("interactions") || "[]");

let audioCtx;
function playDoubleChime(){
  try{
    if(!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)();
    const now = audioCtx.currentTime;
    const dur = 0.18;
    const gap = 0.32;
    const freqs = [1318.5, 1568.0];
    for(let i=0;i<2;i++){
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freqs[i%freqs.length], now + i*gap);
      gain.gain.setValueAtTime(0.0001, now + i*gap);
      gain.gain.exponentialRampToValueAtTime(0.25, now + i*gap + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i*gap + dur);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(now + i*gap);
      osc.stop(now + i*gap + dur + 0.02);
    }
  }catch(e){}
}
function popupSuccess(){
  const d = document.createElement('div');
  d.textContent = "🎉 達標成功！";
  d.style.position='fixed'; d.style.top='20px'; d.style.left='50%';
  d.style.transform='translateX(-50%)'; d.style.background='rgba(0,0,0,.65)';
  d.style.padding='12px 18px'; d.style.borderRadius='12px'; d.style.color='#86efac';
  d.style.fontWeight='800'; d.style.zIndex='9999'; d.style.border='1px solid #22c55e';
  document.body.appendChild(d);
  setTimeout(()=>{ d.remove(); }, 1200);
}
function celebrate(badgeEl){
  if(!badgeEl) return;
  badgeEl.classList.remove('badge-red'); badgeEl.classList.add('badge-green','badge-pop');
  setTimeout(()=>badgeEl.classList.remove('badge-pop'), 1200);
  playDoubleChime();
  popupSuccess();
}
function updateBadges(){
  const bvGoal = parseInt($("#bvGoal").textContent || "1500");
  const ibvGoal = parseInt($("#ibvGoal").textContent || "300");
  const bvBadge = $("#bvBadge");
  const ibvBadge = $("#ibvBadge");
  if(bvTotal >= bvGoal){
    bvBadge.textContent = "已達標"; celebrate(bvBadge);
  }else{
    bvBadge.textContent = "距離 " + (bvGoal - bvTotal);
    bvBadge.classList.add('badge-red'); bvBadge.classList.remove('badge-green');
  }
  if(ibvTotal >= ibvGoal){
    ibvBadge.textContent = "已達標"; celebrate(ibvBadge);
  }else{
    ibvBadge.textContent = "距離 " + (ibvGoal - ibvTotal);
    ibvBadge.classList.add('badge-red'); ibvBadge.classList.remove('badge-green');
  }
  $("#bvTotal").style.color = (bvTotal>=bvGoal? '#22c55e' : '#ef9a9a');
  $("#ibvTotal").style.color = (ibvTotal>=ibvGoal? '#22c55e' : '#ef9a9a');
}

function saveData(){
  localStorage.setItem("recruitList", JSON.stringify(recruitList));
  localStorage.setItem("bvTotal", bvTotal);
  localStorage.setItem("ibvTotal", ibvTotal);
  localStorage.setItem("interactions", JSON.stringify(interactions));
}

$("#addRecruit").onclick = () => {
  const date = $("#recruitDate").value;
  const name = $("#recruitName").value.trim();
  if (!date || !name) return alert("請輸入完整資料");
  recruitList.push({ date, name });
  saveData();
  $("#recruitName").value = ""; $("#recruitDate").value = "";
  renderRecruit();
};

$("#addBV").onclick = () => {
  const amount = parseInt($("#bvAmount").value || 0);
  if (!amount) return alert("請輸入 BV 數量");
  bvTotal += amount;
  saveData();
  $("#bvAmount").value = "";
  renderBV(); updateBadges();
};

$("#addIBV").onclick = () => {
  const amount = parseInt($("#ibvAmount").value || 0);
  if (!amount) return alert("請輸入 IBV 數量");
  ibvTotal += amount;
  saveData();
  $("#ibvAmount").value = "";
  renderIBV(); updateBadges();
};

$("#addInteraction").onclick = () => {
  const city = $("#city").value;
  const group = $("#group").value.trim();
  const person = $("#person").value.trim();
  const date = $("#interactDate").value;
  const detail = $("#interactionDetail").value.trim();
  if (!person || !detail) return alert("請輸入互動內容");
  let existing = interactions.find(i => i.person === person);
  if (existing) existing.records.push({ date, detail, city: city||existing.city, group: group||existing.group });
  else interactions.push({ city, group, person, records: [{ date, detail }] });
  saveData();
  $("#interactionDetail").value = "";
  renderInteractions(); refreshNameList();
};

$("#exportCSV").onclick = () => {
  const rows = [
    ["招募姓名","日期"],
    ...recruitList.map(r => [r.name, r.date]),
    [],
    ["BV 總量", bvTotal],
    ["IBV 總量", ibvTotal],
  ];
  const csv = rows.map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  const dateStr = new Date().toISOString().slice(0,10);
  a.href = URL.createObjectURL(blob);
  a.download = `IFNT_${dateStr}.csv`;
  a.click();
};

function renderRecruit(){ $("#recruitList").innerHTML = recruitList.map(r => `<p>${r.date} - ${r.name}</p>`).join(""); }
function renderBV(){ $("#bvTotal").textContent = bvTotal; }
function renderIBV(){ $("#ibvTotal").textContent = ibvTotal; }
function renderInteractions(){
  const list = $("#interactionList");
  list.innerHTML = interactions.map(i => `
    <div class="record">
      <strong>${i.city||''}｜${i.group||''}｜${i.person}</strong>
      ${i.records.map(r => `<p>${r.date||''}：${r.detail}</p>`).join("")}
    </div>
  `).join("");
}
function refreshNameList(){
  const dl = document.getElementById("nameList");
  const names = [...new Set(interactions.map(i=>i.person))].sort();
  dl.innerHTML = names.map(n=>`<option value="${n}">`).join("");
}

(function initDates(){
  const today = new Date().toISOString().slice(0,10);
  ["recruitDate","bvDate","ibvDate","interactDate"].forEach(id=>{
    const el = document.getElementById(id); if(el) el.value = today;
  });
})();
renderRecruit(); renderBV(); renderIBV(); renderInteractions(); refreshNameList(); updateBadges();
