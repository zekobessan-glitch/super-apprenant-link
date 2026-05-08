// FedaPay webhook — confirms payment and applies effects
// Public endpoint. Secret verification via FEDAPAY_WEBHOOK_SECRET
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  try {
    const body = await req.json();
    const event = body?.event ?? body?.name;
    const tx = body?.entity ?? body?.data;
    const txId = String(tx?.id ?? "");
    const status = tx?.status;

    if (!txId) return new Response("Missing tx", { status: 400 });

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: paiement } = await admin.from("paiements").select("*").eq("fedapay_ref", txId).maybeSingle();
    if (!paiement) return new Response("Paiement not found", { status: 404 });

    if (status === "approved" || event === "transaction.approved") {
      await admin.from("paiements").update({ statut: "reussi" }).eq("id", paiement.id);

      // Apply effect
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
            parent_id,
            apprenant_id,
            statut: "debloquee",
            initiateur: "encadreur",
            contact_debloque: true,
          }, { onConflict: "encadreur_id,parent_id,apprenant_id" });
          await admin.from("notifications").insert({
            user_id: parent_id, titre: "Nouvel encadreur intéressé", message: "Un encadreur vient de débloquer votre contact.",
          });
        }
      }
    } else if (status === "declined" || status === "canceled") {
      await admin.from("paiements").update({ statut: "echoue" }).eq("id", paiement.id);
    }

    return new Response("ok", { headers: corsHeaders });
  } catch (e) {
    console.error(e);
    return new Response(String(e), { status: 500 });
  }
});
