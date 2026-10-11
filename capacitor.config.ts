import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'in.homeserv.app',
  appName: 'HomeServ',
  webDir: 'dist',
  // Matches the app's dark background so there's no white flash before the web UI paints.
  backgroundColor: '#0a0a0d',
  plugins: {
    SystemBars: {
      // The web app draws edge-to-edge (viewport-fit=cover) and pads itself with the
      // safe-area insets; light status/nav bar icons to start, then the app switches
      // them with the in-app theme (see src/utils/theme.ts).
      insetsHandling: 'css',
      style: 'DARK',
    },
  },
};

export default config;
