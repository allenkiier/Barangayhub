export const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID ||
  "";
export const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID || "";

export const AUTH_PROVIDERS = {
  google: GOOGLE_CLIENT_ID.length > 0,
  facebook: FACEBOOK_APP_ID.length > 0,
};
