(() => {
try {
  const $ = s => document.querySelector(s);
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
      { name:'Urban Food Fest', logo:'' }, { name:'AWS Community', logo:'' }, { name:'Ferricool Studios', logo:'' },
      { name:'Shop Soma', logo:'' }, { name:'Independent Collaborations', logo:'' },
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
  function cloneDefaultContent(){ return JSON.parse(JSON.stringify(DEFAULT_CONTENT)); }
  function migrateContent(c){
    if (c.social && Array.isArray(c.social.names) && !Array.isArray(c.social.items)) {
      c.social.items = c.social.names.map(n => ({ name:n, logo:'' }));
    }
    if (!c.testimonials) c.testimonials = cloneDefaultContent().testimonials;
    return c;
  }
  function loadContent(){
    try{
      const saved = JSON.parse(localStorage.getItem(CONTENT_STORAGE_KEY));
      if(saved && typeof saved === 'object') return migrateContent({ ...cloneDefaultContent(), ...saved });
    }catch(e){}
    return cloneDefaultContent();
  }
  let content = loadContent();

  function renderExpRows(){
    const wrap = $('#expRowsEditor');
    wrap.innerHTML = content.experience.rows.map((r,i)=>`
      <div class="admin-mini-row" data-index="${i}">
        <label>Tag<input data-exp-field="tag" value="${esc(r.tag)}"></label>
        <label>Role<input data-exp-field="role" value="${esc(r.role)}"></label>
        <label>Meta<input data-exp-field="meta" value="${esc(r.meta)}"></label>
        <button class="admin-mini-remove" type="button" data-exp-remove="${i}">Remove</button>
      </div>`).join('');
  }
  function renderLinks(){
    const wrap = $('#linksEditor');
    wrap.innerHTML = content.links.items.map((it,i)=>`
      <div class="admin-mini-row" data-index="${i}">
        <label>Label<input data-link-field="label" value="${esc(it.label)}"></label>
        <label>Href<input data-link-field="href" value="${esc(it.href)}"></label>
        <span></span>
        <button class="admin-mini-remove" type="button" data-link-remove="${i}">Remove</button>
      </div>`).join('');
  }
  function collabThumb(item){
    return item.logo
      ? `<img src="${esc(item.logo)}" alt="${esc(item.name)} logo">`
      : `<span class="admin-thumb-empty">No logo</span>`;
  }
  function renderCollabs(){
    const wrap = $('#collabEditor');
    wrap.innerHTML = content.social.items.map((it,i)=>`
      <div class="admin-mini-row admin-collab-row" data-index="${i}">
        <label>Logo<div class="admin-image-field" data-collab-thumb>${collabThumb(it)}
          <input type="file" accept="image/*" data-collab-upload="${i}" class="admin-upload-input">
          <button type="button" class="admin-upload-btn" data-collab-upload-btn="${i}">Upload logo</button>
        </div></label>
        <label>Name<input data-collab-field="name" value="${esc(it.name)}"></label>
        <span></span>
        <button class="admin-mini-remove" type="button" data-collab-remove="${i}">Remove</button>
      </div>`).join('');
  }
  function renderTestimonials(){
    const wrap = $('#testimonialsEditor');
    wrap.innerHTML = content.testimonials.items.map((t,i)=>`
      <div class="admin-mini-row admin-testimonial-row" data-index="${i}">
        <label class="full">Quote<textarea data-testimonial-field="quote">${esc(t.quote)}</textarea></label>
        <label>Name<input data-testimonial-field="name" value="${esc(t.name)}"></label>
        <label>Role / company<input data-testimonial-field="role" value="${esc(t.role)}"></label>
        <button class="admin-mini-remove" type="button" data-testimonial-remove="${i}">Remove</button>
      </div>`).join('');
  }
  function renderPortraitField(){
    const wrap = $('[data-image-path="about.portraitImage"]');
    if (!wrap) return;
    const val = content.about.portraitImage;
    wrap.innerHTML = `
      ${val ? `<img src="${esc(val)}" alt="Portrait preview">` : `<span class="admin-thumb-empty">No image</span>`}
      <input type="text" data-path="about.portraitImage" value="${esc(val)}" placeholder="assets/portrait.jpg or a URL">
      <input type="file" accept="image/*" id="portraitUpload" class="admin-upload-input">
      <button type="button" class="admin-upload-btn" id="portraitUploadBtn">Upload photo</button>`;
  }
  function fillContentForm(){
    $$('#panel-content [data-path]').forEach(el=>{
      const val = getPath(content, el.dataset.path);
      if (el.dataset.list === 'comma') el.value = Array.isArray(val) ? val.join(', ') : '';
      else if (el.dataset.list === 'lines') el.value = Array.isArray(val) ? val.join('\n') : '';
      else if (el.type !== 'file') el.value = val == null ? '' : val;
    });
    renderPortraitField(); renderExpRows(); renderLinks(); renderCollabs(); renderTestimonials();
  }
  fillContentForm();

  $('#panel-content').addEventListener('input', e => {
    const el = e.target;
    if (el.dataset.path && el.type !== 'file') {
      let val = el.value;
      if (el.dataset.list === 'comma') val = val.split(',').map(s=>s.trim()).filter(Boolean);
      else if (el.dataset.list === 'lines') val = val.split('\n').map(s=>s.trim()).filter(Boolean);
      setPath(content, el.dataset.path, val);
      if (el.dataset.path === 'about.portraitImage') renderPortraitField();
    }
    if (el.dataset.expField) {
      const row = el.closest('.admin-mini-row'); const i = Number(row.dataset.index);
      content.experience.rows[i][el.dataset.expField] = el.value;
    }
    if (el.dataset.linkField) {
      const row = el.closest('.admin-mini-row'); const i = Number(row.dataset.index);
      content.links.items[i][el.dataset.linkField] = el.value;
    }
    if (el.dataset.collabField) {
      const row = el.closest('.admin-mini-row'); const i = Number(row.dataset.index);
      content.social.items[i][el.dataset.collabField] = el.value;
    }
    if (el.dataset.testimonialField) {
      const row = el.closest('.admin-mini-row'); const i = Number(row.dataset.index);
      content.testimonials.items[i][el.dataset.testimonialField] = el.value;
    }
  });
  $('#panel-content').addEventListener('click', async e => {
    const rm = e.target.closest('[data-exp-remove]');
    if (rm) { content.experience.rows.splice(Number(rm.dataset.expRemove),1); renderExpRows(); }
    const rml = e.target.closest('[data-link-remove]');
    if (rml) { content.links.items.splice(Number(rml.dataset.linkRemove),1); renderLinks(); }
    const rmc = e.target.closest('[data-collab-remove]');
    if (rmc) { content.social.items.splice(Number(rmc.dataset.collabRemove),1); renderCollabs(); }
    const rmt = e.target.closest('[data-testimonial-remove]');
    if (rmt) { content.testimonials.items.splice(Number(rmt.dataset.testimonialRemove),1); renderTestimonials(); }

    const collabUploadBtn = e.target.closest('[data-collab-upload-btn]');
    if (collabUploadBtn) { $(`[data-collab-upload="${collabUploadBtn.dataset.collabUploadBtn}"]`)?.click(); }

    const portraitBtn = e.target.closest('#portraitUploadBtn');
    if (portraitBtn) { $('#portraitUpload')?.click(); }
  });
  $('#panel-content').addEventListener('change', async e => {
    const collabFile = e.target.closest('[data-collab-upload]');
    if (collabFile && collabFile.files[0]) {
      const i = Number(collabFile.dataset.collabUpload);
      content.social.items[i].logo = await readFileAsDataURL(collabFile.files[0]);
      renderCollabs();
    }
    if (e.target.id === 'portraitUpload' && e.target.files[0]) {
      content.about.portraitImage = await readFileAsDataURL(e.target.files[0]);
      renderPortraitField();
    }
  });
  $('#addExpRow').addEventListener('click', () => { content.experience.rows.push({tag:'',role:'',meta:''}); renderExpRows(); });
  $('#addLink').addEventListener('click', () => { content.links.items.push({label:'',href:'#'}); renderLinks(); });
  $('#addCollab').addEventListener('click', () => { content.social.items.push({name:'New collaborator',logo:''}); renderCollabs(); });
  $('#addTestimonial').addEventListener('click', () => { content.testimonials.items.push({quote:'',name:'',role:''}); renderTestimonials(); });

  $('#saveContent').addEventListener('click', () => {
    localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(content));
    setStatus('contentStatus', 'Saved — reload index.html in this browser to see it.');
  });
  $('#resetContent').addEventListener('click', () => {
    if(!confirm('Reset all text to the defaults? This clears your local edits.')) return;
    localStorage.removeItem(CONTENT_STORAGE_KEY);
    content = cloneDefaultContent(); fillContentForm();
    setStatus('contentStatus', 'Reset to defaults.');
  });
  $('#copyContentCode').addEventListener('click', async () => {
    const code = 'const DEFAULT_CONTENT = ' + JSON.stringify(content, null, 2) + ';';
    await copyOrLog(code, 'contentStatus');
  });

  /* ============================================================
     THEME TAB
  ============================================================ */
  const THEME_STORAGE_KEY = 'ferricool-portfolio-theme';
  const DEFAULT_THEME = { paper:'#ffffff', ink:'#000000', muted:'#747474', line:'#dedede', contactBg:'#a91624', scale:1 };
  function loadTheme(){
    try{
      const saved = JSON.parse(localStorage.getItem(THEME_STORAGE_KEY));
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
    setStatus('themeStatus', 'Saved — reload index.html in this browser to see it.');
  });
  $('#resetTheme').addEventListener('click', () => {
    if(!confirm('Reset colors and heading size to the defaults?')) return;
    localStorage.removeItem(THEME_STORAGE_KEY);
    theme = { ...DEFAULT_THEME }; fillThemeForm();
    setStatus('themeStatus', 'Reset to defaults.');
  });
  $('#copyThemeCode').addEventListener('click', async () => {
    const code = 'const DEFAULT_THEME = ' + JSON.stringify(theme, null, 2) + ';';
    await copyOrLog(code, 'themeStatus');
  });

  /* ============================================================
     PROJECTS TAB
  ============================================================ */
  const PROJECTS_STORAGE_KEY = 'ferricool-portfolio-projects';
  const DEFAULT_PROJECTS = [
    { id:'caseStudy', num:'01', category:'Brand Identity',      title:'Case Study',      image:'https://images.unsplash.com/photo-1518005020951-eccb494ad742', desc:'Selected identity and digital case studies.' },
    { id:'food',      num:'02', category:'Brand marks',         title:'Logo Archive',    image:'https://images.unsplash.com/photo-1504674900247-0877df9cc836', desc:'A growing archive of marks, symbols and identity explorations.' },
    { id:'editorial', num:'03', category:'Editorial',           title:'Presentation',    image:'https://images.unsplash.com/photo-1483985988355-763728e1935b', desc:'Selected presentations, decks and visual storytelling systems.' },
    { id:'generative',num:'04', category:'Digital / Web',       title:'Web Design',      image:'https://images.unsplash.com/photo-1518770660439-4636190af475', desc:'Responsive websites, interfaces and digital experiences.' },
    { id:'studio',    num:'05', category:'AI / Generative',     title:'AI / Generative', image:'https://images.unsplash.com/photo-1523726491678-bf852e717f6a', desc:'Generative visuals, experiments and emerging creative systems.' },
  ];
  function loadProjects(){
    try{
      const saved = JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY));
      if(Array.isArray(saved) && saved.length) return saved;
    }catch(e){}
    return DEFAULT_PROJECTS.map(p=>({...p}));
  }
  let projects = loadProjects();
  let expandedWorks = new Set();   // category indices whose "case studies" list is open
  let expandedBlocks = new Set();  // "catIndex-workIndex" keys whose blocks editor is open
  const listEl = $('#adminList');
  function thumb(src){
    return /^https?:/.test(src) ? `${src}${src.includes('?')?'&':'?'}auto=format&fit=crop&w=200&q=70` : src;
  }
  function imageFieldHTML(value, uploadAttr, textAttr, placeholder){
    return `<div class="admin-image-field">
      ${value ? `<img src="${thumb(value)}" alt="" onerror="this.style.opacity=0">` : `<span class="admin-thumb-empty">No image</span>`}
      <input type="text" ${textAttr} value="${esc(value)}" placeholder="${placeholder||'Paste a URL, or upload'}">
      <input type="file" accept="image/*" ${uploadAttr} class="admin-upload-input">
      <button type="button" class="admin-upload-btn" data-upload-trigger>Upload</button>
    </div>`;
  }
  function ensureWorks(p){
    if (!p.works || !p.works.length) {
      p.works = [{
        id: p.id+'-work-1', title: p.title, cover: p.image, tagline: p.desc,
        blocks: [ { type:'text', heading:`What ${p.title} needed to solve.`, body:p.desc }, { type:'image', src:p.image } ],
      }];
    }
    return p.works;
  }
  function blockRowHTML(b,bi){
    if (b.type === 'image') {
      return `<div class="admin-mini-row admin-block-row" data-block-index="${bi}">
        <span class="admin-block-type">Image block</span>
        <label class="full">Image${imageFieldHTML(b.src||'', `data-block-upload="${bi}"`, `data-block-field="src"`)}</label>
        <label class="full">Caption (optional)<input data-block-field="caption" value="${esc(b.caption||'')}"></label>
        <div class="admin-block-actions">
          <button class="admin-mini-remove" type="button" data-block-move="-1" data-block-index="${bi}">↑</button>
          <button class="admin-mini-remove" type="button" data-block-move="1" data-block-index="${bi}">↓</button>
          <button class="admin-mini-remove" type="button" data-block-remove="${bi}">Remove</button>
        </div>
      </div>`;
    }
    if (b.type === 'video') {
      return `<div class="admin-mini-row admin-block-row" data-block-index="${bi}">
        <span class="admin-block-type">Video block</span>
        <label class="full">Video file or URL (.mp4 works everywhere)
          <div class="admin-image-field">
            ${b.src ? `<span class="admin-thumb-empty">🎬 Video</span>` : `<span class="admin-thumb-empty">No video</span>`}
            <input type="text" data-block-field="src" value="${esc(b.src||'')}" placeholder="Paste a URL, or upload">
            <input type="file" accept="video/*" data-block-upload="${bi}" class="admin-upload-input">
            <button type="button" class="admin-upload-btn" data-upload-trigger>Upload</button>
          </div>
        </label>
        <label class="full">Caption (optional)<input data-block-field="caption" value="${esc(b.caption||'')}"></label>
        <p class="admin-hint">Uploaded video is embedded directly in the page as data — great for previewing, but large files bloat script.js fast. For a real deploy, put the file in assets/ and paste that path here instead.</p>
        <div class="admin-block-actions">
          <button class="admin-mini-remove" type="button" data-block-move="-1" data-block-index="${bi}">↑</button>
          <button class="admin-mini-remove" type="button" data-block-move="1" data-block-index="${bi}">↓</button>
          <button class="admin-mini-remove" type="button" data-block-remove="${bi}">Remove</button>
        </div>
      </div>`;
    }
    return `<div class="admin-mini-row admin-block-row" data-block-index="${bi}">
      <span class="admin-block-type">Text block</span>
      <label class="full">Heading<input data-block-field="heading" value="${esc(b.heading||'')}"></label>
      <label class="full">Body<textarea data-block-field="body">${esc(b.body||'')}</textarea></label>
      <label class="full">"What we did" tags (comma-separated, optional)<input data-block-field="tagsText" value="${esc((b.tags||[]).join(', '))}"></label>
      <div class="admin-block-actions">
        <button class="admin-mini-remove" type="button" data-block-move="-1" data-block-index="${bi}">↑</button>
        <button class="admin-mini-remove" type="button" data-block-move="1" data-block-index="${bi}">↓</button>
        <button class="admin-mini-remove" type="button" data-block-remove="${bi}">Remove</button>
      </div>
    </div>`;
  }
  function workCardHTML(p,w,wi){
    const key = expandedBlocks.has(`${p.__i}-${wi}`);
    return `<div class="admin-work-card" data-work-index="${wi}">
      <div class="admin-work-head">
        <div class="admin-image-field">${imageFieldHTML(w.cover||'', `data-work-cover-upload="${wi}"`, `data-work-field="cover"`, 'Cover image')}</div>
        <div class="admin-work-fields">
          <label>Title<input data-work-field="title" value="${esc(w.title)}"></label>
          <label>Tagline (subhead under the title — optional)<input data-work-field="tagline" value="${esc(w.tagline||'')}"></label>
        </div>
        <button class="admin-remove" type="button" data-work-remove="${wi}">Remove</button>
      </div>
      <button class="admin-add-small" type="button" data-toggle-blocks="${wi}">${key?'Hide content blocks ▴':`Edit content blocks (${(w.blocks||[]).length}) ▾`}</button>
      <div class="admin-blocks-editor" ${key?'':'hidden'}>
        <p class="admin-hint">Add blocks in whatever order and mix you want — text, then all images, alternating, anything. Reorder with the arrows.</p>
        ${(w.blocks||[]).map((b,bi)=>blockRowHTML(b,bi)).join('')}
        <div class="admin-block-add-row">
          <button class="admin-add-small" type="button" data-add-block="text">+ Add text block</button>
          <button class="admin-add-small" type="button" data-add-block="image">+ Add image block</button>
          <button class="admin-add-small" type="button" data-add-block="video">+ Add video block</button>
        </div>
      </div>
    </div>`;
  }
  function worksEditorHTML(p,i){
    p.__i = i; // scratch index used only while rendering, for the blocks-expanded key
    const works = p.works || [];
    return `<div class="admin-works-editor" ${expandedWorks.has(i)?'':'hidden'}>
      <p class="admin-hint">These are the individual case studies inside "${esc(p.title)}" — what someone sees after clicking through the collection grid. Starts from one generated from the title/description above; add as many as you like.</p>
      ${works.map((w,wi)=>workCardHTML(p,w,wi)).join('')}
      <button class="admin-add-small" type="button" data-add-work>+ Add a case study</button>
    </div>`;
  }
  function renderProjects(){
    listEl.innerHTML = projects.map((p,i)=>`
      <article class="admin-card" data-index="${i}">
        <div class="admin-image-field">
          ${p.image ? `<img src="${thumb(p.image)}" alt="${esc(p.title)||'Untitled'} preview" onerror="this.style.opacity=0">` : `<span class="admin-thumb-empty">No image</span>`}
        </div>
        <div class="admin-fields">
          <label>Title<input data-field="title" value="${esc(p.title)}"></label>
          <label>Category<input data-field="category" value="${esc(p.category)}"></label>
          <label class="full">Image
            <div class="admin-image-field">
              <input type="text" data-field="image" value="${esc(p.image)}" placeholder="Paste a URL, or upload">
              <input type="file" accept="image/*" data-project-upload="${i}" class="admin-upload-input">
              <button type="button" class="admin-upload-btn" data-project-upload-btn="${i}">Upload</button>
            </div>
          </label>
          <label>Order no.<input data-field="num" value="${esc(p.num)}"></label>
          <label class="full">Description<textarea data-field="desc">${esc(p.desc)}</textarea></label>
        </div>
        <button class="admin-remove" type="button" data-remove="${i}">Remove</button>
        <button class="admin-add-small" type="button" data-toggle-works="${i}" style="grid-column:1/-1">${expandedWorks.has(i) ? 'Hide case studies ▴' : (p.works && p.works.length ? `Manage case studies (${p.works.length}) ▾` : 'Manage case studies ▾')}</button>
        ${worksEditorHTML(p,i)}
      </article>`).join('');
  }
  renderProjects();

  // Top-level project fields (title/category/image/num/desc) — unchanged behaviour.
  listEl.addEventListener('input', e => {
    const card = e.target.closest('.admin-card'); if(!card) return;
    const i = Number(card.dataset.index);
    const field = e.target.dataset.field;
    if (field && !e.target.closest('.admin-work-card')) { projects[i][field] = e.target.value; if(field==='image') renderProjects(); return; }

    const workCard = e.target.closest('.admin-work-card');
    if (workCard) {
      const wi = Number(workCard.dataset.workIndex);
      const work = projects[i].works[wi];
      const blockRow = e.target.closest('.admin-block-row');
      if (blockRow) {
        const bi = Number(blockRow.dataset.blockIndex);
        const bf = e.target.dataset.blockField;
        if (bf === 'tagsText') work.blocks[bi].tags = e.target.value.split(',').map(s=>s.trim()).filter(Boolean);
        else if (bf) work.blocks[bi][bf] = e.target.value;
      } else if (e.target.dataset.workField) {
        work[e.target.dataset.workField] = e.target.value;
        if (e.target.dataset.workField === 'cover') renderProjects();
      }
    }
  });

  listEl.addEventListener('click', async e => {
    const card = e.target.closest('.admin-card'); if(!card) return;
    const i = Number(card.dataset.index);

    const rm = e.target.closest('[data-remove]');
    if (rm) { projects.splice(Number(rm.dataset.remove), 1); renderProjects(); setStatus('projectsStatus', 'Removed — click "Save changes" to keep it.'); return; }

    const upBtn = e.target.closest('[data-project-upload-btn]');
    if (upBtn) { $(`[data-project-upload="${upBtn.dataset.projectUploadBtn}"]`)?.click(); return; }

    const toggleWorks = e.target.closest('[data-toggle-works]');
    if (toggleWorks) {
      const ci = Number(toggleWorks.dataset.toggleWorks);
      if (expandedWorks.has(ci)) { expandedWorks.delete(ci); }
      else { ensureWorks(projects[ci]); expandedWorks.add(ci); }
      renderProjects();
      return;
    }

    const workCard = e.target.closest('.admin-work-card');
    if (workCard) {
      const wi = Number(workCard.dataset.workIndex);
      const key = `${i}-${wi}`;

      const uploadTrigger = e.target.closest('[data-upload-trigger]');
      if (uploadTrigger) { uploadTrigger.parentElement.querySelector('.admin-upload-input')?.click(); return; }

      const toggleBlocks = e.target.closest('[data-toggle-blocks]');
      if (toggleBlocks) {
        if (expandedBlocks.has(key)) expandedBlocks.delete(key); else expandedBlocks.add(key);
        renderProjects();
        return;
      }
      const rmWork = e.target.closest('[data-work-remove]');
      if (rmWork) { projects[i].works.splice(wi,1); renderProjects(); return; }

      const addBlock = e.target.closest('[data-add-block]');
      if (addBlock) {
        const type = addBlock.dataset.addBlock;
        const newBlock = type==='image' ? {type:'image',src:'',caption:''}
          : type==='video' ? {type:'video',src:'',caption:''}
          : {type:'text',heading:'',body:'',tags:[]};
        projects[i].works[wi].blocks.push(newBlock);
        expandedBlocks.add(key);
        renderProjects();
        return;
      }
      const blockRow = e.target.closest('.admin-block-row');
      if (blockRow) {
        const bi = Number(blockRow.dataset.blockIndex);
        const rmBlock = e.target.closest('[data-block-remove]');
        if (rmBlock) { projects[i].works[wi].blocks.splice(bi,1); renderProjects(); return; }
        const moveBlock = e.target.closest('[data-block-move]');
        if (moveBlock) {
          const dir = Number(moveBlock.dataset.blockMove);
          const blocks = projects[i].works[wi].blocks;
          const nbi = bi+dir;
          if (nbi>=0 && nbi<blocks.length) { const tmp=blocks[bi]; blocks[bi]=blocks[nbi]; blocks[nbi]=tmp; renderProjects(); }
          return;
        }
      }
      return;
    }

    const addWork = e.target.closest('[data-add-work]');
    if (addWork) {
      const n = (projects[i].works||[]).length + 1;
      projects[i].works = projects[i].works || [];
      projects[i].works.push({ id: projects[i].id+'-work-'+Date.now(), title:'New case study', cover:'', tagline:'', blocks:[] });
      renderProjects();
      return;
    }
  });

  listEl.addEventListener('change', async e => {
    const projFile = e.target.closest('[data-project-upload]');
    if (projFile && projFile.files[0]) {
      const i = Number(projFile.dataset.projectUpload);
      projects[i].image = await readFileAsDataURL(projFile.files[0]);
      renderProjects();
      return;
    }
    const card = e.target.closest('.admin-card'); if(!card) return;
    const i = Number(card.dataset.index);
    const workCoverFile = e.target.closest('[data-work-cover-upload]');
    if (workCoverFile && workCoverFile.files[0]) {
      const wi = Number(workCoverFile.dataset.workCoverUpload);
      projects[i].works[wi].cover = await readFileAsDataURL(workCoverFile.files[0]);
      renderProjects();
      return;
    }
    const blockFile = e.target.closest('[data-block-upload]');
    if (blockFile && blockFile.files[0]) {
      const workCard = e.target.closest('.admin-work-card');
      const wi = Number(workCard.dataset.workIndex);
      const bi = Number(blockFile.dataset.blockUpload);
      projects[i].works[wi].blocks[bi].src = await readFileAsDataURL(blockFile.files[0]);
      renderProjects();
    }
  });

  $('#addProject').addEventListener('click', () => {
    const n = projects.length + 1;
    projects.push({ id:'project'+Date.now(), num:String(n).padStart(2,'0'), category:'New category', title:'New project', image:'', desc:'' });
    renderProjects();
    listEl.lastElementChild?.scrollIntoView({behavior:'smooth', block:'center'});
  });
  $('#saveProjects').addEventListener('click', () => {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects.map(({__i,...rest})=>rest)));
    setStatus('projectsStatus', 'Saved — reload index.html in this browser to see it.');
  });
  $('#resetProjects').addEventListener('click', () => {
    if(!confirm('Reset to the five default projects? This clears your local edits, including any case studies you\'ve written.')) return;
    localStorage.removeItem(PROJECTS_STORAGE_KEY);
    projects = DEFAULT_PROJECTS.map(p=>({...p}));
    expandedWorks = new Set(); expandedBlocks = new Set();
    renderProjects();
    setStatus('projectsStatus', 'Reset to defaults.');
  });
  $('#copyProjectsCode').addEventListener('click', async () => {
    const code = 'const DEFAULT_PROJECTS = ' + JSON.stringify(projects.map(({__i,...rest})=>rest), null, 2) + ';';
    await copyOrLog(code, 'projectsStatus');
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
