
/*! IFNT v6.2.17 patch */
(function(){
  const $ = (s, r=document)=>r.querySelector(s);
  const $$ = (s, r=document)=>Array.from(r.querySelectorAll(s));

  // Audio
  let audioEl;
  function ensureAudio(){
    if (!audioEl){
      audioEl = document.createElement('audio');
      audioEl.src = 'sfx_fireworks.wav';
      audioEl.preload = 'auto';
      audioEl.volume = 1.0;
      document.body.appendChild(audioEl);
    }
    try { audioEl.play().then(()=>{ audioEl.pause(); audioEl.currentTime=0; }).catch(()=>{}); } catch(e){}
  }
  ['click','touchstart'].forEach(ev=>document.addEventListener(ev, ensureAudio, {once:true,capture:true}));

  async function playCelebrate(){
    try { audioEl.currentTime=0; await audioEl.play(); } catch(e){}
    setTimeout(async ()=>{ try { audioEl.currentTime=0; await audioEl.play(); } catch(e){} }, 600);
  }

  function celebrate(){
    ensureAudio(); playCelebrate();
    // simple confetti
    const c=document.createElement('canvas'); c.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:9999'; document.body.appendChild(c);
    const ctx=c.getContext('2d'), DPR=window.devicePixelRatio||1; function rs(){ c.width=innerWidth*DPR; c.height=innerHeight*DPR;} rs(); addEventListener('resize', rs);
    const P = Array.from({length:120},()=>({x:Math.random()*c.width,y:-20,vx:(Math.random()-.5)*2,vy:Math.random()*2+2,c:`hsl(${Math.random()*360},80%,60%)`,r:Math.random()*3+2}));
    let t=0; (function a(){ t++; ctx.clearRect(0,0,c.width,c.height); P.forEach(p=>{ p.vy+=.04*DPR;p.x+=p.vx*DPR;p.y+=p.vy*DPR; ctx.fillStyle=p.c; ctx.beginPath(); ctx.arc(p.x,p.y,p.r*DPR,0,Math.PI*2); ctx.fill();}); if(t<120) requestAnimationFrame(a); else c.remove(); })();
  }

  function parsePairText(el){
    const tx=(el.textContent||'').replace(/\s+/g,'').toLowerCase();
    const m=tx.match(/([0-9]+)\/([0-9]+)/); return m?{cur:+m[1],tgt:+m[2]}:null;
  }
  function updateProgressWrapper(w, cur, tgt){
    if(!w||!tgt) return;
    w.classList.add('ifnt-progress');
    let lab=w.querySelector('.bar-label'); if(!lab){ lab=document.createElement('span'); lab.className='bar-label'; w.appendChild(lab); }
    lab.textContent=`${cur} / ${tgt}`;
    if(cur>=tgt) w.classList.add('ok'); else w.classList.remove('ok');
  }
  function refreshAll(){
    $$('.progress, .ifnt-progressbar').forEach(bar=>{
      let cur=+(bar.dataset.cur||0), tgt=+(bar.dataset.tgt||0);
      if(!(cur&&tgt)){
        const near=bar.closest('.card,section,div')||document;
        const hint=Array.from(near.querySelectorAll('*')).find(n=>/目前累計|當前目標|進度/.test(n.textContent||''));
        const pr=hint?parsePairText(hint):null; if(pr){cur=pr.cur;tgt=pr.tgt;}
      }
      if(tgt>0) updateProgressWrapper(bar,cur,tgt);
    });
  }

  function gateCelebrate(prev, now, tgt){
    if(!(tgt>0)) return;
    if(prev<tgt && now>=tgt) celebrate();
  }

  function setup(){
    $$('button, .btn').forEach(btn=>{
      const tx=(btn.textContent||'').trim();
      if(/新增\s*BV/i.test(tx) || /新增\s*IBV/i.test(tx)){
        btn.addEventListener('click', ()=>{
          setTimeout(()=>{
            const hint = Array.from(document.querySelectorAll('*')).find(n=>/目前累計/.test(n.textContent||''));
            if(!hint) return;
            const pr=parsePairText(hint) || {cur:0,tgt:0};
            const numEl=Array.from(document.querySelectorAll('input')).find(i=>i.type==='number'||/\d/.test(i.value||''));
            const delta=numEl?parseInt(numEl.value||'0',10)||0:0;
            gateCelebrate(pr.cur - Math.max(delta,0), pr.cur, pr.tgt);
            refreshAll();
          },100);
        }, {passive:true});
      }
      if(/儲存目標/.test(tx)){
        btn.addEventListener('click', ()=>{
          setTimeout(()=>{
            const heading=Array.from(document.querySelectorAll('*')).find(n=>/目標設定/.test(n.textContent||''));
            if(heading){ const panel=heading.closest('.card,section,div'); if(panel){ panel.classList.remove('open'); panel.setAttribute('data-expanded','false'); } }
            refreshAll();
          },120);
        }, {passive:true});
      }
    });
  }

  function ready(fn){ if(document.readyState!=='loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  ready(()=>{ refreshAll(); setup(); });
  window.addEventListener('hashchange', refreshAll, false);
  document.addEventListener('click', ()=>{ clearTimeout(window.__ifntT); window.__ifntT=setTimeout(refreshAll,120); }, true);
})();
