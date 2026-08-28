import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.babita.kharcha',
  appName: 'Kharcha',
  webDir: 'dist',
  android: {
    // The app is a local diary - nothing is fetched over the network, so the
    // WebView never needs cleartext HTTP.
    allowMixedContent: false,
  },
  server: {
    androidScheme: 'https',
  },
};

export default config;
