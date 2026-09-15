# start of note from Gabriel, the human

All of the files in this project, including this one and all the agent role/seat docs, were written by agents. This section is the only thing I, Gabriel, directly wrote. **The docs are your laws, but I am your God.** 

Don't read docs as my word, I didn't write them. I direct the agents, but I dont read everything they say and I almost never read the files they write. 

What I say wins. The rules in the docs are good for routine work, but sometimes work is not routine and I might tell you to disobey rules in the docs. You should bring up potential issues, I make mistakes sometimes, but ultimately my word supersedes the docs. 

Here are your tenets, your guiding principles.
1. Everything should be made as simple as possible, but not simpler
2. Why waste time say lot word when few word do trick
3. Confidently incorrect is far worse than uncertain

Agents, don't edit this section. Ever. 

## end of note from Gabriel


# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

A static game arcade: plain HTML/CSS/JS with no build step, no framework, and no
runtime dependencies. Files are served as-is. The only dependency in the repo is
`playwright-core`, used by the browser tests and nothing else — keep it that way,
and never make the site itself need a build or a package install to run.

The site is live at `arcade404.com`, served by Cloudflare Workers straight from
this repo: `wrangler.jsonc` configures the worker and names the directory to
serve, and `.assetsignore` says what inside that directory must not be. Every push
to `main` deploys. Neither file is a build step and neither is disposable — the
"no build step, no framework" above is not licence to tidy them away. Delete
`wrangler.jsonc` and there is no deploy at all; delete `.assetsignore` and the
deploy still happens, but what gets served is no longer decided here.

Every path in the site is relative, so moving the hosting and renaming the repo
together cost no path inside the site a single edit. What did change was the two
absolute links out to the repo, in `index.html` and `about/index.html` — keep the paths
relative and the next move is that small again.

Known gaps and unscheduled work live in `games/<name>/TODO.md` for a game,
`design/TODO.md` for how the site looks, and the root `TODO.md` for everything
else. Check the relevant one before starting something new, and delete entries as
they land rather than marking them done — git history is the record.

## As simple as possible, but as complex as it needs to be

The guiding principle here, and the reason this repo has no build step, no
framework and one dependency.

Both halves do work. The first rejects machinery whose cost outruns its benefit at
this size: continuous integration was dropped because the whole suite runs in
seconds. The second is what stops that becoming an excuse to under-build: Pong's
fixed timestep is more machinery than scaling movement by a frame delta, and earns
it by keeping the simulation deterministic and `update()` free of any notion of
time.

The test is the same in both directions: **name what breaks if this were simpler.**
A concrete answer justifies the complexity. No answer means take it out.

## Which seat are you?

Three seats. A **worker** owns one area — a game folder, or the shell — builds it
in a worktree of its own, and hands the finished branch over. The **integrator**
owns `main` and is the only seat that merges to it. The **art director** owns the
site's look across every game at once, and is a standing seat, usually unoccupied.

- Worker → **`WORKER.md`**, and take a worktree before your first edit.
- Integrator → **`INTEGRATOR.md`**.
- Art director → **`ART-DIRECTOR.md`**, and take a worktree before your first edit.

This file is the ground all three stand on. Your seat's file is only what differs.

**If nobody has told you which seat you are, ask — before branching, editing or
merging.** The seat is assigned per session and cannot be worked out from the
repo. Being in the shared checkout is not evidence you are the integrator; it is
equally what a worker looks like before taking a worktree, which is the mistake
this rule exists to stop.

## Shared ground: what every seat obeys

This site is one repo holding several small, nearly independent projects: a game
lives entirely in `games/<name>/`, and adding one means creating that folder and a
card in the root `index.html`. That independence is what makes it reasonable to
have several agents working at once, each in its own worktree.

Most of what makes that safe is structural. Each game's backlog is in
`games/<name>/TODO.md` and its invariants in `games/<name>/DESIGN.md`, so two
agents on two games share no file. The checks in `tests/docs-check.js` find games
by reading the `games/` folder rather than from a list someone has to extend. The
rules left over are these.

**Your worktree is yours; nobody else's is. Read freely, never write.** Reading
another worktree is fine and sometimes the only way to work something out. Writing
into one you do not own is absolute: a `git -C`, a `cd` then `checkout`, a
`worktree remove` while somebody is live in it, a force-push or a branch deletion
all do the same damage. Uncommitted work has no git record — clobber it and there
is nothing to recover it from.

