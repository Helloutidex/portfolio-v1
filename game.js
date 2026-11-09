/* ============================================================
   Break-time games — pop up after a few quiet minutes (or when the
   visitor goes offline). Everything is drawn here: no images, no fonts
   to download, so it all works offline once the page has loaded.
   Games: Odd colour out · Memory · Mini Sudoku · Design words.
   Settings live in admin → Content → Break-time games.
============================================================ */
(function () {
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const rnd = n => Math.floor(Math.random() * n);
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  const GAMES = {
    odd: { name: 'Odd colour out', blurb: 'One square is a slightly different shade. Find it.' },
    memory: { name: 'Memory', blurb: 'Flip two cards at a time and match the design tools.' },
    sudoku: { name: 'Mini Sudoku', blurb: 'Fill the grid so every row, column and box has 1–4.' },
    words: { name: 'Design words', blurb: 'Unscramble the design word.' },
  };

  let root = null, onClose = null, cleanup = null;

  function open(opts) {
    opts = opts || {};
    const list = (opts.games && opts.games.length ? opts.games : Object.keys(GAMES)).filter(k => GAMES[k]);
    if (!list.length || root) return;
    onClose = opts.onClose || null;
    root = document.createElement('div');
    root.className = 'gm-overlay'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', 'Break-time game');
    root.innerHTML = `
      <div class="gm-box">
        <div class="gm-top">
          <div><span class="gm-eyebrow">${esc(opts.offline ? 'You are offline' : 'Break time')}</span>
          <h2 class="gm-title">${esc(opts.title || 'Taking a break? Play a quick game.')}</h2></div>
          <button class="gm-close" type="button" data-gm-close>✕ <span>Close game &amp; keep exploring</span></button>
        </div>
        <div class="gm-tabs" role="tablist">${list.map((k, i) => `<button type="button" role="tab" class="gm-tab${i ? '' : ' is-on'}" data-gm-tab="${k}">${esc(GAMES[k].name)}</button>`).join('')}</div>
        <p class="gm-blurb" id="gmBlurb"></p>
        <div class="gm-stage" id="gmStage"></div>
        <button class="gm-close gm-close-bottom" type="button" data-gm-close>Close game &amp; keep exploring →</button>
      </div>`;
    document.body.appendChild(root);
    document.documentElement.classList.add('gm-open');
    requestAnimationFrame(() => root.classList.add('is-in'));
    root.addEventListener('click', e => {
      if (e.target.closest('[data-gm-close]') || e.target === root) close();
      const t = e.target.closest('[data-gm-tab]');
      if (t) { root.querySelectorAll('.gm-tab').forEach(b => b.classList.toggle('is-on', b === t)); play(t.dataset.gmTab); }
    });
    document.addEventListener('keydown', onKey);
    play(list[0]);
    setTimeout(() => root && root.querySelector('.gm-close') && root.querySelector('.gm-close').focus(), 60);
  }
  function onKey(e) { if (e.key === 'Escape') close(); }
  function close() {
    if (!root) return;
    if (cleanup) { cleanup(); cleanup = null; }
    document.removeEventListener('keydown', onKey);
    const r = root; root = null; r.classList.remove('is-in');
    document.documentElement.classList.remove('gm-open');
    setTimeout(() => r.remove(), 300);
    if (onClose) onClose();
  }
  function play(key) {
    if (cleanup) { cleanup(); cleanup = null; }
    root.querySelector('#gmBlurb').textContent = GAMES[key].blurb;
    const old = root.querySelector('#gmStage'), stage = old.cloneNode(false); old.replaceWith(stage);   // fresh, no old listeners
    stage.className = 'gm-stage gm-' + key;
    cleanup = ({ odd: oddColour, memory, sudoku, words })[key](stage) || null;
  }
  const status = (stage, html) => { let s = stage.querySelector('.gm-status'); if (!s) { s = document.createElement('div'); s.className = 'gm-status'; stage.prepend(s); } s.innerHTML = html; };

  /* ---------- 1. Odd colour out ---------- */
  function oddColour(stage) {
    let level = 1, best = 0, timer = null, left = 0;
    try { best = Number(localStorage.getItem('gm-odd-best')) || 0; } catch (e) {}
    const grid = document.createElement('div'); grid.className = 'gm-odd-grid'; stage.appendChild(grid);
    const round = () => {
      const n = Math.min(7, 2 + Math.ceil(level / 2)), h = rnd(360), s = 55 + rnd(25), l = 45 + rnd(15);
      const diff = Math.max(3, 22 - level * 1.6), odd = rnd(n * n);
      grid.style.setProperty('--n', n);
      grid.innerHTML = Array.from({ length: n * n }, (_, i) => `<button type="button" aria-label="Square ${i + 1}" data-i="${i}" style="background:hsl(${h} ${s}% ${i === odd ? l + diff : l}%)"></button>`).join('');
      grid.dataset.odd = odd;
      status(stage, `Level <b>${level}</b> · <span id="gmTime">${left}</span>s left · best <b>${best}</b>`);
    };
    const start = () => { level = 1; left = 30; round(); clearInterval(timer); timer = setInterval(() => { left--; const t = stage.querySelector('#gmTime'); if (t) t.textContent = left; if (left <= 0) end(); }, 1000); };
    const end = () => {
      clearInterval(timer); timer = null;
      if (level - 1 > best) { best = level - 1; try { localStorage.setItem('gm-odd-best', best); } catch (e) {} }
      grid.innerHTML = `<div class="gm-done"><strong>Time! You reached level ${level}.</strong><button type="button" class="gm-btn" data-again>Play again</button></div>`;
      status(stage, `Best: <b>${best}</b>`);
    };
    grid.addEventListener('click', e => {
      if (e.target.closest('[data-again]')) return start();
      const b = e.target.closest('button[data-i]'); if (!b || !timer) return;
      if (b.dataset.i === grid.dataset.odd) { level++; left = Math.min(30, left + 2); round(); }
      else { b.classList.add('gm-shake'); left = Math.max(0, left - 3); setTimeout(() => b.classList.remove('gm-shake'), 400); }
    });
    start();
    return () => clearInterval(timer);
  }

  /* ---------- 2. Memory (design tools) ---------- */
  const ICONS = {
    pen: '<path d="M8 40 L20 12 L32 40 L20 34 Z" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><circle cx="20" cy="27" r="3" fill="currentColor"/>',
    type: '<text x="20" y="34" text-anchor="middle" font-family="Georgia,serif" font-size="26" font-weight="700" fill="currentColor">Aa</text>',
    grid: '<path d="M6 6h28v28H6zM6 15.3h28M6 24.6h28M15.3 6v28M24.6 6v28" fill="none" stroke="currentColor" stroke-width="2.5"/>',
    drop: '<path d="M20 6 C 28 18 32 22 32 28 a12 12 0 0 1-24 0 c0-6 4-10 12-22z" fill="currentColor"/>',
    curve: '<path d="M6 32 C 14 4, 26 36, 34 8" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="6" cy="32" r="3" fill="currentColor"/><circle cx="34" cy="8" r="3" fill="currentColor"/>',
    crop: '<path d="M12 4v24h24M4 12h24v24" fill="none" stroke="currentColor" stroke-width="3"/>',
    circle: '<circle cx="20" cy="20" r="13" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="20" cy="20" r="4" fill="currentColor"/>',
    layers: '<path d="M20 6 L36 14 L20 22 L4 14 Z" fill="currentColor"/><path d="M4 21 L20 29 L36 21M4 28 L20 36 L36 28" fill="none" stroke="currentColor" stroke-width="2.5"/>',
  };
  function memory(stage) {
    const keys = shuffle(Object.keys(ICONS)).slice(0, 6), deck = shuffle([...keys, ...keys]);
    let first = null, lock = false, moves = 0, found = 0;
    const board = document.createElement('div'); board.className = 'gm-mem-grid'; stage.appendChild(board);
    board.innerHTML = deck.map((k, i) => `<button type="button" class="gm-card" data-k="${k}" aria-label="Card ${i + 1}"><span class="gm-card-in"><span class="gm-face gm-back"></span><span class="gm-face gm-front"><svg viewBox="0 0 40 40" aria-hidden="true">${ICONS[k]}</svg></span></span></button>`).join('');
    const upd = () => status(stage, `Moves <b>${moves}</b> · pairs <b>${found}</b> / 6`); upd();
    board.addEventListener('click', e => {
      const c = e.target.closest('.gm-card'); if (!c || lock || c.classList.contains('is-up')) return;
      c.classList.add('is-up');
      if (!first) { first = c; return; }
      moves++;
      if (first.dataset.k === c.dataset.k) { first.classList.add('is-done'); c.classList.add('is-done'); first = null; found++; upd();
        if (found === 6) status(stage, `Done in <b>${moves}</b> moves! <button type="button" class="gm-btn" data-again>Play again</button>`); }
      else { lock = true; const a = first; first = null; upd(); setTimeout(() => { a.classList.remove('is-up'); c.classList.remove('is-up'); lock = false; }, 750); }
    });
    stage.addEventListener('click', e => { if (e.target.closest('[data-again]')) play('memory'); });
  }

  /* ---------- 3. Mini Sudoku (4 × 4) ---------- */
  function sudoku(stage) {
    // a valid solution: shuffle digits, rows inside bands, and the two bands
    const base = [[1, 2, 3, 4], [3, 4, 1, 2], [2, 1, 4, 3], [4, 3, 2, 1]], d = shuffle([1, 2, 3, 4]);
    let rows = base.map(r => r.map(v => d[v - 1]));
    const bands = shuffle([[0, 1], [2, 3]]).map(b => shuffle(b.slice()));
    rows = bands.flat().map(i => rows[i]);
    const sol = rows.flat(), givens = new Set(shuffle([...Array(16).keys()]).slice(0, 7));
    const val = sol.map((v, i) => givens.has(i) ? v : 0);
    const board = document.createElement('div'); board.className = 'gm-sudoku'; stage.appendChild(board);
    const draw = () => {
      board.innerHTML = val.map((v, i) => `<button type="button" data-i="${i}" class="${givens.has(i) ? 'is-given' : ''}${(i % 4) === 1 ? ' bx-r' : ''}${Math.floor(i / 4) === 1 ? ' bx-b' : ''}" ${givens.has(i) ? 'disabled' : ''}>${v || ''}</button>`).join('');
      // solved = every row, column and 2×2 box holds 1–4 once (any valid answer counts)
      const ok = idx => new Set(idx.map(i => val[i])).size === 4 && idx.every(i => val[i]);
      const groups = [];
      for (let r = 0; r < 4; r++) groups.push([0, 1, 2, 3].map(c => r * 4 + c));
      for (let c = 0; c < 4; c++) groups.push([0, 1, 2, 3].map(r => r * 4 + c));
      for (const [r, c] of [[0, 0], [0, 2], [2, 0], [2, 2]]) groups.push([r * 4 + c, r * 4 + c + 1, (r + 1) * 4 + c, (r + 1) * 4 + c + 1]);
      const full = val.every(Boolean), right = full && groups.every(ok);
      status(stage, right ? 'Solved! 🎉 <button type="button" class="gm-btn" data-again>New puzzle</button>' : full ? 'Not quite — something repeats. Keep going.' : 'Tap a square to cycle 1 → 4.');
    };
    board.addEventListener('click', e => { const b = e.target.closest('button[data-i]'); if (!b || b.disabled) return; const i = +b.dataset.i; val[i] = (val[i] % 4) + 1; draw(); });
    stage.addEventListener('click', e => { if (e.target.closest('[data-again]')) play('sudoku'); });
    draw();
  }

  /* ---------- 4. Design words ---------- */
  const WORDS = [['KERNING', 'Space between two letters'], ['PALETTE', 'A set of colours'], ['TYPEFACE', 'A family of letter designs'], ['CONTRAST', 'Difference that makes things stand out'],
    ['GRADIENT', 'One colour blending into another'], ['BASELINE', 'The line letters sit on'], ['LEADING', 'Space between lines of text'], ['VECTOR', 'Artwork made of paths, sharp at any size'],
    ['MOCKUP', 'Showing a design in a real-life scene'], ['WIREFRAME', 'A bare-bones layout'], ['SERIF', 'The little foot on a letter'], ['BRANDING', 'How a company looks and feels']];
  function words(stage) {
    let order = shuffle(WORDS.slice()), idx = 0, score = 0;
    const box = document.createElement('div'); box.className = 'gm-words'; stage.appendChild(box);
    const round = () => {
      const [word, clue] = order[idx % order.length]; let letters;
      do { letters = shuffle(word.split('')); } while (letters.join('') === word);
      const picked = [];
      const draw = () => {
        box.innerHTML = `<p class="gm-clue">${esc(clue)}</p>
          <div class="gm-answer">${word.split('').map((_, i) => `<span>${picked[i] != null ? letters[picked[i]] : ''}</span>`).join('')}</div>
          <div class="gm-tiles">${letters.map((ch, i) => `<button type="button" data-t="${i}" ${picked.includes(i) ? 'disabled' : ''}>${ch}</button>`).join('')}</div>
          <div class="gm-row"><button type="button" class="gm-btn ghost" data-undo>Undo</button><button type="button" class="gm-btn ghost" data-skip>Skip</button></div>`;
      };
      box.onclick = e => {
        const t = e.target.closest('[data-t]');
        if (t) { picked.push(+t.dataset.t); draw();
          if (picked.length === word.length) {
            const guess = picked.map(i => letters[i]).join('');
            if (guess === word) { score++; box.querySelector('.gm-answer').classList.add('is-right'); setTimeout(() => { idx++; round(); }, 700); }
            else { box.querySelector('.gm-answer').classList.add('gm-shake'); setTimeout(() => { picked.length = 0; draw(); }, 600); }
          }
          status(stage, `Solved <b>${score}</b>`); }
        if (e.target.closest('[data-undo]')) { picked.pop(); draw(); }
        if (e.target.closest('[data-skip]')) { idx++; round(); }
      };
      draw(); status(stage, `Solved <b>${score}</b>`);
    };
    round();
  }

  window.PortfolioGames = { open, close, isOpen: () => !!root, list: GAMES };
})();
