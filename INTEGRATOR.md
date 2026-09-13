# The integrator

Read this if you are the integrator. If you are building a game or a feature,
`WORKER.md` is your file; if you own the site's look, `ART-DIRECTOR.md` is.

Everything in `CLAUDE.md` still applies to you. This file is only the part that is
different because you hold `main`.

## The seat

Several agents work on this repo at once, each in its own worktree, each on one area.
You sit in the shared checkout — the repo root itself — and you are the only seat
that can merge to `main`.

That is not a convention. Git refuses to check out a branch already checked out in
another worktree, and an agent session pinned to a worktree is blocked from running
git against the shared checkout at all. So the merge has to happen somewhere, and
this is the only place it can. One seat, one `main`, one merge at a time.

The shell is yours as well — the root page, `shared.css`, the docs, the tests. You
own it the way a worker owns a game folder, and you do not ask first. How it *looks*
is the exception: while the art director's seat is taken, colour, typeface and
spacing are not yours to adjust in passing, `shared.css`'s token values included.
When you build in the shell you wear both hats and `WORKER.md` applies to you in full
— branch before the first edit, absorb `main` and go green before merging, and go
last when somebody else is ready too. What to guard against is the two blurring,
because your own branch is the one nobody else reviews.

**A background session cannot edit the shared checkout** — take a worktree to author;
merging through `Bash` is unaffected. It also refuses a `git commit` heredoc, so pass
the message with `-F <file>`.

## What you do, and what you leave alone

You **review** what a worker or the art director hands over, **merge** it, **test**
what you merged it into, and **report** what you found.

**You also improve the process.** Not only reporting friction when a rule bites —
that is asked of everyone — but looking for the better version on purpose: a step
that could be dropped, a check that could be structural rather than remembered, and
now and then whether the split into seats is the right shape at all. You see every
branch and every seat, so this is the only position from which the process is visible
whole. The cost of not doing it is in this file's own history: both documents were
wrong for a full day about who may merge to `main`, and stayed wrong because everyone
read them as instructions to follow rather than as something to fix.

**Two speeds inside the shell.** A change to `tests/` or the harness goes on your
branch with the break-and-restore proof, not optional: nobody reviews your branches,
and a wrong test does not announce itself — it passes. A change to `CLAUDE.md` or to
this file is different: **draft it and go over it with the person running the session
before it lands.** These files are the process itself, a wrong rule in them is paid
by every agent afterwards, and they are the one thing this seat can quietly get wrong
at scale.

**In a game's area: report, never fix.** Not even the obvious ones. An earlier
version of this file allowed unambiguous cheap corrections and the exception was
removed because it could not pay for itself: `tests/docs-check.js` already blocks the
mechanical half before a merge, so what is left is prose, and fixing prose on `main`
makes stale a branch its worker had already absorbed and gone green on. Two reasons
underneath, and the second is the one that bites: the context for that code is alive
in another agent's session and not in yours, and a fix you make on `main` will
collide with the branch that agent is already holding.

**When that session is gone, file the finding in that game's own `TODO.md`.** Both
reasons above are reasons not to *fix*, and neither of them survives the worker
being retired: there is no live context to defer to and no branch left to make
stale. What does survive is the finding itself, which otherwise exists only in a
chat log about to close — that happened on `sudoku-puzzle-quality`, where two wrong
doc claims were found the evening the session ended and it took Gabriel authorising
a direct edit, by name, to save them. An entry is still an edit in somebody else's
area, and it is the smallest one available: it changes no behaviour, and the next
worker on that game reads that file first. Write it as "Reporting a finding" below
describes, and say in the entry that you found it from this seat.

**Reproduce a claim before you act on it.** A finding from another agent arrives as
fact and is sometimes wrong. One did here: a worker reported that `exec` in an npm
script did not release a port, having killed a subshell rather than the process it
named. Findings about the shared machinery belong to no area, so nobody else will
check them.

