/* ============================================================
   Articles — a calm reading view for your writing.
   Body text: a blank line starts a new paragraph,
   "## " starts a heading, "> " a quote, "- " a list item,
   and a line that is only a picture link (…jpg/png/webp/gif) shows the picture.
   Articles are written in admin → Content → Articles.
============================================================ */
(function () {
  const grid = document.getElementById('artGrid'); if (!grid) return;
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  let box = null, lastFocus = null;

  function bodyHTML(txt) {
    const blocks = String(txt || '').replace(/\r/g, '').split(/\n{2,}/).map(b => b.trim()).filter(Boolean);
    return blocks.map(b => {
      if (/^##\s+/.test(b)) return `<h2>${esc(b.replace(/^##\s+/, ''))}</h2>`;
      if (/^>\s?/.test(b)) return `<blockquote>${esc(b.replace(/^>\s?/gm, ''))}</blockquote>`;
      if (/^-\s+/m.test(b) && b.split('\n').every(l => /^-\s+/.test(l))) return `<ul>${b.split('\n').map(l => `<li>${esc(l.replace(/^-\s+/, ''))}</li>`).join('')}</ul>`;
      if (/^(https?:\/\/|assets\/)\S+\.(jpe?g|png|webp|gif|avif)(\?\S*)?$/i.test(b)) return `<figure><img src="${esc(b)}" alt="" loading="lazy"></figure>`;
      return `<p>${esc(b).replace(/\n/g, '<br>')}</p>`;
    }).join('');
  }

  function open(i) {
    const list = window.__articles || [], a = list[i]; if (!a) return;
    lastFocus = document.activeElement;
    if (!box) {
      box = document.createElement('div'); box.className = 'art-reader'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true');
      document.body.appendChild(box);
      box.addEventListener('click', e => { if (e.target.closest('[data-art-close]')) close(); const n = e.target.closest('[data-art-next]'); if (n) open(Number(n.dataset.artNext)); });
      box.addEventListener('scroll', fill, { passive: true });
    }
    const fmt = window.__artDate || (d => d);
    const others = list.map((x, k) => ({ x, k })).filter(o => o.k !== i && String(o.x.title || '').trim());
    const nx = others[0];
    box.setAttribute('aria-label', a.title || 'Article');
    box.innerHTML = `
      <div class="ar-bar"><span>${esc(a.tag || 'Article')}</span><button type="button" class="modal-nav" data-art-close>Close ×</button></div>
      <article class="ar-inner">
        <p class="ar-meta">${a.tag ? `(${esc(a.tag)})` : '(Article)'}${a.date ? ` · <time>${esc(fmt(a.date))}</time>` : ''}</p>
        <h1 class="ar-title" data-fill>${esc(a.title)}</h1>
        ${a.excerpt ? `<p class="ar-lede">${esc(a.excerpt)}</p>` : ''}
        ${a.cover ? `<figure class="ar-cover"><img src="${esc(a.cover)}" alt="" decoding="async"></figure>` : ''}
        <div class="ar-body">${bodyHTML(a.body)}</div>
        ${a.url ? `<p class="ar-link"><a href="${esc(a.url)}" target="_blank" rel="noopener">Read the full piece ↗</a></p>` : ''}
        ${nx ? `<button type="button" class="ar-next" data-art-next="${nx.k}"><small>Next article</small><strong>${esc(nx.x.title)}</strong><i aria-hidden="true">→</i></button>` : ''}
      </article>`;
    const t = box.querySelector('[data-fill]');
    t.innerHTML = t.textContent.split(/(\s+)/).map(w => /^\s+$/.test(w) ? w : `<span class="fw">${esc(w)}</span>`).join('');
    box.scrollTop = 0; box.classList.add('open'); document.documentElement.style.overflow = 'hidden';
    requestAnimationFrame(() => { fill(); box.querySelector('[data-art-close]').focus(); });
    try { history.replaceState(null, '', '#article-' + (i + 1)); } catch (e) {}
  }
  function close() {
    if (!box) return; box.classList.remove('open'); document.documentElement.style.overflow = '';
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  // the title lights up word by word as you start reading
  function fill() {
    if (!box) return;
    const ws = box.querySelectorAll('.ar-title .fw'), n = ws.length, p = Math.min(1, .35 + box.scrollTop / (box.clientHeight * .5));
    ws.forEach((w, i) => { w.style.opacity = (.2 + .8 * Math.max(0, Math.min(1, p * (n + 2) - i))).toFixed(3); });
  }
  grid.addEventListener('click', e => { const c = e.target.closest('[data-art]'); if (c) open(Number(c.dataset.art)); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && box && box.classList.contains('open')) close(); });
  // a shared link like …/#article-2 opens that article
  const m = location.hash.match(/^#article-(\d+)$/);
  if (m) { let tries = 0; const t = setInterval(() => { if (window.__articles || ++tries > 30) { clearInterval(t); open(Number(m[1]) - 1); } }, 150); }
})();
