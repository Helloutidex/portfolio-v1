(async () => {
try {
  const $ = s => document.querySelector(s);

  // What's currently live (site-data.json), so the editor starts from the published site rather than
  // from the defaults. Right after you publish, your own copy wins over the CDN's until it catches up.
  const fetchJSON = async url => {
    try {
      const c = new AbortController(); const t = setTimeout(() => c.abort(), 4000);
      const r = await fetch(url, { cache: 'no-cache', signal: c.signal }); clearTimeout(t);
      return r.ok ? await r.json() : null;
    } catch (e) { return null; }
  };
  const REMOTE = (await fetchJSON('site-data.json')) || {};
  const LAST_PUB_KEY = 'ferricool-last-published';
  let LASTPUB = null; try { LASTPUB = JSON.parse(localStorage.getItem(LAST_PUB_KEY)); } catch (e) {}
  // The editor starts from what is live on GitHub. Only if this browser published something NEWER that GitHub
  // hasn't caught up with yet (the minute right after Publish) does it use its own copy instead.
  const BASE = (LASTPUB && REMOTE.updatedAt && LASTPUB.updatedAt > REMOTE.updatedAt
    && (Date.now() - Date.parse(LASTPUB.updatedAt)) < 15 * 60 * 1000) ? LASTPUB : (REMOTE.updatedAt ? REMOTE : (LASTPUB || REMOTE));
  // Drafts live in this browser's IndexedDB (room for big uploads — localStorage only holds ~5 MB, which is why
  // large pictures used to vanish on reload). Older drafts in localStorage are still read.
  const idb = (() => {
    let dbp = null;
    const open = () => dbp || (dbp = new Promise((res, rej) => { try { const r = indexedDB.open('portfolio-admin', 1); r.onupgradeneeded = () => r.result.createObjectStore('drafts'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); } catch (e) { rej(e); } }));
    const tx = (mode, fn) => open().then(db => new Promise((res, rej) => { const t = db.transaction('drafts', mode), st = t.objectStore('drafts'), out = fn(st); t.oncomplete = () => res(out && out.result); t.onerror = () => rej(t.error); }));
    return {
      all: () => open().then(db => new Promise(res => { const out = {}, t = db.transaction('drafts', 'readonly'), c = t.objectStore('drafts').openCursor(); c.onsuccess = () => { const cur = c.result; if (cur) { out[cur.key] = cur.value; cur.continue(); } else res(out); }; c.onerror = () => res(out); })).catch(() => ({})),
      set: (k, v) => tx('readwrite', st => st.put(JSON.parse(JSON.stringify(v)), k)),
      del: k => tx('readwrite', st => st.delete(k)).catch(() => {}),
    };
  })();
  const IDB_DRAFTS = await idb.all();
  const draftOf = key => { try { const v = JSON.parse(localStorage.getItem(key)); if (v) return v; } catch (e) {} return IDB_DRAFTS[key] || null; };
  const $$ = s => [...document.querySelectorAll(s)];
  function esc(s){ return String(s==null?'':s).replace(/"/g,'&quot;').replace(/</g,'&lt;'); }
  function getPath(obj, path){ return path.split('.').reduce((o,k)=> (o==null?undefined:o[k]), obj); }
  function setPath(obj, path, val){ const parts=path.split('.'); let o=obj; for(let i=0;i<parts.length-1;i++) o=o[parts[i]]; o[parts[parts.length-1]] = val; }
  function setStatus(id, msg){ const el = $('#'+id); if(el) el.textContent = msg; }
  async function copyOrLog(code, statusId){
    try{
      await navigator.clipboard.writeText(code);
      setStatus(statusId, 'Copied — paste it into script.js, then redeploy.');
    }catch(e){
      setStatus(statusId, 'Could not copy automatically — see the browser console for the code.');
      console.log(code);
    }
  }
  // Small non-cryptographic hash — this is a casual deterrent, not real security.
  // See the lock screen copy and the README for what that means in practice.
  function simpleHash(str){
    let h = 5381;
    for (let i=0; i<str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
    return h.toString(36);
  }

  /* ============================================================
     LOCK SCREEN — a light client-side gate, not real security.
     First run: whatever the person types becomes the passphrase
     (its hash is stored in localStorage). After that, they must
     enter the same passphrase to see the editor. Anyone who reads
     admin.js can see exactly how this check works, so it only
     keeps out casual visitors — see the README before relying on
     this for anything that actually needs to stay private.
  ============================================================ */
  const LOCK_KEY = 'ferricool-admin-lock';
  const lockScreen = $('#lockScreen'), appContent = $('#appContent');
  function unlock(){ lockScreen.hidden = true; appContent.hidden = false; sessionStorage.setItem('ferricool-admin-unlocked','1'); }
  function showLock(firstRun){
    appContent.hidden = true; lockScreen.hidden = false;
    $('#lockTitle').textContent = firstRun ? 'Set a passphrase' : 'Enter passphrase';
    $('#lockNote').textContent = firstRun
      ? "Whatever you type here becomes the passphrase for this browser. Remember it — there's no recovery, only \"Reset lock\" from the browser console (see README). This is a casual deterrent, not real security."
      : "This only keeps casual visitors out — it's a client-side check, not real security. For genuine protection, don't publish admin.html/js/css to your public GitHub Pages site (see the README).";
  }
  if (sessionStorage.getItem('ferricool-admin-unlocked') === '1') {
    unlock();
  } else {
    showLock(!localStorage.getItem(LOCK_KEY));
  }
  $('#lockForm').addEventListener('submit', e => {
    e.preventDefault();
    const val = $('#lockInput').value;
    if (!val) return;
    const stored = localStorage.getItem(LOCK_KEY);
    if (!stored) { localStorage.setItem(LOCK_KEY, simpleHash(val)); unlock(); return; }
    if (simpleHash(val) === stored) { unlock(); }
    else { setStatus('lockStatus', 'Wrong passphrase.'); $('#lockInput').value=''; }
  });
  $('#lockOut')?.addEventListener('click', () => { sessionStorage.removeItem('ferricool-admin-unlocked'); showLock(false); });
  $('#lockReset')?.addEventListener('click', () => {
    if (!confirm('This clears the saved passphrase on this browser so you can set a new one. Continue?')) return;
    localStorage.removeItem(LOCK_KEY);
    sessionStorage.removeItem('ferricool-admin-unlocked');
    location.reload();
  });

  /* ---------- shared: theme toggle (same as main site) ---------- */
  const themeBtn = $('#theme');
  if (localStorage.getItem('portfolio-theme') === 'dark') document.body.classList.add('dark');
  function syncThemeBtn(){ if(themeBtn) themeBtn.querySelector('b').textContent = document.body.classList.contains('dark') ? 'White' : 'Black'; }
  syncThemeBtn();
  themeBtn?.addEventListener('click', () => { document.body.classList.toggle('dark'); localStorage.setItem('portfolio-theme', document.body.classList.contains('dark')?'dark':'light'); syncThemeBtn(); });

  /* ---------- tabs ---------- */
  $$('.admin-tab').forEach(tab => tab.addEventListener('click', () => {
    $$('.admin-tab').forEach(t=>t.classList.toggle('active', t===tab));
    $$('.admin-panel').forEach(p => { p.hidden = (p.id !== 'panel-'+tab.dataset.tab); });
  }));

  /* ---------- shared: turn a chosen file into a data URL ---------- */
  function readFileAsDataURL(file){
    return new Promise((resolve,reject)=>{
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /* ============================================================
     CONTENT TAB
  ============================================================ */
  const CONTENT_STORAGE_KEY = 'ferricool-portfolio-content';
  const DEFAULT_CONTENT = {
    nav: { logo: 'ADEDEJI SAMUEL / DESIGN', logoImage: '', logoStyle: 'mark-name', favicon: '', links: [{ label: 'About', href: '#about' }, { label: 'Work', href: '#work' }], ctaLabel: "Let's talk", ctaHref: 'contact.html' },
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
    work: { label: 'Gallery / automatic', description: 'Selected work, continuously moving. Tap any frame to explore.', noteRight: 'Tap any frame to explore', thanks: 'Thank you for viewing.', thanksNote: 'Have a project in mind?', thanksCta: "Let's talk ↗" },
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
      { kind: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/search/results/people/?keywords=Adedeji%20Samuel', icon: '' },
      { kind: 'link', label: '', url: '', icon: '' },
    ],
    footer: { left: '© 2026 Adedeji Samuel', right: 'Designed with intention / Lagos', brand: 'Helloutidex', name: 'SAMUEL ADEDEJI' },
    effects: { particles: true, intro: true, introStyle: 'poster' },
    poster: { head: "Every project is a\nconversation, this is\nwhere yours begins.", btn: 'Book a Call', tag: "What are you waiting for, let's build bold brands.", sign: 'Helloutidex', signImage: '', image: 'assets/portrait-cutout.webp', mark: 'SA', hold: 8.4,
      socials: [{ label: 'Instagram', url: '' }, { label: 'LinkedIn', url: '' }, { label: 'Linktree', url: '' }] },
    games: { enabled: true, idleMinutes: 2, button: 'Play a game', offline: true, title: 'Taking a break? Play a quick game.', quiz: true, fonts: true, odd: true, memory: true, sudoku: true, words: true },
  };

  function cloneDefaultContent(){ return JSON.parse(JSON.stringify(DEFAULT_CONTENT)); }
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
    const saved = draftOf(CONTENT_STORAGE_KEY) || BASE.content;
    return (saved && typeof saved === 'object') ? mergeContent(saved) : cloneDefaultContent();
  }
  let content = loadContent();

  // Pictures are shrunk to the width you give (1920 for work) before being stored / published; taller is fine.
  async function readImageResized(file, maxW, keepFormat){
    const url = await readFileAsDataURL(file);
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return url;
    try {
      const img = await new Promise((res, rej) => {
        const i = new Image(); const t = setTimeout(() => rej(new Error('timeout')), 4000);
        i.onload = () => { clearTimeout(t); res(i); }; i.onerror = () => { clearTimeout(t); rej(new Error('bad image')); }; i.src = url;
      });
      // speed: a big PNG with no see-through parts (a photo / flyer) is saved as a JPEG — looks the same, a fraction of the size.
      // Logos and anything with transparency stay PNG.
      let type = file.type;
      if (!keepFormat && type === 'image/png' && file.size > 300000) {
        const t = document.createElement('canvas'); t.width = 64; t.height = 64; const tg = t.getContext('2d');
        tg.drawImage(img, 0, 0, 64, 64); const px = tg.getImageData(0, 0, 64, 64).data; let opaque = true;
        for (let i = 3; i < px.length; i += 4) if (px[i] < 255) { opaque = false; break; }
        if (opaque) type = 'image/jpeg';
      }
      if (img.width <= maxW && type === file.type) return url;
      const w = Math.min(maxW, img.width), h = Math.round(img.height * (w / img.width));
      if (w * h > 16000000) return url;
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const g = c.getContext('2d'); if (type === 'image/jpeg') { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); }
      g.drawImage(img, 0, 0, w, h);
      const out = c.toDataURL(type, 0.88);
      return out.startsWith('data:image') ? out : url;
    } catch (e) { return url; }
  }

  const listRow = (i, inner, removeAttr) => `<div class="admin-mini-row" data-index="${i}">${inner}<button class="admin-mini-remove" type="button" ${removeAttr}="${i}">Remove</button></div>`;
  function renderNavLinks(){
    $('#navLinksEditor').innerHTML = content.nav.links.map((l, i) => listRow(i, `
        <label>Label<input data-navlink-field="label" value="${esc(l.label)}"></label>
        <label>Goes to<input data-navlink-field="href" value="${esc(l.href)}" placeholder="#work or contact.html"></label><span></span>`, 'data-navlink-remove')).join('');
  }
  function renderExpRows(){
    $('#expRowsEditor').innerHTML = content.experience.rows.map((r, i) => listRow(i, `
        <label>Tag<input data-exp-field="tag" value="${esc(r.tag)}"></label>
        <label>Role<input data-exp-field="role" value="${esc(r.role)}"></label>
        <label>Meta<input data-exp-field="meta" value="${esc(r.meta)}"></label>`, 'data-exp-remove')).join('');
  }
  function renderLinks(){
    $('#linksEditor').innerHTML = content.links.items.map((it, i) => listRow(i, `
        <label>Label<input data-link-field="label" value="${esc(it.label)}"></label>
        <label>Href<input data-link-field="href" value="${esc(it.href)}"></label><span></span>`, 'data-link-remove')).join('');
  }

  function renderStats(){
    content.proof.stats = content.proof.stats || [];
    $('#statsEditor').innerHTML = content.proof.stats.map((st, i) => listRow(i, `
        <label>Number<input data-stat-field="value" value="${esc(st.value)}" placeholder="80+"></label>
        <label>Label<input data-stat-field="label" value="${esc(st.label)}" placeholder="Satisfied Clients."></label><span></span>`, 'data-stat-remove')).join('');
  }

  // one tidy tile editor for every logo list: the clients strip and the logofolio
  const LOGO_LISTS = { social: '#collabEditor', logofolio: '#logofolioEditor' };
  function renderLogoList(key){
    const box = $(LOGO_LISTS[key]); if (!box) return;
    content[key] = content[key] || { items: [] }; content[key].items = content[key].items || [];
    box.innerHTML = `<div class="admin-logo-grid">${content[key].items.map((it, i) => `
      <div class="admin-logo-tile" data-list="${key}" data-index="${i}">
        ${it.logo ? `<img src="${esc(it.logo)}" alt="">` : '<span class="admin-thumb-empty">No logo yet<small>a placeholder shows</small></span>'}
        <input data-ll-field="name" value="${esc(it.name || '')}" placeholder="Name">
        <input type="file" accept="image/*" class="admin-upload-input" data-ll-upload>
        <div class="admin-logo-actions"><button type="button" data-ll-upload-btn>${it.logo ? 'Replace' : 'Upload'}</button><button type="button" data-ll-move="-1" title="Move earlier">←</button><button type="button" data-ll-move="1" title="Move later">→</button><button type="button" data-ll-remove title="Remove">✕</button></div>
      </div>`).join('')}
      <div class="admin-logo-add" data-list="${key}">
        <button type="button" data-ll-add>+ Add one</button>
        <label>+ Upload many<input type="file" accept="image/*" multiple class="admin-upload-input" data-ll-bulk></label>
      </div></div>`;
  }
  const renderLogoLists = () => Object.keys(LOGO_LISTS).forEach(renderLogoList);
  function renderTestimonials(){
    $('#testimonialsEditor').innerHTML = content.testimonials.items.map((t, i) => `
      <div class="admin-mini-row admin-testimonial-row" data-index="${i}">
        <label class="full">Quote<textarea data-testimonial-field="quote">${esc(t.quote)}</textarea></label>
        <label>Name<input data-testimonial-field="name" value="${esc(t.name)}"></label>
        <label>Role / company<input data-testimonial-field="role" value="${esc(t.role)}"></label>
        <button class="admin-mini-remove" type="button" data-testimonial-remove="${i}">Remove</button>
      </div>`).join('');
  }
  // Every [data-image-path] box becomes: preview + path + Upload + Remove (pictures, PNGs and the CV PDF).
  function renderFileFields(){
    $$('#panel-content [data-image-path]').forEach(wrap => {
      const path = wrap.dataset.imagePath, kind = wrap.dataset.kind || 'image', accept = wrap.dataset.accept || 'image/*';
      const val = String(getPath(content, path) || ''), isData = val.startsWith('data:');
      const preview = !val ? `<span class="admin-thumb-empty">None</span>` : kind === 'file' ? `<span class="admin-thumb-empty">${isData ? 'New file' : 'File'}</span>` : `<img src="${esc(val)}" alt="">`;
      wrap.innerHTML = `${preview}
        <input type="text" data-file-text="${path}" value="${isData ? '' : esc(val)}" placeholder="${isData ? 'Uploaded — saved when you publish' : (kind === 'file' ? 'Path such as cv.pdf, or upload' : 'Path / URL, or upload')}">
        <input type="file" accept="${accept}" data-file-upload="${path}" class="admin-upload-input">
        <button type="button" class="admin-upload-btn" data-file-upload-btn>Upload</button>
        <button type="button" class="admin-upload-btn" data-file-clear="${path}">Remove</button>`;
    });
  }
  function renderSteps(){
    content.process.steps = content.process.steps || [];
    $('#processEditor').innerHTML = content.process.steps.map((st, i) => listRow(i, `
        <label>Step<input data-step-field="title" value="${esc(st.title)}" placeholder="Ideate"></label>
        <label>Short line<input data-step-field="text" value="${esc(st.text)}"></label><span></span>`, 'data-step-remove')).join('');
  }
  function renderResources(){
    content.resources.items = content.resources.items || [];
    $('#resourcesEditor').innerHTML = content.resources.items.map((r, i) => `
      <div class="admin-mini-row admin-res-row" data-index="${i}">
        <div class="admin-image-field">${r.image ? `<img src="${esc(r.image)}" alt="">` : '<span class="admin-thumb-empty">No cover</span>'}
          <input type="file" accept="image/*" class="admin-upload-input" data-res-upload><button type="button" class="admin-upload-btn" data-res-upload-btn>${r.image ? 'Replace' : 'Cover'}</button>${r.image ? '<button type="button" class="admin-upload-btn" data-res-clear>Remove cover</button>' : ''}</div>
        <label>Title<input data-res-field="title" value="${esc(r.title)}"></label>
        <label>By / what it is<input data-res-field="by" value="${esc(r.by)}"></label>
        <label>Type<select data-res-field="kind">${['Book', 'YouTube', 'Program', 'Course', 'Podcast', 'Website'].map(k => `<option ${r.kind === k ? 'selected' : ''}>${k}</option>`).join('')}</select></label>
        <label class="full">Link (optional)<input data-res-field="url" value="${esc(r.url)}" placeholder="https://…"></label>
        <button class="admin-mini-remove" type="button" data-res-remove="${i}">Remove</button>
      </div>`).join('');
  }
  function renderSocials(){
    content.socials = content.socials || [];
    $('#socialsEditor').innerHTML = content.socials.map((s, i) => `
      <div class="admin-mini-row admin-res-row admin-soc-row" data-index="${i}">
        <div class="admin-image-field">${s.icon ? `<img src="${esc(s.icon)}" alt="">` : '<span class="admin-thumb-empty">Built-in icon</span>'}
          <input type="file" accept="image/*" class="admin-upload-input" data-soc-upload><button type="button" class="admin-upload-btn" data-soc-upload-btn>${s.icon ? 'Replace icon' : 'Own icon'}</button>${s.icon ? '<button type="button" class="admin-upload-btn" data-soc-clear>Use built-in</button>' : ''}</div>
        <label>Type<select data-soc-field="kind">${[['instagram', 'Instagram'], ['x', 'X (Twitter)'], ['linkedin', 'LinkedIn'], ['behance', 'Behance'], ['dribbble', 'Dribbble'], ['link', 'Other link']].map(([v, l]) => `<option value="${v}" ${s.kind === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
        <label>Name<input data-soc-field="label" value="${esc(s.label)}"></label>
        <label class="full">Link<input data-soc-field="url" value="${esc(s.url)}" placeholder="https://…"></label>
        <button class="admin-mini-remove" type="button" data-soc-remove="${i}">Remove</button>
      </div>`).join('');
  }
  function renderPosterSocials(){
    content.poster.socials = content.poster.socials || [];
    $('#posterSocialsEditor').innerHTML = content.poster.socials.map((it, i) => listRow(i, `
        <label>Label<input data-ps-field="label" value="${esc(it.label)}" placeholder="Instagram"></label>
        <label>Link<input data-ps-field="url" value="${esc(it.url)}" placeholder="https://instagram.com/…"></label><span></span>`, 'data-ps-remove')).join('');
  }
  function fillContentForm(){
    content.poster = content.poster || {}; content.poster.headLines = String(content.poster.head || '').split('\n');
    $$('#panel-content [data-path]').forEach(el => {
      const val = getPath(content, el.dataset.path);
      if (el.type === 'checkbox') el.checked = !!val;
      else if (el.dataset.list === 'comma') el.value = Array.isArray(val) ? val.join(', ') : '';
      else if (el.dataset.list === 'lines') el.value = Array.isArray(val) ? val.join('\n') : '';
      else el.value = val == null ? '' : val;
    });
    renderFileFields(); renderNavLinks(); renderExpRows(); renderLinks(); renderTestimonials(); renderStats(); renderLogoLists(); renderPosterSocials(); renderSteps(); renderResources(); renderSocials();
  }
  fillContentForm();

  const contentPanel = $('#panel-content');
  contentPanel.addEventListener('input', e => {
    const el = e.target;
    if (el.dataset.path) {
      let val = el.type === 'checkbox' ? el.checked : el.type === 'number' ? Number(el.value) : el.value;
      if (el.dataset.list === 'comma') val = el.value.split(',').map(s => s.trim()).filter(Boolean);
      else if (el.dataset.list === 'lines') val = el.value.split('\n').map(s => s.trim()).filter(Boolean);
      setPath(content, el.dataset.path, val);
      if (el.dataset.path === 'poster.headLines') content.poster.head = val.join('\n');
    }
    if (el.dataset.fileText) setPath(content, el.dataset.fileText, el.value);
    const row = el.closest('.admin-mini-row'); const idx = row ? Number(row.dataset.index) : -1;
    if (el.dataset.navlinkField) content.nav.links[idx][el.dataset.navlinkField] = el.value;
    if (el.dataset.expField) content.experience.rows[idx][el.dataset.expField] = el.value;
    if (el.dataset.linkField) content.links.items[idx][el.dataset.linkField] = el.value;
    if (el.dataset.testimonialField) content.testimonials.items[idx][el.dataset.testimonialField] = el.value;
    if (el.dataset.statField) content.proof.stats[idx][el.dataset.statField] = el.value;
    if (el.dataset.psField) content.poster.socials[idx][el.dataset.psField] = el.value;
    if (el.dataset.socField) content.socials[idx][el.dataset.socField] = el.value;
    if (el.dataset.stepField) content.process.steps[idx][el.dataset.stepField] = el.value;
    if (el.dataset.resField) content.resources.items[idx][el.dataset.resField] = el.value;
    if (el.dataset.llField) { const tile = el.closest('.admin-logo-tile'); content[tile.dataset.list].items[Number(tile.dataset.index)][el.dataset.llField] = el.value; }
  });
  contentPanel.addEventListener('click', e => {
    let m; const t = e.target;
    if ((m = t.closest('[data-navlink-remove]'))) { content.nav.links.splice(Number(m.dataset.navlinkRemove), 1); renderNavLinks(); }
    if ((m = t.closest('[data-exp-remove]'))) { content.experience.rows.splice(Number(m.dataset.expRemove), 1); renderExpRows(); }
    if ((m = t.closest('[data-link-remove]'))) { content.links.items.splice(Number(m.dataset.linkRemove), 1); renderLinks(); }
    if ((m = t.closest('[data-testimonial-remove]'))) { content.testimonials.items.splice(Number(m.dataset.testimonialRemove), 1); renderTestimonials(); }
    if ((m = t.closest('[data-soc-remove]'))) { content.socials.splice(Number(m.dataset.socRemove), 1); renderSocials(); }
    if (t.closest('[data-soc-upload-btn]')) t.closest('.admin-soc-row').querySelector('[data-soc-upload]').click();
    if (t.closest('[data-soc-clear]')) { content.socials[Number(t.closest('.admin-soc-row').dataset.index)].icon = ''; renderSocials(); }
    if ((m = t.closest('[data-step-remove]'))) { content.process.steps.splice(Number(m.dataset.stepRemove), 1); renderSteps(); }
    if ((m = t.closest('[data-res-remove]'))) { content.resources.items.splice(Number(m.dataset.resRemove), 1); renderResources(); }
    if (t.closest('[data-res-upload-btn]')) t.closest('.admin-res-row').querySelector('[data-res-upload]').click();
    if (t.closest('[data-res-clear]')) { content.resources.items[Number(t.closest('.admin-res-row').dataset.index)].image = ''; renderResources(); }
    if ((m = t.closest('[data-ps-remove]'))) { content.poster.socials.splice(Number(m.dataset.psRemove), 1); renderPosterSocials(); }
    if ((m = t.closest('[data-stat-remove]'))) { content.proof.stats.splice(Number(m.dataset.statRemove), 1); renderStats(); }
    const tile = t.closest('.admin-logo-tile'), tlist = tile && content[tile.dataset.list].items, ti = tile ? Number(tile.dataset.index) : -1;
    if (tile && t.closest('[data-ll-upload-btn]')) tile.querySelector('[data-ll-upload]').click();
    if (tile && (m = t.closest('[data-ll-move]'))) { const j = ti + Number(m.dataset.llMove); if (j >= 0 && j < tlist.length) { [tlist[ti], tlist[j]] = [tlist[j], tlist[ti]]; renderLogoList(tile.dataset.list); } }
    if (tile && t.closest('[data-ll-remove]')) { tlist.splice(ti, 1); renderLogoList(tile.dataset.list); }
    if (t.closest('[data-ll-add]')) { const k = t.closest('[data-list]').dataset.list; content[k].items.push({ name: '', logo: '' }); renderLogoList(k); }
    if ((m = t.closest('[data-file-upload-btn]'))) m.parentElement.querySelector('input[type=file]')?.click();
    if ((m = t.closest('[data-file-clear]'))) { setPath(content, m.dataset.fileClear, ''); renderFileFields(); }
  });
  contentPanel.addEventListener('change', async e => {
    const t = e.target;
    if (t.dataset.fileText) renderFileFields();
    if (t.matches('[data-soc-upload]') && t.files[0]) { content.socials[Number(t.closest('.admin-soc-row').dataset.index)].icon = await readImageResized(t.files[0], 200, true); renderSocials(); return; }
    if (t.dataset.socField === 'kind') { content.socials[Number(t.closest('.admin-soc-row').dataset.index)].kind = t.value; return; }
    if (t.matches('[data-res-upload]') && t.files[0]) { content.resources.items[Number(t.closest('.admin-res-row').dataset.index)].image = await readImageResized(t.files[0], 900); renderResources(); return; }
    if (t.dataset.resField === 'kind') return;
    if (t.matches('[data-ll-upload]') && t.files[0]) {
      const tile = t.closest('.admin-logo-tile'); content[tile.dataset.list].items[Number(tile.dataset.index)].logo = await readImageResized(t.files[0], 600, true);
      renderLogoList(tile.dataset.list); return;
    }
    if (t.matches('[data-ll-bulk]') && t.files.length) {
      const k = t.closest('[data-list]').dataset.list, files = Array.from(t.files).sort((x, y) => x.name.localeCompare(y.name, undefined, { numeric: true }));
      for (const f of files) content[k].items.push({ name: f.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '), logo: await readImageResized(f, 600, true) });
      renderLogoList(k); setStatus('contentStatus', `Added ${files.length} logo${files.length > 1 ? 's' : ''}. Save, then Publish.`); return;
    }
    if (t.matches('[data-file-upload]') && t.files[0]) {
      const kind = t.parentElement.dataset.kind || 'image';
      setPath(content, t.dataset.fileUpload, kind === 'file' ? await readFileAsDataURL(t.files[0]) : await readImageResized(t.files[0], 1600, /logo|badge|favicon|signImage/i.test(t.dataset.fileUpload)));
      renderFileFields();
    }
  });
  $('#addNavLink').addEventListener('click', () => { content.nav.links.push({ label: '', href: '#' }); renderNavLinks(); });
  $('#addExpRow').addEventListener('click', () => { content.experience.rows.push({ tag: '', role: '', meta: '' }); renderExpRows(); });
  $('#addLink').addEventListener('click', () => { content.links.items.push({ label: '', href: '#' }); renderLinks(); });
  $('#addSocial').addEventListener('click', () => { content.socials.push({ kind: 'link', label: '', url: '', icon: '' }); renderSocials(); });
  $('#addStep').addEventListener('click', () => { content.process.steps.push({ title: '', text: '' }); renderSteps(); });
  $('#addResource').addEventListener('click', () => { content.resources.items.push({ title: '', by: '', kind: 'Book', image: '', url: '' }); renderResources(); });
  $('#addPosterSocial').addEventListener('click', () => { content.poster.socials.push({ label: '', url: '' }); renderPosterSocials(); });
  $('#addStat').addEventListener('click', () => { content.proof.stats.push({ value: '', label: '' }); renderStats(); });
  $('#addTestimonial').addEventListener('click', () => { content.testimonials.items.push({ quote: '', name: '', role: '' }); renderTestimonials(); });

  async function saveDraft(key, value, statusId, quiet){
    try { await idb.set(key, value); try { localStorage.removeItem(key); } catch (e) {}
      if (!quiet) setStatus(statusId, 'Saved as a draft in this browser (it survives a reload). Use the Publish tab to put it live on every device.'); }
    catch (e) {
      try { localStorage.setItem(key, JSON.stringify(value)); if (!quiet) setStatus(statusId, 'Saved as a draft in this browser.'); }
      catch (e2) { if (!quiet) setStatus(statusId, 'Could not keep a draft in this browser — Publish now so nothing is lost.'); }
    }
  }
  // every change is kept automatically a moment later, so a reload or a closed tab never loses uploads
  let autoT = null;
  function autosave(){
    clearTimeout(autoT);
    autoT = setTimeout(() => {
      saveDraft(CONTENT_STORAGE_KEY, content, null, true); saveDraft(THEME_STORAGE_KEY, theme, null, true); saveDraft(CATEGORIES_KEY, categories, null, true);
      const b = $('#autosaveNote'); if (b) b.textContent = 'All changes kept in this browser · ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }, 1200);
  }
  // if an unpublished draft was loaded, say so — with a one-click way back to what is live
  setTimeout(() => { if ([CONTENT_STORAGE_KEY, THEME_STORAGE_KEY, CATEGORIES_KEY].some(k => draftOf(k))) {
    const note = $('#autosaveNote');
    if (note) {
      note.innerHTML = 'You are editing your <b>unpublished draft</b> (kept in this browser). Publish it, or <button type="button" class="admin-upload-btn" id="discardDraft">discard it and load the live site</button>';
      $('#discardDraft').addEventListener('click', async () => {
        if (!confirm('Throw away the unpublished draft in this browser and load what is live?')) return;
        for (const k of [CONTENT_STORAGE_KEY, THEME_STORAGE_KEY, CATEGORIES_KEY, LEGACY_PROJECTS_KEY]) { try { localStorage.removeItem(k); } catch (e) {} await idb.del(k); }
        location.reload();
      });
    }
  } }, 0);
  ['input', 'change', 'click'].forEach(ev => document.addEventListener(ev, e => { if (e.target.closest && e.target.closest('.admin-panel') && !e.target.closest('#panel-publish')) autosave(); }, true));

  $('#saveContent').addEventListener('click', () => saveDraft(CONTENT_STORAGE_KEY, content, 'contentStatus'));
  $('#resetContent').addEventListener('click', () => {
    if (!confirm('Reset all text to the defaults? This clears your local edits.')) return;
    localStorage.removeItem(CONTENT_STORAGE_KEY); idb.del(CONTENT_STORAGE_KEY); content = cloneDefaultContent(); fillContentForm(); setStatus('contentStatus', 'Reset to defaults.');
  });

  /* ============================================================
     THEME TAB — mode, a light palette, a dark palette
  ============================================================ */
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

  let theme = migrateTheme(draftOf(THEME_STORAGE_KEY) || BASE.theme);
  function fillThemeForm(){
    $$('#panel-theme [data-tpath]').forEach(el => { el.value = getPath(theme, el.dataset.tpath); });
    $('#scaleValue').textContent = Number(theme.scale).toFixed(2) + '×';
  }
  fillThemeForm();
  $$('#panel-theme [data-tpath]').forEach(el => el.addEventListener('input', () => {
    setPath(theme, el.dataset.tpath, el.type === 'range' ? Number(el.value) : el.value);
    if (el.dataset.tpath === 'scale') $('#scaleValue').textContent = Number(el.value).toFixed(2) + '×';
  }));
  $('#saveTheme').addEventListener('click', () => saveDraft(THEME_STORAGE_KEY, theme, 'themeStatus'));
  $('#resetTheme').addEventListener('click', () => {
    if (!confirm('Reset colours, mode and heading size to the defaults?')) return;
    localStorage.removeItem(THEME_STORAGE_KEY); idb.del(THEME_STORAGE_KEY); theme = migrateTheme(null); fillThemeForm(); setStatus('themeStatus', 'Reset to defaults.');
  });

  /* ============================================================
     SECTIONS TAB — the five (or more) sections on the lens.
     Each one: title, card picture, how its page is laid out, background, lock,
     and either a list of case studies or a list of files.
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
    const saved = draftOf(CATEGORIES_KEY) || BASE.categories;
    if (Array.isArray(saved) && saved.length) return migrateCategories(JSON.parse(JSON.stringify(saved)));
    const legacy = draftOf(LEGACY_PROJECTS_KEY) || BASE.projects;
    if (Array.isArray(legacy) && legacy.length) return migrateCategories(categoriesFromLegacyProjects(JSON.parse(JSON.stringify(legacy))));
    return makeDefaultCategories();
  }
  let categories = loadCategories();
  let openCat = -1, openCase = -1;
  const listEl = $('#adminList');
  const pad2 = n => String(n).padStart(2, '0');
  const isData = s => String(s || '').startsWith('data:');
  const LAYOUT_LABELS = { cases: 'Case studies — a vertical list, each opens its own page', books: 'Book shelf — several editorials / magazines; each opens as its own flip book', book: 'Book — cover on its own, then pages side by side that flip like a real book (editorial / PDFs)', natural: 'Natural size — pictures and PDFs as uploaded', grid2: 'Grid, 2 columns (1 on phones) — good for social ads', grid3: 'Grid, 3 columns (2 on phones) — good for logos', stack: 'Stack — one under another' };

  // PDF → page pictures (for Book sections). pdf.js is fetched from cdnjs only when first needed.
  let pdfjsReady = null;
  function loadPdfJs(){
    if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
    if (!pdfjsReady) pdfjsReady = new Promise((res, rej) => {
      const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      s.onload = () => { window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'; res(window.pdfjsLib); };
      s.onerror = () => { pdfjsReady = null; rej(new Error('could not load the PDF reader')); }; document.head.appendChild(s);
    });
    return pdfjsReady;
  }
  async function pdfToPages(file, progress){
    const lib = await loadPdfJs(), doc = await lib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise, out = [];
    for (let i = 1; i <= doc.numPages; i++) {
      progress && progress(i, doc.numPages);
      const page = await doc.getPage(i), base = page.getViewport({ scale: 1 }), vp = page.getViewport({ scale: Math.min(3, 1600 / base.width) });
      const cv = document.createElement('canvas'); cv.width = Math.round(vp.width); cv.height = Math.round(vp.height);
      const g = cv.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, cv.width, cv.height);
      await page.render({ canvasContext: g, viewport: vp }).promise; out.push(cv.toDataURL('image/jpeg', .86));
    }
    return out;
  }
  function blockHTML(b, withCover){
    const acts = `<div class="admin-block-actions">${withCover && b.type === 'image' ? '<button type="button" data-set-cover>Use as cover</button>' : ''}<button type="button" data-b-move="-1" title="Move up">↑</button><button type="button" data-b-move="1" title="Move down">↓</button><button type="button" data-b-remove>Remove</button></div>`;
    const media = (kind, accept, thumb) => `<div class="admin-image-field">${thumb}
        <input type="text" data-bf="src" value="${isData(b.src) ? '' : esc(b.src || '')}" placeholder="${isData(b.src) ? 'Uploaded file' : 'URL or path'}">
        <input type="file" accept="${accept}" class="admin-upload-input" data-b-upload><button type="button" class="admin-upload-btn" data-b-upload-btn>${b.src ? 'Replace' : 'Upload'}</button></div>
        <input data-bf="captionTitle" placeholder="Caption heading (optional)" value="${esc(b.captionTitle || '')}">
        <textarea data-bf="caption" placeholder="Caption text (optional) — shown under the picture">${esc(b.caption || '')}</textarea>`;
    if (b.type === 'image') return `<div class="admin-block"><div class="admin-block-head"><span>Image</span>${acts}</div>${media('image', 'image/*', b.src ? `<img src="${esc(b.src)}" alt="">` : '<span class="admin-thumb-empty">None</span>')}</div>`;
    if (b.type === 'pdf') return `<div class="admin-block"><div class="admin-block-head"><span>PDF</span>${acts}</div>${media('pdf', 'application/pdf,.pdf', `<span class="admin-thumb-empty">${b.src ? 'PDF' : 'None'}</span>`)}</div>`;
    if (b.type === 'video') return `<div class="admin-block"><div class="admin-block-head"><span>Video</span>${acts}</div>${media('video', 'video/*', `<span class="admin-thumb-empty">${b.src ? 'Video' : 'None'}</span>`)}</div>`;
    return `<div class="admin-block"><div class="admin-block-head"><span>Text</span>${acts}</div>
      <input data-bf="heading" placeholder="Heading" value="${esc(b.heading || '')}"><textarea data-bf="body" placeholder="Text">${esc(b.body || '')}</textarea>
      <input data-bf="tagsText" placeholder="Optional tags, comma-separated" value="${esc((b.tags || []).join(', '))}"></div>`;
  }
  function blocksEditor(arr, withCover, hint){
    return `<p class="admin-hint">${hint}</p>
      ${(arr || []).map(b => blockHTML(b, withCover)).join('')}
      <div class="admin-block-add">
        <label class="admin-add-small admin-upload-label">+ Upload files (many at once)<input type="file" accept="image/*,application/pdf" multiple class="admin-upload-input" data-bulk-upload></label>
        <button type="button" class="admin-add-small" data-add-block="text">+ Text</button>
        <button type="button" class="admin-add-small" data-add-block="video">+ Video</button>
      </div>`;
  }
  function lockBox(o, label){
    return `<div class="admin-lock-panel">
      <label class="admin-check"><input type="checkbox" data-lock-toggle ${o.locked ? 'checked' : ''}> 🔒 Lock ${label} — it stays visible but opens on its own page that asks for a password</label>
      ${o.locked ? `<div class="admin-row2"><label>Password<input data-lk="password" autocomplete="off" value="${esc(o.password || '')}" placeholder="at least 4 characters"></label>
        <label>Message on the password page (optional)<input data-lk="lockNote" value="${esc(o.lockNote || '')}" placeholder="This work is private…"></label></div>` : ''}</div>`;
  }
  const unlockBox = () => `<div class="admin-lock-panel"><p class="admin-hint">This is locked and its content is hidden here. Enter its password to edit it.</p>
      <div class="admin-image-field"><input data-unlock-pw placeholder="Password" autocomplete="off"><button type="button" class="admin-upload-btn" data-unlock-btn>Unlock to edit</button></div><p class="admin-status" data-unlock-status></p></div>`;
  const bgField = o => `<label class="admin-check"><input type="checkbox" data-bgon ${o.bg ? 'checked' : ''}> Custom page background (light colours are skipped on the dark theme) <input type="color" data-bgcolor value="${o.bg || '#faf6ee'}" ${o.bg ? '' : 'disabled'}></label>`;
  const coverField = (src, label) => `<label>${label}
      <div class="admin-image-field">${src ? `<img src="${esc(src)}" alt="">` : '<span class="admin-thumb-empty">None</span>'}<input type="text" data-cover-text value="${isData(src) ? '' : esc(src || '')}" placeholder="${isData(src) ? 'Uploaded picture' : 'Picture URL, or upload'}">
        <input type="file" accept="image/*" class="admin-upload-input" data-cover-upload><button type="button" class="admin-upload-btn" data-cover-btn>Upload</button></div></label>`;
  const rowHead = (n, thumb, title, locked, extra) => `<header class="admin-project-head"><span class="admin-project-num">${pad2(n)}</span>
      ${thumb ? `<img class="admin-project-thumb" src="${esc(thumb)}" alt="">` : '<span class="admin-thumb-empty">No cover</span>'}
      <strong data-title-label>${esc(title || 'Untitled')}${locked ? ' 🔒' : ''}</strong>
      <div class="admin-project-actions"><button type="button" data-move="-1" title="Move up">↑</button><button type="button" data-move="1" title="Move down">↓</button>${extra}<button type="button" data-remove>Remove</button></div></header>`;
  const firstImg = list => { const b = (list || []).find(x => x.type === 'image' && x.src); return b ? b.src : ''; };

  // "Client / Industry / Country / Year / Director / Project Scope" rows at the top of a case study
  const STD_DETAILS = ['Client', 'Industry', 'Country', 'Year', 'Director', 'Project Scope'];
  function detailsEditor(cs){
    const rows = cs.details || [];
    return `<div class="admin-details"><p class="admin-hint"><b>Project details</b> — shown under the title (e.g. Client: Aimford). Rename, add or remove rows; rows with no value are hidden on the site.</p>
      ${rows.map((d, di) => `<div class="admin-mini-row" data-di="${di}">
        <label>Label<input data-df="label" value="${esc(d.label)}" placeholder="Client"></label>
        <label>Value<input data-df="value" value="${esc(d.value)}" placeholder="Aimford"></label>
        <button type="button" class="admin-mini-remove" data-d-move="-1" title="Move up">↑</button><button type="button" class="admin-mini-remove" data-d-move="1" title="Move down">↓</button>
        <button type="button" class="admin-mini-remove" data-d-remove>Remove</button></div>`).join('')}
      <div class="admin-block-add"><button type="button" class="admin-add-small" data-d-add>+ Add a row</button>
      ${rows.length ? '' : `<button type="button" class="admin-add-small" data-d-std>+ Add ${STD_DETAILS.join(', ')}</button>`}</div></div>`;
  }
  function caseHTML(cs, si){
    const open = openCase === si, needs = cs.locked && cs.enc && !Array.isArray(cs.blocks);
    return `<article class="admin-case${open ? ' is-open' : ''}" data-si="${si}">
      ${rowHead(si + 1, cs.cover || firstImg(cs.blocks), cs.title, cs.locked, `<button type="button" data-case-toggle>${open ? 'Close' : 'Edit'}</button>`)}
      ${open ? `<div class="admin-project-body">
        <div class="admin-row2"><label>Title<input data-sf="title" value="${esc(cs.title || '')}"></label><label>Short line under the title (optional)<input data-sf="tagline" value="${esc(cs.tagline || '')}"></label></div>
        ${needs ? '' : detailsEditor(cs)}
        ${coverField(cs.cover, 'Cover picture (shown in the list) — or click "Use as cover" on any picture below')}
        <div class="admin-row2"><label class="admin-check"><input type="checkbox" data-sf="tight" ${cs.tight !== false ? 'checked' : ''}> No gaps between pictures (edge to edge)</label>${bgField(cs)}</div>
        ${lockBox(cs, 'this case study')}
        ${needs ? unlockBox() : blocksEditor(cs.blocks, true, 'Pictures should be 1920 px wide, any height — wider ones are shrunk for you. Pick many at once; they are added in file-name order.')}
      </div>` : ''}</article>`;
  }
  function categoryHTML(c, i){
    const open = openCat === i, needs = c.locked && c.enc && !Array.isArray(c.items), cases = c.layout === 'cases' || c.layout === 'books';
    const body = !open ? '' : `<div class="admin-project-body">
        <div class="admin-row2"><label>Name (also on its floating card)<input data-cf="title" value="${esc(c.title || '')}"></label>
          <label>How its page is laid out<select data-cf="layout">${LAYOUTS.map(l => `<option value="${l}" ${c.layout === l ? 'selected' : ''}>${esc(LAYOUT_LABELS[l])}</option>`).join('')}</select></label></div>
        <label>Short intro on its page (optional)<input data-cf="intro" value="${esc(c.intro || '')}"></label>
        <label>Questionnaire button on its page<select data-cf="brief">${[['', 'Automatic (from the section name)'], ['branding', 'Brand identity'], ['logo', 'Logo design'], ['editorial', 'Editorial / publication'], ['events', 'Event branding'], ['eventdesign', 'Event designs'], ['campaign', 'Campaign / social ads'], ['none', 'No button']].map(([v, l]) => `<option value="${v}" ${(c.brief || '') === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
        ${coverField(c.image, 'Card picture (floating card + gallery) — empty = its first picture')}
        <div class="admin-row2">${bgField(c)}
          ${c.layout === 'stack' ? `<label class="admin-check"><input type="checkbox" data-cf="tight" ${c.tight ? 'checked' : ''}> No gaps between pictures</label>` : ''}
          ${c.layout === 'grid2' || c.layout === 'grid3' ? `<label class="admin-check"><input type="checkbox" data-cf="tile" ${c.tile ? 'checked' : ''}> Show each picture on a soft tile (good for logos)</label>` : ''}</div>
        ${lockBox(c, 'this whole section')}
        ${needs ? unlockBox() : cases
          ? `<p class="admin-hint">${c.layout === 'books' ? 'Editorials — each one opens as its own flip book. In each: the FIRST picture is its cover, the rest are its pages (upload a PDF and every page is added for you).' : 'Case studies — each opens its own page. Click Edit on one to change it.'}</p>${(c.items || []).map(caseHTML).join('')}<button type="button" class="admin-add-small" data-add-case>${c.layout === 'books' ? '+ Add an editorial' : '+ Add a case study'}</button>`
          : blocksEditor(c.items, true, c.layout === 'book' ? 'Book: the FIRST picture is the cover (shown on its own), then the pages follow in pairs, left and right. Upload a PDF and every page becomes a picture automatically, or upload page pictures (all the same size). Reorder with ↑ ↓.' : 'Pictures should be 1920 px wide, any height (PDFs are fine too). Pick many at once; they are added in file-name order.')}
      </div>`;
    return `<article class="admin-project${open ? ' is-open' : ''}" data-ci="${i}">${rowHead(i + 1, c.image || (cases ? ((c.items || []).map(s => s.cover || firstImg(s.blocks)).find(Boolean) || '') : firstImg(c.items)), c.title, c.locked, `<button type="button" data-cat-toggle>${open ? 'Close' : 'Edit'}</button>`)}${body}</article>`;
  }
  function renderCategories(){ listEl.innerHTML = categories.map(categoryHTML).join(''); }
  renderCategories();

  // what an event happened inside: the section, maybe a case study in it, maybe a file/block in that
  function ctx(el){
    const catEl = el.closest('.admin-project'); if (!catEl) return null;
    const ci = Number(catEl.dataset.ci), cat = categories[ci], caseEl = el.closest('.admin-case');
    const si = caseEl ? Number(caseEl.dataset.si) : -1, cs = si >= 0 ? cat.items[si] : null;
    const owner = cs || cat, blockEl = el.closest('.admin-block');
    const arr = cs ? cs.blocks : cat.items;
    const bi = blockEl ? [...blockEl.parentElement.children].filter(x => x.classList.contains('admin-block')).indexOf(blockEl) : -1;
    return { ci, cat, si, cs, owner, arr, bi, catEl, caseEl, field: cs ? 'blocks' : 'items' };
  }
  const caseBlocksOnly = c => (c.cat.layout === 'cases' || c.cat.layout === 'books') && !c.cs;   // (a "cases" section has no direct files)

  listEl.addEventListener('input', e => {
    const c = ctx(e.target); if (!c) return; const t = e.target;
    if (t.dataset.bf !== undefined) {
      const b = c.arr[c.bi];
      if (t.dataset.bf === 'tagsText') b.tags = t.value.split(',').map(s => s.trim()).filter(Boolean); else b[t.dataset.bf] = t.value;
      return;
    }
    if (t.matches('[data-bgon]')) { const col = t.parentElement.querySelector('[data-bgcolor]'); col.disabled = !t.checked; c.owner.bg = t.checked ? col.value : ''; return; }
    if (t.matches('[data-bgcolor]')) { c.owner.bg = t.value; return; }
    if (t.matches('[data-lock-toggle]')) { c.owner.locked = t.checked; if (!t.checked) { delete c.owner.password; delete c.owner.enc; } renderCategories(); return; }
    if (t.dataset.lk) { c.owner[t.dataset.lk] = t.value; return; }
    if (t.matches('[data-cover-text]')) { if (c.cs) c.cs.cover = t.value; else c.cat.image = t.value; return; }
    if (t.dataset.df && c.cs) { const di = Number(t.closest('[data-di]').dataset.di); c.cs.details[di][t.dataset.df] = t.value; return; }
    if (t.dataset.sf) { c.cs[t.dataset.sf] = t.type === 'checkbox' ? t.checked : t.value; if (t.dataset.sf === 'title') c.caseEl.querySelector('[data-title-label]').textContent = (t.value || 'Untitled') + (c.cs.locked ? ' 🔒' : ''); return; }
    if (t.dataset.cf === 'layout') {
      const old = c.cat.layout, neu = t.value, had = (c.cat.items || []).length;
      const grp = l => l === 'cases' || l === 'books';
      // one book → a shelf: the pages you already have become the first editorial (nothing is lost)
      if (old === 'book' && neu === 'books') {
        const pages = c.cat.items || [];
        c.cat.items = pages.length ? [{ id: 'ed-' + Date.now(), title: (c.cat.title || 'Editorial') + ' 1', cover: (pages.find(b => b.type === 'image') || {}).src || '', tagline: '', bg: '', tight: true, blocks: pages }] : [];
        c.cat.layout = neu; renderCategories(); return;
      }
      if (old === 'books' && neu === 'book' && (c.cat.items || []).length === 1) { c.cat.items = c.cat.items[0].blocks || []; c.cat.layout = neu; renderCategories(); return; }
      const incompatible = had && grp(neu) !== grp(old);
      if (incompatible && !confirm('Switching to or from a list of case studies / editorials clears what is in this section. Continue?')) { t.value = old; return; }
      if (incompatible) c.cat.items = [];
      c.cat.layout = neu; renderCategories(); return;
    }
    if (t.dataset.cf) {
      const f = t.dataset.cf; c.cat[f] = t.type === 'checkbox' ? t.checked : t.value;
      if (f === 'title') c.catEl.querySelector(':scope > .admin-project-head [data-title-label]').textContent = (t.value || 'Untitled') + (c.cat.locked ? ' 🔒' : '');
      if (f === 'layout') {
        if (t.value === 'cases' && !(c.cat.items || []).every(x => x.blocks)) c.cat.items = [];
        if (t.value !== 'cases' && (c.cat.items || []).some(x => x.blocks && !x.type)) c.cat.items = [];
        renderCategories();
      }
    }
  });
  listEl.addEventListener('change', async e => {
    const c = ctx(e.target); if (!c) return; const t = e.target;
    if (t.matches('[data-cover-text]')) { renderCategories(); return; }
    if (t.matches('[data-cover-upload]') && t.files[0]) { const u = await readImageResized(t.files[0], 1400); if (c.cs) c.cs.cover = u; else c.cat.image = u; renderCategories(); return; }
    if (t.matches('[data-b-upload]') && t.files[0]) {
      const f = t.files[0]; c.arr[c.bi].src = f.type === 'application/pdf' ? await readFileAsDataURL(f) : /^video\//.test(f.type) ? await readFileAsDataURL(f) : await readImageResized(f, 1920);
      if (f.type === 'application/pdf') c.arr[c.bi].type = 'pdf';
      renderCategories(); return;
    }
    if (t.matches('[data-bulk-upload]') && t.files.length) {
      const files = Array.from(t.files).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
      setStatus('sectionsStatus', `Adding ${files.length} file${files.length > 1 ? 's' : ''}…`);
      const target = c.cs ? (c.cs.blocks = c.cs.blocks || []) : (c.cat.items = c.cat.items || []);
      const asBook = (!c.cs && c.cat.layout === 'book') || (c.cs && c.cat.layout === 'books');
      for (const f of files) {
        if (f.type === 'application/pdf' && asBook) {   // a PDF in a Book section becomes its pages, in order
          try { for (const src of await pdfToPages(f, (i, n) => setStatus('sectionsStatus', `Turning "${f.name}" into pages… ${i} of ${n}`))) target.push({ type: 'image', src }); }
          catch (err) { setStatus('sectionsStatus', 'Could not read that PDF here (it needs an internet connection the first time): ' + (err.message || err)); target.push({ type: 'pdf', src: await readFileAsDataURL(f) }); }
        }
        else if (f.type === 'application/pdf') target.push({ type: 'pdf', src: await readFileAsDataURL(f) });
        else target.push({ type: 'image', src: await readImageResized(f, 1920) });
      }
      setStatus('sectionsStatus', `Added ${files.length}. Reorder with the ↑ ↓ buttons, then Publish.`); renderCategories(); return;
    }
    if (t.dataset.bf === 'src') renderCategories();
  });
  listEl.addEventListener('click', async e => {
    const t = e.target, c = ctx(t); if (!c) return; let m;
    if (t.closest('[data-cat-toggle]')) { openCat = openCat === c.ci ? -1 : c.ci; openCase = -1; renderCategories(); return; }
    if (t.closest('[data-case-toggle]')) { openCase = openCase === c.si ? -1 : c.si; renderCategories(); return; }
    if (c.cs && t.closest('[data-d-add]')) { (c.cs.details = c.cs.details || []).push({ label: '', value: '' }); renderCategories(); return; }
    if (c.cs && t.closest('[data-d-std]')) { c.cs.details = STD_DETAILS.map(label => ({ label, value: '' })); renderCategories(); return; }
    if (c.cs && t.closest('[data-d-remove]')) { c.cs.details.splice(Number(t.closest('[data-di]').dataset.di), 1); renderCategories(); return; }
    if (c.cs && (m = t.closest('[data-d-move]'))) {
      const arr = c.cs.details, i = Number(m.closest('[data-di]').dataset.di), j = i + Number(m.dataset.dMove);
      if (j >= 0 && j < arr.length) { [arr[i], arr[j]] = [arr[j], arr[i]]; renderCategories(); } return;
    }
    if ((m = t.closest('[data-move]')) && !c.blockEl_) {
      const inCase = !!c.caseEl, list = inCase ? c.cat.items : categories, idx = inCase ? c.si : c.ci, j = idx + Number(m.dataset.move);
      if (j >= 0 && j < list.length) {
        [list[idx], list[j]] = [list[j], list[idx]];
        if (inCase) openCase = openCase === idx ? j : openCase === j ? idx : openCase; else openCat = openCat === idx ? j : openCat === j ? idx : openCat;
        renderCategories();
      }
      return;
    }
    if (t.closest('[data-remove]') && !t.closest('.admin-block')) {
      if (!confirm(`Remove "${(c.cs || c.cat).title}"?`)) return;
      if (c.cs) { c.cat.items.splice(c.si, 1); openCase = -1; } else { categories.splice(c.ci, 1); openCat = -1; }
      renderCategories(); return;
    }
    if (t.closest('[data-cover-btn]')) { t.closest('label').querySelector('[data-cover-upload]').click(); return; }
    if (t.closest('[data-b-upload-btn]')) { t.closest('.admin-block').querySelector('[data-b-upload]').click(); return; }
    if (t.closest('[data-set-cover]')) { const src = c.arr[c.bi].src; if (c.cs) c.cs.cover = src; else c.cat.image = src; renderCategories(); return; }
    if ((m = t.closest('[data-b-move]'))) { const j = c.bi + Number(m.dataset.bMove); if (j >= 0 && j < c.arr.length) { [c.arr[c.bi], c.arr[j]] = [c.arr[j], c.arr[c.bi]]; renderCategories(); } return; }
    if (t.closest('.admin-block') && t.closest('[data-b-remove]')) { c.arr.splice(c.bi, 1); renderCategories(); return; }
    if ((m = t.closest('[data-add-block]'))) {
      const target = c.cs ? (c.cs.blocks = c.cs.blocks || []) : (c.cat.items = c.cat.items || []);
      target.push(m.dataset.addBlock === 'video' ? { type: 'video', src: '', caption: '' } : { type: 'text', heading: '', body: '', tags: [] });
      renderCategories(); return;
    }
    if (t.closest('[data-add-case]')) {
      c.cat.items = c.cat.items || [];
      c.cat.items.push({ id: 'case-' + Date.now(), title: (c.cat.layout === 'books' ? 'Editorial ' : 'Case study ') + (c.cat.items.length + 1), cover: '', tagline: '', bg: '', tight: true, details: STD_DETAILS.map(label => ({ label, value: '' })), blocks: [] });
      openCase = c.cat.items.length - 1; renderCategories(); return;
    }
    if (t.closest('[data-unlock-btn]')) {
      const box = t.closest('.admin-lock-panel'), pw = box.querySelector('[data-unlock-pw]').value, st = box.querySelector('[data-unlock-status]');
      if (!(window.crypto && crypto.subtle)) { st.textContent = 'This browser cannot unlock here (needs https).'; return; }
      try {
        const d = await decryptJSON(c.owner.enc, pw);
        if (c.cs) { c.cs.blocks = d.blocks || []; if (Array.isArray(d.details)) c.cs.details = d.details; } else c.cat.items = (d.items || []).map((x, i) => (c.cat.layout === 'cases' || c.cat.layout === 'books') ? migrateCase(x, i) : x);
        c.owner.password = pw; delete c.owner.enc; renderCategories();
      } catch (err) { st.textContent = 'Wrong password'; }
    }
  });
  $('#addCategory').addEventListener('click', () => {
    categories.push({ id: 'cat-' + Date.now(), title: 'New section', layout: 'stack', image: '', intro: '', bg: '', tight: true, tile: false, items: [] });
    openCat = categories.length - 1; openCase = -1; renderCategories();
    listEl.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  $('#saveSections').addEventListener('click', () => saveDraft(CATEGORIES_KEY, categories, 'sectionsStatus'));
  $('#resetSections').addEventListener('click', () => {
    if (!confirm('Reset to the five starter sections? This clears your local draft.')) return;
    localStorage.removeItem(CATEGORIES_KEY); idb.del(CATEGORIES_KEY); categories = makeDefaultCategories(); openCat = -1; openCase = -1; renderCategories(); setStatus('sectionsStatus', 'Reset to the starter sections.');
  });

  /* ============================================================
     PUBLISH TAB — sends your edits to GitHub so every device sees them
     Writes site-data.json (text, colors, work) to the repo, and uploads any
     freshly added images/videos into assets/uploads/. The token is the real
     key: without it nobody can publish, and it never goes into the code.
  ============================================================ */
  const GH_KEY = 'ferricool-github-settings';
  const ghDefaults = { owner:'Helloutidex', repo:'portfolio-v1', branch:'main', token:'' };
  let gh = { ...ghDefaults };
  try { gh = { ...ghDefaults, ...(JSON.parse(localStorage.getItem(GH_KEY)) || {}) }; } catch (e) {}
  ['owner','repo','branch','token'].forEach(k => {
    const el = $('#gh-' + k); if (!el) return;
    el.value = gh[k] || '';
    el.addEventListener('input', () => { gh[k] = el.value.trim(); localStorage.setItem(GH_KEY, JSON.stringify(gh)); });
  });
  $('#ghForget')?.addEventListener('click', () => {
    gh.token = ''; localStorage.setItem(GH_KEY, JSON.stringify(gh)); const t = $('#gh-token'); if (t) t.value = '';
    setStatus('publishStatus', 'Token removed from this device.');
  });
  const b64 = str => btoa(unescape(encodeURIComponent(str)));
  async function ghApi(method, path, body){
    const url = `https://api.github.com/repos/${gh.owner}/${gh.repo}/contents/${path}` + (method === 'GET' ? `?ref=${encodeURIComponent(gh.branch)}` : '');
    const res = await fetch(url, {
      method,
      headers: { 'Authorization': `Bearer ${gh.token}`, 'Accept': 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    let data = null; try { data = await res.json(); } catch (e) {}
    if (!res.ok && !(method === 'GET' && res.status === 404)) {
      const msg = (data && data.message) || res.statusText;
      throw new Error(
        res.status === 401 ? 'GitHub rejected the token (401). Check it was pasted in full and has not expired.' :
        res.status === 403 ? `GitHub refused (403): ${msg}. The token needs "Contents: Read and write" on this repository.` :
        res.status === 404 ? 'Repository not found (404). Check the username and repository name, and that the token has access to this repository.' :
        res.status === 409 || res.status === 422 ? `GitHub could not save the file (${res.status}): ${msg}. Wait a few seconds and try again.` :
        `GitHub error ${res.status}: ${msg}`);
    }
    return { status: res.status, data };
  }
  const EXT = { 'image/jpeg':'jpg','image/jpg':'jpg','image/png':'png','image/webp':'webp','image/gif':'gif','image/svg+xml':'svg','image/avif':'avif','video/mp4':'mp4','video/webm':'webm','video/quicktime':'mov','application/pdf':'pdf' };
  const uploadCache = new Map(); // data URL -> repo path, so the same file isn't uploaded twice in one session
  function collectDataUrls(v, found = new Set()){
    if (typeof v === 'string') { if (v.startsWith('data:')) found.add(v); }
    else if (Array.isArray(v)) v.forEach(x => collectDataUrls(x, found));
    else if (v && typeof v === 'object') Object.values(v).forEach(x => collectDataUrls(x, found));
    return found;
  }
  async function swapDataUrls(v, progress){
    if (typeof v === 'string' && v.startsWith('data:')) {
      if (uploadCache.has(v)) return uploadCache.get(v);
      const m = v.match(/^data:([^;,]+)(?:;[^,]*)?;base64,(.*)$/);
      if (!m) return v;
      const path = `assets/uploads/${Date.now().toString(36)}-${progress.n}.${EXT[m[1]] || 'bin'}`;
      progress.n++;
      setStatus('publishStatus', `Uploading file ${progress.n} of ${progress.total}…`);
      await ghApi('PUT', path, { message: `Upload ${path} from admin`, content: m[2], branch: gh.branch });
      uploadCache.set(v, path);
      return path;
    }
    if (Array.isArray(v)) { const out = []; for (const x of v) out.push(await swapDataUrls(x, progress)); return out; }
    if (v && typeof v === 'object') { const out = {}; for (const k of Object.keys(v)) { if (k === '__i') continue; out[k] = await swapDataUrls(v[k], progress); } return out; }
    return v;
  }
  $('#publishBtn')?.addEventListener('click', async () => {
    const btn = $('#publishBtn');
    if (!gh.token) { setStatus('publishStatus', 'Paste your GitHub token first — the steps are just below.'); return; }
    btn.disabled = true;
    try {
      setStatus('publishStatus', 'Preparing… keep this page open until it says "Published".');
      const lockedNodes = [];
      for (const c of categories) {
        if (c.locked && Array.isArray(c.items)) lockedNodes.push(c);
        if (c.layout === 'cases' || c.layout === 'books') for (const s of (c.items || [])) if (s.locked && Array.isArray(s.blocks)) lockedNodes.push(s);
      }
      for (const n of lockedNodes) if (String(n.password || '').length < 4) throw new Error(`"${n.title}" is locked but has no password yet — type one of at least 4 characters.`);
      if (lockedNodes.length && !(window.crypto && crypto.subtle)) throw new Error('This browser cannot lock work here (it needs https). Use the live admin page.');
      const payload = JSON.parse(JSON.stringify({ content, theme, categories }));
      const progress = { n: 0, total: [...collectDataUrls(payload)].filter(u => !uploadCache.has(u)).length };
      const clean = await swapDataUrls(payload, progress);
      clean.updatedAt = new Date().toISOString();
      // the files are on GitHub now: keep their new paths in the editor + draft, so a retry never re-uploads or loses them
      content = JSON.parse(JSON.stringify(clean.content)); theme = JSON.parse(JSON.stringify(clean.theme)); categories = JSON.parse(JSON.stringify(clean.categories));
      await saveDraft(CONTENT_STORAGE_KEY, content, null, true); await saveDraft(THEME_STORAGE_KEY, theme, null, true); await saveDraft(CATEGORIES_KEY, categories, null, true);
      // What goes online: locked sections / case studies are encrypted with their password; the password itself is never sent.
      const pubCase = async s => {
        const { password, ...rest } = s;
        if (s.locked && Array.isArray(s.blocks)) { const { blocks, details, ...pub } = rest; return { ...pub, locked: true, enc: await encryptJSON({ blocks, details: details || [] }, password) }; }
        if (s.locked && s.enc) { const { blocks, details, ...pub } = rest; return { ...pub, locked: true }; }
        const { enc, locked, lockNote, ...pub } = rest; return pub;
      };
      const published = { ...clean, categories: [] };
      for (const c of clean.categories) {
        const { password, ...rest } = c; let items = rest.items;
        if (Array.isArray(items) && (c.layout === 'cases' || c.layout === 'books')) { const out = []; for (const s of items) out.push(await pubCase(s)); items = out; }
        if (c.locked && Array.isArray(c.items)) { const { items: _drop, ...pub } = rest; published.categories.push({ ...pub, locked: true, enc: await encryptJSON({ items }, password) }); }
        else if (c.locked && c.enc) { const { items: _drop, ...pub } = rest; published.categories.push({ ...pub, locked: true }); }
        else { const { enc, locked, lockNote, ...pub } = rest; published.categories.push({ ...pub, items }); }
      }
      setStatus('publishStatus', 'Saving your changes to GitHub…');
      // save the page data; if GitHub is busy or the file just changed (e.g. a git push), fetch it again and retry
      let saved = false, lastErr = null;
      for (let attempt = 1; attempt <= 4 && !saved; attempt++) {
        try {
          const existing = await ghApi('GET', 'site-data.json');
          const sha = existing.status === 200 && existing.data ? existing.data.sha : undefined;
          await ghApi('PUT', 'site-data.json', { message: 'Publish site changes from admin', content: b64(JSON.stringify(published, null, 2)), branch: gh.branch, ...(sha ? { sha } : {}) });
          saved = true;
        } catch (e) { lastErr = e; setStatus('publishStatus', `Saving the page data… retrying (${attempt})`); await new Promise(r => setTimeout(r, 1500 * attempt)); }
      }
      if (!saved) throw new Error('your files were uploaded, but the page data could not be saved (' + (lastErr && lastErr.message || lastErr) + '). Nothing is lost — press Publish again.');
      try { localStorage.setItem(LAST_PUB_KEY, JSON.stringify(clean)); } catch (e) {}
      [CONTENT_STORAGE_KEY, THEME_STORAGE_KEY, CATEGORIES_KEY, LEGACY_PROJECTS_KEY].forEach(k => { try { localStorage.removeItem(k); } catch (e) {} idb.del(k); });
      setStatus('publishStatus', `Published at ${new Date().toLocaleTimeString()}. GitHub is rebuilding the site — it should be live on every device in about a minute (some phones can take up to 10).`);
    } catch (err) {
      setStatus('publishStatus', 'Could not publish: ' + (err && err.message ? err.message : err));
      console.error(err);
    } finally { btn.disabled = false; }
  });
} catch (err) {
  // If anything above throws, show it directly on the page — no DevTools needed
  // to see what broke. Always visible regardless of the lock screen's state.
  const banner = document.createElement('div');
  banner.style.cssText = 'position:fixed;inset:16px;z-index:99999;background:#fff;color:#900;border:2px solid #900;border-radius:12px;padding:20px;font:14px/1.5 monospace;overflow:auto;white-space:pre-wrap';
  banner.textContent = 'The admin page hit an error and stopped working:\n\n' + (err && err.stack ? err.stack : String(err)) + '\n\nScreenshot this whole box and send it over.';
  document.body.appendChild(banner);
  console.error(err);
}
})();
