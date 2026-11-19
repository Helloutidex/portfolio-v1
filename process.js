/* ============================================================
   My process — the full page behind the home-page snapshot.
   Each stage: text on the left (number, name, story, what you get),
   a picture on the right that opens up as you scroll to it.
   Opens from "See my full process", from any step on the home page,
   or from a link like …/#my-process (…/#my-process-2 opens on stage 2).
   Text and pictures: admin → Website text & settings → My process.
============================================================ */
(function () {
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  // the longer story for the four starter stages (used until you write your own in admin)
  const BUILT_IN = {
    ideate: { detail: 'Every project starts with listening. I learn the business, the audience and what success really looks like — then dig until the real problem shows up, because the first brief is rarely the whole story.', points: 'Discovery call, Questionnaire, Research & audit, Clear problem statement' },
    think: { detail: 'Before any pixel, I shape the strategy: who we are talking to, what we want them to feel and the one idea the work stands on. That way every design decision has a reason behind it.', points: 'Positioning, Audience & tone, Creative direction, Moodboards' },
    explore: { detail: 'Now I go wide — sketching, testing and pushing a few bold directions side by side. We look at them together, keep what works and drop what doesn\'t, so we choose with confidence.', points: 'Sketches, Concept routes, Presentation, Feedback rounds' },
    design: { detail: 'The chosen direction becomes a complete, polished system — refined down to the last detail and handed over ready to use everywhere it needs to live.', points: 'Final design & system, Guidelines, All file formats, Launch support' },
  };
  let box = null, lastFocus = null;
  const steps = () => { const p = (window.PORTFOLIO_CONTENT || {}).process || {}; return (p.steps || []).filter(s => s && String(s.title || '').trim()); };

  function placeholder(i, title) {   // no picture yet: a clean numbered panel in the site's style (never a stock photo)
    return `<span class="pp-ph" aria-hidden="true"><b>${String(i + 1).padStart(2, '0')}</b><em>${esc(title)}</em><i></i></span>`;
  }
  function open(start) {
    const p = (window.PORTFOLIO_CONTENT || {}).process || {}, list = steps(); if (!list.length) return;
    lastFocus = document.activeElement;
    if (!box) {
      box = document.createElement('div'); box.className = 'proc-page'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true');
      document.body.appendChild(box);
      box.addEventListener('click', e => { if (e.target.closest('[data-proc-close]')) close(); });
      box.addEventListener('scroll', motion, { passive: true });
    }
    box.setAttribute('aria-label', p.label || 'My process');
    box.innerHTML = `
      <div class="ar-bar"><span>${esc(p.label || 'My process')}</span><button type="button" class="modal-nav" data-proc-close>Close ×</button></div>
      <header class="proc-hero">
        <p class="ar-meta">(${esc(p.label || 'My process')})</p>
        <h1 class="proc-title">${esc(p.heading || 'How an idea becomes the work.')}</h1>
        ${p.pageIntro ? `<p class="ar-lede">${esc(p.pageIntro)}</p>` : ''}
        <ol class="proc-index">${list.map((s, i) => `<li><a href="#my-process-${i + 1}" data-proc-jump="${i}"><span>${String(i + 1).padStart(2, '0')}</span>${esc(s.title)}</a></li>`).join('')}</ol>
      </header>
      ${list.map((s, i) => {
        const b = BUILT_IN[String(s.title).trim().toLowerCase()] || {};
        const detail = String(s.detail || '').trim() || b.detail || '', pts = String(s.points || '').trim() || b.points || '';
        return `<section class="proc-row" id="proc-${i}">
          <div class="proc-text">
            <span class="proc-num">(${String(i + 1).padStart(2, '0')})</span>
            <h2>${esc(s.title)}</h2>
            ${s.text ? `<p class="proc-short">${esc(s.text)}</p>` : ''}
            ${detail ? detail.split(/\n{2,}/).map(x => `<p class="proc-detail">${esc(x)}</p>`).join('') : ''}
            ${pts ? `<div class="proc-points"><small>What happens here</small><ul>${pts.split(',').map(x => x.trim()).filter(Boolean).map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>` : ''}
          </div>
          <figure class="proc-pic"><span class="proc-frame">${s.image ? `<img src="${esc(s.image)}" alt="${esc(s.title)}" loading="lazy" decoding="async">` : placeholder(i, s.title)}</span></figure>
        </section>`;
      }).join('')}
      <footer class="proc-end">
        <h2>Ready when you are<span class="hd-dot">.</span></h2>
        <div class="proc-end-ctas"><a class="admin-like-cta" href="brief.html">Start a project questionnaire →</a><a class="proc-link" href="contact.html">Or just say hello</a></div>
      </footer>`;
    box.querySelector('.proc-index').addEventListener('click', e => { const a = e.target.closest('[data-proc-jump]'); if (a) { e.preventDefault(); jump(Number(a.dataset.procJump)); } });
    box.scrollTop = 0; box.classList.add('open'); document.documentElement.style.overflow = 'hidden';
    requestAnimationFrame(() => { motion(); if (start > 0) jump(start, true); box.querySelector('[data-proc-close]').focus({ preventScroll: true }); });
    try { history.replaceState(null, '', '#my-process' + (start > 0 ? '-' + (start + 1) : '')); } catch (e) {}
  }
  function jump(i, instant) { const r = box && box.querySelector('#proc-' + i); if (r) box.scrollTo({ top: r.offsetTop - 70, behavior: instant ? 'auto' : 'smooth' }); }
  function close() {
    if (!box) return; box.classList.remove('open'); document.documentElement.style.overflow = '';
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  // pictures open up and text rises as each stage scrolls in
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function motion() {
    if (!box) return; const vh = box.clientHeight;
    box.querySelectorAll('.proc-row').forEach(r => {
      const rect = r.getBoundingClientRect(), p = reduce ? 1 : Math.max(0, Math.min(1, (vh - rect.top) / (vh * .6)));
      r.style.setProperty('--p', p.toFixed(3));
    });
  }
  document.addEventListener('click', e => {
    const m = e.target.closest('#processMore, [data-process-step]'); if (!m) return;
    e.preventDefault(); open(m.dataset.processStep ? Number(m.dataset.processStep) : 0);
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && box && box.classList.contains('open')) close(); });
  const m = location.hash.match(/^#my-process(?:-(\d+))?$/);
  if (m) { let tries = 0; const t = setInterval(() => { if (window.PORTFOLIO_CONTENT || ++tries > 30) { clearInterval(t); open(m[1] ? Number(m[1]) - 1 : 0); } }, 150); }
})();
