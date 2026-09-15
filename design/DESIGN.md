# The site's visual design

What the site looks like and why, for the whole site rather than for one game.
The counterpart of `games/pong/DESIGN.md` and its siblings, one level up: those
describe how a game plays and what a reader must not break in it, this describes
the look every page shares.

It belongs to the art director — see `ART-DIRECTOR.md`, which also says who owns
what while that seat is empty. Read this file before changing anything visual,
whichever seat you are in, and read it *first* if you are the art director
starting a session: it is the only thing that carries a decision from one session
to the next.

## How this file is written

As decisions are made, prescriptively, with the rejected alternatives kept —
`ART-DIRECTOR.md` says why each of those matters. Exact hex values and hard rules,
never "a warm amber": descriptive prose cannot stop drift, a value can.

What goes in it: the palette and what each colour is for; the type scale and the
typefaces; spacing, borders, radii; motion and what respects
`prefers-reduced-motion`; the tokens in `shared.css` and what each one means; and
any rule that keeps the system coherent — which colours may carry text, which are
structural only, what a game may vary.

---

**The palette is not finally decided.** What is below is what has been settled
or found so far. The open questions, and which phase closes each, are in
`design/TODO.md`.

## The direction is Amber Arcade

**Gabriel chose Amber Arcade on 2026-09-06.** That is settled; a later session
that wants to reopen it asks him rather than deciding.

How it got there: he picked **Amber Monitor** from the first eleven and in the same
breath asked for the one thing that direction was recorded as unable to do — the
accent colour Cold Terminal and Vector Neon put into the game boards. Two more were
built:

- **Amber Arcade** (`design/previews/variants/amberlit.css`) — **chosen.** Amber
  Monitor's shell, type and spacing unchanged, with six guest hues admitted to the
  boards and one category accent per tile.
- **Cold Terminal Mk II** (`design/previews/variants/coldmk2.css`) — not chosen.
  Cold Terminal plus Amber's roominess and larger type, Vector's per-element glow,
  and the texture capped at *as mocked* and lifted off the boards. Kept in the
  archive; its reading-tint and glow-scale ideas are worth stealing.

**Built** in `shared.css`, `hub.css` and `index.html` as of the
`redesign-tokens-hub` phase.

### What choosing it commits us to

- **The monochrome fiction is given up, deliberately.** A P3 amber tube cannot
  show a magenta paddle. The site is an amber-panelled machine with a colour
  display in it, not an amber monitor. Everything below follows from that.
- **Amber is the home hue and is never a category colour.** It is the wordmark,
  the cursor, the selected and active state everywhere, and Minesweeper's n1. A
  category owning it would make "selected" ambiguous.
- **Six guest hues, for the screen only**, listed with their values under "The
  guest hues" below.
- **Colour by category is in**, which pre-answers most of the
  `redesign-category-accents` entry in `design/TODO.md`. Close that entry when
  the games are done rather than treating it as still open.

### The rule that came out of it: chrome against screen

Amber Arcade needed a line to sit on, because a P3 amber tube is monochrome by
physics and cannot show a magenta paddle. The line it found is worth keeping
whichever direction wins, because Cold Terminal Mk II independently needed the
same one for its texture:

**The page has two halves. The chrome is the machine — wordmark, nav, strap,
rules, footer, the panel a game sits in. The screen is the game — the board, the
digits, the pieces, the score.** Effects that are *about the display* belong to
the chrome: the single hue, the CRT texture, the bloom. Information the player
has to decode belongs to the screen, and gets whatever colour it needs.

Both directions obey it and neither was designed to. Amber Arcade keeps one hue
on the chrome and spends six on the boards. Cold Terminal Mk II keeps the
scanlines on the chrome and lifts them off the boards. The costume and the
information stop competing, which is the thing every heavy direction in the
gallery failed at.

The consequence to carry into the game phases: **a game's board is not decorated
like the hub.** Whatever `shared.css` ends up doing to a page, the board inside
it is exempt.

## The palette

Every value the chosen direction uses, so the build does not have to be read out
of a throwaway stylesheet. Source of truth until `shared.css` exists;
`design/previews/variants/amberlit.css` carries the same numbers with the
reasoning attached, and is deleted once the build lands.

### The amber ramp — the chrome

| Value | Role | Notes |
| --- | --- | --- |
| `#0a0704` | ground | Brown-black: red channel highest, blue nearly gone |
| `#150f07` | panel | |
| `#221709` | panel, lit | a tile under the cursor |
| `#3d2807` | hairline | **never a word** |
| `#7a5008` | rule on a panel | **never a word**, ~2.9:1 |
| `#b8790a` | dim | the floor for text |
| `#f2bc62` | secondary text | |
| `#ffb000` | **amber — the home hue** | primary, selection, active |
| `#ffd694` | pale | |
| `#fff2da` | white-hot | the beam driven past amber |

Board grounds, which are not the panel: `#100b06` a Sudoku cell, `#2a1c09` a
selected cell or lit well, `#0d0905` the Pong court. Minesweeper's are its own
three — `#21170b` a covered cell, `#32220d` one under the pointer, `#1c1408` the
ruling over cleared ground — and they are local to that game's `style.css` as
Pong's court is: one board, one use, no token. The covered cell was `#16100a`
until its phase, which moved it for the reason in "Minesweeper: the covered
board" below. Tile description text is `#d8a45a` — one step under the secondary; an
`opacity` there instead greys the amber toward the brown ground.

### The guest hues — the screen

Six, admitted to boards and category accents only. **Never to the chrome.**

| Value | Name | Hue | Used for |
| --- | --- | --- | --- |
| `#6fdcf2` | cyan | 192° | puzzle; an entered Sudoku digit; n2; Flappy Bird's bird |
| `#5fd9a0` | jade | 157° | strategy; `--win`; n4 |
| `#d4e85c` | lime | 75° | n6 — **the risk value**, see below |
| `#ff6a56` | coral | 6° | `--lose`; the mine flag; Pong's opponent; n3 |
| `#ff7fcb` | rose | 328° | arcade; Pong's player; n5 |
| `#b9a2ff` | violet | 258° | n7 |

Every one is **warmed and lightened** off the value it came from in Cold
Terminal or Vector Neon. Do not substitute the originals back: `#3fd4ff` on this
ground reads as a hole punched to another site.

**Six is still six, and a seventh was cut and then dropped.** Flappy Bird spent
2026-09-09 with an amber bird on a true green world — `#72e07c`, "fern", added as
a `--p-fern` token because the pipes were wanted in the green the original game is
remembered by and neither existing green could do it: jade at 157° reads as mint
rather than as leaf, and lime at 75° sits 34° from that amber bird, the pair
flagged as the risky one below, so the bird all but merged with the pipes. The
board went through cyan pipes the next day and ended up inverted — amber world,
cyan bird — and the token came back out with nothing reading it.

**Two things worth keeping from it.** Adding a hue is possible and the bar is
what fern cleared: two of the six already in hand shown to fail at the real size,
not argued about. And a hue with nothing reading it does not stay — the token was
deleted the same commit the last use of it went, rather than left for later.

Minesweeper's eight: **n1 amber, n2 cyan, n3 coral, n4 jade, n5 rose, n6 lime,
n7 violet, n8 `#fff2da`.** No underline, no second device — eight hues is what
buys that. 1–3 take the three most legible and most separated because they are
what gets read at speed; 7 and 8 are almost never seen.

**The risk: lime against amber, 34° apart**, the closest pair in the set,
separated on lightness alone. It holds at preview size. If it fails on a real
16×30 board, **lime is the value to move, not amber.**

### The token mapping

Built, in `shared.css` — names unchanged, values new, palette layer underneath,
per "How the tokens are layered" below:

