
(()=>{
  const $=(s,d=document)=>d.querySelector(s), $$=(s,d=document)=>d.querySelectorAll(s);
  const LS={get(k,def){try{return JSON.parse(localStorage.getItem(k)??JSON.stringify(def))}catch(e){return def}}, set(k,v){localStorage.setItem(k,JSON.stringify(v))}};

  $$(".nav button").forEach(btn=>{
    btn.addEventListener('click', ()=>{
      $$(".nav button").forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
      const tab=btn.dataset.tab;
      ["recruit","bv","ibv","interact"].forEach(id=> $("#"+id).style.display=(id===tab)?"":"none");
    });
  });

  const state = LS.get("ifnt-state", {version:"6.2.14",recruit:{goal:1,rows:[]},bv:{goal:1500,rows:[]},ibv:{goal:300,rows:[]},people:{}});
  function save(){LS.set("ifnt-state",state)}

  // Top goals inputs
  $("#goalRecruit").value = state.recruit.goal || 1;
  $("#goalBV").value = state.bv.goal || 1500;
  $("#goalIBV").value = state.ibv.goal || 300;
  function refreshGoalUI(){
    $("#goalHint").textContent = `目前目標：招募 ${state.recruit.goal} 人 ／ BV ${state.bv.goal} ／ IBV ${state.ibv.goal}`;
    $("#rGoal").textContent = state.recruit.goal;
    $("#rGoalInline").textContent = state.recruit.goal;
    $("#bvGoalTitle").textContent = state.bv.goal;
    $("#bvGoalText").textContent = state.bv.goal;
    $("#ibvGoalTitle").textContent = state.ibv.goal;
    $("#ibvGoalText").textContent = state.ibv.goal;
  }
  $("#btnSaveGoals").addEventListener("click", ()=>{
    const rg = Math.max(0, parseInt($("#goalRecruit").value||"1",10)||1);
    const bv = Math.max(0, parseInt($("#goalBV").value||"1500",10)||1500);
    const ibv= Math.max(0, parseInt($("#goalIBV").value||"300",10)||300);
    state.recruit.goal=rg; state.bv.goal=bv; state.ibv.goal=ibv;
    save(); refreshGoalUI(); renderRecruit(); renderBV(); renderIBV(); checkBadges();
  });
  refreshGoalUI();

  const today=()=>new Date().toISOString().slice(0,10);
  ["#rDate","#bvDate","#ibvDate","#pDate"].forEach(s=>$(s).value=today());

  function toast(m){const t=$("#toast"); t.textContent=m; t.style.display="block"; setTimeout(()=>t.style.display="none",1600)}
  function showPersonModal(title, lines){$("#modalTitle").textContent=title; $("#modalLines").textContent=lines||"（無）"; $("#modalWrap").style.display="flex"}
  $("#btnCloseModal").addEventListener("click",()=> $("#modalWrap").style.display="none");
  $("#modalWrap").addEventListener("click",(e)=>{ if(e.target.id==="modalWrap") $("#modalWrap").style.display="none"; });

  function celebrate(){
    const ctx=new (window.AudioContext||window.webkitAudioContext)();
    function ding(freq, when=0){
      const o=ctx.createOscillator(), g=ctx.createGain(); o.connect(g); g.connect(ctx.destination);
      o.type="sine"; o.frequency.value=freq;
      g.gain.setValueAtTime(0.0001, ctx.currentTime+when);
      g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime+when+0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime+when+0.35);
      o.start(ctx.currentTime+when); o.stop(ctx.currentTime+when+0.4);
    }
    ding(1200,0); ding(1600,0.35);

    const cvs=$("#fw"), c=cvs.getContext("2d");
    cvs.width=innerWidth; cvs.height=innerHeight; cvs.style.display="block";
    const ps=Array.from({length:140},()=>({x:cvs.width/2,y:cvs.height/2,vx:(Math.random()*2-1)*6,vy:(Math.random()*2-1)*6,life:60+Math.random()*20,color:`hsl(${Math.random()*360},90%,60%)`}));
    (function step(){
      c.clearRect(0,0,cvs.width,cvs.height);
      ps.forEach(p=>{p.x+=p.vx; p.y+=p.vy; p.vy+=0.08; p.life--; c.fillStyle=p.color; c.fillRect(p.x,p.y,3,3)});
      if (ps.some(p=>p.life>0)) requestAnimationFrame(step); else cvs.style.display="none";
    })();
    setTimeout(()=> cvs.style.display="none", 1800);
  }
  function checkBadges(){
    const bvOk = state.bv.rows.reduce((a,b)=>a+(+b.qty||0),0) >= state.bv.goal;
    const ibvOk= state.ibv.rows.reduce((a,b)=>a+(+b.qty||0),0) >= state.ibv.goal;
    const rOk  = state.recruit.rows.length >= state.recruit.goal;
    if (bvOk || ibvOk || rOk) celebrate();
  }

  // Recruit
  function renderRecruit(){
    const body=$("#rTable tbody"); body.innerHTML="";
    state.recruit.rows.forEach((r,i)=>{
      const tr=document.createElement("tr");
      tr.innerHTML=`<td>${i+1}</td><td>${r.date}</td><td>${r.name}</td>
      <td><button class="btn secondary" data-i="${i}" data-act="del">刪除</button></td>`;
      body.appendChild(tr);
    });
    $("#rCount").textContent=state.recruit.rows.length;
    $("#rGoal").textContent=state.recruit.goal;
    $("#rGoalInline").textContent=state.recruit.goal;
    $("#rBadge").style.display=(state.recruit.rows.length>=state.recruit.goal)?"inline-flex":"none";
  }
  $("#btnAddRecruit").addEventListener("click",()=>{
    const date=$("#rDate").value||today(), name=($("#rName").value||"").trim();
    if(!name) return toast("請輸入姓名");
    state.recruit.rows.unshift({date,name});
    $("#rName").value="";
    save(); renderRecruit(); checkBadges();
  });
  $("#rTable").addEventListener("click",(e)=>{
    if (e.target.dataset.act==="del"){ state.recruit.rows.splice(+e.target.dataset.i,1); save(); renderRecruit(); checkBadges(); }
  });

  // BV
  function renderBV(){
    const body=$("#bvTable tbody"); body.innerHTML="";
    let sum=0;
    state.bv.rows.forEach((r,i)=>{
      sum += (+r.qty||0);
      const tr=document.createElement("tr");
      tr.innerHTML=`<td>${i+1}</td><td>${r.date}</td><td><button class="btn secondary small" data-view="bv" data-name="${r.name}">${r.name||"（未填）"}</button></td>
      <td>${r.item||""}</td><td>${r.qty}</td>
      <td><button class="btn secondary" data-i="${i}" data-act="del-bv">刪除</button></td>`;
      body.appendChild(tr);
    });
    const ok=sum>=state.bv.goal;
    $("#bvGoalTitle").textContent=state.bv.goal;
    $("#bvGoalText").textContent=state.bv.goal;
    $("#bvSum").textContent=sum;
    $("#bvSum").className= ok? "ok":"warn";
    $("#bvBadge").style.display = ok ? "inline-flex":"none";
  }
  $("#btnAddBV").addEventListener("click",()=>{
    const date=$("#bvDate").value||today(), name=($("#bvCustomer").value||"").trim(), item=($("#bvItem").value||"").trim(), qty=+(($("#bvQty").value)||"0");
    if(!qty) return toast("請輸入 BV 數量");
    state.bv.rows.unshift({date,name,item,qty});
    $("#bvItem").value=""; $("#bvQty").value="";
    save(); renderBV(); checkBadges();
  });
  $("#bvTable").addEventListener("click",(e)=>{
    const t=e.target;
    if (t.dataset.act==="del-bv"){ state.bv.rows.splice(+t.dataset.i,1); save(); renderBV(); checkBadges(); }
    if (t.dataset.view==="bv"){
      const name=t.dataset.name;
      const list=state.bv.rows.filter(r=>(r.name||"")===name);
      showPersonModal(`【${name||"（未填）"}】`, list.map(r=>`${r.date}｜${r.item} ${r.qty} BV`).join("\n") || "（沒有資料）");
    }
  });

  // IBV
  function renderIBV(){
    const body=$("#ibvTable tbody"); body.innerHTML="";
    let sum=0;
    state.ibv.rows.forEach((r,i)=>{
      sum += (+r.qty||0);
      const tr=document.createElement("tr");
      tr.innerHTML=`<td>${i+1}</td><td>${r.date}</td><td><button class="btn secondary small" data-view="ibv" data-name="${r.name}">${r.name||"（未填）"}</button></td>
      <td>${r.item||""}</td><td>${r.qty}</td>
      <td><button class="btn secondary" data-i="${i}" data-act="del-ibv">刪除</button></td>`;
      body.appendChild(tr);
    });
    const ok=sum>=state.ibv.goal;
    $("#ibvGoalTitle").textContent=state.ibv.goal;
    $("#ibvGoalText").textContent=state.ibv.goal;
    $("#ibvSum").textContent=sum;
    $("#ibvSum").className= ok? "ok":"warn";
    $("#ibvBadge").style.display = ok ? "inline-flex":"none";
  }
  $("#btnAddIBV").addEventListener("click",()=>{
    const date=$("#ibvDate").value||today(), name=($("#ibvName").value||"").trim(), item=($("#ibvItem").value||"").trim(), qty=+(($("#ibvQty").value)||"0");
    if(!qty) return toast("請輸入 IBV 數量");
    state.ibv.rows.unshift({date,name,item,qty});
    $("#ibvItem").value=""; $("#ibvQty").value="";
    save(); renderIBV(); checkBadges();
  });
  $("#ibvTable").addEventListener("click",(e)=>{
    const t=e.target;
    if (t.dataset.act==="del-ibv"){ state.ibv.rows.splice(+t.dataset.i,1); save(); renderIBV(); checkBadges(); }
    if (t.dataset.view==="ibv"){
      const name=t.dataset.name;
      const list=state.ibv.rows.filter(r=>(r.name||"")===name);
      showPersonModal(`【${name||"（未填）"}】`, list.map(r=>`${r.date}｜${r.item} ${r.qty} IBV`).join("\n") || "（沒有資料）");
    }
  });

  // 312
  function render312(){
    const body=$("#interactTable tbody"); body.innerHTML="";
    const arr=Object.entries(state.people).map(([name,p])=>({name, ...p, latest:p.logs[0]?.date||"", times:p.logs.length})).sort((a,b)=>(b.latest||"").localeCompare(a.latest||""));
    arr.forEach((p,i)=>{
      const tr=document.createElement("tr");
      tr.innerHTML=`<td>${i+1}</td><td>${p.city||""}</td><td><button class="btn secondary small" data-view="p" data-name="${p.name}">${p.name}</button></td>
      <td>${p.group||""}</td><td>${p.latest||""}</td><td>${p.times}</td>
      <td><button class="btn secondary" data-name="${p.name}" data-act="del-person">刪除</button></td>`;
      body.appendChild(tr);
    });
  }
  $("#btnAddInteract").addEventListener("click",()=>{
    const city=$("#city").value, name=($("#pName").value||"").trim(); if(!name) return toast("請輸入姓名");
    const group=($("#pGroup").value||"").trim(), date=$("#pDate").value||today(), note=($("#pNote").value||"").trim();
    state.people[name]=state.people[name]||{city,group,logs:[]};
    if(city) state.people[name].city=city;
    if(group) state.people[name].group=group;
    state.people[name].logs.unshift({date,note});
    save(); render312();
    $("#pName").value=""; $("#pGroup").value=""; $("#pNote").value="";
  });
  $("#btnClearForm").addEventListener("click",()=>{$("#city").value=""; $("#pName").value=""; $("#pGroup").value=""; $("#pDate").value=today(); $("#pNote").value=""});
  $("#interactTable").addEventListener("click",(e)=>{
    const t=e.target;
    if (t.dataset.act==="del-person"){ delete state.people[t.dataset.name]; save(); render312(); }
    if (t.dataset.view==="p"){
      const name=t.dataset.name; const p=state.people[name];
      const title=`【${name}】(${p.city||""}｜${p.group||""})`.replace(/\s\|\s\)/,' )');
      const lines=(p.logs||[]).map(x=>`${x.date}｜${x.note||""}`).join("\n")||"（沒有資料）";
      showPersonModal(title, lines);
    }
  });

  // Export
  $("#btnExport").addEventListener("click",()=>{
    const rows=[];
    rows.push(["Recruit","日期","姓名"]);
    state.recruit.rows.forEach(r=>rows.push(["Recruit",r.date,r.name]));
    rows.push([]);
    rows.push(["BV","日期","姓名","品項","BV"]);
    state.bv.rows.forEach(r=>rows.push(["BV",r.date,r.name,r.item,r.qty]));
    rows.push([]);
    rows.push(["IBV","日期","姓名","品項","IBV"]);
    state.ibv.rows.forEach(r=>rows.push(["IBV",r.date,r.name,r.item,r.qty]));
    rows.push([]);
    rows.push(["312","姓名","縣市","族群","日期","內容"]);
    Object.entries(state.people).forEach(([name,p])=>{ p.logs.forEach(l=>rows.push(["312",name,p.city||"",p.group||"",l.date,l.note||""])) });
    const csv = rows.map(r => r.map(x => `"${(x??"").toString().replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});
    const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=`IFNT_export_${new Date().toISOString().slice(0,10)}.csv`; a.click();
    toast("已匯出 CSV");
  });

  function init(){ renderRecruit(); renderBV(); renderIBV(); render312(); }
  init();
})();
