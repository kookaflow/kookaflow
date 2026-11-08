# Native export: save file + share sheet

## Behaviour
- Web: unchanged (PDF via jsPDF save, CSV via download link, "downloaded" toasts).
- iOS/Android app only (mobile build + Capacitor native platform): after generating the PDF or CSV, write it to the app's cache folder with @capacitor/filesystem, then open the system share sheet with @capacitor/share so the user can Save to Files, email, AirDrop, Drive etc.
  - Success toast: "Report ready — choose where to save or share it".
  - User closes the share sheet without choosing: no error, no toast.
  - Any failure (write or share): toast "Couldn't export the file — please try again." with the reason logged.

## Technical details
- New `src/lib/nativeFileShare.ts`: `isNativeApp()` and `shareFileNatively(blob, filename, mimeType)` — converts the blob to base64, `Filesystem.writeFile({ directory: Directory.Cache, path: filename, data })`, then `Share.share({ title: filename, files: [uri] })`; treats a "canceled" share error as a quiet cancel. Plugins loaded with dynamic import so the web bundle doesn't need them at load.
- `src/components/settings/ExportSection.tsx`: PDF uses `doc.output("blob")`; CSV reuses its blob. On native call `shareFileNatively`, otherwise the existing web code.
- `package.json`: add `@capacitor/filesystem@^8` and `@capacitor/share@^8` (matching Capacitor 8).

## Files that change
- src/lib/nativeFileShare.ts (new)
- src/components/settings/ExportSection.tsx
- package.json

## Native steps for you
1. `npm install` (Windows) / `bun install` (Mac), then `npm run build:mobile`.
2. `npx cap sync ios` and `npx cap sync android` — registers both plugins; no code edits.
3. iOS: no Info.plist changes needed (the app's own cache folder needs no permission). Optional: to make Kookaflow's files appear in the Files app directly, not needed for the share sheet.
4. Android: no new permissions (cache folder + share sheet use Capacitor's built-in file provider). 
5. Raise build numbers and upload new builds; the fix only appears in new builds.
