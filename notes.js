/* ============================================================
   Pinned notes — three dark sticky notes pinned to the page.
   1. "How are you feeling today?" → one word → a kind reply
   2. "What are you building next?" → a nudge + the right questionnaire
   3. "Need a spark?" → a random design thought
   Questions are set in admin → Content → Pinned notes.
============================================================ */
(function () {
  const root = document.getElementById('notesBoard'); if (!root) return;
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const pick = a => a[Math.floor(Math.random() * a.length)];

  const MOODS = [
    [/^(happy|good|great|amazing|awesome|fine|okay|ok|joyful|joy|blessed|grateful|thankful|cool|chill|calm|peaceful|content|glad|fantastic|excellent|wonderful|lovely)$/i,
      ['Love that. Hold on to it — and maybe make something with it today.', 'Good days are great for bold ideas. What will you start?', 'That energy looks good on you. Keep it moving.']],
    [/^(excited|hyped|pumped|thrilled|inspired|motivated|energized|energised|ready|creative|curious)$/i,
      ['Ride the wave — write the idea down before it cools.', 'Inspired is the best time to sketch. Five minutes, one page.', "That's the spark most projects start with. Let's build something."]],
    [/^(tired|exhausted|sleepy|drained|weak|burnt|burned|burnout|fatigued|lazy)$/i,
      ['Rest is part of the process, not a break from it. Be kind to yourself today.', 'Small steps still count. Drink some water, take a breath.', 'Even great designers close the laptop. Recharge — the ideas will wait.']],
    [/^(stressed|anxious|worried|nervous|overwhelmed|pressured|scared|afraid|tense|confused|lost|stuck)$/i,
      ['One thing at a time. Pick the smallest next step and do only that.', "You don't have to solve it all today. Breathe in for four, out for six.", 'Stuck is just the moment before clarity. Talk it out — it helps.']],
    [/^(sad|down|low|lonely|upset|hurt|heartbroken|depressed|blue|unhappy|meh|empty)$/i,
      ["I'm sorry today feels heavy. You matter more than any deadline.", 'Some days are grey. Reach out to someone you trust — you are not alone.', 'Sending you a little light. Tomorrow is a new page.']],
    [/^(angry|mad|frustrated|annoyed|irritated|furious)$/i,
      ['Fair. Step away for ten minutes — fresh eyes fix most things.', 'Channel it into something bold. Some of the best work comes from frustration.', "Breathe. You've handled harder days than this."]],
    [/^(bored|idle|blank|nothing|neutral|normal|alright)$/i,
      ['Boredom is creativity waiting for a prompt. Try the games — top right!', 'Perfect time to explore something new. Have a look around the work.', 'Blank pages are full of possibility.']],
  ];
  const FALLBACK = ["Thanks for sharing. Whatever today brings, you've got this.", 'Noted — and appreciated. Take a moment for yourself today.', 'Every feeling is valid. Glad you stopped by.'];
  const TIPS = ['Squint at your design. What still stands out is your hierarchy.', 'Use one typeface, two weights. Restraint looks confident.', 'White space is not empty — it is breathing room.', 'Design the smallest size first. If the logo works at 16px, it works everywhere.', 'Steal the structure, never the style.', 'If everything is bold, nothing is.', 'Contrast is the fastest way to direct the eye.', 'Kill your darlings. The best idea is the one that serves the brief.', 'Good branding is a promise kept every single time.', 'Grids free you — they do not cage you.'];

  const C = () => window.PORTFOLIO_CONTENT || {};
  const notes = () => Object.assign({ feel: 'How are you feeling today? One word.', build: 'What are you building next?', spark: 'Need a spark?' }, (C().notes || {}));
  const guessBrief = t => /logo|mark|icon/i.test(t) ? 'logo' : /magazine|book|report|profile|brochure|menu|editorial/i.test(t) ? 'editorial' : /event|concert|wedding|conference|summit|launch party/i.test(t) ? 'events' : /flyer|banner|poster/i.test(t) ? 'eventdesign' : /ad|campaign|social|instagram|promo|post/i.test(t) ? 'campaign' : 'branding';

  function render() {
    const n = notes();
    root.innerHTML = `
      <article class="note n1"><span class="pin" aria-hidden="true"></span>
        <h3>${esc(n.feel)}</h3>
        <form class="note-form" data-note="feel"><input maxlength="24" placeholder="e.g. tired" aria-label="${esc(n.feel)}"><button type="submit" aria-label="Send">→</button></form>
        <p class="note-reply" aria-live="polite"></p></article>
      <article class="note n2"><span class="pin" aria-hidden="true"></span>
        <h3>${esc(n.build)}</h3>
        <form class="note-form" data-note="build"><input maxlength="60" placeholder="e.g. a logo for my bakery" aria-label="${esc(n.build)}"><button type="submit" aria-label="Send">→</button></form>
        <p class="note-reply" aria-live="polite"></p></article>
      <article class="note n3"><span class="pin" aria-hidden="true"></span>
        <h3>${esc(n.spark)}</h3>
        <button type="button" class="note-pull" data-note="spark">Pull a design thought</button>
        <p class="note-reply" aria-live="polite"></p></article>`;
  }
  function reply(note, html) {
    const p = note.querySelector('.note-reply'); p.classList.remove('is-in'); void p.offsetWidth; p.innerHTML = html; p.classList.add('is-in');
    note.classList.remove('swing'); void note.offsetWidth; note.classList.add('swing');
  }
  root.addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target, note = f.closest('.note'), v = f.querySelector('input').value.trim(); if (!v) return;
    if (f.dataset.note === 'feel') {
      const word = v.split(/\s+/)[0].replace(/[^a-z]/gi, '');
      const hit = MOODS.find(([re]) => re.test(word));
      reply(note, `<b>${esc(word || v)}.</b> ${esc(pick(hit ? hit[1] : FALLBACK))}`);
    } else {
      const k = guessBrief(v);
      reply(note, `Sounds exciting! Tell me more — <a href="brief.html?type=${k}">start a quick questionnaire →</a>`);
    }
  });
  root.addEventListener('click', e => { const b = e.target.closest('.note-pull'); if (b) reply(b.closest('.note'), esc(pick(TIPS))); });
  // tap anywhere on a note: it swings on its pin
  root.addEventListener('pointerdown', e => { const n = e.target.closest('.note'); if (n && !e.target.closest('input,button,a')) { n.classList.remove('swing'); void n.offsetWidth; n.classList.add('swing'); } });
  render();
  // re-render once the site text has loaded (admin questions)
  let tries = 0; const t = setInterval(() => { if (window.PORTFOLIO_CONTENT || ++tries > 20) { clearInterval(t); render(); } }, 150);
})();
