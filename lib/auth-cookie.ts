// Edge-runtime-safe constants for the auth cookie. Kept in its own file so
// middleware.ts can import them without pulling in node:crypto (which only
// works in the Node runtime).

export const SESSION_COOKIE = "nextgen_admin_session";
