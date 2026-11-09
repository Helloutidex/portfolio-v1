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
    nav: { logo: 'ADEDEJI SAMUEL / DESIGN', links: [{ label: 'About', href: '#about' }, { label: 'Work', href: '#work' }], ctaLabel: "Let's talk", ctaHref: 'contact.html' },
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
    proof: { label: 'Social proof', heading: '', stats: [
      { value: '80+', label: 'Satisfied Clients.' },
      { value: '120+', label: 'Completed Projects.' },
      { value: '5yrs+', label: 'Design Experience.' },
    ]},
    logofolio: { label: 'Logofolio', heading: 'Marks & identities I have designed.', tiles: 'light', items: [] },
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
    badge: { initials: 'AS', ringText: 'ADEDEJI SAMUEL', ringImage: '', size: 96, href: 'contact.html' },
    signature: { name: 'ADEDEJI SAMUEL', font: 'UnifrakturCook', nameColor: '#E8223E', bg: '#141211', textColor: '#faf6ee' },
    contact: { ctaLabel: "Let's talk ↗", pageHeading: "Let's talk.", subheading: 'Tell me about your project.', body: 'Share a little about what you have in mind — the goal, the timeline, anything that helps. I read every message and reply personally.', whatsappLabel: 'WhatsApp number (optional)', backLabel: '← Back home', small: 'Start a project', headingLines: ["LET'S MAKE","SOMETHING","WORTH SEEING."], available: 'Available for selected projects', emailText: 'samuel.s.adedeji@gmail.com ↗', emailHref: 'mailto:samuel.s.adedeji@gmail.com' },
    footer: { left: '© 2026 Adedeji Samuel', right: 'Designed with intention / Lagos' },
    effects: { particles: true },
  };

  const cloneDefaultContent = () => JSON.parse(JSON.stringify(DEFAULT_CONTENT));
  // Fills in any setting a saved / published copy doesn't have yet, so new features never break old data.
  function mergeContent(saved){
    const d = cloneDefaultContent(), out = {};
    for (const k of Object.keys(d)) {
      const dv = d[k], sv = saved ? saved[k] : undefined;
      if (dv && typeof dv === 'object' && !Array.isArray(dv)) out[k] = { ...dv, ...((sv && typeof sv === 'object') ? sv : {}) };
      else out[k] = sv !== undefined ? sv : dv;
    }
    if (saved && saved.social && Array.isArray(saved.social.names) && !Array.isArray(saved.social.items)) out.social.items = saved.social.names.map(n => ({ name: n, logo: '' }));
    if (!saved || !saved.badge) out.badge.ringText = out.signature.name;
    return out;
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
    set('navLogo', c.nav.logo); renderNav(c);
    set('heroEyebrow', c.hero.eyebrow); set('heroTitlePre', c.hero.titlePre); set('heroTitleEm', c.hero.titleEm); set('heroTitlePost', c.hero.titlePost);
    set('heroParagraph', c.hero.paragraph); set('lensLabel', c.hero.lensLabel); set('opticNote', c.hero.opticNote);
    set('heroNote', c.hero.note); set('heroZoomInstruction', c.hero.zoomInstruction);
    const cta = $('#heroCta');
    if (cta) { cta.textContent = c.hero.ctaLabel || ''; cta.href = c.hero.ctaHref || '#work'; cta.hidden = !c.hero.ctaLabel; }
    set('aboutLabel', c.about.label); set('viewCV', c.about.viewCV); set('downloadCV', c.about.downloadCV);
    const cvBox = $('.cv-cta'); if (cvBox) cvBox.hidden = !c.about.cvFile;
    const portraitImg = $('#portraitImg'); if (portraitImg && c.about.portraitImage) portraitImg.src = c.about.portraitImage;
    set('portraitCaption', c.about.portraitCaption);
    set('aboutHeadingPre', c.about.headingPre); set('aboutHeadingEm', c.about.headingEm); set('aboutHeadingPost', c.about.headingPost);
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
    // social proof: the numbers band (logos above come from "Client logos")
    const pr = c.proof || {};
    set('proofLabel', pr.label || '');
    const ph = $('#proofHeading'); if (ph) { ph.textContent = pr.heading || ''; ph.hidden = !pr.heading; }
    const ps = $('#proofStats');
    if (ps) ps.innerHTML = (pr.stats || []).filter(s => s.value || s.label).map(s => `<div class="stat"><strong data-count="${esc(s.value)}">${esc(s.value)}</strong><i aria-hidden="true"></i><span>${esc(s.label)}</span></div>`).join('');
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
    const ch = $('#contactHeading'); if (ch) ch.innerHTML = c.contact.headingLines.map(esc).join('<br>');
    set('contactPageHeading', c.contact.pageHeading); set('contactSub', c.contact.subheading); set('contactBody', c.contact.body);
    set('contactBack', c.contact.backLabel); set('whatsappLabel', c.contact.whatsappLabel);
    set('contactAvailable', c.contact.available);
    const emailEl = $('#contactEmail'); if (emailEl) { emailEl.textContent = c.contact.emailText; emailEl.href = c.contact.emailHref; }
    set('contactCtaBtn', c.contact.ctaLabel || "Let's talk ↗");
    const formEl = $('#contactForm'); if (formEl) formEl.action = 'https://formsubmit.co/' + String(c.contact.emailHref || '').replace(/^mailto:/, '').split('?')[0];
    set('footerLeft', c.footer.left); set('footerRight', c.footer.right);
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
      if (bsvg) bsvg.style.display = ringImg ? 'none' : '';
      const ringPath = $('#badgeCircleText');
      if (ringPath && ring) {
        const unit = ring + ' · ';
        ringPath.textContent = unit.repeat(Math.max(1, Math.round(57 / unit.length))).trim();
        ringPath.setAttribute('textLength', '312'); ringPath.setAttribute('lengthAdjust', 'spacing');
      } else if (ringPath) ringPath.textContent = '';
    }
  }
  const C = loadContent();
  applyContent(C);

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
    const out = { mode: saved.mode === 'dark' ? 'dark' : 'light', scale: saved.scale != null ? Number(saved.scale) : 1, light: { ...d.light }, dark: { ...d.dark } };
    if (saved.light || saved.dark) { Object.assign(out.light, saved.light || {}); Object.assign(out.dark, saved.dark || {}); }
    else {   // older single-palette shape
      ['paper', 'ink', 'muted', 'line', 'tint1', 'tint2'].forEach(k => { if (saved[k]) out.light[k] = saved[k]; });
      if (saved.contactBg) { out.light.accent = saved.contactBg; out.light.contactBg = saved.contactBg; }
    }
    return out;
  }
  function applyTheme(t){
    const pal = t.mode === 'dark' ? t.dark : t.light, r = document.documentElement.style;
    ['paper', 'ink', 'muted', 'line', 'accent', 'tint1', 'tint2'].forEach(k => r.setProperty('--' + k, pal[k]));
    r.setProperty('--surface', pal.paper); r.setProperty('--contact-bg', pal.contactBg); r.setProperty('--contact-text', pal.contactText); r.setProperty('--scale', t.scale);
    document.body.classList.toggle('dark', t.mode === 'dark');
    document.documentElement.classList.remove('predark');
    // remember these colours so the next visit paints them before anything else (no flash of old colours)
    const vars = {}; ['paper', 'ink', 'muted', 'line', 'accent', 'tint1', 'tint2'].forEach(k => vars['--' + k] = pal[k]);
    Object.assign(vars, { '--surface': pal.paper, '--contact-bg': pal.contactBg, '--contact-text': pal.contactText, '--scale': String(t.scale) });
    try { localStorage.setItem('ferricool-mode', t.mode); localStorage.setItem('ferricool-theme-vars', JSON.stringify(vars)); } catch (e) {}
  }
  applyTheme(migrateTheme(draftOf(THEME_STORAGE_KEY) || REMOTE.theme));
  requestAnimationFrame(() => document.documentElement.classList.remove('is-loading'));

  // speed: marquees, the moving gallery, the lens rings and the signature only animate while on screen
  if ('IntersectionObserver' in window) {
    const pauser = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('is-paused', !e.isIntersecting)), { rootMargin: '120px 0px' });
    $$('.hero, .social-proof, .work, .signature, .links-section').forEach(el => pauser.observe(el));
  }

  // numbers in the social proof band count up once when they scroll into view ("80+" counts 0 → 80, keeps the "+")
  (function countUp(){
    // social proof: when the band scrolls into view the label, numbers and red lines come in one after another,
    // and each number counts up over about 3 seconds — slow start, quicker middle, gentle landing ("80+", "5yrs+").
    const band = $('#proof'), els = $$('[data-count]');
    if (!band || !els.length) return;
    const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!('IntersectionObserver' in window) || reduce) { band.classList.add('is-in'); return; }
    const parts = el => String(el.dataset.count).match(/^(\D*)(\d+)(.*)$/);
    els.forEach(el => { const m = parts(el); if (m) el.textContent = m[1] + '0' + m[3]; });
    const ease = p => p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;   // slow start, quick middle, gentle landing
    const run = (el, delay) => {
      const m = parts(el); if (!m) return;
      const end = Number(m[2]), dur = 2800 + Math.min(800, end * 4);
      setTimeout(() => {
        const t0 = performance.now();
        const step = now => {
          const p = Math.min(1, (now - t0) / dur);
          el.textContent = m[1] + (p >= 1 ? end : Math.floor(end * ease(p))) + m[3];
          if (p < 1) requestAnimationFrame(step); else el.classList.add('is-done');
        };
        requestAnimationFrame(step);
      }, delay);
    };
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      band.classList.add('is-in'); els.forEach((el, i) => run(el, 350 + i * 260)); io.disconnect();
    }), { threshold: .35 });
    io.observe(band);
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

  const LAYOUTS = ['cases', 'natural', 'grid2', 'grid3', 'stack'];
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
      const out = { id: c.id || ('cat-' + (i + 1)), title: c.title || ('Section ' + (i + 1)), layout, image: c.image || '', intro: c.intro || '', bg: c.bg || '', tight: c.tight !== false, tile: !!c.tile };
      let items = c.items;
      if (!Array.isArray(items)) items = (c.locked && c.enc) ? undefined : [];
      if (items) out.items = layout === 'cases' ? items.map(migrateCase) : items;
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
    const caseCover = s => s.cover || firstImage(s.blocks);
    // a section's own first picture beats a leftover stock placeholder photo as its card / gallery cover
    const isStock = u => /images\.unsplash\.com/.test(u || '');
    const ownCover = c => c.layout === 'cases' ? ((c.items || []).map(caseCover).find(Boolean) || '') : firstImage(c.items);
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
    galleryEl.addEventListener('click', e => { const f = e.target.closest('.gallery-frame'); if (f) openCategory(f.dataset.id); });
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
    lensImg.src = (C.hero && C.hero.lensImage) ? C.hero.lensImage : imgW(catCover(CATEGORIES[0] || {}), 900);
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
      if (field === 'items') node.items = (Array.isArray(data.items) ? data.items : []).map((x, i) => node.layout === 'cases' ? migrateCase(x, i) : x);
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
      caseDetails.innerHTML = rows.map(d => `<div><dt>${esc(d.label)}${/[:：]$/.test(d.label.trim()) ? '' : ':'}</dt><dd>${esc(d.value)}</dd></div>`).join('');
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
      modalBox.style.setProperty('--paper', bg); modalBox.style.setProperty('--ink', dark ? '#faf6ee' : '#141211');
      modalBox.style.setProperty('--muted', dark ? 'rgba(250,246,238,.62)' : 'rgba(20,18,17,.6)'); modalBox.style.setProperty('--line', dark ? 'rgba(250,246,238,.16)' : 'rgba(20,18,17,.12)');
    }
    function blocksHTML(blocks){
      return (blocks || []).map(b => {
        const cap = b.caption ? `<figcaption>${esc(b.caption)}</figcaption>` : '';
        if (b.type === 'image') { currentImages.push(b.src); return `<figure class="pimg" data-lb="${currentImages.length - 1}"><img src="${esc(b.src)}" alt="" loading="lazy" decoding="async">${cap}</figure>`; }
        if (b.type === 'pdf') return `<div class="ppdf"><iframe data-pdf="${esc(b.src)}" title="PDF document"></iframe><a class="ppdf-open" data-pdf-link="${esc(b.src)}" href="${b.src.startsWith('data:') ? '#' : esc(b.src)}" target="_blank" rel="noopener">Open PDF ↗</a>${cap}</div>`;
        if (b.type === 'video') return `<div class="pvideo"><video src="${esc(b.src)}" controls playsinline preload="metadata"></video>${cap}</div>`;
        return `<div class="ptext reveal"><h3>${esc(b.heading)}</h3><p>${esc(b.body)}</p>${(b.tags && b.tags.length) ? `<div class="case-tags"><ul>${b.tags.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>` : ''}</div>`;
      }).join('');
    }
    async function fillPdfs(){
      for (const f of $$('iframe[data-pdf]', caseSections)) { const u = f.dataset.pdf; f.src = u.startsWith('data:') ? await fileUrlFor(u) : u + '#view=FitH'; }
      for (const a of $$('a[data-pdf-link]', caseSections)) { const u = a.dataset.pdfLink; if (u.startsWith('data:')) a.href = await fileUrlFor(u); }
    }
    function moreHTML(title, list, kind, skip){
      const others = list.map((x, i) => ({ x, i })).filter(o => o.i !== skip);
      if (!others.length) return '';
      return `<div class="pmore reveal"><h4>${esc(title)}</h4><div class="pmore-grid">${others.slice(0, 8).map(o => `
        <button class="pmore-card" type="button" data-kind="${kind}" data-i="${o.i}"><img src="${esc(imgW(kind === 'cat' ? coverOf(o.x) : caseCover(o.x), 600))}" alt=""><span>${esc(o.x.title)}${o.x.locked ? ' 🔒' : ''}</span></button>`).join('')}</div></div>`;
    }
    function finish(){ modalBody.scrollTop = 0; armReveals(modalBody); fillPdfs(); }

    function renderCategory(ci){
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
      } else {
        const cls = { stack: cat.tight ? 'pblocks' : 'pblocks gaps', natural: 'pblocks gaps natural', grid2: 'pgrid g2', grid3: 'pgrid g3' }[cat.layout] + (cat.tile && cat.layout.startsWith('grid') ? ' tile' : '');
        caseSections.className = cls;
        caseSections.innerHTML = items.length ? blocksHTML(items) : '<p class="pempty">Work is coming soon.</p>';
      }
      caseMore.innerHTML = moreHTML('More work', CATEGORIES, 'cat', ci);
      const nx = CATEGORIES[(ci + 1) % CATEGORIES.length];
      caseNext.innerHTML = CATEGORIES.length > 1 ? `<button class="case-next-btn" id="caseNextBtn" type="button"><span>Next section</span><strong>${esc(nx.title)} →</strong></button>` : '';
      finish();
    }
    function renderCase(ci, si){
      const cat = CATEGORIES[ci], cs = cat.items[si]; view = { t: 'case', ci, si }; currentImages = [];
      applyPageBg(cs.bg || cat.bg); backBtn.hidden = false; backBtn.textContent = '← ' + cat.title;
      mmeta.textContent = `${cat.title} / ${cs.title}`; caseTitle.textContent = cs.title;
      if (cs.tagline) { caseTagline.textContent = cs.tagline; caseTagline.hidden = false; } else caseTagline.hidden = true;
      renderDetails(cs.details);
      caseSections.className = cs.tight !== false ? 'pblocks' : 'pblocks gaps';
      caseSections.innerHTML = blocksHTML(cs.blocks);
      caseMore.innerHTML = moreHTML('More case studies', cat.items, 'case', si);
      const nx = cat.items[(si + 1) % cat.items.length];
      caseNext.innerHTML = cat.items.length > 1 ? `<button class="case-next-btn" id="caseNextBtn" type="button"><span>Next case study</span><strong>${esc(nx.title)} →</strong></button>`
        : `<button class="case-next-btn" id="caseNextBtn" type="button"><span>That's all of them</span><strong>Back to ${esc(cat.title)} →</strong></button>`;
      finish();
    }
    function showModal(){ modal.classList.add('open'); updateScroll(); }
    function closeModal(){ modal.classList.remove('open'); view = null; updateScroll(); }
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
      const c = e.target.closest('.pcase'); if (c && view) { openCase(view.ci, Number(c.dataset.si)); return; }
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