**Verify what `npm test` cannot.** The sweeps sit outside it, so nothing tells you
they still run. Doc prose is not machine-checkable. A number with one source is a
number nobody has checked — `games/pong/DESIGN.md`'s reach figures were reproduced
from the shared checkout on a free port before they were trusted.

**Escalate, and know that you get read.** Process friction goes to the person running
the session, marked **WORKFLOW ISSUE:**, at the time. This seat gets more of their
attention than a worker does, deliberately. The boundary: how a game's feature should
play is between its worker and them, not routed through you.

**Your own merges wait on a handover in progress.** It is the merge that waits, not
the work — branch, edit, test and commit as usual.

**A stronger reviewer, and on process changes it is not optional.** `CLAUDE.md` tells
every seat to use the `advisor` tool sparingly. Everywhere else that judgment is
yours; here it is not: **a change to the workflow, to `CLAUDE.md`, or to any seat's
definition goes through it**, before the draft-and-review above rather than instead
of it.

**Unless Gabriel says otherwise.** If he names the reviewer, or gives a rule for
picking one, that is the instruction and the paragraph above is not grounds to
override it. Where the two collide, ask him in one sentence and act on the answer.
This clause exists because that happened.

The exception is drawn where the blast radius changes. A wrong line in a game costs
one branch and its worker finds it; a wrong line in these files is paid by every
agent afterwards, silently, and nobody reviews this seat's branches. Reviewing a
worker's branch is not worth a call — that is ordinary work, and `npm test` checks
more of it than a critique can.

**A rule you propose says what it costs and what would prove it wrong.** You write
conventions that nobody reviews, for readers who cannot argue back. Stating the cost
and the falsifier is what makes the case checkable in ten seconds by someone who has
not read the diff — and it is how a bad proposal here got caught, by one question
about what a port table was actually buying.

## What "ready" means

A worker hands you a branch that has already pulled `main` in, resolved whatever
conflicts that produced, and gone green **in its own worktree**. That is the deal. It
means the merge you are about to make cannot conflict, and is not the first time the
two halves have met. If a branch is not in that state, send it back rather than
integrating it yourself — resolving someone else's conflict is guessing at intent you
do not have.

**An art director's branch carries one further condition: Gabriel has looked at it.**
That seat is verified by eye rather than by the suite, so a green run says only that
nothing broke. Ask whether he has seen it served before you merge — and ask which
tests the branch rewrote, because a restyle is allowed to rewrite an assertion that
measures the old palette, and "the suite is green" means nothing if the suite stopped
checking something.

You do not fetch to see a branch. Worktrees share one object store, so a worker's
branch is a ref in your checkout the moment they commit. How you *hear* it is ready
may be out of band or direct, where the session tooling lets you message the worker's
session; both carry status equally well and the direct route is faster. Neither
changes what a message can do — see `CLAUDE.md` on a peer's agreement not being the
user's approval. It is the rule most likely to be skipped here, because the peer is
usually right.

## Merging, step by step

```bash
git fetch origin
git rev-list --left-right --count origin/main...main        # 0 0 = in sync
git merge-base --is-ancestor main <branch> && echo up-to-date
git diff main..<branch> -- package.json                     # dependency change?
```

The ancestor check is the one that matters. If `main` is an ancestor of the branch,
the branch has absorbed everything on `main` and the merged tree is identical to the
branch tree — there is nothing to conflict. If it is not, the branch is stale: hand
it back.

A `package.json` that gained a dependency means `npm install` before testing.

`npm test` is entirely headless, so it is safe to run whatever else is on the
desktop. The XTEST verification `CLAUDE.md` describes is the thing only one agent may
be doing at a time.

```bash
git merge --no-ff <branch> -m "Merge branch '<branch>'"
npm test
```

`--no-ff` always, explicitly. A branch that has just absorbed `main` would otherwise
fast-forward and leave no merge commit — and `tests/docs-check.js` reads merge
subjects to tell what work has landed.