| Token | Value | |
| --- | --- | --- |
| `--bg` | `#0a0704` | |
| `--fg` | `#f2bc62` | |
| `--card-bg` | `#150f07` | |
| `--cell-bg` | `#100b06` | |
| `--cell-border` | `#3d2807` | |
| `--accent` | `#ffb000` | amber |
| `--win` | `#5fd9a0` | jade |
| `--lose` | `#ff6a56` | coral |
| `--muted` | `#b8790a` | |

They landed, and all six games changed colour with no other work. **That was the
check that the token layer works** — and it is why a game no phase has reached
yet goes on rendering correctly.

## The typeface

**VT323, self-hosted**, at `assets/fonts/`:

| File | What it is |
| --- | --- |
| `vt323-latin.woff2` | The Latin subset. Everything the site actually sets. |
| `vt323-latin-ext.woff2` | Latin Extended. 16K, for accented characters. |
| `OFL.txt` | The SIL Open Font License the face ships under. |

The `@font-face` lives in `shared.css` with a **relative** `url()`, so it
resolves from the hub and from a game page alike, the same way every other path
on this site does.

**Not the Google Fonts CDN.** It costs a visible font-swap on first paint of a
design whose entire identity is the typeface; it adds a third-party uptime and
privacy dependency to a site that otherwise has neither; and it breaks offline
and from `file://`. Two font files totalling 34K is a cheaper price than any of
that.

The Vietnamese subset Google serves is deliberately not committed. It is another
16K for characters this site has no use for.

**A self-hosted font is not a build step.** It is a file the browser fetches,
like the stylesheet. The rule in `CLAUDE.md` is that the site must need no build
and no install to render, and this does not.

## The hub

Settled 2026-09-06, after several rounds against a served preview
(`design/mockups/hub-preview.html`, built on the interaction proved out in
`design/mockups/hub-select-overlay.html`). This closes the three questions the
previous session left open, and answers them differently than any of the options
originally listed for two of the three.

### Tile selection: the whole tile is the control

No separate Play button anywhere, no separate info panel anywhere on the page, no
text that shows or hides on selection. **Tap 1 arms a tile; tap 2 on that same
armed tile plays it; tapping a different tile re-arms there instead and
disarms the first.** This drops the "selected-game info panel" from the original
mockup brief entirely — not deferred, not one of the surviving options, gone.

Why: the info panel sat in the page after the whole grid, so on a phone tall
enough to need scrolling, tap 2 required scrolling to reach it first — the exact
bug Gabriel hit and reported. Putting both taps on the tile itself makes that
impossible by construction: there is nowhere else for the second tap to be.

Visual feedback on arming — exact values, tuned live against Gabriel's reaction
over several rounds:

```css
.tile.selected {
  border-color: var(--cat-accent);
  animation: armed-pulse 2.3s ease-in-out infinite;
}
@keyframes armed-pulse {
  0%, 100% { box-shadow: 0 0 0 2px var(--cat-accent),
                          0 0 18px 3px color-mix(in srgb, var(--cat-accent) 55%, transparent); }
  50%      { box-shadow: 0 0 0 2px var(--cat-accent),
                          0 0 29px 8px color-mix(in srgb, var(--cat-accent) 72%, transparent); }
}
@media (prefers-reduced-motion: reduce) {
  .tile.selected {
    animation: none;
    box-shadow: 0 0 0 2px var(--cat-accent),
                0 0 26px 6px color-mix(in srgb, var(--cat-accent) 70%, transparent);
  }
}
```

The glow is the tile's own category colour, not a fixed amber — Gabriel's
correction after a round that used amber for every tile. The pulse was pulled back
about 15% once a "more intense" pass read as gaudy, and slowed from 1.8s to 2.3s
for the same reason. **The tile's footprint never changes size between resting and
armed — nothing in the grid reflows**, and the description sits in the tile
permanently rather than appearing on selection.

### Category colour: at rest, all the time

The open question from the previous session is closed: **at rest**, not hover-only.
All six tiles carry their category's guest hue as a glowing left bar plus a
lowercase category label under the description, visible before any interaction.
Dropping it for a plainer tile was tried live in the preview and Gabriel reversed
it immediately — "bring back the green pink and blue game colors" — it read as
losing what made the direction distinct, not as winning calm.

Category → hue, matching the guest hues table above: strategy → jade `#5fd9a0`
(Tic Tac Toe, Chess), puzzle → cyan `#6fdcf2` (Minesweeper, Sudoku), arcade →
rose `#ff7fcb` (Anime Pong, Flappy Bird). The category label text itself is
tinted with the same hue, not left dim — an intentional bit more colour than the
original preview used for that label.

**A per-tile "new" or "staff pick" badge, using a similar accent treatment, was
floated as a future idea — not decided, not this phase.** Six live games don't
need a badge system yet; if it's wanted later it is new work, not an extension of
category colour.

**The bar itself is a glow, not a flat `border-left`, and the tile gets a real
hover state.** A flat 4px `border-left` with a background-swap hover drew "why does
it look like the cheap mockups" from Gabriel. The fix is amberlit.css's treatment —
the edge as a separate `::before` layer with its own `box-shadow`, and a hover that
lifts, glows card-wide and blooms the name and icon — with one change: amberlit
hides the bar until hover, which is the hover-only treatment reversed above, so
here it stays visible at rest and strengthens on interaction.

```css
.tile::before {
  content: ""; position: absolute; left: -1px; top: -1px; bottom: -1px;
  width: 4px; background: var(--cat-accent);
  box-shadow: 0 0 10px 1px color-mix(in srgb, var(--cat-accent) 50%, transparent);
}
.tile:hover, .tile:focus-visible {
  border-color: color-mix(in srgb, var(--cat-accent) 40%, var(--p-hairline));
  transform: translateY(-2px);
  box-shadow: 0 0 24px 2px color-mix(in srgb, var(--cat-accent) 30%, transparent);
}
```

**A second bar grows from the centre on hover, per Gabriel's live request the
same day.** `.tile::before` above is the always-visible one; `.tbar` sits in the
same spot, `scaleY(0)` with `transform-origin: 50% 50%` at rest, `scaleY(1)` on
hover/focus/arm — the amberlit.css reveal animation, layered on top of the
always-visible bar rather than replacing it, so "at rest, all the time" above
still holds mid-animation. A dedicated `<span class="tbar" aria-hidden="true">`
markup element, not a second pseudo-element — `::before` is already spoken for.

```css
.tbar {
  position: absolute; left: -1px; top: -1px; bottom: -1px; width: 4px;
  background: var(--cat-accent);
  box-shadow: 0 0 18px 4px color-mix(in srgb, var(--cat-accent) 80%, transparent);
  transform: scaleY(0); transform-origin: 50% 50%;
  transition: transform 0.18s ease; pointer-events: none;
}
.tile:hover .tbar, .tile:focus-visible .tbar, .tile.selected .tbar {
  transform: scaleY(1);
}
```

`.tile.selected`'s pulsing arm glow is untouched by any of this — it is a
separate, already-tuned state, and hover and selected read as two different
things on purpose.

### Icons

**Ported from `design/previews/gallery.js`'s `LINE_ICONS`**, at Gabriel's request —
the first build kept the pre-redesign hub's six emoji, which is part of what the
"cheap mockups" reaction was about. Six stroke icons on one 48x48 grid at a single
weight (`stroke-width` 2.4–3.2 by glyph), coloured entirely through `currentColor`
so no icon needs a colour rule of its own. Inlined in `index.html` as
`<svg class="ico" viewBox="0 0 48 48">` inside each tile's `.tico` span, verbatim
but for the mine icon's highlight hole, which used a gallery-only token and is
repointed to `fill="var(--bg)"`.

