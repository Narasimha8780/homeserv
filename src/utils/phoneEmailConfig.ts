import { Capacitor } from '@capacitor/core';

// Client id from the phone.email dashboard. When it is unset the app falls back to
// the plain PIN flow and the verification widget is never rendered.
export const PHONE_EMAIL_CLIENT_ID: string | undefined =
  import.meta.env.VITE_PHONE_EMAIL_CLIENT_ID || undefined;

// phone.email verifies in a window.open() popup and posts the result back to
// window.opener. Inside the Capacitor WebView that popup becomes a separate Chrome
// process, so the result can never reach the app — verified on a Pixel 8 emulator.
// Native builds therefore use PIN-only sign-up until phone.email offers a
// redirect-based flow we can complete with a deep link.
export const phoneEmailEnabled = () =>
  Boolean(PHONE_EMAIL_CLIENT_ID) && !Capacitor.isNativePlatform();
