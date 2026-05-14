// KKiaPay webhook — vérification via header x-kkiapay-secret
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*" };

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
        encadreur_id: paiement.user_id, parent_id, apprenant_id,
        statut: "debloquee", initiateur: "encadreur", contact_debloque: true,
      }, { onConflict: "encadreur_id,parent_id,apprenant_id" });
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  try {
    const expectedSecret = Deno.env.get("KKIAPAY_SECRET")!;
    const headerSecret = req.headers.get("x-kkiapay-secret") ?? req.headers.get("X-KKIAPAY-SECRET");
    if (!headerSecret || headerSecret !== expectedSecret) {
      console.warn("Webhook signature invalide");
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    console.log("KKiaPay webhook", body);
    const transactionId = body?.transactionId ?? body?.transaction_id ?? body?.id;
    const isSuccess = (body?.isPaymentSucces === true) || (String(body?.status ?? "").toUpperCase() === "SUCCESS") || body?.event === "payment.success";

    if (!transactionId) return new Response("Missing transactionId", { status: 400 });

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Retrouve le paiement par fedapay_ref (réutilisé pour KKiaPay) ou via metadata.paiement_id
    let { data: paiement } = await admin.from("paiements").select("*").eq("fedapay_ref", String(transactionId)).maybeSingle();
    if (!paiement && body?.data?.paiement_id) {
      const r = await admin.from("paiements").select("*").eq("id", body.data.paiement_id).maybeSingle();
      paiement = r.data;
    }
    if (!paiement) return new Response("Paiement introuvable", { status: 404 });

    if (isSuccess) {
      if (paiement.statut !== "reussi") {
        await admin.from("paiements").update({ statut: "reussi", fedapay_ref: String(transactionId) }).eq("id", paiement.id);
        await applyEffects(admin, paiement);
      }
    } else {
      await admin.from("paiements").update({ statut: "echoue", fedapay_ref: String(transactionId) }).eq("id", paiement.id);
    }

    return new Response("ok", { headers: corsHeaders });
  } catch (e) {
    console.error(e);
    return new Response(String(e), { status: 500 });
  }
});
