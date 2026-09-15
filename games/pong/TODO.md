# Pong TODO

Known gaps and unscheduled work for Pong, kept here rather than in the root
`TODO.md` so that an agent working on Pong and an agent working on another game
never edit the same file. The slug naming rules, and the rule that an entry is
deleted as it lands rather than marked done, are repo-wide and live in the root
`TODO.md`.

Entries are in priority order. The first one is what to do next.

`games/pong/DESIGN.md` has the model and what was tried and rejected; keep it in
step with the code, in the same commit as the change.

`tests/pong.test.js` is the suite; add to it rather than around it. Nothing is
currently pinned there, but if you knowingly leave something broken, pin it as
described in `CLAUDE.md`.

Anything that changes how the game feels gets played before it merges. Not
designing for mobile at this point.

Each entry names the **gate** it has to pass: what Gabriel has to see, play or
decide before it can be called done. Gates are why the order is what it is. Feel
changes never share a gate — two of them in one playtest can be called worse
without either of us being able to say which one did it - so they are serialised
here rather than batched.

Entries with no gate need nothing from him and can run back to back.

### pong-charge-hitbox-tell — Color the paddle tips to show the Clutch hitbox

**Top of the list as of 2026-09-15: Gabriel raised it as highly requested by
players, who want to see where the charge band is.** The gate below still
stands — he looks at the colours before they ship.

**Gate: Gabriel looks at the colours before they ship.** Not a full playtest —
this does not change how the game plays, only what it shows — but it is a new
colour on the player's own paddle, which is worth a look before it lands.

`ABILITY.clutch` already defines a band at each end of the player's paddle that
counts as a close call toward filling the meter (`games/pong/script.js`, near the
`clutch` config), and today it is completely invisible — the player has no way to
know it exists, let alone aim for it. Tint the top and bottom band of the
player's paddle to mark it.

- **It must track the band's actual definition, not the paddle's drawn size.**
  The comment on that constant is explicit about why: the band is a fraction of
  the paddle's *base* size, not its current height, specifically so an active
  Expand or Squeeze does not silently change where a close call registers. A tip
  drawn as a fraction of the live `h` would disagree with where `onPlayerReturn()`
  actually counts a close call whenever Expand or Squeeze is active — which is
  the exact failure this entry exists to avoid. A hitbox indicator that lies is
  worse than no indicator.
- Read the same base-size fraction the close-call check itself uses; do not
  recompute an independent one. `syncPaddleSize()` is still the only thing that
  writes a paddle's live height, and this entry should not need to touch it.
- Pick a colour that is not already claimed, and there is less room than there
  used to be: **rose is your paddle itself**, coral is the opponent's, `--p-hot`
  is Expand's tint, and amber is the ball. The tip tint needs a colour none of
  those four use, or it will misread as one of them.
- A test should read canvas pixels at the band's edge, the way the existing
  Clutch-meter tests already do, rather than asserting on state — per
  `CLAUDE.md`, a meter nobody can see is precisely the failure this is fixing,
  and the same goes for a hitbox.
- Closely related to `pong-explain-the-modes` below, which is the *text* answer
  to the same hidden mechanic. Doing this one first may settle that entry's open
  question of whether the strategy needs spelling out in words at all.

### pong-serve-from-paddle — Serve from your own paddle, aimed where you choose

**Gate: playtest, its own.** It changes the opening of every single point and
what the ai's first read of the ball looks like, so it cannot share a session
with any other feel change.

Today `serve()` hands the ball to `newBall(serveTo)`
(`games/pong/script.js`), which spawns it at board centre on a random angle the
player has no say in — Space or a click on the board only triggers that roll.
Instead: while `phase === "serve"` and the server is the player, the ball sits on
(or at) the serving paddle, and a click chooses where it leaves from — the
vertical position, or some aim gesture — rather than the random ± `newBall`
currently rolls.

- **Decide what happens when the ai serves.** "The serve goes to whoever
  conceded the point," so the ai serves half the time. It has no click to aim
  with, so the simplest answer is: the player-side behaviour above is new, the
  ai-side serve keeps calling `newBall(serveTo)` exactly as it does today. Say so
  explicitly if a different answer is chosen, since DESIGN.md's "The round"
  section will need updating either way.
