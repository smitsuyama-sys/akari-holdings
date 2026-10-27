(function(){
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const loader = document.getElementById('loader');
  document.querySelectorAll('[data-split]').forEach(el=>{
    const nodes=[...el.childNodes]; el.textContent='';
    nodes.forEach(n=>{
      if(n.nodeType===3){[...n.textContent].forEach(c=>{const s=document.createElement('span');s.className='ch';s.textContent=c;el.appendChild(s);});}
      else{const w=document.createElement(n.nodeName.toLowerCase());[...n.textContent].forEach(c=>{const s=document.createElement('span');s.className='ch';s.textContent=c;w.appendChild(s);});el.appendChild(w);}
    });
  });
  const chars=document.querySelectorAll('.hero-title .ch');
  let started=false;
  function start(){
    if(started)return;started=true;
    if(loader){loader.classList.add('is-done');setTimeout(()=>loader.remove(),1200);}
    chars.forEach((c,i)=>{c.style.animationDelay=(0.3+i*0.07)+'s';c.classList.add('is-in');});
  }
  addEventListener('load',()=>setTimeout(start,reduce?0:1400));
  setTimeout(start,3000);

  const header=document.getElementById('header'),totop=document.getElementById('totop');
  const onScroll=()=>{const y=scrollY;header&&header.classList.toggle('is-scrolled',y>40);totop&&totop.classList.toggle('is-show',y>innerHeight);};
  addEventListener('scroll',onScroll,{passive:true});onScroll();

  const burger=document.getElementById('burger'),nav=document.getElementById('nav');
  if(burger&&nav){
    burger.addEventListener('click',()=>{const o=nav.classList.toggle('is-open');burger.classList.toggle('is-open',o);burger.setAttribute('aria-expanded',o);document.body.style.overflow=o?'hidden':'';});
    nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('is-open');burger.classList.remove('is-open');document.body.style.overflow='';}));
  }

  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-in');io.unobserve(e.target);}}),{threshold:.12,rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('.rv').forEach((el,i)=>{el.style.transitionDelay=((i%4)*0.08)+'s';io.observe(el);});

  const cio=new IntersectionObserver(es=>es.forEach(e=>{
    if(!e.isIntersecting)return;const el=e.target,end=+el.dataset.count;const t0=performance.now(),d=reduce?0:1400;
    (function tick(t){const p=Math.min(1,(t-t0)/(d||1)),v=Math.round(end*(1-Math.pow(1-p,3)));el.firstChild.nodeValue=v;if(p<1)requestAnimationFrame(tick);})(t0);
    cio.unobserve(el);
  }),{threshold:.6});
  document.querySelectorAll('[data-count]').forEach(el=>{el.insertBefore(document.createTextNode('0'),el.firstChild);cio.observe(el);});

  const cur=document.getElementById('cursor'),ring=document.getElementById('cursorRing');
  if(cur&&ring&&matchMedia('(hover:hover)').matches&&innerWidth>900){
    let x=innerWidth/2,y=innerHeight/2,rx=x,ry=y;
    addEventListener('mousemove',e=>{x=e.clientX;y=e.clientY;cur.style.transform=`translate(${x}px,${y}px)`;});
    (function loop(){rx+=(x-rx)*.18;ry+=(y-ry)*.18;ring.style.transform=`translate(${rx}px,${ry}px) translate(-50%,-50%)`;requestAnimationFrame(loop);})();
    document.querySelectorAll('a,button,.menu-item,.card,.pillar,.store').forEach(el=>{
      el.addEventListener('mouseenter',()=>document.body.classList.add('is-hover'));
      el.addEventListener('mouseleave',()=>document.body.classList.remove('is-hover'));
    });
  }

  const cv=document.getElementById('embers');
  if(cv&&!reduce){
    const ctx=cv.getContext('2d');let W,H,P=[];const dpr=Math.min(devicePixelRatio||1,2);
    function size(){W=cv.clientWidth;H=cv.clientHeight;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);}
    size();addEventListener('resize',size);
    const N=Math.min(70,Math.floor(W*H/18000));
    function mk(fresh){return{x:Math.random()*W,y:fresh?H+Math.random()*80:Math.random()*H,r:Math.random()*1.6+.3,s:Math.random()*.45+.15,w:Math.random()*Math.PI*2,a:Math.random()*.6+.15,h:Math.random()<.3?42:24};}
    for(let i=0;i<N;i++)P.push(mk(false));
    let t=0;
    (function draw(){
      t+=.01;ctx.clearRect(0,0,W,H);
      for(const p of P){
        p.y-=p.s*(1+p.r*.3);p.x+=Math.sin(t*1.4+p.w)*.3;p.a-=.001;
        if(p.y<-20||p.a<=0)Object.assign(p,mk(true));
        const fl=.6+Math.sin(t*8+p.w)*.4;
        ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=`hsla(${p.h},90%,${62+fl*12}%,${p.a*fl})`;
        ctx.shadowBlur=p.r*7;ctx.shadowColor=`hsla(${p.h},90%,55%,${p.a})`;ctx.fill();
      }
      ctx.shadowBlur=0;requestAnimationFrame(draw);
    })();
  }

  const title=document.querySelector('.hero-title');
  if(title&&!reduce)addEventListener('scroll',()=>{const y=Math.min(scrollY,innerHeight);title.style.transform=`translateY(${y*.16}px)`;title.style.opacity=1-y/innerHeight*.9;},{passive:true});
})();
