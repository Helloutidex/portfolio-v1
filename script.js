(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const esc = s => String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  /* ============================================================
     SITE TEXT + THEME — the other half of the single-source setup
     below (PROJECTS). admin.html edits these too, under its
     "Content" and "Theme" tabs, saved to the same kind of
     browser-only localStorage override. Everything here has a
     matching id in index.html that applyContent() writes into.
  ============================================================ */
  const CONTENT_STORAGE_KEY = 'ferricool-portfolio-content';
  const DEFAULT_CONTENT = {
    nav: { logo: 'ADEDEJI SUNDAY / DESIGN' },
    hero: {
      eyebrow: 'Independent designer · Lagos, Nigeria',
      titlePre: 'Designing ', titleEm: "what's", titlePost: ' next.',
      paragraph: 'I turn ideas into identities, digital experiences and visual systems people can feel.',
      lensLabel: 'Zoom to reveal',
      opticNote: 'Scroll / drag the lens · reveal the work',
      note: 'The work is hidden in the lens.',
      zoomInstruction: 'Scroll / drag to explore',
    },
    about: {
      label: 'About me', viewCV: 'View CV ↗', downloadCV: 'Download CV ↓',
      portraitImage: 'assets/portrait.jpg', portraitCaption: 'Portrait · tap for colour',
      headingPre: 'I design for the space between an ', headingEm: 'idea', headingPost: ' and what it can become.',
      paragraph1: "I'm a multidisciplinary designer working across brand identity, digital design, campaigns and AI / generative visuals.",
      paragraph2: "I'm interested in clear ideas, strong visual systems and work that can live beyond a single screen.",
      skills: ['Brand identity','Art direction','Digital design','AI / generative','Visual systems'],
    },
    social: { label: 'Selected collaborators', count: '01 — 05', items: [
      { name:'Urban Food Fest', logo:'' },
      { name:'AWS Community', logo:'' },
      { name:'Ferricool Studios', logo:'' },
      { name:'Shop Soma', logo:'' },
      { name:'Independent Collaborations', logo:'' },
    ]},
    work: { label: 'Gallery / automatic', description: 'Selected work, continuously moving. Tap any frame to explore.', noteRight: 'Tap any frame to explore' },
    testimonials: { label: 'Praise', description: 'What collaborators say about working together.', items: [
      { quote: "Sam translated a vague brief into a brand system that felt inevitable — like it always should have looked that way.", name: 'Client name', role: 'Urban Food Fest' },
      { quote: "Fast, sharp, and genuinely collaborative. The kind of designer who makes the whole project easier.", name: 'Client name', role: 'Shop Soma' },
    ]},
    experience: {
      headingLine1: 'Experience', headingLine2: '& practice.',
      rows: [
        { tag: '01 / Now', role: 'Independent designer', meta: 'Identity · Digital · AI' },
        { tag: '02 / Practice', role: 'Brand & visual systems', meta: 'Strategy · Art direction' },
        { tag: '03 / Community', role: 'Design volunteering & mentoring', meta: 'People · Events' },
      ],
    },
    links: { label: 'Links', description: 'Find the work, the process, or start a conversation.', items: [
      { label: 'Work ↗', href: '#work' }, { label: 'About ↗', href: '#about' }, { label: 'Contact ↗', href: '#contact' },
    ]},
    signature: { name: 'ADEDEJI SUNDAY SAMUEL' },
    contact: { small: 'Start a project', headingLines: ["LET'S MAKE","SOMETHING","WORTH SEEING."], available: 'Available for selected projects', emailText: 'hello@example.com ↗', emailHref: 'mailto:hello@example.com' },
    footer: { left: '© 2026 Adedeji Sunday Samuel', right: 'Designed with intention / Lagos' },
  };
  function loadContent(){
    try{
      const saved = JSON.parse(localStorage.getItem(CONTENT_STORAGE_KEY));
      if(saved && typeof saved === 'object') return migrateContent({ ...DEFAULT_CONTENT, ...saved });
    }catch(e){}
    return DEFAULT_CONTENT;
  }
  // Keeps older saved content (from before "logos" or "testimonials" existed) from breaking the page.
  function migrateContent(c){
    if(c.social && Array.isArray(c.social.names) && !Array.isArray(c.social.items)){
      c.social.items = c.social.names.map(n => ({ name:n, logo:'' }));
    }
    if(!c.testimonials) c.testimonials = DEFAULT_CONTENT.testimonials;
    return c;
  }
  // A clean, generic wordmark used until a real logo is uploaded in admin.html.
  function placeholderLogo(name){
    const initials = String(name||'?').split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0].toUpperCase()).join('') || '?';
    return `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(name)} logo placeholder">
      <rect x="1" y="1" width="118" height="38" rx="8" fill="none" stroke="currentColor" stroke-width="1.4"/>
      <text x="60" y="25" text-anchor="middle" font-family="'DM Mono',monospace" font-size="15" letter-spacing="1" fill="currentColor">${esc(initials)}</text>
    </svg>`;
  }
  function applyContent(c){
    const set = (id,val) => { const el=document.getElementById(id); if(el) el.textContent = val; };
    set('navLogo', c.nav.logo);
    set('heroEyebrow', c.hero.eyebrow); set('heroTitlePre', c.hero.titlePre); set('heroTitleEm', c.hero.titleEm); set('heroTitlePost', c.hero.titlePost);
    set('heroParagraph', c.hero.paragraph); set('lensLabel', c.hero.lensLabel); set('opticNote', c.hero.opticNote);
    set('heroNote', c.hero.note); set('heroZoomInstruction', c.hero.zoomInstruction);
    set('aboutLabel', c.about.label); set('viewCV', c.about.viewCV); set('downloadCV', c.about.downloadCV);
    const portraitImg = $('#portraitImg'); if(portraitImg && c.about.portraitImage) portraitImg.src = c.about.portraitImage;
    set('portraitCaption', c.about.portraitCaption);
    set('aboutHeadingPre', c.about.headingPre); set('aboutHeadingEm', c.about.headingEm); set('aboutHeadingPost', c.about.headingPost);
    set('aboutParagraph1', c.about.paragraph1); set('aboutParagraph2', c.about.paragraph2);
    const skillsList = $('#skillsList'); if(skillsList) skillsList.innerHTML = c.about.skills.map(s=>`<span class="skill">${esc(s)}</span>`).join('');
    set('socialLabel', c.social.label); set('socialCount', c.social.count);
    const logoTrack = $('#logoTrack');
    if(logoTrack){
      const mark = item => `<div class="logo-mark" title="${esc(item.name)}">${item.logo ? `<img src="${esc(item.logo)}" alt="${esc(item.name)} logo">` : placeholderLogo(item.name)}</div>`;
      const oneSet = c.social.items.map(mark).join('');
      // Repeat the set enough times that it comfortably outspans the widest
      // screen it could load on, so the marquee always fills edge to edge —
      // no dead gap at the end of a short set on a wide monitor. Keep the
      // count even so the halfway point (where the loop's -50% scroll wraps)
      // always lands on a repeat boundary.
      let repeats = Math.max(2, Math.ceil((window.innerWidth * 2.2) / Math.max(1, c.social.items.length * 200)));
      if (repeats % 2 !== 0) repeats++;
      logoTrack.innerHTML = oneSet.repeat(repeats);
    }
    set('workLabel', c.work.label); set('workDescription', c.work.description);
    set('galleryNoteRight', c.work.noteRight);
    set('testimonialsLabel', c.testimonials.label); set('testimonialsDescription', c.testimonials.description);
    const testimonialGrid = $('#testimonialGrid');
    if(testimonialGrid) testimonialGrid.innerHTML = c.testimonials.items.map(t=>`<article class="testimonial-card"><blockquote>${esc(t.quote)}</blockquote><cite><b>${esc(t.name)}</b>${esc(t.role)}</cite></article>`).join('');
    set('expHeadingLine1', c.experience.headingLine1); set('expHeadingLine2', c.experience.headingLine2);
    const expRows = $('#expRows'); if(expRows) expRows.innerHTML = c.experience.rows.map(r=>`<div class="exp-row"><span>${esc(r.tag)}</span><strong>${esc(r.role)}</strong><span>${esc(r.meta)}</span></div>`).join('');
    set('linksLabel', c.links.label); set('linksDescription', c.links.description);
    const linksGrid = $('#linksGrid'); if(linksGrid) linksGrid.innerHTML = c.links.items.map(it=>`<a class="big-link" href="${esc(it.href)}">${esc(it.label)}</a>`).join('');
    const nameTrack = $('#nameTrack'); if(nameTrack) nameTrack.innerHTML = [c.signature.name,c.signature.name].map(n=>`<span>${esc(n)}</span>`).join('');
    // Floating badge reuses the same name from Signature above — one field, two places.
    const badgeText = $('#badgeCircleText');
    if (badgeText) badgeText.textContent = Array(4).fill(c.signature.name).join(' · ') + ' · ';
    const badgeInitials = $('#floatingBadgeInitials');
    if (badgeInitials) {
      const initials = c.signature.name.split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase();
      badgeInitials.textContent = initials || 'SA';
    }
    set('contactSmall', c.contact.small);
    const contactHeading = $('#contactHeading'); if(contactHeading) contactHeading.innerHTML = c.contact.headingLines.map(esc).join('<br>');
    set('contactAvailable', c.contact.available);
    const emailEl = $('#contactEmail'); if(emailEl){ emailEl.textContent = c.contact.emailText; emailEl.href = c.contact.emailHref; }
    set('footerLeft', c.footer.left); set('footerRight', c.footer.right);
  }
  applyContent(loadContent());

  const THEME_STORAGE_KEY = 'ferricool-portfolio-theme';
  const DEFAULT_THEME = { paper:'#ffffff', ink:'#000000', muted:'#747474', line:'#dedede', contactBg:'#a91624', scale:1 };
  function loadTheme(){
    try{
      const saved = JSON.parse(localStorage.getItem(THEME_STORAGE_KEY));
      if(saved && typeof saved === 'object') return { ...DEFAULT_THEME, ...saved };
    }catch(e){}
    return DEFAULT_THEME;
  }
  function applyTheme(t){
    const r = document.documentElement.style;
    r.setProperty('--paper', t.paper); r.setProperty('--ink', t.ink); r.setProperty('--muted', t.muted);
    r.setProperty('--line', t.line); r.setProperty('--contact-bg', t.contactBg); r.setProperty('--scale', t.scale);
  }
  applyTheme(loadTheme());

  /* ============================================================
     SINGLE SOURCE OF TRUTH FOR ALL PORTFOLIO IMAGERY
     The floating hero cards, the automatic gallery and the
     collection/project viewer are all rendered FROM this list —
     add, remove or swap a project here and every widget on the
     page updates itself. Nothing to duplicate by hand.

     admin.html edits this same list (saved to the browser's
     localStorage under PORTFOLIO_STORAGE_KEY) so you can preview
     changes without touching code. "Reset to defaults" in the
     admin page clears that override and falls back to the list
     below. See its own note for why that only previews on your
     own device rather than publishing to every visitor.
  ============================================================ */
  const PORTFOLIO_STORAGE_KEY = 'ferricool-portfolio-projects';
  const DEFAULT_PROJECTS = [
    { id:'caseStudy', num:'01', category:'Brand Identity',      title:'Case Study',      image:'https://images.unsplash.com/photo-1518005020951-eccb494ad742', desc:'Selected identity and digital case studies.' },
    { id:'food',      num:'02', category:'Brand marks',         title:'Logo Archive',    image:'https://images.unsplash.com/photo-1504674900247-0877df9cc836', desc:'A growing archive of marks, symbols and identity explorations.' },
    { id:'editorial', num:'03', category:'Editorial',           title:'Presentation',    image:'https://images.unsplash.com/photo-1483985988355-763728e1935b', desc:'Selected presentations, decks and visual storytelling systems.' },
    { id:'generative',num:'04', category:'Digital / Web',       title:'Web Design',      image:'https://images.unsplash.com/photo-1518770660439-4636190af475', desc:'Responsive websites, interfaces and digital experiences.' },
    { id:'studio',    num:'05', category:'AI / Generative',     title:'AI / Generative', image:'https://images.unsplash.com/photo-1523726491678-bf852e717f6a', desc:'Generative visuals, experiments and emerging creative systems.' },
  ];
  function loadProjects(){
    try{
      const saved = JSON.parse(localStorage.getItem(PORTFOLIO_STORAGE_KEY));
      if(Array.isArray(saved) && saved.length) return saved;
    }catch(e){}
    return DEFAULT_PROJECTS;
  }
  const PROJECTS = loadProjects();
  const img = (p,w,q=85) => /^https?:/.test(p.image) ? `${p.image}${p.image.includes('?')?'&':'?'}auto=format&fit=crop&w=${w}&q=${q}` : p.image;

  /* ---------- render floating hero cards ---------- */
  const cardsEl = $('#cards');
  cardsEl.innerHTML = PROJECTS.map((p,i)=>`
    <article class="card slot${i}" data-id="${p.id}">
      <img src="${img(p,480)}" alt="${p.title} project placeholder">
      <div class="card-meta"><span>${p.num}</span><span>Open ↗</span></div>
      <div class="card-title">${p.title}</div>
    </article>`).join('');
  const cards = $$('.card');

  /* ---------- render automatic moving gallery ----------
     Two rows drift past each other in opposite directions. Each row's content
     is the PROJECTS list rendered twice back-to-back, so translateX(-50%) loops
     seamlessly forever. Add a project to PROJECTS above and it joins the drift
     on both rows automatically — nothing else to wire up. */
  const galleryEl = $('#autoGallery');
  const frame = (p,i) => `
    <article class="gallery-frame" data-id="${p.id}">
      <img src="${img(p,700,85)}" alt="${p.title} placeholder" loading="lazy">
      <div class="gf-cap"><span>${p.num} · ${p.category}</span><strong>${p.title}</strong></div>
    </article>`;
  const rowAProjects = [...PROJECTS, ...PROJECTS];
  const rowBProjects = [...PROJECTS.slice().reverse(), ...PROJECTS.slice().reverse()];
  galleryEl.innerHTML =
    `<div class="gallery-row row-a">${rowAProjects.map(frame).join('')}</div>` +
    `<div class="gallery-row row-b">${rowBProjects.map(frame).join('')}</div>` +
    `<div class="gallery-cursor" id="galleryCursor" aria-hidden="true"><span>View</span></div>`;
  galleryEl.addEventListener('click', e => {
    const f = e.target.closest('.gallery-frame');
    if (f) openCollection(f.dataset.id);
  });
  // A big circle that follows the pointer over the gallery — purely decorative,
  // so it just no-ops on touch devices where there's no hover/pointermove to track.
  const galleryCursor = $('#galleryCursor');
  const supportsHover = typeof window.matchMedia === 'function' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (galleryCursor && supportsHover) {
    galleryEl.addEventListener('pointermove', e => {
      const rect = galleryEl.getBoundingClientRect();
      galleryCursor.style.left = (e.clientX - rect.left) + 'px';
      galleryCursor.style.top = (e.clientY - rect.top) + 'px';
    });
    galleryEl.addEventListener('pointerenter', () => galleryCursor.classList.add('is-visible'));
    galleryEl.addEventListener('pointerleave', () => galleryCursor.classList.remove('is-visible'));
  }

  /* ---------- theme ---------- */
  const theme = $('#theme');
  const savedTheme = localStorage.getItem('portfolio-theme');
  if (savedTheme === 'dark') document.body.classList.add('dark');
  function syncTheme(){ if(theme) theme.querySelector('b').textContent = document.body.classList.contains('dark') ? 'White' : 'Black'; }
  syncTheme();
  theme?.addEventListener('click', () => { document.body.classList.toggle('dark'); localStorage.setItem('portfolio-theme', document.body.classList.contains('dark')?'dark':'light'); syncTheme(); });

  /* ---------- nav: subtle border once you've scrolled past the very top ---------- */
  const navEl = $('.nav');
  if (navEl) {
    const syncNavScroll = () => navEl.classList.toggle('is-scrolled', window.scrollY > 4);
    syncNavScroll();
    window.addEventListener('scroll', syncNavScroll, { passive: true });
  }

  /* ---------- portrait colour toggle ---------- */
  $$('.portrait').forEach(p => {
    const toggle=()=>p.classList.toggle('is-color');
    p.addEventListener('click',toggle);
    p.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle();}});
  });

  /* ---------- optical lens: scroll / drag to zoom, reveals cards progressively ---------- */
  const lens=$('#lens'), lensImg=$('#lensImg'), zoomValue=$('#zoomValue'), hero=$('.hero');
  lensImg.src = img(PROJECTS[0],900);
  let zoom=0;
  let audioCtx=null,lastOptical=0;
  function initSound(){
    if(audioCtx){ if(audioCtx.state==='suspended') audioCtx.resume(); return audioCtx; }
    const C=window.AudioContext||window.webkitAudioContext; if(!C) return null;
    try{audioCtx=new C(); audioCtx.resume(); return audioCtx;}catch(e){return null;}
  }
  function opticalSound(amount=.02){
    const ctx=initSound(); if(!ctx) return;
    const now=performance.now(); if(now-lastOptical<28) return; lastOptical=now;
    const t=ctx.currentTime,o=ctx.createOscillator(),g=ctx.createGain(),f=ctx.createBiquadFilter();
    o.type='triangle';
    const dir=amount>=0?1:-1, base=68+zoom*18, end=base+dir*(30+Math.min(55,Math.abs(amount)*180));
    o.frequency.setValueAtTime(Math.max(35,base),t);
    o.frequency.exponentialRampToValueAtTime(Math.max(35,end),t+.075);
    f.type='lowpass'; f.frequency.setValueAtTime(1050,t); f.frequency.exponentialRampToValueAtTime(520,t+.09);
    g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(.035,t+.006); g.gain.exponentialRampToValueAtTime(.0001,t+.11);
    o.connect(f);f.connect(g);g.connect(ctx.destination);o.start(t);o.stop(t+.115);
  }
  function clickSound(){
    const ctx=initSound(); if(!ctx)return;
    const t=ctx.currentTime,o=ctx.createOscillator(),g=ctx.createGain();
    o.type='sine';o.frequency.setValueAtTime(210,t);o.frequency.exponentialRampToValueAtTime(78,t+.13);
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.028,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+.15);
    o.connect(g);g.connect(ctx.destination);o.start(t);o.stop(t+.155);
  }
  ['pointerdown','touchstart','keydown'].forEach(ev=>document.addEventListener(ev,initSound,{once:true,passive:true}));

  function setZoom(next){
    const prev=zoom; zoom=Math.max(0,Math.min(5,next));
    const eased=zoom/5;
    lensImg.style.transform='scale('+(1.08+eased*1.45)+')';
    lensImg.style.filter=`saturate(${.8+eased*.2}) contrast(${1.04+eased*.1})`;
    zoomValue.textContent=String(Math.min(5,Math.max(1,Math.floor(zoom)+1))).padStart(2,'0');
    hero.classList.toggle('is-zooming',zoom>.08);
    cards.forEach((card,i)=>card.classList.toggle('show', zoom >= (i+1)*.82));
    if(Math.abs(zoom-prev)>.001) opticalSound(zoom-prev);
  }
  lens.addEventListener('wheel',e=>{e.preventDefault();initSound();setZoom(zoom+(e.deltaY>0?.34:-.34));},{passive:false});
  let lensDrag=false,lastY=0;
  lens.addEventListener('pointerdown',e=>{initSound();lensDrag=true;lastY=e.clientY;try{lens.setPointerCapture(e.pointerId)}catch(_){}});
  lens.addEventListener('pointermove',e=>{if(!lensDrag)return;const dy=e.clientY-lastY;lastY=e.clientY;if(Math.abs(dy)>.2)setZoom(zoom-dy*.018);});
  ['pointerup','pointercancel'].forEach(ev=>lens.addEventListener(ev,()=>lensDrag=false));
  setZoom(0);

  cards.forEach(card=>card.addEventListener('click', ()=>openCollection(card.dataset.id)));

  /* ---------- CV actions ---------- */
  $('#viewCV')?.addEventListener('click',e=>{e.preventDefault();window.open('cv.pdf','_blank','noopener');});
  $('#downloadCV')?.addEventListener('click',()=>{
    const a=document.createElement('a'); a.href='cv.pdf'; a.download='Adedeji-Sunday-Samuel-CV.pdf'; document.body.appendChild(a); a.click(); a.remove();
  });

  /* ---------- collection + case-study viewer ----------
     PROJECTS (above) are the 5 category cards. Each category holds its own
     `works` list — the individual case studies inside that category (e.g.
     "Premium Clothes", "Case Study Two"...) — editable in admin.html. A
     category with no `works` yet gets a couple of generated placeholders so
     it isn't empty. Each work is just an ordered list of `blocks` — a text
     block (heading + body, optional tags) or an image block (optional
     caption) — in whatever order and mix you choose per work: two text
     blocks up top and images the rest of the way, all-images-no-text,
     alternating, anything. There's no fixed template forcing one image per
     paragraph. */
  const byId = Object.fromEntries(PROJECTS.map(p=>[p.id,p]));
  const imgFrom = (src,w,q=82) => /^https?:/.test(src) ? `${src}${src.includes('?')?'&':'?'}auto=format&fit=crop&w=${w}&q=${q}` : src;
  function defaultWorks(cat){
    const startIndex = PROJECTS.indexOf(cat);
    const pool = PROJECTS.map((_,i)=>PROJECTS[(startIndex+i)%PROJECTS.length].image);
    const imageHeavy = cat.id === 'editorial'; // "Presentation" ships as a pure image stream by default, to show the pattern
    function work(n){
      const blocks = imageHeavy
        ? [
            { type:'text', heading:`About ${cat.title.toLowerCase()} ${n===1?'':n}`.trim()+'.', body: cat.desc },
            { type:'image', src: imgFrom(pool[n%pool.length],1400) },
            { type:'image', src: imgFrom(pool[(n+1)%pool.length],1400) },
            { type:'image', src: imgFrom(pool[(n+2)%pool.length],1400) },
          ]
        : [
            { type:'text', heading:`What ${n===1?cat.title:cat.title+' '+n} needed to solve.`, body: cat.desc },
            { type:'image', src: imgFrom(pool[n%pool.length],1400) },
            { type:'text', heading:'The approach.', body:'The direction grew out of research, iteration and a handful of discarded concepts before the system in front of you clicked into place.', tags:['Discovery','Concept development','Iteration'] },
            { type:'image', src: imgFrom(pool[(n+1)%pool.length],1400) },
            { type:'image', src: imgFrom(pool[(n+2)%pool.length],1400) },
          ];
      return { id: cat.id+'-work-'+n, title: n===1 ? cat.title : `${cat.title} ${n}`, cover: imgFrom(pool[n%pool.length],900), tagline: cat.desc, blocks };
    }
    return [work(1), work(2)];
  }
  function worksFor(cat){ return (cat.works && cat.works.length) ? cat.works : defaultWorks(cat); }

  let currentCategoryId=null, currentWorkId=null;
  const collectionModal=$('#collectionModal'),collectionGrid=$('#collectionGrid'),collectionTitle=$('#collectionTitle'),collectionMeta=$('#collectionMeta');
  function openCollection(id){
    clickSound();
    const cat=byId[id]||PROJECTS[0]; const works=worksFor(cat);
    collectionTitle.textContent=cat.title;
    collectionMeta.textContent=works.length+' case '+(works.length===1?'study':'studies')+' · collection';
    collectionGrid.innerHTML=works.map(w=>`<article class="collection-item" data-category="${cat.id}" data-work="${w.id}"><img src="${w.cover}" alt="${esc(w.title)}"><div><strong>${esc(w.title)}</strong><span>Open ↗</span></div></article>`).join('');
    $$('.collection-item').forEach(el=>el.addEventListener('click',()=>{clickSound();openProject(el.dataset.category,el.dataset.work);}));
    collectionModal.classList.add('open');collectionModal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';
  }
  function closeCollection(){collectionModal.classList.remove('open');collectionModal.setAttribute('aria-hidden','true');if(!modal.classList.contains('open'))document.body.style.overflow='';}
  $('#collectionClose')?.addEventListener('click',closeCollection);
  collectionModal?.addEventListener('click',e=>{if(e.target===collectionModal)closeCollection();});

  const modal=$('#modal'),mmeta=$('#mmeta');
  const caseTitleTrack=$('#caseTitleTrack'),caseTagline=$('#caseTagline'),caseMeta=$('#caseMeta'),caseSections=$('#caseSections'),caseNext=$('#caseNext'),modalBody=$('#modalBody');
  // Scroll-reveal: fades/slides each block up into place the first time it enters the
  // viewport, instead of everything just sitting there static. Cheap and un-janky —
  // one observer, unobserve after the first reveal.
  let revealObserver = null;
  function armReveals(root){
    if(!('IntersectionObserver' in window)){ $$('.reveal', root).forEach(el=>el.classList.add('is-visible')); return; }
    if(!revealObserver){
      revealObserver = new IntersectionObserver((entries)=>{
        entries.forEach(entry=>{
          if(entry.isIntersecting){ entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); }
        });
      }, { root: modalBody, threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    }
    root.querySelectorAll('.reveal').forEach(el=>{ el.classList.remove('is-visible'); revealObserver.observe(el); });
  }
  function renderWork(categoryId, workId){
    const cat = byId[categoryId]; const works = worksFor(cat);
    const work = works.find(w=>w.id===workId) || works[0];
    currentCategoryId = categoryId; currentWorkId = work.id;
    mmeta.textContent = `${cat.title} / ${work.title}`;
    caseTitleTrack.innerHTML = `<div class="case-title-track-inner">${[work.title,work.title].map(t=>`<span>${esc(t)}</span>`).join('')}</div>`;
    if (work.tagline) { caseTagline.textContent = work.tagline; caseTagline.hidden = false; } else { caseTagline.hidden = true; }
    if (work.meta && work.meta.length) {
      caseMeta.hidden = false;
      caseMeta.innerHTML = work.meta.map(m=>`<div class="case-meta-item"><span>${esc(m.label)}</span><strong>${esc(m.value)}</strong></div>`).join('');
    } else { caseMeta.hidden = true; caseMeta.innerHTML=''; }
    let textCount = 0;
    caseSections.innerHTML = (work.blocks||[]).map(b=>{
      if (b.type === 'image') {
        return `<div class="case-image reveal"><img src="${esc(b.src)}" alt="${esc(work.title)} image">${b.caption?`<span class="case-image-caption">${esc(b.caption)}</span>`:''}</div>`;
      }
      if (b.type === 'video') {
        return `<div class="case-image case-video reveal"><video src="${esc(b.src)}" controls playsinline preload="metadata"${b.poster?` poster="${esc(b.poster)}"`:''}></video>${b.caption?`<span class="case-image-caption">${esc(b.caption)}</span>`:''}</div>`;
      }
      textCount++;
      const kicker = `(0${textCount})`;
      return `<div class="case-section reveal">
          <div class="case-section-num">${kicker}</div>
          <div><h3>${esc(b.heading)}</h3><p>${esc(b.body)}</p>${(b.tags&&b.tags.length)?`<div class="case-tags"><span class="case-tags-label">What we did</span><ul>${b.tags.map(t=>`<li>${esc(t)}</li>`).join('')}</ul></div>`:''}</div>
        </div>`;
    }).join('');
    const idx = works.findIndex(w=>w.id===work.id);
    if (idx < works.length - 1) {
      const nextWork = works[idx+1];
      caseNext.innerHTML = `<button class="case-next-btn" id="caseNextBtn"><span>Next case study in ${esc(cat.title)}</span><strong>${esc(nextWork.title)} →</strong></button>`;
      $('#caseNextBtn')?.addEventListener('click', ()=>{ clickSound(); renderWork(categoryId, nextWork.id); });
    } else {
      caseNext.innerHTML = `<button class="case-next-btn" id="caseNextBtn"><span>That's every case study in ${esc(cat.title)}</span><strong>Back to collection →</strong></button>`;
      $('#caseNextBtn')?.addEventListener('click', ()=>{ clickSound(); closeProject(); openCollection(categoryId); });
    }
    if (modalBody) modalBody.scrollTop = 0;
    armReveals(modalBody);
  }
  function openProject(categoryId, workId){
    clickSound();closeCollection();renderWork(categoryId, workId);modal.classList.add('open');document.body.style.overflow='hidden';
  }
  function closeProject(){modal.classList.remove('open');document.body.style.overflow='';}
  function moveWork(dir){
    const cat = byId[currentCategoryId]; const works = worksFor(cat);
    let i = works.findIndex(w=>w.id===currentWorkId);
    i = (i+dir+works.length)%works.length;
    renderWork(currentCategoryId, works[i].id);
    clickSound();
  }
  $('#prevProject')?.addEventListener('click',()=>moveWork(-1));
  $('#nextProject')?.addEventListener('click',()=>moveWork(1));
  $('#backWork')?.addEventListener('click',()=>{const id=currentCategoryId;closeProject();openCollection(id);});
  $('#close')?.addEventListener('click',closeProject);
  modal?.addEventListener('click',e=>{if(e.target===modal)closeProject();});
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){if(collectionModal.classList.contains('open'))closeCollection();else closeProject();}
    if(modal.classList.contains('open')&&e.key==='ArrowRight')moveWork(1);
    if(modal.classList.contains('open')&&e.key==='ArrowLeft')moveWork(-1);
  });

  /* ---------- contact form: submits without leaving the page ----------
     Sends to FormSubmit.co's AJAX endpoint, using whatever email is set as
     the contact email above (edit it in admin.html's Content → Contact
     tab, no separate field to keep in sync). The first message sent to a
     new address triggers a one-time confirmation email from FormSubmit
     that has to be approved before messages start arriving normally. */
  const contactForm = $('#contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const statusEl = $('#contactFormStatus');
      const submitBtn = contactForm.querySelector('.contact-submit');
      const emailHref = $('#contactEmail')?.getAttribute('href') || 'mailto:hello@example.com';
      const targetEmail = emailHref.replace(/^mailto:/,'').split('?')[0];
      const data = Object.fromEntries(new FormData(contactForm).entries());
      submitBtn.disabled = true;
      statusEl.textContent = 'Sending…';
      statusEl.className = 'contact-form-status';
      try {
        const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(targetEmail)}`, {
          method: 'POST',
          headers: { 'Content-Type':'application/json', 'Accept':'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Request failed');
        statusEl.textContent = "Sent — I'll get back to you soon.";
        statusEl.className = 'contact-form-status is-success';
        contactForm.reset();
      } catch (err) {
        statusEl.textContent = 'Something went wrong — try the email link below instead.';
        statusEl.className = 'contact-form-status is-error';
      } finally {
        submitBtn.disabled = false;
      }
    });
  }
})();
