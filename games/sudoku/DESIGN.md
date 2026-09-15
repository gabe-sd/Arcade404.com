# Sudoku: what a reader must not break

**Sudoku** (`games/sudoku/script.js`) ships as a small fixed set of puzzles
rather than generating them on the fly. That single choice is what keeps the
rest of this simple: `script.js` itself never needs a solver or a
uniqueness-checker — see "Puzzle data" below for where that logic actually
lives, and for how the set was produced.

"Is this cell wrong" is real Sudoku legality — a filled editable cell is wrong
if its digit duplicates another cell's digit in the same row, column, or 3x3
box, checked against that cell's ~20 peers. **Comparison against the bundled
solution was considered and rejected**: it only agrees with legality-checking
on a *complete* grid, where uniqueness guarantees the two are the same grid. On
a partial fill they diverge — a digit can be legal (no conflict yet) but still
not the solution's digit for that cell, so comparing to the solution would flag
it wrong immediately. That turns the game into a guess-checker: try 1-9 in a
cell and keep whichever doesn't turn red, no deduction required. Legality-
checking is barely more code and is what makes it Sudoku.

Win, unlike the per-cell check, *is* a valid use of uniqueness: every cell
filled with no conflicts anywhere is enough, because a unique-solution puzzle
has only one conflict-free complete grid — no need to compare against
`solution` there either.

## Model

- `PUZZLES`: an array of `{ givens, solution }`, both 9x9 grids of 0-9 (0 =
  blank in `givens`). `givens` is what's shown on load and after Restart.
  `solution` is bundled but not read by any runtime check below — it exists so
  puzzle data can be verified once, in tests (see "Puzzle data"), and so a
  future hint feature has somewhere to read a correct digit from.
- `grid`: the live 9x9 state of what the player has entered — starts as a copy
  of the current puzzle's `givens`.
- A cell is either **given** (non-zero in `givens`, not editable) or
  **editable** (zero in `givens`, player-fillable).
- Selecting an editable cell, then typing a digit 1-9 (keyboard) or clicking a
  `#number-pad` button, fills it; Backspace/Delete or an eraser button clears
  it. Given cells ignore all of this.
- **Any cell can be selected, a given included.** A given takes no digit —
  `placeDigit()` guards that separately — but selecting one lights its scan,
  which is how you check where a digit is already spoken for. `selectCell()`
  refused a given outright until the redesign phase.
- **Selecting a cell marks its peers** with `peer`, which the stylesheet lights
  as the row, column and box the selection is constrained by. One pass over the
  board in `renderSelection()`, against a set built once from `peers()`.
- A filled editable cell whose digit duplicates another cell's digit in the
  same row, column, or 3x3 box is marked wrong, live as it's typed — checks
  that cell's ~20 peers, no board-wide scan.
- **Both halves of a clash are marked.** `conflicts()` is symmetric, so a
  duplicate pair is two wrong cells; `placeDigit()` re-renders the peers of the
  cell it changed as well as the cell itself, or the older half of every pair
  goes unmarked and a player who clears the red one is left looking at a board
  that appears clean and is not. Clearing is the same call with digit 0, so it
  un-marks the survivor by the same path. A given never carries the mark either
  way.
- Win: every editable cell is filled and no cell conflicts with any peer.
- Restart re-copies the current puzzle's `givens` into `grid`. New puzzle picks
  a different entry from `PUZZLES` and does the same. Both go through
  `loadPuzzle()`, so both overwrite the saved progress below with the fresh
  blank grid — see "Saved progress" for why that's guarded.

## Not in v1

Decided against for a first version, each because it would add real complexity
to a game meant to stay very simple — not ruled out permanently, just not yet
earned:

- **On-the-fly generation.** Needs a backtracking solver plus a uniqueness
  check while digging holes — real logic, not wiring, and it would have to run
  in `script.js` itself. A fixed set moves that logic to a one-time offline or
  test-time check instead (see "Puzzle data").
- **Difficulty tiers.** With a fixed set there's no generator parameter to hang
  a tier on; New puzzle just moves through the set. Could group the set into
  tiers by given-count later without touching the model above.
- **Pencil marks, undo/redo, a hint button, a timer.** None of these change the
  model above; each is an independent addition layered on top if ever wanted.

## Puzzle data

Each entry in `PUZZLES` must be a legal, complete `solution` (every row,
column, and box a permutation of 1-9) whose `givens` is consistent with it and
has exactly one solution. None of that is checked at runtime — checking it
there is exactly the generator complexity this design avoids. Instead
`tests/sudoku-puzzles.test.js` runs a solver once per puzzle at test time and
fails if any bundled puzzle is malformed or non-unique. That test is the only
place in this game a Sudoku solver exists.

All 23 puzzles were produced by a one-off Node script — random full-grid
backtracking for a fresh `solution` each time, then digging cells out while a
solver confirmed uniqueness stayed at exactly one, keeping only puzzles with
at least 24 givens and discarding any that duplicated an existing one. That
script was not kept; it lived outside this repo for one run and its output is
only these puzzle entries. A generator bug in it could in principle have
produced a malformed or non-unique puzzle despite passing locally — which is
exactly what `tests/sudoku-puzzles.test.js` exists to catch before it can
reach `main`, machine-generated puzzle data included, not only hand-authored
typos. Whoever adds puzzle 24 either writes a similar throwaway generator or
hand-picks one; either way, run it through that test before it lands.

