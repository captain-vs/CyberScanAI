import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cyberscan.app',
  appName: 'CyberScan AI',
  webDir: 'public',
  server: {
    androidScheme: 'https',
    url: 'https://cybersync.vercel.app', // <--- YOUR LIVE VERCEL LINK
    cleartext: true
  }
};

export default config;