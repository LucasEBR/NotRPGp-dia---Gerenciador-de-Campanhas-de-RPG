import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

// Service role client: usado só no backend, nunca exposto ao frontend.
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
