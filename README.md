# Designing What's Next — Portfolio

## Files
- `index.html` — the site
- `style.css` — all styles
- `script.js` — all behaviour (lens zoom, floating cards, moving gallery,
  modals, sound) *and* the default text/theme/project data
- `admin.html` / `admin.css` / `admin.js` — a local editor covering
  **Content** (every section, incl. collaborator logos and testimonials),
  **Theme** (colors + heading size) and **Work / Projects** — with real
  image uploads and a passphrase lock
- `assets/portrait.jpg` — your photo, already cropped to a head-and-shoulders
  passport-style frame
- `cv.pdf` — not included; the "View CV" / "Download CV" buttons in the
  About section look for a file called `cv.pdf` next to `index.html`

## Deploying
No build step — it's plain HTML/CSS/JS. Push the folder to a GitHub repo and
serve it with GitHub Pages, or drag it onto Netlify's manual-deploy drop zone.

## Editing your site
Everything editable lives in one place at the top of `script.js`:
`DEFAULT_CONTENT` (every piece of text, collaborator logos, testimonials),
`DEFAULT_THEME` (colors + heading size) and `DEFAULT_PROJECTS` (the work
list). Edit any of those objects directly and redeploy.

`admin.html` gives you a form for all three instead of editing code by hand,
including real image uploads (portrait, project images, collaborator logos —
pick a file and it's embedded directly, no separate hosting needed for a
preview). Because this is a static site with no server, its "Save" only
writes to **your own browser's** local storage — it lets you preview a
change, it does not publish it for visitors. When you like what you see, use
"Copy code for script.js" on the relevant tab and paste the result over the
matching `DEFAULT_...` block in `script.js`, then redeploy. Note: an
uploaded image is embedded as a long `data:image/...` string — fine for
preview, but for a real site swap it for an actual file in `assets/` and a
normal path, so `script.js` doesn't balloon in size.

## Security — please read before you rely on this
`admin.html` has a passphrase lock, but it's important to understand what
that does and doesn't protect:

- The check runs entirely in your browser. Anyone who opens `admin.js` in
  dev tools can read exactly how it works — it keeps out casual visitors
  and search-engine crawlers, nothing more.
- There's no server, so there's no real authentication, no rate-limiting,
  and no way to revoke access remotely.
- Saved edits live in **that one browser's** local storage — they were
  never "published" anywhere a determined visitor could reach them, but the
  admin *page itself* being reachable at yoursite.com/admin.html is what
  the lock is trying to reduce.

**For genuine protection**, do one of these instead of relying on the lock:
1. **Don't publish the admin files at all.** Uncomment the three lines in
   `.gitignore` so `admin.html`/`.css`/`.js` never reach your public GitHub
   Pages site. Keep them locally, edit, use "Copy code for script.js", paste
   the result into `script.js`, then push just that.
2. **Move to a real headless CMS** if you want editing from anywhere with
   actual login — Decap CMS (formerly Netlify CMS) or Tina CMS both work
   well with a GitHub-hosted static site and have real, server-verified
   authentication. This is a bigger change (they read/write your repo via
   the GitHub API) but it's the correct fix if "someone else editing my
   live site without permission" is a real risk for you.

## How the work is structured
There are two layers, matching what you click through on the site:

1. **Categories** — the 5 floating cards / gallery frames (Case Study, Logo
   Archive, Presentation, Web Design, AI / Generative). Clicking one opens a
   collection grid.
2. **Case studies** — the individual projects *inside* a category (e.g.
   "Premium Clothes" inside "Case Study"). A category can hold as many as
   you like. Clicking one opens its full, vertically-scrolling case-study
   page — a large scrolling title, an optional tagline, and then a plain
   ordered list of **content blocks**: a text block (heading + body,
   optional "what we did" tags), an image block (optional caption), or a
   video block (optional caption) — in whatever order and mix you choose.
   There's no fixed template forcing an image after every paragraph — a
   case study can be two text blocks up top and nothing but images (or
   video) after that, or alternate the whole way down, or be all images
   with a single intro block. Each block fades and rises into view as you
   scroll to it. At the bottom, a link goes to the next case study in the
   *same* category, or back to the collection once you've seen all of them.

If a category has no case studies written yet, two placeholder ones are
generated automatically from its title and description so the site isn't
empty — open "Manage case studies" on a category in admin.html to replace
them with your own, add more, reorder blocks with the arrow buttons, or
delete what you don't need.

## Placeholder images and logos
The five projects still use royalty-free Unsplash photos as stand-ins, and
each collaborator shows a plain lettermark placeholder until you upload a
real logo (no real client logos are bundled here — trademarked logos aren't
something to embed without the rights to them). Swap both in the admin page
or directly in `script.js` before you ship it for real.
