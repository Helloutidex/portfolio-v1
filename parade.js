/* ============================================================
   Pop Parade — the work gallery, choreographed like the
   reference (animo pop parade), a little slower, never ending,
   and draggable.
   One loop (≈21s at normal speed):
   1. Zoom-through — a card pops up in the middle and grows; the
      next picture pops up inside it and grows to fill it (×3)
   2. Parade — it shrinks into a line of cards that marches across
   3. Pop pairs — cards pop in, in overlapping pairs, drifting left
   4. Grey tiles — the pictures fade to grey tiles that drift away
      … while the next loop's first card is already popping in.
   Everything is drawn from one clock, so dragging simply moves
   the clock: drag right to go back, left to go forward.
   Mouse, finger, trackpad swipe or ← → keys. Tap a card to open it.
   Admin → Work / gallery → Gallery animation / speed.
============================================================ */
(function () {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const prog = (u, a, b) => clamp((u - a) / (b - a), 0, 1);
  const backOut = p => { const c = 1.7; p = clamp(p, 0, 1); return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); };
  const ease = p => { p = clamp(p, 0, 1); return 1 - Math.pow(1 - p, 3); };
  const inOut = p => { p = clamp(p, 0, 1); return p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; };
  const mod = (n, m) => ((n % m) + m) % m;

  // timeline (seconds within one loop)
  const Z0 = 1.6, ZSTEP = 1.9, ZN = 3;           // zoom-through: inner pictures at 1.6, 3.5, 5.4
  const ZEND = Z0 + ZN * ZSTEP;                 // 7.3
  const P0 = ZEND + .5, P1 = P0 + 3.8;          // parade 7.8 → 11.6
  const C0 = P1 - 1.5, CIV = .75, CN = 7;       // pop pairs start 10.1, one every .75s
  const G0 = C0 + CN * CIV + .3, GIV = .55, GN = 6;   // grey tiles 16.45 …
  const TAIL = 9;                               // how long a loop's leftovers may still be on screen after L

  window.PopParade = function (stage, items, opts) {
    if (!stage || !items || !items.length) return;
    opts = opts || {};
    stage.classList.add('pp-stage'); stage.innerHTML = '';
    stage.tabIndex = 0; stage.setAttribute('role', 'region');
    stage.setAttribute('aria-label', 'Selected work — drag or use the arrow keys to move, tap a picture to open it');
    const layer = document.createElement('div'); layer.className = 'pp-layer'; stage.appendChild(layer);
    items.forEach(it => { const im = new Image(); im.decoding = 'async'; im.src = it.src; });
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    let W = 0, H = 0, S = 0, PN = 0, PER = 0, L = 21;
    function measure() {
      W = stage.clientWidth; H = stage.clientHeight;
      S = Math.min(H * .5, W * (W < 700 ? .56 : .25), 330);
      PN = Math.ceil(W / (S * .62 * 1.12)) + 2;           // cards in the parade
      PER = (ZN + 1) + (PN - 1) + CN;                       // pictures used per loop
      // loop length: the next loop's first card pops in while the last grey tile is still crossing — never an empty moment
      L = G0 + (GN - 1) * GIV + (W * .42) / (S * 1.08);
    }

    const els = new Map(), seen = new Set();
    function el(key, kind) {
      let e = els.get(key);
      if (!e) {
        if (kind === 'ghost') { e = document.createElement('span'); e.className = 'pp-ghost'; }
        else {
          e = document.createElement('button'); e.type = 'button'; e.className = 'pp-card' + (kind === 'zoom' ? ' pp-zoom' : '');
          e.innerHTML = '<img alt="" decoding="async" draggable="false">' + (kind === 'zoom' ? '<span class="pp-inner"><img alt="" decoding="async" draggable="false"></span>' : '') + '<span class="pp-cap"></span>';
        }
        layer.appendChild(e); els.set(key, e);
      }
      seen.add(key); return e;
    }
    function setPic(e, it, sel) {
      const im = e.querySelector(sel || ':scope > img');
      if (im && im.dataset.src !== it.src) { im.src = it.src; im.dataset.src = it.src; }
    }
    function place(e, x, y, size, sc, z) {
      e.style.width = e.style.height = size + 'px';
      e.style.transform = `translate3d(${(x - size / 2).toFixed(1)}px,${(y - size / 2).toFixed(1)}px,0) scale(${Math.max(0, sc).toFixed(4)})`;
      e.style.zIndex = z || 1;
    }
    function label(e, it) {
      if (e.dataset.id !== it.id) { e.dataset.id = it.id; e.setAttribute('aria-label', 'Open ' + (it.title || 'work')); const c = e.querySelector('.pp-cap'); if (c) c.textContent = it.title || ''; }
    }

    // draw one loop (n) at local time u (can be > L for its tail)
    function drawLoop(n, u) {
      const pic = j => items[mod(n * PER + j, items.length)];
      const cx = W / 2, cy = H / 2;
      // 1 · zoom-through
      const zs = S * 1.05;
      if (u >= 0 && u < P0 + .1) {
        const done = clamp(Math.floor((u - Z0 - 1.6) / ZSTEP) + 1, 0, ZN);    // finished inner zooms
        let sc;
        if (u < .6) sc = .15 + .35 * backOut(u / .6);
        else if (u < Z0) sc = .5 + .28 * ease(prog(u, .6, Z0));
        else if (u < ZEND) {   // each zoom nudges the card a little bigger or smaller, like the reference
          const i = clamp(Math.floor((u - Z0) / ZSTEP), 0, ZN - 1), a = Z0 + i * ZSTEP;
          const from = .78 + [0, .08, .02][i], to = .78 + [.08, .02, .1][i];
          sc = from + (to - from) * inOut(prog(u, a + .7, a + 1.6));
        } else sc = .88 + (.62 / 1.05 - .88) * ease(prog(u, ZEND, P0));         // shrink to parade size
        const e = el(n + ':z', 'zoom');
        setPic(e, pic(done)); place(e, cx, cy, zs, sc, 3); label(e, pic(done));
        const inner = e.querySelector('.pp-inner');
        if (u >= Z0 && done < ZN) {
          const a = Z0 + done * ZSTEP, p1 = backOut(prog(u, a, a + .5)), p2 = inOut(prog(u, a + .7, a + 1.6));
          setPic(e, pic(done + 1), '.pp-inner img');
          inner.style.transform = `scale(${(.34 * p1 + (1 - .34) * p2).toFixed(4)})`;
          inner.style.borderRadius = (22 * (1 - p2)).toFixed(1) + '%'; inner.style.opacity = p1 > 0 ? 1 : 0;
        } else { inner.style.opacity = 0; }
      }
      // 2 · parade
      if (u >= P0 && u < P1) {
        const s = S * .62, gap = s * .12, startX = cx, travel = startX + s / 2 + PN * (s + gap);
        const shift = travel * inOut(prog(u, P0, P1));
        for (let i = 0; i < PN; i++) {
          const x = startX + i * (s + gap) - shift; if (x < -s || x > W + s) continue;
          const it = i === 0 ? pic(ZN) : pic(ZN + i);
          const e = el(n + ':p' + i, 'card'); setPic(e, it); label(e, it);
          place(e, x, cy, s, i === 0 ? 1 : ease(prog(u, P0 + i * .05, P0 + .4 + i * .05)), 2);
        }
      }
      // 3 · pop pairs + 4 · grey tiles, all on one drifting layer
      if (u >= C0 - .1) {
        const speed = S * 1.08;                       // px per second
        const drift = speed * (u - C0);
        const base = ZN + PN;
        for (let k = 0; k < CN; k++) {
          const tk = C0 + k * CIV; if (u < tk) break;
          const up = k % 2 === 0, size = S * (.66 + ((k * 37) % 26) / 100);
          const lx = W * (k === 0 ? .6 : k === 1 ? .74 : .88) + speed * (tk - C0);
          const x = lx - drift, y = cy + (up ? -1 : 1) * Math.min(H * .2, size * .42);
          if (x < -size) continue;
          const g = prog(u, G0 + k * .15, G0 + k * .15 + .8);
          const it = pic(base + k), e = el(n + ':c' + k, 'card'); setPic(e, it); label(e, it);
          place(e, x, y, size, backOut(prog(u, tk, tk + .7)), 4);
          e.style.setProperty('--g', g.toFixed(3)); e.classList.toggle('is-ghost', g > .97);
        }
        for (let j = 0; j < GN; j++) {
          const tj = G0 + j * GIV; if (u < tj) break;
          const size = S * (.58 + (j % 3) * .12), lx = W * .9 + speed * (tj - C0);
          const x = lx - drift, y = cy + (j % 2 ? 1 : -1) * H * (.08 + (j % 4) * .06);
          if (x < -size) continue;
          const e = el(n + ':g' + j, 'ghost'); e.style.setProperty('--gl', (j % 3) * 7 + '%');
          place(e, x, y, size, backOut(prog(u, tj, tj + .6)), 4);
        }
      }
    }

    let T = 0;   // the clock, in seconds — dragging moves it
    function draw() {
      seen.clear();
      const n = Math.floor(T / L), u = T - n * L;
      drawLoop(n, u);
      if (u < TAIL) drawLoop(n - 1, u + L);      // last loop's grey tiles still leaving
      els.forEach((e, k) => { if (!seen.has(k)) { e.remove(); els.delete(k); } });
    }

    // clock: plays at a calm pace, drag/swipe/keys move it, a little momentum after letting go
    const rate = opts.rate || 1;
    const SECPX = () => 1 / (S * 1.08);          // seconds per dragged pixel — matches the drift speed
    let vel = 0, dragging = false, lastT = performance.now(), visible = false, hover = false, idleUntil = 0;
    function tick(now) {
      const dt = Math.min(64, now - lastT) / 1000; lastT = now;
      if (visible && !dragging) {
        if (Math.abs(vel) > .02) { T += vel * dt; vel *= Math.pow(.05, dt); }
        else { vel = 0; if (!reduce && now >= idleUntil) T += dt * rate * (hover ? .45 : 1); }
        draw();
      }
      requestAnimationFrame(tick);
    }

    let sx0 = 0, sy0 = 0, T0 = 0, moved = false, lastX = 0, lastMT = 0, pid = null, axis = null;
    stage.addEventListener('pointerdown', e => {
      if (e.button !== undefined && e.button !== 0) return;
      pid = e.pointerId; sx0 = lastX = e.clientX; sy0 = e.clientY; T0 = T; moved = false; axis = null; vel = 0; lastMT = performance.now();
    });
    stage.addEventListener('pointermove', e => {
      if (pid !== e.pointerId) return;
      const dx = e.clientX - sx0, dy = e.clientY - sy0;
      if (!axis) {
        if (Math.hypot(dx, dy) < 6) return;
        axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
        if (axis === 'x') { dragging = moved = true; stage.classList.add('is-dragging'); try { stage.setPointerCapture(pid); } catch (er) {} }
      }
      if (axis !== 'x') return;
      const now = performance.now(), ddt = Math.max(8, now - lastMT);
      vel = -(e.clientX - lastX) / ddt * 1000 * SECPX(); lastX = e.clientX; lastMT = now;
      T = T0 - dx * SECPX(); draw();
    });
    const up = e => {
      if (pid !== e.pointerId) return; pid = null;
      if (dragging) { dragging = false; stage.classList.remove('is-dragging'); vel = clamp(vel, -6, 6); idleUntil = performance.now() + 1500; }
    };
    stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', up);
    stage.addEventListener('click', e => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);   // a drag is not a tap
    stage.addEventListener('wheel', e => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) { e.preventDefault(); T += e.deltaX * SECPX(); vel = 0; idleUntil = performance.now() + 1500; draw(); }
    }, { passive: false });
    stage.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); vel = e.key === 'ArrowRight' ? 3 : -3; idleUntil = performance.now() + 2000; }
    });
    stage.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') hover = true; });
    stage.addEventListener('pointerleave', () => { hover = false; });

    new IntersectionObserver(es => es.forEach(e => { visible = e.isIntersecting; if (visible) lastT = performance.now(); }), { rootMargin: '120px 0px' }).observe(stage);
    let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { const f = T / L; measure(); T = f * L; els.forEach(e => e.remove()); els.clear(); draw(); }, 200); });
    measure(); T = L * 1000 + (reduce ? 2.5 : 0);      // start a few loops in, so dragging back always has pictures
    draw(); requestAnimationFrame(tick);
  };
})();
