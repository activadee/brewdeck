# Contributing

## Branching

All work targets **`main`** (default branch).

```text
feature/* --[PR]--> main
```

Use squash or merge commits as your team prefers; CI runs on every pull request to `main`.

## Releases

Do **not** push version tags manually for normal pre-releases.

| Action | Result |
|--------|--------|
| Merge PR into `main` | Next `vX.Y.Z-beta.N` **pre-release** (unsigned macOS DMG/ZIP + `latest-mac.yml`) |
| **Release** workflow → `stable` (manual) | Stable `vX.Y.Z` marked **Latest** on GitHub |

### Pre-releases (automatic)

After each push to `main` (except `chore(release):` bot commits), **Bump and Tag** creates the next beta tag and runs the **Release** workflow.

### Stable release (manual)

When you are ready to ship to users (and auto-update):

1. Open **Actions** → **Release** → **Run workflow**.
2. Set **Release type** to `stable`.
3. Optionally set **Stable version** (e.g. `0.6.1`). If omitted, the version is taken from `package.json` on `main` (prerelease suffix is stripped).
4. Run on `main`.

The workflow tags `main`, builds, publishes a non-prerelease GitHub Release, and commits the aligned `package.json` version back to `main`.

### Unsigned build only

**Release** workflow → **Release type** `build-only` uploads artifacts to the workflow run without creating a GitHub Release.

## Auto-update

Packaged apps only pick up **stable** releases (`vX.Y.Z` without `-beta`). Pre-releases are for manual testing.

## Local development

See [README.md](README.md) for install, `npm run dev`, and tests.

## CI

Pull requests to `main` run **CI** (`test:all` + production build).