**From a worktree, write with absolute paths.** That is the accidental version of
the same mistake, and it is quieter: a session's working directory can return to
the shared checkout between one command and the next, and a relative path that used
to be right is spelled exactly the same way when it stops being right. It happened
twice in one session, once costing most of a phase's documentation. Read with
whatever is convenient; anything that *modifies* a file names the tree it means.
`git status` in both trees is what catches it afterwards.

**Two guards catch some of this by accident**, and neither is a substitute for the
rule: git refuses to check out a branch already checked out in another worktree,
and an agent session pinned to a worktree is blocked from running git against the
shared checkout. Somebody at a terminal has neither.

**Ask before killing a process you did not start.** `ls -l /proc/<pid>/cwd` names
the directory it was launched from, but that is not whose it is — every session
shares one checkout, so a live session and an abandoned one look identical. A
session was killed here while its own identification request sat unanswered, and
it turned out to be the one its user was typing in. Asking and hearing nothing is
not permission.

**One exception, and only one: a cwd that `ls` marks `(deleted)`.** Nobody is
working in a directory that is not there, so the deletion is the proof the asking
was for. The integrator sweeps for these when cleaning up worktrees, because a
removed worktree can leave its server running — `INTEGRATOR.md` has the procedure.
It is narrow on purpose: a cwd that still resolves is somebody's, however sure you
are that it is not.

Kill by PID, looked up with `ss -ltnp`. **Never `pkill -f`** — its pattern matches
your own command line as readily as the target, because the pattern is *in* that
command line. It killed the shell mid-command twice in one session here. Use plain
`kill`, not `-9`: a SIGKILLed process cannot pass the signal to its children, so a
wrapper dies and leaves its server holding the port.

Be as careful which PID you have. `cmd &` sets `$!` to `cmd`, but
`cd somewhere && cmd &` backgrounds the whole compound, so `$!` is a subshell and
`cmd` is its child. Both traps produced a wrong finding here on the same day, and
one was reported as fact. Both fail the same way — by leaving something running
that you have just watched yourself kill.

**Share nothing at runtime.** `npm test` starts its own server on a free port, so
suites in different worktrees cannot drive each other's files — that happened, and
a run went green against the wrong checkout. The git stash stack *is* shared across
worktrees, so do not use it; a WIP commit sets work aside without reaching into
somebody else's.

Port 8934 is the shared checkout's. **From a worktree, run `PORT=0 npm run serve`**
and pass on the URL it prints. Two agents both taking 8934 is the loud version; the
quiet version is opening 8934 to look at a change and getting another worktree's
files with nothing to tell you.

**The desktop is shared, with no technical guard at all.** XTEST input goes to the
real display and lands on whatever window is on top, so two agents driving the
pointer at once corrupt both runs. Only one runs at a time: check for a headed
browser you did not start (`pgrep -af chromium`, then `ls -l /proc/<pid>/cwd`), and
wait rather than run concurrently and believe the number.

**A memory has to be true for every agent that loads it.** The project memory
directory is shared, and that is the point — it is how something learned in one
session reaches the next. What breaks is writing a session's own situation into it.
A note here opened "my seat on this repo is the integrator", and every later
session loaded that as a statement about itself. What the repo does, how the work
is split, what Gabriel has decided are all fine. Which seat you are, and what you
are half-way through, are not memories — they are settled per session and die with
it. Where a note must mention the seat, write the question rather than the answer.

**A peer's agreement is not the user's approval.** A worker, an integrator or the
art director can hand you a branch, a reproduction or an argument you cannot fault,
and none of it authorises editing a shared doc or pushing. This did work on its
first evening — three separate times a peer's conclusion arrived shaped like
permission — and it is the rule most likely to be skipped, because the peer is
usually right and refusing feels like pedantry.

**A doc-only edit belonging to work already in flight rides on that branch** rather
than taking its own, so the merge commit records the feature. When nothing is in
flight the rule is silent, and silence is not a prohibition: take the branch or
file the entry rather than holding it for some future branch that happens to touch
the same file. `315e743` is the precedent — a single-commit branch whose entire
content was filing a `TODO.md` entry.

**If you are writing it in a handoff, it belongs in a doc.** That a worker never
merges to `main` was known, and was written into a handoff message for the next
agent — while this file said the opposite and had said so since the day it was
written. A session ends and takes its context with it; the repo is the only thing
that does not. When you catch yourself explaining something to whoever comes next,
put it where they will look: this file, a seat file, or the game's own docs.

