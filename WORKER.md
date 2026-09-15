# The worker

Read this if you are a worker. If you hold `main` and do the merging, `INTEGRATOR.md`
is your file; if you own the site's look, `ART-DIRECTOR.md` is. If nobody has told
you which you are, **ask before you touch anything**.

Everything in `CLAUDE.md` still applies to you. This file is only the part that is
different because you do **not** hold `main`.

Spawning one of these is one line:

> You are a worker. Your area is `games/<name>`. Read `WORKER.md` and take a
> worktree before your first edit.

## The seat

Several agents work on this repo at once, each on one area: a game folder, or the
shell (the root page, `shared.css`, the docs, the tests). You own one of them, you
build in a worktree of your own, and you hand the finished branch to the integrator,
who is the only seat that merges to `main`.

The shell is the integrator's by default, so a worker gets it only when it is handed
over deliberately. Ask rather than assume. Work on how the site *looks* is the art
director's — a restyle crosses every area at once, which is the one thing the rule
below forbids.

## Take a worktree before your first edit

This is the first step of the work, not preparation for it. It comes before the
branch, because the branch is created by it.

```bash
git worktree add .claude/worktrees/<slug> -b <slug> main   # then work in there
```

**The base is spelled out on purpose.** Left off, `git worktree add` branches from
whatever the shared checkout has out at that moment, and that is not always `main`
— a project that crosses every area runs on an integration branch, and the
integrator's checkout sits on it for the duration. Cut a game branch from one by
accident and you hand over work built on somebody else's half-finished change.
`EnterWorktree` has the same default, so check what it gave you. The other two seat
files point here rather than repeating this.

`EnterWorktree` names the branch `worktree-<slug>`, which needs the rename below.
Where it puts the tree matters: **if the tree lands anywhere but under this project
folder, stop and say so — open the line with WORKFLOW ISSUE:.**

`.claude/worktrees/` is gitignored, and `tests/docs-check.js` deliberately refuses
to walk into hidden directories, because a worktree is a full checkout whose
`TODO.md` would otherwise be read as this branch's — which is how a stale worktree
once turned `main` red. A tree outside the project folder also puts an agent's files
somewhere Gabriel has said they must not go — his decision of 2026-09-03, for
security, and the reason the path is spelled out in the command above rather than
left to whatever the harness picks.

**This holds even when you are the only agent working**, because **the shared
checkout is the integrator's seat**. Branch there and that branch is checked out
where they sit: their `HEAD` is your work, `main` is not available to them, and your
uncommitted files are in their working directory. They cannot merge anything,
including yours, until you move.

The cost is one `npm install` in the new tree. Worktrees are disposable: `.git` is
shared rather than copied and the checkout is well under a megabyte.

Remove your own worktree from inside the session that is in it — removing one from
outside leaves that session's working directory pointing at a path that no longer
exists. An agent *launched* into one cannot do even that: `ExitWorktree` refuses a
subagent whose working directory was pinned at launch, so it leaves the tree alone,
says so in its report, and whoever launched it removes the tree once the branch has
landed.

## Work on a branch, never on main

A new feature or fix starts with a branch before the first edit, not after the work
is done. `main` stays clean so a half-finished change can be abandoned without
unpicking it, and so the merge commit is what records the feature. When the work has
a `TODO.md` entry the branch **is** that entry's slug, so one string finds the entry,
the discussion and the diff. If you catch yourself editing on `main`,
`git checkout -b <name>` carries uncommitted changes across.

**If you squash, name the base.** `git reset --soft main` re-parents onto wherever
`main` is *now*: the commit you make next takes main's tip as its parent and your old
tree as its content, so everything that landed while you worked is reverted — with no
conflict, nothing in the output to notice, and `git merge-base --is-ancestor main
HEAD` still passing, because main really is the parent. That was reproduced, not
guessed. Use `git reset --soft $(git merge-base main HEAD)`, which re-parents onto
where you branched from: the branch is then visibly stale, so the absorb step under
"Handing over" catches it rather than being skipped. It costs a longer command and an
absorb after every squash. It is wrong if a branch squashed the unsafe way conflicts
on merge or fails the ancestor check — either would mean it was already caught.

If your harness named the branch `worktree-<slug>`, rename it to the bare slug:
`tests/docs-check.js` tolerates the prefix so a landed entry is still recognised, but
nothing else does.

