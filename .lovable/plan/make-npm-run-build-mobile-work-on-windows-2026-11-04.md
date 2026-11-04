# Make `npm run build:mobile` work on Windows

## Finding
- The MCP plugin only generates server routes (`/mcp` endpoint and its OAuth metadata). Those run on kookaflow.com, the web server.
- The mobile build is a static app with no server (`nitro: false`, SPA mode). The app calls kookaflow.com for everything server-side. So the mobile build does not need the MCP plugin, and leaving it out changes nothing in the app.
- One more Windows blocker: the `build:mobile` script uses Unix-only syntax (`BUILD_TARGET=mobile ...` and `cp`). The Windows command prompt that npm uses can't run either one, so the build would fail there even with the MCP fix.

## Changes
1. `vite.config.ts`: change `plugins: [mcpPlugin()]` to `plugins: isMobileBuild ? [] : [mcpPlugin()]`. Web builds keep the plugin exactly as before.
2. `package.json` `build:mobile`: make it work on any operating system, with the same env values and the same copy of `_shell.html` to `index.html`:
   - add `cross-env` as a dev dependency for the env variables
   - replace `cp` with a one-line `node -e "require('fs').copyFileSync(...)"`

## Verification
- Run the web build and confirm it still generates `src/routes/mcp.ts` and the OAuth metadata route, and the output is unchanged.
- Run the mobile build and compare the `dist-mobile/client` file list and main bundles with the current build. Expected: the same files, with no MCP code (the current mobile bundle has none either).
- Extract the MCP manifest to confirm the web MCP server is still intact.
