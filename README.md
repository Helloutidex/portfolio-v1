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

## Publishing edits so every device sees them
The admin's **Save changes** buttons only keep a draft in your own browser. To put edits live for everyone, use the **Publish** tab in admin.html: it writes your text, colors, work and uploaded images straight to the GitHub repo (as `site-data.json` plus files in `assets/uploads/`), and GitHub Pages rebuilds the site about a minute later. You need a fine-grained access token for the repo with *Contents: Read and write* — the Publish tab walks through creating one.

Because the admin now commits to the repo, **run `git pull` before you push code changes from your computer**, otherwise git will reject the push. And never copy a `site-data.json` from an old zip over the live one — it holds your published edits.

## Latest changes
- **Tap to reveal** — the lens no longer needs scrolling or dragging. Tap it (or press Enter) and every project card appears; tap it again, tap empty space, or press Escape to tuck them away.
- **Contact is its own page** (`contact.html`). The homepage keeps a big "Let's talk" button that leads there; the nav's Contact link and the floating badge go straight to it. The form posts through FormSubmit.co to the email set in admin → Content → Contact. The first message ever sent triggers a one-time activation email from FormSubmit — click it, or messages won't arrive.
- **Palette**: black `#141211`, red `#E8223E`, cream instead of white, grey body copy. These are the defaults in `DEFAULT_THEME` in `script.js`.
- **Nav** is a solid bar now (no blur).

## What's new in this update
- **Nav bar** now has a soft blurred background so scrolling content no longer visually overlaps the logo/menu.
- **Background color** shifted from pure white to a warm cream (`--paper`) across the whole site — still editable as a color in admin.html's Theme tab.
- **Floating rotating badge** — your initials in a circle with your full name curved around it, spinning slowly, fixed in the bottom-right corner on every page, linking to Contact. It reuses the same name from the Signature section, so there's nothing extra to keep in sync.
- **Contact form** — visitors can now message you without leaving the site. It posts to [FormSubmit.co](https://formsubmit.co) using whatever email is set in Content → Contact → "Email link" (the `mailto:` address). **Important:** the very first message sent to a given address triggers a one-time confirmation email from FormSubmit — you must click "Activate Form" in that email before real submissions start arriving in your inbox normally. Test it once yourself after deploying to trigger that.
- **Admin lock got more forgiving.** There's now a "Forgot it, or stuck? Reset the lock" link right on the passphrase screen — no more digging through DevTools. And if admin.js ever hits an unexpected error, it now shows the actual error message directly on the page instead of silently doing nothing.
- Added a `.nojekyll` file — a standard precaution for GitHub Pages so it serves your files as-is rather than running them through Jekyll processing first.


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
Every **project** is three things at once: a floating card around the lens (the first five), a frame in the moving gallery (all of them), and its own full-page view that opens when you pick it. A project page is a title, an optional intro line, and a stack of blocks — **images** (1920 px wide, any height), **text**, and **video**. Options per project: seamless no-gap stacking, its own background colour, and a password lock. Tapping an image opens a pop-up viewer you can scroll and collapse. At the bottom, visitors are offered the other projects.

**Locked projects** stay visible on the site but need a password to open. The content is encrypted (AES) before it is published, so it isn't sitting in the page for anyone to read — but use a proper password (10+ characters), and remember the cover picture and title are still public.

## Placeholder images and logos
The five projects still use royalty-free Unsplash photos as stand-ins, and
each collaborator shows a plain lettermark placeholder until you upload a
real logo (no real client logos are bundled here — trademarked logos aren't
something to embed without the rights to them). Swap both in the admin page
or directly in `script.js` before you ship it for real.
