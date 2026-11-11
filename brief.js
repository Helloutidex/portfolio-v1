/* ============================================================
   Project questionnaires (brief.html). One for each kind of work.
   Pick a type → answer one short step at a time → send. Answers go
   to the contact email (via FormSubmit) and can also be sent on WhatsApp.
   To change the questions, edit BRIEFS below.
   Field: [name, label, type, options/placeholder, required]
     type: text | email | tel | url | textarea | choice (one) | multi (many) | date
============================================================ */
(function () {
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const $ = s => document.querySelector(s);

  const YOU = { title: 'About you', fields: [
    ['name', 'Your name', 'text', '', true],
    ['email', 'Email', 'email', 'you@company.com', true],
    ['whatsapp', 'WhatsApp number', 'tel', '+234 …', false],
    ['company', 'Company / organisation', 'text', '', false],
  ]};
  const WRAP = { title: 'Budget & timing', fields: [
    ['budget', 'Estimated budget for this project', 'budget', '', false],
    ['deadline', 'When do you need it?', 'date', '', false],
    ['refs', 'Links to anything you like (references, current work, drive folder)', 'textarea', 'Paste links here', false],
    ['extra', 'Anything else I should know?', 'textarea', '', false],
  ]};

  // estimated budget slider: 0 → max in the chosen currency (curved, so smaller budgets are easy to pick)
  const CUR = { NGN: { sym: '₦', max: 10000000 }, USD: { sym: '$', max: 10000000 }, GBP: { sym: '£', max: 10000000 }, CAD: { sym: 'CA$', max: 10000000 } };
  const short = n => n >= 1e6 ? (n / 1e6).toFixed(n % 1e6 ? 1 : 0) + 'm' : n >= 1e3 ? Math.round(n / 1e3) + 'k' : String(n);
  const budgetValue = (cur, pos) => { const v = CUR[cur].max * Math.pow(pos / 1000, 3); const step = v < 1e4 ? 500 : v < 1e5 ? 5000 : v < 1e6 ? 25000 : 100000; return Math.round(v / step) * step; };
  const fmtBudget = (cur, pos) => { const v = budgetValue(cur, pos); return pos >= 1000 ? `${CUR[cur].sym}${v.toLocaleString('en')}+` : `${CUR[cur].sym}${v.toLocaleString('en')}`; };
  const BRIEFS = {
    branding: { label: 'Brand identity', icon: '◆', blurb: 'A complete look and feel for your business — logo, colours, type and how it all works together.', steps: [
      YOU,
      { title: 'Your business', fields: [
        ['business', 'What does your business do, in one or two sentences?', 'textarea', '', true],
        ['stage', 'Where are you right now?', 'choice', ['Brand new — no brand yet', 'Have a brand, it needs a refresh', 'Full rebrand', 'Launching a new product / sub-brand'], true],
        ['audience', 'Who are your customers?', 'textarea', 'Age, location, lifestyle, what they care about…', true],
        ['competitors', 'Two or three competitors or brands you admire', 'textarea', '', false],
      ]},
      { title: 'Personality', fields: [
        ['words', 'Three words people should feel about your brand', 'text', 'e.g. bold, trustworthy, playful', true],
        ['tone', 'Which feels closer?', 'choice', ['Classic & premium', 'Modern & minimal', 'Bold & loud', 'Warm & friendly', 'Playful & youthful'], true],
        ['avoid', 'Colours or styles to avoid', 'text', '', false],
      ]},
      { title: 'What you need', fields: [
        ['deliverables', 'Pick everything you need', 'multi', ['Logo', 'Colour palette', 'Typography', 'Brand guidelines', 'Business cards & stationery', 'Social media kit', 'Packaging', 'Signage', 'Website design', 'Brand strategy & naming'], true],
      ]},
      WRAP,
    ]},
    logo: { label: 'Logo design', icon: '●', blurb: 'Just the mark — a logo that is simple, memorable and works everywhere.', steps: [
      YOU,
      { title: 'The name', fields: [
        ['logoName', 'Exact name to appear in the logo', 'text', '', true],
        ['tagline', 'Tagline (if any)', 'text', '', false],
        ['business', 'What does the business do?', 'textarea', '', true],
      ]},
      { title: 'Style', fields: [
        ['logoType', 'What kind of logo do you picture?', 'choice', ['Wordmark (just the name)', 'Lettermark / monogram', 'Symbol + name', 'Emblem / badge', 'Mascot', "Not sure — you suggest"], true],
        ['feel', 'Three words to describe the feel', 'text', '', true],
        ['colours', 'Colours you want (or want to avoid)', 'text', '', false],
        ['where', 'Where will it be used most?', 'multi', ['Social media', 'Website / app', 'Packaging', 'Signage', 'Clothing / merch', 'Print'], false],
      ]},
      { title: 'Files', fields: [
        ['current', 'Do you have a current logo? Paste a link', 'url', 'https://…', false],
        ['variations', 'Extra versions needed', 'multi', ['Icon / favicon', 'Black & white', 'Horizontal + stacked', 'Animated logo'], false],
      ]},
      WRAP,
    ]},
    editorial: { label: 'Editorial / publication', icon: '▤', blurb: 'Magazines, annual reports, books, company profiles, menus and other multi-page documents.', steps: [
      YOU,
      { title: 'The publication', fields: [
        ['pubType', 'What is it?', 'choice', ['Magazine', 'Annual report', 'Company profile', 'Book / e-book', 'Brochure / catalogue', 'Menu', 'Other'], true],
        ['pages', 'Roughly how many pages?', 'text', 'e.g. 24', true],
        ['size', 'Size / format', 'choice', ['A4', 'A5', 'Letter', 'Square', 'Digital only (PDF / screen)', 'Not sure'], true],
        ['output', 'Will it be printed?', 'choice', ['Print', 'Digital', 'Both'], true],
      ]},
      { title: 'Content', fields: [
        ['contentReady', 'Is the text ready?', 'choice', ['Yes, final copy', 'Draft only', 'No — I need help writing it'], true],
        ['images', 'Pictures', 'choice', ['I have all the photos', 'Some photos', 'Need stock images / illustrations'], true],
        ['brandRules', 'Is there a brand guide to follow? Paste a link', 'url', '', false],
      ]},
      WRAP,
    ]},
    events: { label: 'Event branding', icon: '✦', blurb: 'A full identity for an event — the name, look and everything it appears on.', steps: [
      YOU,
      { title: 'The event', fields: [
        ['eventName', 'Event name', 'text', '', true],
        ['eventType', 'Type of event', 'choice', ['Conference / summit', 'Concert / festival', 'Wedding', 'Product launch', 'Church / community', 'Corporate / award night', 'Other'], true],
        ['eventDate', 'Event date', 'date', '', true],
        ['venue', 'Venue / city', 'text', '', false],
        ['guests', 'Expected number of guests', 'text', '', false],
      ]},
      { title: 'The look', fields: [
        ['theme', 'Theme or message of the event', 'textarea', '', true],
        ['mood', 'Mood', 'choice', ['Elegant', 'Energetic', 'Corporate', 'Cultural / traditional', 'Futuristic', 'Fun'], true],
        ['eventColours', 'Colours (or a host brand to follow)', 'text', '', false],
      ]},
      { title: 'Everything it needs', fields: [
        ['eventItems', 'Pick what you need', 'multi', ['Event logo', 'Flyers & social posts', 'Banners / backdrop', 'Stage screens / slides', 'Tickets & tags', 'Programme booklet', 'Merch (shirts, bags)', 'Signage & directions', 'Invitations', 'Countdown posts'], true],
      ]},
      WRAP,
    ]},
    eventdesign: { label: 'Event designs (flyers, banners)', icon: '▲', blurb: 'Individual designs for an event you already have — flyers, posters, banners, tags and posts.', steps: [
      YOU,
      { title: 'The event', fields: [
        ['eventName', 'Event name', 'text', '', true],
        ['eventDate', 'Date & time', 'text', 'e.g. Sat 14 June, 4pm', true],
        ['venue', 'Venue', 'text', '', true],
        ['details', 'Everything that must be on the design (speakers, ticket price, contacts, sponsors…)', 'textarea', '', true],
      ]},
      { title: 'Designs', fields: [
        ['items', 'What do you need?', 'multi', ['Flyer (social)', 'Poster (print)', 'Roll-up banner', 'Backdrop', 'ID tags', 'Certificates', 'Countdown posts', 'Speaker cards', 'Thank-you post'], true],
        ['sizes', 'Sizes (if you know them)', 'text', 'e.g. 1080×1350, A3, 6×3ft', false],
        ['assets', 'Logos / photos to use — paste a link', 'url', '', false],
        ['style', 'Any style you have in mind?', 'textarea', '', false],
      ]},
      WRAP,
    ]},
    campaign: { label: 'Campaign / social ads', icon: '◐', blurb: 'Ads and social creatives that sell — one launch or a whole month of content.', steps: [
      YOU,
      { title: 'The campaign', fields: [
        ['product', 'What are you promoting?', 'textarea', '', true],
        ['goal', 'Main goal', 'choice', ['Sales / sign-ups', 'Awareness', 'Launch something new', 'Event attendance', 'Engagement / followers'], true],
        ['offer', 'The key message or offer', 'text', 'e.g. 20% off this weekend', true],
        ['audience', 'Who should see it?', 'textarea', '', true],
      ]},
      { title: 'Creatives', fields: [
        ['platforms', 'Where will it run?', 'multi', ['Instagram', 'Facebook', 'TikTok', 'X (Twitter)', 'LinkedIn', 'WhatsApp status', 'Billboard / print', 'Google display'], true],
        ['count', 'How many designs?', 'choice', ['1–3', '4–10', '11–20', '20+ / monthly retainer'], true],
        ['formats', 'Formats', 'multi', ['Static post (4:5)', 'Square (1:1)', 'Story / reel cover (9:16)', 'Carousel', 'Animated / motion'], false],
        ['brandAssets', 'Brand guide, logos, product photos — paste a link', 'url', '', false],
      ]},
      WRAP,
    ]},
  };
  window.PORTFOLIO_BRIEFS = BRIEFS;

  const root = $('#brief'); if (!root) return;
  let type = null, step = 0;
  const answers = {};
  const params = new URLSearchParams(location.search);

  function pickScreen() {
    type = null; step = 0;
    root.innerHTML = `<div class="bf-pick">${Object.entries(BRIEFS).map(([k, b], i) => `
      <button type="button" class="bf-type" data-type="${k}" style="--i:${i}"><span class="bf-ico" aria-hidden="true">${b.icon}</span><strong>${esc(b.label)}</strong><em>${esc(b.blurb)}</em><i>Start →</i></button>`).join('')}</div>`;
    history.replaceState(null, '', location.pathname);
  }
  function field(f) {
    const [name, label, kind, opt, req] = f, v = answers[name];
    const star = req ? ' <b class="bf-req">*</b>' : '';
    if (kind === 'choice' || kind === 'multi') return `<fieldset class="bf-field" data-name="${name}" data-kind="${kind}" ${req ? 'data-req' : ''}><legend><span>${esc(label)}${star}</span></legend><div class="bf-chips">${opt.map(o => {
      const on = kind === 'multi' ? (v || []).includes(o) : v === o;
      return `<button type="button" class="bf-chip${on ? ' is-on' : ''}" data-val="${esc(o)}" aria-pressed="${on}">${esc(o)}</button>`; }).join('')}</div></fieldset>`;
    if (kind === 'budget') {
      const cur = answers._cur || 'NGN', pos = answers._pos != null ? answers._pos : 0;
      return `<div class="bf-field bf-budget" data-name="${name}" data-kind="budget"><span>${esc(label)}${star}</span>
        <p class="bf-note">Just an estimate to help me plan — the final price is discussed with you.</p>
        <div class="bf-cur" role="radiogroup" aria-label="Currency">${Object.keys(CUR).map(k => `<button type="button" class="bf-chip${k === cur ? ' is-on' : ''}" data-cur="${k}" aria-pressed="${k === cur}">${CUR[k].sym} ${k}</button>`).join('')}</div>
        <output class="bf-amount" data-amount>${fmtBudget(cur, pos)}</output>
        <input type="range" class="bf-range" min="0" max="1000" step="1" value="${pos}" data-range aria-label="Estimated budget" style="--p:${pos / 10}%">
        <div class="bf-scale"><span>${CUR[cur].sym}0</span><span>${CUR[cur].sym}${short(CUR[cur].max)}</span></div></div>`;
    }
    if (kind === 'textarea') return `<label class="bf-field"><span>${esc(label)}${star}</span><textarea name="${name}" rows="3" placeholder="${esc(opt)}" ${req ? 'required' : ''}>${esc(v || '')}</textarea></label>`;
    return `<label class="bf-field"><span>${esc(label)}${star}</span><input name="${name}" type="${kind}" placeholder="${esc(opt)}" value="${esc(v || '')}" ${req ? 'required' : ''}></label>`;
  }
  let firstShow = true;
  function stepScreen() {
    const b = BRIEFS[type], s = b.steps[step], n = b.steps.length;
    root.innerHTML = `<div class="bf-form">
      <div class="bf-top"><button type="button" class="bf-link" data-change>← All questionnaires</button><span>${esc(b.label)}</span></div>
      <div class="bf-progress" aria-hidden="true"><span style="width:${((step + 1) / n) * 100}%"></span></div>
      <p class="bf-step">Step ${step + 1} of ${n}</p>
      <h2>${esc(s.title)}</h2>
      <form class="bf-fields" novalidate>${s.fields.map(field).join('')}</form>
      <p class="bf-error" role="status"></p>
      <div class="bf-nav">${step ? '<button type="button" class="bf-btn ghost" data-back>Back</button>' : '<span></span>'}<button type="button" class="bf-btn" data-next>${step === n - 1 ? 'Review & send' : 'Next →'}</button></div>
    </div>`;
    const first = root.querySelector('input,textarea'); if (first && window.innerWidth > 800) first.focus();
    if (!firstShow) root.scrollIntoView({ behavior: 'smooth', block: 'start' }); firstShow = false;
  }
  function collect() {
    root.querySelectorAll('.bf-fields input[name], .bf-fields textarea[name]').forEach(el => { answers[el.name] = el.value.trim(); });
  }
  function valid() {
    const s = BRIEFS[type].steps[step]; let ok = true;
    s.fields.forEach(([name, , kind, , req]) => {
      const v = answers[name], empty = Array.isArray(v) ? !v.length : !v;
      const el = root.querySelector(`[name="${name}"], [data-name="${name}"]`);
      const bad = (req && empty) || (kind === 'email' && v && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v));
      if (el) el.closest('.bf-field').classList.toggle('is-bad', !!bad);
      if (bad) ok = false;
    });
    root.querySelector('.bf-error').textContent = ok ? '' : 'Please fill the highlighted questions.';
    return ok;
  }
  function summary() {
    if (answers._pos && !answers.budget) answers.budget = fmtBudget(answers._cur || 'NGN', answers._pos) + ' ' + (answers._cur || 'NGN');
    const b = BRIEFS[type], rows = [];
    b.steps.forEach(s => s.fields.forEach(([name, label]) => { const v = answers[name]; if (v && (!Array.isArray(v) || v.length)) rows.push([label, Array.isArray(v) ? v.join(', ') : v]); }));
    return rows;
  }
  function review() {
    const rows = summary();
    root.innerHTML = `<div class="bf-form">
      <div class="bf-top"><button type="button" class="bf-link" data-edit>← Edit answers</button><span>${esc(BRIEFS[type].label)}</span></div>
      <div class="bf-progress"><span style="width:100%"></span></div>
      <h2>Check your answers</h2>
      <dl class="bf-review">${rows.map(([l, v]) => `<div><dt>${esc(l)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
      <p class="bf-error" role="status"></p>
      <div class="bf-nav bf-send"><button type="button" class="bf-btn" data-send>Send questionnaire</button><button type="button" class="bf-btn wa" data-wa>Send on WhatsApp</button></div>
    </div>`;
  }
  const C = () => window.PORTFOLIO_CONTENT || {};
  const emailTo = () => String((C().contact && C().contact.emailHref) || 'mailto:samuel.s.adedeji@gmail.com').replace(/^mailto:/, '').split('?')[0];
  const waNum = () => String((C().hero && C().hero.whatsapp) || '2348065925091').replace(/\D/g, '').replace(/^0(?=\d{10}$)/, '234');
  async function send(btn) {
    const status = root.querySelector('.bf-error'), rows = summary();
    btn.disabled = true; status.textContent = 'Sending…';
    const data = { _subject: `New ${BRIEFS[type].label} questionnaire — ${answers.name || ''}`, _template: 'table', _captcha: 'false', questionnaire: BRIEFS[type].label };
    rows.forEach(([l, v]) => { data[l] = v; }); if (answers.email) data._replyto = answers.email;
    try {
      const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(emailTo())}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error();
      root.innerHTML = `<div class="bf-done"><span class="bf-tick">✓</span><h2>Thank you${answers.name ? ', ' + esc(answers.name.split(' ')[0]) : ''}!</h2><p>Your ${esc(BRIEFS[type].label.toLowerCase())} questionnaire has been sent. I'll reply within 1–2 working days.</p>
        <div class="bf-nav"><a class="bf-btn ghost" href="index.html">Back to the portfolio</a><button type="button" class="bf-btn wa" data-wa>Also send on WhatsApp</button></div></div>`;
    } catch (e) {
      btn.disabled = false; status.textContent = "Couldn't send right now. Use “Send on WhatsApp” instead — nothing is lost.";
    }
  }
  function whatsapp() {
    const lines = [`*${BRIEFS[type].label} questionnaire*`, ...summary().map(([l, v]) => `*${l}:* ${v}`)];
    window.open(`https://wa.me/${waNum()}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
  }
  root.addEventListener('click', e => {
    const t = e.target;
    const tp = t.closest('[data-type]'); if (tp) { type = tp.dataset.type; step = 0; history.replaceState(null, '', '?type=' + type); return stepScreen(); }
    if (t.closest('[data-change]')) return pickScreen();
    const cb = t.closest('[data-cur]');
    if (cb) { answers._cur = cb.dataset.cur; if (answers._pos) answers.budget = fmtBudget(answers._cur, answers._pos) + ' ' + answers._cur; collect(); return stepScreen(); }
    const chip = t.closest('.bf-chip');
    if (chip) {
      const fs = chip.closest('[data-name]'), name = fs.dataset.name, val = chip.dataset.val;
      if (fs.dataset.kind === 'multi') { const arr = answers[name] = answers[name] || []; const i = arr.indexOf(val); i < 0 ? arr.push(val) : arr.splice(i, 1); chip.classList.toggle('is-on', i < 0); chip.setAttribute('aria-pressed', String(i < 0)); }
      else { answers[name] = val; fs.querySelectorAll('.bf-chip').forEach(c => { const on = c === chip; c.classList.toggle('is-on', on); c.setAttribute('aria-pressed', String(on)); }); }
      fs.classList.remove('is-bad'); return;
    }
    if (t.closest('[data-next]')) { collect(); if (!valid()) return; if (step < BRIEFS[type].steps.length - 1) { step++; stepScreen(); } else review(); return; }
    if (t.closest('[data-back]')) { collect(); step--; return stepScreen(); }
    if (t.closest('[data-edit]')) { step = 0; return stepScreen(); }
    if (t.closest('[data-send]')) return send(t.closest('[data-send]'));
    if (t.closest('[data-wa]')) return whatsapp();
  });
  root.addEventListener('input', e => {
    const r = e.target.closest('[data-range]'); if (!r) return;
    answers._pos = Number(r.value); r.style.setProperty('--p', (answers._pos / 10) + '%');
    const cur = answers._cur || 'NGN'; answers.budget = fmtBudget(cur, answers._pos) + ' ' + cur;
    root.querySelector('[data-amount]').textContent = fmtBudget(cur, answers._pos);
  });
  root.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.tagName === 'INPUT') { e.preventDefault(); root.querySelector('[data-next]')?.click(); } });
  const want = params.get('type');
  if (want && BRIEFS[want]) { type = want; stepScreen(); } else pickScreen();
})();
