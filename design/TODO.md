# TODO — the site's visual design

Open visual work: the look of the hub, the shell and the games, rather than how any
of them plays. It belongs to the art director — see `ART-DIRECTOR.md`. The design
itself is recorded in `design/DESIGN.md`.

Same conventions as every other backlog here. Entries are headed by a slug, which is
also the branch name, so one string finds the entry, the discussion and the
implementation. Entries are in priority order within a section, and are **deleted as
they land** rather than marked done — `tests/docs-check.js` fails an entry that has a
merge commit behind it.

**If you are a worker, this is not your backlog — but it is where you file.** A
game's visual gaps belong here rather than in `games/<name>/TODO.md`, because the look
is one system and fixing it a game at a time is what produced the look being replaced.
Appending an entry is allowed and wanted; taking one is not.

Everything below is cut from `main` — the redesign's integration branch merged and the
ref is gone. An entry cut from anything else says so on its own line: visual work
sometimes runs on an integration branch, and `INTEGRATOR.md` describes how that works.

---

# The redesign

A complete visual overhaul: the current look is a low-effort first draft and none of
it is owed deference. The target is a dark CRT-phosphor arcade terminal — see
`design/mockups/` for what was agreed.

What was decided before the first phase is now built and described in
`design/DESIGN.md` — the dark-only palette, the self-hosted VT323, the token layering,
Pong's local colours, the hub's category accents. One of those decisions is still
live rather than history:

- **Verification is Gabriel looking at a served page**, and he is asked at the start
  of a phase whether he wants a preview or wants it built. The full version is in
  `ART-DIRECTOR.md`.

## Phases

Each is one session, one branch, one merge. **Gabriel confirmed on 2026-09-08 that all
four run.** His words: the redesign is playable and about 90% done, but not finished —
each of the four remaining games still needs its visual pass. The overhaul landed on
`main` on 2026-09-07 with the hub, the shell, chess and Pong redesigned and the other
four framed but not restyled inside.

**Flappy Bird's phase landed on 2026-09-10, Tic Tac Toe's on 2026-09-11 and
Minesweeper's on 2026-09-15**, leaving Sudoku below.

**The frame has landed** — breadcrumb, title, strap, scanlines, footer and the
shared `#instructions` panel are in place and covered by
`tests/contract.test.js`. What is left is the inside of the board.

### redesign-emoji-glyphs — The emoji, which are the last off-palette thing

Colour emoji are rendered by the OS font, not by ours, so they ignore the palette
entirely and are the most visible remaining break in the look. **Minesweeper's phase
took its whole share on 2026-09-15**, and this is everything left:

Re-swept on 2026-09-15 across every served `.html`, `.js` and `.css` outside
`tests/` and `design/`, by codepoint rather than by grepping for glyphs already
known about:

| Game | Where | Glyphs |
| --- | --- | --- |
| **every game** | the breadcrumb | `←` ×6, one per game page |
| pong | status line and the menu | `🎉` ×2 |
| pong | Play button, panel, footer | `▶`, `↑`/`↓` ×2 |
| sudoku | status line | `🎉` |

Flappy Bird's, Tic Tac Toe's and Minesweeper's emoji are all gone, each taken by
that game's own phase, and **Sudoku's `⌫` went with its own on 2026-09-15** — the
button carries a drawn glyph now and the panel line says "the erase key". The hub
and the About page have none.

**The breadcrumb `←` is the one to notice**, and it had never been counted: it is
on six pages rather than one, it is the most-seen glyph in the set, and it is the
*frame's* rather than any game's — so unlike everything else here it cannot be
taken by a game's phase. It is a substituted face like the rest; `M`, `W` and `i`
measure 8.8px in VT323 and `↑` measures 11px, and `←` is from the same block the
typeface does not carry.

**Two kinds of problem, and the table does not separate them.** The `🎉` are a tone
choice; everything else is a glyph the typeface does not have — "The arrows and the
other substituted glyphs" below is that half, and it needs wording from Gabriel.
Read both before closing this entry: an earlier version of this table listed the
`🎉` alone under "what is left", which would have let a later session close it with
eleven substituted glyphs still on the site.

**The three `🎉` are a tone choice in a win message, not a palette
problem**, and they sit in `#status` text. Minesweeper's phase asked and Gabriel
handed the call over; its three were dropped, and the message needed no rewording to
lose them. That is a precedent for the other three rather than a decision about them
— **the words on a page are Gabriel's**, so ask before touching a sentence rather
than a character.

