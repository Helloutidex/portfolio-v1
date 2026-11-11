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
    quiz: { name: 'Quiz ladder', blurb: 'Answer 12 questions in a row to reach the top. Two helpers: 50:50 and Skip.' },
    fonts: { name: 'Font spotter', blurb: 'Meet four fonts, then type anything and guess which font it is written in.' },
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
    cleanup = ({ odd: oddColour, memory, sudoku, words, quiz, fonts })[key](stage) || null;
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

  /* ---------- 5. Quiz ladder (general knowledge, climb to the top) ---------- */
  const QUESTIONS = [
    // [question, correct, wrong, wrong, wrong, level 1–3]
    ['What colour do you get by mixing blue and yellow?', 'Green', 'Purple', 'Orange', 'Brown', 1],
    ['How many days are in a leap year?', '366', '365', '364', '360', 1],
    ['Which planet is known as the Red Planet?', 'Mars', 'Venus', 'Jupiter', 'Mercury', 1],
    ['What is the capital of Nigeria?', 'Abuja', 'Lagos', 'Ibadan', 'Kano', 1],
    ['How many sides does a hexagon have?', '6', '5', '7', '8', 1],
    ['Which animal is known as the king of the jungle?', 'Lion', 'Elephant', 'Tiger', 'Gorilla', 1],
    ['What does "www" stand for in a website address?', 'World Wide Web', 'Web World Wide', 'Wide Web World', 'World Web Wide', 1],
    ['Which is the largest ocean on Earth?', 'Pacific', 'Atlantic', 'Indian', 'Arctic', 1],
    ['What gas do plants take in from the air?', 'Carbon dioxide', 'Oxygen', 'Nitrogen', 'Hydrogen', 2],
    ['In which continent is Egypt?', 'Africa', 'Asia', 'Europe', 'South America', 1],
    ['Which colour model is used for printing?', 'CMYK', 'RGB', 'HSL', 'HEX', 2],
    ['Who painted the Mona Lisa?', 'Leonardo da Vinci', 'Pablo Picasso', 'Vincent van Gogh', 'Michelangelo', 2],
    ['What is the boiling point of water at sea level?', '100 °C', '90 °C', '120 °C', '80 °C', 2],
    ['Which file type keeps a transparent background?', 'PNG', 'JPG', 'BMP', 'PDF only', 2],
    ['How many continents are there?', '7', '5', '6', '8', 2],
    ['What is the hardest natural substance?', 'Diamond', 'Gold', 'Iron', 'Quartz', 2],
    ['Which year did Nigeria gain independence?', '1960', '1963', '1957', '1970', 2],
    ['What is the space between lines of text called?', 'Leading', 'Kerning', 'Tracking', 'Bleed', 2],
    ['Which is the longest river in Africa?', 'Nile', 'Niger', 'Congo', 'Zambezi', 2],
    ['What does "DPI" measure?', 'Dots per inch', 'Data per image', 'Design pixel index', 'Digital print intensity', 3],
    ['Which element has the chemical symbol "Fe"?', 'Iron', 'Lead', 'Fluorine', 'Gold', 3],
    ['Which designer created the "I ♥ NY" logo?', 'Milton Glaser', 'Paul Rand', 'Saul Bass', 'Massimo Vignelli', 3],
    ['What is the smallest prime number?', '2', '1', '3', '0', 3],
    ['Which typeface family is Helvetica?', 'Sans-serif', 'Serif', 'Script', 'Slab serif', 3],
    ['How many bones does an adult human have?', '206', '201', '212', '196', 3],
    ['The golden ratio is closest to…', '1.618', '1.414', '3.142', '2.718', 3],
    ['Which company made the first iPhone?', 'Apple', 'Nokia', 'Samsung', 'BlackBerry', 1],
    ['Which language is mostly used to style web pages?', 'CSS', 'SQL', 'Python', 'C++', 2],
    ['Which is the tallest mountain in the world?', 'Mount Everest', 'Kilimanjaro', 'K2', 'Mont Blanc', 1],
    ['Complementary colour of red on the colour wheel?', 'Green', 'Blue', 'Yellow', 'Purple', 3],
  ];
  const LADDER = ['₦1,000', '₦2,000', '₦5,000', '₦10,000', '₦25,000', '₦50,000', '₦100,000', '₦250,000', '₦500,000', '₦1,000,000', '₦5,000,000', '₦10,000,000'];
  function quiz(stage) {
    const pick = lvl => shuffle(QUESTIONS.filter(q => q[5] === lvl));
    const set = [...pick(1).slice(0, 4), ...pick(2).slice(0, 4), ...pick(3).slice(0, 4)];
    let step = 0, used5050 = false, usedSkip = false, lock = false;
    const wrap = document.createElement('div'); wrap.className = 'gm-qwrap'; stage.appendChild(wrap);
    const ladderHTML = () => `<ol class="gm-ladder">${LADDER.map((v, i) => `<li class="${i === step ? 'is-now' : i < step ? 'is-done' : ''}${(i + 1) % 4 === 0 ? ' safe' : ''}"><span>${i + 1}</span>${v}</li>`).reverse().join('')}</ol>`;
    const safe = () => step >= 8 ? LADDER[7] : step >= 4 ? LADDER[3] : '₦0';
    const ask = () => {
      const q = set[step], opts = shuffle([q[1], q[2], q[3], q[4]]);
      wrap.innerHTML = `<div class="gm-q-main">
          <p class="gm-q-step">Question ${step + 1} of ${LADDER.length} · for ${LADDER[step]}</p>
          <h3 class="gm-q">${esc(q[0])}</h3>
          <div class="gm-opts">${opts.map((o, i) => `<button type="button" class="gm-opt" data-o="${esc(o)}"><b>${'ABCD'[i]}</b>${esc(o)}</button>`).join('')}</div>
          <div class="gm-row gm-life"><button type="button" class="gm-btn ghost" data-l="5050" ${used5050 ? 'disabled' : ''}>50:50</button><button type="button" class="gm-btn ghost" data-l="skip" ${usedSkip ? 'disabled' : ''}>Skip question</button><button type="button" class="gm-btn ghost" data-l="walk">Walk away with ${step ? LADDER[step - 1] : '₦0'}</button></div>
        </div>${ladderHTML()}`;
      status(stage, `Safe amount: <b>${safe()}</b>`);
    };
    const end = (msg, won) => { wrap.innerHTML = `<div class="gm-done gm-q-end"><strong>${msg}</strong><span>You leave with <b>${won}</b> (just for fun!)</span><button type="button" class="gm-btn" data-again>Play again</button></div>`; status(stage, ''); };
    wrap.addEventListener('click', e => {
      if (e.target.closest('[data-again]')) return play('quiz');
      const l = e.target.closest('[data-l]');
      if (l && !lock) {
        const q = set[step];
        if (l.dataset.l === '5050') { used5050 = true; l.disabled = true; let hidden = 0; [...wrap.querySelectorAll('.gm-opt')].filter(b => b.dataset.o !== q[1]).sort(() => Math.random() - .5).forEach(b => { if (hidden < 2) { b.disabled = true; b.classList.add('is-gone'); hidden++; } }); }
        if (l.dataset.l === 'skip') { usedSkip = true; const spare = QUESTIONS.filter(x => x[5] === q[5] && !set.includes(x)); if (spare.length) set[step] = spare[rnd(spare.length)]; ask(); }
        if (l.dataset.l === 'walk') end('You walked away — smart move.', step ? LADDER[step - 1] : '₦0');
        return;
      }
      const b = e.target.closest('.gm-opt'); if (!b || lock || b.disabled) return;
      lock = true; b.classList.add('is-picked');
      const right = b.dataset.o === set[step][1];
      setTimeout(() => {
        wrap.querySelectorAll('.gm-opt').forEach(x => { if (x.dataset.o === set[step][1]) x.classList.add('is-right'); });
        if (!right) b.classList.add('is-wrong');
        setTimeout(() => {
          lock = false;
          if (!right) return end('Oh no, that was wrong.', safe());
          step++;
          if (step >= LADDER.length) return end('🏆 You reached the top!', LADDER[LADDER.length - 1]);
          ask();
        }, 1100);
      }, 700);
    });
    ask();
  }

  /* ---------- 6. Font spotter ---------- */
  const FONT_SET = [
    ['Playfair Display', "'Playfair Display', Georgia, serif"], ['Bebas Neue', "'Bebas Neue', Impact, sans-serif"], ['Pacifico', "'Pacifico', cursive"],
    ['Space Mono', "'Space Mono', 'Courier New', monospace"], ['Lobster', "'Lobster', cursive"], ['Oswald', "'Oswald', 'Arial Narrow', sans-serif"],
    ['Abril Fatface', "'Abril Fatface', Georgia, serif"], ['Caveat', "'Caveat', cursive"], ['Montserrat', "'Montserrat', Arial, sans-serif"],
    ['Cinzel', "'Cinzel', 'Times New Roman', serif"], ['Comfortaa', "'Comfortaa', sans-serif"], ['Special Elite', "'Special Elite', 'Courier New', monospace"],
  ];
  let fontsLinked = false;
  function linkFonts() {
    if (fontsLinked) return; fontsLinked = true;
    const l = document.createElement('link'); l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?' + FONT_SET.map(f => 'family=' + f[0].replace(/ /g, '+')).join('&') + '&display=swap';
    document.head.appendChild(l);
  }
  function fonts(stage) {
    linkFonts();
    const round = shuffle(FONT_SET.slice()).slice(0, 4);
    let text = 'Design is intelligence made visible', score = 0, turns = 0, answer = null;
    const box = document.createElement('div'); box.className = 'gm-fonts'; stage.appendChild(box);
    const study = () => {
      box.innerHTML = `<p class="gm-clue">Study these four fonts. Then type anything and guess which one it is written in.</p>
        <div class="gm-font-list">${round.map(f => `<div class="gm-font-card"><span style="font-family:${f[1]}">Aa Bb Gg 123</span><b>${esc(f[0])}</b></div>`).join('')}</div>
        <div class="gm-row"><button type="button" class="gm-btn" data-start>I'm ready</button></div>`;
    };
    const ask = () => {
      answer = round[rnd(4)];
      box.innerHTML = `<label class="gm-type">Type anything<input type="text" maxlength="40" value="${esc(text)}" data-text></label>
        <div class="gm-specimen" style="font-family:${answer[1]}">${esc(text) || 'Aa'}</div>
        <p class="gm-clue">Which font is this?</p>
        <div class="gm-opts">${shuffle(round.slice()).map((f, i) => `<button type="button" class="gm-opt" data-f="${esc(f[0])}"><b>${'ABCD'[i]}</b>${esc(f[0])}</button>`).join('')}</div>
        <div class="gm-row"><button type="button" class="gm-btn ghost" data-study>See the fonts again</button></div>`;
      status(stage, `Score <b>${score}</b> / ${turns}`);
    };
    box.addEventListener('input', e => { if (e.target.matches('[data-text]')) { text = e.target.value; const sp = box.querySelector('.gm-specimen'); if (sp) sp.textContent = text || 'Aa'; } });
    box.addEventListener('click', e => {
      if (e.target.closest('[data-start]')) return ask();
      if (e.target.closest('[data-study]')) return study();
      if (e.target.closest('[data-next]')) return ask();
      const b = e.target.closest('.gm-opt'); if (!b || b.disabled) return;
      turns++; const right = b.dataset.f === answer[0]; if (right) score++;
      box.querySelectorAll('.gm-opt').forEach(x => { x.disabled = true; if (x.dataset.f === answer[0]) x.classList.add('is-right'); });
      if (!right) b.classList.add('is-wrong');
      status(stage, `${right ? 'Correct!' : 'It was ' + esc(answer[0]) + '.'} Score <b>${score}</b> / ${turns} <button type="button" class="gm-btn" data-next>Next</button>`);
    });
    stage.addEventListener('click', e => { if (e.target.closest('[data-next]')) ask(); });
    study();
  }

  window.PortfolioGames = { open, close, isOpen: () => !!root, list: GAMES };
})();
