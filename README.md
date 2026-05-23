# Brew Sidebar

Minimalistic macOS Electron wrapper around Homebrew with Angular 21, Tailwind CSS 4, and Signal Stores.

## Features

- Installed package inventory for formulae and casks
- Outdated package detection with upgrade actions (`upgrade one`, `upgrade all`, smart upgrade)
- Update channels (critical, security, normal)
- Catalog browsing backed by Homebrew API + local cache fallback
- Action templates, job history, and batch multi-select actions
- Tray popover with update count, interval settings, and quick actions
- Typed, validated IPC boundary between renderer and Electron main process

## Stack

- Angular `21.1.5` (standalone + control flow + hash routing)
- `@ngrx/signals` signal stores
- Tailwind CSS `4.2.1`
- Electron `40.6.1`
- electron-builder `26.8.1`

## Development

```bash
bun install
bun run dev
```

This starts:

1. Angular dev server on `http://127.0.0.1:4200`
2. Electron TypeScript build watcher (`tsup`)
3. Electron desktop app

## Test

```bash
bun run test        # Angular unit tests
bun run test:node   # Electron/node tests (vitest)
bun run test:all
```

## Production Build

```bash
bun run build
bun run package:mac
```

Outputs are generated in `release/`.

## GitHub Release (unsigned DMG)

Pushing a version tag builds a macOS DMG on GitHub Actions and attaches it to a GitHub Release:

```bash
git tag v0.5.0
git push origin v0.5.0
```

You can also run the **Release** workflow manually from the Actions tab (`workflow_dispatch`); artifacts are uploaded to the workflow run (no GitHub Release unless you use a tag).

The CI job sets `CSC_IDENTITY_AUTO_DISCOVERY=false`, so builds are **unsigned**. macOS may block first launch until the user uses **Right-click → Open** (see Signing below).

## Auto-update readiness

`electron-builder` publish config is intentionally set to a placeholder URL:

- `https://example.com/auto-updates/`

Replace this and provide signing/notarization secrets in CI before enabling release auto-updates. Set `ENABLE_AUTO_UPDATES=1` in packaged builds to enable the updater.

### Signing (release tags)

Documented environment variables for macOS release:

- `CSC_LINK` — code signing certificate
- `CSC_KEY_PASSWORD` — certificate password
- `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, `APPLE_TEAM_ID` — notarization

## IPC contract

Main channels (request-response):

- `app:openMain`, `app:windowControl`, `app:getWindowChrome`
- `brew:getAvailability`, `brew:getInstalled`, `brew:getOutdated`
- `brew:getTaps`, `brew:getServices`, `brew:getPackageDetails`
- `brew:searchCatalog`
- `brew:installOne`, `brew:reinstallOne`, `brew:uninstallOne`
- `brew:pinOne`, `brew:unpinOne`
- `brew:upgradeOne`, `brew:upgradeAll`, `brew:getSmartUpgradePlan`, `brew:upgradeSmart`
- `brew:upgradeMany`, `brew:uninstallMany`, `brew:pinMany`
- `brew:getUninstallImpact`
- `brew:tapAdd`, `brew:tapRemove`
- `brew:serviceStart`, `brew:serviceStop`, `brew:serviceRestart`
- `brew:cleanupPreview`, `brew:cleanupRun`, `brew:doctorRun`
- `brew:checkNow`, `brew:syncMetadata`
- `templates:list`, `templates:save`, `templates:delete`, `templates:run`
- `history:list`, `history:stats`
- `jobs:recover`
- `settings:get`, `settings:update`

Event channels:

- `updates:changed`
- `app:windowChromeChanged`
- `brew:job-progress`, `brew:job-complete`, `brew:job-failed`
- `app:updateAvailable` (packaged builds with auto-update enabled)

All contracts are defined in:

- `src/shared/contracts.ts`
- Channel names in `electron/ipc-channels.ts`
