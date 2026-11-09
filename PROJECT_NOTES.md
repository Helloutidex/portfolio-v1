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
