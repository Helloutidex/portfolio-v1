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
  const BASE = (LASTPUB && (!REMOTE.updatedAt || LASTPUB.updatedAt >= REMOTE.updatedAt)) ? LASTPUB : REMOTE;
  const draftOf = key => { try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; } };
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

  // Resize big pictures to 1920px wide before they're stored/published (taller is fine).
  async function readImageResized(file, maxW){
    const url = await readFileAsDataURL(file);
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return url;
    try {
      const img = await new Promise((res, rej) => {
        const i = new Image(); const t = setTimeout(() => rej(new Error('timeout')), 4000);
        i.onload = () => { clearTimeout(t); res(i); }; i.onerror = () => { clearTimeout(t); rej(new Error('bad image')); }; i.src = url;
      });
      if (img.width <= maxW) return url;
      const h = Math.round(img.height * (maxW / img.width));
      if (maxW * h > 16000000) return url;
      const c = document.createElement('canvas'); c.width = maxW; c.height = h;
      c.getContext('2d').drawImage(img, 0, 0, maxW, h);
      const out = c.toDataURL(file.type, 0.88);
      return out.startsWith('data:image') ? out : url;
    } catch (e) { return url; }
  }

  function renderExpRows(){
    $('#expRowsEditor').innerHTML = content.experience.rows.map((r, i) => `
      <div class="admin-mini-row" data-index="${i}">
        <label>Tag<input data-exp-field="tag" value="${esc(r.tag)}"></label>
        <label>Role<input data-exp-field="role" value="${esc(r.role)}"></label>
        <label>Meta<input data-exp-field="meta" value="${esc(r.meta)}"></label>
        <button class="admin-mini-remove" type="button" data-exp-remove="${i}">Remove</button>
      </div>`).join('');
  }
  function renderLinks(){
    $('#linksEditor').innerHTML = content.links.items.map((it, i) => `
      <div class="admin-mini-row" data-index="${i}">
        <label>Label<input data-link-field="label" value="${esc(it.label)}"></label>
        <label>Href<input data-link-field="href" value="${esc(it.href)}"></label>
        <span></span>
        <button class="admin-mini-remove" type="button" data-link-remove="${i}">Remove</button>
      </div>`).join('');
  }
  function renderCollabs(){
    $('#collabEditor').innerHTML = content.social.items.map((it, i) => `
      <div class="admin-mini-row admin-collab-row" data-index="${i}">
        <label>Logo<div class="admin-image-field">${it.logo ? `<img src="${esc(it.logo)}" alt="">` : `<span class="admin-thumb-empty">No logo</span>`}
          <input type="file" accept="image/*" data-collab-upload="${i}" class="admin-upload-input">
          <button type="button" class="admin-upload-btn" data-collab-upload-btn="${i}">Upload logo</button>
        </div></label>
        <label>Name<input data-collab-field="name" value="${esc(it.name)}"></label>
        <span></span>
        <button class="admin-mini-remove" type="button" data-collab-remove="${i}">Remove</button>
      </div>`).join('');
  }
  function renderTestimonials(){
    $('#testimonialsEditor').innerHTML = content.testimonials.items.map((t, i) => `
      <div class="admin-mini-row admin-testimonial-row" data-index="${i}">
        <label class="full">Quote<textarea data-testimonial-field="quote">${esc(t.quote)}</textarea></label>
        <label>Name<input data-testimonial-field="name" value="${esc(t.name)}"></label>
        <label>Role / company<input data-testimonial-field="role" value="${esc(t.role)}"></label>
        <button class="admin-mini-remove" type="button" data-testimonial-remove="${i}">Remove</button>
      </div>`).join('');
  }
  // Every [data-image-path] box becomes: preview + path box + Upload + Remove (works for pictures and for the PDF).
  function renderFileFields(){
    $$('#panel-content [data-image-path]').forEach(wrap => {
      const path = wrap.dataset.imagePath, kind = wrap.dataset.kind || 'image', accept = wrap.dataset.accept || 'image/*';
      const val = String(getPath(content, path) || ''), isData = val.startsWith('data:');
      const preview = !val ? `<span class="admin-thumb-empty">None</span>`
        : kind === 'file' ? `<span class="admin-thumb-empty">${isData ? 'New file' : 'File'}</span>` : `<img src="${esc(val)}" alt="">`;
      wrap.innerHTML = `${preview}
        <input type="text" data-file-text="${path}" value="${isData ? '' : esc(val)}" placeholder="${isData ? 'Uploaded — saved when you publish' : (kind === 'file' ? 'Path such as cv.pdf, or upload' : 'Path / URL, or upload')}">
        <input type="file" accept="${accept}" data-file-upload="${path}" class="admin-upload-input">
        <button type="button" class="admin-upload-btn" data-file-upload-btn>Upload</button>
        <button type="button" class="admin-upload-btn" data-file-clear="${path}">Remove</button>`;
    });
  }
  function fillContentForm(){
    $$('#panel-content [data-path]').forEach(el => {
      const val = getPath(content, el.dataset.path);
      if (el.dataset.list === 'comma') el.value = Array.isArray(val) ? val.join(', ') : '';
      else if (el.dataset.list === 'lines') el.value = Array.isArray(val) ? val.join('\n') : '';
      else el.value = val == null ? '' : val;
    });
    renderFileFields(); renderExpRows(); renderLinks(); renderCollabs(); renderTestimonials();
  }
  fillContentForm();

  $('#panel-content').addEventListener('input', e => {
    const el = e.target;
    if (el.dataset.path) {
      let val = el.value;
      if (el.dataset.list === 'comma') val = val.split(',').map(s => s.trim()).filter(Boolean);
      else if (el.dataset.list === 'lines') val = val.split('\n').map(s => s.trim()).filter(Boolean);
      setPath(content, el.dataset.path, val);
    }
    if (el.dataset.fileText) setPath(content, el.dataset.fileText, el.value);
    const idx = () => Number(el.closest('.admin-mini-row').dataset.index);
    if (el.dataset.expField) content.experience.rows[idx()][el.dataset.expField] = el.value;
    if (el.dataset.linkField) content.links.items[idx()][el.dataset.linkField] = el.value;
    if (el.dataset.collabField) content.social.items[idx()][el.dataset.collabField] = el.value;
    if (el.dataset.testimonialField) content.testimonials.items[idx()][el.dataset.testimonialField] = el.value;
  });
  $('#panel-content').addEventListener('change', e => { if (e.target.dataset.fileText) renderFileFields(); });
  $('#panel-content').addEventListener('click', e => {
    const t = e.target;
    let m;
    if ((m = t.closest('[data-exp-remove]'))) { content.experience.rows.splice(Number(m.dataset.expRemove), 1); renderExpRows(); }
    if ((m = t.closest('[data-link-remove]'))) { content.links.items.splice(Number(m.dataset.linkRemove), 1); renderLinks(); }
    if ((m = t.closest('[data-collab-remove]'))) { content.social.items.splice(Number(m.dataset.collabRemove), 1); renderCollabs(); }
    if ((m = t.closest('[data-testimonial-remove]'))) { content.testimonials.items.splice(Number(m.dataset.testimonialRemove), 1); renderTestimonials(); }
    if ((m = t.closest('[data-collab-upload-btn]'))) $(`[data-collab-upload="${m.dataset.collabUploadBtn}"]`)?.click();
    if ((m = t.closest('[data-file-upload-btn]'))) m.parentElement.querySelector('input[type=file]')?.click();
    if ((m = t.closest('[data-file-clear]'))) { setPath(content, m.dataset.fileClear, ''); renderFileFields(); }
  });
  $('#panel-content').addEventListener('change', async e => {
    const t = e.target;
    if (t.matches('[data-collab-upload]') && t.files[0]) {
      content.social.items[Number(t.dataset.collabUpload)].logo = await readImageResized(t.files[0], 600); renderCollabs();
    }
    if (t.matches('[data-file-upload]') && t.files[0]) {
      const kind = t.parentElement.dataset.kind || 'image';
      setPath(content, t.dataset.fileUpload, kind === 'file' ? await readFileAsDataURL(t.files[0]) : await readImageResized(t.files[0], 1600));
      renderFileFields();
    }
  });
  $('#addExpRow').addEventListener('click', () => { content.experience.rows.push({ tag: '', role: '', meta: '' }); renderExpRows(); });
  $('#addLink').addEventListener('click', () => { content.links.items.push({ label: '', href: '#' }); renderLinks(); });
  $('#addCollab').addEventListener('click', () => { content.social.items.push({ name: 'New collaborator', logo: '' }); renderCollabs(); });
  $('#addTestimonial').addEventListener('click', () => { content.testimonials.items.push({ quote: '', name: '', role: '' }); renderTestimonials(); });

  function saveDraft(key, value, statusId){
    try { localStorage.setItem(key, JSON.stringify(value)); setStatus(statusId, 'Saved as a draft in this browser only. Use the Publish tab to put it live on every device.'); }
    catch (e) { setStatus(statusId, 'This is too big to keep as a draft in the browser (big uploads). That is fine — go to the Publish tab, it does not need the draft.'); }
  }
  $('#saveContent').addEventListener('click', () => saveDraft(CONTENT_STORAGE_KEY, content, 'contentStatus'));
  $('#resetContent').addEventListener('click', () => {
    if (!confirm('Reset all text to the defaults? This clears your local edits.')) return;
    localStorage.removeItem(CONTENT_STORAGE_KEY);
    content = cloneDefaultContent(); fillContentForm();
    setStatus('contentStatus', 'Reset to defaults.');
  });

  /* ============================================================
     THEME TAB
  ============================================================ */
  const THEME_STORAGE_KEY = 'ferricool-portfolio-theme';
  const DEFAULT_THEME = { paper:'#faf6ee', ink:'#141211', muted:'#747474', line:'#e2ddd2', contactBg:'#E8223E', tint1:'#f7d6c6', tint2:'#f5e3a3', scale:1 };
  function loadTheme(){
    try{
      const saved = draftOf(THEME_STORAGE_KEY) || BASE.theme;
      if(saved && typeof saved === 'object') return { ...DEFAULT_THEME, ...saved };
    }catch(e){}
    return { ...DEFAULT_THEME };
  }
  let theme = loadTheme();
  function fillThemeForm(){
    $$('[data-theme]').forEach(el=>{ el.value = theme[el.dataset.theme]; });
    $('#scaleValue').textContent = Number(theme.scale).toFixed(2) + '×';
  }
  fillThemeForm();
  $$('[data-theme]').forEach(el => el.addEventListener('input', () => {
    theme[el.dataset.theme] = el.type === 'range' ? Number(el.value) : el.value;
    if (el.dataset.theme === 'scale') $('#scaleValue').textContent = Number(el.value).toFixed(2) + '×';
  }));
  $('#saveTheme').addEventListener('click', () => {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
    setStatus('themeStatus', 'Saved as a draft in this browser only. Use the Publish tab to put it live on every device.');
  });
  $('#resetTheme').addEventListener('click', () => {
    if(!confirm('Reset colors and heading size to the defaults?')) return;
    localStorage.removeItem(THEME_STORAGE_KEY);
    theme = { ...DEFAULT_THEME }; fillThemeForm();
    setStatus('themeStatus', 'Reset to defaults.');
  });

  /* ============================================================
     PROJECTS TAB — one simple list. Each project: title, cover, optional intro,
     background colour, lock, and a stack of blocks (images / text / video).
  ============================================================ */
  const PROJECTS_STORAGE_KEY = 'ferricool-portfolio-projects';
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
    const saved = draftOf(PROJECTS_STORAGE_KEY) || BASE.projects;
    if (Array.isArray(saved) && saved.length) return migrateProjects(JSON.parse(JSON.stringify(saved)));
    return makeDefaultProjects();
  }
  let projects = loadProjects();
  let openIdx = -1;
  const listEl = $('#adminList');
  const pad2 = n => String(n).padStart(2, '0');
  const isDataUrl = s => String(s || '').startsWith('data:');

  function blockHTML(b, bi){
    const acts = `<div class="admin-block-actions"><button type="button" data-b-move="-1" title="Move up">↑</button><button type="button" data-b-move="1" title="Move down">↓</button><button type="button" data-b-remove>Remove</button></div>`;
    if (b.type === 'image') {
      return `<div class="admin-block" data-bi="${bi}"><div class="admin-block-head"><span>Image</span>${acts}</div>
        <div class="admin-image-field">${b.src ? `<img src="${esc(b.src)}" alt="">` : `<span class="admin-thumb-empty">None</span>`}
          <input type="text" data-bf="src" value="${isDataUrl(b.src) ? '' : esc(b.src || '')}" placeholder="${isDataUrl(b.src) ? 'Uploaded image' : 'Image URL'}">
          <input type="file" accept="image/*" class="admin-upload-input" data-b-upload>
          <button type="button" class="admin-upload-btn" data-b-upload-btn>Replace</button></div>
        <input data-bf="caption" placeholder="Caption (optional)" value="${esc(b.caption || '')}"></div>`;
    }
    if (b.type === 'video') {
      return `<div class="admin-block" data-bi="${bi}"><div class="admin-block-head"><span>Video</span>${acts}</div>
        <div class="admin-image-field"><span class="admin-thumb-empty">${b.src ? 'Video' : 'None'}</span>
          <input type="text" data-bf="src" value="${isDataUrl(b.src) ? '' : esc(b.src || '')}" placeholder="${isDataUrl(b.src) ? 'Uploaded video' : 'Video URL or path (.mp4)'}">
          <input type="file" accept="video/*" class="admin-upload-input" data-b-upload>
          <button type="button" class="admin-upload-btn" data-b-upload-btn>Upload</button></div>
        <input data-bf="caption" placeholder="Caption (optional)" value="${esc(b.caption || '')}"></div>`;
    }
    return `<div class="admin-block" data-bi="${bi}"><div class="admin-block-head"><span>Text</span>${acts}</div>
      <input data-bf="heading" placeholder="Heading" value="${esc(b.heading || '')}">
      <textarea data-bf="body" placeholder="Text">${esc(b.body || '')}</textarea>
      <input data-bf="tagsText" placeholder='Optional tags, comma-separated' value="${esc((b.tags || []).join(', '))}"></div>`;
  }
  function projectHTML(p, i){
    const open = openIdx === i;
    const needsUnlock = p.locked && p.enc && !Array.isArray(p.blocks);
    const lockBox = !open ? '' : `<div class="admin-lock-panel">
      <label class="admin-check"><input type="checkbox" data-pf-lock ${p.locked ? 'checked' : ''}> 🔒 Lock this project — it stays visible but needs a password to open</label>
      ${p.locked ? `<div class="admin-row2"><label>Password<input data-pf="password" autocomplete="off" value="${esc(p.password || '')}" placeholder="at least 4 characters"></label>
        <label>Message on the password box (optional)<input data-pf="lockNote" value="${esc(p.lockNote || '')}" placeholder="This project is private…"></label></div>` : ''}</div>`;
    const blocksBox = !open ? '' : needsUnlock
      ? `<div class="admin-lock-panel"><p class="admin-hint">This project is locked and its content is hidden here. Enter its password to edit it.</p>
          <div class="admin-image-field"><input data-unlock-pw placeholder="Password" autocomplete="off"><button type="button" class="admin-upload-btn" data-unlock-btn>Unlock to edit</button></div><p class="admin-status" data-unlock-status></p></div>`
      : `<p class="admin-hint">Images should be 1920 px wide (any height). Wider ones are shrunk to 1920 for you. Pick many at once — they're added in file-name order.</p>
        ${(p.blocks || []).map(blockHTML).join('')}
        <div class="admin-block-add">
          <label class="admin-add-small admin-upload-label">+ Upload images (many at once)<input type="file" accept="image/*" multiple class="admin-upload-input" data-bulk-upload></label>
          <button type="button" class="admin-add-small" data-add-block="text">+ Text</button>
          <button type="button" class="admin-add-small" data-add-block="video">+ Video</button>
        </div>`;
    return `<article class="admin-project${open ? ' is-open' : ''}" data-index="${i}">
      <header class="admin-project-head">
        <span class="admin-project-num">${pad2(i + 1)}</span>
        ${p.image ? `<img class="admin-project-thumb" src="${esc(p.image)}" alt="">` : `<span class="admin-thumb-empty">No cover</span>`}
        <strong data-title-label>${esc(p.title || 'Untitled')}${p.locked ? ' 🔒' : ''}</strong>
        <div class="admin-project-actions">
          <button type="button" data-p-move="-1" title="Move up">↑</button><button type="button" data-p-move="1" title="Move down">↓</button>
          <button type="button" data-p-toggle>${open ? 'Close' : 'Edit'}</button><button type="button" data-p-remove>Remove</button>
        </div>
      </header>
      <div class="admin-project-body"${open ? '' : ' hidden'}>
        <div class="admin-row2">
          <label>Title (also on its floating card)<input data-pf="title" value="${esc(p.title || '')}"></label>
          <label>Short intro under the title (optional)<input data-pf="tagline" value="${esc(p.tagline || '')}"></label>
        </div>
        <label>Cover image (floating card, gallery, "more projects")
          <div class="admin-image-field"><input type="text" data-pf="image" value="${isDataUrl(p.image) ? '' : esc(p.image || '')}" placeholder="${isDataUrl(p.image) ? 'Uploaded image' : 'Image URL, or upload'}">
            <input type="file" accept="image/*" class="admin-upload-input" data-p-cover-upload><button type="button" class="admin-upload-btn" data-p-cover-btn>Upload</button></div></label>
        <div class="admin-row2">
          <label class="admin-check"><input type="checkbox" data-pf="tight" ${p.tight !== false ? 'checked' : ''}> No gaps between images (seamless, edge to edge)</label>
          <label class="admin-check"><input type="checkbox" data-pf-bgon ${p.bg ? 'checked' : ''}> Custom page background <input type="color" data-pf-bg value="${p.bg || '#faf6ee'}" ${p.bg ? '' : 'disabled'}></label>
        </div>
        ${lockBox}
        ${blocksBox}
      </div>
    </article>`;
  }
  function renderProjects(){ listEl.innerHTML = projects.map(projectHTML).join(''); }
  renderProjects();

  const ctx = el => { const card = el.closest('.admin-project'); if (!card) return null; const i = Number(card.dataset.index); const bEl = el.closest('[data-bi]'); return { i, p: projects[i], bi: bEl ? Number(bEl.dataset.bi) : -1, card }; };

  listEl.addEventListener('input', e => {
    const c = ctx(e.target); if (!c) return;
    const t = e.target;
    if (t.dataset.bf !== undefined) {
      const b = c.p.blocks[c.bi];
      if (t.dataset.bf === 'tagsText') b.tags = t.value.split(',').map(s => s.trim()).filter(Boolean); else b[t.dataset.bf] = t.value;
      return;
    }
    if (t.matches('[data-pf-bgon]')) { const col = c.card.querySelector('[data-pf-bg]'); col.disabled = !t.checked; c.p.bg = t.checked ? col.value : ''; return; }
    if (t.matches('[data-pf-bg]')) { c.p.bg = t.value; return; }
    if (t.matches('[data-pf-lock]')) { c.p.locked = t.checked; if (!t.checked) { delete c.p.password; delete c.p.enc; } renderProjects(); return; }
    if (t.dataset.pf) {
      const f = t.dataset.pf; c.p[f] = t.type === 'checkbox' ? t.checked : t.value;
      if (f === 'title') c.card.querySelector('[data-title-label]').textContent = (t.value || 'Untitled') + (c.p.locked ? ' 🔒' : '');
    }
  });
  listEl.addEventListener('change', async e => {
    const c = ctx(e.target); if (!c) return; const t = e.target;
    if (t.dataset.pf === 'image') { renderProjects(); return; }
    if (t.matches('[data-p-cover-upload]') && t.files[0]) { c.p.image = await readImageResized(t.files[0], 1400); renderProjects(); return; }
    if (t.matches('[data-b-upload]') && t.files[0]) { c.p.blocks[c.bi].src = await readImageResized(t.files[0], 1920); renderProjects(); return; }
    if (t.matches('[data-bulk-upload]') && t.files.length) {
      const files = Array.from(t.files).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
      setStatus('projectsStatus', `Adding ${files.length} image${files.length > 1 ? 's' : ''}…`);
      c.p.blocks = c.p.blocks || [];
      for (const f of files) c.p.blocks.push({ type: 'image', src: await readImageResized(f, 1920) });
      setStatus('projectsStatus', `Added ${files.length}. Drag them into order with the ↑ ↓ buttons, then Publish.`);
      renderProjects();
    }
    if (t.dataset.bf === 'src') renderProjects();
  });
  listEl.addEventListener('click', async e => {
    const t = e.target, c = ctx(t); if (!c) return;
    let m;
    if (t.closest('[data-p-toggle]')) { openIdx = openIdx === c.i ? -1 : c.i; renderProjects(); return; }
    if ((m = t.closest('[data-p-move]'))) {
      const j = c.i + Number(m.dataset.pMove);
      if (j >= 0 && j < projects.length) { [projects[c.i], projects[j]] = [projects[j], projects[c.i]]; if (openIdx === c.i) openIdx = j; else if (openIdx === j) openIdx = c.i; renderProjects(); }
      return;
    }
    if (t.closest('[data-p-remove]')) { if (confirm(`Remove "${c.p.title}"?`)) { projects.splice(c.i, 1); openIdx = -1; renderProjects(); } return; }
    if (t.closest('[data-p-cover-btn]')) { c.card.querySelector('[data-p-cover-upload]').click(); return; }
    if (t.closest('[data-b-upload-btn]')) { t.closest('.admin-block').querySelector('[data-b-upload]').click(); return; }
    if ((m = t.closest('[data-b-move]'))) {
      const j = c.bi + Number(m.dataset.bMove), bl = c.p.blocks;
      if (j >= 0 && j < bl.length) { [bl[c.bi], bl[j]] = [bl[j], bl[c.bi]]; renderProjects(); }
      return;
    }
    if (t.closest('[data-b-remove]')) { c.p.blocks.splice(c.bi, 1); renderProjects(); return; }
    if ((m = t.closest('[data-add-block]'))) {
      c.p.blocks = c.p.blocks || [];
      c.p.blocks.push(m.dataset.addBlock === 'video' ? { type: 'video', src: '', caption: '' } : { type: 'text', heading: '', body: '', tags: [] });
      renderProjects(); return;
    }
    if (t.closest('[data-unlock-btn]')) {
      const pw = c.card.querySelector('[data-unlock-pw]').value, st = c.card.querySelector('[data-unlock-status]');
      if (!(window.crypto && crypto.subtle)) { st.textContent = 'This browser cannot unlock here (needs https).'; return; }
      try { const d = await decryptJSON(c.p.enc, pw); c.p.blocks = d.blocks || []; c.p.password = pw; delete c.p.enc; renderProjects(); }
      catch (err) { st.textContent = 'Wrong password'; }
    }
  });
  $('#addProject').addEventListener('click', () => {
    projects.push({ id: 'project-' + Date.now(), title: 'Project ' + (projects.length + 1), image: '', tagline: '', bg: '', tight: true, blocks: [] });
    openIdx = projects.length - 1; renderProjects();
    listEl.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  $('#saveProjects').addEventListener('click', () => saveDraft(PROJECTS_STORAGE_KEY, projects, 'projectsStatus'));
  $('#resetProjects').addEventListener('click', () => {
    if (!confirm('Reset to the five starter projects? This clears your local draft.')) return;
    localStorage.removeItem(PROJECTS_STORAGE_KEY); projects = makeDefaultProjects(); openIdx = -1; renderProjects();
    setStatus('projectsStatus', 'Reset to the starter projects.');
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
      setStatus('publishStatus', 'Preparing…');
      for (const p of projects) {
        if (p.locked && Array.isArray(p.blocks) && String(p.password || '').length < 4) throw new Error(`"${p.title}" is locked but has no password yet — type one of at least 4 characters in that project.`);
      }
      if (projects.some(p => p.locked && Array.isArray(p.blocks)) && !(window.crypto && crypto.subtle)) throw new Error('This browser cannot lock projects here (it needs https). Use the live admin page.');
      const payload = JSON.parse(JSON.stringify({ content, theme, projects }));
      const progress = { n: 0, total: [...collectDataUrls(payload)].filter(u => !uploadCache.has(u)).length };
      const clean = await swapDataUrls(payload, progress);
      clean.updatedAt = new Date().toISOString();
      // What goes online: locked projects are encrypted with their password, and the password itself is never sent.
      const published = { ...clean, projects: [] };
      for (const p of clean.projects) {
        const { password, ...rest } = p;
        if (p.locked && Array.isArray(p.blocks)) {
          const { blocks, ...pub } = rest;
          published.projects.push({ ...pub, locked: true, enc: await encryptJSON({ blocks }, password) });
        } else if (p.locked && p.enc) {
          const { blocks, ...pub } = rest; published.projects.push({ ...pub, locked: true });
        } else { const { enc, locked, lockNote, ...pub } = rest; published.projects.push(pub); }
      }
      setStatus('publishStatus', 'Saving your changes to GitHub…');
      const existing = await ghApi('GET', 'site-data.json');
      const sha = existing.status === 200 && existing.data ? existing.data.sha : undefined;
      await ghApi('PUT', 'site-data.json', { message: 'Publish site changes from admin', content: b64(JSON.stringify(published, null, 2)), branch: gh.branch, ...(sha ? { sha } : {}) });
      localStorage.setItem(LAST_PUB_KEY, JSON.stringify(clean));
      [CONTENT_STORAGE_KEY, THEME_STORAGE_KEY, PROJECTS_STORAGE_KEY].forEach(k => localStorage.removeItem(k));
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