- **The click is already doing two other jobs.** "Space or a click on the board
  serves," and separately "a click on the board resumes" a pause. Aiming now
  wants the click's *position*, not just its occurrence, on top of both of those
  — work out how a click mid-pause, a click that serves, and a click that aims
  stay distinguishable, rather than assuming they compose for free.
- **The "place the ball by hand" invariant gets a new wrinkle.** DESIGN.md
  already warns that a test placing the ball has to set `phase` too, because
  `update()` returns before touching the ball outside `play`. This adds a new
  thing to be true during `serve` — the ball pinned to the paddle — that such a
  test now also has to account for.
- **This belongs before `pong-normal-rebalance`, for the same reason
  `pong-keyboard-paddle-speed` did.** Handing the player the opening
  angle is a real advantage; tuning Normal's difficulty against an opening shot
  that is about to change would have to be redone once this lands.
- Update `games/pong/DESIGN.md`'s "The round" section in the same commit, per
  `CLAUDE.md`'s rule that a doc describing how a game plays has to change with it
  — including whatever about this was tried and rejected along the way.

### pong-normal-rebalance — Normal is a bit too hard

**Gate: playtest, its own.** Gabriel called it, so he is the one who calls it
fixed.

Normal is the mode meant to be played and it currently asks too much.
`pong-keyboard-paddle-speed` has landed since this was written, so the faster
paddle is already in; judge it *after* `pong-serve-from-paddle` as well, because a
faster paddle and a self-aimed serve may between them be most of the answer, and
if they are, there is nothing left to do here.

The mode overrides very little, which is what makes it tunable.

- Its `ai` half sets only `readErrorNearPx` and `reactionTicks`; everything else
  comes from `AI_DEFAULTS`.
- It has **no `game` half at all** — stock ball, stock paddles, no handicap on
  either side. That is the mode's identity in `games/pong/DESIGN.md`, so slowing
  its ball or growing its paddle is not a tuning move, it is a different mode.
  Exhaust the other two halves first.
- Its `ability` half tunes all five moves, three of which are the opponent's.

DESIGN.md ranks the ai levers: how wrong the read still is when the ball arrives is
by far the strongest and must never reach zero, then reaction delay, then bounce
lookahead, then top speed, which is the weakest. Two recent things made this mode
harder and are the cheapest to look at first — binding Blink to the ball moved it
from 86.4% to 88.4% saves, and every move in the game now fires here.

- `node tests/ai-sweep.js` is the ruler, and it only asks whether the ai reached
  the ball. Overdrive and Squeeze make the ball harder for *you* and do not move
  that number at all, so softening them will read as having done nothing. Say
  which half you changed.
- `pong-longer-volleys` below tunes these same ai levers for a different reason
  — rally length rather than difficulty. Land this entry first: loosening the
  ai's read to extend rallies on top of a "too hard" complaint that is still open
  conflates the two questions, and a playtest afterwards could not say which one
  it was reacting to.

### pong-longer-volleys — Rounds should last longer, more volleying

**Gate: a decision from Gabriel on the mechanism before writing any code, then
playtest, its own.** Longer rallies is a feel change like any other here, and
which knob produces it is not yet settled.

Volleying is the fun part, and rounds should have more of it. The default path is
the ai's existing difficulty levers — `AI_DEFAULTS` — rather than anything about
the ball:

- DESIGN.md already ranks them by how much they move the ai's behaviour: read
  error when the ball arrives first (never push it to zero — that is the softlock
  line), then reaction delay, then bounce lookahead, then top speed, the weakest
  of the four. Extending a rally without making the ai simply *worse* at closing
  points out favours nudging read-error/reaction rather than raw speed, the same
  ranking `pong-normal-rebalance` already uses.
- `node tests/volley-sweep.js` is the existing ruler for exactly this — it
  reports a volley (contacts per point) per mode already, for budgeting ability
  durations. Re-run it before and after as the measurement; no new tool is
  needed.