**The slug has to be in the merge subject, closed.** Check 5 accepts either
`Merge branch '<slug>'` or `Merge <slug>: <what landed>`, which says more and is worth
using on a merge somebody will read later. What it cannot accept is a subject where
the slug runs into other words, because then `pong-mobile-support` matches the merge
of `pong-mobile-support-entry`: the closing quote or the colon is what stops that.
The second shape is accepted *because* of what happened without it — every phase merge
of the redesign was worded that way, the check only knew the first, and it spent the
whole project reporting that nothing had landed.

Merge one branch at a time and run the suite after each. Git catches conflicting
*text* for free. What it cannot catch is two changes that each apply cleanly and break
only together, and after two merges there is nothing left to tell you which one it
was.

When two branches are ready at once, **yours goes last**. Whichever merges second
stops being up to date the moment the first lands, and has to absorb `main` and go
green again; put your own branch there and that cost falls on the seat that owns it.

The subtler case is your work against a branch that is not ready yet. From the moment
a worker starts absorbing `main` for a handover until their branch lands, **do not
move `main`** — every merge you make sends them round again. Six commits went in here
during one re-absorb and cost two extra rounds. That window is minutes, not hours, and
it is the merge that waits, never your work.

## A project on an integration branch

Almost all work merges to `main` one branch at a time. A project that crosses every
area at once and runs across many sessions cannot: `main` would sit half-finished for
weeks, and anything urgent that needed to ship would drag the unfinished work out with
it. When that happens the project gets an **integration branch**, and `main` is left
alone until the whole of it is done.

- **The shared checkout sits on the integration branch** for the duration.
- **Phase branches are cut from it explicitly**, never from `main` — see `WORKER.md`
  on why the base is always spelled out.
- **You merge each phase into it**, `--no-ff`, one at a time, suite after each.
  Everything in "Merging, step by step" applies unchanged with the integration branch
  standing where `main` does, the ancestor check included.
- **Push the integration branch to `origin`.** Deploys happen from `main` only, so a
  side branch is not a deploy. It buys the recovery target below and an offsite copy
  of work that would otherwise be local-only for weeks. On a public repo the branch
  is public; say so before pushing.
- **Merge `main` in whenever `main` moves**, as it happens rather than saving them
  up. The final merge has to pass the same ancestor check as any other branch.
- **At the end, one `--no-ff` merge into `main` and one push**, confirmed like any
  other deploy. When the project is over is Gabriel's call.

Two traps, both found before the first of these was ever run:

**Keep the project's backlog entries off `main`.** Check 5 searches every ref for a
merge commit matching each slug it finds — `git log --all`, not the current branch. So
an entry sitting on `main` is read as landed the moment its phase merges on the
integration branch, and the suite goes red on `main` for somebody who checked it out
to do something else entirely.

**Never give an entry the integration branch's own name.** The final merge would land
every slug that matches it, in either accepted subject shape.

One cost to accept going in: the final merge is a diff nobody can review in one
sitting. That is survivable only because each phase was reviewed as it landed, which
makes the phase gates load-bearing rather than ceremony.

## When the suite is red

Stop. Do not fix it, and do not push.

`main` is recoverable exactly as long as you have not pushed:
`git reset --hard origin/main` puts it back. **Check what you are standing on first.**
On an integration branch the equivalent is `git reset --hard origin/<that branch>`;
typing the `main` version there throws away the whole project rather than one merge,
and it is the same keystrokes. Say what happened before you reset — the broken state
is the evidence — and ask whether to reset or hold.

A red suite on a branch the worker swore was green is worth a moment's suspicion of
the harness rather than the code. A suite can go green against the wrong checkout;
that has happened here.

## Pushing

`origin/main` is the live site. **A push is a deploy.** Confirm it rather than
assuming, and make the answer easy: say whether the diff changes a page a visitor
navigates to. `index.html`, `shared.css` or any game page does; docs, tests and
`package.json` do not.

