import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cyberscan.app',
  appName: 'SecurityX',
  webDir: 'public',
  server: {
    androidScheme: 'https',
    url: 'https://cybersync.vercel.app', // <--- LIVE VERCEL LINK
    cleartext: true
  }
};

export default config;