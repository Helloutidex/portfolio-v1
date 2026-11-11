/* ============================================================
   "Let's make something worth seeing." — background puzzle.
   Hundreds of small tiles drift in, click together into a shape
   (the SA. mark, the lens, an arrow, a cube), hold for a moment,
   break apart and assemble the next one. Tiles move away from the
   pointer. Turn it off in admin → Effects.
============================================================ */
(function () {
  const sec = document.getElementById('contact'); if (!sec) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cv = document.createElement('canvas'); cv.className = 'cta-puzzle'; cv.setAttribute('aria-hidden', 'true');
  sec.prepend(cv);
  const ctx = cv.getContext('2d');
  let W = 0, H = 0, DPR = 1, tiles = [], shapes = [], si = 0, phase = 'build', t0 = 0, running = false, raf = 0;
  const mouse = { x: -1e4, y: -1e4 };
  const N_DESK = 520, N_PHONE = 300;

  // shapes are drawn on a small off-screen canvas, then sampled into points (0..1 space)
  function sample(draw, n) {
    const S = 220, o = document.createElement('canvas'); o.width = o.height = S;
    const g = o.getContext('2d'); g.fillStyle = '#000'; g.strokeStyle = '#000'; draw(g, S);
    const d = g.getImageData(0, 0, S, S).data, pts = [];
    for (let y = 0; y < S; y += 3) for (let x = 0; x < S; x += 3) if (d[(y * S + x) * 4 + 3] > 128) pts.push([x / S, y / S, (d[(y * S + x) * 4] > 128) ? 1 : 0]);
    // shuffle + trim/pad to n
    for (let i = pts.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [pts[i], pts[j]] = [pts[j], pts[i]]; }
    const out = []; for (let i = 0; i < n; i++) out.push(pts[i % pts.length] || [.5, .5, 0]);
    return out;
  }
  function buildShapes(n, logo) {
    const list = [];
    if (logo) list.push(sample((g, S) => { // SA. mark (red dot marked with the red channel)
      const k = S * .9 / 422; g.save(); g.translate(S * .05, S / 2 - 72 * k); g.scale(k, k);
      g.fill(logo.letters, 'evenodd'); g.fillStyle = '#f00'; g.fill(logo.dot); g.restore();
    }, n));
    list.push(sample((g, S) => { // the lens
      g.lineWidth = 7; [.44, .33, .22].forEach(r => { g.beginPath(); g.arc(S / 2, S / 2, S * r, 0, 7); g.stroke(); });
      g.fillStyle = '#f00'; g.beginPath(); g.arc(S * .81, S * .2, S * .045, 0, 7); g.fill();
      g.fillStyle = '#000'; g.fillRect(S / 2 - 2, S * .38, 4, S * .24); g.fillRect(S * .38, S / 2 - 2, S * .24, 4);
    }, n));
    list.push(sample((g, S) => { // arrow ↗
      g.lineWidth = 22; g.lineCap = 'square'; g.beginPath(); g.moveTo(S * .2, S * .8); g.lineTo(S * .78, S * .22); g.stroke();
      g.beginPath(); g.moveTo(S * .34, S * .2); g.lineTo(S * .8, S * .2); g.lineTo(S * .8, S * .66); g.stroke();
      g.fillStyle = '#f00'; g.fillRect(S * .12, S * .78, S * .1, S * .1);
    }, n));
    list.push(sample((g, S) => { // cube
      const c = S / 2, r = S * .4, p = a => [c + r * Math.cos(a), c + r * Math.sin(a)];
      const P = [0, 1, 2, 3, 4, 5].map(i => p(Math.PI / 6 + i * Math.PI / 3));
      g.lineWidth = 7; g.lineJoin = 'round'; g.beginPath(); P.forEach((q, i) => i ? g.lineTo(...q) : g.moveTo(...q)); g.closePath(); g.stroke();
      g.beginPath(); g.moveTo(c, c); g.lineTo(...P[1]); g.moveTo(c, c); g.lineTo(...P[3]); g.moveTo(c, c); g.lineTo(...P[5]); g.stroke();
      g.fillStyle = '#f00'; g.beginPath(); g.moveTo(c, c); g.lineTo(...P[5]); g.lineTo(...P[0]); g.lineTo(...P[1]); g.closePath(); g.globalAlpha = 1; g.fill();
    }, n));
    return list;
  }
  async function loadLogo() {
    try {
      const txt = await (await fetch('assets/brand.svg')).text();
      const get = id => { const m = txt.match(new RegExp('<g id="' + id + '">([\\s\\S]*?)</g>')); if (!m) return null; const p = new Path2D(); (m[1].match(/ d="([^"]+)"/g) || []).forEach(d => p.addPath(new Path2D(d.slice(4, -1)))); return p; };
      const letters = get('sa-letters'), dot = get('sa-dot'); return letters && dot ? { letters, dot } : null;
    } catch (e) { return null; }
  }

  function colours() {
    const cs = getComputedStyle(sec), fg = cs.color, bg = cs.backgroundColor;
    const m = bg.match(/\d+(\.\d+)?/g) || [0, 0, 0], [r, g, b] = m.map(Number);
    const redBg = r > 150 && g < 90 && b < 110; // dark mode: the band is red → accents go dark
    return { fg, acc: redBg ? 'rgba(10,10,12,.9)' : getComputedStyle(document.body).getPropertyValue('--accent').trim() || '#E8223E' };
  }
  let COL = { fg: '#fff', acc: '#E8223E' };

  function layout() {
    const r = sec.getBoundingClientRect(); DPR = Math.min(2, devicePixelRatio || 1);
    W = r.width; H = r.height; cv.width = W * DPR; cv.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  function frame() { // where the shape sits: right side on wide screens, behind the text on phones
    const wide = W > 820, size = wide ? Math.min(H * .78, W * .4) : Math.min(W * .9, H * .7);
    return { x: wide ? W * .73 - size / 2 : W / 2 - size / 2, y: H / 2 - size / 2, s: size, a: wide ? 1 : .35 };
  }
  function scatter(tl) { tl.sx = Math.random() * W; tl.sy = Math.random() * H; }
  function init(logo) {
    const n = W > 820 ? N_DESK : N_PHONE; shapes = buildShapes(n, logo);
    tiles = Array.from({ length: n }, (_, i) => {
      const tl = { x: Math.random() * W, y: Math.random() * H, vx: 0, vy: 0, rot: Math.random() * 6, vr: 0, kind: i % 3, d: Math.random() * .45 };
      scatter(tl); return tl;
    });
    si = 0; phase = 'build'; t0 = performance.now();
  }
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const T = { build: 2600, hold: 2600, burst: 1300 };

  function step(now) {
    raf = requestAnimationFrame(step);
    const el = now - t0; if (el > T[phase]) {
      t0 = now;
      if (phase === 'build') phase = 'hold';
      else if (phase === 'hold') { phase = 'burst'; tiles.forEach(scatter); }
      else { phase = 'build'; si = (si + 1) % shapes.length; }
    }
    const f = frame(), sh = shapes[si], tile = Math.max(2.2, f.s / 70), p = Math.min(1, (now - t0) / T[phase]);
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < tiles.length; i++) {
      const tl = tiles[i], pt = sh[i];
      let tx, ty;
      if (phase === 'burst') { tx = tl.sx; ty = tl.sy; }
      else { tx = f.x + pt[0] * f.s; ty = f.y + pt[1] * f.s; if (phase === 'hold') { tx += Math.sin(now / 600 + i) * .8; ty += Math.cos(now / 700 + i) * .8; } }
      const k = phase === 'build' ? .02 + .12 * ease(Math.max(0, Math.min(1, (p - tl.d) / (1 - tl.d)))) : phase === 'burst' ? .035 : .16;
      tl.vx += (tx - tl.x) * k; tl.vy += (ty - tl.y) * k;
      const dx = tl.x - mouse.x, dy = tl.y - mouse.y, d2 = dx * dx + dy * dy; // pointer pushes tiles away
      if (d2 < 14400) { const fz = (1 - Math.sqrt(d2) / 120) * 6; const d = Math.sqrt(d2) || 1; tl.vx += dx / d * fz; tl.vy += dy / d * fz; }
      tl.vx *= .72; tl.vy *= .72; tl.x += tl.vx; tl.y += tl.vy;
      const settled = phase === 'hold' || (phase === 'build' && p > .85);
      tl.rot += settled ? -tl.rot * .15 : (tl.vx * .01 + .01);
      const red = pt[2] === 1;
      ctx.globalAlpha = f.a * (phase === 'burst' ? .22 : red ? .95 : settled ? .55 : .3);
      ctx.fillStyle = red ? COL.acc : COL.fg;
      ctx.save(); ctx.translate(tl.x, tl.y); ctx.rotate(tl.rot);
      if (tl.kind === 0) ctx.fillRect(-tile / 2, -tile / 2, tile, tile);
      else if (tl.kind === 1) { ctx.beginPath(); ctx.moveTo(0, -tile * .7); ctx.lineTo(tile * .65, tile * .5); ctx.lineTo(-tile * .65, tile * .5); ctx.closePath(); ctx.fill(); }
      else { ctx.fillRect(-tile * .7, -tile * .18, tile * 1.4, tile * .36); }
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }
  function start() { if (running) return; running = true; t0 = performance.now(); raf = requestAnimationFrame(step); }
  function stop() { running = false; cancelAnimationFrame(raf); }

  sec.addEventListener('pointermove', e => { const r = sec.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
  sec.addEventListener('pointerleave', () => { mouse.x = mouse.y = -1e4; });

  (async function boot() {
    // wait for site text so the admin switch is respected
    for (let i = 0; i < 30 && !window.PORTFOLIO_CONTENT; i++) await new Promise(r => setTimeout(r, 150));
    const fx = (window.PORTFOLIO_CONTENT || {}).effects || {};
    if (fx.ctaPuzzle === false) { cv.remove(); return; }
    sec.classList.add('has-puzzle');
    const logo = await loadLogo(); layout(); COL = colours(); init(logo);
    if (reduce) { phase = 'hold'; t0 = performance.now(); for (let i = 0; i < 90; i++) { step(t0 + 10); cancelAnimationFrame(raf); } return; }
    new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? start() : stop()), { threshold: .05 }).observe(sec);
    let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { layout(); init(logo); }, 200); });
    new MutationObserver(() => { COL = colours(); }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  })();
})();
