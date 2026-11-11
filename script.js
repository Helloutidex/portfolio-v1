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
      const c = new AbortController(); const t = setTimeout(() => c.abort(), 2500);
      const r = await fetch(url, { cache: 'no-cache', signal: c.signal }); clearTimeout(t);
      return r.ok ? await r.json() : null;
    } catch (e) { return null; }
  };
  const REMOTE = (await fetchJSON('site-data.json')) || {};
  // speed: a few heavy PNG photos have identical-looking light JPG twins in assets/uploads — use those instead
  const LIGHTER = { 'assets/uploads/mvybotwj-0.png': 'assets/uploads/mvybotwj-0.jpg', 'assets/uploads/mw3sn5ib-0.png': 'assets/uploads/mw3sn5ib-0.jpg', 'assets/uploads/mw3sn94h-1.png': 'assets/uploads/mw3sn94h-1.jpg' };
  (function swap(o){ if (!o || typeof o !== 'object') return; for (const k of Object.keys(o)) { const v = o[k]; if (typeof v === 'string' && LIGHTER[v]) o[k] = LIGHTER[v]; else if (v && typeof v === 'object') swap(v); } })(REMOTE);
  // unpublished admin drafts (kept in this browser's IndexedDB by admin.html) so "Preview site" shows them
  const IDB = await new Promise(res => {
    try {
      const r = indexedDB.open('portfolio-admin', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('drafts');
      r.onsuccess = () => { try { const out = {}, c = r.result.transaction('drafts', 'readonly').objectStore('drafts').openCursor();
        c.onsuccess = () => { const cur = c.result; if (cur) { out[cur.key] = cur.value; cur.continue(); } else res(out); }; c.onerror = () => res({}); } catch (e) { res({}); } };
      r.onerror = () => res({}); setTimeout(() => res({}), 800);
    } catch (e) { res({}); }
  });
  const draftOf = key => { try { const v = JSON.parse(localStorage.getItem(key)); if (v) return v; } catch (e) {} return IDB[key] || null; };

  /* ============================================================
     SITE TEXT + THEME — the other half of the single-source setup
     below (PROJECTS). admin.html edits these too, under its
     "Content" and "Theme" tabs, saved to the same kind of
     browser-only localStorage override. Everything here has a
     matching id in index.html that applyContent() writes into.
  ============================================================ */
  const CONTENT_STORAGE_KEY = 'ferricool-portfolio-content';
  const DEFAULT_CONTENT = {
    nav: { logo: 'SAMUEL ADEDEJI / DESIGN', logoImage: '', logoStyle: 'center', favicon: '', thumbBar: true, links: [{ label: 'About', href: '#about' }, { label: 'Work', href: '#work' }], ctaLabel: "Let's talk", ctaHref: 'contact.html' },
    hero: {
      eyebrow: 'Independent designer · Lagos, Nigeria',
      titlePre: 'Designing ', titleEm: "what's", titlePost: ' next.',
      paragraph: 'I turn ideas into identities, digital experiences and visual systems people can feel.',
      lensLabel: 'Tap to reveal',
      opticNote: 'Tap the lens · reveal the work',
      note: 'The work is hidden in the lens.',
      zoomInstruction: 'Tap to explore',
      lensImage: '', ctaLabel: 'View my work ↗', ctaHref: '#work',
      available: 'Available for hire',
      hireLabel: 'Hire me', whatsapp: '2348065925091', hireMessage: "Hi Samuel, I saw your portfolio and I'd like to hire you for a project.",
    },
    about: {
      label: 'About me', viewCV: 'View CV ↗', downloadCV: 'Download CV ↓',
      portraitImage: 'assets/portrait.jpg', portraitCaption: 'Portrait · tap for colour', cvFile: 'cv.pdf',
      headingPre: 'I design for the space between an ', headingEm: 'idea', headingPost: ' and what it can become.',
      paragraph1: "I'm a multidisciplinary designer working across brand identity, digital design, campaigns and AI / generative visuals.",
      paragraph2: "I'm interested in clear ideas, strong visual systems and work that can live beyond a single screen.",
      signImage: '',
      skills: ['Brand identity','Art direction','Digital design','AI / generative','Visual systems'],
    },
    social: { label: 'Selected collaborators', count: '01 — 05', items: [
      { name:'Urban Food Fest', logo:'' },
      { name:'AWS Community', logo:'' },
      { name:'Ferricool Studios', logo:'' },
      { name:'Shop Soma', logo:'' },
      { name:'Independent Collaborations', logo:'' },
    ]},
    proof: { label: 'Social proof', heading: '', stats: [
      { value: '80+', label: 'Satisfied Clients.' },
      { value: '120+', label: 'Completed Projects.' },
      { value: '5yrs+', label: 'Design Experience.' },
    ]},
    logofolio: { label: 'Logofolio', heading: 'Marks & identities I have designed.', tiles: 'light', items: [] },
    globeExtra: { items: [
      { name: 'SwyftSend', logo: 'assets/uploads/mvybox7f-1.jpg' },
      { name: 'SwyftSend', logo: 'assets/uploads/mvyboyty-2.jpg' },
      { name: 'SwyftSend', logo: 'assets/uploads/mvybp0i1-3.jpg' },
      { name: 'SwyftSend', logo: 'assets/uploads/mvybp21a-4.jpg' },
      { name: 'SwyftSend', logo: 'assets/uploads/mvybp3fa-5.jpg' },
      { name: 'SwyftSend', logo: 'assets/uploads/mvybp57e-6.jpg' },
      { name: 'SwyftSend', logo: 'assets/uploads/mvybp704-7.jpg' },
      { name: 'SwyftSend', logo: 'assets/uploads/mvybp8rr-8.jpg' },
      { name: 'SwyftSend', logo: 'assets/uploads/mvybpa6v-9.jpg' },
      { name: 'SwyftSend', logo: 'assets/uploads/mvybpc0z-10.jpg' },
      { name: 'SwyftSend', logo: 'assets/uploads/mvybpdnv-11.jpg' },
      { name: 'SwyftSend', logo: 'assets/uploads/mvybpf4x-12.jpg' },
      { name: 'Kalvia', logo: 'assets/uploads/mw3sn5ib-0.jpg' },
      { name: 'Conversation Circle', logo: 'assets/uploads/mw3sn94h-1.jpg' },
      { name: 'Life magazine', logo: 'assets/uploads/mw9qlnk5-0.jpg' },
      { name: 'Gloria and Yomi', logo: 'assets/uploads/mw9qlts0-1.jpg' },
      { name: 'Glory2Glory', logo: 'assets/uploads/mw9qm3cf-2.jpg' },
      { name: 'Glory2Glory', logo: 'assets/uploads/mw9qm8jv-3.jpg' },
      { name: 'Make fruits part of your diet', logo: 'assets/uploads/mw9qmgjf-5.jpg' }
    ] },
    work: { galleryStyle: 'globe', globeHint: 'Drag to spin · double-tap to scatter', gallerySpeed: 1, label: 'Gallery / automatic', description: 'Selected work, continuously moving. Tap any frame to explore.', noteRight: 'Drag to explore · tap a picture to open it', thanks: 'Thank you for viewing.', thanksNote: 'Have a project in mind?', thanksCta: "Let's talk ↗" },
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
    process: { label: 'My process', heading: 'How an idea becomes the work.', steps: [
      { title: 'Ideate', text: 'Listen, ask questions and find the real problem.' },
      { title: 'Think', text: 'Shape the strategy before a single pixel.' },
      { title: 'Explore', text: 'Sketch wide and test bold directions.' },
      { title: 'Design', text: 'Craft the system and polish every detail.' },
    ]},
    resources: { label: 'Resources', heading: 'Books, channels and programs that shaped how I design.', items: [
      { title: 'Incubator', by: 'Design programme', kind: 'Program', image: 'assets/resources/incubator.jpg', url: '' },
      { title: 'Logo Design Love', by: 'David Airey', kind: 'Book', image: 'assets/resources/logo-design-love.jpg', url: '' },
      { title: 'Satori Graphics', by: 'YouTube channel', kind: 'YouTube', image: 'assets/resources/satori-graphics.jpg', url: 'https://www.youtube.com/@SatoriGraphics' },
      { title: 'The Brand Gap', by: 'Marty Neumeier', kind: 'Book', image: 'assets/resources/the-brand-gap.jpg', url: '' },
      { title: 'The Advertising Concept Book', by: 'Pete Barry', kind: 'Book', image: 'assets/resources/advertising-concept-book.jpg', url: '' },
      { title: 'Designing Brand Identity', by: 'Alina Wheeler', kind: 'Book', image: 'assets/resources/designing-brand-identity.jpg', url: '' },
      { title: 'The Futur', by: 'YouTube channel', kind: 'YouTube', image: 'assets/resources/the-futur.jpg', url: 'https://www.youtube.com/@thefutur' },
    ]},
    links: { label: 'Links', description: 'Find the work, the process, or start a conversation.', items: [
      { label: 'Work ↗', href: '#work' }, { label: 'About ↗', href: '#about' }, { label: 'Contact ↗', href: '#contact' },
    ]},
    badge: { style: 'brand', initials: 'AS', ringText: 'ADEDEJI SAMUEL', ringImage: '', size: 96, href: 'contact.html' },
    signature: { name: 'ADEDEJI SAMUEL', font: 'UnifrakturCook', nameColor: '#E8223E', bg: '#141211', textColor: '#faf6ee' },
    contact: { ctaLabel: "Let's talk ↗", pageHeading: "Let's talk.", subheading: 'Tell me about your project.', body: 'Share a little about what you have in mind — the goal, the timeline, anything that helps. I read every message and reply personally.', whatsappLabel: 'WhatsApp number (optional)', backLabel: '← Back home', small: 'Start a project', headingLines: ["Let's make","something","worth seeing."], available: 'Available for selected projects', emailText: 'samuel.s.adedeji@gmail.com ↗', emailHref: 'mailto:samuel.s.adedeji@gmail.com' },
    notes: { enabled: true, label: 'Say hello', heading: 'A few notes pinned for you.', feel: 'How are you feeling today? One word.', build: 'What are you building next?', spark: 'Need a spark?' },
    socials: [
      { kind: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/helloutidex', icon: '' },
      { kind: 'x', label: 'X (Twitter)', url: 'https://x.com/helloutidex', icon: '' },
      { kind: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/in/samadedeji/', icon: '' },
      { kind: 'link', label: '', url: '', icon: '' },
    ],
    footer: { copyright: '© 2026 Helloutidex. All rights reserved.', left: '© 2026 Adedeji Samuel', right: 'Designed with intention / Lagos', brand: 'Helloutidex', name: 'SAMUEL ADEDEJI' },
    effects: { particles: true, ctaPuzzle: true, intro: true, introStyle: 'poster' },
    poster: { head: "Every project is a\nconversation, this is\nwhere yours begins.", btn: 'Book a Call', tag: "What are you waiting for, let's build bold brands.", sign: 'Helloutidex', signImage: '', image: 'assets/portrait-cutout.webp', mark: 'SA', hold: 8.4,
      socials: [{ label: 'Instagram', url: '' }, { label: 'LinkedIn', url: '' }, { label: 'Linktree', url: '' }] },
    games: { enabled: true, idleMinutes: 2, button: 'Play a game', offline: true, title: 'Taking a break? Play a quick game.', quiz: true, fonts: true, odd: true, memory: true, sudoku: true, words: true },
  };

  const cloneDefaultContent = () => JSON.parse(JSON.stringify(DEFAULT_CONTENT));
  // Fills in any setting a saved / published copy doesn't have yet, so new features never break old data.
  function fixSocials(o){   // the old LinkedIn search placeholder becomes the real profile
    if (o && Array.isArray(o.socials)) o.socials.forEach(x => { if (x && /linkedin\.com\/search\//.test(x.url || '')) x.url = 'https://www.linkedin.com/in/samadedeji/'; });
    return o;
  }
  function mergeContent(saved){
    const d = cloneDefaultContent(), out = {};
    for (const k of Object.keys(d)) {
      const dv = d[k], sv = saved ? saved[k] : undefined;
      if (dv && typeof dv === 'object' && !Array.isArray(dv)) out[k] = { ...dv, ...((sv && typeof sv === 'object') ? sv : {}) };
      else out[k] = sv !== undefined ? sv : dv;
    }
    if (saved && saved.social && Array.isArray(saved.social.names) && !Array.isArray(saved.social.items)) out.social.items = saved.social.names.map(n => ({ name: n, logo: '' }));
    if (!saved || !saved.badge) out.badge.ringText = out.signature.name;
    return fixSocials(out);
  }
  function loadContent(){
    const saved = draftOf(CONTENT_STORAGE_KEY) || REMOTE.content;
    return mergeContent(saved && typeof saved === 'object' ? saved : null);
  }
  // A clean, generic wordmark used until a real logo is uploaded in admin.html.
  function placeholderLogo(name){
    const initials = String(name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('') || '?';
    return `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(name)} logo placeholder"><rect x="1" y="1" width="118" height="38" rx="8" fill="none" stroke="currentColor" stroke-width="1.4"/><text x="60" y="25" text-anchor="middle" font-family="'DM Mono',monospace" font-size="15" letter-spacing="1" fill="currentColor">${esc(initials)}</text></svg>`;
  }
  // Old English / blackletter faces you can pick for the signature line (loaded only when chosen).
  const SIGNATURE_FONTS = ['UnifrakturCook', 'UnifrakturMaguntia', 'Pirata One', 'Grenze Gotisch', 'New Rocker', 'Metamorphous', 'Cinzel Decorative', 'Texturina'];
  const loadedFonts = new Set();
  function loadFont(name){
    if (!name || name === 'UnifrakturCook' || loadedFonts.has(name) || !SIGNATURE_FONTS.includes(name)) return;
    loadedFonts.add(name);
    const l = document.createElement('link'); l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=' + encodeURIComponent(name).replace(/%20/g, '+') + '&display=swap';
    document.head.appendChild(l);
  }
  function renderNav(c){
    const home = !!document.getElementById('stage');
    const fix = h => (!home && String(h || '').startsWith('#')) ? 'index.html' + h : (h || '#');
    const links = $('#navLinks');
    if (links) links.innerHTML = (c.nav.links || []).map(l => `<a href="${esc(fix(l.href))}">${esc(l.label)}</a>`).join('');
    const cta = $('#navCta');
    if (cta) { cta.textContent = c.nav.ctaLabel || ''; cta.href = fix(c.nav.ctaHref || 'contact.html'); cta.hidden = !c.nav.ctaLabel; }
  }
  function applyContent(c){
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    // header logo: your uploaded PNG if there is one (white on the dark theme, own colours on light), otherwise the text
    const navLogo = $('#navLogo');
    if (navLogo) {
      if (c.nav.logoImage) { navLogo.innerHTML = `<img class="sb-logo-img" src="${esc(c.nav.logoImage)}" alt="${esc(c.nav.logo || 'Logo')}">`; navLogo.classList.add('has-img'); }
      else if (c.nav.logoStyle === 'text') { navLogo.textContent = c.nav.logo; navLogo.classList.remove('has-img', 'has-mark'); }
      else {   // built-in SA. mark (letters follow the theme, the dot stays red) + optional name
        navLogo.classList.add('has-mark'); navLogo.classList.remove('has-img');
        const ls = ['mark-only', 'mark-label'].includes(c.nav.logoStyle) ? c.nav.logoStyle : 'center';   // 'center' = name on the left, SA. mark in the middle (older values map here)
        const nm = String(c.nav.logo || '').replace(/^ADEDEJI SAMUEL\b/i, 'SAMUEL ADEDEJI');
        const mark = `<svg class="sb-mark" viewBox="0 0 422 144" role="img" aria-label="${esc(nm || 'SA')}"><use href="assets/brand.svg#sa-letters"/><use class="mark-dot" href="assets/brand.svg#sa-dot"/></svg>`;
        navLogo.classList.toggle('is-center', ls === 'center');
        navLogo.innerHTML = ls === 'center' ? `<span class="sb-name">${esc(nm).replace(/\s*\/\s*/, '<i> / </i>')}</span>${mark}` : mark + (ls === 'mark-label' ? `<span class="sb-name">${esc(nm)}</span>` : '');
      }
    }
    renderNav(c);
    // favicon (the little icon in the browser tab): admin → Content → Header, falls back to assets/favicon.svg
    const fav = document.getElementById('favicon');
    if (fav && c.nav.favicon) { fav.href = c.nav.favicon; fav.removeAttribute('type'); }
    set('heroEyebrow', c.hero.eyebrow); { const eb = $('#heroEyebrow'); if (eb) eb.hidden = c.hero.showEyebrow !== true; } set('heroTitlePre', c.hero.titlePre); set('heroTitleEm', c.hero.titleEm); set('heroTitlePost', c.hero.titlePost);
    set('heroParagraph', c.hero.paragraph); set('lensLabel', c.hero.lensLabel); set('opticNote', c.hero.opticNote);
    set('heroNote', c.hero.note); set('heroZoomInstruction', c.hero.zoomInstruction);
    const cta = $('#heroCta');
    if (cta) { cta.textContent = c.hero.ctaLabel || ''; cta.href = c.hero.ctaHref || '#work'; cta.hidden = !c.hero.ctaLabel; }
    // Hire me → opens WhatsApp straight to the chat, with a ready-made first message
    const hire = $('#heroHire');
    if (hire) {
      const num = String(c.hero.whatsapp || '').replace(/\D/g, '').replace(/^0(?=\d{10}$)/, '234');
      hire.hidden = !(c.hero.hireLabel && num);
      hire.href = `https://wa.me/${num}${c.hero.hireMessage ? '?text=' + encodeURIComponent(c.hero.hireMessage) : ''}`;
      set('heroHireLabel', c.hero.hireLabel || 'Hire me');
    }
    set('aboutLabel', c.about.label); set('viewCV', c.about.viewCV); set('downloadCV', c.about.downloadCV);
    const cvBox = $('.cv-cta'); if (cvBox) cvBox.hidden = !c.about.cvFile;
    const portraitImg = $('#portraitImg'); if (portraitImg && c.about.portraitImage) portraitImg.src = c.about.portraitImage;
    set('portraitCaption', c.about.portraitCaption);
    set('aboutHeadingPre', c.about.headingPre); set('aboutHeadingEm', c.about.headingEm); set('aboutHeadingPost', c.about.headingPost);
    // signature: an uploaded PNG / SVG replaces the drawn one (About + opening poster)
    const asg = $('#aboutSign');
    if (asg && c.about.signImage) { asg.innerHTML = `<img class="sig-img" src="${esc(c.about.signImage)}" alt="Signature">`; }
    // "Available for hire" badge in the hero (empty text hides it)
    const av = $('#heroAvail'); if (av) { av.hidden = !c.hero.available; set('heroAvailText', c.hero.available || ''); }
    set('aboutParagraph1', c.about.paragraph1); set('aboutParagraph2', c.about.paragraph2);
    const skillsList = $('#skillsList'); if (skillsList) skillsList.innerHTML = c.about.skills.map(s => `<span class="skill">${esc(s)}</span>`).join('');
    set('socialLabel', c.social.label); set('socialCount', c.social.count);
    const logoTrack = $('#logoTrack');
    if (logoTrack) {
      const mark = item => `<div class="logo-mark" title="${esc(item.name)}">${item.logo ? `<img src="${esc(item.logo)}" alt="${esc(item.name)} logo">` : placeholderLogo(item.name)}</div>`;
      const oneSet = c.social.items.map(mark).join('');
      let repeats = Math.max(2, Math.ceil((window.innerWidth * 2.2) / Math.max(1, c.social.items.length * 200)));
      if (repeats % 2 !== 0) repeats++;
      logoTrack.innerHTML = oneSet.repeat(repeats);
    }
    // social proof: the numbers band
    const pr = c.proof || {};
    set('proofLabel', pr.label || '');
    const ph = $('#proofHeading'); if (ph) { ph.textContent = pr.heading || ''; ph.hidden = !pr.heading; }
    const ps = $('#proofStats');
    // each digit is a little column 0–9 (twice) that rolls upward to its value, like a volume level going up
    const odo = v => [...String(v || '')].map(ch => /\d/.test(ch)
      ? `<span class="odo-d" style="--d:${ch}"><span class="odo-s">${[...Array(20)].map((_, k) => `<span>${k % 10}</span>`).join('')}</span></span>`
      : `<span class="odo-c">${esc(ch)}</span>`).join('');
    if (ps) ps.innerHTML = (pr.stats || []).filter(s => s.value || s.label).map(s => `<div class="stat"><strong class="odo" aria-label="${esc(s.value)}">${odo(s.value)}</strong><i aria-hidden="true"></i><span>${esc(s.label)}</span></div>`).join('');
    // logofolio: the logos you've designed, icons only
    const lf = c.logofolio || {}, lfItems = (lf.items || []).filter(it => it.logo);
    const lfEl = $('#logofolio'); if (lfEl) { lfEl.hidden = !lfItems.length; lfEl.classList.toggle('dark-tiles', lf.tiles === 'dark'); }
    set('logofolioLabel', lf.label || ''); set('logofolioHeading', lf.heading || '');
    const lg2 = $('#logoGrid'); if (lg2) lg2.innerHTML = lfItems.map(it => `<figure class="logo-tile" title="${esc(it.name || '')}"><img src="${esc(it.logo)}" alt="${esc(it.name || 'Logo')}" loading="lazy"></figure>`).join('');
    set('workLabel', c.work.label); set('workDescription', c.work.description); set('galleryNoteRight', c.work.noteRight);
    set('testimonialsLabel', c.testimonials.label); set('testimonialsDescription', c.testimonials.description);
    const tg = $('#testimonialGrid');
    const initials = n => String(n || '').trim().split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('') || '“';
    if (tg) tg.innerHTML = c.testimonials.items.map(t => `<article class="testimonial-card"><span class="tq" aria-hidden="true">“</span><blockquote>${esc(t.quote)}</blockquote><cite><span class="t-avatar" aria-hidden="true">${esc(initials(t.name))}</span><span class="t-who"><b>${esc(t.name)}</b>${esc(t.role)}</span></cite></article>`).join('');
    set('expHeadingLine1', c.experience.headingLine1); set('expHeadingLine2', c.experience.headingLine2);
    const expRows = $('#expRows'); if (expRows) expRows.innerHTML = c.experience.rows.map(r => `<div class="exp-row"><span>${esc(r.tag)}</span><strong>${esc(r.role)}</strong><span>${esc(r.meta)}</span></div>`).join('');
    set('linksLabel', c.links.label); set('linksDescription', c.links.description);
    const lg = $('#linksGrid'); if (lg) lg.innerHTML = c.links.items.map(it => `<a class="big-link" href="${esc(it.href)}">${esc(it.label)}</a>`).join('');
    // signature line + the dark band behind it
    const sg = c.signature || {};
    const nt = $('#nameTrack');
    if (nt) { nt.innerHTML = [sg.name, sg.name].map(n => `<span>${esc(n)}</span>`).join(''); nt.style.fontFamily = `'${sg.font || 'UnifrakturCook'}', cursive`; }
    loadFont(sg.font);
    $$('.links-section, .signature, .proof').forEach(el => {
      el.style.setProperty('--band-bg', sg.bg || '#141211'); el.style.setProperty('--band-text', sg.textColor || '#faf6ee'); el.style.setProperty('--band-name', sg.nameColor || '#E8223E');
    });
    // contact: homepage call-to-action + the contact page
    set('contactSmall', c.contact.small);
    // contact heading in sentence case (ALL-CAPS lines from older settings are converted)
    const sentence = lines => { const t = lines.join('\n'); if (t !== t.toUpperCase()) return lines; const low = t.toLowerCase(); return (low.charAt(0).toUpperCase() + low.slice(1)).replace(/\bi\b/g, 'I').split('\n'); };
    const ch = $('#contactHeading'); if (ch) ch.innerHTML = sentence(c.contact.headingLines || []).map(esc).join('<br>');
    set('contactPageHeading', c.contact.pageHeading); set('contactSub', c.contact.subheading); set('contactBody', c.contact.body);
    set('contactBack', c.contact.backLabel); set('whatsappLabel', c.contact.whatsappLabel);
    set('contactAvailable', c.contact.available);
    const emailEl = $('#contactEmail'); if (emailEl) { emailEl.textContent = c.contact.emailText; emailEl.href = c.contact.emailHref; }
    set('contactCtaBtn', c.contact.ctaLabel || "Let's talk ↗");
    const formEl = $('#contactForm'); if (formEl) formEl.action = 'https://formsubmit.co/' + String(c.contact.emailHref || '').replace(/^mailto:/, '').split('?')[0];
    set('footerLeft', c.footer.left); set('footerRight', c.footer.right);
    // social links (footer + contact page); built-in icons unless you upload your own
    const SOC = {
      instagram: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="17.4" cy="6.6" r="1.2" fill="currentColor"/></svg>',
      x: '<svg viewBox="0 0 24 24"><path d="M4 4h4.6l4.1 5.6L17.6 4H20l-6.2 7.1L20.5 20h-4.6l-4.4-6-5.2 6H4l6.6-7.6z" fill="currentColor"/></svg>',
      linkedin: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M7.5 10v6.5M7.5 7.3v.1M11 16.5V10m0 3.2c0-1.9 1-3.2 2.6-3.2s2.4 1.1 2.4 3v3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
      behance: '<svg viewBox="0 0 24 24"><path d="M3 6h5.2a2.8 2.8 0 0 1 .9 5.4A3 3 0 0 1 8.4 18H3zM3 11.5h5M15 8h5M14 14h7a3.5 3.5 0 1 0-1 2.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
      dribbble: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M5 7c4 1.5 9 1 13-1.5M3.5 13c5-1.5 11-1 16.5 3M9 3.8c3 4 5 10 6 16.6" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
      link: '<svg viewBox="0 0 24 24"><path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1.2 1.2M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1.2-1.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    };
    const socials = (c.socials || []).filter(s => s && s.url);
    const socialHTML = socials.map(s => `<a class="soc" href="${esc(s.url)}" target="_blank" rel="noopener" aria-label="${esc(s.label || s.kind)}" title="${esc(s.label || s.kind)}">${s.icon ? `<img src="${esc(s.icon)}" alt="">` : (SOC[s.kind] || SOC.link)}</a>`).join('');
    $$('[data-socials]').forEach(el => { el.innerHTML = socialHTML; el.hidden = !socials.length; });
    const pn = c.notes || {}; const notesEl = $('#notes'); if (notesEl) notesEl.hidden = pn.enabled === false;
    set('notesLabel', pn.label || ''); set('notesHeading', pn.heading || '');
    set('footBrand', c.footer.brand || ''); set('footCopy', c.footer.copyright || ('© ' + new Date().getFullYear() + ' Helloutidex. All rights reserved.')); set('footName', c.footer.name || '');
    // my process
    const pr2 = c.process || {}, steps = (pr2.steps || []).filter(s => s.title);
    const procEl = $('#process'); if (procEl) procEl.hidden = !steps.length;
    set('processLabel', pr2.label || ''); set('processHeading', pr2.heading || '');
    const ps2 = $('#processSteps'); if (ps2) ps2.innerHTML = steps.map((s, i) => `<li class="pstep" style="--i:${i}"><span class="pstep-dot" aria-hidden="true"></span><h3>${esc(s.title)}</h3>${s.text ? `<p>${esc(s.text)}</p>` : ''}</li>`).join('');
    // resources
    // built-in pictures for the starter resources (from the Resources page of the PDF portfolio), used when no cover is uploaded
    const RES_PICS = { 'incubator': 'incubator', 'logo design love': 'logo-design-love', 'satori graphics': 'satori-graphics', 'the brand gap': 'the-brand-gap',
      'the advertising concept book': 'advertising-concept-book', 'designing brand identity': 'designing-brand-identity', 'the futur': 'the-futur' };
    const rs = c.resources || {}, ritems = (rs.items || []).filter(r => r.title || r.image).map(r => {
      const k = RES_PICS[String(r.title || '').trim().toLowerCase()]; return (!r.image && k) ? { ...r, image: `assets/resources/${k}.jpg` } : r; });
    const resEl = $('#resources'); if (resEl) resEl.hidden = !ritems.length;
    set('resourcesLabel', rs.label || ''); set('resourcesHeading', rs.heading || '');
    const kindIcon = k => /you ?tube|video|channel/i.test(k || '') ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 7.5v9l7.5-4.5z" fill="currentColor"/></svg>'
      : /book/i.test(k || '') ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h9a4 4 0 0 1 4 4v12H9a4 4 0 0 1-4-4z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M5 16a4 4 0 0 1 4-4h9" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>'
      : '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" fill="currentColor"/></svg>';
    const rg = $('#resGrid');
    if (rg) rg.innerHTML = ritems.map((r, i) => {
      const wide = /you ?tube|video|channel|program/i.test(r.kind || ''), tag = r.url ? 'a' : 'div';
      const attrs = r.url ? ` href="${esc(r.url)}" target="_blank" rel="noopener"` : '';
      const isBook = /book/i.test(r.kind || '') && !wide;
      return `<${tag} class="res-card${wide ? ' wide' : ''}${r.image ? (isBook ? ' has-cover' : ' has-img') : ''}" style="--i:${i}"${attrs}>
        ${r.image ? `<img${isBook ? ' class="res-cover"' : ''} src="${esc(r.image)}" alt="${esc(r.title || '')}" loading="lazy" decoding="async">` : ''}
        <span class="res-kind">${kindIcon(r.kind)}${esc(r.kind || '')}</span>
        <span class="res-body"><strong>${esc(r.title || '')}</strong>${r.by ? `<em>${esc(r.by)}</em>` : ''}</span>
        ${r.url ? '<span class="res-go" aria-hidden="true">↗</span>' : ''}
      </${tag}>`;
    }).join('');
    // computers (4 columns): the last card stretches to fill any gap at the end of the grid
    if (rg && rg.lastElementChild) {
      const cells = ritems.reduce((n, r) => n + (/you ?tube|video|channel|program/i.test(r.kind || '') ? 2 : 1), 0), rem = (4 - cells % 4) % 4;
      if (rem) rg.lastElementChild.dataset.span = String((rg.lastElementChild.classList.contains('wide') ? 2 : 1) + rem);
    }
    // floating badge: initials, ring text OR your own spinning PNG, size and link
    const badge = $('#floatingBadge');
    if (badge) {
      const bd = c.badge || {};
      const initials = (bd.initials || '').trim(), ring = (bd.ringText || '').trim(), ringImg = (bd.ringImage || '').trim();
      badge.hidden = !initials && !ring && !ringImg;
      badge.href = bd.href || 'contact.html';
      badge.style.setProperty('--badge-size', (Number(bd.size) || 96) + 'px');
      const ini = $('#floatingBadgeInitials'); if (ini) ini.textContent = initials;
      const bimg = $('#floatingBadgeImg'), bsvg = $('#floatingBadgeSvg');
      if (bimg) { bimg.hidden = !ringImg; if (ringImg) bimg.src = ringImg; }
      // built-in brand badge (SA. in the middle, ADEDEJI.SAMUEL.SUNDAY spinning around it) unless "text" style or a PNG is chosen
      const brand = !ringImg && bd.style !== 'text';
      badge.classList.toggle('is-brand', brand);
      let art = $('#floatingBadgeArt');
      if (brand && !art) { badge.insertAdjacentHTML('afterbegin', `<svg id="floatingBadgeArt" class="fb-art" viewBox="0 0 531 531" aria-hidden="true"><g class="fb-ring"><use href="assets/brand.svg#ring"/></g><use href="assets/brand.svg#center"/><use class="mark-dot" href="assets/brand.svg#bdot"/></svg>`); }
      if (bsvg) bsvg.style.display = (ringImg || brand) ? 'none' : '';
      const ringPath = $('#badgeCircleText');
      if (ringPath && ring) {
        const unit = ring + ' · ';
        ringPath.textContent = unit.repeat(Math.max(1, Math.round(57 / unit.length))).trim();
        ringPath.setAttribute('textLength', '312'); ringPath.setAttribute('lengthAdjust', 'spacing');
      } else if (ringPath) ringPath.textContent = '';
    }
  }
  const C = loadContent();
  window.PORTFOLIO_CONTENT = C;
  applyContent(C);
  // the opening animation reads these on the next visit (it runs before the site data has loaded)
  try {
    const ef = C.effects || {}, po = C.poster || {};
    localStorage.setItem('ferricool-intro', ef.intro === false ? 'off' : 'on');
    localStorage.setItem('ferricool-intro-style', ef.intro === false ? 'off' : (ef.introStyle || 'poster'));
    localStorage.setItem('ferricool-intro-name', (C.signature && C.signature.name) || '');
    const img = po.image && !String(po.image).startsWith('data:') ? po.image : 'assets/portrait-cutout.webp', sraw = po.signImage || (C.about && C.about.signImage) || '', simg = sraw && !String(sraw).startsWith('data:') ? sraw : '';
    localStorage.setItem('ferricool-poster', JSON.stringify({ head: po.head, btn: po.btn, tag: po.tag, sign: po.sign, signImg: simg, img, mark: po.mark, hold: Math.round(Math.max(3.8, Number(po.hold) || 8.4) * 1000), socials: (po.socials || []).filter(x => x && x.label && x.url) }));
  } catch (e) {}

  /* ---------- colours: one light palette and one dark palette; admin picks which one the site uses ---------- */
  const THEME_STORAGE_KEY = 'ferricool-portfolio-theme';
  const DEFAULT_THEME = {
    mode: 'dark', scale: 1,
    light: { paper: '#ffffff', ink: '#141211', muted: '#6b6b6b', line: '#ececec', accent: '#E8223E', contactBg: '#E8223E', contactText: '#ffffff', tint1: '#ffffff', tint2: '#ffffff' },
    dark:  { paper: '#0c0c0d', ink: '#f2f2f2', muted: '#a6a6a6', line: '#242426', accent: '#E8223E', contactBg: '#E8223E', contactText: '#ffffff', tint1: '#0c0c0d', tint2: '#0c0c0d' },
  };
  function migrateTheme(saved){
    const d = JSON.parse(JSON.stringify(DEFAULT_THEME));
    if (!saved || typeof saved !== 'object') return d;
    const out = { mode: ['dark', 'system'].includes(saved.mode) ? saved.mode : 'light', scale: saved.scale != null ? Number(saved.scale) : 1, light: { ...d.light }, dark: { ...d.dark } };
    if (saved.light || saved.dark) { Object.assign(out.light, saved.light || {}); Object.assign(out.dark, saved.dark || {}); }
    else {   // older single-palette shape
      ['paper', 'ink', 'muted', 'line', 'tint1', 'tint2'].forEach(k => { if (saved[k]) out.light[k] = saved[k]; });
      if (saved.contactBg) { out.light.accent = saved.contactBg; out.light.contactBg = saved.contactBg; }
    }
    // older light palettes used grey for the main text — that looked washed out. Keep text near-black.
    const lum = hex => { const m = /^#?([0-9a-f]{6})$/i.exec(hex || ''); if (!m) return 0; const n = parseInt(m[1], 16); return (0.2126 * (n >> 16) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255; };
    if (lum(out.light.ink) > .3) out.light.ink = '#141211';
    if (lum(out.light.muted) > .55 || out.light.muted === out.light.ink) out.light.muted = '#5c5c5c';
    if (lum(out.light.contactText) > .3 && lum(out.light.contactBg) > .7) { out.light.contactBg = '#E8223E'; out.light.contactText = '#ffffff'; }
    return out;
  }
  // Mode: 'light', 'dark' or 'system' (follows each visitor's phone / computer setting, and switches live if they change it)
  const darkQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  const resolveMode = t => t.mode === 'system' ? ((darkQuery && darkQuery.matches) ? 'dark' : 'light') : t.mode;
  const varsOf = (pal, t) => {
    const v = {}; ['paper', 'ink', 'muted', 'line', 'accent', 'tint1', 'tint2'].forEach(k => v['--' + k] = pal[k]);
    return Object.assign(v, { '--surface': pal.paper, '--contact-bg': pal.contactBg, '--contact-text': pal.contactText, '--scale': String(t.scale) });
  };
  function applyTheme(t){
    const mode = resolveMode(t), pal = mode === 'dark' ? t.dark : t.light, r = document.documentElement.style;
    const vars = varsOf(pal, t); Object.keys(vars).forEach(k => r.setProperty(k, vars[k]));
    document.body.classList.toggle('dark', mode === 'dark');
    document.documentElement.classList.remove('predark');
    // remember both palettes + the mode so the next visit paints the right colours before anything else (no flash)
    try {
      localStorage.setItem('ferricool-mode', mode);
      localStorage.setItem('ferricool-theme-cache', JSON.stringify({ mode: t.mode, light: varsOf(t.light, t), dark: varsOf(t.dark, t) }));
    } catch (e) {}
  }
  const THEME = migrateTheme(draftOf(THEME_STORAGE_KEY) || REMOTE.theme);
  applyTheme(THEME);
  if (THEME.mode === 'system' && darkQuery) {
    const onChange = () => applyTheme(THEME);
    darkQuery.addEventListener ? darkQuery.addEventListener('change', onChange) : darkQuery.addListener(onChange);
  }
  requestAnimationFrame(() => document.documentElement.classList.remove('is-loading'));

  // scrolling logo strips on the dark theme: each logo is checked once — dark logos are flipped light so they show on
  // black, logos that are already light are only turned grey. Either way the logo keeps its own shapes and details.
  (function toneLogos(){
    const cache = new Map();
    const tone = img => {
      const src = img.currentSrc || img.src; if (!src) return;
      if (cache.has(src)) { img.classList.add(cache.get(src)); return; }
      try {
        const c = document.createElement('canvas'); c.width = c.height = 32; const g = c.getContext('2d', { willReadFrequently: true });
        g.drawImage(img, 0, 0, 32, 32); const d = g.getImageData(0, 0, 32, 32).data; let sum = 0, w = 0;
        for (let i = 0; i < d.length; i += 4) { const a = d[i + 3] / 255; if (a < .1) continue; sum += a * (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 255; w += a; }
        const cls = (w && sum / w > .55) ? 'is-light-logo' : 'is-dark-logo'; cache.set(src, cls); img.classList.add(cls);
      } catch (e) { img.classList.add('is-dark-logo'); }
    };
    $$('.logo-track img').forEach(img => img.complete && img.naturalWidth ? tone(img) : img.addEventListener('load', () => tone(img), { once: true }));
  })();

  const foot = $('.site-foot');
  if (foot && 'IntersectionObserver' in window) new IntersectionObserver(es => document.body.classList.toggle('foot-in', es[0].isIntersecting), { threshold: .05 }).observe(foot);

  // speed: marquees, the moving gallery, the lens rings and the signature only animate while on screen
  if ('IntersectionObserver' in window) {
    const pauser = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('is-paused', !e.isIntersecting)), { rootMargin: '120px 0px' });
    $$('.hero, .social-proof, .work, .signature, .links-section').forEach(el => pauser.observe(el));
  }

  // break-time games: after a few quiet minutes (or when the visitor goes offline) a small game pops up.
  // game.js is fetched quietly once the page has settled, so the games still work if the connection drops.
  (function breakGames(){
    const g = C.games || {}; if (g.enabled === false) return;
    const list = ['quiz', 'fonts', 'odd', 'memory', 'sudoku', 'words'].filter(k => g[k] !== false); if (!list.length) return;
    let ready = null;
    const load = () => ready || (ready = new Promise((res, rej) => { if (window.PortfolioGames) return res(); const s = document.createElement('script'); s.src = 'game.js?v=4'; s.onload = res; s.onerror = () => { ready = null; rej(); }; document.head.appendChild(s); }));
    (window.requestIdleCallback || (f => setTimeout(f, 2500)))(() => load().catch(() => {}));
    const wait = Math.max(1, Number(g.idleMinutes) || 5) * 60 * 1000;
    let t = null;
    const busy = () => (window.PortfolioGames && PortfolioGames.isOpen()) || document.querySelector('.modal.open, .lightbox.open, .pwpage.open');
    const show = offline => load().then(() => { if (!busy()) PortfolioGames.open({ games: list, title: g.title, offline, onClose: arm }); }).catch(() => {});
    // "Play a game" button in the header: opens the games any time
    const pb = $('#navPlay');
    if (pb) {
      pb.hidden = g.button === ''; const pl = $('#navPlayLabel'); if (pl && g.button) pl.textContent = g.button;
      pb.addEventListener('click', () => { $('#sitebar')?.classList.remove('open'); load().then(() => { if (!PortfolioGames.isOpen()) PortfolioGames.open({ games: list, title: g.title, onClose: arm }); }).catch(() => {}); });
    }
    const arm = () => { clearTimeout(t); t = setTimeout(() => { if (document.visibilityState === 'visible') show(false); else arm(); }, wait); };
    ['pointerdown', 'pointermove', 'keydown', 'scroll', 'touchstart', 'wheel'].forEach(ev => window.addEventListener(ev, () => { if (!(window.PortfolioGames && PortfolioGames.isOpen())) arm(); }, { passive: true }));
    if (g.offline !== false) window.addEventListener('offline', () => show(true));
    arm();
  })();

  // numbers in the social proof band count up once when they scroll into view ("80+" counts 0 → 80, keeps the "+")
  (function rollUp(){
    // social proof: when the band scrolls into view the label and numbers come in one after another,
    // then every digit rolls up from 0 to its value (one digit after the other), and the red line draws in.
    const band = $('#proof'); if (!band) return;
    const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    $$('.odo', band).forEach((el, si) => $$('.odo-d', el).forEach((d, di) => d.style.setProperty('--delay', (0.55 + si * 0.28 + di * 0.16) + 's')));
    if (!('IntersectionObserver' in window) || reduce) { band.classList.add('is-in', 'is-rolled'); return; }
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      band.classList.add('is-in'); requestAnimationFrame(() => requestAnimationFrame(() => band.classList.add('is-rolled'))); io.disconnect();
    }), { threshold: .35 });
    io.observe(band);
  })();

  // process steps + resource cards come in one after another as they scroll into view
  (function riseIn(){
    const els = $$('.pstep, .res-card, #process'); if (!els.length) return;
    if (!('IntersectionObserver' in window) || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) { els.forEach(e => e.classList.add('is-in')); return; }
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { threshold: .2 });
    els.forEach(e => io.observe(e));
  })();

  // the signature under About me writes itself when it scrolls into view
  (function(){ const el = $('#aboutSign'); if (!el) return;
    if (!('IntersectionObserver' in window)) { el.classList.add('is-in'); return; }
    const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { el.classList.add('is-in'); io.disconnect(); } }, { threshold: .6 }); io.observe(el); })();

  // ---- scroll motion ----
  // 1) as a section scrolls away it gently shrinks, rounds its corners and dims, so the next one seems to slide over it
  // 2) testimonials are a deck: each card sticks, and the ones underneath shrink back as the next card covers them
  // 3) big section headings reveal word by word
  // headings: the full stop at the end is always brand red (not the hero headline)
  (function redDots(){
    $$('.section-top p, .about h2, .contact h2, .experience h2, .proof-head p, .brief-head h1, .contact-intro h1, .case-thanks h2').forEach(h => {
      const walker = document.createTreeWalker(h, NodeFilter.SHOW_TEXT); let last = null; while (walker.nextNode()) if (walker.currentNode.textContent.trim()) last = walker.currentNode;
      if (!last || !/\.\s*$/.test(last.textContent) || last.parentElement.classList.contains('hd-dot')) return;
      const t = last.textContent.replace(/\.\s*$/, ''); last.textContent = t;
      const dot = document.createElement('span'); dot.className = 'hd-dot'; dot.textContent = '.'; last.parentNode.insertBefore(dot, last.nextSibling);
    });
  })();

  (function scrollMotion(){
    const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const stackSecs = $$('#proof, .about, #process, .social-proof, .work, #logofolio, .testimonials, .experience, #resources').filter(el => !el.hidden);
    stackSecs.forEach(el => el.classList.add('stack-sec'));
    const deck = $$('.testimonial-card');
    const grid = $('#testimonialGrid'); if (grid && deck.length) grid.classList.add('is-deck');
    deck.forEach((c, i) => c.style.setProperty('--n', i));
    $$('.section-top p, .about h2').forEach(h => {
      if (h.dataset.split) return; h.dataset.split = '1';
      const walk = node => [...node.childNodes].forEach(ch => {
        if (ch.nodeType === 3) { const frag = document.createDocumentFragment(); ch.textContent.split(/(\s+)/).forEach(w => { if (!w) return; if (/^\s+$/.test(w)) frag.appendChild(document.createTextNode(w)); else { const sp = document.createElement('span'); sp.className = 'wd'; sp.textContent = w; frag.appendChild(sp); } }); ch.replaceWith(frag); }
        else if (ch.nodeType === 1 && !ch.classList.contains('wd')) walk(ch);
      });
      walk(h); $$('.wd', h).forEach((w, i) => w.style.setProperty('--w', i)); h.classList.add('words');
    });
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.querySelectorAll('.wd').forEach((w, i) => w.style.setProperty('--w', Math.min(i, 16))); e.target.classList.add('words-in'); io.unobserve(e.target); } }), { threshold: .4 });
      $$('.words').forEach(h => io.observe(h));
    }
    let ticking = false;
    const update = () => {
      ticking = false; const vh = window.innerHeight;
      if (document.querySelector('.modal.open')) return;
      stackSecs.forEach(el => {
        const r = el.getBoundingClientRect();
        // starts when the section's bottom is in the top 60% of the screen, finishes as it leaves
        const p = Math.min(1, Math.max(0, (vh * .6 - r.bottom) / (vh * .6)));
        el.style.setProperty('--out', p.toFixed(3));
      });
      if (grid && deck.length > 1) {
        const top = parseFloat(getComputedStyle(grid).getPropertyValue('--deck-top')) || 110;
        deck.forEach((c, i) => {
          const next = deck[i + 1]; if (!next) { c.style.setProperty('--cover', 0); return; }
          const d = next.getBoundingClientRect().top - (top + (i + 1) * 14), h = c.offsetHeight || 1;
          c.style.setProperty('--cover', Math.min(1, Math.max(0, 1 - d / h)).toFixed(3));
        });
      }
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', onScroll, { passive: true }); window.addEventListener('resize', onScroll); update();
  })();

  // testimonials: cards rise in one after another when scrolled to, and tilt toward the cursor on hover (computers only)
  (function testimonialFx(){
    const cards = $$('.testimonial-card'); if (!cards.length) return;
    const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    cards.forEach((c, i) => c.style.setProperty('--i', i));
    if (!('IntersectionObserver' in window) || reduce) cards.forEach(c => c.classList.add('is-in'));
    else {
      const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { threshold: .2 });
      cards.forEach(c => io.observe(c));
    }
    if (reduce || !(window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches)) return;
    cards.forEach(c => {
      c.addEventListener('pointermove', e => {
        const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        c.style.setProperty('--rx', ((.5 - y) * 6).toFixed(2) + 'deg'); c.style.setProperty('--ry', ((x - .5) * 8).toFixed(2) + 'deg');
        c.style.setProperty('--mx', (x * 100).toFixed(1) + '%'); c.style.setProperty('--my', (y * 100).toFixed(1) + '%');
      });
      c.addEventListener('pointerleave', () => { c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg'); });
    });
  })();

  /* ============================================================
     SECTIONS — each one is a floating card around the lens, a frame in the moving
     gallery, and a page of its own. How the page lays out depends on the section:
       cases   → a vertical list of case studies; each opens its own page
       natural → pictures / PDFs at the size you uploaded them
       grid2   → two columns on a computer, one on a phone
       grid3   → three columns (two on a phone), good for logos
       stack   → one under another, optionally with no gaps
     Everything is edited in admin.html.
  ============================================================ */
  const CATEGORIES_KEY = 'ferricool-portfolio-categories';
  const LEGACY_PROJECTS_KEY = 'ferricool-portfolio-projects';
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

  const LAYOUTS = ['cases', 'books', 'book', 'natural', 'grid2', 'grid3', 'stack'];
  const PHOTOS = [
    'https://images.unsplash.com/photo-1518005020951-eccb494ad742',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
    'https://images.unsplash.com/photo-1483985988355-763728e1935b',
    'https://images.unsplash.com/photo-1518770660439-4636190af475',
    'https://images.unsplash.com/photo-1523726491678-bf852e717f6a',
  ];
  const photoUrl = (i, w = 1920, q = 82) => `${PHOTOS[((i % 5) + 5) % 5]}?auto=format&fit=crop&w=${w}&q=${q}`;
  const lockFields = o => { const r = {}; if (o.locked) { r.locked = true; if (o.enc) r.enc = o.enc; if (o.lockNote) r.lockNote = o.lockNote; if (o.password) r.password = o.password; } return r; };
  function migrateCase(s, i){
    const out = { id: s.id || ('case-' + (i + 1)), title: s.title || ('Case study ' + (i + 1)), cover: s.cover || s.image || '', tagline: s.tagline != null ? s.tagline : (s.desc || ''), bg: s.bg || '', tight: s.tight !== false };
    let blocks = s.blocks;
    if (!Array.isArray(blocks)) { const w = s.works && s.works[0] && s.works[0].blocks; blocks = Array.isArray(w) ? w : ((s.locked && s.enc) ? undefined : []); }
    if (blocks) out.blocks = blocks;
    if (Array.isArray(s.details)) out.details = s.details.map(d => ({ label: String(d.label || ''), value: String(d.value || '') }));
    return Object.assign(out, lockFields(s));
  }
  function makeDefaultCategories(){
    const caseStudy = n => ({ id: 'case-' + n, title: 'Case study ' + n, cover: PHOTOS[(n - 1) % 5], tagline: 'A short line about this case study.', bg: '', tight: true, blocks: [
      { type: 'text', heading: 'About this case study', body: 'Tell the story in a few lines — the brief, the thinking, the result. Delete this block if you want the pictures to speak for themselves.' },
      { type: 'image', src: photoUrl(n) }, { type: 'image', src: photoUrl(n + 1) }, { type: 'image', src: photoUrl(n + 2) } ] });
    const pics = (list, w = 1920) => list.map(i => ({ type: 'image', src: photoUrl(i, w) }));
    return [
      { id: 'cat-case', title: 'Case study', layout: 'cases', image: PHOTOS[0], intro: 'Selected projects, told from the brief to the result.', bg: '', tight: true, tile: false, items: [caseStudy(1), caseStudy(2), caseStudy(3)] },
      { id: 'cat-editorial', title: 'Editorial', layout: 'natural', image: PHOTOS[2], intro: 'Pages, spreads and documents — shown at the size they were made.', bg: '', tight: false, tile: false, items: pics([2, 3, 4]) },
      { id: 'cat-campaign', title: 'Campaign ads', layout: 'grid2', image: PHOTOS[1], intro: 'Social media and campaign creatives.', bg: '', tight: false, tile: false, items: pics([0, 1, 2, 3, 4, 0], 1200) },
      { id: 'cat-logo', title: 'Logo folio', layout: 'grid3', image: PHOTOS[3], intro: 'A selection of marks and identities.', bg: '', tight: false, tile: true, items: pics([0, 1, 2, 3, 4, 1], 900) },
      { id: 'cat-events', title: 'Events branding', layout: 'stack', image: PHOTOS[4], intro: 'Identity, signage and collateral for events.', bg: '', tight: true, tile: false, items: pics([4, 0, 1]) },
    ];
  }
  function migrateCategories(list){
    return list.map((c, i) => {
      const layout = LAYOUTS.includes(c.layout) ? c.layout : 'stack';
      const out = { id: c.id || ('cat-' + (i + 1)), title: c.title || ('Section ' + (i + 1)), layout, image: c.image || '', intro: c.intro || '', bg: c.bg || '', tight: c.tight !== false, tile: !!c.tile, brief: c.brief || '' };
      let items = c.items;
      if (!Array.isArray(items)) items = (c.locked && c.enc) ? undefined : [];
      if (items) out.items = (layout === 'cases' || layout === 'books') ? items.map(migrateCase) : items;
      return Object.assign(out, lockFields(c));
    });
  }
  // Older sites had one flat list of "projects": they become case studies under the first section.
  function categoriesFromLegacyProjects(projects){
    const cases = projects.map(migrateCase);
    const rest = makeDefaultCategories().slice(1).map(c => ({ ...c, items: [] }));
    return [{ id: 'cat-case', title: 'Case study', layout: 'cases', image: '', intro: '', bg: '', tight: true, tile: false, items: cases }, ...rest];
  }
  function loadCategories(){
    const saved = draftOf(CATEGORIES_KEY) || REMOTE.categories;
    if (Array.isArray(saved) && saved.length) return migrateCategories(JSON.parse(JSON.stringify(saved)));
    const legacy = draftOf(LEGACY_PROJECTS_KEY) || REMOTE.projects;
    if (Array.isArray(legacy) && legacy.length) return migrateCategories(categoriesFromLegacyProjects(JSON.parse(JSON.stringify(legacy))));
    return makeDefaultCategories();
  }
  const CATEGORIES = loadCategories();
  // the live site never shows the stock placeholder photos — only pictures you uploaded.
  // (your saved content is untouched; admin still lists everything)
  (function dropStock(){
    const stock = u => /images\.unsplash\.com/.test(u || '');
    const clean = list => (list || []).filter(b => !(b && b.type === 'image' && stock(b.src)));
    CATEGORIES.forEach(c => {
      if (stock(c.image)) c.image = '';
      if (!Array.isArray(c.items)) return;
      if (c.layout === 'cases' || c.layout === 'books') c.items.forEach(s => { if (stock(s.cover)) s.cover = ''; if (Array.isArray(s.blocks)) s.blocks = clean(s.blocks); });
      else c.items = clean(c.items);
    });
  })();
  /* ---------- every page: header, portrait, CV, soft particles ---------- */
  const bar = $('#sitebar');
  if (bar) {
    const syncBar = () => bar.classList.toggle('is-scrolled', window.scrollY > 4);
    syncBar(); window.addEventListener('scroll', syncBar, { passive: true });
    const burger = $('#sbBurger');
    const closeMenu = () => { bar.classList.remove('open'); burger?.setAttribute('aria-expanded', 'false'); };
    burger?.addEventListener('click', () => { const o = bar.classList.toggle('open'); burger.setAttribute('aria-expanded', String(o)); });
    bar.addEventListener('click', e => { if (e.target.closest('.sb-links a, .sb-cta')) closeMenu(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  }

  $$('.portrait').forEach(p => {
    const toggle = () => p.classList.toggle('is-color');
    p.addEventListener('click', toggle);
    p.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
  });

  // CV: the file is set in admin → Content → About. A draft (data URL) is turned into a temporary link first.
  const cvUrl = () => (C.about && C.about.cvFile) || '';
  const fileUrlFor = async url => url.startsWith('data:') ? URL.createObjectURL(await (await fetch(url)).blob()) : url;
  $('#viewCV')?.addEventListener('click', async e => {
    e.preventDefault(); const u = cvUrl(); if (!u) return;
    window.open(u.startsWith('data:') ? await fileUrlFor(u) : u, '_blank', 'noopener');
  });
  $('#downloadCV')?.addEventListener('click', async () => {
    const u = cvUrl(); if (!u) return;
    const a = document.createElement('a'); a.href = await fileUrlFor(u);
    a.download = (String((C.signature && C.signature.name) || 'cv').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'cv') + '-cv.pdf';
    document.body.appendChild(a); a.click(); a.remove();
  });

  // Tiny particles that bloom where the cursor moves / lands. Subtle; switch off in admin → Content → Effects.
  const reduceMotion = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!(C.effects && C.effects.particles === false) && !reduceMotion) {
    const cv = document.createElement('canvas'); cv.id = 'fx'; cv.setAttribute('aria-hidden', 'true'); document.body.appendChild(cv);
    const g = cv.getContext && cv.getContext('2d');
    if (g) {
      let W = 0, H = 0, raf = null, last = 0, lastMove = 0; const ps = [];
      const resize = () => { const dpr = Math.min(window.devicePixelRatio || 1, 2); W = window.innerWidth; H = window.innerHeight; cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px'; g.setTransform(dpr, 0, 0, dpr, 0, 0); };
      resize(); window.addEventListener('resize', resize);
      const accent = () => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#E8223E';
      function tick(t){
        const dt = Math.min(40, t - (last || t)); last = t; g.clearRect(0, 0, W, H);
        for (let i = ps.length - 1; i >= 0; i--) {
          const p = ps[i]; p.life += dt;
          if (p.life >= p.max) { ps.splice(i, 1); continue; }
          const k = p.life / p.max; p.x += p.vx * dt / 16; p.y += p.vy * dt / 16; p.vx *= .985; p.vy *= .985;
          g.globalAlpha = (1 - k) * .55; g.fillStyle = p.col; g.beginPath(); g.arc(p.x, p.y, p.r + p.g * k, 0, 6.2832); g.fill();
        }
        g.globalAlpha = 1;
        if (ps.length) raf = requestAnimationFrame(tick); else { raf = null; last = 0; }
      }
      const spawn = (x, y, n, burst) => {
        const col = accent();
        for (let i = 0; i < n; i++) {
          const a = Math.random() * 6.2832, sp = burst ? .6 + Math.random() * 1.6 : .15 + Math.random() * .5;
          ps.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: .8 + Math.random() * 1.4, g: (burst ? 2.2 : 1.2) + Math.random() * 2, life: 0, max: (burst ? 700 : 900) + Math.random() * 500, col });
        }
        if (ps.length > 160) ps.splice(0, ps.length - 160);
        if (!raf) raf = requestAnimationFrame(tick);
      };
      window.addEventListener('pointermove', e => { const now = performance.now(); if (e.pointerType === 'touch' || now - lastMove < 45) return; lastMove = now; spawn(e.clientX, e.clientY, 1, false); }, { passive: true });
      window.addEventListener('pointerdown', e => spawn(e.clientX, e.clientY, e.pointerType === 'touch' ? 12 : 10, true), { passive: true });
    }
  }

  /* ============================================================
     Everything below belongs to the homepage layout (lens, floating cards,
     moving gallery, section pages). One guard, so a page like contact.html
     that has none of those elements skips all of it cleanly.
  ============================================================ */
  if ($('#stage')) {
    const pad2 = n => String(n).padStart(2, '0');
    const BLANK = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="4" height="3"><rect width="4" height="3" fill="#d9d4ca"/></svg>');
    const imgW = (src, w, q = 85) => (src && /^https?:\/\/images\.unsplash\.com/.test(src)) ? `${src}${src.includes('?') ? '&' : '?'}auto=format&fit=crop&w=${w}&q=${q}` : (src || BLANK);
    const firstImage = list => { const b = (list || []).find(x => x.type === 'image' && x.src); return b ? b.src : ''; };
    const caseCover = s => s.cover || firstImage(s.blocks) || titleCard(s.title);
    // a section's own first picture beats a leftover stock placeholder photo as its card / gallery cover
    const isStock = u => /images\.unsplash\.com/.test(u || '');
    const ownCover = c => (c.layout === 'cases' || c.layout === 'books') ? ((c.items || []).map(s => s.cover || firstImage(s.blocks)).find(Boolean) || '') : firstImage(c.items);
    const catCover = c => (c.image && !isStock(c.image)) ? c.image : (ownCover(c) || c.image || '');
    const flag = c => c.locked ? '🔒 Locked' : 'Open ↗';
    // empty sections (nothing uploaded yet) show their title card, not a leftover stock photo
    const isEmpty = c => !c.locked && Array.isArray(c.items) && !c.items.length;
    // a section with no pictures yet gets a clean title card instead of a grey box
    const darkUI = document.body.classList.contains('dark');
    const titleCard = t => 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="${darkUI ? '#18181a' : '#f2f2f2'}"/><circle cx="400" cy="240" r="7" fill="#E8223E"/><text x="400" y="330" text-anchor="middle" font-family="Manrope,Arial,sans-serif" font-weight="700" font-size="56" letter-spacing="-2" fill="${darkUI ? '#f2f2f2' : '#141211'}">${esc(t || '')}</text><text x="400" y="384" text-anchor="middle" font-family="Arial,sans-serif" font-size="20" letter-spacing="3" fill="#8a8a8a">COMING SOON</text></svg>`);
    const coverOf = c => (isEmpty(c) ? '' : catCover(c)) || titleCard(c.title);

    /* ---------- floating cards: the first five sections (drag them around; click to open) ---------- */
    const featured = CATEGORIES.slice(0, 5);
    $('#cards').innerHTML = featured.map((c, i) => `
      <article class="card slot${i}${isEmpty(c) ? ' is-empty' : ''}" data-id="${esc(c.id)}">
        <img src="${esc(imgW(coverOf(c), 480))}" alt="${esc(c.title)}" draggable="false">
        <div class="card-meta"><span>${pad2(i + 1)}</span><span>${flag(c)}</span></div>
        <div class="card-title">${esc(c.title)}</div>
      </article>`).join('');
    const cards = $$('.card');
    cards.forEach(card => {
      let sx = 0, sy = 0, dx = 0, dy = 0, down = false, moved = false;
      card._reset = () => { dx = 0; dy = 0; card.style.removeProperty('--dx'); card.style.removeProperty('--dy'); };
      card.addEventListener('pointerdown', e => { if (!card.classList.contains('show')) return; down = true; moved = false; sx = e.clientX; sy = e.clientY; try { card.setPointerCapture(e.pointerId); } catch (_) {} });
      card.addEventListener('pointermove', e => {
        if (!down) return; const mx = e.clientX - sx, my = e.clientY - sy;
        if (!moved && Math.hypot(mx, my) < 6) return;
        moved = true; card.classList.add('dragging'); card.style.setProperty('--dx', (dx + mx) + 'px'); card.style.setProperty('--dy', (dy + my) + 'px');
      });
      const end = e => { if (!down) return; down = false; if (moved) { dx += e.clientX - sx; dy += e.clientY - sy; card.classList.remove('dragging'); } };
      card.addEventListener('pointerup', end); card.addEventListener('pointercancel', end);
      card.addEventListener('click', () => { if (moved) { moved = false; return; } openCategory(card.dataset.id); });
    });

    /* ---------- moving gallery: every section ---------- */
    const galleryEl = $('#autoGallery');
    const oneSet = Array.from({ length: Math.max(1, Math.ceil(6 / CATEGORIES.length)) }, () => CATEGORIES).flat();
    const frame = c => `
      <article class="gallery-frame${isEmpty(c) ? ' is-empty' : ''}" data-id="${esc(c.id)}">
        <img src="${esc(imgW(coverOf(c), 700, 85))}" alt="${esc(c.title)}" loading="lazy" decoding="async">
        <div class="gf-cap"><span>${pad2(CATEGORIES.indexOf(c) + 1)}${c.locked ? ' · 🔒' : ''}</span><strong>${esc(c.title)}</strong></div>
      </article>`;
    galleryEl.innerHTML =
      `<div class="gallery-row row-a">${[...oneSet, ...oneSet].map(frame).join('')}</div>` +
      `<div class="gallery-row row-b">${[...oneSet.slice().reverse(), ...oneSet.slice().reverse()].map(frame).join('')}</div>` +
      `<div class="gallery-cursor" id="galleryCursor" aria-hidden="true"><span>View</span></div>`;
    galleryEl.addEventListener('click', e => {
      const f = e.target.closest('.gallery-frame, .pp-card, .og-card'); if (!f) return;
      if (f.dataset.id) { openCategory(f.dataset.id); return; }
      if (f.dataset.pic !== undefined && f.dataset.pic !== '') {   // a globe picture that isn't in a section: open it big
        const list = window.__globeExtra || []; currentImages = list.map(x => x.logo); caseTitle.textContent = (list[Number(f.dataset.pic)] || {}).name || 'Selected work';
        openLightbox(Number(f.dataset.pic));
      }
    });
    // Pop Parade (default) — the gallery as a looping motion piece; 'marquee' keeps the two moving rows
    const gStyle = (C.work || {}).galleryStyle || 'globe';
    if (gStyle === 'globe' && window.OrbitGlobe) {
      const withPics = CATEGORIES.filter(x => !isEmpty(x)), list = withPics.length >= 3 ? withPics : CATEGORIES;
      const cur = galleryEl.querySelector('#galleryCursor');
      // only your own uploaded pictures — no stock placeholders, nothing from locked sections
      const ownPics = cat => { const out = []; const walk = (o, k) => {
        if (Array.isArray(o)) o.forEach(v => walk(v, k));
        else if (o && typeof o === 'object') Object.keys(o).forEach(kk => walk(o[kk], kk));
        else if (typeof o === 'string' && /^(src|cover|image|pages|poster)$/.test(k || '') && o && !isStock(o) && !/^data:/.test(o) && !/\.(mp4|mov|webm|m4v|pdf)(\?|$)/i.test(o) && !out.includes(o)) out.push(o);
      }; walk(cat); return out; };
      let pics = CATEGORIES.filter(x => !x.locked).flatMap(x => ownPics(x).map(src => ({ id: x.id, title: x.title, src })));
      // plus the pictures you added under admin → Work / gallery → More pictures on the globe (they open in the picture viewer)
      const extraList = ((C.globeExtra || {}).items || []).filter(x => x && x.logo && !isStock(x.logo));
      pics = pics.concat(extraList.map((x, i) => ({ id: '', pic: i, title: x.name || '', src: x.logo })));
      window.__globeExtra = extraList;
      { const seenSrc = new Set(); pics = pics.filter(p => !seenSrc.has(p.src) && seenSrc.add(p.src)); }   // each picture once, even if it sits in two sections
      if (!pics.length) pics = list.filter(x => !x.locked).map(x => ({ id: x.id, title: x.title, src: titleCard(x.title) }));   // nothing uploaded yet: clean title cards
      window.OrbitGlobe(galleryEl, pics, { hint: (C.work || {}).globeHint });
      if (cur) galleryEl.appendChild(cur);
    } else if (gStyle === 'parade' && window.PopParade) {
      const withPics = CATEGORIES.filter(x => !isEmpty(x)), list = withPics.length >= 3 ? withPics : CATEGORIES;
      const cur = galleryEl.querySelector('#galleryCursor');
      window.PopParade(galleryEl, list.map(x => ({ id: x.id, title: x.title, src: imgW(coverOf(x), 700, 85) })), { rate: (v => v > 3 ? ({ 16: .7, 28: 1, 42: 1.25, 60: 1.5 }[v] || 1) : (v || 1))(Number((C.work || {}).gallerySpeed)) });
      if (cur) galleryEl.appendChild(cur);
    }
    const galleryCursor = $('#galleryCursor');
    const supportsHover = typeof window.matchMedia === 'function' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (galleryCursor && supportsHover) {
      galleryEl.addEventListener('pointermove', e => { const r = galleryEl.getBoundingClientRect(); galleryCursor.style.left = (e.clientX - r.left) + 'px'; galleryCursor.style.top = (e.clientY - r.top) + 'px'; });
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
      o.frequency.setValueAtTime(Math.max(35, base), t); o.frequency.exponentialRampToValueAtTime(Math.max(35, end), t + .075);
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

    /* ---------- page scrolling is locked while the lens is open or a page / viewer is showing ---------- */
    const modal = $('#modal'), modalBox = $('.modal-box'), lightbox = $('#lightbox'), pwDialog = $('#pwDialog');
    let revealed = false;
    function updateScroll(){
      const lock = revealed || modal.classList.contains('open') || lightbox.classList.contains('open') || pwDialog.classList.contains('open');
      document.documentElement.style.overflow = lock ? 'hidden' : ''; document.body.style.overflow = lock ? 'hidden' : '';
    }
    const blockScroll = e => { if (revealed && !modal.classList.contains('open') && !lightbox.classList.contains('open') && !pwDialog.classList.contains('open')) e.preventDefault(); };
    window.addEventListener('wheel', blockScroll, { passive: false });
    window.addEventListener('touchmove', blockScroll, { passive: false });

    /* ---------- lens: tap to reveal, tap again to collapse ---------- */
    const lens = $('#lens'), lensImg = $('#lensImg'), zoomValue = $('#zoomValue'), hero = $('.hero');
    // the page already starts loading the lens picture itself (index.html) — only swap it if admin set a different one
    const wantLens = (C.hero && C.hero.lensImage) ? C.hero.lensImage : imgW(catCover(CATEGORIES[0] || {}), 900);
    if (lensImg.getAttribute('src') !== wantLens) lensImg.src = wantLens;
    lensImg.decoding = 'async'; try { lensImg.fetchPriority = 'high'; } catch (e) {}
    // remember it so the next visit starts downloading it before anything else
    try { if (!String(lensImg.src).startsWith('data:')) localStorage.setItem('ferricool-lens', lensImg.getAttribute('src')); } catch (e) {}
    let zoom = 0, zoomAnim = null;
    function setZoom(next){
      const prev = zoom; zoom = Math.max(0, Math.min(5, next));
      const eased = zoom / 5;
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
      revealed = on; lens.setAttribute('aria-pressed', String(on)); animateZoomTo(on ? 5 : 0); updateScroll();
      if (!on) cards.forEach(c => c._reset && c._reset());
      if (on && window.innerWidth <= 800 && lens.scrollIntoView) {
        // on a phone the area grows as it opens, so keep the lens centred on screen while it does
        lens.scrollIntoView({ block: 'center' }); setTimeout(() => { if (revealed) lens.scrollIntoView({ block: 'center' }); }, 1150);
      }
    }
    lens.addEventListener('click', e => { e.stopPropagation(); initSound(); setRevealed(!revealed); });
    lens.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); initSound(); setRevealed(!revealed); } });
    hero.addEventListener('click', e => { if (revealed && !e.target.closest('.card, .lens')) setRevealed(false); });
    // anything that would scroll the page away (header links) closes the lens first
    bar?.addEventListener('click', e => { if (revealed && e.target.closest('a')) { e.preventDefault(); setRevealed(false); } }, true);
    setZoom(0);

    /* ---------- password page for locked sections / case studies ---------- */
    const pwForm = $('#pwForm'), pwInput = $('#pwInput'), pwError = $('#pwError');
    let pwState = null;
    function closePw(result){
      pwDialog.classList.remove('open'); pwDialog.setAttribute('aria-hidden', 'true'); updateScroll();
      if (pwState) { const r = pwState.resolve; pwState = null; r(result); }
    }
    function askPassword(node, field){
      return new Promise(resolve => {
        $('#pwTitle').textContent = node.title;
        $('#pwNote').textContent = node.lockNote || 'This work is private. Enter the password to view it.';
        pwError.textContent = ''; pwInput.value = '';
        pwDialog.classList.add('open'); pwDialog.setAttribute('aria-hidden', 'false'); updateScroll();
        pwState = { node, field, resolve }; setTimeout(() => pwInput.focus(), 50);
      });
    }
    function applyDecrypted(node, field, data){
      if (field === 'items') node.items = (Array.isArray(data.items) ? data.items : []).map((x, i) => (node.layout === 'cases' || node.layout === 'books') ? migrateCase(x, i) : x);
      else { node.blocks = Array.isArray(data.blocks) ? data.blocks : []; if (Array.isArray(data.details)) node.details = data.details; }
      node._unlocked = true;
    }
    pwForm.addEventListener('submit', async e => {
      e.preventDefault(); if (!pwState) return;
      if (!(window.crypto && crypto.subtle)) { pwError.textContent = 'This browser cannot unlock private work here.'; return; }
      try {
        const { node, field } = pwState;
        applyDecrypted(node, field, await decryptJSON(node.enc, pwInput.value));
        try { sessionStorage.setItem('unlock:' + node.id, pwInput.value); } catch (err) {}
        closePw(true);
      } catch (err) { pwError.textContent = 'Wrong password'; pwInput.select(); }
    });
    $('#pwCancel').addEventListener('click', () => closePw(false));
    async function ensureUnlocked(node, field){
      if (!(node.locked && node.enc) || node._unlocked) return true;
      let saved = null; try { saved = sessionStorage.getItem('unlock:' + node.id); } catch (e) {}
      if (saved && window.crypto && crypto.subtle) {
        try { applyDecrypted(node, field, await decryptJSON(node.enc, saved)); return true; } catch (e) {}
      }
      return askPassword(node, field);
    }

    /* ---------- section pages and case-study pages ---------- */
    const mmeta = $('#mmeta'), modalBody = $('#modalBody'), caseTitle = $('#caseTitle'), caseTagline = $('#caseTagline');
    const caseDetails = $('#caseDetails');
    // the "Client / Industry / Country / Year …" block at the top of a case study; empty rows are skipped
    function renderDetails(list){
      const rows = (list || []).filter(d => String(d.label || '').trim() && String(d.value || '').trim());
      // small bold label on top, the answer underneath; long answers (like a project scope) take two columns
      caseDetails.innerHTML = rows.map(d => `<div${String(d.value).length > 34 ? ' class="wide"' : ''}><dt>${esc(String(d.label).trim().replace(/[:：]\s*$/, ''))}</dt><dd>${esc(d.value)}</dd></div>`).join('');
      caseDetails.hidden = !rows.length;
    }
    const caseSections = $('#caseSections'), caseMore = $('#caseMore'), caseNext = $('#caseNext'), backBtn = $('#backProject');
    let view = null, revealObserver = null, currentImages = [];

    function armReveals(root){
      if (!('IntersectionObserver' in window)) { $$('.reveal', root).forEach(el => el.classList.add('is-visible')); return; }
      if (!revealObserver) {
        revealObserver = new IntersectionObserver(entries => entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-visible'); revealObserver.unobserve(en.target); } }), { root: modalBody, threshold: .12, rootMargin: '0px 0px -8% 0px' });
      }
      root.querySelectorAll('.reveal').forEach(el => { el.classList.remove('is-visible'); revealObserver.observe(el); });
    }
    // A page can have its own background colour; text colours flip automatically so it stays readable.
    function applyPageBg(bg){
      const keys = ['--paper', '--ink', '--muted', '--line'];
      if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(bg || '')) { keys.forEach(k => modalBox.style.removeProperty(k)); return; }
      let h = bg.slice(1); if (h.length === 3) h = h.split('').map(x => x + x).join('');
      const [r, g, b] = [0, 2, 4].map(i => parseInt(h.substr(i, 2), 16));
      const dark = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 < .5;
      // on the dark theme a light custom background is skipped, so pages stay black like the rest of the site
      if (!dark && document.body.classList.contains('dark')) { keys.forEach(k => modalBox.style.removeProperty(k)); return; }
      modalBox.style.setProperty('--paper', bg); modalBox.style.setProperty('--ink', dark ? '#faf6ee' : '#141211');
      modalBox.style.setProperty('--muted', dark ? 'rgba(250,246,238,.62)' : 'rgba(20,18,17,.6)'); modalBox.style.setProperty('--line', dark ? 'rgba(250,246,238,.16)' : 'rgba(20,18,17,.12)');
    }
    function blocksHTML(blocks){
      return (blocks || []).map(b => {
        // caption under a picture / video / PDF: heading ("About this piece" if a long caption has none) + one wide column of text
        const capText = String(b.caption || '').trim(), capHead = String(b.captionTitle || '').trim() || (capText.length > 160 ? 'About this piece' : '');
        const cap = (capText || capHead) ? `<figcaption class="pcap${capText.length > 380 ? ' is-long' : ''}">${capHead ? `<strong>${esc(capHead)}</strong>` : ''}${capText ? `<span>${esc(capText)}</span>` : ''}</figcaption>` : '';
        if (b.type === 'image') { currentImages.push(b.src); return `<figure class="pimg" data-lb="${currentImages.length - 1}"><img src="${esc(b.src)}" alt="" loading="lazy" decoding="async">${cap}</figure>`; }
        if (b.type === 'pdf') return `<div class="ppdf"><iframe data-pdf="${esc(b.src)}" title="PDF document"></iframe><a class="ppdf-open" data-pdf-link="${esc(b.src)}" href="${b.src.startsWith('data:') ? '#' : esc(b.src)}" target="_blank" rel="noopener">Open PDF ↗</a>${cap}</div>`;
        if (b.type === 'video') return `<div class="pvideo"><video src="${esc(b.src)}" controls playsinline preload="metadata"></video>${cap}</div>`;
        return `<div class="ptext reveal${String(b.body || '').length > 420 ? ' is-long' : ''}"><h3>${esc(b.heading)}</h3><p>${esc(b.body)}</p>${(b.tags && b.tags.length) ? `<div class="case-tags"><ul>${b.tags.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>` : ''}</div>`;
      }).join('');
    }
    async function fillPdfs(){
      for (const f of $$('iframe[data-pdf]', caseSections)) { const u = f.dataset.pdf; f.src = u.startsWith('data:') ? await fileUrlFor(u) : u + '#view=FitH'; }
      for (const a of $$('a[data-pdf-link]', caseSections)) { const u = a.dataset.pdfLink; if (u.startsWith('data:')) a.href = await fileUrlFor(u); }
    }
    // which questionnaire fits a section (admin can pick one; otherwise guessed from the section name)
    const BRIEF_LABEL = { branding: 'brand identity', logo: 'logo', editorial: 'editorial', events: 'event branding', eventdesign: 'event design', campaign: 'campaign' };
    function briefFor(cat){
      if (cat.brief === 'none') return '';
      if (cat.brief && BRIEF_LABEL[cat.brief]) return cat.brief;
      const t = String(cat.title || '').toLowerCase();
      return /logo/.test(t) ? 'logo' : /editor|magazine|book/.test(t) ? 'editorial' : /campaign|ad|social/.test(t) ? 'campaign' : /event/.test(t) ? (/design|flyer/.test(t) ? 'eventdesign' : 'events') : /case|brand/.test(t) ? 'branding' : '';
    }
    function briefCTA(cat){
      const k = briefFor(cat); if (!k) return '';
      return `<a class="brief-cta reveal" href="brief.html?type=${k}"><span><small>Want something like this?</small><strong>Start your ${BRIEF_LABEL[k]} questionnaire</strong></span><i aria-hidden="true">→</i></a>`;
    }
    // a quiet "more work" row: small thumbnails, clearly labelled, so it doesn't look like part of the project
    function moreHTML(title, list, kind, skip){
      const others = list.map((x, i) => ({ x, i })).filter(o => o.i !== skip);
      if (!others.length) return '';
      return `<div class="pmore reveal"><div class="pmore-head"><span class="pmore-rule"></span><h4>${esc(title)}</h4><span class="pmore-rule"></span></div><div class="pmore-row">${others.slice(0, 6).map(o => `
        <button class="pmore-card" type="button" data-kind="${kind}" data-i="${o.i}"><img src="${esc(imgW(kind === 'cat' ? coverOf(o.x) : caseCover(o.x), 360))}" alt="" loading="lazy"><span>${esc(o.x.title)}${o.x.locked ? ' 🔒' : ''}</span></button>`).join('')}</div></div>`;
    }
    function finish(){ modalBody.scrollTop = 0; armReveals(modalBody); fillPdfs(); }

    /* ---------- BOOK layout: the cover on its own, then pages side by side that flip like a real book ----------
       Uses page-flip (assets/vendor, MIT). Drag a corner, tap a page edge, use the arrows / ← → keys, or swipe.
       A soft paper sound plays on every turn (made in the browser, no sound file). "All pages" shows the spreads
       one under another instead. On phones the book shows one page at a time. */
    let book = null, bookSound = true, bookResize = null;
    const loadScript = (src) => new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
    function bookHTML(pages){
      const spreads = [`<div class="pspread cover"><figure class="pimg" data-lb="${currentImages.push(pages[0].src) - 1}"><img src="${esc(pages[0].src)}" alt="" loading="lazy" decoding="async"></figure></div>`];
      for (let i = 1; i < pages.length; i += 2) spreads.push(`<div class="pspread">${pages.slice(i, i + 2).map(p => `<figure class="pimg" data-lb="${currentImages.push(p.src) - 1}"><img src="${esc(p.src)}" alt="" loading="lazy" decoding="async"></figure>`).join('')}</div>`);
      return `<div class="pbook-bar">
          <button class="modal-nav" type="button" data-book="prev" aria-label="Previous page">←</button>
          <span class="pbook-count" id="bookCount">Cover</span>
          <button class="modal-nav" type="button" data-book="next" aria-label="Next page">→</button>
          <span class="pbook-sep"></span>
          <button class="modal-nav" type="button" data-book="sound" aria-pressed="true">Sound on</button>
          <button class="modal-nav" type="button" data-book="view">All pages</button>
        </div>
        <div class="pbook-stage" id="bookStage"><div class="pbook" id="bookEl">${pages.map(p => `<div class="pbook-page"><img src="${esc(p.src)}" alt="" decoding="async" draggable="false"></div>`).join('')}</div>
          <p class="pbook-hint">Drag a corner or tap the edge of a page to turn it</p></div>
        <div class="pspreads" id="bookSpreads" hidden>${spreads.join('')}</div>`;
    }
    function pageSound(){
      if (!bookSound) return; const ctx = initSound(); if (!ctx) return;
      const t = ctx.currentTime, len = Math.floor(ctx.sampleRate * .42), buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
      // paper: soft noise that swells and dies away, with a few tiny crackles
      for (let i = 0; i < len; i++) { const k = i / len, env = Math.pow(Math.sin(Math.PI * Math.min(1, k * 1.25)), 1.6) * (1 - k * .5); d[i] = (Math.random() * 2 - 1) * env * (Math.random() < .002 ? 3.2 : 1); }
      const src = ctx.createBufferSource(); src.buffer = buf;
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = .7; bp.frequency.setValueAtTime(900, t); bp.frequency.exponentialRampToValueAtTime(3200, t + .22); bp.frequency.exponentialRampToValueAtTime(1400, t + .42);
      const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 300;
      const g = ctx.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.16, t + .06); g.gain.exponentialRampToValueAtTime(.0001, t + .42);
      src.connect(bp); bp.connect(hp); hp.connect(g); g.connect(ctx.destination); src.start(t); src.stop(t + .43);
    }
    function destroyBook(){ if (book) { try { book.destroy(); } catch (e) {} book = null; } if (bookResize) { window.removeEventListener('resize', bookResize); bookResize = null; } }
    async function startBook(pages){
      destroyBook();
      const stage = $('#bookStage'), el = $('#bookEl'); if (!stage || !el) return;
      try { if (!(window.St && St.PageFlip)) await Promise.race([loadScript('assets/vendor/page-flip.browser.js?v=1'), new Promise((_, r) => setTimeout(() => r(new Error('slow')), 8000))]); } catch (e) { showSpreadsInstead(); return; }
      // page shape comes from the cover picture
      const ratio = await new Promise(res => { const im = new Image(); im.onload = () => res(im.naturalWidth / im.naturalHeight || .71); im.onerror = () => res(.71); im.src = pages[0].src; });
      const fit = () => {   // biggest book that fits the screen: two pages wide on computers, one on phones
        const two = window.innerWidth > 800, maxW = Math.min(stage.parentElement.clientWidth, 1200), maxH = Math.max(320, Math.min(860, window.innerHeight - (two ? 170 : 210)));
        let pw = two ? maxW / 2 : maxW, ph = pw / ratio; if (ph > maxH) { ph = maxH; pw = ph * ratio; }
        stage.style.setProperty('--book-w', Math.floor(two ? pw * 2 : pw) + 'px'); stage.style.setProperty('--book-h', Math.floor(ph) + 'px');
        return { pw: Math.floor(pw), ph: Math.floor(ph) };
      };
      const { pw, ph } = fit();
      const twoUp = window.innerWidth > 800;
      try {
      book = new St.PageFlip(el, { width: pw, height: ph, size: 'stretch', minWidth: twoUp ? 160 : Math.ceil(pw * .8), maxWidth: 2000, minHeight: 220, maxHeight: 2600,
        showCover: true, usePortrait: true, mobileScrollSupport: false, flippingTime: 900, maxShadowOpacity: .45, drawShadow: true, startZIndex: 2, autoSize: true });
      book.loadFromHTML(el.querySelectorAll('.pbook-page'));
      const n = pages.length, label = () => {
        const i = book.getCurrentPageIndex(), single = book.getOrientation && book.getOrientation() === 'portrait';
        $('#bookCount').textContent = i === 0 ? `Cover · ${n} pages` : (single || i >= n - 1 ? `Page ${i + 1} of ${n}` : `Pages ${i + 1}–${i + 2} of ${n}`);
        // a closed book sits in the middle: the cover (and a lone back page) slide to the centre of the stage
        stage.classList.toggle('at-cover', !single && i === 0); stage.classList.toggle('at-back', !single && i > 0 && i >= n - 1 && n % 2 === 0);
      };
      let lastState = '';
      book.on('changeState', e => { if (e.data === 'flipping' && lastState !== 'flipping') pageSound(); lastState = e.data; });
      book.on('flip', label); label();
      bookResize = () => fit(); window.addEventListener('resize', bookResize);
      stage.classList.add('is-ready');
      // bring the whole book into view (controls + pages), so it fits the screen without scrolling
      setTimeout(() => { const bar = stage.previousElementSibling; if (bar && modalBody) modalBody.scrollTo({ top: Math.max(0, bar.offsetTop - 70), behavior: 'smooth' }); }, 350);
      } catch (err) { console.error(err); book = null; showSpreadsInstead(); }
    }
    // if the book can't start (old browser, slow file), show the neat cover + spreads view instead of raw pages
    function showSpreadsInstead(){ const st = $('#bookStage'), sp = $('#bookSpreads'); if (st) st.hidden = true; if (sp) sp.hidden = false; $$('[data-book="prev"],[data-book="next"],#bookCount,[data-book="sound"],.pbook-sep,[data-book="view"]').forEach(x => x.hidden = true); }
    caseSections.addEventListener('click', e => {
      const b = e.target.closest('[data-book]'); if (!b) return;
      const act = b.dataset.book;
      if (act === 'next' && book) book.flipNext(); if (act === 'prev' && book) book.flipPrev();
      if (act === 'sound') { bookSound = !bookSound; b.textContent = bookSound ? 'Sound on' : 'Sound off'; b.setAttribute('aria-pressed', String(bookSound)); }
      if (act === 'view') { const st = $('#bookStage'), sp = $('#bookSpreads'), showAll = sp.hidden; sp.hidden = !showAll; st.hidden = showAll; b.textContent = showAll ? 'Book view' : 'All pages'; $$('[data-book="prev"],[data-book="next"],#bookCount,[data-book="sound"],.pbook-sep').forEach(x => x.hidden = showAll); }
    });

    function renderCategory(ci){
      destroyBook();
      const cat = CATEGORIES[ci]; view = { t: 'cat', ci }; currentImages = [];
      applyPageBg(cat.bg); backBtn.hidden = true;
      mmeta.textContent = `${pad2(ci + 1)} / ${cat.title}`; caseTitle.textContent = cat.title;
      if (cat.intro) { caseTagline.textContent = cat.intro; caseTagline.hidden = false; } else caseTagline.hidden = true;
      renderDetails(null);
      const items = cat.items || [];
      if (cat.layout === 'cases') {
        caseSections.className = 'pcases';
        caseSections.innerHTML = items.length ? items.map((s, si) => `
          <button class="pcase" type="button" data-si="${si}">
            <span class="pcase-img"><img src="${esc(imgW(caseCover(s), 1400))}" alt="" loading="lazy"></span>
            <span class="pcase-meta"><span>${pad2(si + 1)}${s.locked ? ' · 🔒 Locked' : ''}</span><strong>${esc(s.title)}</strong>${s.tagline ? `<em>${esc(s.tagline)}</em>` : ''}<i>View case study ↗</i></span>
          </button>`).join('') : '<p class="pempty">Case studies are coming soon.</p>';
      } else if (cat.layout === 'books') {
        // a shelf of editorials: tidy covers; tap one to open it as its own flip book
        caseSections.className = 'pshelf';
        caseSections.innerHTML = items.length ? items.map((s, si) => `
          <button class="pshelf-item" type="button" data-si="${si}" style="--i:${si}">
            <span class="pshelf-cover"><img src="${esc(caseCover(s))}" alt="" loading="lazy" decoding="async"><span class="pshelf-spine" aria-hidden="true"></span>${s.locked ? '<span class="pshelf-lock">🔒</span>' : ''}</span>
            <strong>${esc(s.title)}</strong>${s.tagline ? `<em>${esc(s.tagline)}</em>` : ''}
            <i>${(s.blocks || []).filter(b => b.type === 'image').length || ''}${(s.blocks || []).length ? ' pages · ' : ''}Open ↗</i>
          </button>`).join('') : '<p class="pempty">Work is coming soon.</p>';
      } else if (cat.layout === 'book') {
        caseSections.className = 'pbook-wrap';
        const pages = items.filter(b => b.type === 'image' && b.src), others = items.filter(b => !(b.type === 'image' && b.src));
        caseSections.innerHTML = pages.length ? bookHTML(pages) + (others.length ? `<div class="pblocks gaps">${blocksHTML(others)}</div>` : '') : '<p class="pempty">Work is coming soon.</p>';
        if (pages.length) setTimeout(() => startBook(pages), 30);
      } else {
        const cls = { stack: cat.tight ? 'pblocks' : 'pblocks gaps', natural: 'pblocks gaps natural', grid2: 'pgrid g2', grid3: 'pgrid g3' }[cat.layout] + (cat.tile && cat.layout.startsWith('grid') ? ' tile' : '');
        caseSections.className = cls;
        caseSections.innerHTML = items.length ? blocksHTML(items) : '<p class="pempty">Work is coming soon.</p>';
      }
      caseMore.innerHTML = briefCTA(cat) + moreHTML('Explore other work', CATEGORIES, 'cat', ci);
      const nx = CATEGORIES[(ci + 1) % CATEGORIES.length];
      caseNext.innerHTML = CATEGORIES.length > 1 ? `<button class="case-next-btn" id="caseNextBtn" type="button"><img src="${esc(imgW(coverOf(nx), 300))}" alt=""><span><small>Next section</small><strong>${esc(nx.title)}</strong></span><i aria-hidden="true">→</i></button>` : '';
      finish();
    }
    function renderCase(ci, si){
      destroyBook();
      const cat = CATEGORIES[ci], cs = cat.items[si]; view = { t: 'case', ci, si }; currentImages = [];
      applyPageBg(cs.bg || cat.bg); backBtn.hidden = false; backBtn.textContent = '← ' + cat.title;
      mmeta.textContent = `${cat.title} / ${cs.title}`; caseTitle.textContent = cs.title;
      if (cs.tagline) { caseTagline.textContent = cs.tagline; caseTagline.hidden = false; } else caseTagline.hidden = true;
      renderDetails(cs.details);
      if (cat.layout === 'books') {
        const pages = (cs.blocks || []).filter(b => b.type === 'image' && b.src), others = (cs.blocks || []).filter(b => !(b.type === 'image' && b.src));
        caseSections.className = 'pbook-wrap';
        caseSections.innerHTML = pages.length ? bookHTML(pages) + (others.length ? `<div class="pblocks gaps">${blocksHTML(others)}</div>` : '') : '<p class="pempty">Pages are coming soon.</p>';
        if (pages.length) setTimeout(() => startBook(pages), 30);
      } else {
      caseSections.className = cs.tight !== false ? 'pblocks' : 'pblocks gaps';
      caseSections.innerHTML = blocksHTML(cs.blocks);
      }
      // every case study ends with a thank-you (admin → Content → Work / gallery)
      const w = C.work || {};
      const thanks = w.thanks ? `<div class="case-thanks reveal"><span class="case-thanks-dot" aria-hidden="true"></span><h2>${esc(w.thanks)}</h2>${(w.thanksNote || w.thanksCta) ? `<p>${esc(w.thanksNote || '')}${w.thanksCta ? ` <a href="contact.html">${esc(w.thanksCta)}</a>` : ''}</p>` : ''}</div>` : '';
      caseMore.innerHTML = thanks + briefCTA(cat) + moreHTML(cat.layout === 'books' ? 'More editorials' : 'Other projects', cat.items, 'case', si);
      const nx = cat.items[(si + 1) % cat.items.length];
      caseNext.innerHTML = cat.items.length > 1 ? `<button class="case-next-btn" id="caseNextBtn" type="button"><img src="${esc(imgW(caseCover(nx), 300))}" alt=""><span><small>${cat.layout === 'books' ? 'Next editorial' : 'Next project'}</small><strong>${esc(nx.title)}</strong></span><i aria-hidden="true">→</i></button>`
        : `<button class="case-next-btn" id="caseNextBtn" type="button"><span><small>That's all of them</small><strong>Back to ${esc(cat.title)}</strong></span><i aria-hidden="true">←</i></button>`;
      finish();
    }
    function showModal(){ modal.classList.add('open'); updateScroll(); }
    function closeModal(){ destroyBook(); modal.classList.remove('open'); view = null; updateScroll(); }
    async function openCategory(id){
      const ci = CATEGORIES.findIndex(c => c.id === id); if (ci < 0) return;
      clickSound();
      if (!(await ensureUnlocked(CATEGORIES[ci], 'items'))) return;
      renderCategory(ci); showModal();
    }
    async function openCase(ci, si){
      const cs = (CATEGORIES[ci].items || [])[si]; if (!cs) return;
      clickSound();
      if (!(await ensureUnlocked(cs, 'blocks'))) return;
      renderCase(ci, si);
    }
    async function moveView(dir){
      if (!view) return;
      if (view.t === 'cat') {
        const ci = (view.ci + dir + CATEGORIES.length) % CATEGORIES.length;
        if (await ensureUnlocked(CATEGORIES[ci], 'items')) { renderCategory(ci); clickSound(); }
      } else {
        const items = CATEGORIES[view.ci].items, si = (view.si + dir + items.length) % items.length;
        if (items.length > 1 && await ensureUnlocked(items[si], 'blocks')) { renderCase(view.ci, si); clickSound(); }
        else if (items.length === 1) renderCategory(view.ci);
      }
    }
    $('#prevProject')?.addEventListener('click', () => moveView(-1));
    $('#nextProject')?.addEventListener('click', () => moveView(1));
    $('#close')?.addEventListener('click', closeModal);
    backBtn.addEventListener('click', () => { if (view && view.t === 'case') { renderCategory(view.ci); clickSound(); } });
    caseNext.addEventListener('click', e => { if (e.target.closest('#caseNextBtn')) moveView(1); });
    caseSections.addEventListener('click', e => {
      const c = e.target.closest('.pcase, .pshelf-item'); if (c && view) { openCase(view.ci, Number(c.dataset.si)); return; }
      const f = e.target.closest('.pimg'); if (f) openLightbox(Number(f.dataset.lb));
    });
    caseMore.addEventListener('click', async e => {
      const c = e.target.closest('.pmore-card'); if (!c) return; const i = Number(c.dataset.i); clickSound();
      if (c.dataset.kind === 'cat') { if (await ensureUnlocked(CATEGORIES[i], 'items')) renderCategory(i); }
      else if (view) openCase(view.ci, i);
    });

    /* ---------- click a picture: viewer shows ONE picture fitted to the screen ----------
       ← → keys, swipe or the arrows move between pictures; tap the picture for full width (long pages). */
    const lbBody = $('#lbBody');
    let lbIndex = 0;
    lbBody.innerHTML = `<button class="lb-arrow lb-prev" type="button" aria-label="Previous picture">←</button><figure class="lb-stage" id="lbStage"></figure><button class="lb-arrow lb-next" type="button" aria-label="Next picture">→</button>`;
    const lbStage = $('#lbStage'), lbPrev = $('.lb-prev'), lbNext = $('.lb-next');
    function showLb(i){
      const n = currentImages.length; if (!n) return;
      lbIndex = (i + n) % n;
      lbStage.classList.remove('is-full'); lbStage.scrollTop = 0;
      lbStage.innerHTML = `<img src="${esc(currentImages[lbIndex])}" alt="" decoding="async">`;
      $('#lbCount').textContent = `${caseTitle.textContent}${n > 1 ? `  ·  ${lbIndex + 1} / ${n}` : ''}`;
      lbPrev.hidden = lbNext.hidden = n < 2;
      [lbIndex + 1, lbIndex - 1].forEach(k => { const im = new Image(); im.src = currentImages[(k + n) % n]; });   // next ones ready instantly
    }
    function openLightbox(start){
      if (!currentImages.length) return;
      lightbox.classList.add('open'); lightbox.setAttribute('aria-hidden', 'false'); updateScroll();
      showLb(start || 0);
    }
    function closeLightbox(){ lightbox.classList.remove('open'); lightbox.setAttribute('aria-hidden', 'true'); lbStage.innerHTML = ''; updateScroll(); }
    $('#lbClose').addEventListener('click', closeLightbox);
    lbPrev.addEventListener('click', e => { e.stopPropagation(); showLb(lbIndex - 1); });
    lbNext.addEventListener('click', e => { e.stopPropagation(); showLb(lbIndex + 1); });
    lbStage.addEventListener('click', e => { if (e.target.tagName === 'IMG') lbStage.classList.toggle('is-full'); else closeLightbox(); });
    lightbox.addEventListener('click', e => { if (e.target === lightbox || e.target === lbBody) closeLightbox(); });
    let swipeX = null, swipeY = null;
    lbBody.addEventListener('touchstart', e => { swipeX = e.touches[0].clientX; swipeY = e.touches[0].clientY; }, { passive: true });
    lbBody.addEventListener('touchend', e => {
      if (swipeX == null) return; const dx = e.changedTouches[0].clientX - swipeX, dy = e.changedTouches[0].clientY - swipeY; swipeX = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) showLb(lbIndex + (dx < 0 ? 1 : -1));
    }, { passive: true });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        if (pwDialog.classList.contains('open')) closePw(false);
        else if (lightbox.classList.contains('open')) closeLightbox();
        else if (modal.classList.contains('open')) closeModal();
        else if (revealed) setRevealed(false);
      }
      if (lightbox.classList.contains('open')) {
        if (e.key === 'ArrowRight') showLb(lbIndex + 1);
        if (e.key === 'ArrowLeft') showLb(lbIndex - 1);
      }
      if (modal.classList.contains('open') && !lightbox.classList.contains('open') && !pwDialog.classList.contains('open')) {
        if (book && !$('#bookStage')?.hidden) { if (e.key === 'ArrowRight') book.flipNext(); if (e.key === 'ArrowLeft') book.flipPrev(); return; }
        if (e.key === 'ArrowRight') moveView(1);
        if (e.key === 'ArrowLeft') moveView(-1);
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
      const emailHref = $('#contactEmail')?.getAttribute('href') || 'mailto:samuel.s.adedeji@gmail.com';
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
