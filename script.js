(async () => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const esc = s => String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  // Published edits: admin.html's "Publish" button saves everything to site-data.json in the repo,
  // and every visitor loads it here — so edits show up on every device. If the file doesn't exist
  // (or can't be reached) the defaults in this file are used instead. A draft saved with "Save
  // changes" in this same browser still wins, so you can preview before publishing.
  const fetchJSON = async url => {
    try {
      const c = new AbortController(); const t = setTimeout(() => c.abort(), 4000);
      const r = await fetch(url, { cache: 'no-cache', signal: c.signal }); clearTimeout(t);
      return r.ok ? await r.json() : null;
    } catch (e) { return null; }
  };
  const REMOTE = (await fetchJSON('site-data.json')) || {};
  const draftOf = key => { try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; } };

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
      lensLabel: 'Tap to reveal',
      opticNote: 'Tap the lens · reveal the work',
      note: 'The work is hidden in the lens.',
      zoomInstruction: 'Tap to explore',
      lensImage: '', ctaLabel: 'View my work ↗', ctaHref: '#work',
    },
    about: {
      label: 'About me', viewCV: 'View CV ↗', downloadCV: 'Download CV ↓',
      portraitImage: 'assets/portrait.jpg', portraitCaption: 'Portrait · tap for colour', cvFile: 'cv.pdf',
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
    badge: { initials: 'AS', ringText: 'ADEDEJI SUNDAY SAMUEL', href: 'contact.html' },
    signature: { name: 'ADEDEJI SUNDAY SAMUEL' },
    contact: { ctaLabel: "Let's talk ↗", small: 'Start a project', headingLines: ["LET'S MAKE","SOMETHING","WORTH SEEING."], available: 'Available for selected projects', emailText: 'hello@example.com ↗', emailHref: 'mailto:hello@example.com' },
    footer: { left: '© 2026 Adedeji Sunday Samuel', right: 'Designed with intention / Lagos' },
  };
  const cloneDefaultContent = () => JSON.parse(JSON.stringify(DEFAULT_CONTENT));
  // Fills in any setting a saved/published copy doesn't have yet, so new features never break old data.
  function mergeContent(saved){
    const d = cloneDefaultContent(), out = {};
    for (const k of Object.keys(d)) {
      const dv = d[k], sv = saved ? saved[k] : undefined;
      if (dv && typeof dv === 'object' && !Array.isArray(dv)) out[k] = { ...dv, ...((sv && typeof sv === 'object') ? sv : {}) };
      else out[k] = sv !== undefined ? sv : dv;
    }
    if (!saved || !saved.badge) out.badge.ringText = out.signature.name;
    return out;
  }
  function loadContent(){
    const saved = draftOf(CONTENT_STORAGE_KEY) || REMOTE.content;
    return migrateContent(mergeContent(saved && typeof saved === 'object' ? saved : null));
  }
  // Keeps older saved content (from before "logos" or "testimonials" existed) from breaking the page.
  function migrateContent(c){
    if(c.social && Array.isArray(c.social.names) && !Array.isArray(c.social.items)){
      c.social.items = c.social.names.map(n => ({ name:n, logo:'' }));
    }
    if(!c.testimonials) c.testimonials = DEFAULT_CONTENT.testimonials;
    if(c.contact && !c.contact.ctaLabel) c.contact = { ...c.contact, ctaLabel: DEFAULT_CONTENT.contact.ctaLabel };
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
    // Floating badge: initials, ring text and link are all editable (admin → Content → Floating badge).
    const badge = $('#floatingBadge');
    if (badge) {
      const bd = c.badge || {};
      const initials = (bd.initials || '').trim(), ring = (bd.ringText || '').trim();
      badge.hidden = !initials && !ring;
      badge.href = bd.href || 'contact.html';
      const ini = $('#floatingBadgeInitials'); if (ini) ini.textContent = initials;
      const ringPath = $('#badgeCircleText');
      if (ringPath && ring) {
        const unit = ring + ' · ';
        ringPath.textContent = (unit.repeat(Math.max(1, Math.round(57 / unit.length)))).trim() + ' ·';
        ringPath.setAttribute('textLength', '312'); ringPath.setAttribute('lengthAdjust', 'spacing');
      } else if (ringPath) ringPath.textContent = '';
    }
    const cta = $('#heroCta');
    if (cta) { cta.textContent = c.hero.ctaLabel || ''; cta.href = c.hero.ctaHref || '#work'; cta.hidden = !c.hero.ctaLabel; }
    const cvBox = $('.cv-cta'); if (cvBox) cvBox.hidden = !c.about.cvFile;
    set('contactSmall', c.contact.small);
    const contactHeading = $('#contactHeading'); if(contactHeading) contactHeading.innerHTML = c.contact.headingLines.map(esc).join('<br>');
    set('contactAvailable', c.contact.available);
    const emailEl = $('#contactEmail'); if(emailEl){ emailEl.textContent = c.contact.emailText; emailEl.href = c.contact.emailHref; }
    set('contactCtaBtn', c.contact.ctaLabel || "Let's talk ↗");
    // keep the form's plain-HTML fallback pointed at the same address, so it still posts correctly even if scripting fails
    const formEl = $('#contactForm'); if(formEl) formEl.action = 'https://formsubmit.co/' + String(c.contact.emailHref||'').replace(/^mailto:/,'').split('?')[0];
    set('footerLeft', c.footer.left); set('footerRight', c.footer.right);
  }
  const C = loadContent();
  applyContent(C);

  const THEME_STORAGE_KEY = 'ferricool-portfolio-theme';
  const DEFAULT_THEME = { paper:'#faf6ee', ink:'#141211', muted:'#747474', line:'#e2ddd2', contactBg:'#E8223E', tint1:'#f7d6c6', tint2:'#f5e3a3', scale:1 };
  function loadTheme(){
    try{
      const saved = draftOf(THEME_STORAGE_KEY) || REMOTE.theme;
      if(saved && typeof saved === 'object') return { ...DEFAULT_THEME, ...saved };
    }catch(e){}
    return DEFAULT_THEME;
  }
  function applyTheme(t){
    const r = document.documentElement.style;
    r.setProperty('--paper', t.paper); r.setProperty('--ink', t.ink); r.setProperty('--muted', t.muted);
    r.setProperty('--line', t.line); r.setProperty('--contact-bg', t.contactBg); r.setProperty('--tint1', t.tint1); r.setProperty('--tint2', t.tint2); r.setProperty('--scale', t.scale);
  }
  applyTheme(loadTheme());

  /* ============================================================
     PROJECTS — each one is a floating card + a gallery frame, and opens straight
     into its own full-page view. A project is just a title, a cover image and an
     ordered list of blocks (images, text, video). Edit them in admin.html.
  ============================================================ */
  const PORTFOLIO_STORAGE_KEY = 'ferricool-portfolio-projects';
  // ---- tiny AES-GCM helpers: password-locked projects are encrypted before they are published ----
  const toB64 = bytes => { let s = ''; for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]); return btoa(s); };
  const fromB64 = str => Uint8Array.from(atob(str), c => c.charCodeAt(0));
  async function lockKey(password, salt){
    const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 200000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  }
  async function encryptJSON(obj, password){
    const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await lockKey(password, salt);
    const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify(obj)));
    return { salt: toB64(salt), iv: toB64(iv), data: toB64(new Uint8Array(ct)) };
  }
  async function decryptJSON(enc, password){
    const key = await lockKey(password, fromB64(enc.salt));
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64(enc.iv) }, key, fromB64(enc.data));
    return JSON.parse(new TextDecoder().decode(plain));
  }

  /*__PD_START__*/
  const PHOTOS = [
    'https://images.unsplash.com/photo-1518005020951-eccb494ad742',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
    'https://images.unsplash.com/photo-1483985988355-763728e1935b',
    'https://images.unsplash.com/photo-1518770660439-4636190af475',
    'https://images.unsplash.com/photo-1523726491678-bf852e717f6a',
  ];
  const photoUrl = (src, w = 1920, q = 82) => `${src}?auto=format&fit=crop&w=${w}&q=${q}`;
  function makeDefaultProjects(){
    return PHOTOS.map((src, i) => ({
      id: 'project-' + (i + 1), title: 'Project ' + (i + 1), image: src,
      tagline: 'A short line about this project — change it in the admin.',
      bg: '', tight: true,
      blocks: [
        { type: 'text', heading: 'About this project', body: 'Tell the story in a few lines — what it was, who it was for, what you made. Delete this block if you want the images to speak for themselves.' },
        { type: 'image', src: photoUrl(PHOTOS[(i + 1) % 5]) },
        { type: 'image', src: photoUrl(PHOTOS[(i + 2) % 5]) },
        { type: 'image', src: photoUrl(PHOTOS[(i + 3) % 5]) },
      ],
    }));
  }
  const DEFAULT_PROJECTS = makeDefaultProjects();
  const OLD_TITLES = ['Case Study', 'Logo Archive', 'Presentation', 'Web Design', 'AI / Generative'];
  // Turns whatever was saved (including the older category → case-study layout) into the current shape.
  function migrateProjects(list){
    return list.map((p, i) => {
      let blocks = p.blocks;
      if (!Array.isArray(blocks)) {
        const w = p.works && p.works[0] && p.works[0].blocks;
        if (Array.isArray(w)) blocks = w;
        else if (p.locked && p.enc) blocks = undefined;
        else blocks = DEFAULT_PROJECTS[i % DEFAULT_PROJECTS.length].blocks;
      }
      const out = {
        id: p.id || ('project-' + (i + 1)),
        title: OLD_TITLES.includes(p.title) ? ('Project ' + (i + 1)) : (p.title || ('Project ' + (i + 1))),
        image: p.image || '',
        tagline: p.tagline != null ? p.tagline : (p.desc || ''),
        bg: p.bg || '',
        tight: p.tight !== false,
      };
      if (blocks) out.blocks = blocks;
      if (p.locked) { out.locked = true; if (p.enc) out.enc = p.enc; if (p.lockNote) out.lockNote = p.lockNote; if (p.password) out.password = p.password; }
      return out;
    });
  }
  /*__PD_END__*/

  function loadProjects(){
    const saved = draftOf(PORTFOLIO_STORAGE_KEY) || REMOTE.projects;
    if (Array.isArray(saved) && saved.length) return migrateProjects(saved);
    return DEFAULT_PROJECTS;
  }
  const PROJECTS = loadProjects();
  const img = (p, w, q = 85) => /^https?:/.test(p.image) ? `${p.image}${p.image.includes('?') ? '&' : '?'}auto=format&fit=crop&w=${w}&q=${q}` : p.image;

  /* ---------- theme / nav / portrait / CV (every page) ---------- */
  const theme = $('#theme');
  if (localStorage.getItem('portfolio-theme') === 'dark') document.body.classList.add('dark');
  function syncTheme(){ if (theme) theme.querySelector('b').textContent = document.body.classList.contains('dark') ? 'White' : 'Black'; }
  syncTheme();
  theme?.addEventListener('click', () => { document.body.classList.toggle('dark'); localStorage.setItem('portfolio-theme', document.body.classList.contains('dark') ? 'dark' : 'light'); syncTheme(); });

  const navEl = $('.nav');
  if (navEl) {
    const syncNavScroll = () => navEl.classList.toggle('is-scrolled', window.scrollY > 4);
    syncNavScroll();
    window.addEventListener('scroll', syncNavScroll, { passive: true });
  }

  $$('.portrait').forEach(p => {
    const toggle = () => p.classList.toggle('is-color');
    p.addEventListener('click', toggle);
    p.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
  });

  // CV: the file is set in admin → Content → About. Data URLs (a draft you haven't published yet) are turned
  // into a temporary link first, because browsers won't open them directly.
  const cvUrl = () => (C.about && C.about.cvFile) || '';
  const fileUrlFor = async url => url.startsWith('data:') ? URL.createObjectURL(await (await fetch(url)).blob()) : url;
  $('#viewCV')?.addEventListener('click', async e => {
    e.preventDefault(); const u = cvUrl(); if (!u) return;
    window.open(u.startsWith('data:') ? await fileUrlFor(u) : u, '_blank', 'noopener');
  });
  $('#downloadCV')?.addEventListener('click', async () => {
    const u = cvUrl(); if (!u) return;
    const a = document.createElement('a');
    a.href = await fileUrlFor(u);
    a.download = (String((C.signature && C.signature.name) || 'cv').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'cv') + '-cv.pdf';
    document.body.appendChild(a); a.click(); a.remove();
  });

  /* ============================================================
     Everything below belongs to the homepage layout (lens, floating cards,
     moving gallery, project viewer). One guard, so a page like contact.html
     that has none of those elements skips all of it cleanly.
  ============================================================ */
  if ($('#stage')) {
    const pad2 = n => String(n).padStart(2, '0');
    const flag = p => p.locked ? '🔒 Locked' : 'Open ↗';

    /* ---------- floating cards: the first five projects ---------- */
    const featured = PROJECTS.slice(0, 5);
    $('#cards').innerHTML = featured.map((p, i) => `
      <article class="card slot${i}" data-id="${esc(p.id)}">
        <img src="${esc(img(p, 480))}" alt="${esc(p.title)}">
        <div class="card-meta"><span>${pad2(i + 1)}</span><span>${flag(p)}</span></div>
        <div class="card-title">${esc(p.title)}</div>
      </article>`).join('');
    const cards = $$('.card');

    /* ---------- moving gallery: every project ---------- */
    const galleryEl = $('#autoGallery');
    const oneSet = Array.from({ length: Math.max(1, Math.ceil(6 / PROJECTS.length)) }, () => PROJECTS).flat();
    const frame = p => `
      <article class="gallery-frame" data-id="${esc(p.id)}">
        <img src="${esc(img(p, 700, 85))}" alt="${esc(p.title)}" loading="lazy">
        <div class="gf-cap"><span>${pad2(PROJECTS.indexOf(p) + 1)}${p.locked ? ' · 🔒' : ''}</span><strong>${esc(p.title)}</strong></div>
      </article>`;
    galleryEl.innerHTML =
      `<div class="gallery-row row-a">${[...oneSet, ...oneSet].map(frame).join('')}</div>` +
      `<div class="gallery-row row-b">${[...oneSet.slice().reverse(), ...oneSet.slice().reverse()].map(frame).join('')}</div>` +
      `<div class="gallery-cursor" id="galleryCursor" aria-hidden="true"><span>View</span></div>`;
    galleryEl.addEventListener('click', e => { const f = e.target.closest('.gallery-frame'); if (f) openProject(f.dataset.id); });
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

    /* ---------- sound ---------- */
    let audioCtx = null, lastOptical = 0;
    function initSound(){
      if (audioCtx) { if (audioCtx.state === 'suspended') audioCtx.resume(); return audioCtx; }
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
      try { audioCtx = new AC(); audioCtx.resume(); return audioCtx; } catch (e) { return null; }
    }
    function opticalSound(amount = .02){
      const ctx = initSound(); if (!ctx) return;
      const now = performance.now(); if (now - lastOptical < 28) return; lastOptical = now;
      const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
      o.type = 'triangle';
      const dir = amount >= 0 ? 1 : -1, base = 68 + zoom * 18, end = base + dir * (30 + Math.min(55, Math.abs(amount) * 180));
      o.frequency.setValueAtTime(Math.max(35, base), t);
      o.frequency.exponentialRampToValueAtTime(Math.max(35, end), t + .075);
      f.type = 'lowpass'; f.frequency.setValueAtTime(1050, t); f.frequency.exponentialRampToValueAtTime(520, t + .09);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.035, t + .006); g.gain.exponentialRampToValueAtTime(.0001, t + .11);
      o.connect(f); f.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + .115);
    }
    function clickSound(){
      const ctx = initSound(); if (!ctx) return;
      const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(210, t); o.frequency.exponentialRampToValueAtTime(78, t + .13);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.028, t + .008); g.gain.exponentialRampToValueAtTime(.0001, t + .15);
      o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + .155);
    }
    ['pointerdown', 'touchstart', 'keydown'].forEach(ev => document.addEventListener(ev, initSound, { once: true, passive: true }));

    /* ---------- lens: tap to reveal ---------- */
    const lens = $('#lens'), lensImg = $('#lensImg'), zoomValue = $('#zoomValue'), hero = $('.hero');
    lensImg.src = (C.hero && C.hero.lensImage) ? C.hero.lensImage : img(PROJECTS[0], 900);
    let zoom = 0, revealed = false, zoomAnim = null;
    function setZoom(next){
      const prev = zoom; zoom = Math.max(0, Math.min(5, next));
      const eased = zoom / 5;
      lensImg.style.transform = 'scale(' + (1.08 + eased * 1.45) + ')';
      lensImg.style.filter = `saturate(${.8 + eased * .2}) contrast(${1.04 + eased * .1})`;
      zoomValue.textContent = pad2(Math.min(5, Math.max(1, Math.floor(zoom) + 1)));
      hero.classList.toggle('is-zooming', zoom > .08);
      cards.forEach((card, i) => card.classList.toggle('show', zoom >= (i + 1) * .82));
      if (Math.abs(zoom - prev) > .001) opticalSound(zoom - prev);
    }
    function animateZoomTo(target){
      cancelAnimationFrame(zoomAnim);
      const start = zoom, t0 = performance.now(), dur = 1100, ease = t => 1 - Math.pow(1 - t, 3);
      const step = now => { const p = Math.min(1, (now - t0) / dur); setZoom(start + (target - start) * ease(p)); if (p < 1) zoomAnim = requestAnimationFrame(step); };
      zoomAnim = requestAnimationFrame(step);
    }
    function setRevealed(on){
      revealed = on; lens.setAttribute('aria-pressed', String(on)); animateZoomTo(on ? 5 : 0);
      if (on && window.innerWidth <= 800 && lens.scrollIntoView) lens.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    lens.addEventListener('click', e => { e.stopPropagation(); initSound(); setRevealed(!revealed); });
    lens.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); initSound(); setRevealed(!revealed); } });
    hero.addEventListener('click', e => { if (revealed && !e.target.closest('.card, .lens')) setRevealed(false); });
    setZoom(0);
    cards.forEach(card => card.addEventListener('click', () => openProject(card.dataset.id)));

    /* ---------- password for locked projects ---------- */
    const pwDialog = $('#pwDialog'), pwForm = $('#pwForm'), pwInput = $('#pwInput'), pwError = $('#pwError');
    let pwState = null;
    function closePw(result){
      pwDialog.classList.remove('open'); pwDialog.setAttribute('aria-hidden', 'true');
      if (pwState) { const r = pwState.resolve; pwState = null; r(result); }
    }
    function askPassword(p){
      return new Promise(resolve => {
        $('#pwTitle').textContent = p.title;
        $('#pwNote').textContent = p.lockNote || 'This project is private. Enter the password to view it.';
        pwError.textContent = ''; pwInput.value = '';
        pwDialog.classList.add('open'); pwDialog.setAttribute('aria-hidden', 'false');
        pwState = { p, resolve };
        setTimeout(() => pwInput.focus(), 50);
      });
    }
    pwForm.addEventListener('submit', async e => {
      e.preventDefault(); if (!pwState) return;
      const p = pwState.p;
      if (!(window.crypto && crypto.subtle)) { pwError.textContent = 'This browser cannot unlock private projects here.'; return; }
      try {
        const data = await decryptJSON(p.enc, pwInput.value);
        p.blocks = Array.isArray(data.blocks) ? data.blocks : []; p._unlocked = true;
        try { sessionStorage.setItem('unlock:' + p.id, pwInput.value); } catch (err) {}
        closePw(true);
      } catch (err) { pwError.textContent = 'Wrong password'; pwInput.select(); }
    });
    $('#pwCancel').addEventListener('click', () => closePw(false));
    pwDialog.addEventListener('click', e => { if (e.target === pwDialog) closePw(false); });
    async function ensureUnlocked(p){
      if (!(p.locked && p.enc) || p._unlocked) return true;
      let saved = null; try { saved = sessionStorage.getItem('unlock:' + p.id); } catch (e) {}
      if (saved && window.crypto && crypto.subtle) {
        try { const d = await decryptJSON(p.enc, saved); p.blocks = Array.isArray(d.blocks) ? d.blocks : []; p._unlocked = true; return true; } catch (e) {}
      }
      return askPassword(p);
    }

    /* ---------- the project page ---------- */
    const byId = Object.fromEntries(PROJECTS.map(p => [p.id, p]));
    const modal = $('#modal'), modalBox = $('.modal-box'), mmeta = $('#mmeta'), modalBody = $('#modalBody');
    const caseTitleTrack = $('#caseTitleTrack'), caseTagline = $('#caseTagline'), caseSections = $('#caseSections'), caseMore = $('#caseMore'), caseNext = $('#caseNext');
    let currentId = null, revealObserver = null;

    function armReveals(root){
      if (!('IntersectionObserver' in window)) { $$('.reveal', root).forEach(el => el.classList.add('is-visible')); return; }
      if (!revealObserver) {
        revealObserver = new IntersectionObserver(entries => entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-visible'); revealObserver.unobserve(en.target); } }),
          { root: modalBody, threshold: .12, rootMargin: '0px 0px -8% 0px' });
      }
      root.querySelectorAll('.reveal').forEach(el => { el.classList.remove('is-visible'); revealObserver.observe(el); });
    }
    // A project can have its own background colour; text colours flip automatically so it stays readable.
    function applyProjectTheme(p){
      const keys = ['--paper', '--ink', '--muted', '--line'];
      if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(p.bg || '')) { keys.forEach(k => modalBox.style.removeProperty(k)); return; }
      let h = p.bg.slice(1); if (h.length === 3) h = h.split('').map(x => x + x).join('');
      const [r, g, b] = [0, 2, 4].map(i => parseInt(h.substr(i, 2), 16));
      const dark = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 < .5;
      modalBox.style.setProperty('--paper', p.bg);
      modalBox.style.setProperty('--ink', dark ? '#faf6ee' : '#141211');
      modalBox.style.setProperty('--muted', dark ? 'rgba(250,246,238,.62)' : 'rgba(20,18,17,.6)');
      modalBox.style.setProperty('--line', dark ? 'rgba(250,246,238,.16)' : 'rgba(20,18,17,.12)');
    }
    function renderProject(id){
      const p = byId[id] || PROJECTS[0]; currentId = p.id;
      const idx = PROJECTS.indexOf(p), tight = p.tight !== false;
      applyProjectTheme(p);
      mmeta.textContent = `${pad2(idx + 1)} / ${p.title}`;
      caseTitleTrack.innerHTML = `<div class="case-title-track-inner">${[p.title, p.title].map(t => `<span>${esc(t)}</span>`).join('')}</div>`;
      if (p.tagline) { caseTagline.textContent = p.tagline; caseTagline.hidden = false; } else { caseTagline.hidden = true; }
      let imgIndex = 0;
      caseSections.classList.toggle('gaps', !tight);
      caseSections.innerHTML = (p.blocks || []).map(b => {
        if (b.type === 'image') {
          return `<figure class="pimg${tight ? '' : ' reveal'}" data-lb="${imgIndex++}"><img src="${esc(b.src)}" alt="${esc(p.title)}" decoding="async">${b.caption ? `<figcaption>${esc(b.caption)}</figcaption>` : ''}</figure>`;
        }
        if (b.type === 'video') {
          return `<div class="pvideo${tight ? '' : ' reveal'}"><video src="${esc(b.src)}" controls playsinline preload="metadata"></video>${b.caption ? `<figcaption>${esc(b.caption)}</figcaption>` : ''}</div>`;
        }
        return `<div class="ptext reveal"><h3>${esc(b.heading)}</h3><p>${esc(b.body)}</p>${(b.tags && b.tags.length) ? `<div class="case-tags"><ul>${b.tags.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>` : ''}</div>`;
      }).join('');
      const others = PROJECTS.filter(o => o.id !== p.id);
      caseMore.innerHTML = others.length ? `<div class="pmore reveal"><h4>More projects</h4><div class="pmore-grid">${others.slice(0, 8).map(o => `
        <button class="pmore-card" type="button" data-id="${esc(o.id)}"><img src="${esc(img(o, 600))}" alt="${esc(o.title)}"><span>${esc(o.title)}${o.locked ? ' 🔒' : ''}</span></button>`).join('')}</div></div>` : '';
      const next = others.length ? PROJECTS[(idx + 1) % PROJECTS.length] : null;
      caseNext.innerHTML = next ? `<button class="case-next-btn" id="caseNextBtn" type="button"><span>Next project</span><strong>${esc(next.title)} →</strong></button>` : '';
      modalBody.scrollTop = 0;
      armReveals(modalBody);
    }
    async function openProject(id){
      const p = byId[id]; if (!p) return;
      clickSound();
      if (!(await ensureUnlocked(p))) return;
      renderProject(id);
      modal.classList.add('open'); document.body.style.overflow = 'hidden';
    }
    function closeProject(){ modal.classList.remove('open'); document.body.style.overflow = ''; }
    async function moveProject(dir){
      const i = PROJECTS.findIndex(p => p.id === currentId);
      const target = PROJECTS[(i + dir + PROJECTS.length) % PROJECTS.length];
      if (await ensureUnlocked(target)) { renderProject(target.id); clickSound(); }
    }
    $('#prevProject')?.addEventListener('click', () => moveProject(-1));
    $('#nextProject')?.addEventListener('click', () => moveProject(1));
    $('#close')?.addEventListener('click', closeProject);
    modal.addEventListener('click', e => { if (e.target === modal) closeProject(); });
    caseNext.addEventListener('click', e => { if (e.target.closest('#caseNextBtn')) moveProject(1); });
    caseMore.addEventListener('click', async e => {
      const c = e.target.closest('.pmore-card'); if (!c) return;
      const p = byId[c.dataset.id]; clickSound();
      if (await ensureUnlocked(p)) renderProject(p.id);
    });

    /* ---------- click an image: pop-up viewer (scrolls vertically, collapse any time) ---------- */
    const lightbox = $('#lightbox'), lbBody = $('#lbBody');
    function openLightbox(start){
      const p = byId[currentId]; const imgs = (p.blocks || []).filter(b => b.type === 'image' && b.src);
      if (!imgs.length) return;
      lbBody.innerHTML = imgs.map((b, i) => `<img src="${esc(b.src)}" alt="${esc(p.title)} ${i + 1}">`).join('');
      $('#lbCount').textContent = p.title;
      lightbox.classList.add('open'); lightbox.setAttribute('aria-hidden', 'false');
      const target = lbBody.children[start]; if (target && target.scrollIntoView) target.scrollIntoView({ block: 'start' });
    }
    function closeLightbox(){ lightbox.classList.remove('open'); lightbox.setAttribute('aria-hidden', 'true'); lbBody.innerHTML = ''; }
    caseSections.addEventListener('click', e => { const f = e.target.closest('.pimg'); if (f) openLightbox(Number(f.dataset.lb)); });
    $('#lbClose').addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', e => { if (e.target === lightbox || e.target === lbBody) closeLightbox(); });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        if (pwDialog.classList.contains('open')) closePw(false);
        else if (lightbox.classList.contains('open')) closeLightbox();
        else if (modal.classList.contains('open')) closeProject();
        else if (revealed) setRevealed(false);
      }
      if (modal.classList.contains('open') && !lightbox.classList.contains('open') && !pwDialog.classList.contains('open')) {
        if (e.key === 'ArrowRight') moveProject(1);
        if (e.key === 'ArrowLeft') moveProject(-1);
      }
    });
  }

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
