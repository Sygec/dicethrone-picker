import { SUPABASE_URL, SUPABASE_KEY } from './config.js';

// The supabase library is loaded globally from CDN in index.html
export const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
