import { Capacitor, SystemBars, SystemBarsStyle } from '@capacitor/core';
import type { AppTheme } from '../types';

export type ResolvedTheme = 'dark' | 'light';

const THEME_COLOR: Record<ResolvedTheme, string> = { dark: '#0a0a0d', light: '#f6f5f2' };

export function resolveTheme(theme: AppTheme): ResolvedTheme {
  if (theme !== 'system') return theme;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

// Applies a resolved theme to the page chrome: the token set (<html data-theme>), the
// browser UI colour (Chrome on Android) and, inside the Android app, the status/navigation
// bar icon colour so they stay readable over the edge-to-edge background.
export function applyTheme(resolved: ResolvedTheme) {
  document.documentElement.dataset.theme = resolved;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[resolved]);
  if (Capacitor.isNativePlatform()) {
    SystemBars.setStyle({ style: resolved === 'dark' ? SystemBarsStyle.Dark : SystemBarsStyle.Light }).catch(() => {});
  }
}
