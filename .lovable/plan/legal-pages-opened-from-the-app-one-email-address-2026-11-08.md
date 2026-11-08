# Legal pages opened from the app + one email address

## 1. "Opened from the app" mode (`?from=app`)

**Adding the marker**
- When the phone app opens Privacy, Terms, Support, EULA or Delete Account in the in-app browser, the address gets `?from=app` added (existing `#anchors` such as `#delete-some-data` are kept).
- This covers both the More page buttons and any other link in the app that points at those pages (the app-wide link guard).

**What the pages hide when `from=app` is present**
- The Kookaflow logo link at the top (logo still shows, just not clickable).
- "Back to sign in" at the bottom.
- Any other link on these pages that goes to the sign-in, sign-up or homepage.

**What stays**
- The Privacy · Terms · Support links at the bottom. When tapped, they keep `?from=app`, so the next page is also in app mode.
- Email links and links to Apple/Google subscription pages.

**Without `from=app`** the website looks exactly as it does now.

The marker is read once the page has loaded, so it works on the live website (published) — no new app build needed for the hiding part; the app adding `?from=app` needs a new app build.

## 2. Email addresses

Every email address found in the app and website:

| Where | Address now | After |
|---|---|---|
| Privacy page | support@kookaflow.com | hello@kookaflow.com |
| Terms page | support@kookaflow.com | hello@kookaflow.com |
| Support page (3 places) | support@kookaflow.com | hello@kookaflow.com |
| Delete Account page (4 places) | hello@kookaflow.com | unchanged |
| Reminder emails (sender/reply address) | hello@kookaflow.com | unchanged |
| Sign in, Sign up, Reminders settings | you@example.com (grey example text inside the email box) | unchanged — it's a placeholder, not a real address |

No email addresses appear in footers, error messages or the EULA page.

## Technical details
- `src/lib/externalLinks.ts`: helper `withAppMarker(url)` adds `from=app`; used in `openSitePage` and in `installNativeLinkGuard` for web-only paths.
- `src/components/legal/LegalPage.tsx`: `useFromApp()` reads `from` from `window.location.search` in `useEffect` (avoids hydration mismatch); hides logo `Link` and back link; `LegalFooterLinks` passes `search={{ from: "app" }}` when active.
- Check `delete-account.tsx` / `support.tsx` for any in-body links to `/`, `/login`, `/signup` and hide them in app mode.
- Replace `support@kookaflow.com` in `privacy.tsx`, `terms.tsx`, `support.tsx` (text and `mailto:`).