`.tico` carries the colour: `--p-dim` at rest, `--p-amber` on
hover/focus-visible, so the icon reads as chrome (one hue, not category-tinted)
even though the bar beside it is. The existing category-tinted `filter:
drop-shadow(...)` on hover layers a coloured glow around the now-brighter amber
glyph rather than tinting the glyph itself — deliberately different from
amberlit.css, which used a flat amber glow, because every other hover cue on this
tile is already category-coloured and an amber-only glow here would be the one
inconsistent one.

### The strap cursor

A slow-fading amber block after the status line ("Pick a game to play"), added at
Gabriel's request the same day — `.hub .status::after` rather than markup, mirroring
`design/previews/variants/amberlit.css`'s `.strap::after` exactly: 2.4s
ease-in-out between opacity 1 and 0.12, a fade rather than a hard blink, because
the whole direction is the calm reading of the idea. Respects
`prefers-reduced-motion` by holding at a fixed 0.75 opacity instead of animating.

### The CRT texture, applied

**Bumped from "soft" to "mock" strength** after the first build shipped at soft and
Gabriel called it invisible on the served page. Not "heavy": "What the preview
phase measured" found heavy breaks up a dense board. That does not apply to the hub
chrome, since no board sits under it, but one step rather than a jump to the top
keeps this a decision rather than an overcorrection.

```css
.crt {
  position: absolute; inset: 0; z-index: 6; pointer-events: none;
  background: repeating-linear-gradient(to bottom,
    rgba(0,0,0,0.34) 0 1px, transparent 1px 3px);
}
```

A dark line, never a white one — see "Rejected, with the reason" above for why.
The game grid is lifted out from under it exactly the way "What the preview phase
measured" already describes doing for a board: `.grid { position: relative;
z-index: 7; background: var(--bg); }`, which both rises above the texture layer
and stops it showing through the gaps between tiles.

### Depth and framing: `.deco`

The first build had no framing layer at all — "no depth or framing... reads as flat
rectangles on black." `.deco` is amberlit.css's wash-and-vignette with more amber
glow than that source carries: a deliberate departure Gabriel asked for, not a
mis-port. `z-index: 0`, below `.crt`'s 6, so the texture and the game grid both
paint over it.

```css
.deco {
  position: absolute; inset: 0; z-index: 0; pointer-events: none;
  background:
    radial-gradient(85% 65% at 50% 2%, rgba(255, 176, 0, 0.16), transparent 74%),
    radial-gradient(65% 50% at 50% 100%, rgba(255, 140, 0, 0.06), transparent 70%),
    radial-gradient(125% 105% at 50% 45%, transparent 52%, rgba(0, 0, 0, 0.72));
}
```

Amberlit.css's own caution — any stronger and the ground stops being black and
starts being brown — was written for *that* direction's values, not as a hard
ceiling; Gabriel's eye overrides it per `ART-DIRECTOR.md`. If a later round wants
to push this further, keep checking it against real content (the tiles, the
wordmark) rather than the wash in isolation. `<div class="deco">` goes first
inside `.hub`, before `.crt`, on every page that shares the hub chrome
(`index.html` and `about/index.html` both).

### Chrome, as built

Wordmark "GABE-SD ARCADE", a top nav (Home / About / GitHub — About is a stub per
the settled list above), and a status line ("Pick a game to play"). Sizes, as the
type scale this phase carries into `shared.css`:

| Element | Size | Notes |
| --- | --- | --- |
| Body | 22px (20px under 760px) | base VT323 size |
| Wordmark | 3.1rem (2.4rem under 760px) | `--hot`, heavy bloom |
| Nav link | 1.15rem | `--dim` at rest, `--pale` on hover, `--amber` + bloom when active |
| Status line | 1.3rem | `--pale` |
| Tile name | 1.75rem | `--pale` |
| Tile description | 1.08rem | `--desc` |
| Category label | 0.92rem, letter-spacing 0.22em, lowercase | tinted `var(--cat-accent)` |
| Footer | 1.02rem | `--dim` |

## The game page

Settled 2026-09-07, built as `game.css`, and drawn around every mock in
`design/mockups/arcade-chess-pong-directions.html`. It is the hub's machine one
size down, and it exists because the hub got a machine built around it and the
game pages did not — which was most of why they read as a different site.

It is a **shared** file, loaded between `shared.css` and the game's own
stylesheet, so a game can override anything in it and
`tests/contract.test.js` still sees `shared.css` first:

```html
<link rel="stylesheet" href="../../shared.css">
<link rel="stylesheet" href="../../game.css">
<link rel="stylesheet" href="style.css">
```

| Element | Value |
| --- | --- |
| Frame | `.game-in`, max-width 1120px, padding `1.4rem 1.6rem 2rem` |
| Wash | `.game-deco`, z-index 0 — amber bloom off the top, vignette into the corners |
| Scanlines | `.game-crt`, z-index 6 — `rgba(0,0,0,.34)` 1px every 3px |
| Breadcrumb | `.crumb`, 1.02rem, `--p-dim`, letter-spacing 0.08em; the game's name in it is `--p-pale` |
| Title | `.game-title`, 2.1rem (1.7rem under 620px), `--p-hot`, `--bloom-lg`, letter-spacing 0.09em |
| Head rule | 1px `--p-hairline` under the top row |
| Status strap | `.game-strap`, 1.22rem, `--p-pale`, with the hub's fading block cursor |
| Stage | `.game-stage`, z-index 7 — the board, lifted clear of the scanlines |
| Foot | `.game-foot`, 1rem, `--p-dim`, 1px `--p-hairline` above, two columns that stack under 620px |

Three rules under it:

- **Chrome against screen, in z-index terms.** The wash is 0, the scanlines are
  6, the board is 7 with its own opaque ground. A scanline over a chess hairline
  or a Sudoku digit is texture bought at the price of reading the game.
- **The breadcrumb is the contract's link home.** It replaces `.back-link`, and
  it says where you are as well as where you can go.
- **Standing instructions go in the foot, never in `#status`.** The contract
  keeps the status line for game state, and a hint that never changes is not
  state.

**The strap cursor respects `prefers-reduced-motion`** and settles at 0.75
opacity rather than stopping mid-blink.

**All six games wear it.** It was built on the chess phase rather than as its
own, because chess needed it and a frame with one consumer is cheaper to change
than a frame with six; the other five adopted it once it had stopped moving.
Adopting one is three lines of markup plus the link, and
`tests/contract.test.js` now holds every game to it — the link, its position
between the other two sheets, and the frame's own elements — so a seventh game
cannot quietly ship on the bare page.

Two things the frame does *not* decide, which is why each game still has a phase
of its own: what is inside the board, and what colour it is. Minesweeper's eight
number hues and its rounded cells, Sudoku's grid lines, Tic Tac Toe's marks and
Flappy's canvas were every one of them untouched by the frame landing. **Which of
those interiors have since had their phase is deliberately not listed here** —
`design/TODO.md` carries the ones still open, and is deleted from as each lands.
A sentence here naming them was false within a day of the first phase after it,
and stayed false through a second. A framed page with a pre-redesign interior is
the expected halfway state, not an oversight.

### Centred, because the frame is wider than any board

`.game-stage`, `.game-page .controls` and the `.instructions` panel all centre.
Most boards are a few hundred pixels wide inside a 1120px frame, so left-aligned
they sat in the corner of a very large empty page with the title floating off to
the right. It looked like a mistake, and Gabriel called it one.

Pong turns it off. Its cabinet is already a centred column exactly as wide as the
court, and centring inside that column as well would centre twice — the strap and
the buttons would drift off the court's left edge, which is the line they are
supposed to hold.

### Buttons: a terminal key, not a pill

