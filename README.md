<div align="center">
  <img src="public/icons/tray-icon.svg" alt="Brewdeck" width="128" height="128" />

  # Brewdeck

  **A beautiful macOS menu bar app for Homebrew**

  [![CI](https://github.com/activadee/brewdeck/actions/workflows/ci.yml/badge.svg)](https://github.com/activadee/brewdeck/actions/workflows/ci.yml)
  [![Release](https://github.com/activadee/brewdeck/actions/workflows/release.yml/badge.svg)](https://github.com/activadee/brewdeck/actions/workflows/release.yml)
  [![Angular](https://img.shields.io/badge/Angular-21.1-%23DD0031)](https://angular.dev/)
  [![Electron](https://img.shields.io/badge/Electron-42-%2347848F)](https://www.electronjs.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-%2306B6D4)](https://tailwindcss.com/)
  [![macOS](https://img.shields.io/badge/macOS-11%2B-%23000000)](https://support.apple.com/macos)
  [![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

  <br />

  **Brewdeck brings the power of Homebrew to your macOS menu bar.**  
  Browse, install, manage, and update your formulae and casks — all without touching a terminal.

  <br />
</div>

---

## ✨ Features

| | Feature | Description |
|---|---|---|
| 📦 | **Package Inventory** | Browse all your installed formulae and casks with search, filter, and sort |
| 🔄 | **Smart Upgrades** | Upgrade single packages, batch-select multiple, or use the smart upgrade planner that groups updates by criticality |
| 🔔 | **Update Channels** | Updates classified as **critical**, **security**, or **normal** — see at a glance what needs attention |
| 🔍 | **Catalog Browser** | Search the full Homebrew catalog with local cache fallback for offline use |
| ⚡ | **Tray Popover** | Quick glance at pending updates, check intervals, and one-click check from the menu bar |
| 📋 | **Action Templates** | Save and replay common multi-package operations — install your dev toolkit with one click |
| 📜 | **Job History** | Track every install, upgrade, and uninstall with timestamps, stats, and recovery |
| 🛠️ | **Services Manager** | Start, stop, and restart Homebrew services from a clean UI |
| 🔧 | **Taps Manager** | Add, remove, and browse taps without terminal commands |
| 🩺 | **Doctor & Cleanup** | Run `brew doctor` and `brew cleanup` with previews and confirmation |
| ⌨️ | **Command Palette** | Quick actions and navigation with keyboard shortcuts |
| 📦 | **Batch Operations** | Multi-select packages for batch install, upgrade, uninstall, and pin |

## 🖼️ Screenshots

> *Coming soon — screenshots of the tray popover, installed packages view, catalog browser, and more.*

---

## 🚀 Installation

### Download

Grab the latest DMG or ZIP from the [Releases page](https://github.com/activadee/brewdeck/releases).

> **Note:** Builds are unsigned. macOS Gatekeeper may block first launch.  
> **Workaround:** Right-click → **Open** from Finder, or allow in **System Settings → Privacy & Security**.

### Or build from source

```bash
git clone https://github.com/activadee/brewdeck.git
cd brewdeck
npm install
npm run dev          # Development mode with hot reload
npm run build        # Production build
npm run package:mac  # Package as .dmg / .zip
```

---

## 🧱 Stack

| Layer | Technology |
|---|---|
| **Desktop Shell** | [Electron 42](https://www.electronjs.org/) |
| **UI Framework** | [Angular 21.1](https://angular.dev/) (standalone, control flow) |
| **State Management** | [@ngrx/signals](https://ngrx.io/guide/signals) signal stores |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) + [CVA](https://cva.style/) + `tailwind-merge` |
| **Component Library** | Custom shadcn/ui-style library (50+ components) |
| **Icons** | [Lucide](https://lucide.dev/) |
| **Carousel** | [Embla](https://www.embla-carousel.com/) |
| **IPC** | Typed, validated contracts with Zod |
| **Packaging** | [electron-builder](https://www.electron.build/) + `electron-updater` |
| **CI/CD** | GitHub Actions — automated beta/stable releases |

---

## 🛠️ Development

```bash
npm install
npm run dev
```

This concurrently starts:

1. **Angular dev server** on `http://127.0.0.1:4200`
2. **Electron TypeScript watcher** (tsup)
3. **Electron app** window pointing at the dev server

### Available scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server + Electron with hot reload |
| `npm run build` | Production build (Angular + Electron) |
| `npm test` | Run Angular unit tests |
| `npm run test:node` | Run Node/Electron unit tests (vitest) |
| `npm run test:all` | Run all tests |
| `npm run package:mac` | Package signed/unsigned macOS app |

---

## 📦 Release Workflow

Brewdeck uses an automated CI release pipeline. See [CONTRIBUTING.md](CONTRIBUTING.md) for full details.

| Trigger | Release Type |
|---|---|
| **Schedule** (every 6h) or workflow_dispatch `beta` | Pre-release `vX.Y.Z-beta.N` |
| Push tag `vX.Y.Z` or workflow_dispatch `stable` | **Latest** release (unsigned) |
| workflow_dispatch `build-only` | CI build without GitHub Release |

In-app auto-updates are enabled by default on packaged builds (`ENABLE_AUTO_UPDATES=1`).  
The app checks GitHub Releases for new tags and notifies you when an update is ready.

---

## 🤝 Contributing

Contributions are welcome! Check out [CONTRIBUTING.md](CONTRIBUTING.md) for:

- Local development setup
- Coding conventions
- PR guidelines
- Release process

---

## 🧪 IPC Contract

Brewdeck uses a fully typed, Zod-validated IPC boundary between the renderer and main process.  
All channels and contracts are documented in:

- `src/shared/contracts.ts` — request/response types
- `electron/ipc-channels.ts` — channel name constants

---

## 📄 License

MIT © [activadee](https://github.com/activadee)
