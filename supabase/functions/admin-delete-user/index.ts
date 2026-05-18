import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(SUPABASE_URL, ANON, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: authErr } = await userClient.auth.getUser();
    if (authErr || !user) {
      console.error("auth error", authErr);
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const admin = createClient(SUPABASE_URL, SERVICE);
    const { data: roleData, error: roleErr } = await admin.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
    if (roleErr) console.error("role check error", roleErr);
    if (!roleData) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: corsHeaders });

    const { user_id } = await req.json();
    if (!user_id) return new Response(JSON.stringify({ error: "user_id manquant" }), { status: 400, headers: corsHeaders });
    if (user_id === user.id) return new Response(JSON.stringify({ error: "Vous ne pouvez pas vous supprimer vous-même" }), { status: 400, headers: corsHeaders });

    // Best-effort cleanup of tables without FK cascades (errors ignored)
    try { await admin.from("encadreur_refus").delete().eq("encadreur_profile_id", user_id); } catch (e) { console.error("encadreur_refus profile", e); }
    try { await admin.from("support_messages").delete().eq("user_id", user_id); } catch (e) { console.error("support_messages", e); }
    try { await admin.from("support_messages").delete().eq("admin_id", user_id); } catch (e) { console.error("support_messages admin", e); }
    try {
      const { data: enc } = await admin.from("encadreurs").select("id").eq("profile_id", user_id);
      const ids = (enc ?? []).map((e) => e.id);
      if (ids.length) await admin.from("encadreur_refus").delete().in("encadreur_id", ids);
    } catch (e) { console.error("encadreur_refus by enc id", e); }

    // Delete auth user — cascades handle profiles, apprenants, encadreurs, correspondances,
    // contacts_credits, notifications, paiements, quiz_responses, user_roles.
    const { error: delErr } = await admin.auth.admin.deleteUser(user_id);
    if (delErr) {
      console.error("deleteUser error", delErr);
      return new Response(JSON.stringify({ error: delErr.message }), { status: 400, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
  } catch (e) {
    console.error("unhandled", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: corsHeaders });
  }
});