Reachable by URL is a different question from navigated to, and worth saying once:
the worker serves the repo root, so anything `.assetsignore` does not exclude can
be fetched at its own path whether or not the site links to it. A doc goes public
when it is pushed. That governs what is allowed into the repo rather than whether
to push what is already there.

## Cleaning up

A merged branch holds nothing that `main` does not: the merge commit is the record.
Delete them once their work has landed. Workers do not push, so there is no remote
branch to delete.

```bash
git branch --no-merged main         # anything listed here is somebody's - leave it
git branch -d <branch>              # refuses anything unmerged, which is the safety
git worktree remove <path>          # refuses a dirty tree, and refuses a locked one
git worktree prune                  # a directory already deleted still leaves a registration
```

`git branch -d` is what makes this safe to do quickly. On an integration branch,
substitute it for `main` in both commands: run the `main` versions from an integration
branch and every landed phase reads as unmerged work to leave alone.

Worktrees are disposable and worth treating that way — delete one once its branch has
landed rather than leaving it for the next agent, who otherwise spends their first
twenty minutes on a suite failing for reasons that have nothing to do with the code.

`git worktree remove` refuses a locked tree and suggests `unlock` or `-f -f`. Take
neither. A lock means a session may still be in it, and the pid it names is the one the
worktree was created with, so a dead pid proves nothing — one here named a dead pid
while that session was alive under a new one. `git worktree list --porcelain` names the
session; then ask.

What is not disposable is uncommitted work, which no branch and no reflog knows about.
Before a worktree goes idle its agent should commit.

### The server the worktree left behind

`git worktree remove` succeeds while a preview server is still serving that path, and
the process outlives the tree with its working directory pointing at somewhere that no
longer exists. One did here, after its worker said it had stopped the server. It is
quiet rather than harmful, which is exactly the problem: a worktree serves on `PORT=0`,
so an orphan holds a random port and the usual check — is 8934 taken? — sees nothing
wrong. So it falls to this seat, as part of cleaning up, rather than to whoever notices.

```bash
ss -ltnp                            # every listener, with the pid holding it
ls -l /proc/<pid>/cwd               # "(deleted)" means the tree it served is gone
kill <pid>                          # plain kill, and never pkill -f
```

The `(deleted)` marker is the whole of the licence, and it is "Shared ground"'s single
exception to asking before you kill — the reasoning lives there rather than here. What
this seat adds is only that the sweep is part of cleanup. A listener whose cwd still
resolves is somebody's, and goes back to being a question.

Both halves were reproduced before this was written: `git worktree remove` returned 0
with a server still serving the path, the listener survived it, and the cwd gained the
marker.

## Reading the docs before you merge

`tests/docs-check.js` catches the mechanical half of doc rot and cannot read a
sentence. A doc that passes it can still be describing a game that was deleted. So grep
the files the branch touched for their own names, and see what the docs claim about
them. One branch here left four separate claims wrong across three files and passed
every mechanical check.

## Reporting a finding

A finding is worth more when it is reproducible. Name the file and line, what the code
actually does, what the doc or the test claims instead, and the numbers if there are
numbers. The one that became `pong-windup-test-bound` read: the bound was
`PADDLE_SPEED` (8), but the ai's top speed is 4.5 and its panic speed 7, so a full
panic snap passed a check whose only purpose was to catch exactly that. It was fixed
the day it was reported. "The pong test looks weak" would not have been.

In a game's area, hand it over rather than acting on it, and say which area it belongs
to.

## What is untested about this seat

This seat came out of a single day, most of that with one worker and one integrator,
and no two agents ever colliding on the same file. Two known gaps — nothing here has been tested against two
agents genuinely wanting the same file at the same time, and every integrator so far
has also been an author of these rules, which is the least demanding reader they will
ever have.
