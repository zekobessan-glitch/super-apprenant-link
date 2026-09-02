import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { computeMatchScore } from "@/lib/matching";

/**
 * Envoie (une seule fois) les e-mails "une correspondance a été trouvée" aux
 * deux parties, pour toutes les compatibilités de l'utilisateur connecté.
 * Fonctionne côté parent ET côté encadreur : dès qu'un des deux ouvre son
 * catalogue, les deux reçoivent l'alerte.
 */
export const notifyMatchAlerts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { buildEmailHtml, sendResendEmail } = await import("./email-template.server");
    const base = process.env["PUBLIC_SITE_URL"] ?? "https://superapprenant-i.com";

    const userId = context.userId;

    const [{ data: monApprenant }, { data: monEncadreur }] = await Promise.all([
      supabaseAdmin.from("apprenants").select("*").eq("parent_id", userId).maybeSingle(),
      supabaseAdmin.from("encadreurs").select("*").eq("profile_id", userId).maybeSingle(),
    ]);

    let paires: { parentId: string; encadreurId: string; apprenant: any }[] = [];

    if (monApprenant) {
      const { data: encs } = await supabaseAdmin.from("encadreurs").select("*");
      paires = (encs ?? [])
        .filter((e) => e.profile_id !== userId && matchOk(monApprenant, e))
        .map((e) => ({ parentId: userId, encadreurId: e.profile_id, apprenant: monApprenant }));
    } else if (monEncadreur) {
      const { data: apps } = await supabaseAdmin.from("apprenants").select("*");
      paires = (apps ?? [])
        .filter((a) => a.parent_id !== userId && matchOk(a, monEncadreur))
        .map((a) => ({ parentId: a.parent_id, encadreurId: userId, apprenant: a }));
    }

    let envoyes = 0;

    for (const paire of paires) {
      try {
        const { data: existing } = await supabaseAdmin
          .from("correspondance_email_alerts")
          .select("id, parent_email_sent, encadreur_email_sent")
          .eq("parent_id", paire.parentId)
          .eq("encadreur_id", paire.encadreurId)
          .eq("apprenant_id", paire.apprenant.id)
          .maybeSingle();

        let alert = existing;
        if (!alert) {
          const { data: created, error } = await supabaseAdmin
            .from("correspondance_email_alerts")
            .insert({
              parent_id: paire.parentId,
              encadreur_id: paire.encadreurId,
              apprenant_id: paire.apprenant.id,
            })
            .select("id, parent_email_sent, encadreur_email_sent")
            .single();
          if (error) {
            console.error("[notify-matches] suivi alerte:", error.message);
            continue;
          }
          alert = created;
        }
        if (alert.parent_email_sent && alert.encadreur_email_sent) continue;

        const { data: profils } = await supabaseAdmin
          .from("profiles")
          .select("id, email, nom, prenoms")
          .in("id", [paire.parentId, paire.encadreurId]);
        const parent = profils?.find((p) => p.id === paire.parentId);
        const enc = profils?.find((p) => p.id === paire.encadreurId);
        const encNom = `${enc?.prenoms ?? ""} ${enc?.nom ?? ""}`.trim();

        const msgEnc = `Une correspondance a été trouvée avec ${paire.apprenant.prenoms} ${paire.apprenant.nom} (${paire.apprenant.classe}). Connectez-vous pour consulter la demande et finaliser la mise en relation.`;
        const msgParent = `Une correspondance a été trouvée avec ${encNom || "un encadreur compatible"}. Connectez-vous et achetez un pack de contacts pour débloquer la mise en relation.`;

        if (enc?.email && !alert.encadreur_email_sent) {
          await sendResendEmail({
            to: enc.email,
            subject: "Une correspondance a été trouvée",
            type: "correspondance_trouvee_encadreur",
            user_id: paire.encadreurId,
            html: buildEmailHtml(
              "Une correspondance a été trouvée",
              msgEnc,
              `${base}/dashboard/encadreur/catalogue`,
            ),
          });
          envoyes++;
          await supabaseAdmin
            .from("correspondance_email_alerts")
            .update({ encadreur_email_sent: true, last_error: null })
            .eq("id", alert.id);
          await supabaseAdmin.from("notifications").insert({
            user_id: paire.encadreurId,
            titre: "Une correspondance a été trouvée",
            message: msgEnc,
            lien: "/dashboard/encadreur/catalogue",
          });
        }

        if (parent?.email && !alert.parent_email_sent) {
          await sendResendEmail({
            to: parent.email,
            subject: "Une correspondance a été trouvée",
            type: "correspondance_trouvee_parent",
            user_id: paire.parentId,
            html: buildEmailHtml(
              "Une correspondance a été trouvée",
              msgParent,
              `${base}/dashboard/parent/catalogue`,
            ),
          });
          envoyes++;
          await supabaseAdmin
            .from("correspondance_email_alerts")
            .update({ parent_email_sent: true, last_error: null })
            .eq("id", alert.id);
          await supabaseAdmin.from("notifications").insert({
            user_id: paire.parentId,
            titre: "Une correspondance a été trouvée",
            message: msgParent,
            lien: "/dashboard/parent/catalogue",
          });
        }
      } catch (e: any) {
        console.error("[notify-matches] échec envoi:", e?.message ?? e);
        await supabaseAdmin
          .from("correspondance_email_alerts")
          .update({ last_error: String(e?.message ?? e).slice(0, 500) })
          .eq("parent_id", paire.parentId)
          .eq("encadreur_id", paire.encadreurId)
          .eq("apprenant_id", paire.apprenant.id);
      }
    }

    return { success: true, paires: paires.length, envoyes };
  });

function matchOk(app: any, enc: any) {
  return (
    computeMatchScore(
      {
        zone: app.zone_residence,
        niveau: app.niveau,
        classe: app.classe,
        serie: app.serie,
        matieres: app.matieres ?? [],
        profil_apprentissage: app.profil_apprentissage,
      },
      {
        zone: enc.zone_residence,
        niveaux: enc.niveaux ?? [],
        classes_primaire: enc.classes_primaire ?? [],
        classes_college: enc.classes_college ?? [],
        classes_lycee: enc.classes_lycee ?? [],
        series_lycee: enc.series_lycee ?? [],
        matieres_college: enc.matieres_college ?? [],
        matieres_lycee: enc.matieres_lycee ?? [],
        profil_pedagogique: enc.profil_pedagogique,
      },
    ) > 0
  );
}
