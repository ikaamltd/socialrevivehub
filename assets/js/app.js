(()=>{
 const menu=document.getElementById('menuToggle'),nav=document.querySelector('.nav-head');
 if(menu&&nav){menu.addEventListener('click',()=>{let open=nav.classList.toggle('mobile-open');menu.setAttribute('aria-expanded',String(open));menu.textContent=open?'✕':'☰';});}
 /* Two-level service menu: categories first, then matching services on hover/click/focus. */
 const drop=document.querySelector('.nav-drop');
 if(drop){
  const trigger=drop.querySelector('.nav-drop-btn');
  const categories=[...drop.querySelectorAll('[data-mega-category]')];
  const panels=[...drop.querySelectorAll('[data-mega-panel]')];
  const empty=drop.querySelector('[data-mega-empty]');
  const mega=drop.querySelector('.nav-mega--categories');
  const serviceArea=drop.querySelector('.mega-service-area');
  const isMobile=()=>window.matchMedia('(max-width:850px)').matches;
  // Mobile uses a compact two-screen drill-down rather than stacking both
  // the five categories and up to ten services in a clipped scroll panel.
  const back=document.createElement('button');
  back.type='button';back.className='mega-mobile-back';
  back.textContent='← All categories';back.hidden=true;
  serviceArea?.prepend(back);
  const choose=(id)=>{
   categories.forEach(button=>{const active=button.dataset.megaCategory===id;button.classList.toggle('is-active',active);button.setAttribute('aria-expanded',String(active));});
   panels.forEach(panel=>{panel.hidden=panel.dataset.megaPanel!==id;});
   if(empty)empty.hidden=!!id;
   mega?.classList.toggle('has-selection',!!id);
   const detail=!!id&&isMobile();
   mega?.classList.toggle('mobile-detail',detail);
   back.hidden=!detail;
  };
  back.addEventListener('click',()=>{choose(null);categories[0]?.focus({preventScroll:true});});
  window.addEventListener('resize',()=>{if(!isMobile())mega?.classList.remove('mobile-detail');else if(mega?.classList.contains('has-selection'))mega.classList.add('mobile-detail');back.hidden=!isMobile()||!mega?.classList.contains('has-selection');});
  const close=()=>{drop.classList.remove('open');trigger.setAttribute('aria-expanded','false');choose(null);};
  trigger.addEventListener('click',()=>{
   const opening=!drop.classList.contains('open');
   if(opening){drop.classList.add('open');trigger.setAttribute('aria-expanded','true');choose(null);}
   else close();
  });
  categories.forEach((button,index)=>{
   const select=()=>choose(button.dataset.megaCategory);
   button.addEventListener('pointerenter',e=>{if(!isMobile()&&(e.pointerType==='mouse'||e.pointerType==='pen'))select();});
   button.addEventListener('focus',()=>{if(!isMobile())select();});
   button.addEventListener('click',()=>{select();if(isMobile()){requestAnimationFrame(()=>{const scroller=document.querySelector('.nav-head.mobile-open .nav-inner');if(scroller)scroller.scrollTop=0;});}});
   button.addEventListener('keydown',e=>{
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){
     e.preventDefault();categories[(index+(e.key==='ArrowDown'?1:-1)+categories.length)%categories.length].focus();
    } else if(e.key==='ArrowRight'){
     e.preventDefault();select();drop.querySelector('[data-mega-panel="'+button.dataset.megaCategory+'"] a')?.focus();
    }
   });
  });
  document.addEventListener('click',e=>{if(!drop.contains(e.target))close();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&drop.classList.contains('open')){close();trigger.focus();}});
 }
 const homeButtons=[...document.querySelectorAll('[data-home-filter]')];if(homeButtons.length){homeButtons.forEach(b=>b.addEventListener('click',()=>{homeButtons.forEach(x=>x.classList.toggle('active',x===b));document.querySelectorAll('.home-service-grid .service-card').forEach(c=>c.hidden=b.dataset.homeFilter!=='all'&&c.dataset.cat!==b.dataset.homeFilter);if(!document.querySelector('.home-service-grid .service-card:not([hidden])')){location.href='services.html?category='+encodeURIComponent(b.dataset.homeFilter)}}));}
 const grid=document.getElementById('allServicesGrid');if(grid){const input=document.getElementById('serviceSearch'),links=[...document.querySelectorAll('#serviceFilters a')],items=[...grid.querySelectorAll('.service-card')],count=document.getElementById('resultCount'),empty=document.getElementById('noResults');let cat=new URLSearchParams(location.search).get('category')||'all';if(!['web','design','social','ads','verified'].includes(cat))cat='all';input.value=new URLSearchParams(location.search).get('q')||'';function filter(){let q=(input.value||'').trim().toLowerCase(),n=0;items.forEach(item=>{const show=(cat==='all'||item.dataset.cat===cat)&&item.dataset.search.includes(q);item.hidden=!show;if(show)n++});count.textContent=n+' service'+(n===1?'':'s')+' available';empty.hidden=n!==0;}links.forEach(l=>l.addEventListener('click',e=>{e.preventDefault();cat=l.dataset.filter;links.forEach(x=>x.classList.toggle('active',x===l));history.replaceState(null,'','services.html'+(cat==='all'?'':'&category='+cat)+(input.value.trim()?'&q='+encodeURIComponent(input.value.trim()):''));filter()}));input.addEventListener('input',filter);filter();}
 const tabs=[...document.querySelectorAll('[data-tab]')];tabs.forEach(b=>b.addEventListener('click',()=>{tabs.forEach(t=>{t.classList.toggle('active',t===b);t.setAttribute('aria-selected',String(t===b));});document.querySelectorAll('[data-panel]').forEach(p=>p.hidden=p.dataset.panel!==b.dataset.tab);}));
 const blogInput=document.getElementById('blogSearch'),blogItems=[...document.querySelectorAll('#blogList .blog-card')];if(blogInput&&blogItems.length){function filterBlog(){let q=blogInput.value.trim().toLowerCase(),shown=0;blogItems.forEach(x=>{x.hidden=!x.dataset.search.includes(q);if(!x.hidden)shown++});const c=document.getElementById('blogCount');if(c)c.textContent='Showing '+shown+' post'+(shown===1?'':'s');const e=document.getElementById('blogEmpty');if(e)e.hidden=shown!==0;}blogInput.addEventListener('input',filterBlog);document.getElementById('blogSearchButton')?.addEventListener('click',filterBlog);}
 const blogList=document.getElementById('blogList');for(const [id,list] of [['blogGridBtn',false],['blogListBtn',true]]){document.getElementById(id)?.addEventListener('click',()=>{blogList?.classList.toggle('list-view',list);document.getElementById('blogGridBtn')?.classList.toggle('active',!list);document.getElementById('blogListBtn')?.classList.toggle('active',list);});}
})();


