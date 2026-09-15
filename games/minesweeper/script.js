const SIZE = 9;
const MINE_COUNT = 10;

const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const flagCountEl = document.getElementById("flag-count");
const timerEl = document.getElementById("timer");
const restartBtn = document.getElementById("restart");
const helpToggle = document.getElementById("help-toggle");
const instructionsEl = document.getElementById("instructions");
const bestTimeEl = document.getElementById("best-time");
const settingsToggle = document.getElementById("settings-toggle");
const settingsEl = document.getElementById("settings");
const resetBestBtn = document.getElementById("reset-best");

// The three HUD numbers live in a span beside a drawn glyph rather than in a
// string that starts with an emoji, so each readout is written without
// rewriting its icon.
const flagNumEl = flagCountEl.querySelector(".n");
const timerNumEl = timerEl.querySelector(".n");
const bestNumEl = bestTimeEl.querySelector(".n");

// The two things a cell can be, drawn rather than typed - chess's pieces are
// the precedent and the reason is the same: VT323 has no such glyph, so an
// emoji falls through to the reader's OS font and ignores the palette
// entirely. Same 48 grid and same weight as the hub's icons; the mine is the
// hub's own minesweeper tile icon, which already draws one.
//
// data-mark is what the drawing *is*, in one attribute, so a test can tell a
// flag from a mine without comparing serialised path markup.
const MARK_PATHS = {
  // Filled pennant on a drawn pole. Outlined, the swallowtail closed up into a
  // small box at cell size; a solid shape keeps its silhouette down there.
  flag:
    '<path d="M15 42V7" stroke-width="3.4" stroke-linecap="round"/>' +
    '<path d="M17 9h20l-6 8 6 8H17z" fill="currentColor" stroke="none"/>',
  // The flag you placed, struck through. The classic version draws a mine with
  // a cross over it, which would put a bomb on a cell that never had one; this
  // strikes out the claim you made instead, which is the thing that was wrong.
  "flag-wrong":
    '<path d="M15 42V7" stroke-width="3.4" stroke-linecap="round"/>' +
    '<path d="M17 9h20l-6 8 6 8H17z" fill="currentColor" stroke="none"/>' +
    '<path d="M7 41L41 7" stroke-width="3.4" stroke-linecap="round"/>',
  // A body and a lit fuse, and no spikes. The hub's tile icon draws eight of
  // them and reads as a mine at 46px; at a third of that the spikes close up
  // into a sunburst, so what says "bomb" here is the fuse.
  mine:
    '<circle cx="22" cy="28" r="14" fill="currentColor" stroke="none"/>' +
    '<path d="M28 15c3-6 8-6 10-2" stroke-width="3.4" stroke-linecap="round"/>' +
    '<circle cx="39" cy="10" r="3.2" fill="currentColor" stroke="none"/>' +
    '<circle cx="17" cy="23" r="3" fill="var(--bg)" stroke="none"/>',
};

function markSVG(mark) {
  return '<svg class="mark" data-mark="' + mark + '" viewBox="0 0 48 48" ' +
    'fill="none" stroke="currentColor" stroke-width="2.6" aria-hidden="true">' +
    MARK_PATHS[mark] + "</svg>";
}

// Best time is per board configuration, so adding a difficulty later cannot
// silently compare records from different board sizes.
const BEST_TIME_KEY = `minesweeper.bestTime.${SIZE}x${SIZE}-${MINE_COUNT}`;

let grid = [];
let cellEls = [];
let firstClick = true;
let gameOver = false;
let flagCount = 0;
let revealedCount = 0;
let timerId = null;
let seconds = 0;
let statusTimer = null;
let resetArmed = false;
let resetTimer = null;

// The status line reports game state only; the controls live in the instructions
// panel. Before the first reveal it prompts, after that it stays empty until
// something happens (the line keeps its height, so the board does not shift).
function defaultStatus() {
  return firstClick ? "Click any cell to start" : "";
}

// localStorage is not always available — it throws in private windows, with
// site data blocked, and from file:// in some browsers. A high score is a nice
// extra, so every access degrades to "no record" rather than breaking the game.
function loadBestTime() {
  try {
    const raw = localStorage.getItem(BEST_TIME_KEY);
    const value = Number(raw);
    return raw !== null && Number.isFinite(value) && value >= 0 ? value : null;
  } catch {
    return null;
  }
}

function saveBestTime(value) {
  try {
    localStorage.setItem(BEST_TIME_KEY, String(value));
    return true;
  } catch {
    return false;
  }
}

function clearBestTime() {
  try {
    localStorage.removeItem(BEST_TIME_KEY);
    return true;
  } catch {
    return false;
  }
}

function renderBestTime() {
  const best = loadBestTime();
  bestNumEl.textContent = best === null ? "—" : `${best}s`;
  // Nothing to clear without a record - and storage being unavailable reads as
  // "no record", which is also nothing to clear. The greyed-out button is the
  // whole explanation; the trophy above it says what there is to clear.
  resetBestBtn.disabled = best === null;
  if (best === null) disarmReset();
}

