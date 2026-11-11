/* ============================================================
   Phone thumb bar — Work · Hire me · Let's talk, pinned to the
   bottom of the screen on phones, where the thumb rests.
   Appears after the hero, slides away while scrolling down,
   comes back when scrolling up. Admin → Header → "Thumb bar".
============================================================ */
(function () {
  const hero = document.querySelector('.hero'); if (!hero) return;
  const bar = document.createElement('nav'); bar.className = 'thumb-bar'; bar.setAttribute('aria-label', 'Quick actions');
  const wa = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';
  const grid = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></svg>';
  let lastY = scrollY, shown = false, enabled = true;
  function fill() {
    const c = window.PORTFOLIO_CONTENT || {}, nav = c.nav || {};
    enabled = nav.thumbBar !== false; document.documentElement.classList.toggle('has-tb', enabled);
    const hire = document.getElementById('heroHire'), cta = nav.ctaHref || 'contact.html';
    bar.innerHTML =
      `<a class="tb-btn" href="#work">${grid}<span>Work</span></a>` +
      (hire && !hire.hidden ? `<a class="tb-btn" href="${hire.href}" target="_blank" rel="noopener">${wa}<span>${(document.getElementById('heroHireLabel') || {}).textContent || 'Hire me'}</span></a>` : '') +
      `<a class="tb-btn tb-main" href="${cta}"><span>${(nav.ctaLabel || "Let's talk").replace(/[↗→]/g, '').trim()}</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></a>`;
  }
  function update(idle) {
    const y = scrollY, past = hero.getBoundingClientRect().bottom < innerHeight * .35;
    const blocked = !enabled || document.documentElement.classList.contains('gm-open') || document.body.style.overflow === 'hidden';
    const down = y > lastY + 4, up = y < lastY - 4;
    let want = shown;
    if (!past || blocked) want = false; else if (up) want = true; else if (down) want = false; else if (idle === true) want = true; // stopped scrolling: bring it back
    // always show near the bottom of the page
    if (past && !blocked && innerHeight + y > document.body.scrollHeight - 80) want = true;
    if (want !== shown) { shown = want; bar.classList.toggle('is-on', shown); document.documentElement.classList.toggle('tb-on', shown); }
    lastY = y;
  }
  let tick = false;
  addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(() => { tick = false; update(); }); } }, { passive: true });
  let idle; addEventListener('scroll', () => { clearTimeout(idle); idle = setTimeout(() => { lastY = scrollY; update(true); }, 1200); }, { passive: true });
  document.body.appendChild(bar); fill();
  let tries = 0; const t = setInterval(() => { if (window.PORTFOLIO_CONTENT || ++tries > 30) { clearInterval(t); setTimeout(() => { fill(); update(); }, 300); } }, 150);
  let gm = false; new MutationObserver(() => { const g = document.documentElement.classList.contains('gm-open'); if (g !== gm) { gm = g; update(!g); } }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
})();