**Do not build against that default without checking first.** Ball-speed
mechanics — a slower `BALL_SPEEDUP` per hit, or a lower `BALL_SPEED_MAX` — could
produce the same effect through a completely different mechanism (a rally that
takes longer to speed out of reach, rather than an opponent that takes longer to
beat), and that fork was raised and left open rather than decided. **Ask Gabriel
which mechanism he wants before implementing either one** — the same shape as
the vines-or-laser decision gating `pong-vine-attack` below.

- Whichever is chosen, it must not be done by tuning the same levers
  `pong-normal-rebalance` just set for a different reason. Land that entry first,
  and say explicitly which half (difficulty vs. rally length) a given change is
  answering, same as that entry already asks.

### pong-insane-ball-speed — Insane leaves the keyboard no room, and none at all under Squeeze

**Gate: a decision from Gabriel. Characterised, so the open question is now only
what to do about it — and it is a feel question, not a bug.** Whatever is chosen
then needs a playtest of its own.

The worry was that on Insane the ball moves fast enough that the player's own
paddle cannot get to it. Measured with `REACH=1 node tests/ai-sweep.js`, which was
added for this and is now the standing ruler. **The measurement, the reach table
and the finding that it is not tunnelling are all in `games/pong/DESIGN.md`,
"Whether you could have reached it"** — read that first; the numbers are not
repeated here. Tunnelling would have made this a correctness fix rather than a feel
decision, and it is ruled out, so that half of the entry is closed.

What is left is real but narrow, and it is two separate calls:

- **Insane sits ~2% under the limit on a clean paddle** (cap 14, limit 14.2).
  Playable, but there is nothing left in it. Mostly a thing to know before tuning,
  not something to fix.
- **Under Squeeze, Insane is already past the limit** (13.0 against a cap of 14).
  So a shot exists that no keyboard input can save. It needs a rally long enough to
  reach the cap — 15 contacts from Insane's start speed — with a Squeeze live at
  the time, so it is rare rather than routine.

**The decision is whether that second one is a bug or the mode's character.**
`games/pong/DESIGN.md` says Insane's brutality is deliberate and that a fast
corner shot is *meant* to outrun the keys and be read early instead. The
measurement already grants the early read, so this is past that line rather than
an example of it — but "on Insane, once per long rally, a Squeeze can produce a
shot you could not have saved" may be exactly what Insane is for. Nobody but
Gabriel can call that.

If it should be fixed, **there is really only one usable lever**, which was not
the expected answer. Measured, at Insane's cap of 14:

- **Softening the squeeze does not work.** `ABILITY.squeeze.scale` on Insane is
  0.55; taking it to Normal's 0.62 moves the limit only to 13.25, and even 0.80 —
  a squeeze you would struggle to notice — reaches 13.57. Nothing short of 1.0,
  which is no squeeze at all, clears 14. The paddle height is not what dominates
  this; the time in flight is.
- **`BALL_SPEED_MAX` is the lever.** 14 → 12.95 or below makes the worst shot
  reachable even while squeezed. That is a ~7.5% cut and it is unambiguously
  softening the mode, so per DESIGN.md it needs the same sign-off
  `pong-normal-rebalance` needs for Normal.
- **`PLAYER_PADDLE_SCALE` would have to go from 0.8 to about 1.45** for a
  squeezed paddle to clear the cap — larger than Normal's paddle, which is the
  opposite of what the mode is. Not a real option, but worth recording so nobody
  re-derives it.
- Raising `PADDLE_SPEED` is shared by every mode, and DESIGN.md's "Controls"
  section explains it is set where it is against *Normal's* geometry on purpose.
  Changing it to fix Insane would move Normal's whole positional game.

**A mouse is not affected by any of this**, so whatever is decided changes Insane
only for keyboard players — a mode meaningfully harder on the keys than with a
mouse, which nobody chose deliberately.

### pong-feel-pass — Tune what just shipped, now that it can be played

**Gate: playtest, and it is the whole entry.** Nothing here is a bug; every item
is a number that can only be judged by playing.

The three-mode rework went live without a final playtest. Bugs found during the
last round were fixed and merged straight away, so the state that shipped is not
the state that was last played. Start by playing all three modes. Normal has since
been played and called too hard; that verdict is `pong-normal-rebalance` and not
this entry's business.

Three specific things were flagged during that work and never decided:

