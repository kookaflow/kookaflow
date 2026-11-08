# Public "Delete your account" page

## What deleteAccount actually removes (checked)
Deletes every row for the user from: events (shifts and life events are both stored here), google_events_cache, google_calendar_connections (Google tokens), nudge_dismissals, shift_templates, user_category_visibility, scheduled_push_alerts, reminder_sends, user_preferences (including push settings), categories, profiles, and finally the sign-in account itself.

Differences from your list, reflected in the page wording:
- "Shifts" and "events" are one store — both deleted.
- Also deleted (not in your list): custom categories, dismissed nudges, reminder history, cached Google events.
- Push: the app's push settings and scheduled alerts are deleted. The device record at the push provider (OneSignal) is not removed by deleteAccount; it is no longer linked to any account. Page will say "notification settings and scheduled alerts". Not changing deleteAccount in this task.

## Page: /delete-account
New public route using the existing LegalPage layout (same as Privacy/Terms), no sign-in. Sections:
1. Intro: Kookaflow, developed by Bluegum Studio.
2. Delete in the app: More → Danger Zone → Delete Account, confirm. Immediate and permanent.
3. Delete without the app: email hello@kookaflow.com from the account's email address, subject "Delete my account"; we verify and complete within 30 days and confirm by email.
4. What is deleted (list above, in plain words).
5. What is kept and why: purchase/transaction records held by Apple, Google Play, RevenueCat and Stripe, kept as required for tax and legal purposes; we don't control store records.
6. Subscriptions are not cancelled by deletion — how to cancel:
   - iPhone: Settings → your name → Subscriptions → Kookaflow → Cancel.
   - Android: Google Play → profile → Payments & subscriptions → Subscriptions → Kookaflow → Cancel.
   - Web (Stripe): cancel via More → Account → Manage subscription before deleting, or email us.
7. Contact line.

head(): unique title "Delete your Kookaflow account", description, og:title, og:description, og:type, twitter:card.

## Footer link
Add "Delete Account" link to the homepage footer next to Privacy/Terms/Support.

## Files
- src/routes/delete-account.tsx (new)
- src/routes/index.tsx (footer link)
