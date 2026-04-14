# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

**Dropzones - USPA Dropzone Finder** is a React Native/Expo app (v4.0, New Architecture enabled) that lists all USPA member dropzones in the US. Published to the App Store and Google Play by Off The Grid Apps (`io.otgapps.dropzones`). The app uses `expo-sqlite` as its local database and fetches dropzone data from a remote GeoJSON file.

## Commands

```bash
# Development
pnpm start                    # Start dev server (requires dev client build)
pnpm ios                      # Run on iOS simulator
pnpm android                  # Run on Android emulator

# Type checking & linting
pnpm compile                  # TypeScript check (no emit)
pnpm lint                     # ESLint with auto-fix
pnpm lint:check               # ESLint without fix

# Testing
pnpm test                     # Run Jest tests
pnpm test:watch               # Jest in watch mode
pnpm test:maestro             # Maestro E2E tests

# Building (EAS local builds)
pnpm build:ios:sim            # iOS dev build for simulator
pnpm build:ios:device         # iOS dev build for device
pnpm build:ios:preview        # iOS preview build
pnpm build:ios:prod           # iOS production build
pnpm build:android:prod       # Android production build

# Data scraper (updates dropzone data)
pnpm scraper                  # Run Node.js scraper → outputs dropzones.geojson

# Dependency management
pnpm align-deps               # Fix Expo SDK version mismatches
```

## Architecture

### Data Flow

Dropzone data originates from USPA's website, scraped by the Node.js scraper in `scraper/` into a GeoJSON file hosted on GitHub. On app startup, the app seeds an `expo-sqlite` database from a bundled local GeoJSON asset, then periodically checks for remote updates (every 5 launches by default, configured via `Config.dataCheckInterval`). The remote GeoJSON URL is in `app/config/config.base.ts`.

### Directory Structure

- **`app/app.tsx`** — Root component; bootstraps fonts, i18n, navigation state, and wraps the tree in `ThemeProvider → PaperProvider → SafeAreaProvider → KeyboardProvider → DatabaseProvider`
- **`app/navigators/`** — Navigation stack: `TabNavigator` (two tabs: Dropzones + Map) → `PrimaryStack` / `MapStack` → individual screens
- **`app/screens/`** — Screen components; browse by state/region/aircraft/services/training, near-me (location-based), alphabetical, map, and dropzone detail
- **`app/database/`** — SQLite layer
  - `schema.ts` — `CREATE TABLE` statements; `dropzones` table stores array fields (aircraft, services, training, location) as JSON strings
  - `queries.ts` — All SQL queries; uses `withTiming()` wrapper for perf logging
  - `seed.ts` — Initial seeding from bundled GeoJSON asset + remote update seeding
  - `hooks/` — React hooks wrapping queries (`useDropzones`, `useNearbyDropzones`, `useFilteredDropzones`, `useDropzoneSearch`, etc.)
  - `index.ts` — `DatabaseProvider` context + `useDatabase()` hook
- **`app/services/data-update.ts`** — Logic for checking/applying remote GeoJSON updates; tracks launch count in MMKV storage
- **`app/theme/`** — Design token system; `ThemeProvider` + `useAppTheme()` hook; supports light/dark/system modes via MMKV persistence
- **`app/i18n/`** — i18next translations (en, es, fr, ar, hi, ja, ko); initialized in `app.tsx`
- **`app/config/`** — `config.base.ts` (shared), `config.dev.ts`, `config.prod.ts`; imported as `@/config`
- **`scraper/src/`** — Node.js scraper using Puppeteer + Cheerio; caches rendered HTML in `scraper/local_files/`

### Key Patterns

- **Path aliases**: `@/` maps to `app/` (configured via `tsconfig.json` `tsconfigPaths`)
- **Theme access**: Always use `const { theme, themed } = useAppTheme()` in components; `themed()` accepts style objects or functions receiving the theme
- **Database access**: All DB operations go through hooks in `app/database/hooks/`; raw queries live only in `app/database/queries.ts`
- **Storage**: `react-native-mmkv` for key-value persistence; wrapped by `app/utils/storage`
- **Icons**: `react-native-vector-icons` (FontAwesome)

### Data Update Mechanism

The `anchor` field (integer) is the USPA-assigned primary key for each dropzone. Aircraft names in the DB are raw strings like `"2 Cessna 182"` — `queries.ts` normalizes them (strips leading counts, trailing plurals) at query time for display and filtering.
