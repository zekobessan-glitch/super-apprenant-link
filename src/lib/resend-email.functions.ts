import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const schema = z.object({
  log_id: z.string().uuid(),
  message: z.string().min(1).max(5000),
});

/** Renvoi manuel (admin) d'un e-mail depuis l'historique. */
export const resendEmailLog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => schema.parse(data))
  .handler(async ({ data, context }) => {
    const { data: isAdmin, error: roleError } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (roleError || !isAdmin) throw new Error("Accès refusé");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: log } = await supabaseAdmin
      .from("email_logs")
      .select("id, user_id, destinataire, sujet, type")
      .eq("id", data.log_id)
      .maybeSingle();

    if (!log) throw new Error("E-mail introuvable");

    const { buildEmailHtml, sendResendEmail } = await import("./email-template.server");

    const result = await sendResendEmail({
      to: log.destinataire,
      subject: log.sujet,
      html: buildEmailHtml(log.sujet, data.message),
      type: log.type,
      user_id: log.user_id,
    });

    return { success: true, id: result.id };
  });
