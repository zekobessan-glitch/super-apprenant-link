// GeniusPay — initialisation d'un paiement (checkout hébergé)
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const API_BASE = "https://geniuspay.ci/api/v1/merchant";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("GENIUSPAY_PUBLIC_KEY");
    const apiSecret = Deno.env.get("GENIUSPAY_SECRET_KEY");
    if (!apiKey || !apiSecret) {
      return new Response(JSON.stringify({ error: "GeniusPay non configuré" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const { montant, type, metadata, success_url, error_url, description } = await req.json();
    if (!montant || !type) {
      return new Response(JSON.stringify({ error: "montant et type requis" }), { status: 400, headers: corsHeaders });
    }

    const { data: profile } = await supabase
      .from("profiles").select("nom, prenoms, email, telephone").eq("id", user.id).maybeSingle();

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: paiement, error: payErr } = await admin.from("paiements").insert({
      user_id: user.id,
      montant,
      type,
      statut: "en_attente",
      metadata: { ...(metadata ?? {}), provider: "geniuspay" },
    }).select().single();

    if (payErr || !paiement) {
      return new Response(JSON.stringify({ error: payErr?.message ?? "DB error" }), { status: 500, headers: corsHeaders });
    }

    const rawPhone = (profile?.telephone ?? "").replace(/\D/g, "");
    const phone = rawPhone.length >= 8 ? (rawPhone.startsWith("225") ? `+${rawPhone}` : `+225${rawPhone}`) : undefined;

    const body: Record<string, unknown> = {
      amount: montant,
      currency: "XOF",
      description: description ?? `Super Apprenant — ${type}`,
      customer: {
        name: `${profile?.prenoms ?? ""} ${profile?.nom ?? ""}`.trim() || "Client",
        email: profile?.email ?? user.email ?? "",
        ...(phone ? { phone } : {}),
        country: "CI",
      },
      metadata: { ...(metadata ?? {}), paiement_id: paiement.id, user_id: user.id, type },
    };
    if (success_url) body.success_url = success_url;
    if (error_url) body.error_url = error_url;

    const res = await fetch(`${API_BASE}/payments`, {
      method: "POST",
      headers: {
        "X-API-Key": apiKey,
        "X-API-Secret": apiSecret,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => null);
    console.log("GeniusPay create payment", res.status, JSON.stringify(json));

    const data = json?.data;
    const checkoutUrl = data?.checkout_url ?? data?.payment_url;
    if (!res.ok || !json?.success || !checkoutUrl) {
      await admin.from("paiements").update({
        statut: "echoue",
        metadata: { ...(paiement.metadata ?? {}), geniuspay_error: json },
      }).eq("id", paiement.id);
      return new Response(JSON.stringify({ error: json?.error?.message ?? "Échec de création du paiement", detail: json }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await admin.from("paiements").update({
      fedapay_ref: String(data.reference),
      metadata: { ...(paiement.metadata ?? {}), geniuspay_reference: data.reference, environment: data.environment },
    }).eq("id", paiement.id);

    return new Response(JSON.stringify({
      paiement_id: paiement.id,
      reference: data.reference,
      checkout_url: checkoutUrl,
      environment: data.environment,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders });
  }
});
