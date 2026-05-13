// FedaPay payment initiation
// Requires FEDAPAY_SECRET_KEY (sk_sandbox_xxx or sk_live_xxx)
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const normalizeCiPhone = (value?: string | null) => {
  const digits = (value ?? "").replace(/[^\d]/g, "");
  let local = digits;
  if (local.startsWith("00225")) local = local.slice(5);
  if (local.startsWith("225")) local = local.slice(3);

  return /^\d{10}$/.test(local) ? local : "0101010101";
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const fedapayKey = Deno.env.get("FEDAPAY_SECRET_KEY");
    if (!fedapayKey) {
      return new Response(JSON.stringify({ error: "FEDAPAY_SECRET_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isLive = fedapayKey.startsWith("sk_live");
    const baseUrl = isLive ? "https://api.fedapay.com/v1" : "https://sandbox-api.fedapay.com/v1";

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

    // Get user info
    const { data: profile } = await supabase.from("profiles").select("nom, prenoms, email, telephone").eq("id", user.id).single();

    // Create payment record (en_attente)
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: paiement, error: payErr } = await admin.from("paiements").insert({
      user_id: user.id,
      montant,
      type,
      statut: "en_attente",
      metadata: metadata ?? {},
    }).select().single();

    if (payErr || !paiement) {
      return new Response(JSON.stringify({ error: payErr?.message ?? "DB error" }), { status: 500, headers: corsHeaders });
    }

    const origin = req.headers.get("origin");
    const appUrl = origin && /^https?:\/\//.test(origin) ? origin : "https://super-apprenant-link.lovable.app";
    const customerPhone = normalizeCiPhone(profile?.telephone);

    // Create FedaPay transaction
    const tx = await fetch(`${baseUrl}/transactions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${fedapayKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        description: `SUPER@PPRENANT-I — ${type}`,
        amount: montant,
        currency: { iso: "XOF" },
        callback_url: `${appUrl}/dashboard/parent/paiements?paiement_id=${paiement.id}`,
        customer: {
          firstname: profile?.prenoms || "Client",
          lastname: profile?.nom || "Test",
          email: profile?.email ?? user.email,
          phone_number: { number: customerPhone, country: "CI" },
        },
        custom_metadata: { paiement_id: paiement.id, user_id: user.id },
      }),
    });

    const txData = await tx.json();
    if (!tx.ok || !txData?.["v1/transaction"]) {
      console.error("FedaPay error", txData);
      await admin.from("paiements").update({ statut: "echoue", metadata: { ...(metadata ?? {}), fedapay_error: txData } }).eq("id", paiement.id);
      return new Response(JSON.stringify({ error: "Erreur FedaPay", detail: txData }), { status: 502, headers: corsHeaders });
    }

    const txId = txData["v1/transaction"].id;
    await admin.from("paiements").update({ fedapay_ref: String(txId) }).eq("id", paiement.id);

    // Generate payment token / URL
    const token = await fetch(`${baseUrl}/transactions/${txId}/token`, {
      method: "POST",
      headers: { Authorization: `Bearer ${fedapayKey}`, "Content-Type": "application/json" },
    });
    const tokenData = await token.json();

    if (!token.ok || !tokenData?.url) {
      console.error("FedaPay token error", tokenData);
      await admin.from("paiements").update({ statut: "echoue", metadata: { ...(metadata ?? {}), fedapay_error: tokenData } }).eq("id", paiement.id);
      return new Response(JSON.stringify({ error: "Erreur FedaPay", detail: tokenData }), { status: 502, headers: corsHeaders });
    }

    return new Response(JSON.stringify({
      payment_url: tokenData.url,
      paiement_id: paiement.id,
      transaction_id: txId,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders });
  }
});
