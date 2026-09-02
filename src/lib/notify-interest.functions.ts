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

    // Crée la demande visible dans les tableaux de bord si elle n'existe pas.
    const { data: existing } = await context.supabase
      .from("correspondances")
      .select("id, statut, contact_debloque")
      .eq("parent_id", parentId)
      .eq("encadreur_id", data.encadreur_id)
      .eq("apprenant_id", data.apprenant_id)
      .maybeSingle();

    if (!existing) {
      const { error: correspondenceError } = await context.supabase.from("correspondances").insert({
        parent_id: parentId,
        encadreur_id: data.encadreur_id,
        apprenant_id: data.apprenant_id,
        statut: "en_attente",
        initiateur: "parent",
        contact_debloque: false,
      });
      if (correspondenceError) throw new Error(correspondenceError.message);
    }

    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { buildEmailHtml, sendResendEmail } = await import("./email-template.server");

      // Le suivi serveur permet de reprendre un envoi partiellement échoué sans
      // envoyer deux fois le même message à un destinataire déjà averti.
      const { data: currentAlert } = await supabaseAdmin
        .from("correspondance_email_alerts")
        .select("id, parent_email_sent, encadreur_email_sent")
        .eq("parent_id", parentId)
        .eq("encadreur_id", data.encadreur_id)
        .eq("apprenant_id", data.apprenant_id)
        .maybeSingle();

      let alert = currentAlert;
      if (!alert) {
        const { data: createdAlert, error: createAlertError } = await supabaseAdmin
          .from("correspondance_email_alerts")
          .insert({
            parent_id: parentId,
            encadreur_id: data.encadreur_id,
            apprenant_id: data.apprenant_id,
          })
          .select("id, parent_email_sent, encadreur_email_sent")
          .single();

        if (createAlertError) {
          const { data: racedAlert } = await supabaseAdmin
            .from("correspondance_email_alerts")
            .select("id, parent_email_sent, encadreur_email_sent")
            .eq("parent_id", parentId)
            .eq("encadreur_id", data.encadreur_id)
            .eq("apprenant_id", data.apprenant_id)
            .single();
          alert = racedAlert;
        } else {
          alert = createdAlert;
        }
      }

      if (!alert) throw new Error("Impossible d'enregistrer le suivi de l'alerte");
      if (alert.parent_email_sent && alert.encadreur_email_sent) {
        return { success: true, alreadyNotified: true };
      }

      const { data: profils } = await supabaseAdmin
        .from("profiles")
        .select("id, email, nom, prenoms")
        .in("id", [data.encadreur_id, parentId]);

      const enc = profils?.find((p) => p.id === data.encadreur_id);
      const parent = profils?.find((p) => p.id === parentId);
      const base = process.env['PUBLIC_SITE_URL'] ?? "https://superapprenant-i.com";
      const encNom = `${enc?.prenoms ?? ""} ${enc?.nom ?? ""}`.trim();

      const msgEnc = `Une nouvelle correspondance a été trouvée avec ${app.prenoms} ${app.nom} (${app.classe}). Un parent recherche un encadreur correspondant à votre profil. Connectez-vous pour consulter la demande et finaliser la mise en relation.`;
      const msgParent = `Bonne nouvelle : une correspondance a été trouvée avec ${encNom || "un encadreur compatible"}. Connectez-vous et achetez un pack de contacts pour débloquer la mise en relation.`;

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

      if (enc?.email && !alert.encadreur_email_sent) {
        await sendResendEmail({
          to: enc.email,
          subject: "Une correspondance a été trouvée",
          type: "correspondance_trouvee_encadreur",
          user_id: data.encadreur_id,
          html: buildEmailHtml(
            "Une correspondance a été trouvée",
            msgEnc,
            `${base}/dashboard/encadreur/correspondances`,
          ),
        });
        await supabaseAdmin
          .from("correspondance_email_alerts")
          .update({ encadreur_email_sent: true, last_error: null })
          .eq("id", alert.id);
      }
      if (parent?.email && !alert.parent_email_sent) {
        await sendResendEmail({
          to: parent.email,
          subject: "Une correspondance a été trouvée",
          type: "correspondance_trouvee_parent",
          user_id: parentId,
          html: buildEmailHtml(
            "Une correspondance a été trouvée",
            msgParent,
            `${base}/dashboard/parent/catalogue`,
          ),
        });
        await supabaseAdmin
          .from("correspondance_email_alerts")
          .update({ parent_email_sent: true, last_error: null })
          .eq("id", alert.id);
      }
    } catch (e) {
      console.error("[notify-interest] échec notification:", e);
    }

    return { success: true, alreadyNotified: false };
  });
