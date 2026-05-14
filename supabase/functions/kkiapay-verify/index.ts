// KKiaPay — vérification d'une transaction après succès du widget
// Appelé par le frontend avec { paiement_id, transactionId }
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    const publicKey = Deno.env.get("KKIAPAY_PUBLIC_KEY")!;
    const privateKey = Deno.env.get("KKIAPAY_PRIVATE_KEY")!;
    const secret = Deno.env.get("KKIAPAY_SECRET")!;
    const sandbox = privateKey.startsWith("tpk_") || privateKey.startsWith("tsk_");
    const baseUrl = sandbox ? "https://api-sandbox.kkiapay.me" : "https://api.kkiapay.me";

    const { paiement_id, transactionId } = await req.json();
    if (!paiement_id || !transactionId) {
      return new Response(JSON.stringify({ error: "paiement_id et transactionId requis" }), { status: 400, headers: corsHeaders });
    }

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: paiement } = await admin.from("paiements").select("*").eq("id", paiement_id).maybeSingle();
    if (!paiement) return new Response(JSON.stringify({ error: "Paiement introuvable" }), { status: 404, headers: corsHeaders });

    // Vérifier le statut auprès de KKiaPay
    const verify = await fetch(`${baseUrl}/api/v1/transactions/status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": publicKey,
        "x-private-key": privateKey,
        "x-secret-key": secret,
      },
      body: JSON.stringify({ transactionId }),
    });
    const tx = await verify.json();
    console.log("KKiaPay verify response", tx);

    const status = (tx?.status ?? "").toString().toUpperCase();
    if (status === "SUCCESS") {
      await admin.from("paiements").update({ statut: "reussi", fedapay_ref: String(transactionId) }).eq("id", paiement.id);
      await applyEffects(admin, paiement);
      return new Response(JSON.stringify({ ok: true, status: "reussi" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    } else {
      await admin.from("paiements").update({ statut: "echoue", fedapay_ref: String(transactionId), metadata: { ...(paiement.metadata ?? {}), kkiapay_error: tx } }).eq("id", paiement.id);
      return new Response(JSON.stringify({ ok: false, status: "echoue", detail: tx }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders });
  }
});
