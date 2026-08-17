import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ForgotPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ForgotPasswordDialog({ open, onOpenChange }: ForgotPasswordDialogProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error("Erreur lors de l'envoi du lien");
    } else {
      setSent(true);
      toast.success("Lien de réinitialisation envoyé");
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setSent(false);
      setEmail("");
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-primary">Mot de passe oublié ?</DialogTitle>
          <DialogDescription>
            Saisissez votre adresse e-mail pour recevoir un lien de réinitialisation.
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Si un compte existe avec cette adresse, vous recevrez un e-mail avec les instructions pour réinitialiser votre mot de passe.
            </p>
            <Button onClick={handleClose} className="w-full bg-brand text-white hover:opacity-90">
              Fermer
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="forgot-email">Email</Label>
              <Input
                id="forgot-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-brand text-white hover:opacity-90"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Envoyer le lien
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