`shared.css`'s `.btn` was the last thing on the site still wearing the
pre-redesign default stylesheet — `border-radius: 8px`, a filled amber pill with
white text. It is now square, hairline-edged, and labelled in letterspaced
uppercase, which is the same "selected" language the hub uses for a tile:

| State | Treatment |
| --- | --- |
| `.btn` | filled `--accent`, `--p-ground` text, 14px amber glow, uppercase at `letter-spacing 0.1em`, `border-radius: 0` |
| `.btn:hover` | filled `--p-pale`, 18px glow |
| `.btn.secondary` | transparent, 1px `--cell-border`, `--muted` text, no glow |
| `.btn.secondary:hover` | border `--p-rule`, text `--p-pale` |
| `.btn.icon` | tighter padding, no letter-spacing — for a single-glyph label |

The filled/outline pair carries "selected" on its own, with no second signal.
This is a `shared.css` change, so it reaches every game at once; that is
deliberate, since a rounded pill under a phosphor board looks like a bug.

## Chess: the vector grid

Chosen by Gabriel on 2026-09-07 from four directions built and shown at board
size. The mockup is `design/mockups/arcade-chess-pong-directions.html`; the
values are in `design/mockups/chess-c.reference.css` and
`design/mockups/chess-pieces.reference.js`, and the built page is
`games/chess/`.

**The finding that decided it: VT323 has no chess glyphs.** Its two subsets stop
at Latin Extended, so `U+2654-265F` fell through to whatever face the reader's OS
served — a soft serif here, something else on the next machine. Two of the four
directions accepted a second self-hosted typeface on the chess page. This one
makes the problem disappear without asking the player to read letters as pieces.

### The board

`design/TODO.md` called the two square colours the hardest single visual question
in the redesign. This answers it by not answering it: **the board is drawn, not
filled.**

| Part | Value |
| --- | --- |
| Ground | `#080503` — a shade under `--p-cell`, because the squares carry no fill and the hairline needs something to sit on |
| Frame | 1px `--p-rule` |
| Light square | **no fill at all** |
| Dark square | `rgba(255, 176, 0, 0.05)` |
| Square hairline | inset `0.5px` at `rgba(255, 176, 0, 0.13)` |
| Square size | `--sq`, 54px; 42px under 620px; 36px under 460px |
| Coordinates | `--p-dim`, 0.9rem; **dropped entirely under 460px** |

Half a pixel, not one: a full-pixel grid reads as a table.

`--sq` lives on `.board-stack`, not on `#board`, because the trays and the file
letters are siblings of the board and have to match its width. Put it on the
board and a later change to the square size silently leaves them behind.

### The pieces

Six stroke SVG drawings on the hub's own 48×48 icon grid, at the hub's own
weight, so the site has one drawing hand.

| Part | Value |
| --- | --- |
| Wrapper | `viewBox="0 0 48 48"`, `fill="none"`, `stroke="currentColor"`, `stroke-width="2.2"`, round joins and caps |
| Size | 78% of the square |
| White | `--p-pale`, `drop-shadow(0 0 5px rgba(255,214,148,.5))` |
| Black | `--p-jade`, `drop-shadow(0 0 5px rgba(95,217,160,.4))` |

Colour arrives entirely through `currentColor`, so no piece carries a colour of
its own — which is what lets the same markup serve the live board and the dimmed
capture trays.

Jade for Black is not a free choice: strategy is the jade category, and Chess is
a strategy tile on the hub. The in-game colour inheriting from the hub tile is
the same answer Pong reached independently.

**Two of the six were judged one against another. Four were not, and are right
as first drawn** — Gabriel, 2026-09-07: the pieces he did not ask for variations
of were good the first time.

- **The knight is the angular one** — straight lines only, chosen over three
  rounder alternatives including a filled silhouette and a pixel version. It is
  the only piece in the set with no curve in it. What identifies it is the wedge
  muzzle with the jaw cut back under it, the straight forehead, and the single
  pointed ear; lose any of those and it stops being a horse.
- **The king is "Broad"** — a wide dome, a collar band at `M15 28h18` at
  `stroke-width 1.5`, and the standard base. Chosen after **two entire further
  sets were rejected**, which is where the transferable finding is:

> **The bad king silhouette is a tall symmetrical shape with a rounded top
> standing on a plinth.** Square the top and it reads as a tombstone; round it
> and it reads as something worse. No crown, band or proportion fixes it — the
> outline is the problem, not the detail.

Carry that into any piece redrawn later. Whether the other five go angular to
match the knight is **open** and was not decided.

### The marks

`--mark` follows **the side to move**: amber on White's turn, jade on Black's.
`#board` carries `data-turn`; the stylesheet reads it.

| State | Treatment |
| --- | --- |
| Selected | square fills `--p-panel-lit`, plus `inset 0 0 0 2px --p-amber` and a 16px amber glow |
| Legal move | a **block, not a circle** — 26% of the square, `--mark`, 10px glow at 60% |
| Capture | four corner brackets inset 6%, 30% long, 2px — a reticle, not a ring |
| Last move | `rgba(255,176,0,.10)` wash plus a 1px inset at 22%, on **both** squares |
| Check | `inset 0 0 0 2px --p-coral`, an 18px inner coral glow, and a 10% coral wash |

A circle is what every other chess site draws; a square pixel is what a display
like this one draws.

**Four of these can land on one square at once** — the king you just moved, into
check, while it is selected — so each takes a layer of its own: the check wash on
the square's `background-image`, the last move on `::before`, the selection on
`::after`, the move marks at z-index 1, the piece at z-index 2. The reference CSS
put three of them on `::after`, which an element has one of; source order won and
selecting a checked king silently lost its ring. **Do not put two marks back on
one pseudo-element.**

### The capture trays

One on each edge of the board, inside the same grid as the squares, so they line
up with the files and nothing reflows as pieces come off. What Black has taken
runs along the top, what White has taken along the bottom — each on the side of
the player who took them.

| Part | Value |
| --- | --- |
| Piece size | 26px (22px under 620px, 18px under 460px) |
| Colour | 42% of its own army's hue mixed toward `--p-hairline`, glow **off** |
| Order | Q R B N P |
| Material figure | 1.25rem, tabular numerals, in the leading side's own hue |

A captured piece is spent and must not compete with the live board an inch away.

**One number on the whole board:** the material difference, carried only by the
side that is ahead, sitting half a space after that side's last captured piece.
Values are the standard 9/5/3/3/1. Two running totals would be two numbers to
subtract before learning the only thing a player reads for, and the losing side
showing nothing is itself the fastest way to say who is losing.

No labels. The pieces are jade or amber, which says whose they were; the edge
says who took them.

### Rejected, with the reason

- **Two steps of the amber ramp with solid-vs-outline Unicode armies**
  (direction A), and **near-neutral jade-tinted squares with an amber army
  against a jade army** (direction B). Both fine; both ship a second typeface.
- **VT323 letters as pieces** (direction D) — the most on-brand thing built and
  the least playable. A `N` is not a horse, and casual players read shapes faster.
- **Filled or pixel pieces.** Both read best of all at 54px. Both are a whole
  *set*, not one piece — an outlined army cannot carry one filled member.
- **Six kings built as carved figures on plinths** (crowned, faceted, broad,
  cross-first, regalia, lobed-crown) and **five built as emblems** (imperial
  crown, heraldic shield, crowned head in profile, crowned shield, orb and
  cross). Rejected on silhouette, per the rule above. A throne was drawn and
  thrown out before the emblems were shown: front-on, a panel with a cross on it
  is a grave marker.
- **A move log in a side console.** Direction B's idea; new game behaviour rather
  than a restyle, and no other game here has a side panel.
- **Filling the checked king's square with `--lose`**, which is what the page did
  before. It buried the king it was pointing at.

### Still open on chess

- Whether the other five pieces go angular to match the knight.
- The board on a phone below 460px, where the coordinates are already dropped.

