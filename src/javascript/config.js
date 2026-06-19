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

/** @type {string} Development Supabase project URL */
export const DEV_SUPABASE_URL = "https://wmxrzjmadvivvpzbslgj.supabase.co";

/** @type {string} Development Supabase anonymous publishable API key */
export const DEV_SUPABASE_KEY = "sb_publishable_Hohs2ojpVd5nmRJoi0upNg_PJv8M7x6";

/** @type {string} Active Supabase URL determined by the current environment */
export const SUPABASE_URL = isProd ? PROD_SUPABASE_URL : DEV_SUPABASE_URL;

/** @type {string} Active Supabase API key determined by the current environment */
export const SUPABASE_KEY = isProd ? PROD_SUPABASE_KEY : DEV_SUPABASE_KEY;

