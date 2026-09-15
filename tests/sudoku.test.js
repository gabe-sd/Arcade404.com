// Gameplay: selecting a cell, filling it (keyboard and the number pad),
// conflict highlighting, the win condition, and Restart vs. New puzzle.
const { launch, url, makeChecks } = require("./helpers");

const PAGE = url("/games/sudoku/index.html");
const { check, report } = makeChecks();

(async () => {
  const browser = await launch();
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(PAGE);
  await page.waitForSelector("#board");

  console.log("1. the board renders 81 cells, given cells pre-filled");
  check("81 cells", (await page.$$("#board .cell")).length === 81);
  const givenCount = await page.evaluate(() =>
    givens.flat().filter((v) => v !== 0).length
  );
  check("given count matches rendered givens",
    (await page.$$("#board .cell.given")).length === givenCount, givenCount);

  console.log("2. a given cell selects and scans, but still takes no digit");
  // It used to refuse selection outright. Selecting one now lights its row,
  // column and box - which is how you check where a digit is already spoken
  // for - and the guard that matters, that it cannot be typed into, is below.
  const firstGivenIndex = await page.evaluate(() => {
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++)
      if (givens[r][c] !== 0) return r * 9 + c;
  });
  const cells = () => page.$$("#board .cell");
  const givenCell = (await cells())[firstGivenIndex];
  const givenText = await givenCell.textContent();
  await givenCell.click();
  check("the given becomes selected",
    await givenCell.evaluate((el) => el.classList.contains("selected")));
  check("its scan is lit", (await page.$$("#board .cell.peer")).length === 20);
  await page.keyboard.press("5");
  check("typing into it changes nothing", (await givenCell.textContent()) === givenText,
    await givenCell.textContent());
  await page.click(".num-btn.erase");
  check("the eraser does not empty it either",
    (await givenCell.textContent()) === givenText, await givenCell.textContent());

  console.log("3. selecting an editable cell and typing a digit fills it");
  const firstEmptyIndex = await page.evaluate(() => {
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++)
      if (givens[r][c] === 0) return r * 9 + c;
  });
  const emptyCell = (await cells())[firstEmptyIndex];
  await emptyCell.click();
  check("cell shows selected", await emptyCell.evaluate((el) => el.classList.contains("selected")));
  await page.keyboard.press("5");
  check("digit typed", (await emptyCell.textContent()) === "5");

  console.log("4. Backspace clears the selected cell");
  await page.keyboard.press("Backspace");
  check("cell cleared", (await emptyCell.textContent()) === "");

  console.log("5. the number pad fills the selected cell");
  await page.click('.num-btn[data-digit="7"]');
  check("number pad digit applied", (await emptyCell.textContent()) === "7");
  await page.click(".num-btn.erase");
  check("eraser button clears it", (await emptyCell.textContent()) === "");

  console.log("6. a digit that duplicates a peer is marked wrong");
  const dupe = await page.evaluate(() => {
    // find an empty cell and a value already present in its row
    for (let r = 0; r < 9; r++) {
      const present = grid[r].find((v) => v !== 0);
      if (present === undefined) continue;
      for (let c = 0; c < 9; c++) {
        if (grid[r][c] === 0) return { r, c, value: present };
      }
    }
    return null;
  });
  const dupeCell = (await cells())[dupe.r * 9 + dupe.c];
  await dupeCell.click();
  await page.keyboard.press(String(dupe.value));
  check("marked wrong", await dupeCell.evaluate((el) => el.classList.contains("wrong")));
  await page.keyboard.press("Backspace");
  check("clearing it drops the wrong marker",
    !(await dupeCell.evaluate((el) => el.classList.contains("wrong"))));

  console.log("7. filling the whole board with the solution wins");
  const result = await page.evaluate(() => {
    const solution = currentPuzzle().solution;
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) {
      if (givens[r][c] === 0) {
        grid[r][c] = solution[r][c];
        renderCell(r, c);
      }
    }
    checkWin();
    return { gameOver, status: document.getElementById("status").textContent };
  });
  check("game won", result.gameOver);
  check("status announces it", result.status.includes("Solved"), result.status);
  check("cells marked won", (await page.$$("#board .cell.won")).length === 81);

  console.log("8. Restart needs a second click to confirm once there's progress to lose");
  // The board is solved at this point, which counts as progress - see
  // DESIGN.md's "Saved progress". A single click only arms the button.
  const puzzleIndexBefore = await page.evaluate(() => puzzleIndex);
  await page.click("#restart");
  check("first click does not reset the grid",
    !(await page.evaluate(() => JSON.stringify(grid) === JSON.stringify(givens))));
  check("button shows the confirm prompt",
    (await page.textContent("#restart")).includes("Sure?"), await page.textContent("#restart"));
  await page.click("#restart");
  check("second click resets the grid",
    await page.evaluate(() => JSON.stringify(grid) === JSON.stringify(givens)));
  check("no longer game over", !(await page.evaluate(() => gameOver)));
  check("same puzzle", (await page.evaluate(() => puzzleIndex)) === puzzleIndexBefore);
  check("status back to the prompt",
    (await page.textContent("#status")).includes("Select a cell"),
    await page.textContent("#status"));
  check("no cell still carries the won class from before the reset",
    (await page.$$("#board .cell.won")).length === 0);
  check("button label restored",
    (await page.textContent("#restart")) === "Restart", await page.textContent("#restart"));

  console.log("9. New puzzle moves to a different entry and resets state");
  // The board is untouched since step 8's reset, so this needs only one click
  // - see the "no confirm on an untouched board" case in sudoku-progress.test.js.
  await page.click("#new-puzzle");
  check("puzzle index advanced",
    (await page.evaluate(() => puzzleIndex)) !== puzzleIndexBefore);
  check("grid matches the new puzzle's givens",
    await page.evaluate(() => JSON.stringify(grid) === JSON.stringify(givens)));

  console.log("10. a pointer click on a control hands the focus back");
  // A clicked button keeps the focus by default, and a focused button takes
  // Space and Enter as its own click - so without releasing it, playing a
  // move right after clicking New puzzle re-fires that button on the very
  // key meant as game input, silently discarding what was just entered.
  await page.click("#new-puzzle");
  check("focus not stuck on New puzzle",
    (await page.evaluate(() => document.activeElement.id)) !== "new-puzzle");
  const puzzleIndexAfterClick = await page.evaluate(() => puzzleIndex);

  const editable = await page.evaluate(() => {
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++)
      if (givens[r][c] === 0) return r * 9 + c;
  });
  await (await cells())[editable].click();
  await page.keyboard.press("5");
  check("digit landed", (await (await cells())[editable].textContent()) === "5");

  await page.keyboard.press("Space");
  check("Space does not re-trigger New puzzle",
    (await page.evaluate(() => puzzleIndex)) === puzzleIndexAfterClick);
  check("the entered digit survives the keypress",
    (await (await cells())[editable].textContent()) === "5");

  await page.keyboard.press("Enter");
  check("Enter does not re-trigger New puzzle either",
    (await page.evaluate(() => puzzleIndex)) === puzzleIndexAfterClick);

  console.log("11. the number pad and Restart release focus the same way");
  await page.click('.num-btn[data-digit="3"]');
  check("focus not stuck on the number pad button",
    (await page.evaluate(() => document.activeElement.tagName)) !== "BUTTON" ||
    !(await page.evaluate(() => document.activeElement.classList.contains("num-btn"))));
  // The board has an entry from step 10, so this arms rather than resets -
  // focus release has to hold on the arming click too, not just the confirm.
  await page.click("#restart");
  check("focus not stuck on Restart (arming click)",
    (await page.evaluate(() => document.activeElement.id)) !== "restart");
  await page.click("#restart");
  check("focus not stuck on Restart (confirming click)",
    (await page.evaluate(() => document.activeElement.id)) !== "restart");

  console.log("12. How to play toggles the instructions panel");
  check("panel hidden by default", !(await page.isVisible("#instructions")));
  check("aria-expanded starts false",
    (await page.getAttribute("#help-toggle", "aria-expanded")) === "false");
  await page.click("#help-toggle");
  check("focus not stuck on How to play",
    (await page.evaluate(() => document.activeElement.id)) !== "help-toggle");
  check("panel visible", await page.isVisible("#instructions"));
  check("aria-expanded flips to true",
    (await page.getAttribute("#help-toggle", "aria-expanded")) === "true");
  check("label flips", (await page.textContent("#help-toggle")).includes("Hide"),
    await page.textContent("#help-toggle"));
  const instr = await page.textContent("#instructions");
  check("has a Rules section and a Controls section",
    ["Rules", "Controls"].every((s) => instr.includes(s)), instr.trim());
  check("covers the rule and the controls",
    ["row", "column", "3x3 box", "1-9", "number pad", "Backspace"].every((s) => instr.includes(s)),
    instr.trim());
  check("mentions the live conflict check",
    instr.includes("red"), instr.trim());
  await page.click("#help-toggle");
  check("panel hides again", !(await page.isVisible("#instructions")));
  check("label restored", (await page.textContent("#help-toggle")) === "How to play",
    await page.textContent("#help-toggle"));

  console.log("13. both halves of a clash are marked, not just the one just typed");
  // conflicts() is symmetric, so a duplicate pair is two wrong cells. Only the
  // cell being typed into used to be re-rendered, which left the older half of
  // every pair unmarked - a player clearing the red one was then looking at a
  // board that looked clean and was not. Two entered cells, not a given: a
  // given never carries .wrong, so the pair has to be one the player made.
  await page.evaluate(() => { restart(); });
  const pair = await page.evaluate(() => {
    for (let r = 0; r < 9; r++) {
      const free = [];
      for (let c = 0; c < 9; c++) if (givens[r][c] === 0) free.push(c);
      if (free.length < 2) continue;
      for (let d = 1; d <= 9; d++) {
        if (!grid[r].includes(d)) return { r, a: free[0], b: free[1], value: d };
      }
    }
    return null;
  });
  const cellAt = async (r, c) => (await cells())[r * 9 + c];
  const hasWrong = (el) => el.evaluate((e) => e.classList.contains("wrong"));
  const first = await cellAt(pair.r, pair.a);
  const second = await cellAt(pair.r, pair.b);
  await first.click();
  await page.keyboard.press(String(pair.value));
  check("the first of the pair is clean on its own", !(await hasWrong(first)));
  await second.click();
  await page.keyboard.press(String(pair.value));
  check("the cell just typed is marked", await hasWrong(second));
  check("the older half of the pair is marked too", await hasWrong(first));
  await page.keyboard.press("Backspace");
  check("clearing one un-marks the survivor", !(await hasWrong(first)));
  check("and the cleared cell is unmarked", !(await hasWrong(second)));

  console.log("14. selecting a cell lights its row, column and box");
  await page.evaluate(() => { restart(); });
  const scanTarget = await page.evaluate(() => {
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++)
      if (givens[r][c] === 0) return { r, c };
  });
  await (await cellAt(scanTarget.r, scanTarget.c)).click();
  const scan = await page.evaluate(({ r, c }) => {
    const lit = [...document.querySelectorAll("#board .cell")]
      .map((el, i) => (el.classList.contains("peer") ? i : -1))
      .filter((i) => i >= 0);
    return { lit, expected: peers(r, c).map(([pr, pc]) => pr * 9 + pc).sort((a, b) => a - b) };
  }, scanTarget);
  check("exactly the 20 peers are lit", scan.lit.length === 20, scan.lit.length);
  check("and they are the right ones",
    JSON.stringify(scan.lit) === JSON.stringify(scan.expected));
  check("the selected cell is not also lit as a peer",
    !scan.lit.includes(scanTarget.r * 9 + scanTarget.c));
  // Moving the selection has to move the scan with it, not add to it.
  const elsewhere = await page.evaluate(({ r, c }) => {
    for (let rr = 0; rr < 9; rr++) for (let cc = 0; cc < 9; cc++)
      if (givens[rr][cc] === 0 && rr !== r && cc !== c) return { r: rr, c: cc };
  }, scanTarget);
  await (await cellAt(elsewhere.r, elsewhere.c)).click();
  check("the scan moves rather than accumulating",
    (await page.$$("#board .cell.peer")).length === 20);
  check("only one cell is selected", (await page.$$("#board .cell.selected")).length === 1);

  check("no page errors", errors.length === 0, errors.join("; "));

  await browser.close();
  process.exit(report());
})();
