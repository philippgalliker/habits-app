# Git Workflow — Trunk-Based Development

This repository uses **trunk-based development**: `main` is the only long-lived branch
and is always in a releasable state. Every change — code, config, docs — reaches `main`
through a short-lived branch and a pull request gated by CI.

## The rules

| Rule                                          | Enforced by                                                     |
| --------------------------------------------- | --------------------------------------------------------------- |
| No direct pushes to `main`                    | Branch ruleset `protect-main`                                   |
| PR required for every change                  | Branch ruleset `protect-main`                                   |
| CI check `build` must pass before merging     | Required status check                                           |
| Squash merge only (1 PR = 1 commit on `main`) | Repo merge settings                                             |
| Squash commit message = PR title              | Repo merge setting "Default commit message: Pull request title" |
| Merged branches are deleted automatically     | Repo setting "Automatically delete head branches"               |
| No force pushes to `main`                     | Branch ruleset `protect-main`                                   |

Required PR approvals are currently **0** (solo project). Raise this in the ruleset when
a second contributor joins.

## Branch naming

`<type>/<short-kebab-description>` — keep branches small and short-lived (hours to days).

- `feat/entry-editing` — new functionality
- `fix/minutes-rounding` — bug fix
- `chore/ci-pipeline` — tooling, config, dependencies
- `docs/git-workflow` — documentation only

The branch type should match the type in the PR title (see next section).

## PR titles — Conventional Commits

PR titles follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
specification. The PR title becomes the squash commit on `main`, so the title format
**is** the history format:

```
<type>(<optional scope>): <short description in imperative mood>
```

| Example | Use for |
| --- | --- |
| `feat: add entry editing` | new functionality |
| `fix: round minutes correctly in daily sum` | bug fixes |
| `chore: update vitest to v4` | tooling, config, dependencies |
| `docs: add trunk-based workflow guide` | documentation only |
| `test: cover entriesByDay edge cases` | tests only |
| `refactor: extract date helpers` | no behavior change |
| `ci: add e2e job to pipeline` | CI/CD changes |

- Scope is optional: `feat(store): add entry editing`.
- Breaking change: append `!` — `feat!: change storage format`.
- Commits **on your branch** are free-form (they get squashed away), but using the
  same format is good practice.

Commits on `main` from before this convention keep their plain style; it applies
from here on.

## One-time machine setup

```sh
git config --global fetch.prune true
```

Makes every `fetch`/`pull` remove local references to branches that were deleted on
GitHub (which happens automatically after every merge).

## Standard flow

```sh
# 1. Start from an up-to-date main
git switch main
git pull

# 2. Create your branch
git switch -c feat/my-change

# 3. Work and commit (small commits are fine — they get squashed at merge)
git add <files>
git commit -m "Describe the change"

# 4. Publish the branch
git push -u origin feat/my-change

# 5. Open a pull request (or use the link GitHub prints after the push)
gh pr create --fill

# 6. Wait for the CI check to turn green.
#    Red? Fix locally, commit, push — the check reruns automatically.

# 7. Merge on GitHub: "Squash and merge".
#    The PR title becomes the commit message on main — Conventional Commits
#    format, e.g. "feat: add entry editing" (see "PR titles" above).

# 8. Clean up locally
git switch main
git pull
git branch -D feat/my-change
# -D (force) is required: after a squash merge, git cannot recognize the
# branch as merged (main got a new commit, not yours). Safe to force-delete
# once the PR shows as "Merged".
```

## If your PR conflicts with `main`

When `main` moves while your PR is open and GitHub reports conflicts:

```sh
git fetch
git merge origin/main   # on your branch; resolve conflicts, commit, push
```

Merging (not rebasing) is fine here — the merge commit disappears in the squash,
and you avoid force-pushing your branch.

## What CI checks

Defined in [.github/workflows/ci.yml](../.github/workflows/ci.yml), runs on every PR
and on every push to `main`:

| Check        | What it runs                                                          |
| ------------ | --------------------------------------------------------------------- |
| `CI / build` | `npm ci` → `npm run build` → `npm run test:unit` (Vitest, single run) |

## Why squash merge?

`main` stays a readable, linear list where one commit = one reviewed change. Your
work-in-progress commits ("wip", "fix typo") never reach `main`, so commit freely on
your branch.

## Why does CI run again after the merge?

The PR check tests a merge _preview_ against `main` as it was at check time. The
post-merge run on `main` validates what actually landed — it catches the rare case
where two individually green PRs conflict semantically.
