import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.designmdp.mobiledashboard",
  appName: "Design MDP Mobile Dashboard",
  webDir: "dist",
  bundledWebRuntime: false,
  ios: {
    contentInset: "automatic",
  },
};

export default config;