## Pong: the cabinet

Built 2026-09-07 from `design/mockups/pong-cabinet.html`, which is a revision of
the Pong half of `arcade-chess-pong-directions.html` — the revision is the one
column. All three of the mockup's changes landed together.

### One column, as wide as the court

The strap, scorebar, court, buttons and footer are `min(100%, calc(var(--court)
+ 28px))` and centre: the 600px court, plus the canvas's own 1px border, plus
12px of bezel padding, plus the bezel's own 1px border, each doubled. The
breadcrumb and title above them still span the page. Nothing resizes — the column
simply stops where the court stops, which is what puts `you` and `ai` over the
paddles they label instead of hundreds of pixels away on a wide monitor.

Derive every width in that column from `--court`, so changing the court size
changes one number and nothing drifts out of line. The first version wrote 626 by
hand, forgot the canvas's border, and set `width: 100%` on a canvas under a
global `box-sizing: border-box` — which made the drawing surface render at
598 x 398.67 and resampled the whole game into invisibility. See
`games/pong/DESIGN.md`, "The canvas is drawn 1:1".

### The bezel and the scorebar

| part | value |
| --- | --- |
| bezel | `linear-gradient(#160f08, #0d0905)`, 1px `--p-hairline`, `inset 0 0 40px rgba(0,0,0,.8)`, 12px padding |
| corner brackets | 14px, 1px `--p-rule`, two sides each, top-left and bottom-right |
| court | `#0d0905`, 1px `--p-hairline` |
| labels | `you` / `ai`, 0.9rem, `letter-spacing .2em`, `--p-dim`, lowercase; `first to N` the same but `.24em` |
| menu backdrop | `rgba(10, 7, 4, 0.86)` over an opaque `--p-ground` fallback, so the final score stays readable behind it either way; `READY` above it in `--p-hot` at `letter-spacing .12em` with `var(--bloom)` |
| the digits | 2rem, `--p-rose` and `--p-coral`, each glowing its own colour at 50% |
| radius | none, anywhere on this page |

Two brackets rather than four: two say "machined panel", four read as a border,
and there is already a border.

The scorebar's ends are flush with the court's, which is the whole reason the
column is court-width. A test holds it to within 2px of the canvas's own edges,
because that alignment is the point of the layout and nothing else would catch it
drifting.

### What the court draws

The mockup's three inside-the-court touches — the serve prompt, the burn-in
score, the trail and vignette — all landed. Their values and the reasoning behind
each are in `games/pong/DESIGN.md`, "The court", which is where a builder will be
looking. Two of them are worth repeating here because they are about the system
rather than about Pong:

**Chrome against screen cuts both ways.** Nothing overlays the canvas — the page's
wash and scanlines stop at the bezel — so an effect that belongs *on* the court
has to be drawn by the game. That is why the `charge` label is canvas text rather
than a positioned `<span>` like the mockup's: the canvas scales with the viewport
and an HTML overlay pinned at `left: 14px` drifts off the meter it labels the
moment it does.

**Chrome that dims has to sit under the game.** Pong's vignette shipped over
play, the way the mockup draws it, and cost a paddle at the top or bottom of its
travel a third of its brightness — a 10px sliver on a near-black court. Moving it
under the play layer costs nothing and loses nothing, because what a vignette on
this court actually shades is the burned-in score and the centre line rather than
the near-black ground. If an effect is only visible because it is dimming the
game, it is not an effect, it is a tax.

### Rose against coral, all the way down

The player is `--p-rose` `#ff7fcb` and the opponent `--p-coral` `#ff6a56`, read
straight from the palette rather than through `--win`/`--lose`. Rose *is* the
arcade tile's colour, which answers the open question of whether an in-game accent
should match its hub tile: it does. The `#ff4dd8` magenta of
`design/mockups/pong-lightning-magenta.html` is now one more value nobody can
place.

The ball and the court furniture stay amber. The ball belongs to the machine, not
to either player, and it is the only thing on the court both paddles touch.

**What this cost, and the general lesson.** Both paddles used to be `--fg`, and
Pong's ability system says a tell is "your colour" or "the opponent's". Giving the
paddles those colours at rest deletes any tell that was only a tint — which is
exactly what Expand was. It now burns `--p-hot` instead.

The lesson generalises past Pong: **a resting colour and a state colour cannot be
the same colour.** Before handing a game's furniture the hue its states already
use, find out what that hue was saying.

### Rejected

- **A glow on the resting paddles**, which the mockup draws. Light past a paddle's
  own edge is how the game says a charge is in hand; lighting every paddle all the
  time spends that signal on nothing.
- **`Rally · 2 – 1` in the status strap**, which the mockup shows. The score is
  already on the bezel and burned into the court behind play; a third copy is
  clutter, and it is the only one that would need words.
- **Dropping the `?` panel** in favour of the footer hint, which the mockup does.
  The page contract keeps standing instructions in a collapsible panel. The footer
  carries the hint as well — that is cheap, and it is what the mockup got right.

## Flappy Bird: one lit actor

Built 2026-09-09 against a served page with every option switchable in the real
game, because the pipes are painted by a script and a static mock would have lied
about how they move. There is no mockup for this one.

### The cabinet, at this board's width

The same bezel, corner brackets, court value and court-width column as Pong,
with `--court: 400px` instead of `600px`. **The two canvas games are one
machine**, and every width in the column derives from `--court` for the reason
Pong's does. The court is the same `#0d0905`.

### Cyan bird, amber world

| part | value |
| --- | --- |
| the bird | `--p-cyan`, drawn as a 2px outline with a solid wing and beak inside it |
| its glow | `shadowBlur` 10 in its own colour, two passes under a clean one |
| dead | `--lose`, same drawing, no glow |
| the eye | `--p-hot` with a `--bg` pupil |
| pipes | a `--p-amber` veil at 0.22, a 2px `--p-amber` rim inside the edge, `shadowBlur` 14 clipped to the rectangle |
| the ground | `--p-amber`, 2px, on the pixels that end the run |
| the ceiling | `--p-amber` at 0.45, a broken rule — it only stops you |

**The board is two colours: the bird and everything else.** The pipes, the ground
and the ceiling are one hue, so there is exactly one other thing on the court and
it is the thing you are flying.

**The world is the machine's own amber, and the bird is the only cool thing on the
page.** Chosen by eye over a day of switching hues live — the boards that worked
all paired one warm with one cool, and the ones that failed paired two of a
temperature. **The rule of thumb that came out of it, and it is a matter of taste
rather than of theory: one warm and one cool, and where you can, keep the small
thing warm or the bright thing cool.** A small saturated actor against a large
calm world is what makes the actor look alive.

**Which of the two carries which is not free either.** A pipe is drawn as a veil
and a *thin rim*, so its hue has to survive being a one-pixel line on near-black:
violet was tried there and the pipes half-vanished. A bird is a small solid shape
and needs no such thing. **The hue that survives a thin outline goes on the world;
the hue that only has to read as a 24px blob goes on the bird.**

**The beak is the bird's own colour**, which is Gabriel's call against my
recommendation: a white beak was built and he preferred the plain ring.

**Both readout numbers are `--p-amber`, and the light is what separates them** —
the live score glows, the stored best does not. Same distinction the bird makes
when it dies, which is why it is worth having twice.

### What this answers about hub-tile inheritance

`design/TODO.md`'s `redesign-category-accents` noted that chess and Pong each
chose an in-game accent matching their hub tile, independently, and asked whether
Flappy Bird would make it three. **It did not.** Arcade is rose; the bird is cyan.

Rose was built and looked at first, and lost twice over: against a warm world it
crowds, and against any world it is 38° from the coral a dead bird turns — a
resting colour one step from its own state colour, which is no signal at all.
Neither reason has anything to do with what the hub says.

