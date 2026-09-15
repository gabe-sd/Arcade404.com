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

**Flappy Bird's phase landed on 2026-09-10 and Tic Tac Toe's on 2026-09-11**,
leaving the two below.

**For both: the frame has landed** — breadcrumb, title, strap, scanlines, footer
and the shared `#instructions` panel are in place and covered by
`tests/contract.test.js`. What is left in each is the inside of the board.

### redesign-minesweeper — Minesweeper

Mostly `style.css`. The one real piece of work is `.n1` through `.n8`, eight hardcoded
number colours that are the only place in the site with a palette of their own.

All eight were forced onto a real board and read: they are legible on the phosphor
ground, and the only thing wrong with them is that they are the *old* palette. So this
is a recolour, not a legibility rescue. What makes it non-trivial is keeping the eight
apart from **each other** on a near-black ground, without any of them reading as the
amber the rest of the site uses for ordinary text.

### redesign-sudoku — Sudoku

`style.css` only. The grid's box borders are drawn with `--fg` and the selected cell
with `color-mix()` on `--accent`; both want checking against the new values rather than
assuming they carry over.

### redesign-emoji-glyphs — The emoji, which are the last off-palette thing

Colour emoji are rendered by the OS font, not by ours, so they ignore the palette
entirely and are the most visible remaining break in the look. Counted on `main` at
946f476 by sweeping every served page and script for non-ASCII, which is the only
method that finds a glyph living in a string that has not fired yet:

| Game | Where | Glyphs |
| --- | --- | --- |
| minesweeper | HUD, board, settings button, win message | `🚩` `⏱` `🏆`, `💣` `🚩` as cell content, `⚙` on the settings button, `🎉` ×3 |
| pong | status line and the menu | `🎉` ×2 |
| sudoku | status line | `🎉` |

Flappy Bird's `🐦` and `🏆` are gone — `redesign-flappy-bird` took its own share.

Chess, Tic Tac Toe and the hub have none.

Four problems wearing one costume, and they do not have one answer:

- **The HUD glyphs** are labels — flags left, time, best. VT323 has no icons, so
  replacing them means a word, an abbreviation or a drawn glyph.
- **`⚙` is a control's icon**, which is neither of the above. The frame already does
  this job without an emoji: Pong and Flappy Bird label How to play with a plain `?`.
- **Minesweeper's `💣` and `🚩` are the game's content**, not decoration. They are what
  a cell *is*. Chess solved the same problem by drawing its pieces rather than typing
  them — `games/chess/DESIGN.md` is the precedent worth reading first.
- **The six `🎉`** are a tone choice in a win message, not a palette problem. Whether
  the site wants to sound like that is Gabriel's call, and they are in `#status` text.

**All four were checked, and none of them are fine.** VT323 is monospace, so every
glyph it actually has measures the same width. Measured on a served page at 22px on
2026-09-10: `M`, `W` and `i` are 8.8px each; `↑` and `↓` are 11px, `▶` is 16.92px
and `⌫` is 31.11px. Four different widths means four different faces — the browser
is falling back for every one of them, and at 4x the arrow's strokes are visibly
thinner than the letters either side of it.

**`shared.css` says otherwise and is not lying.** Its `@font-face` `unicode-range`
lists U+2191 and U+2193, which is Google's subsetting metadata for the file rather
than a promise the glyph is in it. The range decides whether the font is consulted;
if the glyph is missing the browser falls back anyway. Do not take that line as
evidence a character is covered — measure it.

The fix is a wording change — "Space, ↑ or W" becoming words — and **the words on
that panel are Gabriel's**, so this needs asking rather than deciding. It stays
here rather than being folded into a game's phase for that reason.

**Pong is the one to notice.** It went through a full redesign phase and kept two
`🎉`, which says a game's own phase will not necessarily catch these. Hence one entry
across all four rather than a line in each.

**`🏆` was the one exception to "each takes its own share" below, and the
convention is now set.** It was in both Flappy Bird's and Minesweeper's HUD, so
the two phases needed one answer. Flappy Bird's phase decided it: **a HUD readout
is a drawn stroke glyph on a 48 grid at the hub's icon weight, `aria-hidden`, plus
the word it stands for as off-screen text, plus the number.** Not a word on its
own — words were built and set against glyphs on a served page, and the glyph row
won. Minesweeper's phase follows that for `🚩` `⏱` `🏆`; its `💣` and `🚩` as cell
*content* are a different problem and chess is still the precedent there.

**If the list is edited, sweep for non-ASCII across pages *and* scripts** rather than
grepping for the glyphs already known about. It was counted the narrow way once and
came out three kinds short: a screenshot cannot show a win message that has not fired.

The four game phases run, so each takes its own game's share and this shrinks to
whatever is left over.

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
