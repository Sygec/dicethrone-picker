/**
 * @fileoverview Database helper module initializing the Supabase client wrapper.
 * @module db
 */

import { SUPABASE_URL, SUPABASE_KEY } from './config.js';

/**
 * The initialized Supabase database client instance.
 * Note: The `supabase` client library is loaded globally via CDN in `index.html`.
 * @type {Object}
 */
export const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

