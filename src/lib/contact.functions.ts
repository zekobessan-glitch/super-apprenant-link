import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const unlockEncadreurContact = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        encadreurId: z.string().uuid(),
        apprenantId: z.string().uuid(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;

    const { data: apprenant, error: apprenantError } = await supabaseAdmin
      .from("apprenants")
      .select("id, parent_id, nom, prenoms, classe")
      .eq("id", data.apprenantId)
      .eq("parent_id", userId)
      .maybeSingle();

    if (apprenantError) throw new Error(apprenantError.message);
    if (!apprenant) throw new Error("Apprenant introuvable pour ce parent.");

    const { data: encadreur, error: encadreurError } = await (
      supabaseAdmin.from("public_encadreurs" as any) as any
    )
      .select("profile_id")
      .eq("profile_id", data.encadreurId)
      .maybeSingle();

    if (encadreurError) throw new Error(encadreurError.message);
    if (!encadreur) throw new Error("Encadreur introuvable ou indisponible.");

    const { data: existing, error: existingError } = await supabaseAdmin
      .from("correspondances")
      .select("id, contact_debloque")
      .eq("parent_id", userId)
      .eq("encadreur_id", data.encadreurId)
      .eq("apprenant_id", data.apprenantId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingError) throw new Error(existingError.message);

    if (existing?.contact_debloque) {
      return { ok: true, alreadyUnlocked: true };
    }

    const { data: creditRow, error: creditError } = await supabaseAdmin
      .from("contacts_credits")
      .select("id, credits_restants")
      .eq("parent_id", userId)
      .maybeSingle();

    if (creditError) throw new Error(creditError.message);
    if (!creditRow || creditRow.credits_restants < 1) {
      throw new Error("Aucun crédit disponible. Achetez un pack pour débloquer ce contact.");
    }

    const correspondencePayload = {
      parent_id: userId,
      encadreur_id: data.encadreurId,
      apprenant_id: data.apprenantId,
      statut: "debloquee" as const,
      initiateur: "parent" as const,
      contact_debloque: true,
    };

    const correspondenceResult = existing
      ? await supabaseAdmin
          .from("correspondances")
          .update(correspondencePayload)
          .eq("id", existing.id)
      : await supabaseAdmin.from("correspondances").insert(correspondencePayload);

    if (correspondenceResult.error) throw new Error(correspondenceResult.error.message);

    const { error: updateCreditsError } = await supabaseAdmin
      .from("contacts_credits")
      .update({ credits_restants: creditRow.credits_restants - 1 })
      .eq("id", creditRow.id);

    if (updateCreditsError) throw new Error(updateCreditsError.message);

    const { data: encProfile } = await supabaseAdmin
      .from("profiles")
      .select("nom, prenoms")
      .eq("id", data.encadreurId)
      .maybeSingle();

    const encNom = `${encProfile?.prenoms ?? ""} ${encProfile?.nom ?? ""}`.trim();
    const apprenantNom = `${apprenant.prenoms} ${apprenant.nom}`.trim();

    const { error: notificationError } = await supabaseAdmin.from("notifications").insert([
      {
        user_id: data.encadreurId,
        titre: "Nouveau parent intéressé",
        message: `Un parent/élève a payé et souhaite vous contacter pour ${apprenantNom} (${apprenant.classe}).`,
        lien: "/dashboard/encadreur/correspondances",
      },
      {
        user_id: userId,
        titre: "Demande de contact envoyée",
        message: `Votre demande de contact${encNom ? ` vers ${encNom}` : ""} a été effectuée avec succès. L'encadreur va vous contacter.`,
        lien: "/dashboard/parent/correspondances",
      },
    ]);

    if (notificationError) throw new Error(notificationError.message);

    return { ok: true, alreadyUnlocked: false };
  });
