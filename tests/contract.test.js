// The page contract, held against every game, and the hub against the folders.
//
//   node tests/contract.test.js
//
// The games come from reading games/ rather than from a list, which is the whole
// reason this suite exists apart from the per-game ones. A game's own suite
// belongs to that game and is written by whoever builds it; no such suite can
// assert anything about the other four, and none of them is the place to notice
// that a sixth game shipped without a card on the hub.
//
// What it deliberately does not do is test how any game plays. That is the
// owning game's suite, and this one has no business there.
const fs = require("fs");
const path = require("path");
const { launch, url, makeChecks } = require("./helpers");

const ROOT = path.join(__dirname, "..");
const { check, report } = makeChecks();

const games = fs
  .readdirSync(path.join(ROOT, "games"), { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .sort();

const missing = (a, b) => a.filter((x) => !b.includes(x));

// A game whose keys drive play has to hand focus back after a pointer click on
// its own buttons (see the page contract in CLAUDE.md) - a focused button takes
// Space and Enter as its own activation, so a stuck focus turns the key that
// plays the game into the key that re-fires whatever was clicked last. That is
// exactly how a Sudoku "New puzzle" click, followed by the Space or Enter meant
// as a move, silently replaced the board instead.
//
// "Keys drive play" is read structurally rather than guessed per game: does the
// script attach a keydown/keyup/keypress listener at document or window level?
// That is what makes a key reach the game at all rather than only ever landing
// on whatever element the page last focused.
const KEY_DRIVEN = /(document|window)\.addEventListener\(\s*["']key(down|up|press)["']/;

const POINTER_NOTE =
  "the page contract requires a key-driven game to hand focus back after a " +
  "pointer click - copy releaseFocus from games/flappy-bird/script.js (its " +
  "`e.detail > 0` guard is what tells a pointer click from a keyboard one)";

const KEYBOARD_NOTE =
  "a keyboard activation has to KEEP the focus, or tabbing through the " +
  "controls loses it on the first press - see the same releaseFocus in " +
  "games/flappy-bird/script.js, which blurs only when `e.detail > 0`";

// A button's own label for a failure message: id first since that is how a
// reader would find it in the page, then its text, then its class as a last
// resort for an icon-only button.
async function describe(button) {
  return button.evaluate((el) => el.id || el.textContent.trim() || el.className);
}

(async () => {
  const browser = await launch();

  // Adding a game is two steps - create the folder, add a card - and nothing
  // else in the repo checks that both happened. A folder with no card is a game
  // no visitor can reach; a card whose folder was renamed is a 404 on the live
  // site. Both directions, so either mistake names itself.
  console.log("1. the hub and games/ agree");
  const hub = await browser.newPage();
  const hubErrors = [];
  hub.on("pageerror", (e) => hubErrors.push(String(e)));
  await hub.goto(url("/index.html"));
  const carded = [
    ...new Set(
      (await hub.$$eval('a[href^="games/"]', (as) =>
        as.map((a) => a.getAttribute("href"))
      )).map((href) => href.split("/")[1])
    ),
  ].sort();

  check("every game folder has a card", missing(games, carded).length === 0,
    missing(games, carded).join(", ") || games.join(", "));
  check("every card points at a game folder", missing(carded, games).length === 0,
    missing(carded, games).join(", ") || carded.join(", "));
  check("the hub itself loads clean", hubErrors.length === 0, hubErrors.join("; "));
  await hub.close();

  // Cloudflare serves a page at its directory path and 307s the `.html`
  // spelling there, so a link written the long way costs a visitor a round trip
  // on every navigation. Every internal link in the site was written that way
  // once; this is what stops the long form arriving back with the next page
  // somebody adds.
  //
  // **What this cannot see.** The server behind these suites resolves a
  // directory to its `index.html` and never redirects anything, so a `.html`
  // link would resolve here perfectly happily. The spelling check is a proxy for
  // "costs no redirect", not a measurement of one — the only real proof is
  // probing the live site, which is a deploy step rather than a test. What the
  // resolve check below *does* prove is the half that would have taken the site
  // down: that the short spelling is not a 404.
  console.log("2. internal links point at what is served, not at a redirect");

  const pages = [];
  const walkPages = (dir) => {
    for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
      // `.assetsignore` keeps design/ and tests/ out of the deploy, so their
      // links are nobody's round trip; node_modules and anything hidden are not
      // the site at all.
      if (["node_modules", "design", "tests"].includes(e.name) || e.name.startsWith(".")) continue;
      const rel = dir === "." ? e.name : `${dir}/${e.name}`;
      if (e.isDirectory()) walkPages(rel);
      else if (e.name.endsWith(".html")) pages.push(rel);
    }
  };
  walkPages(".");

  // Every page is an index.html in a directory of its own, which is what makes
  // the clean URL free: a directory index resolves natively and identically in
  // Workers, in `python3 -m http.server` and in the server these suites run on,
  // with nothing configured and nothing mirrored. A page at `foo.html` would
  // need extensionless resolution instead — which Workers does, the other two do
  // not — so the short link would work live and 404 in every local preview.
  const loose = pages.filter((p) => !p.endsWith("index.html"));
  check("every page is a directory index, so its clean URL needs no server config",
    loose.length === 0,
    loose.length ? `${loose.join(", ")} would need extensionless resolution` : pages.join(", "));

  const servedAt = (rel) => "/" + rel.replace(/(^|\/)index\.html$/, "$1");

  const longWay = [];
  const broken = [];
  for (const rel of pages.filter((p) => p.endsWith("index.html"))) {
    const at = servedAt(rel);
    const probe = await browser.newPage();
    await probe.goto(url(at));
    // Same-origin, so the page can resolve and fetch its own links itself —
    // which also means each href is resolved by the browser against the URL the
    // page was actually served at, rather than by a rule reimplemented here.
    const links = await probe.$$eval("a[href]", (as) =>
      as
        .map((a) => a.getAttribute("href"))
        // An anchor and an external link are not navigations within the site.
        .filter((h) => h && !/^(https?:|mailto:|#)/.test(h))
    );
    for (const href of links) {
      if (/\.html(\?|#|$)/.test(href)) longWay.push(`${at} → ${href}`);
      const status = await probe.evaluate(async (h) => {
        try {
          return (await fetch(new URL(h, location.href), { redirect: "follow" })).status;
        } catch (e) {
          return String(e);
        }
      }, href);
      if (status !== 200) broken.push(`${at} → ${href} (${status})`);
    }
    await probe.close();
  }

  check("no internal link is written the .html way", longWay.length === 0,
    longWay.length
      ? `${longWay.join(", ")} — link the directory ("games/pong/", "../../") so the ` +
        "navigation does not cost a 307 on the live site"
      : `${pages.length} pages checked`);
  check("every internal link resolves", broken.length === 0,
    broken.join(", ") || `${pages.length} pages checked`);

  let step = 2;
  for (const game of games) {
    console.log(`${++step}. ${game} keeps the page contract`);
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));

    const res = await page.goto(url(`/games/${game}/index.html`));
    check(`${game}: the page is served`, res && res.ok(), res && res.status());

    // Game scripts look these up by id and shared.css styles them. A page
    // missing one is broken in a way its own suite would catch, but a page
    // added without one never had a suite in the first place.
    const absent = await page.evaluate(() =>
      ["board", "status", "restart"].filter((id) => !document.getElementById(id))
    );
    check(`${game}: has #board, #status and #restart`, absent.length === 0,
      absent.map((id) => `#${id}`).join(", ") || "all three");

    // Order, not just presence. shared.css second would still load, still look
    // almost right, and quietly stop the game's own rules from winning - which
    // is the kind of breakage nobody reports because nothing looks broken.
    const sheets = await page.$$eval('link[rel="stylesheet"]', (ls) =>
      ls.map((l) => l.getAttribute("href"))
    );
    const shared = sheets.findIndex((h) => h.endsWith("shared.css"));
    const own = sheets.findIndex((h) => h.endsWith("style.css"));
    check(`${game}: links shared.css before its own`,
      shared !== -1 && own !== -1 && shared < own, sheets.join(" then "));

    const back = await page.$$eval("a[href]", (as) =>
      as.map((a) => a.getAttribute("href"))
    );
    check(`${game}: links back to the hub`, back.includes("../../"),
      back.join(", "));

    // game.css sits *between* shared.css and the game's own sheet, so a game
    // can still override the frame. Loading it last would silently reverse
    // that, and nothing would look broken until a game tried to override
    // something and could not.
    const frameSheet = sheets.findIndex((h) => h.endsWith("game.css"));
    check(`${game}: links game.css between shared.css and its own`,
      frameSheet !== -1 && shared < frameSheet && frameSheet < own,
      sheets.join(" then "));

    // All six games wear the frame. A new one that skips it will not look
    // broken on its own page - it will look like the site before the redesign,
    // which is exactly the thing nobody notices until they arrive from the hub.
    const frame = await page.evaluate(() => ({
      page: !!document.querySelector("main.game-page"),
      deco: !!document.querySelector(".game-deco"),
      crt: !!document.querySelector(".game-crt"),
      inner: !!document.querySelector(".game-in"),
      // The breadcrumb *is* the contract's link home on a framed page.
      crumb: document.querySelector(".crumb")?.getAttribute("href") ?? null,
      title: document.querySelector("h1.game-title")?.textContent.trim() ?? null,
      strap: document.querySelector("#status.game-strap") !== null,
      foot: !!document.querySelector(".game-foot"),
    }));
    const bare = Object.entries(frame)
      .filter(([, v]) => !v)
      .map(([k]) => k);
    check(`${game}: wears the shared frame`, bare.length === 0,
      bare.length ? `missing: ${bare.join(", ")}` : JSON.stringify(frame));
    check(`${game}: the breadcrumb is the link home`,
      frame.crumb === "../../", frame.crumb);
    // A canvas game draws at its backing-store resolution. If CSS renders it at
    // any other size the browser resamples every pixel, and on a dark board a
    // resampled 1px line or 10px paddle is smeared across two pixels at half
    // brightness — which reads as the game being invisible rather than blurry.
    // Pong shipped that way: shared.css sets box-sizing: border-box globally,
    // so `width: 100%` on a canvas with a 1px border made the *content* box
    // 598 x 398.67 for a 600 x 400 surface.
    const canvasFit = await page.evaluate(() => {
      const c = document.getElementById("board");
      if (c.tagName !== "CANVAS") return null;
      const st = getComputedStyle(c);
      // The content box, which is what the backing store is painted into.
      const w = parseFloat(st.width);
      const h = parseFloat(st.height);
      const inner = st.boxSizing === "border-box"
        ? { w: w - parseFloat(st.borderLeftWidth) - parseFloat(st.borderRightWidth)
               - parseFloat(st.paddingLeft) - parseFloat(st.paddingRight),
            h: h - parseFloat(st.borderTopWidth) - parseFloat(st.borderBottomWidth)
               - parseFloat(st.paddingTop) - parseFloat(st.paddingBottom) }
        : { w, h };
      return { store: [c.width, c.height], css: [inner.w, inner.h] };
    });
    if (canvasFit) {
      check(`${game}: the canvas is drawn 1:1, not resampled`,
        canvasFit.css[0] === canvasFit.store[0] && canvasFit.css[1] === canvasFit.store[1],
        `${canvasFit.store.join("x")} surface rendered at ${canvasFit.css.join("x")}`);
    }

    check(`${game}: the title is the game's name in caps`,
      typeof frame.title === "string" && frame.title === frame.title.toUpperCase()
        && frame.title.length > 0,
      frame.title);

    const scriptSource = fs.readFileSync(
      path.join(ROOT, "games", game, "script.js"), "utf8"
    );
    if (KEY_DRIVEN.test(scriptSource)) {
      // In scope: the game's own action buttons - restart, a help toggle, a
      // number pad, whatever it has. Out of scope on structural grounds, not a
      // hand-picked exclusion:
      //   - anything inside #board is the play surface itself, which the file
      //     header above already rules out testing here; Sudoku's 81 cells are
      //     buttons, and clicking and typing into one is its own suite's job
      //     (sudoku.test.js), not this one's.
      //   - a role="radio" button is a settings selector, not an action. Keeping
      //     focus after being chosen is ordinary radiogroup keyboard behaviour -
      //     the same as a native <input type="radio"> - not the hazard this
      //     clause exists for. That reading only holds because the focus cannot
      //     survive into a phase where a key does anything dangerous: Pong's six
      //     radios live only inside the pre-match menu, and Play unconditionally
      //     blurs on the way out of it (see releaseFocus's sibling in
      //     games/pong/script.js) - so by the time Space serves or drives a
      //     paddle, document.activeElement is back to BODY regardless of which
      //     radio a player last clicked. A radio a future game leaves reachable
      //     during play would not get this exemption for free.
      //   - hidden or disabled at load: nothing a player can click yet, so a real
      //     click would just hang waiting for it to become actionable instead of
      //     reporting anything.
      const candidates = await page.$$('button:not([role="radio"])');
      const scoped = [];
      for (const b of candidates) {
        const eligible = await b.evaluate((el) =>
          !el.closest("#board") && !el.disabled && el.offsetParent !== null
        );
        if (eligible) scoped.push(b);
      }

      const stuck = [];
      for (const b of scoped) {
        await b.click();
        if (await b.evaluate((el) => document.activeElement === el)) {
          stuck.push(await describe(b));
        }
        await page.evaluate(() =>
          document.activeElement instanceof HTMLElement && document.activeElement.blur()
        );
      }
      check(`${game}: a pointer click on its own buttons hands the focus back`,
        stuck.length === 0,
        stuck.length
          ? `${stuck.join(", ")} kept focus after a real click - ${POINTER_NOTE}`
          : `released: ${scoped.length} button(s)`);

      // The other half of the same rule: a keyboard activation has to KEEP the
      // focus, or tabbing through the controls loses it on the first press.
      // Only meaningful for a button still there afterwards to tab back to - one
      // that hides itself on activation (Pong's Play, which starts the match and
      // closes the menu) has nothing left to hold focus on and is exempt.
      const lost = [];
      let exempt = 0;
      for (const b of scoped) {
        await b.evaluate((el) => el.focus());
        await page.keyboard.press("Enter");
        const stillThere = await b.evaluate((el) =>
          document.body.contains(el) && el.offsetParent !== null
        );
        if (!stillThere) {
          exempt++;
        } else if (!(await b.evaluate((el) => document.activeElement === el))) {
          lost.push(await describe(b));
        }
        await page.evaluate(() =>
          document.activeElement instanceof HTMLElement && document.activeElement.blur()
        );
      }
      check(`${game}: a keyboard activation of its own buttons keeps the focus`,
        lost.length === 0,
        lost.length
          ? `${lost.join(", ")} lost focus after Enter - ${KEYBOARD_NOTE}`
          : `kept: ${scoped.length - exempt} of ${scoped.length} checked` +
            (exempt ? ` (${exempt} exempt - hides itself on activation)` : ""));
    } else {
      console.log("   (keys do not drive play here - focus handback not required)");
    }

    // A settle before reading errors: a game whose loop throws on its first
    // frame is still loaded and quiet at the moment goto() resolves.
    await page.waitForTimeout(150);
    check(`${game}: no page errors`, errors.length === 0, errors.join("; "));
    await page.close();
  }

  await browser.close();
  process.exit(report());
})();