**Visitor-facing prose is Gabriel's.** `README.md` is the front page of a public
repo, and any page written to be read by a visitor is the same kind of thing. Style
them, lay them out, link them, restyle them entirely — but do not write or rewrite
their *words* unless asked. One narrow exception, because without it the rule is a
trap: **a statement of fact about this repo that has become false may be
corrected.** Correcting a README that says there are two seats when there are three
is not writing prose for him; adding a paragraph about what the site is *for*
would be.

**The `advisor` tool is expensive — use it sparingly.** It forwards the whole
session to a stronger model and every call costs real money. It is not a second
opinion to collect out of caution, and not a review step for work that is going
fine: the tests say more about that, faster, and for nothing. Save it for an
approach that has stopped converging, evidence that contradicts itself, or a call
where being wrong would be expensive. The test before reaching for it: if you can
name what you would do next without it, do that instead.

### This convention is not settled

The split into seats came out of one experiment with two agents, not out of long
practice, and the parts of it that are wrong have not been found yet. The third
seat is newer still. It is written down so there is something concrete to disagree
with.

So: if you hit friction with it — a rule that cost more than it saved, a collision
it did not prevent, a step that turned out to be unnecessary — **propose a better
version of the rule rather than working around it**, and say what happened that
prompted the change. That goes for anything you would improve about how the work is
split, merged or verified.

Say it to the person running the session, out loud and at the time — not into a
file, and not saved for the end. A process defect left in place is paid again by
every agent after you. Mark it so it cannot be skimmed past: open the line with
**WORKFLOW ISSUE:** in capitals, then what happened.

This applies to every seat, and the seat files do not repeat it.

## Commands

```bash
npm test                        # every suite, on a server it starts itself
npm run serve                   # a server on 8934 to play in a browser; tests do not need it
PORT=0 npm run serve            # the same, on a free port it prints - what a worktree uses
node tests/chording.test.js     # one suite on its own; needs a server (npm run serve)
node tests/docs-check.js        # do the docs still describe this repo? no browser
node tests/ai-sweep.js          # how often Pong's ai saves; a ruler, not a test
node tests/volley-sweep.js      # how long a Pong volley is, and what each effect covers
node --check games/<name>/script.js   # syntax only - proves nothing about behaviour
```

`tests/ai-sweep.js` and `tests/volley-sweep.js` are deliberately outside
`npm test`: they measure rather than assert, and every difficulty and duration
claim in `games/pong/DESIGN.md` came out of one of them. Extend them rather than
writing a third — a figure from a differently shaped harness cannot be set against
the ones already recorded.

`npm install` first (once) for the tests; see `tests/README.md`. `npm test` needs
no server running — `tests/run-all.js` starts one on a free port rooted at the
checkout it lives in, which is what stops a run in one worktree testing another
one's files. `BASE_URL` still overrides it.

There is no linter or build. Tests are browser-driven and live in `tests/` — they
open real pages and assert on real game state, since there is nothing meaningful to
unit test in isolation. Add a suite there when you add a game or a feature with
state worth protecting.

## Architecture

### The page contract

Every game lives in `games/<name>/` as three files (`index.html`, `style.css`,
`script.js`), plus a `DESIGN.md` once it has earned one, and is otherwise
self-contained. Adding a game means creating that folder and a card in the root
`index.html`: the site has no registry, no manifest and no build to update.

Each game page follows a contract that `shared.css` depends on:

- Links three stylesheets, in this order: `../../shared.css`, then `../../game.css`,
  then its own `style.css`. The order is load-bearing — the game's own sheet loads
  last so it can override the frame — and `tests/contract.test.js` asserts it.
  `shared.css` carries the tokens and the controls; `game.css` is the frame every
  game page wears (`.game-page`, `.crumb`, `.game-title`, `.game-strap`,
  `.game-stage`, `.hud`, `.instructions`, `.game-foot`).
- Uses the ids `#board`, `#status`, `#restart`. Game scripts look these up by id,
  and `shared.css` styles `.status`, `.btn` (with `.secondary` and `.icon`) and
  `.controls` for them.
- **May add ids of its own, and writes them down in its own `DESIGN.md`.**
  `tests/docs-check.js` holds every id in a game page against that game's doc, so
  an id added to a page and never written down fails the check. Recording them per
  game is also what keeps two games' agents out of the same file.
