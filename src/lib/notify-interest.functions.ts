import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Alerte "avant paiement" : quand un parent manifeste son intérêt pour un
 * encadreur sans crédit disponible, on prévient les deux parties (notification
 * in-app + e-mail) pour les inciter à passer à l'action.
 */
export const notifyInterestBeforePayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        encadreur_id: z.string().uuid(),
        apprenant_id: z.string().uuid(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const parentId = context.userId;

    // L'apprenant doit appartenir au parent connecté
    const { data: app } = await context.supabase
      .from("apprenants")
      .select("id, nom, prenoms, classe")
      .eq("id", data.apprenant_id)
      .eq("parent_id", parentId)
      .maybeSingle();
    if (!app) throw new Error("Apprenant introuvable");

    // Anti-spam : une seule alerte par (parent, encadreur, apprenant)
    const { data: existing } = await context.supabase
      .from("correspondances")
      .select("id, statut, contact_debloque")
      .eq("parent_id", parentId)
      .eq("encadreur_id", data.encadreur_id)
      .eq("apprenant_id", data.apprenant_id)
      .maybeSingle();

    if (existing) return { success: true, alreadyNotified: true };

    await context.supabase.from("correspondances").insert({
      parent_id: parentId,
      encadreur_id: data.encadreur_id,
      apprenant_id: data.apprenant_id,
      statut: "en_attente",
      initiateur: "parent",
      contact_debloque: false,
    });

    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { buildEmailHtml, sendResendEmail } = await import("./email-template.server");

      const { data: profils } = await supabaseAdmin
        .from("profiles")
        .select("id, email, nom, prenoms")
        .in("id", [data.encadreur_id, parentId]);

      const enc = profils?.find((p) => p.id === data.encadreur_id);
      const parent = profils?.find((p) => p.id === parentId);
      const base = process.env['PUBLIC_SITE_URL'] ?? "https://superapprenant-i.com";
      const encNom = `${enc?.prenoms ?? ""} ${enc?.nom ?? ""}`.trim();

      const msgEnc = `Un parent s'intéresse à votre profil pour ${app.prenoms} ${app.nom} (${app.classe}). Le contact sera partagé dès la validation du paiement.`;
      const msgParent = `Votre intérêt pour ${encNom || "cet encadreur"} a bien été enregistré. Achetez un pack de contacts pour débloquer ses coordonnées et lancer la mise en relation.`;

      await supabaseAdmin.from("notifications").insert([
        {
          user_id: data.encadreur_id,
          titre: "Un parent s'intéresse à votre profil",
          message: msgEnc,
          lien: "/dashboard/encadreur/correspondances",
        },
        {
          user_id: parentId,
          titre: "Finalisez votre mise en relation",
          message: msgParent,
          lien: "/dashboard/parent/paiements",
        },
      ]);

      if (enc?.email) {
        await sendResendEmail({
          to: enc.email,
          subject: "Un parent s'intéresse à votre profil",
          type: "interet_encadreur",
          user_id: data.encadreur_id,
          html: buildEmailHtml(
            "Un parent s'intéresse à votre profil",
            msgEnc,
            `${base}/dashboard/encadreur/correspondances`,
          ),
        });
      }
      if (parent?.email) {
        await sendResendEmail({
          to: parent.email,
          subject: "Finalisez votre mise en relation",
          type: "interet_parent",
          user_id: parentId,
          html: buildEmailHtml(
            "Finalisez votre mise en relation",
            msgParent,
            `${base}/dashboard/parent/paiements`,
          ),
        });
      }
    } catch (e) {
      console.error("[notify-interest] échec notification:", e);
    }

    return { success: true, alreadyNotified: false };
  });
