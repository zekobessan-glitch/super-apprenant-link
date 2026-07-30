// GeniusPay — webhook de confirmation de paiement
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key, x-api-secret, x-geniuspay-signature",
};

const API_BASE = "https://geniuspay.ci/api/v1/merchant";

async function applyEffects(admin: any, paiement: any) {
  if (paiement.type === "pack_contacts_parent") {
    const credits = paiement.metadata?.credits ?? 3;
    const { data: cur } = await admin.from("contacts_credits").select("credits_restants").eq("parent_id", paiement.user_id).maybeSingle();
    const next = (cur?.credits_restants ?? 0) + credits;
    await admin.from("contacts_credits").upsert({ parent_id: paiement.user_id, credits_restants: next }, { onConflict: "parent_id" });
    await admin.from("notifications").insert({
      user_id: paiement.user_id, titre: "Paiement confirmé", message: `${credits} crédits ajoutés à votre compte.`,
    });
  } else if (paiement.type === "contact_unique_encadreur") {
    const { apprenant_id, parent_id } = paiement.metadata ?? {};
    if (apprenant_id && parent_id) {
      await admin.from("correspondances").upsert({
        encadreur_id: paiement.user_id,
        parent_id, apprenant_id,
        statut: "debloquee", initiateur: "encadreur", contact_debloque: true,
      }, { onConflict: "encadreur_id,parent_id,apprenant_id" });
      await admin.from("notifications").insert({
        user_id: parent_id, titre: "Nouvel encadreur intéressé", message: "Un encadreur vient de débloquer votre contact.",
      });
    }
  }
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function hmacHex(secret: string, body: string) {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("GENIUSPAY_PUBLIC_KEY")!;
    const apiSecret = Deno.env.get("GENIUSPAY_SECRET_KEY")!;
    const webhookSecret = Deno.env.get("GENIUSPAY_WEBHOOK_SECRET") ?? Deno.env.get("STRIPE_WEBHOOK_SECRET");

    const rawBody = await req.text();

    // Vérification de la signature du webhook (si un secret est configuré)
    if (webhookSecret) {
      const provided = (
        req.headers.get("x-geniuspay-signature") ??
        req.headers.get("x-webhook-signature") ??
        req.headers.get("x-signature") ??
        ""
      ).replace(/^sha256=/i, "").trim().toLowerCase();

      const expected = await hmacHex(webhookSecret, rawBody);
      const okHmac = provided.length > 0 && timingSafeEqual(provided, expected);
      // Certains dashboards envoient le "secret hash" tel quel plutôt qu'un HMAC
      const okPlain = provided.length > 0 && timingSafeEqual(provided, webhookSecret.toLowerCase());

      if (!okHmac && !okPlain) {
        console.warn("GeniusPay webhook: signature invalide");
        return new Response(JSON.stringify({ error: "signature invalide" }), { status: 401, headers: corsHeaders });
      }
    }

    const payload = JSON.parse(rawBody || "null");
    console.log("GeniusPay webhook payload", JSON.stringify(payload));


    const data = payload?.data ?? payload;
    const reference = data?.reference ?? data?.transaction?.reference;
    if (!reference) return new Response(JSON.stringify({ error: "reference manquante" }), { status: 400, headers: corsHeaders });

    // On ne fait jamais confiance au payload : on revérifie côté API GeniusPay
    const res = await fetch(`${API_BASE}/payments/${reference}`, {
      headers: { "X-API-Key": apiKey, "X-API-Secret": apiSecret, "Accept": "application/json" },
    });
    const json = await res.json().catch(() => null);
    const status = (json?.data?.status ?? "").toString().toLowerCase();

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const paiementId = json?.data?.metadata?.paiement_id;
    const { data: paiement } = paiementId
      ? await admin.from("paiements").select("*").eq("id", paiementId).maybeSingle()
      : await admin.from("paiements").select("*").eq("fedapay_ref", String(reference)).maybeSingle();

    if (!paiement) return new Response(JSON.stringify({ ok: true, ignored: true }), { headers: corsHeaders });

    if (status === "completed" && paiement.statut !== "reussi") {
      await admin.from("paiements").update({ statut: "reussi", fedapay_ref: String(reference) }).eq("id", paiement.id);
      await applyEffects(admin, paiement);
    } else if (["failed", "expired", "cancelled"].includes(status) && paiement.statut === "en_attente") {
      await admin.from("paiements").update({ statut: "echoue", fedapay_ref: String(reference) }).eq("id", paiement.id);
    }

    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders });
  }
});
