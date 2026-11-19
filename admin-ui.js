/* ============================================================
   Admin layout helpers — makes the editor easier to find your way around.
   · Quick-task buttons jump to the right tab / section
   · "Website text & settings" is grouped into topics with a side menu,
     every block folds open and closed, and there's a search box
   · Drag files onto any "Upload pictures" box
   It only arranges the page; saving and publishing live in admin.js.
============================================================ */
(function () {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const store = { get: k => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };

  /* ---------- topics for the text & settings tab ---------- */
  const TOPICS = [
    ['top', 'Top of the page', ['nav', 'hero', 'poster', 'badge']],
    ['work', 'How your work is shown', ['work', 'logofolio']],
    ['about', 'About you', ['about', 'proof', 'experience', 'process', 'resources', 'testimonials', 'social']],
    ['writing', 'Articles', ['articles']],
    ['contact', 'Contact & footer', ['contact', 'links', 'socials', 'footer', 'signature']],
    ['extras', 'Fun extras', ['notes', 'games', 'effects']],
  ];
  const panel = $('#panel-content');
  const OPEN_KEY = 'admin-open-groups';
  const openSet = new Set(store.get(OPEN_KEY) || []);

  function setOpen(g, on) {
    g.classList.toggle('is-open', on);
    const b = g.querySelector('.admin-group-toggle'); if (b) b.setAttribute('aria-expanded', on ? 'true' : 'false');
    on ? openSet.add(g.dataset.group) : openSet.delete(g.dataset.group); store.set(OPEN_KEY, [...openSet]);
  }
  if (panel) {
    const groups = $$(':scope > .admin-group', panel);
    // fold every block: its title becomes a button
    groups.forEach(g => {
      const h = g.querySelector(':scope > h2'); if (!h) return;
      const body = document.createElement('div'); body.className = 'admin-group-body';
      while (h.nextSibling) body.appendChild(h.nextSibling);
      g.appendChild(body);
      const hint = h.querySelector('.admin-hint'); const hintText = hint ? hint.textContent.replace(/^\(|\)$/g, '') : '';
      if (hint) hint.remove();
      const title = h.textContent.trim();
      h.innerHTML = `<button type="button" class="admin-group-toggle" aria-expanded="false"><span>${title}</span>${hintText ? `<small>${hintText}</small>` : ''}<i aria-hidden="true">+</i></button>`;
      g.dataset.title = title;
      setOpen(g, openSet.has(g.dataset.group));
    });
    panel.addEventListener('click', e => { const t = e.target.closest('.admin-group-toggle'); if (t) setOpen(t.closest('.admin-group'), !t.closest('.admin-group').classList.contains('is-open')); });

    // side menu + topic blocks
    const layout = document.createElement('div'); layout.className = 'admin-content-layout';
    const side = document.createElement('aside'); side.className = 'admin-side';
    side.innerHTML = `<label class="admin-search"><span class="sr-only">Find a setting</span><input type="search" placeholder="Find a setting… (e.g. WhatsApp, logo, footer)" id="adminSearch"></label><nav class="admin-side-nav"></nav>`;
    const main = document.createElement('div'); main.className = 'admin-topics';
    const nav = side.querySelector('nav');
    const used = new Set();
    const addTopic = (key, label, list) => {
      const gs = list.map(k => groups.find(g => g.dataset.group === k)).filter(Boolean); if (!gs.length) return;
      gs.forEach(g => used.add(g));
      const sec = document.createElement('section'); sec.className = 'admin-topic'; sec.id = 'topic-' + key;
      sec.innerHTML = `<h3 class="admin-topic-title">${label}</h3>`; gs.forEach(g => sec.appendChild(g)); main.appendChild(sec);
      nav.insertAdjacentHTML('beforeend', `<div class="admin-side-topic"><a href="#topic-${key}" data-topic="${key}">${label}</a>${gs.map(g => `<button type="button" data-jump="${g.dataset.group}">${g.dataset.title}</button>`).join('')}</div>`);
    };
    TOPICS.forEach(([k, l, list]) => addTopic(k, l, list));
    const rest = groups.filter(g => !used.has(g)); if (rest.length) { rest.forEach(g => (g.dataset.group = g.dataset.group || ('g' + Math.random().toString(36).slice(2, 6)))); addTopic('other', 'Other', rest.map(g => g.dataset.group)); }
    const first = panel.firstElementChild;
    layout.appendChild(side); layout.appendChild(main);
    panel.insertBefore(layout, first);
    const intro = document.createElement('p'); intro.className = 'admin-note admin-panel-intro';
    intro.innerHTML = 'Click a title to open it. Use the menu or the search box to jump straight to a setting.';
    panel.insertBefore(intro, layout);

    nav.addEventListener('click', e => {
      const j = e.target.closest('[data-jump]'); if (j) { e.preventDefault(); jumpTo(j.dataset.jump); return; }
      const a = e.target.closest('[data-topic]'); if (a) { e.preventDefault(); document.getElementById('topic-' + a.dataset.topic).scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
    // search: shows only the blocks that mention what you type, and opens them
    $('#adminSearch').addEventListener('input', e => {
      const q = e.target.value.trim().toLowerCase();
      groups.forEach(g => {
        if (!q) { g.hidden = false; setOpen(g, openSet.has(g.dataset.group)); return; }
        const hit = g.textContent.toLowerCase().includes(q) || $$('input,textarea', g).some(i => (i.placeholder || '').toLowerCase().includes(q));
        g.hidden = !hit; if (hit) g.classList.add('is-open');
      });
      $$('.admin-topic', main).forEach(t => { t.hidden = q && !$$('.admin-group', t).some(g => !g.hidden); });
    });
  }
  function jumpTo(group) {
    const g = document.querySelector(`#panel-content .admin-group[data-group="${group}"]`); if (!g) return;
    setOpen(g, true); setTimeout(() => g.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30);
  }

  /* ---------- quick tasks + any "go to" button ---------- */
  function goTab(tab) { const b = document.querySelector(`.admin-tab[data-tab="${tab}"]`); if (b) b.click(); }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-goto-tab]'); if (!b) return;
    goTab(b.dataset.gotoTab);
    const tabs = document.querySelector('.admin-tabs');
    if (b.dataset.gotoGroup) jumpTo(b.dataset.gotoGroup); else if (tabs) tabs.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (b.dataset.click) setTimeout(() => { const t = document.querySelector(b.dataset.click); if (t) t.click(); }, 120);
    if (b.dataset.openCat === 'cases') setTimeout(() => {   // open the Case study section so "+ Add a case study" is right there
      const card = $$('#adminList .admin-project').find(p => /case/i.test((p.querySelector('[data-title-label]') || {}).textContent || ''));
      if (card && !card.classList.contains('is-open')) { const t = card.querySelector('[data-cat-toggle]'); if (t) t.click(); }
      setTimeout(() => { const add = document.querySelector('#adminList [data-add-case]'); if (add) add.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 150);
    }, 80);
  });
  // the publish bar hides on the Publish tab
  document.addEventListener('click', e => { const t = e.target.closest('.admin-tab'); if (t) { const bar = $('#adminPubbar'); if (bar) bar.hidden = t.dataset.tab === 'publish'; } });

  /* ---------- drag files onto any upload box ---------- */
  const zoneInput = el => { const z = el.closest && el.closest('.admin-upload-label, .admin-logo-add label, .admin-image-field, .admin-logo-tile'); return z ? { z, input: z.querySelector('input[type=file]') } : null; };
  document.addEventListener('dragover', e => { const m = zoneInput(e.target); if (m && m.input) { e.preventDefault(); m.z.classList.add('is-drop'); } });
  document.addEventListener('dragleave', e => { const m = zoneInput(e.target); if (m) m.z.classList.remove('is-drop'); });
  document.addEventListener('drop', e => {
    const m = zoneInput(e.target); if (!m || !m.input) return; e.preventDefault(); m.z.classList.remove('is-drop');
    const files = [...(e.dataTransfer.files || [])]; if (!files.length) return;
    try { const dt = new DataTransfer(); (m.input.multiple ? files : files.slice(0, 1)).forEach(f => dt.items.add(f)); m.input.files = dt.files; m.input.dispatchEvent(new Event('change', { bubbles: true })); } catch (err) {}
  });
})();
