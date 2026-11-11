# Project notes: Designing What's Next (Adedeji Sunday Samuel portfolio)

Keep this file in the repo and update it with every change. Hand it to any
new Claude chat first; it's the project's memory.

## Owner and workflow
- Owner: Adedeji Sunday Samuel, independent designer, Lagos. Brand line: "Designing what's next."
- Repo: https://github.com/Helloutidex/portfolio-v1 (branch `main`), served by GitHub Pages
  (static, no build step). Plan: buy a custom domain plus hosting later.
- Local copy: a `portfolio-v1` folder on the owner's PC, linked to GitHub, updated with Git Bash.
- The admin's Publish tab also commits to the repo (site-data.json plus assets/uploads/),
  so **always `git pull` before `git push`**.
- Claude workflow: Claude returns only the changed files. Replace those files in the local
  `portfolio-v1` folder (overwrite, don't copy-paste contents), then:
  `git pull` → `git add .` → `git commit -m "message"` → `git push`.
- To start a new Claude chat: zip the whole `portfolio-v1` folder (including site-data.json) and
  point Claude to this file.

## Stack and files
Plain HTML/CSS/JS, no framework, no build.
- `index.html`: homepage. Hero with lens (tap to reveal project cards), About (portrait plus CV buttons),
  collaborator logo marquee, auto-moving work gallery, testimonials, experience, links, giant name
  signature, red "Let's talk" CTA, footer. Also holds the project modal, lightbox, password page and
  the floating rotating badge.
- `contact.html`: contact page. The form posts via FormSubmit.co (AJAX) to the email set in
  admin → Content → Contact.
- `style.css`: all public styles. `script.js`: all behaviour plus defaults.
- `admin.html/.css/.js`: browser-based editor (Content, Theme, Work, Publish) behind a passphrase.
- `assets/portrait.jpg`: portrait. `cv.pdf` (not in the repo yet) is used by the View/Download CV buttons.
- `.nojekyll`: lets GitHub Pages serve files as-is.

## Where content comes from (important)
1. `script.js` holds `DEFAULT_CONTENT`, `DEFAULT_THEME` and the default categories/projects.
2. On load it fetches `site-data.json` (written by the admin Publish tab), which **overrides** the defaults.
3. Admin "Save" only stores a draft in that browser's localStorage.
So if a text or color change in `script.js` doesn't show on the live site, `site-data.json` is overriding
it. Change it in admin and Publish instead, or edit `site-data.json`.
`site-data.json` and `assets/uploads/` (~7.6 MB of uploaded images, logos and the CV PDF) are written
by the admin. Never overwrite them with an older copy.
Note: site-data.json still stores work under the legacy `projects` key (Swyftsend + "Project 2–5");
script.js migrates it to sections on load.

## Design system
- Palette: black `#141211`, red `#E8223E`, white paper, grey body copy, soft grey tiles. Dark bands:
  social proof (#111214), links/signature (black), red contact block.
- DO NOT CHANGE without the owner's OK: the lens (rings, dashed ring + red dot, plus-sign crosshair,
  "Focus 01/05", notes under it), the floating cards' look, the portrait's black offset stroke, and the
  collaborators logo strip (real logos in grayscale, own colour on hover — never flattened to one colour).
  Only change what the owner explicitly asks for.
- Side padding `--edge: clamp(24px,6vw,140px)`; section rhythm `--section-y`.
- Big tight sans headlines with red italic serif accent words ("what's", "idea").
- Small uppercase mono labels. Dark mode toggle stored as localStorage `ferricool-mode`.

## Homepage order
Hero (lens) → Social proof (numbers band) → About → Collaborators logo strip → Work gallery → Logofolio (hidden
until logos are added) → Testimonials → Experience → Links + signature → Contact block → Footer.

## Admin fields added in v5
- Content → Social proof: label, optional heading, numbers (value + label, count up on scroll),
  client logos (bulk upload, "one soft white" toggle).
- Content → Logofolio: label, heading, light/dark tiles, logos (bulk upload, reorder).
- Sections → Case study → each case: "Project details" rows (Client, Industry, Country, Year,
  Director, Project Scope; renameable; empty rows hidden). Locked cases encrypt details too.

## Colour flash fix
Each page's <head> applies the last-seen theme colours from localStorage (`ferricool-theme-vars`) and
hides the page (`html.is-loading`) until script.js has applied site-data.json (max 2.5s fallback).

## Work structure
Sections (Case study, Editorial, Campaign ads, Logo folio, Events branding). Each one shows as a floating
hero card (first five), a gallery frame and its own page. Layout options: case-study list, natural
size, 2-col, 3-col, stack. Images are 1920px wide. Sections and cases can be password-locked (AES encrypted).

## Live content (from site-data.json, last edited 2026-11-09)
- Name used everywhere: "Adedeji Samuel" (nav "ADEDEJI SAMUEL / DESIGN", footer "© 2026 Adedeji Samuel").
- Collaborators with real logos: Champtop Academy, AWS Community, Ferricool Studios, Shop Soma,
  Independent Collaborations.
- CV uploaded (assets/uploads/mvya39g7-0.pdf). Contact email: samuel.s.adedeji@gmail.com.
- Theme: white paper and tints, ink #141211, red #E8223E contact band.

## Known issues / to-do
- [x] Links "Contact ↗" now goes to contact.html.
- [x] Contact email confirmed: samuel.s.adedeji@gmail.com. [ ] Do the FormSubmit activation (send one test message).
- [ ] Work: only Swyftsend is real; "Project 2–5" are placeholders (stock photos).
- [ ] Editorial, Campaign ads, Logo folio, Events branding are EMPTY on the live site (live data is still
      the old "projects" format). They show "Coming soon" title cards until work is uploaded in admin →
      Sections and published.
- [ ] Upload logos for the Logofolio; confirm the social proof numbers (80+ / 120+ / 5yrs+).
- [ ] Testimonials still say "Client name".
- [x] Name standardised to "Adedeji Samuel" (nav, signature, badge, footer, alt text, defaults).
- [ ] Decide whether admin files stay public (see the .gitignore and README security notes).
- [ ] Custom domain plus hosting move (DNS, HTTPS, CNAME).

## Change log
- 2026-11-09: Claude (new chat) reviewed the full repo zip (36 commits, code matches the last push)
  and added this file.
- 2026-11-09: Fixed broken Contact link; standardised name to "Adedeji Samuel"; set the email
  fallbacks in the HTML/JS to samuel.s.adedeji@gmail.com; fixed the doubled "· ·" at the end of the badge
  ring text. Files: site-data.json, index.html, contact.html, script.js, admin.js. site-data.json
  updatedAt was bumped so the admin editor picks up these edits.
- 2026-11-09: CSS/JS links now carry ?v=<version> to beat browser/GitHub caching. Bump it on every style.css / script.js / admin.* change.
- 2026-11-09 (v5 polish): clean/modern pass, social proof band, logofolio, case-study details,
  colour-flash fix, masonry Campaign grid, editorial page styling, "coming soon" cards for empty
  sections, phone About order fix. Shrunk 3 oversized client logo PNGs in assets/uploads (same names).
  Files: index.html, contact.html, style.css, script.js, admin.html, admin.js, admin.css, 3 logos.
- 2026-11-09 (v6, owner's review): restored lens rings/dots/plus sign, portrait stroke, cards and the
  original collaborators strip; lens picture no longer zooms on tap; top floating cards stay below the
  header; social proof (numbers only) moved above About; wider responsive side padding; Campaign ads =
  even 4:5 tiles (2 per row, 3 on very wide screens, 1 on phones); picture viewer shows one picture
  fitted to the screen (arrows / swipe / keys, tap for full width); speed: fonts via <link>, off-screen
  animations pause, no full-screen blur, lens image 2.2MB→0.95MB, two work PNGs converted to JPG
  (site-data.json now points to the .jpg), admin saves big opaque PNG uploads as JPG.
- 2026-11-09 (v7, owner's second review): project/section pages centred (modal had 20px offset);
  links band balanced under its heading; About portrait bigger with rounded corners (black stroke kept);
  social proof restyled black/grey/red with a scroll-in sequence and a slower ~3s count-up; review cards
  with red quote mark, initials avatar, rise-in on scroll and hover tilt/glow; phone project header one row.
  CSS/JS version tag now ?v=20261109d. NOTE: GitHub Pages had not deployed v6 at 7:44 PM even though the
  push succeeded — check the repo's Actions tab ("pages build and deployment") after each push.
- 2026-11-09 (v8): whole site switched to the black of the social proof band. Theme mode = dark,
  dark palette paper #0c0c0d / text #f2f2f2 / soft text #a6a6a6 / lines #242426 / red #E8223E (light
  palette kept, switch back in admin → Theme → Mode). Signature band bg set to #0c0c0d. On black, the
  collaborator logos show as light grayscale and get their own colours on a white chip on hover.
  CSS/JS tag ?v=20261109e.
- 2026-11-09 (v9): Theme Mode now has "System default" (follows each visitor's device, switches live);
  softer gradients/glows; header logo image upload (Content → Header; white on dark, own colours on light);
  case-study details shown as small bold label above value in a responsive grid; lens picture zooms gently
  (1.08 → 1.2) on tap and loads faster (lens image now mvybotwj-0.jpg, 128 KB, preloaded on repeat visits);
  second scrolling strip "Collaborators" (Content → Collaborators strip, placeholder marks until logos are
  uploaded) scrolling the other way; all logo lists edited as neat tiles (upload/replace, reorder, bulk
  upload). On the dark theme, strip logos are auto-checked: dark ones flipped light, light ones greyed.
  CSS/JS tag ?v=20261109f.
- 2026-11-09 (v10): social proof numbers roll up digit by digit (odometer, ~2.2s each, staggered); lens
  picture loads straight from index.html (src + preload — if the lens picture is changed in admin, also
  update the two "mvybotwj-0.jpg" references in index.html); no seam between hero and social proof;
  favicon (assets/favicon.svg, override in Content → Header); published theme mode = System default;
  light theme: "Let's make something" block black, links + name band white (name red); contact page uses
  the site colours (black on dark, white on light) with a red Send button. CSS/JS tag ?v=20261109g.
- 2026-11-09 (v11): readable captions (+ optional caption heading), long text blocks in 2 columns on
  desktop; "Thank you for viewing." at the end of every case study (Content → Work / gallery); new
  "Book" layout (Editorial uses it): cover alone, spreads, real page-turn (assets/vendor/page-flip, MIT),
  paper sound, ← → keys, "All pages" view, single page on phones; admin turns an uploaded PDF into book
  pages (pdf.js from cdnjs, admin only); break-time games (game.js: odd colour, memory, mini sudoku,
  design words) after N idle minutes or when offline (Content → Break-time games); paper-plane opening
  animation once per session (Content → Effects); dark theme skips light custom page backgrounds;
  dark palette restored to #0c0c0d. IMPORTANT: whenever site-data.json is edited by hand, bump
  updatedAt; admin now only prefers its local copy if it is strictly newer and < 15 min old.
  The 21:52 Publish removed Swyftsend (locked case), the Kalvia campaign ad and the Conversation Circle
  flyer from the data — recoverable from commit 91c39d1's site-data.json. CSS/JS tag ?v=20261109h.
- 2026-11-09 (v12): opening "poster" animation (based on the owner's "Every project is a conversation"
  page, no page number) — default opening, plane still selectable (Content → Effects / Opening poster:
  headline, button, tag, signature text or PNG, portrait, links, seconds); "My process" section after
  About (Ideate, Think, Explore, Design; line + dots animate in); "Resources" bento section before Links
  (books / YouTube / programmes, optional covers + links); new footer: brand · colour line · TM · globe ·
  crosshair · name … version (Content → Footer), transparent so it works in light and dark.
  CSS/JS tag ?v=20261109i.
- 2026-11-09 (v13): removed the Collaborators strip; footer right side (version) removed; spinning badge
  hides while the footer is on screen. Uploads-vanishing fix: admin drafts now auto-save to IndexedDB
  (no 5 MB limit) a second after every change and survive reloads; a banner shows when an unpublished
  draft is loaded (with "discard and load the live site"); Publish keeps uploaded file paths in the draft
  and retries saving site-data.json up to 4 times. RULE: Claude no longer ships site-data.json in zips —
  content changes go through admin (or code defaults). CSS/JS tag ?v=20261109j.
- 2026-11-09 (v14): "Hire me" button next to "View my work" opens WhatsApp chat with 2348065925091 and a
  ready message (Content → Hero); "Play a game" button in the header (Content → Break-time games, empty
  text hides it); games pop up after 2 idle minutes by default; Resources use pictures cropped from the
  PDF portfolio's Resources page (assets/resources/, books shown as covers; used automatically when a
  starter resource has no uploaded cover); captions are one wide column with a heading ("About this
  piece" when a long caption has none); lighter images: 6 editorial JPGs re-encoded in place
  (6.9 MB → 3.6 MB, same names, q82), heavy PNGs swapped for their JPG twins at load (LIGHTER map in
  script.js). CSS/JS tag ?v=20261109k.
- 2026-11-09 (v15): opening poster is now line art (outlines + headline + portrait as a line drawing)
  that fills in to the exact poster, holds ~4.6s (admin), then everything folds into the red paper plane,
  it flies up and a wave sweeps up to reveal the site (~7s total; any tap starts the ending). Editorial:
  the book never shows raw full-width pages (fitted frame while loading, falls back to the spreads view),
  max 1200px wide, fits the screen height and scrolls into view. New layout "Book shelf" (layout 'books'):
  several editorials shown as covers; each opens as its own flip book (admin: switching Book → Book shelf
  turns the current pages into "Editorial 1"; a PDF uploaded inside an editorial becomes its pages).
  Site preview now also reads admin drafts from IndexedDB. CSS/JS tag ?v=20261109n.
- 2026-11-09 (v16): opening poster matches the design: portrait is a cut-out (assets/portrait-cutout.webp,
  background removed) with no side fades and the fine diagonal line texture only on the person; Home /
  About / Works and the "SA. PORTFOLIO." mark removed (social links still show if set in admin); the
  drawing is a fine pencil line version (assets/portrait-sketch.webp) that sweeps in on one angle while
  light hatching crosses on another, then the photo fills in; ~10s total (plane takes off at 8.4s,
  admin). An uploaded custom portrait gets its sketch drawn live by an SVG edge filter. CSS/JS ?v=20261109o.
- 2026-11-09 (v17): custom "Adedeji Samuel" signature (vector paths from Herr Von Muellerhoff + a tapered
  swash; standalone file assets/signature.svg) used on the opening poster and under the About text (red
  swash, writes itself on scroll). Poster sequence: only the portrait is sketched (0–3s); then panel, red
  shapes, headline lines, button, signature and tag animate in one after another. Outline-drawing of text
  and shapes removed. CSS/JS ?v=20261109p.
- 2026-11-11 (v18): scroll motion — main sections shrink/round/dim as they leave (stack-sec, --out), section
  headings rise word by word, testimonials are a sticky stacking deck (add as many as you like in admin);
  6 project questionnaires on brief.html (brief.js: branding, logo, editorial, event branding, event designs,
  campaign) — sends to the contact email via FormSubmit and/or WhatsApp; each section/project page shows
  "Start your … questionnaire" (admin: Sections → "Questionnaire button"); contact page links to it.
  Quieter project ending: compact "Other projects" thumbnail row + slim "Next project" card. Games: Quiz
  ladder (12 steps, 50:50, skip, walk away) and Font spotter (study 4 fonts, type text, guess). ?v=20261111a.
- 2026-11-11 (v19): opening is now a SCAN — a red light beam sweeps down the portrait; ahead of it a faint
  wireframe (sketch + grid), behind it the full photo; then the poster animates in; the ending scrambles
  every piece (random spin, staggered) into the paper plane → flies up → wave. Signature is now
  "Helloutidex" (Monsieur La Doulaise outline + red swash; assets/signature.svg); admin: Content → About →
  signature PNG/SVG upload replaces it (also used on the poster). Hero "Available for hire" pill with a pulsing
  green dot (Content → Hero, empty hides it). CSS/JS ?v=20261111b.
- 2026-11-11 (v20): every game opens on a start screen (rules + "Start game"), then a 3-2-1 countdown; all games have a timer and sound (mute button, remembered). Headings tightened like "Experience & practice." (not the hero); trailing full stops on headings are brand red (span.hd-dot). Contact heading is sentence case. Questionnaire budget = "Estimated budget for this project" slider (0–10m) with NGN/USD/GBP/CAD and a "price is discussed" note — no fixed amounts. Signature red underline removed. Light mode: darker ink/muted text (migrateTheme fixes washed-out published palettes). Social links (Instagram, X, LinkedIn, optional link; own icons) in footer + contact page, admin → Social links. Pinned dark sticky notes section (feeling / building / spark), admin → Pinned notes. SA. logo in header (assets/brand.svg) and SA. ring badge as the floating badge; admin → Logo style / Badge style. ?v=20261111d.
- 2026-11-11 (v21): hero note card removed; header shows the SA. mark only (admin → Logo style "SA. mark + name" brings the name back); Available-for-hire pill + WhatsApp icon in brand colours (no green). Social icons moved under the hero buttons and into the Links band ("Follow along"); footer right is now the copyright line (admin → Footer → Copyright line). Links heading fixed (label rule was padding every word — selectors now `.section-top > span`), copyable, word reveal no longer waits seconds. Notes typed in Manrope, placeholder "e.g. excited". Favicon = SA. mark. Badge backing disc wider and soft. New cta-bg.js: tile puzzle behind "Let's make something worth seeing" (SA. mark → lens → arrow → cube, pointer pushes tiles), admin → Effects. ?v=20261111g.
- 2026-11-11 (v21b): hero eyebrow ("Independent designer · Lagos, Nigeria") hidden; admin → Hero → "Show the eyebrow line" brings it back. ?v=20261111h.
- 2026-11-11 (v22): phone thumb bar (thumbbar.js): Work · Hire me · Let's talk pinned at the bottom on screens ≤760px; shows after the hero, hides while scrolling down, returns on scroll up / when scrolling stops / near the page end; hidden while a game or project is open; badge lifts above it. Admin → Header → Thumb bar. ?v=20261111i.
- 2026-11-11 (v22b): social proof on phones now matches desktop — three numbers side by side with two-line labels (was stacked). ?v=20261111j.
- 2026-11-11 (v23): header = "SAMUEL ADEDEJI / DESIGN" on the left, smaller SA. mark centred (logoStyle "center", default; older values map to it; admin → Header → Logo style). Tablets 801–1040px hide the About/Work text links so the centred mark has room. Phones: badge 58px; footer gets bottom padding so the thumb bar never covers it. ?v=20261111k.
- 2026-11-11 (v24): work gallery is now "Pop parade" (parade.js), modelled on the animo-pop-parade reference: zoom-through (next picture pops inside the card and grows to fill it) → cards line up and march across → cards pop in overlapping pairs drifting left → pictures fade to grey tiles and drift off → loop. Real section covers, tap any card to open it. Pauses off-screen; still row for reduced motion. Admin → Work / gallery → Gallery animation (Pop parade / Two moving rows). ?v=20261111l.
- 2026-11-11 (v24b): Pop parade rebuilt as an endless strip drawn from one scroll offset — never ends, no gaps, slow drift (admin speed: 16/28/42/60 px/s), drag back/forward with momentum (mouse, finger, trackpad, ← → keys), slows on hover, cards pop in on the right and turn into grey tiles on the left; tap opens a section (a drag never counts as a tap). ?v=20261111m.
- 2026-11-11 (v24c): Pop parade re-choreographed to match the reference exactly (zoom-through ×3 → parade → pop pairs → grey tiles), ~25% slower (loop ≈20s on desktop), never empty (next loop pops in while the last grey tiles cross), fully scrubbable: one clock drives everything, dragging/swiping/arrow keys move the clock back or forward with momentum. Admin speed = multiplier (0.7 / 1 / 1.25 / 1.5). ?v=20261111n.
- 2026-11-11 (v25): new default work gallery "Orbit globe" (globe.js), after the animo orbit-globe reference: pictures spread evenly on a slowly turning sphere (front big & bright, back small & dim), drag in any direction to spin it in 3D with momentum (touch: a gesture that starts vertical still scrolls the page), Scatter/Gather button (bottom-left, clear of the badge) + double-click/double-tap + S key throw the pictures into space and back, arrow keys spin, tap opens a section. Admin → Work / gallery → Gallery animation (Orbit globe / Pop parade / Two moving rows) + globe hint text. ?v=20261111o.
- 2026-11-11 (v25b): globe shows only your own uploaded pictures (every picture from every open section, never locked ones), cards in a 4:5 frame, no labels on phones; site-wide the stock placeholder photos are hidden at display time (saved content untouched) — sections with no own pictures show the clean "coming soon" title card. ?v=20261111q.
- 2026-11-11 (v25c): globe = one frame per picture, never repeated (also de-duplicated across sections); frame size follows the number of pictures (few → bigger, many → smaller; up to 120). ?v=20261111r.
- 2026-11-11 (v25d): globe also shows "More pictures on the globe" (content.globeExtra.items, default = your 19 uploaded pictures that are not in any section yet: SwyftSend ×12, Kalvia, Conversation Circle, Life, Gloria & Yomi, Glory2Glory ×2, Diet). They open big in the picture viewer (← → between them). Admin → Work / gallery → More pictures on the globe (upload many, rename, reorder, remove; saved at 1600px). 27 frames total, each once. ?v=20261111s.
- 2026-11-11 (v25e): LinkedIn = https://www.linkedin.com/in/samadedeji/ (default + saved content: the old LinkedIn search placeholder is swapped automatically). ?v=20261111t.
- 2026-11-11 (v25f): floating badge ring now turns with scrolling (0.35°/px, eased): down → forward, up → back, still when you stop. Admin → Badge → Ring turns (with scrolling / on its own). ?v=20261111u.