So the pattern is two games out of three, which makes it a tendency and not a
rule. **The generalisation that survives is the weaker one:** a game's accent is
chosen by eye against its own board, and sometimes that lands on the tile's hue.

**Cyan being the puzzle category's hue does not stop it being Flappy's bird**, and
this is the case that settles it: Minesweeper already paints n3 coral and n4 jade
without either meaning lost or won. A guest hue carries its meaning on the hub and
nowhere else.

### Rejected, with the reason

- **Pipes in coral** — a solid slab in `--lose`. It reads as the hazard it is, but
  the bird turns coral when it dies, so the board would be painted in the colour
  of the thing that just happened to you.
- **Amber pipes as dark conduits with rungs**, which is not what shipped. The
  first thing built, and the pipes ended up the brightest thing on the board with
  an amber bird in front of them. Amber won as the world only once the bird went
  cool. **The hue and the treatment are separable and were confused once already.**
- **Pipes in jade** — the palette's own green, and 4° off rose's exact complement,
  which is the pair the colour wheel prefers. Rejected twice over: it reads as
  mint rather than as leaf, and green for the thing that kills you inverts what
  `--win` means everywhere else on the site.
- **A green world at all**, which is what the original Flappy Bird is remembered
  by, and which this board shipped in for a day. The whole of "Six is still six"
  above is that episode. Green is not wrong here — it is the reference the game
  comes with — and it lost to a look Gabriel preferred on the served page. Anyone
  reopening it is reopening a decision, not filling a gap.
- **A rose bird**, above.
- **Cyan against violet, and cyan against jade.** Both cool, 66° and 35° apart.
  Two hues of one temperature go muddy at speed however far apart the wheel says
  they are, and this board found it three separate times — rose against violet as
  well. **Temperature separates before hue angle does.**
- **A true blue bird.** There is no blue in the palette and this ground is why: it
  is a brown-black with almost no blue in it, so a cold blue sits on top of the
  page rather than in it. Cyan, warmed and lightened, is as far that way as the
  site goes.
- **The bird's hue repeated in the chrome** — the score number, the score glyph,
  the bezel brackets and the strap cursor, all following the bird off one
  `--actor` name. Built and dropped: it put a guest hue on the machine, which is
  the one thing "chrome against screen" forbids, and it bought nothing the board
  was not already saying.
- **A white-hot beak.** `--p-hot` is a *state* value in Pong, and spending it on
  permanent furniture starts blurring what it means. Gabriel also preferred the
  plain ring.
- **A solid shape for the dead bird.** Four things changing at once — hue, fill,
  outline and glow — is a stronger signal than hue alone, but on a board that is
  entirely line work a filled ball is a style break. The glow going out carries it.
- **A glow on the pipes that reaches past them.** Clipped to the rectangle
  instead: a pipe that looks wider than it kills is the same defect as a bird that
  does, and this game has now had both.

## Tic Tac Toe: the hash

Chosen by Gabriel on 2026-09-11 from three directions built and played at board
size, then refined on the same page against a panel of live switches. The built
page is `games/tic-tac-toe/`, and that game's own `DESIGN.md` carries the detail;
what belongs here is the part that speaks to the system.

**The board is four lines and nothing else.** No square, no fill, no frame. The
two directions that drew a cell per square — chess's vector grid, once with the
typeface's letters and once with drawn marks — lost because three squares' worth
of boxes reads as a table. Chess keeps its grid because sixty-four squares need
naming; nine do not. **A board this small is drawn, not tabulated.**

**The marks are drawn, and each player owns a hue: X violet, O jade.** A hundred
degrees apart, matched in lightness, neither of them amber. That is the fourth
game to put a guest hue on the board and keep the chrome amber, and the third to
draw what an earlier version typed — the site font's own X and O were built first
and lost, as its chess glyphs did, though for looks rather than for absence.

**A win is said in brightness, never in hue, and this is the general rule the
game found:** where a player's resting colour *is* a state colour, the state has
to be carried by something other than colour. `--win` is jade and jade is O all
game, so the winning three bloom and the rest go half-lit instead. This is the
same rule "What a game may vary" states from the other side — Pong's paddles at
rest in the hue a tell already used deleted the tell — reached here by a game that
could not avoid the collision, only work around it. **A collision that cannot be
avoided is answered by changing something that is not the hue.**

**A struck line through the three was built and rejected**, and the reason is
geometric rather than a matter of taste: on a square board a diagonal win runs at
exactly the angle of one arm of an X, so the line lies along that arm and eats it.
Running the line *behind* the marks with a gap cut round each one fixes it and is
the version to reach for if a line is ever wanted again.

**Grid lines belong above a lit cell.** An empty square lights under the pointer,
and a board whose lines are drawn beneath its squares loses them to that light —
here the middle column vanished as the pointer crossed it. Anything drawn as the
board rather than in it goes above the squares' own backgrounds, and the marks go
above that.

**A hover light on a board of lines is a glow, not a filled cell.** The fill that
prompted the layering above was itself rejected a step later, and for a reason
that generalises past this game: a rectangle needs an edge to land on, and on an
outer square of a board drawn as lines there is none, so it stands outside the
figure as a box in its own right. Where a board has no cells to fill, light it
with something that has no edge.

## Minesweeper: the covered board

Built 2026-09-15 against the real page. The eight numbers were already decided —
"The guest hues" above has the mapping and the reasoning, and this phase only
pointed them at the `--p-*` names. What this phase had to find was everything
around them.

### The board is two fields, and it takes two devices to say so

**A covered cell is a lid above the page; a cleared one is the page itself.**
That division is the entire read of the game, and neither ground nor line
carries it alone at 32px:

- **Ground alone failed.** The lid and the ground were four values apart, which
  is invisible at cell size. A posed board came back unreadable — every empty
  cell looked the same whether it had been cleared or not.
- **Line alone failed too**, in the opposite direction. Erasing the ruling around
  a cleared cell so cleared ground ran together as one smooth field read
  perfectly, and cost the cleared area its grid, which is information a player
  uses.

**So both, and the lid moved to make room.** `#21170b` for the lid, `#32220d`
under the pointer, `#1c1408` for the ruling left over cleared ground against the
board's own `--p-hairline` between covered ones. The lid was `#16100a` in the
board grounds above and this phase moved it; that entry is corrected.

**The grid is the gap.** The board carries the line colour, cells sit on it with
a 1px gutter, and a cell repaints the line around itself when it is cleared.
Cells draw no borders of their own: 81 of them double up along every shared edge,
and a cleared cell cannot then dim its own surround.

### The marks are drawn, and the bomb has no spikes

Chess's precedent, for the reason chess had: VT323 has no such glyph, so an emoji
falls through to the reader's OS font and is the one thing on the page the
palette cannot reach. Same 48 grid, same weight, `data-mark` naming what the
drawing is.

**The hub's own mine icon does not survive the trip down.** It draws eight
radial spikes and reads as a mine at 46px; at cell size they close up into a
sunburst. What says "bomb" at 24px is **a body and a lit fuse**, and no spikes at
all. The flag went solid for the same kind of reason — outlined, its swallowtail
closed into a small box.

**A flag that turned out to be wrong goes dim and gets a strike**, rather than
taking a colour of its own. Coral is the flag's whether the call was right or
not, so the difference is light — the board already spends its one hue on
danger, and a third state would have needed a hue nothing else here uses.

**Coral for both the flag and the mines**, which is the palette's assignment for
the flag and worth extending: a flag is a claim that a mine is there, so the two
agreeing is the point. The mines are held back off full coral so that **the one
you actually hit is the brightest thing on a dead board** — white-hot glyph, a
coral wash and a coral ring. That is this site's standing rule again, from the
side Tic Tac Toe found it: where a resting colour *is* a state colour, the state
is carried by something that is not the hue.