- **Blink hops for the entire flight now.** That is what was asked for, and at
  `hopTicks` 3 it is around thirty teleports in a Normal-speed crossing. It may
  read as noise rather than menace. `hopTicks` makes it calmer; `lockPx` makes it
  settle onto the intercept sooner.
- **Assisted has not been played since Normal existed.** Its numbers were tuned
  when it sat beside Easy, and it is the one mode with a spec that is not about
  difficulty at all: it exists so a child who has not played Pong before has fun,
  which means rallies rather than a scoreline. Worth confirming it still does.

`node tests/ai-sweep.js` and `node tests/volley-sweep.js` are the two rulers, and
`games/pong/DESIGN.md` records what every figure in them means.

### pong-explain-the-modes — Say what the modes and the powerups actually do

**Gate: read the wording.** Text in a panel rather than a feel change, so it does
not need its own playtest — but nobody except Gabriel can say whether it reads to
a beginner, which is the only audience that matters here.

The `?` panel lists the controls and the win score and nothing else. It has never
mentioned the difficulty modes, and it is silently missing the half of the game
that is hardest to work out by looking at it: a three-pip meter fills, a paddle
turns rose and grows, the opponent teleports, throws lightning that leaves your
paddle shrunken and crackling, and fires a shot well above the speed the ball
otherwise reaches. None of it is named anywhere in the game.

Every mode has powerups now, so this is no longer a note about two odd modes — it
is missing from all three. It matters most on Assisted, which exists so a child
who has not played Pong before has fun, and a child is exactly who will not work
out unaided that hitting the ball with the very end of their own paddle, three
times, is what fills the meter.

The same paddle growth also means two different things depending on the mode:
help in Assisted, a reward for a long rally in Normal. If the panel says only "your
paddle gets bigger" it will be wrong in one of them.

- The panel is per-mode content in a game that can change mode from the menu at
  any time. Decide whether it lists all three at once or only the current one —
  the second reads better and means the text has to be rebuilt in
  `applyDifficulty()`, alongside the paddle and ability reset it already does.
- Naming what fills the clutch meter tells the player to aim with the edge of
  their own paddle, which is a real strategy the game currently hides. Worth
  deciding whether revealing it is the intent — `pong-charge-hitbox-tell` above
  reveals the same thing visually and landing it first may answer this question
  on its own.
- `#win-score` in that panel is already rewritten when the win score changes;
  whatever keeps mode text in step should follow the same path.
- Do not quote the numbers. A panel that says "three close calls" goes stale the
  first time `segments` is tuned, in exactly the way `games/pong/DESIGN.md` warns
  a doc does — and here the player sees the wrong version, not just the next
  developer.
- The same panel already lies to a touch device, listing keys a phone does not
  have — see `pong-mobile-support` below. Mobile is deferred, but it is the same
  panel and worth reading before rewriting it.

### pong-vine-attack — Vines that wrap the opponent's paddle and slow it

**Gate: a decision from Gabriel first — vines or a laser, see below — then a
playtest of its own.** How hard the slow bites, how long it lasts and how you earn
it are all feel, and it is the first thing you own that reaches the other side of
the board.

Vines shoot out of the player's paddle, cross the board, wrap the opponent's paddle
and slow it. It is the mirror of Squeeze and the move that evens the two sides up:
you get Expand and Clutch, both acting on your own paddle, while the opponent gets
Blink, Overdrive and Squeeze, and Squeeze is aimed at you.

**This replaces `pong-shooter-powerup`**, which answered the same asymmetry with a
collectable that turned your paddle into a gun. Same effect, more machinery — it
needed a second moving object and then a third, where the vine reuses the staging
Squeeze already has. Two things that entry knew survive, and neither is in
`games/pong/DESIGN.md`:

- **Slow, not shrink.** Squeeze already shrinks a paddle, and two moves doing the
  same thing read as one move. A slow is a new axis and it is legible: the paddle
  visibly cannot get there.
- **Slowing the ai means a live multiplier, never a write to `AI`.** `AI.speed` and
  `panicSpeed` are rebuilt from `AI_DEFAULTS` on every mode change, so a debuff
  written into them is either wiped or leaks into the next mode. Derive it from
  what is active, the way `syncPaddleSize()` does for paddle height.

