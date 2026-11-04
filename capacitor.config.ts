import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.kookaflow.app",
  appName: "Kookaflow",
  // `npm run build:mobile` writes index.html here.
  webDir: "dist-mobile/client",
};

export default config;