### The gear became sliders, and why a `?` would not do

`design/TODO.md` proposed following the frame, which labels How to play with a
plain `?`. That is taken on this page — How to play is a word here, and the gear
is a second control beside it.

A gear was drawn first and thrown out: **at button size a gear is a ring with
short radial teeth, which is the same drawing as the mine on the board above
it.** One glyph, two meanings, on one page. Sliders collide with nothing.

**The general form, which is worth having:** a glyph that reads at icon size can
stop reading at a third of it, and two glyphs that are distinct at icon size can
converge there. Check a drawing at the size it will actually be used, against
whatever else is on that page at that size.

### Rejected, with the reason

- **Cleared cells with no grid at all.** Built, and it reads better as a
  *picture* — cleared ground as one smooth field is the classic minesweeper
  look. Gabriel asked for the lines back and he is right: the ruling is how you
  count squares along a row, which is most of what the game asks you to do.
- **The HUD glyphs as words.** Not retried — Flappy Bird's phase built words
  against glyphs on a served page and the glyph row won. This follows it.

## Sudoku: the ruled board

Built 2026-09-15 against the real page. The board was already a grid before the
phase; what it was not was legible, because the box lines and the frame were drawn
in `--fg` at 2px. **The cage was brighter than the digits it held.** That is the
thing to carry forward: on a board whose content is text, the ruling is the frame
and the text is the picture, and any weight that inverts the two is wrong however
correct the colour is.

### Three weights, every line drawn once

| Part | Value |
| --- | --- |
| Between cells | 1px `--p-hairline` |
| Between boxes | 2px `--p-rule` |
| Frame | 2px `--p-rule` |
| Given digit | `--fg` |
| Entered digit | `--p-cyan` |
| Clash | `--lose`, on both halves |
| Selected cell | inset 2px `--accent` ring on a 16% amber ground |
| Scan (row, column, box) | 6% amber ground, no line of its own |

**Every cell draws its left and top edge only**, and the board draws the outer
frame. A shared edge is then drawn by one cell rather than by both, which is the
doubling that borders on four sides produce.

**Minesweeper's gutter does not work here, and the reason is worth keeping.**
There the board's own ground shows through a 1px gap and the cells draw nothing —
clean, because every line on that board is the same weight. Sudoku needs two, and
a gutter can only carry one: the heavier box line has to be drawn *beside* the gap
by a cell, so the two land a pixel apart and **every crossing notches**, a short
doubled line at each of the four box intersections. Gabriel spotted it at a glance.
**A gutter carries a grid of one weight; borders carry a grid of two.**

### The scan is a wash with no line of its own

Lighting the selected cell's row, column and box is what the board was missing
rather than a colour question — it is how a player checks where a digit is already
spoken for. Two things were found building it:

- **The wash has to stay well below the line colour.** Raised until the cross read
  strongly, the lit ground came up towards `--p-hairline` and the ruling *inside*
  the cross washed out — which is exactly where a player is counting along a row.
- **Giving each lit cell its own inset ring to restore that ruling is wrong**, and
  is how the notch above was found: two adjacent lit cells then draw a line each
  side of the gap. It is the same doubling in a second costume.

**A given can be selected**, which it could not before: the scan is most useful
from a digit that is already placed. It still takes no digit.

### Rejected, with the reason

- **Givens dim and entries bright, both amber.** What the board did before. Two
  shades of one hue is a weak separation for the board's primary distinction, and
  the palette had already assigned cyan to an entered digit — it had simply never
  been built.
- **A rounded number pad.** It was the last rounded thing on the site, from before
  `.btn` became a terminal key. Squared to match.
- **The `⌫` character on the erase button.** VT323 does not carry it, so it fell
  through to the reader's OS font at 3.5x the width of a digit. Drawn instead, on
  the hub's 48 grid at the hub's weight — the same answer chess, Minesweeper and
  Flappy Bird reached for their own glyphs.

## How the tokens are layered

`shared.css` already owns nine token names — `--bg`, `--fg`, `--card-bg`,
`--cell-bg`, `--cell-border`, `--accent`, `--win`, `--lose`, `--muted`. The
redesign **changes their values and never their names**, and puts a layer of raw
palette values underneath them:

```css
:root {
  --p-<name>: #......;   /* the palette: raw values, named for what they are */
  --bg: var(--p-<name>); /* the contract: named for what it does */
}
```

This is not tidiness. `games/pong/script.js` and `games/flappy-bird/script.js`
read tokens **by name at runtime**, and each lookup falls back to a hardcoded hex
of the *old* palette when the name is missing. So renaming a token breaks nothing
loudly: the canvas quietly carries on painting the design that was replaced,
every test still passes, and nobody finds out until they look at the game.

Flappy Bird reads `--lose` and `--bg`, plus three raw palette values —
`--p-amber`, `--p-hot` and `--p-cyan`. Pong reads `--fg`, `--accent`,
`--cell-border` and `--muted`, plus four — `--p-rose`, `--p-coral`, `--p-hot`
and `--p-rule`.

Those raw names are the "what a game may vary" rule below in practice: a paddle
is not an outcome and neither is a pipe, so neither reads an outcome token, and
the price is that six `--p-*` names are load-bearing for a canvas as well as
for a stylesheet. **`--lose` is the one contract token either canvas still reads,
and both read it for the same thing — the moment you lost.**

Change a name only by changing that script in the same commit, fallback included.

The layer underneath is what lets a phase restyle one game while the five it has
not reached yet keep rendering correctly.

**The raw names actually used, in `shared.css`:** `--p-ground`, `--p-panel`,
`--p-panel-lit`, `--p-hairline`, `--p-rule`, `--p-dim`, `--p-soft`, `--p-amber`,
`--p-pale`, `--p-hot`, `--p-desc` and `--p-cell` for the amber ramp; `--p-cyan`,
`--p-jade`, `--p-lime`, `--p-coral`, `--p-rose` and `--p-violet` for
the six guest hues — one name per row of "The palette" tables above, so a later
phase can read a value this doc describes without re-deriving a name for it.
`--bloom` and `--bloom-lg` sit alongside them as the two amber text-shadow recipes
"Chrome, as built" uses for the wordmark and the active nav link.

Neither canvas game is confined to the nine contract names any more — both read
`--p-*` values directly, listed above. The `--p-*` names and the two bloom
shadows are equally free for any stylesheet to use; `hub.css` does, for
everything in "The hub" that is not one of the nine (`--p-hairline` for rules,
`--p-dim`/`--p-pale`/`--p-hot` for nav and wordmark states, `--p-desc` for tile
descriptions, `--p-jade`/`--p-cyan`/`--p-rose` for the three category accents).

## Dark only

One palette. `prefers-color-scheme` comes out of `shared.css`, and the light half
of every theme-aware branch in the games goes with it. Gabriel's decision,
2026-09-04.

**Two theme-flip assertions in `tests/pong.test.js` died with it, and only one of
them would have said so.** Case 13 asserted that the canvas palette *changed*
when the OS theme flipped, which the decision makes false; it announced itself by
going red, and now asserts the opposite — "the canvas palette is dark-only,
regardless of the OS theme". Case 28 was the dangerous one. It looped both
schemes with `emulateMedia` and checked that the bolt's core read against the
board in each, and with one theme it would have run the identical check twice and
**stayed green while testing nothing**. It is collapsed to a single theme with
the measurement kept, because the claim worth protecting survives the decision:
the core stays visible against whatever the board now is. `colorScheme` appears
nowhere outside that file, so those two were the whole of it.

