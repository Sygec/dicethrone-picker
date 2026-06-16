export const isProd = Boolean(
    window.location.hostname === "sygec.github.io" ||
    window.location.hostname === "dicethrone-prod.sygec.workers.dev",
);
export const PROD_SUPABASE_URL = "https://ojqkkixtvdtccuixishh.supabase.co";
export const PROD_SUPABASE_KEY = "sb_publishable_AT9BZrEkq1IDrZmP1Y_pDQ_Qwnh57ZH";
export const DEV_SUPABASE_URL = "https://wmxrzjmadvivvpzbslgj.supabase.co";
export const DEV_SUPABASE_KEY = "sb_publishable_Hohs2ojpVd5nmRJoi0upNg_PJv8M7x6";

export const SUPABASE_URL = isProd ? PROD_SUPABASE_URL : DEV_SUPABASE_URL;
export const SUPABASE_KEY = isProd ? PROD_SUPABASE_KEY : DEV_SUPABASE_KEY;
