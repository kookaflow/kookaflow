# Plan: Fix theme leak on /dashboard + add branded light-mode treatment

## Issue 1 — Why /dashboard (and /calendar) ignore the chosen theme

**Source of truth (correct path):** `PreferencesProvider` (`src/providers/PreferencesProvider.tsx`) is the single owner of theme state. It loads prefs from `localStorage` (`shiftsync.prefs.v1`), pulls/pushes to Supabase `user_preferences`, and on every change sets `document.documentElement.dataset.theme` + toggles the `.dark` class. Tokens live in `src/styles/themes.css` (per `[data-theme="…"]` + `.dark`). `ThemeToggle` and `ThemeSettings` both go through this provider — that path works correctly.

**The bug:** `src/routes/_authenticated.dashboard.tsx` (lines 39–48) and `src/routes/_authenticated.calendar.tsx` (≈lines 44–60) each declare their own local `useState<"dark"|"light">("dark")` and run a `useEffect` that *forcibly toggles* `document.documentElement.classList` to `dark` on mount. They also render their own Sun/Moon button that only mutates this local state. Effects:
1. Overrides whatever mode `PreferencesProvider` just applied (mount race → always lands on dark).
2. Ignores `themeName` entirely — only flips `.dark`, never `data-theme`.
3. Cleanup restores the previous class state, so navigating away can leave the DOM stale.

**Per-page audit:**
| Route | Uses provider? | Rogue local theme state? | Behaviour |
|---|---|---|---|
| /calendar | no | yes (forces dark) | broken |
| /dashboard | no | yes (forces dark) | broken |
| /settings | yes (via ThemeSettings) | no | correct |
| /onboarding | yes (indirect) | no | correct |

**Fix:** Delete the local `theme`/`setTheme` state and the `useEffect` mutating `documentElement` in both route files. Replace the inline Sun/Moon button with the shared `<ThemeToggle />` (`src/components/layout/ThemeToggle.tsx`), which already calls `usePreferences().toggleMode`. Nothing else needed for Issue 1.

## Issue 2 — Branded light-mode treatment

Goal: in light mode, every main page shows the chosen theme's brand gradient at the top, a soft off-white content surface, and coloured accents on cards. Dark mode unchanged.

### New design tokens (in `src/styles/themes.css`, light mode of each theme)

- `--page-header-from`, `--page-header-to` — gradient stops:
  - slate:    `#1E3A5F` → `#312E81`
  - midnight: `#0F172A` → `#1E3A5F`
  - lavender: `#7C3AED` → `#C026D3`
  - forest:   `#064E3B` → `#065F46`
- `--page-header-foreground: #FFFFFF`
- `--content-surface: #F8FAFC` (used as page bg below the header)
- `--card: #FFFFFF`
- `--card-shadow: 0 2px 12px rgba(0,0,0,0.06)`
- `--divider: #F1F5F9`

Map into Tailwind via the existing `@theme inline` block in `src/styles.css` (e.g. `bg-page-header-from`, `text-page-header-foreground`, `shadow-card`, `border-divider`). Dark mode keeps current values.

### New shared component: `PageHeader`

`src/components/layout/PageHeader.tsx`:
1. ~120px band with `linear-gradient(135deg, var(--page-header-from), var(--page-header-to))` and white text.
2. `children` slot for per-page title/controls.
3. SVG wave at bottom, fill = `var(--content-surface)`, so it visually flows into the body.
4. In dark mode the wave fill resolves to the dark background token — no clash.

### Per-page application

- `/calendar`: replace current sticky header with `<PageHeader>` containing month/year title, `<ViewToggle />`, Today button, `<NewEventButton />`, `<ThemeToggle />`.
- `/dashboard`: `<PageHeader>` with greeting (`Good morning/afternoon/evening, {firstName}` from `supabase.auth.getUser().user_metadata.full_name` or email prefix), today's date subtitle, compact Balance Score ring on the right.
- `/settings`: `<PageHeader>` with "Settings" title + user name/avatar.
- `/onboarding`: leave as-is (already on-brand).

### Card / category treatment (light mode only)

- `src/components/dashboard/CategoryCard.tsx`: 4px left border in `var(--cat-{category})`; icon chip bg = `color-mix(in oklab, var(--cat-…) 10%, white)`, icon at full colour.
- `src/components/calendar/EventBlock.tsx`: bg `color-mix(… 15%, white)`, 4px left border + text in full category colour.
- `src/components/events/EventForm.tsx` category chip: same 15%/full pattern.
- `src/components/shared/CategoryBadge.tsx` (shift-type badges): full category bg, white text.
- Section headings: switch from `text-foreground` to theme accent token where the brief specifies.
- Default card container: `bg-card shadow-card` + `divide-divider`.

### Implementation order (safe)

1. Fix Issue 1 — strip rogue theme state from dashboard + calendar, swap in `<ThemeToggle />`. Verify all four themes apply on all four pages.
2. Add tokens to `themes.css` + Tailwind mappings in `styles.css`. No visual change yet.
3. Build `PageHeader` and adopt on `/settings` first (lowest risk).
4. Roll `PageHeader` to `/dashboard` then `/calendar`, preserving every existing control.
5. Apply card/category light-mode treatment to `CategoryCard`, `EventBlock`, `CategoryBadge`, `EventForm` chips. Check dark mode after each step.
6. QA all four themes × light/dark on `/calendar`, `/dashboard`, `/settings`, `/onboarding`.

### Out of scope (per brief)
- Auth, Supabase data logic, routing, navigation structure.
- Dark mode visuals.
- Life category hue definitions.