// Returns the message for the win, recording a new record when there is one.
function recordWin() {
  const best = loadBestTime();
  if (best !== null && best <= seconds) {
    return `Cleared in ${seconds}s (best ${best}s)`;
  }
  const saved = saveBestTime(seconds);
  renderBestTime();
  return saved
    ? `Cleared in ${seconds}s — new best time!`
    : `Cleared in ${seconds}s`;
}

function emptyGrid() {
  return Array.from({ length: SIZE }, () =>
    Array.from({ length: SIZE }, () => ({
      mine: false,
      revealed: false,
      flagged: false,
      tripped: false,
      wrong: false,
      adjacent: 0,
    }))
  );
}

function neighbors(r, c) {
  const result = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) result.push([nr, nc]);
    }
  }
  return result;
}

function placeMines(excludeR, excludeC) {
  let placed = 0;
  while (placed < MINE_COUNT) {
    const r = Math.floor(Math.random() * SIZE);
    const c = Math.floor(Math.random() * SIZE);
    if (grid[r][c].mine) continue;
    if (Math.abs(r - excludeR) <= 1 && Math.abs(c - excludeC) <= 1) continue;
    grid[r][c].mine = true;
    placed += 1;
  }
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c].mine) continue;
      grid[r][c].adjacent = neighbors(r, c).filter(([nr, nc]) => grid[nr][nc].mine).length;
    }
  }
}

function buildBoard() {
  boardEl.innerHTML = "";
  cellEls = [];
  for (let r = 0; r < SIZE; r++) {
    const row = [];
    for (let c = 0; c < SIZE; c++) {
      const btn = document.createElement("button");
      btn.className = "cell";
      btn.setAttribute("aria-label", `Cell ${r + 1}, ${c + 1}`);
      btn.addEventListener("click", () => handleReveal(r, c));
      btn.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        handleFlag(r, c);
      });
      // Chord on middle-button press rather than release. The middle button is the
      // scroll wheel, so pressing it nudges the mouse more often than not; waiting
      // for the release meant any nudge across a cell edge silently cancelled the
      // chord. preventDefault also suppresses middle-click autoscroll/paste, which
      // can otherwise swallow the release entirely.
      btn.addEventListener("mousedown", (e) => {
        if (e.button !== 1) return;
        e.preventDefault();
        handleChord(r, c);
      });
      btn.addEventListener("auxclick", (e) => {
        if (e.button === 1) e.preventDefault();
      });
      boardEl.appendChild(btn);
      row.push(btn);
    }
    cellEls.push(row);
  }
}

function startTimer() {
  stopTimer();
  seconds = 0;
  timerNumEl.textContent = seconds;
  timerId = setInterval(() => {
    seconds += 1;
    timerNumEl.textContent = seconds;
  }, 1000);
}

function stopTimer() {
  if (timerId) clearInterval(timerId);
  timerId = null;
}

function handleReveal(r, c) {
  if (gameOver) return;
  const cell = grid[r][c];
  if (cell.revealed || cell.flagged) return;

  if (firstClick) {
    placeMines(r, c);
    firstClick = false;
    startTimer();
    // drop the "click any cell to start" prompt now that play has begun
    statusEl.textContent = defaultStatus();
  }

  if (cell.mine) {
    cell.tripped = true;
    revealAllMines();
    gameOver = true;
    stopTimer();
    statusEl.textContent = "Boom! You hit a mine.";
    return;
  }

  floodReveal(r, c);
  checkWin();
}

function floodReveal(r, c) {
  const cell = grid[r][c];
  if (cell.revealed || cell.flagged) return;
  cell.revealed = true;
  revealedCount += 1;
  renderCell(r, c);
  if (cell.adjacent === 0) {
    for (const [nr, nc] of neighbors(r, c)) floodReveal(nr, nc);
  }
}

function flashStatus(msg) {
  statusEl.textContent = msg;
  if (statusTimer) clearTimeout(statusTimer);
  statusTimer = setTimeout(() => {
    if (!gameOver) statusEl.textContent = defaultStatus();
  }, 2500);
}

function handleChord(r, c) {
  if (gameOver) return;
  const cell = grid[r][c];
  if (!cell.revealed || cell.adjacent === 0) return;

  const around = neighbors(r, c);
  const flaggedCount = around.filter(([nr, nc]) => grid[nr][nc].flagged).length;
  if (flaggedCount !== cell.adjacent) {
    flashStatus(
      `Chord needs ${cell.adjacent} flag${cell.adjacent === 1 ? "" : "s"} ` +
      `around this ${cell.adjacent} — there ${flaggedCount === 1 ? "is" : "are"} ${flaggedCount}.`
    );
    return;
  }

  let hitMine = false;
  for (const [nr, nc] of around) {
    const n = grid[nr][nc];
    if (n.flagged || n.revealed) continue;
    if (n.mine) {
      hitMine = true;
      n.tripped = true;
    } else {
      floodReveal(nr, nc);
    }
  }

  if (hitMine) {
    revealAllMines();
    gameOver = true;
    stopTimer();
    statusEl.textContent = "Boom! A flag was wrong.";
    return;
  }

  checkWin();
}