/* Accessible review rotator; pauses while hovered/focused and honors reduced motion. */
(()=>{
 const ribbon=document.querySelector('[data-review-slider]');
 if(!ribbon)return;
 const slides=[...ribbon.querySelectorAll('.review-item')],counter=ribbon.querySelector('[data-review-position]');
 const windowEl=ribbon.querySelector('.review-ribbon-window');
 if(slides.length<2)return;
 let current=0, timer=null, paused=false;
 const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
 const setSlide=(idx,manual=false)=>{
  current=(idx+slides.length)%slides.length;
  slides.forEach((slide,i)=>{const active=i===current;slide.classList.toggle('is-active',active);slide.setAttribute('aria-hidden',String(!active));});
  if(counter)counter.textContent=String(current+1).padStart(2,'0');
  if(windowEl)windowEl.setAttribute('aria-live',manual?'polite':'off');
 };
 const stop=()=>{if(timer!==null){clearInterval(timer);timer=null;}};
 const start=()=>{stop();if(!reduced&&!paused&&document.visibilityState!=='hidden')timer=setInterval(()=>setSlide(current+1),5500);};
 ribbon.querySelector('[data-review-prev]')?.addEventListener('click',()=>{setSlide(current-1,true);start();});
 ribbon.querySelector('[data-review-next]')?.addEventListener('click',()=>{setSlide(current+1,true);start();});
 ribbon.addEventListener('mouseenter',()=>{paused=true;stop();});
 ribbon.addEventListener('mouseleave',()=>{paused=false;start();});
 ribbon.addEventListener('focusin',()=>{paused=true;stop();});
 ribbon.addEventListener('focusout',e=>{if(!ribbon.contains(e.relatedTarget)){paused=false;start();}});
 document.addEventListener('visibilitychange',start);
 setSlide(0);start();
})();


/* Multi-card responsive showcase carousel with 20 clearly labelled demo reviews. */
(()=>{
 const el=document.querySelector('[data-srh-carousel]');if(!el)return;
 const track=el.querySelector('.srh-carousel-track');const originals=[...track.children];
 if(!originals.length)return;
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const cloneCount=5;
 originals.slice(0,cloneCount).forEach(card=>{const clone=card.cloneNode(true);clone.setAttribute('aria-hidden','true');clone.querySelector('img')?.setAttribute('alt','');track.appendChild(clone)});
 let index=0,timer=null,hover=false,focus=false;
 const distance=()=>originals[0].getBoundingClientRect().width+(parseFloat(getComputedStyle(track).gap)||0);
 const render=(animate=true)=>{track.style.transition=animate?'transform .62s cubic-bezier(.2,.75,.2,1)':'none';track.style.transform=`translateX(-${index*distance()}px)`;const indicator=el.querySelector('[data-srh-slide]');if(indicator)indicator.textContent=String((index%originals.length)+1).padStart(2,'0')};
 const move=delta=>{if(delta<0&&index===0){index=originals.length;render(false);void track.offsetWidth}index+=delta;render(true)};
 track.addEventListener('transitionend',()=>{if(index>=originals.length){index=0;render(false)}});
 const pause=()=>{if(timer){clearInterval(timer);timer=null}};
 const play=()=>{pause();if(!reduced&&!hover&&!focus&&!document.hidden)timer=setInterval(()=>move(1),4000)};
 el.querySelector('[data-srh-prev]')?.addEventListener('click',()=>{move(-1);play()});
 el.querySelector('[data-srh-next]')?.addEventListener('click',()=>{move(1);play()});
 el.addEventListener('mouseenter',()=>{hover=true;pause()});el.addEventListener('mouseleave',()=>{hover=false;play()});
 el.addEventListener('focusin',()=>{focus=true;pause()});el.addEventListener('focusout',e=>{if(!el.contains(e.relatedTarget)){focus=false;play()}});
 document.addEventListener('visibilitychange',play);window.addEventListener('resize',()=>render(false));render(false);play();
})();