**Pong is the one to notice.** It went through a full redesign phase and kept two of
them, which is why this is one entry rather than a line in each game's.

### What the finished phases settled

Nothing here is open any more; it is recorded so a later session does not re-decide it.

- **A HUD readout** is a drawn stroke glyph on a 48 grid at the hub's icon weight,
  `aria-hidden`, plus the word it stands for as off-screen text, plus the number.
  Flappy Bird's phase built words against glyphs on a served page and the glyph row
  won; Minesweeper's followed it.
- **A game's content** — Minesweeper's mine and flag — is drawn SVG on the same grid,
  carrying `data-mark` so a test can name it. Chess's pieces are the precedent.
  A drawing that reads at icon size may not read at a third of it: the hub's spiked
  mine became a sunburst in a cell, and the fix was a body and a fuse.
- **A control's icon** is drawn too, and is checked against whatever else is on the
  page at that size. A gear and a mine are the same ring-with-teeth at button size,
  which is why Minesweeper's advanced button is sliders.

### The arrows and the other substituted glyphs

**Flappy Bird's are done** — its panel and footer now say "Up arrow" in words,
Gabriel's call on 2026-09-15. **Sudoku's is done too**, and it settled the general
case: a glyph on a *button* is drawn rather than reworded. Its erase key carries an
SVG backspace on the hub's 48 grid, at the hub's weight, which is the answer chess,
Minesweeper and Flappy Bird already reached for their own drawings. Only the panel
line needed words, and "the erase key" was enough. Two sets are left:

- **Pong** says `W/S or ↑/↓` twice, which has no short rewrite. Its `▶` is on the
  Play button and is Sudoku's case exactly — draw it; the arrows in the sentence
  are the part that needs wording.
- **The breadcrumb `←`**, on all six game pages. Hardest despite being one
  character: it is the frame's, it is decoration rather than an instruction, and
  dropping it may simply be right where the sentence needs words.

VT323 has no arrows: it is monospace, so every glyph it really has measures the same
width, and measured on a served page at 22px on 2026-09-10, `M`, `W` and `i` are
8.8px each while `↑` and `↓` are 11px, `▶` is 16.92px and `⌫` is 31.11px. Four widths
means four faces — the browser is falling back for every one. `▶` is on Pong's Play
button and is the same problem in a third shape.

**`shared.css` says otherwise and is not lying.** Its `@font-face` `unicode-range`
lists U+2191 and U+2193, which is Google's subsetting metadata for the file rather
than a promise the glyph is in it. The range decides whether the font is consulted;
if the glyph is missing the browser falls back anyway. Do not take that line as
evidence a character is covered — measure it.

The fix is a wording change, and those words are Gabriel's — which is the whole of why
this entry outlives the game phases. Ask him for the wording rather than picking one.

**If the table is edited, sweep for non-ASCII across pages *and* scripts** rather than
grepping for the glyphs already known about. It was counted the narrow way once and
came out three kinds short: a screenshot cannot show a win message that has not fired.

### redesign-category-accents — Decide whether colour by category stays

Not work yet — a decision to take with Gabriel once the hub and every game have been
seen in the new palette. The broader palette is wanted; assigning a fixed colour per
category is what is unsettled, along with whether categories exist as a visible idea at
all. Filter chips and idea tiles were dropped for this project and can be reconsidered
here.

**One half of this now has an answer, and it is no.** Whether a game's in-game
accent inherits from its hub tile: chess and Pong each said yes independently —
chess's black army is the strategy tile's jade, Pong's player is the arcade tile's
rose — and **Flappy Bird said no**. Its tile is arcade rose; its bird is cyan.
Rose was built and looked at first, and lost for reasons particular to that board;
`design/DESIGN.md`, "What this answers about hub-tile inheritance", has them.

**Tic Tac Toe is the fourth, and it splits.** Its O is the strategy tile's jade,
its X is violet, which belongs to no tile — one board carrying both answers at
once. It went that way for contrast between the two players rather than out of
any view about the hub, which is itself worth knowing: a game with two actors
cannot inherit one tile colour for both.

Two out of three is a tendency, not a rule. What is left to decide here is
narrower than it was: whether categories are a visible idea at all, and whether the
hub keeps a fixed colour per category — not whether games are obliged to match.

Close this entry by writing the answer into `design/DESIGN.md`, whichever way it goes.
