// Client id from the phone.email dashboard. When it is unset the app falls back to
// the plain PIN flow and the verification widget is never rendered.
//
// Native builds work too: MainActivity services window.open() with an in-app
// WebView, so the popup keeps its window.opener link and can post the result back.
export const PHONE_EMAIL_CLIENT_ID: string | undefined =
  import.meta.env.VITE_PHONE_EMAIL_CLIENT_ID || undefined;

export const phoneEmailEnabled = () => Boolean(PHONE_EMAIL_CLIENT_ID);
