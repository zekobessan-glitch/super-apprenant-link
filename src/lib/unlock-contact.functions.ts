import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const unlockEncadreurContact = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    encadreur_id: z.string().uuid(),
    apprenant_id: z.string().uuid(),
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: creditsRestants, error } = await context.supabase.rpc(
      "unlock_encadreur_contact",
      {
        _encadreur_id: data.encadreur_id,
        _apprenant_id: data.apprenant_id,
      },
    );

    if (error) throw new Error(error.message);

    // Notification e-mail (best-effort : n'échoue pas le déblocage)
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { buildEmailHtml, sendResendEmail } = await import("./email-template.server");

      const { data: profils } = await supabaseAdmin
        .from("profiles")
        .select("id, email, nom, prenoms")
        .in("id", [data.encadreur_id, context.userId]);

      const enc = profils?.find((p) => p.id === data.encadreur_id);
      const parent = profils?.find((p) => p.id === context.userId);
      const base = process.env['PUBLIC_SITE_URL'] ?? "https://superapprenant-i.com";

      if (enc?.email) {
        await sendResendEmail({
          to: enc.email,
          subject: "Nouveau parent intéressé",
          type: "correspondance_encadreur",
          user_id: data.encadreur_id,
          html: buildEmailHtml(
            "Nouveau parent intéressé",
            "Un parent a payé pour débloquer votre contact et souhaite être contacté. Connectez-vous à votre espace pour consulter la correspondance.",
            `${base}/dashboard/encadreur/correspondances`,
          ),
        });
      }
      if (parent?.email) {
        await sendResendEmail({
          to: parent.email,
          subject: "Demande envoyée",
          type: "correspondance_parent",
          user_id: context.userId,
          html: buildEmailHtml(
            "Demande envoyée",
            `Votre demande a bien été transmise${enc ? ` à ${enc.prenoms ?? ""} ${enc.nom ?? ""}`.trimEnd() : ""}. L'encadreur vous contactera prochainement.`,
            `${base}/dashboard/parent/correspondances`,
          ),
        });
      }
    } catch (e) {
      console.error("[send-email] échec notification e-mail:", e);
    }

    return { success: true, credits_restants: creditsRestants };
  });