**Still open:** `boltCore()` in `games/pong/script.js` picks the lightning bolt's
core colour from the board's luminance, which existed only because the light
theme's board was pure white. One branch of it is now dead, and what replaces it
is undecided — `games/pong/TODO.md`, `pong-bolt-core-dead-branch`.

## What a game may vary

**Pong owns its player and opponent colours locally.** An earlier proposal made a
player/opponent accent pair site-wide; that over-generalises one game's idea and
is rejected. `--win` and `--lose` stay *outcome* colours — a solved Sudoku, a
tripped mine — and Pong stops reading them for its paddles.

**Flappy Bird owns its bird and world colours the same way**, and for the same
reason: a pipe is a hazard rather than a defeat. It read `--win` for the pipes and
`--lose` for the beak before this phase, which is decoration wearing outcome
colours, and is what that rule exists to stop.

**The rule underneath both, stated once:** a resting colour cannot be a state
colour **or a neighbour of one**. Pong found the identity half — paddles at rest
in the hue a tell already used deleted the tell. Flappy found the proximity half:
a rose bird turning coral is 38° of change, which is not a signal. Where the hues
have to be close, make something other than the hue change as well.

## Rejected, with the reason

**A white scanline overlay on a near-black ground.** The agreed mockup draws the
CRT texture as a 1px white line at 3.5% opacity every 3px, blended `overlay`.
Reproduced at full size it is invisible, and the reason is physical rather than a
matter of taste: a scanline is the dark *gap* between lines, not the line. On a
near-black page a white stripe has nothing to lighten, so it does nothing.

Drawing the gap instead — a dark line at low opacity every 3px, no blend mode —
modulates the bright text and the glow, which is where the effect is actually
visible. That is what the preview gallery implements, at four strengths, so the
question of how far the texture reaches can be answered by looking rather than
by arguing.

## What the preview phase measured

Eleven directions were built as complete hub compositions, each carrying a
sample of a Sudoku fragment, Minesweeper's eight numbers and a Pong scorebar,
because the hub flatters any palette and a board you have to read does not.
These are the findings that outlive whichever direction is chosen.

**VT323 carries less colour than the contrast maths says.** Its strokes are one
pixel at normal reading sizes, so a colour that clears 4.5:1 as a solid glyph
can still vanish into the ground when set in this face. The usable bottom of any
ramp is about two steps higher than the numbers suggest. Check a colour by
looking at it *set in VT323 at its real size*, not by computing it.

**Heavy CRT texture is not viable behind a dense board.** At the heavy setting
the texture's dark line every 3.5px cuts two bands through every Minesweeper
glyph, and saturated mid-tones break into fragments. The only fix found was
cells about 35% larger with a double glow, so the bloom refills the gap the way
a real phosphor does. That works on a ten-cell sample and cannot work on a
16×30 board. **At "as mocked" and below the same digits are fine.** So the
texture is a question of degree rather than of yes or no, and the ceiling is set
by Minesweeper rather than by taste.

**Chrome and other transparent-fill text takes `filter: drop-shadow`, never
`text-shadow`.** With `-webkit-text-fill-color: transparent` a text shadow is
drawn *through* the glyph rather than behind it, and a gradient fill turns to
mud.

**A guest hue has to be warmed toward the ground it lands on.** Amber Arcade
took Cold Terminal's and Vector Neon's accents and none of them survived the
move unchanged: `#3fd4ff` on the brown-black `#0a0704` reads as a hole punched
through to a different site, because a 100%-blue cyan has nothing in common with
a ground whose blue channel is almost gone. Every value moved a few points of
red and green and a step lighter — `#6fdcf2`, `#5fd9a0`, `#ff7fcb`. The rule
generalises past this palette: **an accent borrowed from a direction with a
different ground is a starting point, not a value.**

**Eight hues remove the need for a second device.** A single-hue palette gets
five or six distinguishable steps and the remaining two or three need a mark
rather than another colour — an underline, an inverted cell, a border; five
independent attempts converged on that. With six guest hues plus the home hue
plus one neutral, Amber Arcade's eight numbers need no mark at all, and the two
rarest digits stop costing the player a decode. That is the clearest single thing
the colour buys, and it is what made Minesweeper's eight a recolour rather than
a hue-plus-marks problem — see "Minesweeper: the covered board" above.

Measured rather than eyeballed, because at *as mocked* the texture is too subtle
to judge from a screenshot: a scanline makes a column of pixels oscillate row to
row, so the mean absolute row-to-row difference down one column separates
textured from flat. Probe a region known to be textured as a control, or a zero
reading cannot be told from a broken probe.

## Where the exploration is kept

`design/archive/2026-09-04-retro-interface-directions.html` is the **thirteen**
directions built for the first phase, as **one self-contained file**: every
stylesheet, the gallery and all twenty-nine typefaces embedded as base64, so it
makes no network request and needs nothing beside it. Hand the single path to
anyone, offline, and they see what is described here. That is why it is 880K.
It opens on a reference sheet giving each direction's palette, typefaces, scale
and eight-number solution.

The filename keeps the 2026-09-04 date even though two of the thirteen were built
on the 6th: the date names the round, and Gabriel was given that path to keep.

**Settled 2026-09-07: the archive is append-only.** Gabriel's rule — do not modify
a file already in `design/archive/`. A finished look worth keeping goes in a
**new** dated file beside it. So a rebuild is only ever for correcting a file that
was generated wrong.

**The generator was deliberately not committed, so this sentence is the only copy
of it:** inline `design/previews/` — gallery, stylesheets, markup, script — in the
order `index.html` links them, rewrite the two `@font-face` `url()`s to the CDN,
and set `window.__START__` so it opens on the reference sheet. The check that a
rebuild was done right is that regenerating from *unchanged* sources reproduces
the existing file byte for byte.

Two things a rebuild must not lose:

- **`<meta charset="utf-8">` on the first line, and it is load-bearing.** With no
  charset the browser sniffs the first ~1KB. The earlier CDN build got UTF-8 by
  luck, from a comment full of em dashes; embedding the fonts pushes every
  non-ASCII byte past the sniff window, the sniffer sees only base64 ASCII, falls
  back to windows-1252, and every `·` `—` `★` `▶` becomes mojibake. It showed up
  as one wordmark rendering `GABEÂ·SD ARCADE` and as nothing else — one visible
  symptom for a fault affecting the whole file.
- **Parity is checked on text metrics, not on screenshots.** PNG bytes are not
  pixels and several directions animate a cursor or a glare band, so image
  equality is the wrong bar and will never hold. Measure the wordmark, a tile
  name, the strap and the selected name in all thirteen: a swapped typeface moves
  every one, a blinking cursor moves none.

`design/archive/` is deliberately separate from `design/previews/`, which is
throwaway working source. The archive is not, because a palette is reusable long
after the project that produced it.

The site itself self-hosts from `assets/fonts/` and embeds nothing — a data URI in
`shared.css` would put 400K of base64 in front of first paint on every page. The
embedding is the archive's alone.

## How the look gets checked

`ART-DIRECTOR.md` has the rule that matters: the suite is a regression net and
Gabriel's eye is the oracle. This is the mechanical part underneath it.

**An agent working on this repo can see the pages it builds.** A headless
screenshot works here and is a different thing from the X11-root capture that
does not — `CLAUDE.md`'s machine-specific section says why, and `tests/README.md`
has the working invocation and the two ways it misleads you. Not repeated here:
one copy of a fact is worth more than two that can disagree.

What belongs in this file is what it means for design work. **Use it, and use it
in a loop.** Every one of the thirteen directions needed four or five
write-look-fix rounds before it was any good, and what the loop caught was never
subtle once seen — it was invisible in a diff and obvious in one glance.

The corollary matters as much. A screenshot is not Gabriel looking at a served
page, and it does not shorten that step — it only means he is not the first
person to see an obvious mistake.