- Treats `#status` as game state only — what just happened, or what to do next.
  Standing instructions belong in a collapsible panel, not the status line.
  `shared.css` gives `.status` a reserved min-height so its text can change without
  shifting the board.
- Links back to `../../`.
- **Hands the focus back after a pointer click on its own buttons**, in any game
  whose keys drive play. A clicked button keeps the focus, and a focused button
  takes Space and Enter as its own activation — so the key that plays the game
  quietly becomes the key that works the button. In Flappy Bird, Space stopped
  flapping the moment How to play was clicked. Clicking the board did not recover
  it either: `preventDefault()` on `pointerdown` suppresses the mousedown the
  browser uses to move the focus, so the game has to blur by hand. `releaseFocus`
  does it on a pointer click only; a keyboard activation (`detail === 0`) has to
  keep the focus, or tabbing through the controls loses it on the first press.

`tests/contract.test.js` holds every game against the structural half of that list
— the three ids, the stylesheet order, the link home — and against the hub having a
card for it. For a key-driven game it also holds both directions of the focus
handback. Which games exist and which are key-driven are both read from the folder
and the script rather than from a list, so a new game is covered the day its folder
exists.

`shared.css` owns the theme as CSS custom properties (`--bg`, `--fg`, `--card-bg`,
`--cell-bg`, `--cell-border`, `--accent`, `--win`, `--lose`, `--muted`). The
palette is **dark only** — see `design/DESIGN.md`. Per-game stylesheets should
consume these tokens rather than hardcoding colours. `game.css` styles the frame
those pages share, and `hub.css` applies only to the root page.

### Scripts are classic, not modules

Game scripts are loaded as plain `<script src>` — not `type="module"`. Top-level
`let`/`const`/`function` bindings therefore live in the global scope and are
reachable from devtools or a test harness. This is the main testing affordance in
the repo: you can call `restart()`, `handleFlag(r, c)`, `handleReveal(r, c)` and
read `grid`, `state`, `gameOver` directly to set up a specific position instead of
clicking a game into shape. Keep it that way.

### Per-game designs worth knowing before editing

Each game's invariants — what a reader must not break — live with the game, in
`games/<name>/DESIGN.md`, along with its model and whatever was tried and rejected
getting there. Rejected alternatives are the most valuable thing in one and the
easiest to lose. Read that file before changing how a game plays, and update it in
the same commit as the change.

**Keep values out of it.** Those live in the code as named constants, and a doc
that repeats one is wrong the first time it is tuned. **A comment is a doc too:**
if it names a value that lives in the code below it, the code is the source and
the comment should name the relationship instead. Flappy Bird's ceiling comment
named a hue, was corrected once, and went stale again within the hour — because
each rewrite replaced the hue rather than removing it.

They are kept with the game rather than here so two agents working on two games are
never editing the same file. What belongs here is only what every game shares.

### Persisted state

Games that remember anything do it in `localStorage`, under a key namespaced by the
game (`<game>.<thing>`, never a bare name). Keep it local — no network, no
accounts. **Which keys a game owns is written down in that game's own
`DESIGN.md`**; `tests/docs-check.js` holds each game's keys against its own doc.

Wrap every `localStorage` access. It does not merely return `null` when
unavailable, it *throws* — in private windows, with site data blocked, and from
`file://` in some browsers — so an unguarded read at load time takes the whole game
down. Every reader degrades to a default instead, and every game that stores
anything has a test covering the throwing path.

Anything that clears stored data is two-step: the first click arms it, the second
does it. Minesweeper's Reset best time is the pattern. Clearing cannot be undone,
and a confirm dialog is not available to us in a page with no dependencies.

Collapsible panels toggle via the `hidden` attribute, so any `display` rule on one
must be scoped to `:not([hidden])` — a display value otherwise wins over `hidden`
and the panel renders open on load.

## Verifying changes

Drive the real page and assert on game state. Reading the code and reasoning about
it is not verification, and `node --check` only catches syntax errors. Run
`npm test` before merging; add cases for what you changed.

**Reread the docs before merging, not after.** Grep the files you touched for their
own names and see what the docs claim about them. One Pong branch left four
separate claims wrong across three files, every one of which would have sent the
next reader somewhere wrong. `tests/docs-check.js` catches the mechanical half: a
name that no longer exists, a path that does not resolve, an id or storage key
nobody wrote down. It cannot read a sentence.

Four principles underneath that, each of which has already paid for itself here:

