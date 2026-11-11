/* ============================================================
   Orbit Globe — the work gallery as a slowly turning globe of
   pictures (after the animo orbit-globe reference).
   · Drag in any direction to spin it in 3D (it keeps gliding)
   · "Scatter" (or double-click / double-tap) throws the pictures
     out into space; "Gather" pulls them back into the globe —
     you can keep spinning it while it's scattered
   · ← → ↑ ↓ keys spin it, S scatters / gathers
   · Tap a picture to open that section
   Admin → Work / gallery → Gallery animation.
============================================================ */
(function () {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = p => p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;

  window.OrbitGlobe = function (stage, items, opts) {
    if (!stage || !items || !items.length) return;
    opts = opts || {};
    stage.classList.add('og-stage'); stage.innerHTML = '';
    stage.tabIndex = 0; stage.setAttribute('role', 'region');
    stage.setAttribute('aria-label', 'Selected work globe — drag to spin, press S to scatter, tap a picture to open it');
    const layer = document.createElement('div'); layer.className = 'og-layer'; stage.appendChild(layer);
    const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'og-scatter';
    btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="2.2"/><circle cx="4.5" cy="6" r="1.6"/><circle cx="19.5" cy="5.5" r="1.4"/><circle cx="5" cy="18.5" r="1.4"/><circle cx="19" cy="18" r="1.8"/></svg><span>Scatter</span>';
    stage.appendChild(btn);
    const hint = document.createElement('div'); hint.className = 'og-hint'; hint.textContent = opts.hint || 'Drag to spin · double-tap to scatter'; stage.appendChild(hint);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    let W = 0, H = 0, R = 0, CS = 0, N = 0, pts = [], cards = [];
    function build() {
      W = stage.clientWidth; H = stage.clientHeight;
      R = Math.min(W * (W < 700 ? .4 : .3), H * .36);
      CS = R * .46;                                   // card width
      N = clamp(items.length * (W < 700 ? 2 : 3), W < 700 ? 12 : 16, W < 700 ? 24 : 32);   // fewer cards when there are fewer pictures, so they don't repeat too much
      layer.innerHTML = ''; cards = []; pts = [];
      const gcd = (a, b) => b ? gcd(b, a % b) : a, STRIDE = [7, 5, 3, 1].find(s => gcd(s, items.length) === 1);
      const golden = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < N; i++) {                  // even spread over the sphere (Fibonacci)
        const y = 1 - (i + .5) / N * 2, r = Math.sqrt(1 - y * y), th = i * golden;
        const p = [Math.cos(th) * r, y, Math.sin(th) * r];
        // where it flies when scattered: further out, a little off its line, with a spin
        const k = 1.3 + ((i * 53) % 100) / 100 * .75, j = [((i * 37) % 21 - 10) / 30, ((i * 71) % 21 - 10) / 30, ((i * 13) % 21 - 10) / 30];
        const s = [(p[0] + j[0]) * k * 1.25, (p[1] + j[1]) * k * .8, (p[2] + j[2]) * k * .55];
        pts.push({ p, s, spin: ((i * 97) % 60) - 30 });
        const it = items[(i * STRIDE) % items.length];
        const el = document.createElement('button'); el.type = 'button'; el.className = 'og-card'; el.dataset.id = it.id;
        el.setAttribute('aria-label', 'Open ' + (it.title || 'work'));
        el.innerHTML = `<img src="${it.src}" alt="" decoding="async" draggable="false"><span class="og-cap">${it.title || ''}</span>`;
        el.style.width = CS + 'px'; el.style.height = CS * 1.25 + 'px';
        layer.appendChild(el); cards.push(el);
      }
    }

    // orientation as a 3×3 rotation matrix, so it can turn freely in every direction
    let M = [1, 0, 0, 0, 1, 0, 0, 0, 1];
    const mul = (a, b) => [
      a[0] * b[0] + a[1] * b[3] + a[2] * b[6], a[0] * b[1] + a[1] * b[4] + a[2] * b[7], a[0] * b[2] + a[1] * b[5] + a[2] * b[8],
      a[3] * b[0] + a[4] * b[3] + a[5] * b[6], a[3] * b[1] + a[4] * b[4] + a[5] * b[7], a[3] * b[2] + a[4] * b[5] + a[5] * b[8],
      a[6] * b[0] + a[7] * b[3] + a[8] * b[6], a[6] * b[1] + a[7] * b[4] + a[8] * b[7], a[6] * b[2] + a[7] * b[5] + a[8] * b[8]];
    const rotY = a => { const c = Math.cos(a), s = Math.sin(a); return [c, 0, s, 0, 1, 0, -s, 0, c]; };
    const rotX = a => { const c = Math.cos(a), s = Math.sin(a); return [1, 0, 0, 0, c, -s, 0, s, c]; };
    function turn(ax, ay) { if (ay) M = mul(rotY(ay), M); if (ax) M = mul(rotX(ax), M); }
    turn(-.28, .4);   // start with a slight tilt, like the reference

    let sc = 0, scTarget = 0;      // 0 = globe, 1 = scattered
    function draw() {
      const persp = R * 4.2, e = ease(sc), cx = W / 2, cy = H / 2;
      const list = [];
      for (let i = 0; i < N; i++) {
        const P = pts[i], o = [P.p[0] + (P.s[0] - P.p[0]) * e, P.p[1] + (P.s[1] - P.p[1]) * e, P.p[2] + (P.s[2] - P.p[2]) * e];
        const x = M[0] * o[0] + M[1] * o[1] + M[2] * o[2], y = M[3] * o[0] + M[4] * o[1] + M[5] * o[2], z = M[6] * o[0] + M[7] * o[1] + M[8] * o[2];
        list.push([i, x * R, y * R, z * R]);
      }
      list.sort((a, b) => a[3] - b[3]);
      list.forEach(([i, x, y, z], order) => {
        const k = persp / (persp - z), el = cards[i];
        const depth = clamp((z / R + 1) / 2, 0, 1);              // 0 back … 1 front
        const rot = pts[i].spin * e;
        el.style.transform = `translate3d(${(cx + x * k - CS / 2).toFixed(1)}px,${(cy + y * k - CS * .625).toFixed(1)}px,0) scale(${(k * (.78 + .22 * depth)).toFixed(4)}) rotate(${rot.toFixed(1)}deg)`;
        el.style.zIndex = order + 1;
        el.style.setProperty('--d', depth.toFixed(3));
        el.classList.toggle('is-back', depth < .35 && e < .5);
      });
    }

    // motion
    let vx = 0, vy = 0, lastT = performance.now(), visible = false, dragging = false, idleUntil = 0, hover = false;
    const auto = reduce ? 0 : (opts.speed || .16);   // radians per second
    function tick(now) {
      const dt = Math.min(64, now - lastT) / 1000; lastT = now;
      if (visible) {
        if (!dragging) {
          if (Math.abs(vx) + Math.abs(vy) > .002) { turn(vx * dt, vy * dt); const f = Math.pow(.12, dt); vx *= f; vy *= f; }
          else if (now > idleUntil) turn(0, auto * dt * (hover ? .4 : 1));
        }
        if (sc !== scTarget) { const step = dt / .9; sc = scTarget > sc ? Math.min(scTarget, sc + step) : Math.max(scTarget, sc - step); }
        draw();
      }
      requestAnimationFrame(tick);
    }

    function setScatter(on) {
      scTarget = on ? 1 : 0; stage.classList.toggle('is-scattered', on);
      btn.querySelector('span').textContent = on ? 'Gather' : 'Scatter';
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      if (on) { vy += .9 * (Math.random() > .5 ? 1 : -1); vx += .35; }   // a little spin as they fly out
    }
    btn.addEventListener('click', e => { e.stopPropagation(); setScatter(scTarget === 0); });

    // drag to spin (any direction). On phones a gesture that starts vertical scrolls the page instead.
    let pid = null, sx0 = 0, sy0 = 0, lx = 0, ly = 0, lt = 0, axis = null, moved = false, lastTap = 0;
    stage.addEventListener('pointerdown', e => {
      moved = false;
      if (e.target.closest('.og-scatter')) return;
      pid = e.pointerId; sx0 = lx = e.clientX; sy0 = ly = e.clientY; lt = performance.now(); axis = null; moved = false; vx = vy = 0;
    });
    stage.addEventListener('pointermove', e => {
      if (pid !== e.pointerId) return;
      const dx = e.clientX - sx0, dy = e.clientY - sy0;
      if (!axis) {
        if (Math.hypot(dx, dy) < 6) return;
        axis = (e.pointerType === 'touch' && Math.abs(dy) > Math.abs(dx)) ? 'page' : 'spin';
        if (axis === 'spin') { dragging = moved = true; stage.classList.add('is-dragging'); try { stage.setPointerCapture(pid); } catch (er) {} }
      }
      if (axis !== 'spin') return;
      const now = performance.now(), ddt = Math.max(8, now - lt) / 1000;
      const ax = -(e.clientY - ly) / R * .9, ay = (e.clientX - lx) / R * .9;
      turn(ax, ay); vx = ax / ddt; vy = ay / ddt; lx = e.clientX; ly = e.clientY; lt = now;
      draw();
    });
    const up = e => {
      if (pid !== e.pointerId) return; pid = null;
      if (dragging) { dragging = false; stage.classList.remove('is-dragging'); vx = clamp(vx, -6, 6); vy = clamp(vy, -6, 6); idleUntil = performance.now() + 2500; hint.classList.add('is-gone'); }
      else if (!moved && !e.target.closest('.og-card, .og-scatter')) {          // tap on empty space: double-tap scatters
        const now = performance.now(); if (now - lastTap < 350) setScatter(scTarget === 0); lastTap = now;
      }
    };
    stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', up);
    stage.addEventListener('dblclick', e => { if (!e.target.closest('.og-scatter')) { e.preventDefault(); setScatter(scTarget === 0); } });
    stage.addEventListener('click', e => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);   // a spin is not a tap
    stage.addEventListener('keydown', e => {
      const k = e.key, s = .9;
      if (k === 'ArrowLeft') vy -= s; else if (k === 'ArrowRight') vy += s; else if (k === 'ArrowUp') vx += s; else if (k === 'ArrowDown') vx -= s;
      else if (k === 's' || k === 'S') setScatter(scTarget === 0); else return;
      e.preventDefault(); idleUntil = performance.now() + 2500;
    });
    stage.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') hover = true; });
    stage.addEventListener('pointerleave', () => { hover = false; });

    new IntersectionObserver(es => es.forEach(e => { visible = e.isIntersecting; if (visible) lastT = performance.now(); }), { rootMargin: '100px 0px' }).observe(stage);
    let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (stage.clientWidth !== W || stage.clientHeight !== H) { build(); draw(); } }, 200); });
    build(); draw(); requestAnimationFrame(tick);
  };
})();
