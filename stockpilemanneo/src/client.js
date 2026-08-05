import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/**
 * @type {import("@supabase/supabase-js").SupabaseClient<any, any, "public", any, any>}
 */
let supabase;

if (globalThis.__supabase)
  supabase = globalThis.__supabase;
else {
  supabase = createClient(supabaseUrl, supabaseKey);
  globalThis.__supabase = supabase;
}

export default supabase;