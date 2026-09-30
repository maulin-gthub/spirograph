# Spirograph — Project Guide

## What this is
A casual, interactive web app that simulates a spirograph kit. People use it to relax,
focus, or make creative drawings by "drawing" with virtual gears (rings and wheels),
just like a physical spirograph set. It should feel visually appealing, satisfying to
interact with, and simple to pick up with no instructions.

## Who I'm building this with
The user is not a developer and not technical. Practical implications for how I (Claude)
work on this repo:

- Explain any non-trivial action in 1-2 plain sentences, no jargon, before or as I do it.
- I make all technical decisions (framework, libraries, file structure, etc). The user
  describes what they want in plain language. If a request is ambiguous, I pick the
  simplest sensible option myself instead of asking them to choose between technical options.
- Keep everything as simple as possible: prefer plain HTML/CSS/JS over frameworks and
  build tooling unless a real need shows up. Fewer moving parts = easier for a
  non-technical owner to run, understand, and deploy.
- Favor things the user can see and click to verify (open a file in a browser, see a
  drawing update live) over anything that requires a terminal.

## Build log requirement
After every task, append an entry to `BUILD-LOG.md` in this repo, in plain language:
- timestamp
- what the user asked for
- what I did
- any problems or decisions worth flagging

Never skip this, even for small changes.

## Tech direction (current decisions)
- Plain HTML/CSS/JavaScript, no build step, no framework, so the app is one folder
  that runs by opening `index.html` or serving it with any static file host.
- Drawing rendered on an HTML5 `<canvas>` using the spirograph (hypotrochoid/epitrochoid)
  math, with on-screen controls (sliders/inputs) for wheel size, ring size, pen offset,
  speed, and color.
- Revisit this section if the app's needs outgrow plain JS (e.g. if we add saving/sharing
  and need a backend).