- **A test that has never failed has not been shown to test anything.** Prove every
  fix by reverting to the broken code, watching the new test fail, then restoring
  and watching it pass. What that catches is not a bad fix — it is a test that
  passes for the wrong reason.
  **Commit before you do it.** "Restoring" means `git checkout -- <file>`, so on a
  branch with nothing committed yet the proof destroys the work it was meant to
  verify. That has happened twice here.
- **Characterise before you change.** Against code with no coverage, first write
  tests for what it does *now*. Every test failure while building Pong out was a
  wrong assumption of the author's rather than a regression.
- **Assert outcomes, not mechanics.** "The ball came back" survives a rewrite of how
  movement is timed; "the ball moved six pixels" does not.
- **Write down what you ruled out.** A dead end nobody records gets explored again.
  `tests/README.md` carries the ones found so far.
- **A canvas measurement is a claim about pixels, not about the thing you meant.**
  Every visual check here has had to be rewritten at least once because something
  else in the scene produced the same signal: a wind-up reddens a paddle, so "is it
  still red" passed with the charge layer deleted; a bright core drawn over red
  *lowers* a red-pixel count, so strengthening an effect made the number go down.
  Decide what only the thing under test could produce, and measure that.

Behaviour you are knowingly leaving broken should be pinned as a passing assertion
that states the wrong result and says so. Fixing it then turns a check red, so the
before/after evidence arrives without anyone having to remember to look for it.

Where a suite drives the harness itself — freezing a loop, stepping a tick — assert
that the harness works before assuming it does. A freeze that silently stops
working turns every later check into a race that still passes.

### Mouse/pointer behaviour must be verified with real input

Do not trust Playwright `page.mouse` or CDP `Input.dispatchMouseEvent` alone for
input bugs. They click at a fixed coordinate without any pointer motion and bypass
browser-level native handling. Drive real X11 input via XTEST (`pynput`) against a
real headed browser instead.

**Why this is here:** Minesweeper's middle-click chording was "verified" passing
three separate times while being completely broken in real use. The chord fired on
`mouseup` only if the pointer never left the cell, and since the middle button *is*
the scroll wheel, pressing it physically nudges the mouse. Synthetic input never
wobbles, so every test passed. Two fixes shipped on those false passes.

Rules that follow:

- Include the messy parts of human input: movement while a button is held,
  releasing on a different element than the press, repeated fires.
- If a test passes but the reporter says it is broken, suspect the harness before
  concluding it is environmental.
- Run the before/after proof above under *identical real input*, not synthetic.
- Prefer input handling that does not depend on the pointer staying still.

`tests/chording.test.js` case 2 is the standing guard — it moves the pointer while
the button is held. Do not delete it.

## Machine-specific: driving a real browser on the dev box

> **This is the dev box**: a Wayland session with XWayland on `DISPLAY=:0`, using
> snap-packaged browsers. Everything below was learned here and holds here. None of
> it is portable. If the machine changes, `echo $WAYLAND_DISPLAY` and whether the
> browsers are snaps are what to check first.

- **Snap Chromium works on X11** with `--ozone-platform=x11` and `GDK_BACKEND=x11`.
  Without them it runs as a Wayland client and `window.screenX/screenY` report
  `0,0`, so XTEST clicks cannot be aimed at it.
- **XTEST input works** on `:0` via `pynput`. Install into a venv — the system
  Python is PEP-668 managed and refuses `pip install`.
- **Screen capture of the X11 root is black** because Wayland does the compositing,
  so screenshots cannot be used to read state. Have the page report telemetry to a
  local HTTP server, or read state over CDP.
- **A headless screenshot is a different path, and it works.** A headless Chromium
  launched through the repo's own `playwright-core` rasterises the page itself,
  never touches the display, and writes a PNG an agent can look at. Reach for it for
  anything visual. Two constraints: snap Chromium is confined and cannot read files
  under `/home/g/.claude/`, so a page to be shot has to sit inside the project
  directory; and a screenshot only proves what it shows — force a hover, a `data-`
  state or a motion frame before the shot. See `tests/README.md` for a working
  invocation.
- Node here is v22, so nothing forces the `playwright-core` pin any more. It stays
  at exactly 1.45.0 because that is what the suites are known to pass on — see
  `tests/README.md`.

**Caution:** XTEST clicks go to the real shared desktop and land on whatever window
is on top — possibly the user's own applications, or another agent's browser. Check
window geometry before clicking. With more than one agent running this is not only a
risk to what you hit but to what you measure, so these are serialised across agents
— see "Shared ground".
