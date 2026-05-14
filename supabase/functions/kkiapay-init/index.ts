// KKiaPay — initialisation d'un paiement (crée l'enregistrement en_attente)
// Renvoie au frontend les infos nécessaires pour ouvrir le widget KKiaPay.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const publicKey = Deno.env.get("KKIAPAY_PUBLIC_KEY");
    const privateKey = Deno.env.get("KKIAPAY_PRIVATE_KEY");
    if (!publicKey || !privateKey) {
      return new Response(JSON.stringify({ error: "KKiaPay non configuré" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const sandbox = privateKey.startsWith("tpk_") || privateKey.startsWith("tsk_");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const { montant, type, metadata } = await req.json();
    if (!montant || !type) {
      return new Response(JSON.stringify({ error: "montant et type requis" }), { status: 400, headers: corsHeaders });
    }

    const { data: profile } = await supabase.from("profiles").select("nom, prenoms, email, telephone").eq("id", user.id).single();

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: paiement, error: payErr } = await admin.from("paiements").insert({
      user_id: user.id,
      montant,
      type,
      statut: "en_attente",
      metadata: { ...(metadata ?? {}), provider: "kkiapay" },
    }).select().single();

    if (payErr || !paiement) {
      return new Response(JSON.stringify({ error: payErr?.message ?? "DB error" }), { status: 500, headers: corsHeaders });
    }

    return new Response(JSON.stringify({
      paiement_id: paiement.id,
      public_key: publicKey,
      sandbox,
      amount: montant,
      customer: {
        fullname: `${profile?.prenoms ?? ""} ${profile?.nom ?? ""}`.trim() || "Client",
        email: profile?.email ?? user.email ?? "",
        phone: profile?.telephone ?? "",
      },
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders });
  }
});
