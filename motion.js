/* ============================================================
   Scroll motion (after wearemotto.com)
   · Section headings light up word by word as they scroll into view
   · The logo strip and the big name band speed up with your scrolling
     and run backwards when you scroll up, then settle back
   Turn off in admin → Effects → "Scroll-linked text and strips".
============================================================ */
(function () {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let on = true;
  const heads = () => document.querySelectorAll('.section-top p.words');
  let lastY = scrollY, lastT = performance.now(), vel = 0, rate = 1, raf = 0;

  function frame(now) {
    raf = 0;
    if (!on) return;
    const vh = innerHeight;
    // 1 · headings fill in as they travel up the screen
    heads().forEach(h => {
      const r = h.getBoundingClientRect(); if (r.top > vh || r.bottom < 0) return;
      h.classList.add('is-filled');
      const p = Math.max(0, Math.min(1, (vh * .92 - r.top) / (vh * .5)));
      const ws = h.querySelectorAll('.wd'), n = ws.length;
      ws.forEach((w, i) => w.style.setProperty('--f', Math.max(0, Math.min(1, p * (n + 2) - i)).toFixed(3)));
    });
    // 2 · strips follow the scroll speed and direction
    vel *= .9;
    const target = Math.max(-3.5, Math.min(4.5, 1 + vel * 2.2));
    rate += (target - rate) * .18;
    document.querySelectorAll('.logo-track, .name-track').forEach(el => el.getAnimations().forEach(a => { try {
      // keep plenty of runway so running backwards never reaches the very start (that would stop the strip)
      const d = a.effect && a.effect.getComputedTiming ? a.effect.getComputedTiming().duration : 0;
      if (d && a.currentTime != null && a.currentTime < d * 5) a.currentTime += d * 200;
      a.playbackRate = Math.abs(rate) < .05 ? .05 : rate;
    } catch (e) {} }));
    if (Math.abs(vel) > .002 || Math.abs(rate - 1) > .01) raf = requestAnimationFrame(frame);
  }
  addEventListener('scroll', () => {
    const now = performance.now(), dt = Math.max(8, now - lastT), dy = scrollY - lastY;
    vel = vel * .6 + (dy / dt) * .4; lastY = scrollY; lastT = now;
    if (!raf) raf = requestAnimationFrame(frame);
  }, { passive: true });
  // respect the admin switch once the site text has loaded
  let tries = 0; const t = setInterval(() => {
    const c = window.PORTFOLIO_CONTENT; if (!c && ++tries < 30) return; clearInterval(t);
    on = !(c && c.effects && c.effects.scrollMotion === false);
    if (!on) heads().forEach(h => h.classList.remove('is-filled')); else frame(performance.now());
  }, 150);
})();