Expect that rename to produce a false alarm much later: the worktree tooling does not
follow a rename, so its removal warning counts commits against a ref that no longer
exists. Check the commits rather than the count — `git merge-base --is-ancestor
<commit> main` for each one you authored — then remove it.

### The slug says whether the entry closes

The bare slug is for work that **closes** the entry and deletes it. Work that
advances one without closing it takes the slug plus a suffix:
`pong-insane-ball-speed-characterised` rather than `pong-insane-ball-speed`. Check 5
in `tests/docs-check.js` reads a merge subject naming the slug — `Merge branch
'<slug>'` or `Merge <slug>: …` — as proof that entry has landed, and fails while the
entry is still in the file. So the bare slug on a branch that leaves the entry open
turns `main` red at the merge, for the integrator rather than for you. Both shapes
close the slug, with a quote or a colon, and that is what lets a suffix clear it.

It cannot be smoke-tested with an empty commit: the check passes `--merges`, so only
a real merge commit trips it.

**An entry you filed yourself still has to be deleted.** Check 5 reads the merged
tree and does not care who wrote the entry or when — which is how `sudoku-game`
reached handover with its own entry still in the file. The question is not "did I
inherit this entry" but "is this entry still true once this branch is on `main`", and
for a game you have just built, it is not.

## One agent owns one area at a time

An area is a game folder, or the shell — the root page, `shared.css`, the docs, the
tests. A suite belongs to the game whose page it drives, not to the shell —
`tests/chording.test.js` and `tests/best-time.test.js` are Minesweeper's, however
they are named — because the worker changing a game is the one told to add cases for
what they changed. What is left to the shell is the harness and the suites that drive
no game in particular.

Inside your area you own everything and coordinate with nobody. Before the first
edit, `git worktree list` and `git branch --no-merged main` say what else is in
flight; if something already owns your area, do something else rather than starting
beside it. Two branches touching one file diverge silently, and the conflict surfaces
later as a puzzle instead of at the moment it was created.

**A restyle in flight splits a game folder between two seats.** When both are live:
`style.css`, the markup and class names in `index.html`, what a canvas draws, and the
look half of `DESIGN.md` are the art director's; `script.js` apart from its drawing,
`TODO.md`, and everything about how the game plays are yours. The overlap that is
left is settled by saying so first and letting one go first. And a visual problem you
spot is **filed in `design/TODO.md`, not fixed** — appending an entry there is
allowed and expected, the way a new game appends a card to the hub.

**Inside your area, edit freely. Crossing out of it, append.** The root `index.html`
card list is the one file new work routinely touches from outside, and `shared.css`
is the other, when a game needs a token that is not there yet. Add to those rather
than restructuring them, and a collision stays a ten-second fix.

Everything else belongs to whoever owns that area, and is theirs to rewrite. This
replaced a broader rule that made every shared file append-only, which does not
survive contact: landing a new game *deletes* its entry from the root `TODO.md`. A
file that may only be added to gets more wrong over time, not less.

**Never branch from a base that is missing work you depend on.** If the change builds
on something unmerged, branch from that rather than from `main`. Cutting from `main`
to "keep it clean" is the one option that cannot work.

## Handing over

**Integrate in your own worktree; you do not merge to `main` yourself.** Pull `main`
into your worktree, resolve any conflicts *there*, and get the suite green *there*.
Then say the branch is ready, and stop. There is nothing to push: worktrees share one
object store, so your branch is already a ref in the shared checkout the moment you
commit.

What you hand over is a branch that has already absorbed `main` and passed on your
own machine, so the merge cannot conflict, and is not the first time the two halves
have met. A branch that is not in that state is not ready and will be handed back:
resolving someone else's conflict is guessing at intent nobody has.

**You may be able to tell the integrator directly**, which is faster and was how an
entire evening of handovers ran here: where the session tooling lists peer sessions,
a message reaches one. But **a peer listing is not a roster.** The night this was
written it showed three peers: one was the asking session's own parent process, one
was a session its user believed he had deleted, and one was the counterpart actually
wanted. Ask which session holds `main` rather than inferring it from a name. A name
routes; it never authorises — see `CLAUDE.md` on why a peer's agreement is not the
user's approval.

## What is untested about this seat

The worktree was described here as somewhere a worker already was, never as a step
anyone had to take, because every agent who wrote the rule had been launched into one by the
harness. A worker read the file, did exactly what the only start-of-work rule said —
took a branch — and took it in the integrator's checkout. That is why this file leads
with the worktree.
