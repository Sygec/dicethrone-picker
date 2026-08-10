/**
 * @fileoverview Configuration constants for environment detection and Supabase database endpoints.
 * @module config
 */

/**
 * Indicates if the application is running in the production environment.
 * @type {boolean}
 */
export const isProd = Boolean(
    window.location.hostname === "sygec.github.io" ||
    window.location.hostname === "dicethrone-prod.sygec.workers.dev",
);

/** @type {string} Production Supabase project URL */
export const PROD_SUPABASE_URL = "https://ojqkkixtvdtccuixishh.supabase.co";

/** @type {string} Production Supabase anonymous publishable API key */
export const PROD_SUPABASE_KEY = "sb_publishable_AT9BZrEkq1IDrZmP1Y_pDQ_Qwnh57ZH";

/** @type {string} Local Supabase API URL, served by the Docker stack started with `supabase start` */
export const LOCAL_SUPABASE_URL = "http://127.0.0.1:54321";

/**
 * Local Supabase anonymous key. This is the fixed demo key the Supabase CLI issues for every
 * local stack — it is not a secret and only ever grants access to your own machine. If
 * `supabase status` prints a different anon key, replace this value with that one.
 * @type {string}
 */
export const LOCAL_SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

/** @type {string} Active Supabase URL determined by the current environment */
export const SUPABASE_URL = isProd ? PROD_SUPABASE_URL : LOCAL_SUPABASE_URL;

/** @type {string} Active Supabase API key determined by the current environment */
export const SUPABASE_KEY = isProd ? PROD_SUPABASE_KEY : LOCAL_SUPABASE_KEY;

