# Fix "a.category" error in the iPhone app

## Why republishing didn't help
The iPhone app carries its own copy of the screens inside the TestFlight build. Republishing kookaflow.com updates the website only, which is why the website works and the app still shows the old error. The saved mobile copy here was also made before the event fix, so even a fresh Xcode build from it would still have the bug.

## Steps
1. Add a safety check so that if saving an event ever returns nothing, the app shows a clear "Couldn't save event — please try again" message instead of the cryptic error (create and edit).
2. Rebuild the mobile copy of the app here so it includes the event fix and the iPhone layout fixes, and confirm the new copy contains the direct-save code.
3. You then, on your Mac: download the latest code, run `bun run build:mobile`, run `npx cap sync ios`, raise the build number in Xcode, archive and upload to TestFlight, and delete the old app before installing.

## Technical details
- Guard `dto` in createMut/updateMut in `src/providers/EventsProvider.tsx` before reading `.category`; throw a readable error surfaced via toast.
- Run `bun run build:mobile`; grep `dist-mobile` for the direct insert path and confirm the old `a.category==="work"&&` serverFn pattern is gone.
