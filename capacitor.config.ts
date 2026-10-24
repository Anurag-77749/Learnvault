import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.neurova.learning',
  appName: 'NEUROVA',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    cleartext: false,
  },
  plugins: {
    Camera: {
      presentationStyle: 'fullscreen',
    },
    Preferences: {
      group: 'neurova_secure_store',
    },
  },
  android: {
    buildOptions: {
      keystorePath: 'neurova-release-key.jks',
      keystoreAlias: 'neurova_key',
    },
  },
};

export default config;
