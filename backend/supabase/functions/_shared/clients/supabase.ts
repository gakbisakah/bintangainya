import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

export const getSupabaseClient = (authHeader?: string) => {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      global: {
        headers: authHeader ? { Authorization: authHeader } : {},
      },
    }
  );
};

export const getAdminClient = () => {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );
};