function handleFlag(r, c) {
  if (gameOver) return;
  const cell = grid[r][c];
  if (cell.revealed) return;
  cell.flagged = !cell.flagged;
  flagCount += cell.flagged ? 1 : -1;
  flagNumEl.textContent = MINE_COUNT - flagCount;
  renderCell(r, c);
}

function renderCell(r, c) {
  const cell = grid[r][c];
  const el = cellEls[r][c];
  // A flag you got right stays a flag. revealAllMines reveals every mine when
  // the game ends, and a correctly flagged one used to swap your flag for the
  // bomb under it - deleting the only record that you had called it. The cell
  // stays covered-looking too: it never was cleared.
  el.classList.toggle("revealed", cell.revealed && !cell.flagged);
  el.classList.toggle("flagged", cell.flagged);
  el.classList.toggle("mine", cell.revealed && cell.mine && !cell.flagged);
  // The one that ended the game, apart from the nine shown beside it. Coral is
  // already the flag's colour, so this says its state in light rather than in
  // hue - see design/DESIGN.md, "Minesweeper: the covered board".
  el.classList.toggle("tripped", !!cell.tripped);
  el.classList.toggle("wrong", !!cell.wrong);
  el.className = el.className.replace(/\bn[1-8]\b/g, "").trim();

  if (cell.flagged) {
    el.innerHTML = markSVG(cell.wrong ? "flag-wrong" : "flag");
  } else if (cell.revealed && cell.mine) {
    el.innerHTML = markSVG("mine");
  } else if (cell.revealed && cell.adjacent > 0) {
    el.textContent = cell.adjacent;
    el.classList.add(`n${cell.adjacent}`);
  } else {
    el.textContent = "";
  }
}

function revealAllMines() {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c].mine) grid[r][c].revealed = true;
      // A flag on a safe cell was a wrong call, and the end of the game is when
      // you get told. Marked here rather than read off gameOver in renderCell,
      // because both callers set that flag after this runs.
      if (grid[r][c].flagged && !grid[r][c].mine) grid[r][c].wrong = true;
      renderCell(r, c);
    }
  }
}

function checkWin() {
  if (revealedCount === SIZE * SIZE - MINE_COUNT) {
    gameOver = true;
    stopTimer();
    statusEl.textContent = recordWin();
  }
}

function restart() {
  grid = emptyGrid();
  firstClick = true;
  gameOver = false;
  flagCount = 0;
  revealedCount = 0;
  stopTimer();
  if (statusTimer) clearTimeout(statusTimer);
  seconds = 0;
  timerNumEl.textContent = seconds;
  flagNumEl.textContent = MINE_COUNT;
  statusEl.textContent = defaultStatus();
  renderBestTime();
  buildBoard();
}

function toggleInstructions() {
  const open = instructionsEl.hasAttribute("hidden");
  instructionsEl.toggleAttribute("hidden", !open);
  helpToggle.setAttribute("aria-expanded", String(open));
  helpToggle.textContent = open ? "Hide instructions" : "How to play";
}

function toggleSettings() {
  const open = settingsEl.hasAttribute("hidden");
  settingsEl.toggleAttribute("hidden", !open);
  settingsToggle.setAttribute("aria-expanded", String(open));
  // Closing the panel abandons a half-finished reset rather than leaving it
  // armed for whenever the panel is next opened.
  if (!open) disarmReset();
}

function disarmReset() {
  resetArmed = false;
  if (resetTimer) clearTimeout(resetTimer);
  resetTimer = null;
  resetBestBtn.textContent = "Reset best time";
  resetBestBtn.classList.remove("confirming");
}

// Two-step, because a cleared record cannot be recovered: the first click arms
// the button, the second one does it. Arming lapses after a few seconds. The
// result needs no message - the trophy drops to a dash and the button greys out.
function handleResetBest() {
  if (resetBestBtn.disabled) return;
  if (!resetArmed) {
    resetArmed = true;
    resetBestBtn.textContent = "Sure? Click to confirm";
    resetBestBtn.classList.add("confirming");
    if (resetTimer) clearTimeout(resetTimer);
    resetTimer = setTimeout(disarmReset, 5000);
    return;
  }
  clearBestTime();
  disarmReset();
  renderBestTime();
}

restartBtn.addEventListener("click", restart);
helpToggle.addEventListener("click", toggleInstructions);
settingsToggle.addEventListener("click", toggleSettings);
resetBestBtn.addEventListener("click", handleResetBest);
restart();
