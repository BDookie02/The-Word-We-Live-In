import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor configuration. The web app is built to `dist/` (Vite) and wrapped into the native
 * Android (and later iOS) shells. See ANDROID.md for the full build/release workflow.
 */
const config: CapacitorConfig = {
  appId: 'com.twwli.game',
  appName: 'The World We Live In',
  webDir: 'dist',
  backgroundColor: '#0e1726',
  android: {
    // Allow the WebView to use hardware acceleration for the WebGL/three.js scene.
    backgroundColor: '#0e1726',
  },
};

export default config;
