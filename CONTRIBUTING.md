# Contributing to Arct Studio

Thanks for helping improve Arct Studio. The project is local-first and licensed under AGPL-3.0-only.

## Before you start

- Use Node.js 24 and pnpm 12.
- Read the [README](README.md) for setup and build commands.
- For a substantial change, open an issue first so the approach can be discussed.
- Do not include API keys, tokens, personal data, or generated build output in a pull request.

## Development setup

```bash
pnpm install
pnpm dev:web
```

For the desktop shell, install the Tauri prerequisites and run `pnpm dev`.

## Checks

Run the checks that cover your change before opening a pull request:

```bash
pnpm lint
pnpm type-check
pnpm test
pnpm build:frontend
```

If you change a bundled tool, also build it and verify it opens from the studio:

```bash
pnpm tools:build <slug>
pnpm tools:finalize
```

## Adding or removing tools

1. Add or remove the tool directory under `tools/`.
2. Update the catalog in `src/data/apps.ts`.
3. Update the exclusion list in `scripts/build-tools.mjs` and `scripts/finalize-tools.mjs` if the tool should not be bundled.
4. Run `pnpm tools:build` and `pnpm tools:finalize`.
5. Commit the source and the updated `src/data/builtTools.ts`, but not `public/tools/`.

Cloud-only tools are out of scope for this local-first build. Tools that need a remote service should degrade clearly when it is unavailable and must not require an Arct account.

## Generated files

These directories are generated and ignored by git:

- `public/tools/`
- `dist/`
- `src-tauri/target/`
- `tools/**/node_modules/`
- `tools/**/dist/`
- `tools/**/tmp/`
- `ref/`

Do not commit them. The tool icons under `tools/<slug>/public/` are source assets and are committed.

## AI features

The studio never ships a Google AI key. Users enter their own key in Settings; it is stored in the local browser profile. Do not add a key to source, tests, fixtures, or CI.

## Tool licenses

The bundled tools come from different upstream projects. Keep their existing `LICENSE`, `README.md`, and third-party notice files intact. If you add a tool, include its license and attribution before opening the pull request.

## Pull requests

- Keep changes focused and explain why the change is needed.
- Include tests for user-facing behavior when practical.
- Update documentation when behavior, setup, or build steps change.
- By contributing, you agree that your contribution is licensed under AGPL-3.0-only.

## Code of conduct

Participation is covered by [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
