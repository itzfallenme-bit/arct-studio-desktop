<p align="center">
  <img src="public/icon.svg" width="96" alt="Arct Studio" />
</p>

<h1 align="center">Arct Studio</h1>

<p align="center">
  40 local-first productivity tools in one open-source desktop workspace.
</p>

Arct Studio packages writing, spreadsheets, design, media, business, and engineering tools into a single Tauri app. Documents, settings, and tool data stay on your machine unless a tool explicitly talks to a service you choose.

The app is derived from [Nuclear](https://github.com/nukeop/nuclear) and keeps its AGPL-3.0-only license. See [NOTICE.md](NOTICE.md) for upstream attribution.

## What is included

- **40 bundled tools** covering notes, documents, spreadsheets, presentations, PDF, whiteboards, CAD, circuits, 3D, audio, video, accounting, CRM, projects, and more.
- **Local tool runtime** — tools use a local IndexedDB compatibility layer instead of the Puter cloud SDK.
- **Your own Google AI key** — optional AI features use Google Gemini. The key is entered in Settings and stored locally on your device.
- **No Arct account, no telemetry, no Arct cloud.**

Some tools retain optional integrations from their upstream projects. Those integrations only run when you use them.

## Download

Prebuilt installers are published on the [Releases page](https://github.com/itzfallenme-bit/arct-studio-desktop/releases). The build workflow produces Windows, macOS, and Linux bundles.

## Development

### Prerequisites

- Node.js 24 (see `.node-version`)
- pnpm 12
- Rust stable and the [Tauri 2 system dependencies](https://v2.tauri.app/start/prerequisites/) for desktop builds

### Install and run

```bash
pnpm install
pnpm dev:web      # browser UI, fastest for app-shell work
pnpm dev          # Tauri desktop window
```

The browser UI opens the studio shell. Bundled tools need to be built before their iframe routes exist.

### Build the tools

```bash
pnpm tools:build
pnpm tools:finalize
```

`tools:build` installs each tool's dependencies with npm and builds it into `public/tools/<slug>`. The first run can take a long time because it builds all 40 tools. Re-running skips tools that already have an `index.html`; remove a tool's output directory to rebuild it.

`tools:finalize` verifies the expected catalog is present and regenerates `src/data/builtTools.ts`.

Each bundled tool keeps its upstream icon and branding. The Arct mark is used for the studio app itself.

### Build the desktop app

```bash
pnpm tools:build
pnpm tools:finalize
pnpm build
```

`pnpm build` runs the Tauri build, which invokes `pnpm build:frontend` and packages `dist/` with the Rust shell.

Frontend-only production build:

```bash
pnpm build:frontend
```

### Checks

```bash
pnpm lint
pnpm type-check
pnpm test
```

## Project layout

| Path | Purpose |
|------|---------|
| `src/` | Studio shell, catalog, views, and local state |
| `src-tauri/` | Tauri 2 desktop shell and icons |
| `packages/` | Vendored Nuclear UI, i18n, model, and shared config packages |
| `tools/` | Source for the 40 bundled tools |
| `tools/_shared/` | Local runtime shim, Google AI client, and shared logo |
| `scripts/` | Tool build, finalization, and icon generation scripts |
| `public/tools/` | Generated tool builds (ignored by git) |
| `dist/` | Generated frontend build (ignored by git) |

## CI and releases

- `.github/workflows/ci.yml` runs lint, type checks, tests, and the frontend build on every push and pull request.
- `.github/workflows/build.yml` builds desktop installers on demand and publishes a draft GitHub release when a `v*` tag is pushed.

To cut a release:

```bash
git tag v0.1.0
git push origin v0.1.0
```

The workflow builds Linux, Windows, and universal macOS bundles. Review the draft release before publishing it.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Please report security issues privately as described in [SECURITY.md](SECURITY.md).

## License

Arct Studio is licensed under the [GNU Affero General Public License v3.0](LICENSE), SPDX identifier `AGPL-3.0-only`.

The bundled tools retain their own licenses. See each tool's `LICENSE`, `README.md`, and `THIRD_PARTY_NOTICES` files before redistributing a modified build.
