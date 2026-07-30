// GeniusPay — vérification d'une transaction (appelée au retour du checkout)
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("GENIUSPAY_PUBLIC_KEY")!;
    const apiSecret = Deno.env.get("GENIUSPAY_SECRET_KEY")!;

    const { paiement_id, reference } = await req.json();
    if (!paiement_id && !reference) {
      return new Response(JSON.stringify({ error: "paiement_id ou reference requis" }), { status: 400, headers: corsHeaders });
    }

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const query = admin.from("paiements").select("*");
    const { data: paiement } = paiement_id
      ? await query.eq("id", paiement_id).maybeSingle()
      : await query.eq("fedapay_ref", reference).maybeSingle();

    if (!paiement) return new Response(JSON.stringify({ error: "Paiement introuvable" }), { status: 404, headers: corsHeaders });

    const ref = reference ?? paiement.fedapay_ref ?? paiement.metadata?.geniuspay_reference;
    if (!ref) return new Response(JSON.stringify({ error: "Référence GeniusPay manquante" }), { status: 400, headers: corsHeaders });

    if (paiement.statut === "reussi") {
      return new Response(JSON.stringify({ ok: true, status: "reussi" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const res = await fetch(`${API_BASE}/payments/${ref}`, {
      headers: { "X-API-Key": apiKey, "X-API-Secret": apiSecret, "Accept": "application/json" },
    });
    const json = await res.json().catch(() => null);
    console.log("GeniusPay verify", res.status, JSON.stringify(json));

    const status = (json?.data?.status ?? "").toString().toLowerCase();

    if (status === "completed") {
      await admin.from("paiements").update({ statut: "reussi", fedapay_ref: String(ref) }).eq("id", paiement.id);
      await applyEffects(admin, paiement);
      return new Response(JSON.stringify({ ok: true, status: "reussi" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (status === "pending" || status === "processing") {
      return new Response(JSON.stringify({ ok: false, status: "en_attente" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    await admin.from("paiements").update({
      statut: "echoue",
      fedapay_ref: String(ref),
      metadata: { ...(paiement.metadata ?? {}), geniuspay_result: json },
    }).eq("id", paiement.id);
    return new Response(JSON.stringify({ ok: false, status: "echoue", detail: json }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders });
  }
});