Everything else it must obey is already in `games/pong/DESIGN.md`. It is a move
like any other, so it takes a `modes` list and an off value for every knob and both
"everything off" tests still pass. It is staged in three parts because a move whose
effect lands elsewhere has to be — `makeBolt()` and `strokePath()` already draw a
jagged glowing path between two points, so a vine wants a different line rather
than different machinery. And its duration follows "An effect timed against the
ball", with one exception worth stating: this lands as the ball heads *towards* the
opponent, so it bites on the very next contact and Squeeze's volley budget must not
be copied across.

**Nothing it fires may touch the ball.** `predictInterceptY()` reads the ball by
simulating clean physics, so a deflection would make the opponent misread shots for
a reason the player cannot see — a bug from where you are sitting, not a mechanic.

**Vines, or a green laser?** Gabriel raised the laser after this entry was written
and is unsure which fits the game better. It decides what the move looks like
rather than what it does. **Get the answer from him before building either.** Two
things bear on the choice, neither decisive: a slow has to be legible, and vines
wrapping a paddle say "bound" with no caption where a beam says "hit", which reads
closer to damage; and something has to cross the board, which a vine does naturally
and a beam does only if it is drawn lingering.

Two things stay open once that is settled:

- **How you earn it.** The villain rolls; you earn. Clutch pays out for close
  calls and Expand is mercy in Assisted and a return streak in Normal, so a third
  player move needs a third condition that is neither. A collectable served into
  play that you have to hit is one answer, and is the part of the shooter entry
  worth keeping.
- **What colour it is.** Red means the opponent is doing something to you and all
  three of its moves are red, so a player attack cannot be red. Green is Expand's.

### pong-high-dpi-canvas — Blurry on high-DPI displays

**Gate: someone has to look at it.** Screen capture of the X11 root is black on
the dev box, so "is it sharper" cannot be answered from a terminal at all.

The canvas backing store is a fixed 600x400 scaled by CSS `max-width: 100%`, so it
is soft on any display with `devicePixelRatio > 1`. Size the backing store by
`devicePixelRatio` and scale the context to match.

- `handlePointerMove` already converts client coordinates using the ratio of
  `HEIGHT` to the element's rendered height, so it survives this change — but it is
  the thing to check first if the paddle starts tracking the pointer incorrectly.
- The menu is positioned against `.board-wrap` rather than the canvas itself, so it
  should be unaffected. Worth a look regardless.
- Nobody working on this from a terminal can see the result: screen capture of the
  X11 root is black on the dev box. It needs someone who can look at the screen to
  say whether it actually got sharper.

### pong-visual-overhaul — Real art, and a menu that feels right

**Gate: yours throughout — this is entirely a look-and-feel entry.**

Three things have accumulated here, all of them placeholder-by-agreement rather
than oversights:

- **The menu does not feel right.** Called functional-for-now when the three-row
  version shipped. It is a heading, three difficulty buttons, a "first to" row and
  Play, stacked centred over the board. It was five buttons when that complaint
  was made, and the cabinet phase has since reskinned every button and given the
  menu a `READY` title, so re-look before assuming it still applies.
- **The mode colours are settled, and the note about amber still stands.**
  Assisted jade, Normal amber, Insane coral, read from `--p-jade`, `--accent` and
  `--p-coral` rather than through `--win`/`--lose`. Amber still doubles as
  "selected" — `design/DESIGN.md` makes it the site's one selected/active colour
  everywhere else, so Normal's button and "this is chosen" use the same hue for
  two different things. Survivable only because selected is a filled button and
  unselected is an outline; check it again if anything changes what selected
  looks like.
- **Real art assets**, which the game has never had — everything is `fillRect`
  against theme tokens. The cabinet phase is the frame around the court, not the
  court's contents: the paddles and ball are still rectangles.

### pong-bolt-core-dead-branch — Decide what `boltCore()` does under a dark-only palette

**Gate: none.**

`boltCore()` picks the bolt's core colour from the board's luminance, which
existed only because the light theme's board was pure white. The site has been
dark-only since the redesign, so one branch is now unreachable. Removing it is
fine and leaving it is fine; deciding by accident is not, and
`games/pong/DESIGN.md`'s Theme section has to say whichever you choose.

