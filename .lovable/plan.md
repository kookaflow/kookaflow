# Add the missing Capacitor config

## Findings
- The repo has no `capacitor.config.ts` or `capacitor.config.json`, and `.gitignore` doesn't exclude them. The iOS build has been using a config that only exists on the Mac.
- The app sets no native plugin options in code. Browser, App and RevenueCat run with their defaults, and the splash screen is drawn by the app itself. It also needs no `server.url`: the app loads its bundled screens and calls https://kookaflow.com directly.
- Android loads from `https://localhost` by default, and that address is already allowed by the website's server. iOS keeps `capacitor://localhost`.

## Change
Create `capacitor.config.ts` at the project root:

```ts
import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.kookaflow.app",
  appName: "Kookaflow",
  webDir: "dist-mobile/client",
};

export default config;
```

No `server` block, so the defaults that iOS uses today stay in place. No plugin settings.

## Note for the Mac
Before the next iOS sync, check `ios/App/App/capacitor.config.json` on the Mac. If it has extra settings (for example `ios.contentInset` or `server`), send them to me and I'll copy them into this file. Otherwise `npx cap sync ios` replaces them with the file above.

## Verification
- Run `npx cap config` and confirm it shows the appId, name and webDir.
