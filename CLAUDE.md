# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

"Dropzones - USPA Dropzone Finder" — a React Native (Expo) app that lists USPA-certified skydiving dropzones across the US, with search/filter by state, region, aircraft, services, and training, plus a map view and "near me" lookup. Built on the Infinite Red **Ignite** boilerplate.

## Commands

```bash
pnpm start                # expo start --dev-client
pnpm ios / pnpm android    # expo run:ios / run:android (native build + launch)
pnpm web                   # expo start --web

pnpm compile                # tsc --noEmit -p . --pretty (type check)
pnpm lint                   # eslint . --fix
pnpm lint:check             # eslint . (no autofix)

pnpm test                   # jest
pnpm test:watch             # jest --watch
npx jest path/to/file.test.tsx           # run a single test file
npx jest -t "test name"                  # run tests matching a name

pnpm test:maestro           # maestro test -e MAESTRO_APP_ID=io.otgapps.dropzones .maestro/flows

pnpm dep:cruise              # dependency-cruiser check against .dependency-cruiser.js rules
pnpm scraper                 # node scraper/src/index.js — regenerates assets dropzone data
```

Package manager is **pnpm** (see `pnpm-lock.yaml`, `.npmrc`). Node >=20 required.

## Architecture

### Data layer: local SQLite, remote sync
Dropzone data lives in an on-device SQLite database (`expo-sqlite`), not fetched live per-screen:

- `app/database/database.ts` — opens/closes the singleton `SQLite.SQLiteDatabase`.
- `app/database/schema.ts` — creates the `dropzones` and `metadata` tables on first run (idempotent, checks `sqlite_master`).
- `app/database/seed.ts` — seeds the DB from a bundled dataset (`LOCAL_DATA_VERSION`) or from remote GeoJSON.
- `app/database/queries.ts` — all raw SQL query functions (by id, by state, grouped by state, filtered, search, unique aircraft/services/training).
- `app/database/hooks/` — React hooks wrapping the queries (`useDropzone`, `useDropzones`, `useDropzonesByState`, `useFilteredDropzones`, `useNearbyDropzones`, `useDropzoneSearch`, etc.) plus `useDatabase` for init state.
- `app/database/index.ts` is the single public entry point — import from `@/database`, not from the internal files directly.
- `app/services/data-update.ts` — checks `Config.dataUpdateUrl` (a GeoJSON file in the sibling `OTGApps/Dropzones` repo on GitHub) for a newer `metadata.version` than what's stored, and re-seeds the DB when found. The check only runs every `Config.dataCheckInterval` app launches (tracked via `app/utils/storage`, MMKV-backed).
- The `scraper/` directory (separate Node script, not part of the Expo app) is what originally produces that GeoJSON by scraping the USPA site — see `scraper/README.md`. It is not run by the app itself.

`app/app.tsx` blocks rendering behind `DatabaseProvider` / `useDatabase().isReady`, showing `LoadingScreen` until the schema exists and is seeded.

### Config
`app/config/index.ts` merges `config.base.ts` with `config.dev.ts` or `config.prod.ts` based on `__DEV__`. These files are intentionally committed (not gitignored) — see the comment in `config/index.ts` for why (bundled JS is inspectable regardless).

### Navigation
`react-navigation` with a nested stack structure:
- `AppNavigator` (`app/navigators/AppNavigator.tsx`) → `TabNavigator` (bottom tabs: **dropzones**, **map**).
- `dropzones` tab → `PrimaryStack` → `PrimaryNavigator` (list/browse screens: alphabetical, by-state, by-region, by-aircraft, by-services, by-training, dropzone detail) + a modal `about` screen.
- `map` tab → `MapStack` → `MapNavigator` (map view, presented modally).

Navigation state persists via `useNavigationPersistence` (`app/navigators/navigationUtilities.ts`) using the same `app/utils/storage` MMKV wrapper, gated by `Config.persistNavigation`.

### Theming
`app/theme/context.tsx` (`ThemeProvider` / `useAppTheme()`) drives both React Navigation's theme and app styles, following the Ignite themed-style pattern (`themed()` fn + `ThemedStyle` type over `app/theme/{colors,colorsDark,spacing,spacingDark,typography,timing}.ts`). Supports light/dark plus a user override persisted via MMKV, independent of the OS `useColorScheme`.

### i18n
`app/i18n/` — `i18next` + `react-i18next`, translations per language file (`en.ts`, `es.ts`, `fr.ts`, `ar.ts`, `hi.ts`, `ja.ts`, `ko.ts`). `initI18n()` is awaited in `app.tsx` before render. Use `translate()` (`app/i18n/translate.ts`) for non-component strings.

### Path aliases
`@/*` → `app/*`, `@assets/*` → `assets/*` (see `tsconfig.json`). Use these instead of relative `../../` imports.

## Conventions (from `.eslintrc.js`)

- Import React hooks/types as named exports (`import { useState } from "react"`), never `import React from "react"`.
- Use `SafeAreaView` from `react-native-safe-area-context`, not from `react-native`.
- Import order is enforced and alphabetized: external packages → `@/*` internal → relative imports, with blank lines between groups.