Carried over from `design/TODO.md`'s `redesign-pong` entry when that landed —
it was the one constraint there that the cabinet phase did not settle.

`games/pong/DESIGN.md` explains why the menu is DOM buttons over the canvas rather
than shapes painted on it. That reasoning survives an art pass; the styling does
not depend on it.

Worth doing after `pong-high-dpi-canvas` rather than before — there is no point
art-directing against a backing store that is about to change resolution.

### pong-two-player — Two-player mode

**Gate: try it.** Confirm the two sets of controls do not fight each other, and
decide whether the difficulty row greys out or disappears in two-player.

W/S for the left paddle, arrows for the right. A small change to the input
handling, and it matches Tic Tac Toe and Chess, which are both already local
two-player.

- The ai and the difficulty menu both become meaningless in this mode. Decide
  whether it is a fourth button in that row, a separate toggle, or its own entry
  point.
- `updateAi()` would simply not run and the right paddle would read keys the way
  the left one does. The pointer takeover logic is written for one player and would
  need splitting or disabling.

### pong-sound — Paddle, wall and score tones

**Gate: playtest, its own.** Tones are pure feel.

Classic Pong is its blip. A WebAudio oscillator gives paddle, wall and score tones
with no asset files and no dependency, which is what keeps it compatible with the
no-dependencies rule.

- Needs a mute toggle with the choice remembered — same namespaced key and
  try/catch treatment as the difficulty.
- Browsers refuse to start an AudioContext before a user gesture, and there is an
  obvious one to hang it off: the Play button.
- The menu is a three-button difficulty row, a three-button win score row and
  Play, so a mute control most likely sits with Restart and `?` rather than in it.

### pong-hit-feedback — Visual feedback on contact

**Gate: playtest, its own.** Trail length and flash intensity are pure feel.

A short ball trail, a paddle flash on contact, a flash on score. A few lines each
in `draw()`.

- **Most of this is already written, for the abilities rather than for contact.**
  `aiGhosts` keeps the last few paddle positions and draws them fading behind a
  blink, which is exactly the shape a ball trail wants; `paddleFlash` already
  flashes a band across a paddle; `drawCharged` draws a pulsing aura; and
  `makeBolt`/`strokePath` will draw a jagged glowing path between any two points.
  Extend those rather than building parallel machinery beside them — the knobs
  live in `ABILITY.afterimages`, `ABILITY.pop` and `ABILITY.squeeze`.
- Read the Theme section of `games/pong/DESIGN.md` first, and settle
  `pong-bolt-core-dead-branch` before copying `boltCore()`'s luminance pick for a
  new effect.
- Anything that flashes has to be driven by the tick count rather than by wall
  time, or it will run at different speeds on different monitors.

### pong-persisted-stats — Remembered stats

**Gate: one question first, then none.** Where it displays is a design decision;
the storage and the counting are not.

Longest rally, or wins and losses, stored the same way as the Minesweeper best
time: one namespaced key, every access wrapped in try/catch.

- Where it displays is the open question. The menu is the obvious home and now
  carries two rows of three buttons plus Play, so anything added there has to
  earn its space rather than simply fit.

### pong-mobile-support — Make Pong work properly on a phone (deferred)

**Gate: none — deferred by decision, not by difficulty.**

Not designing for mobile at present. An emulated phone with real touch events was
driven through a game, and the finding was not what anyone expected: **it already
works** — tapping serves, dragging moves the paddle, `touch-action: none` stops
the page scrolling under the drag, nothing overflows and nothing errors. Three
things do not:

- **No way to pause.** Escape and `p` are the only manual bindings, so you can get
  out of an auto-pause but never into one. The one functional hole rather than
  polish.
- **The `?` panel lists W/S, the arrows and Space**, none of which a phone has,
  and never mentions dragging. Showing the right controls without sniffing the
  user agent is what a pointer media query is for.
- **Your finger covers the paddle**, which sits on the left edge exactly where you
  drag. Only moving the control fixes that, and that is a design question.

Touch also **teleports** the paddle, because pointer control is deliberately not
rate-limited — see "Controls" in `games/pong/DESIGN.md`. A curiosity on a mouse;
on touch, putting a finger down somewhere else is the normal way to move.
