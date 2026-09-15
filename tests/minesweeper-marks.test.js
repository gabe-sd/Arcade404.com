// What a Minesweeper cell shows, and what the readout shows.
//
// Both used to be emoji written into textContent, which the OS font drew in its
// own colours - the one thing on the page the site's palette could not reach.
// They are drawn SVG now, so what is worth guarding is that a cell says which
// mark it is carrying, that a dead board distinguishes the mine you hit from
// the nine beside it, and that no emoji has crept back in.
//
// The marks are read through data-mark rather than by comparing path markup:
// the browser rewrites `<path/>` as `<path></path>`, so a test doing that would
// be measuring the serialiser. Chess's pieces carry data-piece for the same
// reason.
const { launch, url, makeChecks } = require("./helpers");

const PAGE = url("/games/minesweeper/index.html");
const { check, report } = makeChecks();

// Where the glyphs this replaced lived - the clock and the gear as much as the
// flag and the bomb. The floor is above the arrows and the dashes on purpose:
// those are the site's own typography, still used in the breadcrumb every game
// page carries, and a sweep that flags them is a sweep nobody will keep.
//
// The arrows are a separate problem with its own entry - design/TODO.md,
// redesign-emoji-glyphs - because the typeface has no arrow either. When that
// lands, this floor can come down.
const SYMBOLS = /[\u{2300}-\u{1FAFF}]/u;

(async () => {
  const browser = await launch();
  const page = await browser.newPage({ viewport: { width: 520, height: 820 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(PAGE);
  await page.waitForSelector("#board");

  console.log("1. a flag is a drawn flag");
  // A cell with no mine under it, so flagging it cannot end the game later.
  await page.evaluate(() => handleReveal(4, 4));
  // Deliberately a mine, so the "a correct flag survives" check below has
  // something to be about. Picking any covered cell made it a coin toss whether
  // that check tested anything at all.
  const spot = await page.evaluate(() => {
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++)
        if (grid[r][c].mine) return { r, c };
  });
  // And one on a cell that is definitely safe and still covered, so the
  // "wrong flags are struck" check below has something to be about too.
  const wrongSpot = await page.evaluate(() => {
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++)
        if (!grid[r][c].mine && !grid[r][c].revealed) return { r, c };
  });
  await page.evaluate(({ r, c }) => handleFlag(r, c), spot);
  await page.evaluate(({ r, c }) => handleFlag(r, c), wrongSpot);
  const flagMark = await page.evaluate(
    ({ r, c }) => {
      const el = cellEls[r][c].querySelector("[data-mark]");
      return el ? el.getAttribute("data-mark") : null;
    },
    spot
  );
  check("the flagged cell carries a flag", flagMark === "flag", String(flagMark));
  const flagText = await page.evaluate(
    ({ r, c }) => cellEls[r][c].textContent.trim(), spot);
  check("and no text in it", flagText === "", JSON.stringify(flagText));

  console.log("2. the count went down by the two flags, in its own span");
  // Read through $$eval rather than $eval so a missing span reports as a failed
  // check rather than throwing and taking the rest of the suite with it - which
  // is what it did the first time this was run against the version it replaced.
  const count = await page.$$eval("#flag-count .n", (e) =>
    e.length ? e[0].textContent.trim() : null);
  check("the number is its own element, and reads 8", count === "8", String(count));

  console.log("3. a dead board draws every mine, and marks the one you hit");
  const hit = await page.evaluate(() => {
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++)
        if (grid[r][c].mine && !grid[r][c].flagged) {
          handleReveal(r, c);
          return { r, c };
        }
  });
  const mines = await page.$$eval('#board [data-mark="mine"]', (e) => e.length);
  const buried = await page.evaluate(
    () => grid.flat().filter((cell) => cell.mine && !cell.flagged).length
  );
  check("every unflagged mine is drawn", mines === buried, `${mines} of ${buried}`);

  // A flag you got right survives the reveal - it used to be replaced by the
  // mine under it, which deleted the only record that you had called it.
  const rightFlags = await page.evaluate(
    () => grid.flat().filter((cell) => cell.mine && cell.flagged).length
  );
  const flagsShown = await page.$$eval('#board [data-mark="flag"]', (e) => e.length);
  check("a correct flag is still a flag after the reveal",
    flagsShown === rightFlags && rightFlags > 0,
    `${flagsShown} drawn as a plain flag, ${rightFlags} placed correctly`);
  check("and its cell is not drawn as cleared",
    await page.$$eval("#board .cell.flagged.revealed", (e) => e.length === 0));

  console.log("3b. a flag that was wrong is struck out, and only that one");
  const wrongShown = await page.$$eval(
    '#board [data-mark="flag-wrong"]', (e) => e.length);
  const wrongPlaced = await page.evaluate(
    () => grid.flat().filter((cell) => cell.flagged && !cell.mine).length
  );
  check("every wrong flag is struck", wrongShown === wrongPlaced,
    `${wrongShown} struck, ${wrongPlaced} wrong`);
  check("and the right one is not",
    await page.evaluate(({ r, c }) =>
      cellEls[r][c].querySelector("[data-mark]").getAttribute("data-mark") === "flag",
      spot));
  const tripped = await page.$$eval("#board .cell.tripped", (e) => e.length);
  check("exactly one is the one you hit", tripped === 1, String(tripped));
  check("and it is the one that was clicked",
    await page.evaluate(({ r, c }) => cellEls[r][c].classList.contains("tripped"), hit));

  console.log("4. no emoji anywhere on the page");
  // Scripts too, not only what is rendered: a win message that has not fired
  // yet is invisible to a sweep of the DOM, which is how these were undercounted
  // the first time they were tallied.
  const shown = await page.evaluate(() => document.body.innerText);
  check("nothing in the page text", !SYMBOLS.test(shown),
    (shown.match(SYMBOLS) || []).join(""));
  const source = await (await fetch(url("/games/minesweeper/script.js"))).text();
  check("nothing in the script", !SYMBOLS.test(source),
    (source.match(SYMBOLS) || []).join(""));

  console.log("5. a win says so without one");
  await page.goto(PAGE);
  await page.waitForSelector("#board");
  await page.evaluate(() => {
    handleReveal(4, 4);
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++)
        if (!grid[r][c].mine) handleReveal(r, c);
  });
  const msg = await page.textContent("#status");
  check("the win message mentions the time", /Cleared in \d+s/.test(msg), msg);
  check("and carries no emoji", !SYMBOLS.test(msg), msg);

  check("no page errors", errors.length === 0, errors.join("; "));

  await browser.close();
  process.exit(report());
})();
