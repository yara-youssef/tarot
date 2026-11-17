// Google OAuth client ID for "Sync with Google Drive".
// It is not a secret: it only identifies this app to Google. Create one in Google Cloud Console
// (APIs & Services → Credentials → OAuth client ID → Web application) with
// https://yara-youssef.github.io as an authorised JavaScript origin, then paste it here.
export const GOOGLE_CLIENT_ID: string =
  import.meta.env.VITE_GOOGLE_CLIENT_ID || '499702008690-6813om4h7j3pmd2r8ehjbcj1alfvg26g.apps.googleusercontent.com'
