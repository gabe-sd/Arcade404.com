# Minesweeper: what a reader must not break

**Minesweeper** (`games/minesweeper/script.js`) places mines lazily on the first
reveal, excluding the 3x3 around that cell, so the first click is always safe —
`grid` is empty until then. `floodReveal` recurses through zero-adjacency cells.
Chording fires on middle **mousedown** (see below). The HUD counter shows flags
left to place (`MINE_COUNT - flagCount`), which is why it carries a flag icon;
the bomb icon means an actual revealed mine.

## What a cell draws

The flag and the mine are SVG written by `markSVG`, not characters — see
`design/DESIGN.md`, "Minesweeper: the covered board", for why, and for the rest
of the look. Each carries `data-mark` naming what it is — `flag`, `flag-wrong` or `mine` —
which is how
`tests/minesweeper-marks.test.js` tells them apart without comparing serialised
path markup.

`cell.tripped` marks the single mine that ended the game, set in both places one
can be hit — `handleReveal` and `handleChord`. It is drawn differently from the
mines revealed beside it, and nothing else reads it.

**A correct flag survives the reveal, and its cell stays covered.**
`revealAllMines` reveals every mine when the game ends, and `renderCell` used to
drop the flag from a revealed cell — so a mine you had called correctly showed
the bomb underneath instead, deleting the only record that you had called it.
Gabriel's decision, 2026-09-15. `renderCell` now lets `cell.flagged` win over
`cell.revealed` for both the class and the mark; the state itself is untouched,
so nothing that counts revealed cells changes.

**A flag that was wrong is struck out.** `revealAllMines` sets `cell.wrong` on
any flag sitting on a safe cell, and `renderCell` draws `flag-wrong` for it —
the same flag with a line through it, dimmed. Marked there rather than read off
`gameOver` inside `renderCell`, because both callers set `gameOver` *after*
calling `revealAllMines`, so reading it would have drawn nothing.

Two details worth keeping. The strike is on the **flag**, not on a mine: the
classic game draws a crossed-out mine, which puts a bomb on a cell that never
had one, and what was wrong is the call rather than the contents. And the wrong
flag **goes dim rather than changing hue** — coral is the flag's colour whether
the flag was right or not, so the difference is carried by light, as everywhere
else on this site.

## Page ids

On top of the shared `#board`, `#status` and `#restart` from `CLAUDE.md`'s page
contract: `#flag-count`, `#timer`, `#best-time`, `#help-toggle`, `#instructions`,
and a gear button `#settings-toggle` opening `#settings`, which holds
`#reset-best`.

## Stored data

`minesweeper.bestTime.9x9-10` — the best time, keyed by board configuration, so
adding a difficulty later cannot compare records across board sizes. Read and
written through `loadBestTime`/`saveBestTime`/`clearBestTime`, each wrapped
because `localStorage` throws rather than returning `null` when it is
unavailable. `tests/best-time.test.js` covers that path by making storage throw.

The gear panel's Reset best time button clears the key. It is disabled whenever
`loadBestTime()` returns `null`, which covers both "no record yet" and "storage
unavailable" — there is nothing to clear either way, and the greyed-out button is
the whole explanation, so it carries no note. Clearing cannot be undone, so the
button is two-step: the first click arms it, the second clears. Anything else
destructive added to that panel should follow the same pattern.
