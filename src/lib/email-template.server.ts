function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}

export function buildEmailHtml(titre: string, message: string, lien?: string | null) {
  const url = lien && /^https?:\/\//.test(lien) ? lien : null;
  return `<!doctype html><html><body style="margin:0;padding:24px;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,.06)">
    <div style="background:#fba100;padding:20px 24px;color:#fff;font-size:18px;font-weight:bold">SUPER@PPRENANT-I</div>
    <div style="padding:24px;color:#111">
      <h1 style="font-size:20px;margin:0 0 12px">${escapeHtml(titre)}</h1>
      <p style="font-size:15px;line-height:1.6;margin:0 0 20px;white-space:pre-line">${escapeHtml(message)}</p>
      ${url ? `<a href="${url}" style="display:inline-block;background:#fba100;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:bold">Voir dans mon espace</a>` : ""}
    </div>
    <div style="padding:16px 24px;background:#0b1220;color:#9aa4b2;font-size:12px">SUPER@PPRENANT-I © 2026 — Développé par ZEKO SERVICES</div>
  </div></body></html>`;
}

export async function logEmail(entry: {
  user_id?: string | null;
  destinataire: string;
  sujet: string;
  type: string;
  statut: "envoye" | "echoue";
  provider_id?: string | null;
  erreur?: string | null;
}) {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("email_logs").insert({
      user_id: entry.user_id ?? null,
      destinataire: entry.destinataire,
      sujet: entry.sujet,
      type: entry.type,
      statut: entry.statut,
      provider_id: entry.provider_id ?? null,
      erreur: entry.erreur ?? null,
    });
  } catch (e) {
    console.error("[email_logs] échec journalisation:", e);
  }
}

export async function sendResendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  type?: string;
  user_id?: string | null;
}) {
  const apiKey = process.env['RESEND_API_KEY'];
  if (!apiKey) throw new Error("RESEND_API_KEY non configurée");
  const from = process.env['RESEND_FROM'] ?? "SUPER@PPRENANT-I <onboarding@resend.dev>";
  const type = opts.type ?? "notification";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ from, to: [opts.to], subject: opts.subject, html: opts.html }),
  });

  const body = await res.text();
  if (!res.ok) {
    console.error(`Resend error [${res.status}]: ${body}`);
    await logEmail({
      user_id: opts.user_id ?? null,
      destinataire: opts.to,
      sujet: opts.subject,
      type,
      statut: "echoue",
      erreur: `[${res.status}] ${body.slice(0, 500)}`,
    });
    throw new Error(`Envoi e-mail échoué [${res.status}]`);
  }
  const parsed = JSON.parse(body) as { id: string };
  await logEmail({
    user_id: opts.user_id ?? null,
    destinataire: opts.to,
    sujet: opts.subject,
    type,
    statut: "envoye",
    provider_id: parsed.id,
  });
  return parsed;
}
