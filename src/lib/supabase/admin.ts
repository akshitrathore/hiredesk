import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";
import { getSupabaseAdminKey, getSupabaseUrl } from "@/lib/supabase/env";

export function createAdminClient() {
  const supabaseUrl = getSupabaseUrl();
  const adminKey = getSupabaseAdminKey();

  if (!supabaseUrl || !adminKey) {
    throw new Error("Missing Supabase admin environment variables.");
  }

  return createClient(supabaseUrl, adminKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    realtime: {
      transport: WebSocket as never,
    },
  });
}
