# Browser Arcade

A collection of browser games and an experiment in organizing Claude agents into a software development team.

**[Play the arcade](https://arcade404.com/)**

## About the project

Browser Arcade is a growing collection of games presented in a shared retro-inspired interface.

I built the project to explore a structured approach to agent-assisted development. Claude agents write the code. I lead the team, design features, set the visual direction, and decide what is ready to ship.

## The agent team

Each agent has a specific role:

- The **worker** implements features and fixes.
- The **integrator** reviews code, runs tests, and manages releases.
- The **art director** produces mockups and develops the visual direction.

Different roles use different models. Workers use Sonnet for implementation. The integrator and art director use Opus for work that requires broader judgment. The integrator can consult a more capable advisor on key upstream decisions. The art director can delegate suitable tasks to cheaper subagents.

The roles have separate instructions, responsibilities, and boundaries. This gives each agent a clear area of ownership while keeping the final decisions with me.

## Development workflow

1. I define the feature, its behavior, and its constraints.
2. When visual exploration is needed, the art director produces mockups.
3. A worker develops the change in an isolated Git worktree and branch.
4. Browser tests exercise the feature and guard against regressions.
5. The integrator reviews the code and verifies it against the latest version of the project.
6. I playtest the result and review the design before it goes live.

This structure lets the agents work quickly without sharing unfinished changes. Automated checks catch repeatable problems. Code review and hands-on playtesting cover the parts that require judgment.

## What I’m exploring

With each new game, I refine the workflow:

- How narrowly defined roles affect development speed
- How agents can work in parallel without colliding
- How model selection and context management affect cost
- Which decisions can be checked automatically
- Where human review has the most value

The goal is to ship features quickly, minimize costs, and maintain quality through structure and hands-on review.

## Technology

- Plain HTML, CSS, and JavaScript
- No framework, build step, or runtime dependencies
- Browser-driven tests using Playwright
- Git branches and worktrees for isolated development
- Cloudflare Workers for hosting

## Running locally

Clone the repository and start the local server:

```bash
git clone https://github.com/gabe-sd/arcade404.com.git
cd arcade404.com
npm run serve
```
