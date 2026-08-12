import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const schema = z.object({
  to: z.string().email().optional(),
  user_id: z.string().uuid().optional(),
  titre: z.string().min(1).max(200),
  message: z.string().min(1).max(5000),
  lien: z.string().max(500).optional().nullable(),
});

/**
 * Envoi d'une notification e-mail (Resend).
 * Le destinataire est soit une adresse fournie, soit résolu depuis profiles.email.
 */
export const sendEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => schema.parse(data))
  .handler(async ({ data, context }) => {
    const { buildEmailHtml, sendResendEmail } = await import("./email-template.server");

    let recipient = data.to?.trim() ?? "";

    if (!recipient && data.user_id) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("email")
        .eq("id", data.user_id)
        .maybeSingle();
      recipient = profile?.email ?? "";
    }

    if (!recipient && !data.user_id) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: me } = await supabaseAdmin
        .from("profiles")
        .select("email")
        .eq("id", context.userId)
        .maybeSingle();
      recipient = me?.email ?? "";
    }

    if (!recipient) throw new Error("Destinataire introuvable");

    const base = process.env['PUBLIC_SITE_URL'] ?? "https://superapprenant-i.com";
    const lien = data.lien
      ? data.lien.startsWith("http")
        ? data.lien
        : `${base}${data.lien.startsWith("/") ? "" : "/"}${data.lien}`
      : null;

    const result = await sendResendEmail({
      to: recipient,
      subject: data.titre,
      html: buildEmailHtml(data.titre, data.message, lien),
    });

    return { success: true, id: result.id };
  });
