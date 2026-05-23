import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const InputSchema = z.object({
  encadreur_id: z.string().uuid(),
  apprenant_id: z.string().uuid(),
});

export const unlockEncadreurContact = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => InputSchema.parse(data))
  .handler(async ({ data, context }) => {
    const parentId = context.userId;

    // Verify apprenant belongs to parent
    const { data: app, error: appErr } = await supabaseAdmin
      .from("apprenants")
      .select("id, parent_id, nom, prenoms, classe")
      .eq("id", data.apprenant_id)
      .maybeSingle();
    if (appErr) throw new Error(appErr.message);
    if (!app || app.parent_id !== parentId) throw new Error("Apprenant introuvable");

    // Check credits
    const { data: cred, error: credErr } = await supabaseAdmin
      .from("contacts_credits")
      .select("credits_restants")
      .eq("parent_id", parentId)
      .maybeSingle();
    if (credErr) throw new Error(credErr.message);
    const credits = cred?.credits_restants ?? 0;
    if (credits < 1) throw new Error("Aucun crédit disponible");

    // Upsert correspondance with contact_debloque = true (service role bypasses RLS)
    const { error: upErr } = await supabaseAdmin
      .from("correspondances")
      .upsert(
        {
          parent_id: parentId,
          encadreur_id: data.encadreur_id,
          apprenant_id: data.apprenant_id,
          statut: "debloquee",
          initiateur: "parent",
          contact_debloque: true,
        },
        { onConflict: "encadreur_id,parent_id,apprenant_id" }
      );
    if (upErr) throw new Error(upErr.message);

    // Decrement credits
    const { error: decErr } = await supabaseAdmin
      .from("contacts_credits")
      .update({ credits_restants: credits - 1 })
      .eq("parent_id", parentId);
    if (decErr) throw new Error(decErr.message);

    // Fetch encadreur name for notification
    const { data: encProfile } = await supabaseAdmin
      .from("profiles")
      .select("nom, prenoms")
      .eq("id", data.encadreur_id)
      .maybeSingle();
    const encNom = `${encProfile?.prenoms ?? ""} ${encProfile?.nom ?? ""}`.trim();

    await supabaseAdmin.from("notifications").insert([
      {
        user_id: data.encadreur_id,
        titre: "Nouveau parent intéressé",
        message: `Un parent a payé pour débloquer votre contact et souhaite être contacté pour ${app.prenoms} ${app.nom} (${app.classe}).`,
        lien: "/dashboard/encadreur/correspondances",
      },
      {
        user_id: parentId,
        titre: "Demande envoyée",
        message: `Votre demande a bien été transmise${encNom ? ` à ${encNom}` : ""}. L'encadreur vous contactera prochainement.`,
        lien: "/dashboard/parent/correspondances",
      },
    ]);

    return { success: true, credits_restants: credits - 1 };
  });
