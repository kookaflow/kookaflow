# 4-Theme System Plan

## Goals

- Four named themes (Midnight, Lavender, Forest, Slate), each with light + dark variants → 8 token sets.
- Instant switching across the whole app, no reload.
- Persisted in `localStorage` immediately and synced to Supabase `user_preferences` once authenticated.
- Default on first launch: **Slate**, mode = `light` (matches OS if `prefers-color-scheme: dark`).
- Theme picker on `/settings` rendered as visual cards with mini color previews.

## Architecture overview

```text
PreferencesProvider (extended)
  ├─ state: { themeName: 'slate'|'midnight'|'lavender'|'forest', mode: 'light'|'dark', ... }
  ├─ source of truth: localStorage → hydrated from Supabase on auth
  ├─ applies: <html data-theme="slate" class="dark">
  └─ exposes: useTheme() { themeName, mode, setTheme, setMode, toggleMode }

src/styles/themes.css         ← new, imported from styles.css
src/lib/themes.ts             ← theme registry (names, labels, preview swatches)
src/components/settings/ThemeSettings.tsx   ← visual card selector
```

## CSS variable structure

Single source of truth in `src/styles/themes.css`, layered on top of the existing token contract in `src/styles.css` (no changes to `@theme inline` — the same `--background`, `--primary`, etc. tokens are reassigned per theme).

Selectors use `[data-theme="…"]` on `<html>`, combined with the existing `.dark` class for mode:

```css
[data-theme="slate"]                 { /* light tokens */ }
[data-theme="slate"].dark            { /* dark tokens  */ }
[data-theme="midnight"]              { … }
[data-theme="midnight"].dark         { … }
[data-theme="lavender"]              { … }
[data-theme="lavender"].dark         { … }
[data-theme="forest"]                { … }
[data-theme="forest"].dark           { … }
```

Each block redefines the existing semantic tokens (`--background`, `--foreground`, `--card`, `--primary`, `--accent`, `--muted`, `--border`, `--ring`, destructive, plus the `--cat-*` category palette) using `oklch()`. The brand-spec hex values are converted to oklch for the three "signature" slots:

| Theme    | bg (light/dark)        | accent → `--primary` | highlight → `--accent` / `--ring` |
|----------|------------------------|----------------------|------------------------------------|
| Midnight | #F8FAFC / #0F172A      | teal #14B8A6         | amber #F59E0B                      |
| Lavender | #F5F3FF / #1E1B2E      | violet #7C3AED       | coral #F43F5E                      |
| Forest   | #F0FDF4 / #1C1C2E      | emerald #10B981      | yellow #FCD34D                     |
| Slate    | #F8FAFC / #0F172A      | blue #3B82F6         | orange #F97316                     |

Category dots (`--cat-work` … `--cat-personal`) get per-theme tuning so they stay legible on each background, but the token *names* never change → no component churn.

## Theme registry (`src/lib/themes.ts`)

```ts
export type ThemeName = 'slate' | 'midnight' | 'lavender' | 'forest';
export type ThemeMode = 'light' | 'dark';

export const THEMES: Array<{
  name: ThemeName;
  label: string;
  description: string;
  preview: { bgLight: string; bgDark: string; accent: string; highlight: string };
}> = [ … ];
```

Used by the settings card grid for preview swatches; nothing else hard-codes hex.

## Provider changes

Extend `src/providers/PreferencesProvider.tsx`:

- `UserPreferences` (in `src/types/preferences.ts`) gains `themeName: ThemeName`; existing `theme: 'dark'|'light'` is renamed to `mode`.
- On mount: hydrate from `localStorage` (`shiftsync.prefs.v1`). If absent → `{ themeName: 'slate', mode: prefers-color-scheme }`.
- Effect: set `document.documentElement.dataset.theme = themeName` and toggle `.dark` for mode. Runs on every change → instant, no reload.
- New methods: `setThemeName(name)`, `setMode(mode)`, keep `toggleTheme()` as alias of `toggleMode`.
- `ThemeToggle` in the top bar keeps working (it flips `mode`).

## Supabase sync

- `user_preferences.theme` (text) already exists. Repurpose it to store `themeName`; add a sibling field for mode by reusing the existing column convention:
  - Option A (preferred, zero-migration): store JSON-encoded `{ name, mode }` in the existing `theme` column.
  - Option B: add `theme_mode text` column. Slightly cleaner, costs one migration.
  - Plan picks **Option B** for clarity.
- Migration: `ALTER TABLE user_preferences ADD COLUMN theme_mode text NOT NULL DEFAULT 'dark' CHECK (theme_mode IN ('light','dark'));` and widen the `theme` column's allowed set to the four names (drop any existing CHECK, add new one).
- Update `src/lib/preferences.functions.ts` `PreferencesUpdateSchema`: `theme: z.enum(['slate','midnight','lavender','forest']).optional()` and `theme_mode: z.enum(['light','dark']).optional()`.
- Sync rules in the provider:
  - On auth state = signed-in: fetch preferences, merge into local state (server wins for `themeName` / `mode` if both present).
  - On change while signed-in: debounce 400 ms → `updatePreferences({ theme, theme_mode })`.
  - On sign-out: keep last theme in `localStorage` (good UX).
  - Migration shim: existing local prefs with `theme: 'dark'|'light'` → mapped to `{ themeName: 'slate', mode: <that value> }` on first load.

## Settings UI (`/settings`)

New section `<ThemeSettings />` placed above `RemindersSettings` (themes are the most discoverable preference). Layout for the current 571px viewport: 2-column card grid → 4 cards.

Each card:

```
┌────────────────────────────┐
│  ▢▢▢▢   ← 4 swatches       │
│  Slate                     │
│  Calm, broad-appeal blue   │
└────────────────────────────┘
```

- Swatches show background, surface, accent, highlight (rendered with inline `style` from `THEMES.preview`, not Tailwind classes — only place hex is allowed in components).
- Selected card: ring in `--ring`, checkmark badge.
- Below the grid: a `Light / Dark / System` segmented control bound to `mode`.
- Switching either control applies instantly via the provider.
- Persists to localStorage immediately; queues the Supabase write.

## Files touched

- **New:** `src/styles/themes.css`, `src/lib/themes.ts`, `src/components/settings/ThemeSettings.tsx`.
- **Edit:** `src/styles.css` (import themes.css; remove the hard-coded `:root` / `.dark` blocks that now live per-theme), `src/types/preferences.ts`, `src/providers/PreferencesProvider.tsx`, `src/components/layout/ThemeToggle.tsx` (point at `mode`), `src/routes/settings.tsx` (mount `<ThemeSettings />`), `src/lib/preferences.functions.ts` (schema).
- **Migration:** add `theme_mode` column + update CHECK on `theme`.
- **Untouched:** every component already on semantic tokens — no visual regressions expected outside the four palettes.

## Open question

- Do you want a `System` (auto light/dark) option in addition to explicit Light/Dark? If yes, provider listens to `matchMedia('(prefers-color-scheme: dark)')` while `mode === 'system'`. Default assumption in this plan: **yes, include System**.
