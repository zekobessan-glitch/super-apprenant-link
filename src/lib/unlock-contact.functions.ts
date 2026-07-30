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
    return { success: true, credits_restants: creditsRestants };
  });
