import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.github.andremiras.edilkamin",
  appName: "Open Edilkamin",
  webDir: "out",
  server: {
    androidScheme: "https",
  },
  plugins: {
    SafeArea: {
      statusBarStyle: "DEFAULT",
      navigationBarStyle: "DEFAULT",
      initialViewportFitCover: true,
    },
    SystemBars: {
      insetsHandling: "disable",
    },
  },
};

export default config;
