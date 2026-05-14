import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: authErr } = await userClient.auth.getUser();
    if (authErr || !user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: roleData } = await admin.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
    if (!roleData) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: corsHeaders });

    const { user_id } = await req.json();
    if (!user_id) return new Response(JSON.stringify({ error: "user_id manquant" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (user_id === user.id) return new Response(JSON.stringify({ error: "Vous ne pouvez pas vous supprimer vous-même" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // Delete app data first (no FK cascades from auth.users in this schema)
    const apprenants = await admin.from("apprenants").select("id").eq("parent_id", user_id);
    const apprenantIds = (apprenants.data ?? []).map((a) => a.id);

    if (apprenantIds.length > 0) {
      await admin.from("correspondances").delete().in("apprenant_id", apprenantIds);
    }
    await admin.from("correspondances").delete().or(`parent_id.eq.${user_id},encadreur_id.eq.${user_id}`);
    await admin.from("apprenants").delete().eq("parent_id", user_id);
    await admin.from("encadreurs").delete().eq("profile_id", user_id);
    await admin.from("encadreur_refus").delete().or(`encadreur_profile_id.eq.${user_id},encadreur_id.eq.${user_id}`);
    await admin.from("contacts_credits").delete().eq("parent_id", user_id);
    await admin.from("notifications").delete().eq("user_id", user_id);
    await admin.from("paiements").delete().eq("user_id", user_id);
    await admin.from("quiz_responses").delete().eq("profile_id", user_id);
    await admin.from("support_messages").delete().eq("user_id", user_id);
    await admin.from("user_roles").delete().eq("user_id", user_id);
    await admin.from("profiles").delete().eq("id", user_id);

    const { error: delErr } = await admin.auth.admin.deleteUser(user_id);
    if (delErr) {
      return new Response(JSON.stringify({ error: delErr.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
