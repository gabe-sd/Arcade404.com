# Sudoku TODO

Known gaps and unscheduled work for this game. Not a changelog — delete
entries as they land. See the root `TODO.md` for the naming rules.

### sudoku-save-reliability — A player reports their game sometimes does not save

**Reported by a player to Gabriel, 2026-09-15.** Not yet reproduced, and the
first job is reproducing it rather than fixing anything.

Saving is `saveProgress()` in `games/sudoku/script.js`, called from
`placeDigit()`, `loadPuzzle()` and `restoreProgress()`; loading is
`loadProgress()`, called once from `init()`. The stored key is
`sudoku.progress`, `{ puzzleIndex, grid }` as JSON — see `DESIGN.md`'s "Stored
data". `tests/sudoku-progress.test.js` covers it today, so whatever is wrong is
something that suite does not look at.

Two shapes the report could take, and they need telling apart before anything is
changed:

- **The write never happens.** `saveProgress()` swallows every exception on
  purpose, so a quota error or blocked site data is indistinguishable from
  success from inside the game. Nothing in the page reports it.
- **The write happens and the read throws it away.** `isValidProgress()` returns
  false — and `loadProgress()` then returns `null`, which `init()` treats as
  "nothing saved" and starts a fresh puzzle — whenever the saved grid disagrees
  with `PUZZLES[puzzleIndex].givens`. That check exists so a stale save cannot
  restore digits into cells the puzzle never gave, and it is right to exist. But
  it means **any change to the puzzle set silently discards every save in
  flight**, and to the player that looks exactly like "it did not save". That is
  the first hypothesis to test, because the set has been edited before.

What to do: characterise before changing anything, per `CLAUDE.md`. Write tests
for what the save system does now across the messy cases the current suite
skips — a reload mid-puzzle, a completed puzzle, a puzzle set that changed under
a save, a `setItem` that throws, a quota that fills, a save written by an older
version of the page, two tabs open on the same game. Whichever one fails is the
report.

Ask Gabriel for the player's browser and whether it was a private window before
guessing — that alone rules out or in the whole first shape.

### sudoku-famous-puzzles-mode — A mode built on curated, named puzzles

The bundled set in `games/sudoku/script.js` — 23 puzzles as of writing — is
procedurally generated and quality-checked against `DESIGN.md`'s "What makes a
puzzle good" — deliberately, so there's no attribution or manual-verification
burden. That rules out puzzles that are famous *because of who made them or
what record they hold* — Arto Inkala's "AI Escargot" and world's-hardest
puzzles, the "Everest" and "Golden Nugget" grids, and so on. Those only work
as a named, curated set: each hand-sourced, each still run through
`tests/sudoku-puzzles.test.js` for legality and uniqueness (that check is
generator-agnostic), but the source and name kept alongside the entry
instead of being anonymous.

Likely its own mode alongside "New puzzle" — cycling through 5-10 named
puzzles rather than folding them into the 100 — since mixing generated and
curated puzzles in one list would need a way to tell them apart or lose the
point of naming them. Discuss the shape with Gabriel before building; this
entry exists to record the idea, not a decided design.

### sudoku-status-line-duplicate-instructions — The start prompt never clears, and now repeats the panel

`loadPuzzle()` (`games/sudoku/script.js`) sets `#status` to "Select a cell, then
type a digit" and nothing ever clears it — it sits there for the whole game
until "Solved! 🎉" replaces it on a win. CLAUDE.md's page contract says
`#status` is game state only, and standing instructions belong in the
collapsible panel instead. Minesweeper clears its own start prompt after the
first reveal (`tests/instructions-panel.test.js` §4 pins that behaviour), so
Sudoku is the odd one out here.

This predates the How to play panel added on `sudoku-how-to-play`, but that
branch made it visible in a new way: the panel's Controls section now says
"Click a cell, then type a digit or use the number pad" — almost the same
sentence sitting permanently in `#status` above it. Fix by clearing `#status`
after the first successful `placeDigit`, the same shape as Minesweeper's fix.
