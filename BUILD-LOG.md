# Build Log

A plain-language diary of everything done on this project, in order.

---

## 2026-09-30
**Asked for:** Set up the project — create a CLAUDE.md with project ground rules (casual
spirograph web app/game, visually engaging, user is non-technical so Claude makes tech
decisions and explains things simply) and start a BUILD-LOG.md that gets an entry after
every task.

**What I did:** Created `CLAUDE.md` describing the project (a spirograph drawing tool for
stress relief/focus/creativity) and the working rules (plain-language explanations, I make
the technical calls, keep the build simple — plain HTML/CSS/JS with no build tools).
Created this file, `BUILD-LOG.md`, as the running diary. Committed both to the
`claude/spirograph-web-app-0ks1fc` branch.

**Problems/decisions:** None yet — no code written. Decided upfront to build with plain
HTML/CSS/JavaScript (no frameworks or build tools) since it's the simplest thing that
keeps the project easy for a non-technical owner to open and run.

---

## 2026-09-30 (later)
**Asked for:** Build the actual spirograph tool. It should run in the browser, let
people save and share their drawings, and work smoothly on both phones and computers.

**What I did:** Built the working app across three files: `index.html` (the page and
controls), `style.css` (the look, plus the mobile layout), and `script.js` (the drawing
logic). What it does:
- Draws real spirograph curves on a canvas, animated stroke by stroke like an actual
  pen moving, using the same math a physical spirograph gear-and-wheel kit follows.
- Sliders let people change the outer ring size, the rolling wheel size, how far the
  "pen" sits from the wheel's center, drawing speed, line thickness, pen color (with a
  rainbow option that cycles color as it draws), background color, and whether the
  wheel rolls inside or outside the ring (two different classic spirograph looks).
  A "Random" button jumps to a random combination, and there's a play/pause and clear.
- **Save**: downloads the current drawing as a PNG image file.
- **Share**: on phones/browsers that support it, opens the native share sheet (so
  people can send the drawing straight to Messages, WhatsApp, email, etc.) using the
  same image; if that's not available it falls back to downloading and tells the
  person where to find it. No account or server involved — everything happens on the
  person's own device, which keeps the app simple and free to run.
- Layout adapts automatically: on a computer the controls sit in a sidebar next to the
  drawing; on a phone the drawing takes the full screen and the controls slide up from
  the bottom as a panel you can open with the gear icon (or swipe down to close). Touch
  and mouse both work for the sliders and buttons.

**Problems/decisions:** Found and fixed a layout bug where the control panel was
squeezing the drawing area down to almost nothing on desktop (a flex-layout mistake) —
caught it by actually opening the app in a test browser and screenshotting it, rather
than just reading the code, on both a desktop-sized and a phone-sized screen. After the
fix, verified visually: the spirograph pattern draws and fills the space correctly,
rainbow mode cycles colors, the mobile bottom panel opens/closes, and the Save button
produces a real downloadable image. No backend or account system was added, by design,
since it isn't needed for save/share to work.

You also got it published at https://maulin-gthub.github.io/spirograph/ via GitHub
Pages, after switching the repo from private to public (required on the free GitHub
plan to use Pages).

---

## 2026-09-30 (later still)
**Asked for:** You tried the published site and pointed out it wasn't actually
interactive — it just auto-played a pre-set animation. You wanted it to work like a
real spirograph kit, where you move the pen yourself and the pattern appears from your
own hand movement.

**What I did:** Rebuilt how drawing works. Now the app shows the ring and the small
rolling wheel like a real kit, sitting still until you touch/click and drag your
finger or mouse in a circle around it — the pattern only draws while you're moving,
tracing along with your motion (drag one way to draw forward, the other way to undo).
A small "drag around the circle to draw" hint shows until your first drag. Specifics:
- Split the single drawing area into two see-through layers: one holds your permanent
  drawing (never cleared except by the trash button), the other redraws the moving
  ring/wheel/pen guide every instant so you always see where the "pen" currently is.
- Added an "Auto" button (top right, the play icon) for anyone who just wants to watch
  it finish automatically instead of dragging — it picks up from wherever you left off
  by hand. The "Drawing speed" slider now only affects that auto mode.
- The pen dot turns gold when a pattern is fully traced, as a little "you're done"
  signal.
- Tested by simulating a real drag motion in a test browser (both a desktop-sized and
  a phone-sized screen) and screenshotting the result at each step, confirming the
  line only appears while "dragging," follows the drag accurately, and Auto correctly
  continues from the hand-drawn point.

**Problems/decisions:** None outstanding. Chose to map your drag angle directly to the
kit's rotation (so one full circle you trace = the wheel completing one lap), which is
the simplest way to make the on-screen motion match your hand 1:1, the same way turning
the wheel by hand does on a real kit.