The first 3 puzzles were originally hand-picked instead: three shifts of one
formula grid (row *r* = row 0 rotated by a fixed offset per row), dug down by
hand. A playtester caught it immediately — "the bot literally placed 1-9 in
each row, but shifted" — because once you see the rotation in one row, every
other row is readable off it without ever touching Sudoku logic. Legal by the
uniqueness check (nothing above requires a grid to be *hard*, only correct),
but not what "puzzle" means to a player. They were replaced with generator
output; see "What makes a puzzle good" below for the guideline this became.

## What makes a puzzle good

Legal and unique is necessary but not sufficient — the formula-grid puzzles
above were both, and still weren't Sudoku to play. Everything in `PUZZLES`
must also clear these, checked in `tests/sudoku-puzzles.test.js`:

- **No formula grid.** A `solution` where one row is a cyclic rotation of
  another lets a player read the whole grid off a single row with no
  deduction — that's the defect above, generalized past the exact rotation
  offsets it used. **Do not work out how likely that is from first
  principles.** Two attempts here did, and both were wrong, in opposite
  directions. The first put it at 9-in-362880 per row pair — a row is one of 9!
  permutations, 9 of which are rotations of any given row — and concluded a hit
  meant a bad generator. The second corrected it by generalising from one
  observation, the old puzzle 22 being 1 of the 20 grids the generator
  produced, and called the rate 1 in 20.

  It was measured instead, over 200,000 grids built the way the generator built
  these (full-grid backtracking, candidate order shuffled at every cell): **1
  row pair in 5,248 is a rotation, and 0.68% of grids — about 1 in 146 —
  contain at least one.** Rotations are therefore ~7.7x more likely than
  permutation-counting predicts, because a cyclic rotation never repeats a
  value in a column and so satisfies the column constraint for free. And one
  hit in a 20-grid run is ordinary luck, not a broken generator. Reroll when
  the check fires. The measuring script was a one-off and was not kept, as the
  generator was not; the method above is the whole of it. Checked by
  `tests/sudoku-puzzles.test.js`.
- **At least 24 givens** (the uniqueness floor is 17; this repo's bar is
  higher so a puzzle has room to start without immediately forcing a long
  forced-chain deduction). Checked by `tests/sudoku-puzzles.test.js`, which
  also keeps the absolute 17-given floor as a structural sanity check
  independent of this repo's stricter bar.
- **Every row, every column, and every 3x3 box has at least one given.**
  A row with zero clues is what "give enough clues to begin with so numbers
  can be placed" (the same playtester feedback) is pointing at directly —
  nowhere in that row to even start. Box coverage was added after a deeper
  audit past this same feedback found three shipped puzzles with an empty
  box despite passing the row/column check — legal, unique, and still a
  region with nothing to go on. Checked by `tests/sudoku-puzzles.test.js`.
- **Exactly one solution**, already covered above.

None of this is a difficulty tier — see "Not in v1" above. It's a floor on
board *content*, orthogonal to how hard a legally-unique puzzle is to solve.

## Saved progress

The grid survives a reload, following Minesweeper's wrapped-`localStorage`
pattern (its own `DESIGN.md`) rather than an unguarded call — every access
degrades to "nothing saved" instead of throwing. `puzzleIndex` and `grid` are
saved on every `placeDigit()` and restored on load via `restoreProgress()`,
which re-derives `gameOver`/won/wrong state by running the normal `checkWin()`
over the restored grid rather than trusting anything that was saved — a stale
or hand-edited save can't fake a win. A save whose grid disagrees with its
puzzle's current `givens` (for instance if `PUZZLES` changes between visits)
is discarded outright rather than partially applied.

`renderCell()` is why that restore works with no special-casing: `given`,
`wrong`, and `won` are all recomputed from live state on every render rather
than set once and left to go stale, so any path that ends in `renderBoard()`
— loading, restoring, restarting — repaints all three correctly on its own.

Restart and New puzzle both discard the saved grid (they run `loadPuzzle()`,
which overwrites it with a fresh blank copy), so both are two-step: a first
click arms the button — label flips to "Sure? Click to confirm", styled like
Minesweeper's Reset best time — and a second click within `CONFIRM_WINDOW_MS`
carries it out.
Armed state is per-button but mutually exclusive (arming one disarms the
other), lapses after the window, and is dropped the moment a digit is placed,
since continuing to play is a clearer "no" than any timeout. Skipped entirely
when the board is untouched (`grid` already equals `givens`) — that case
still resets in one click, same as before saving existed. A solved board
still counts as progress worth confirming: nothing about the guard changes
once `gameOver` is true, so admiring a just-finished grid doesn't mean losing
it to a stray click.

## Page ids

On top of the shared `#board`, `#status` and `#restart` from `CLAUDE.md`'s page
contract: `#number-pad` (digit buttons 1-9 plus an eraser), `#new-puzzle`
(swaps to a different entry in `PUZZLES` — distinct from `#restart`, which
re-blanks the current one), and `#help-toggle`/`#instructions` (the standard
collapsible how-to-play panel described in `CLAUDE.md`'s page contract).

## Stored data

`sudoku.progress` — `{ puzzleIndex, grid }` as JSON, the player's current
puzzle and fill. See "Saved progress" above for when it's written, restored,
and discarded.
