import { useState, useEffect } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import logo from "@/assets/logo.jpg";

const TITLE = "Réinitialisation du mot de passe — SUPER@PPRENANT-I";
const DESC = "Choisissez un nouveau mot de passe pour votre compte SUPER@PPRENANT-I.";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    const isRecovery = hash.includes("type=recovery");
    setRecoveryMode(isRecovery);
    setValidating(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    if (password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast.error("Impossible de réinitialiser le mot de passe");
    } else {
      setSuccess(true);
      toast.success("Mot de passe mis à jour avec succès");
      setTimeout(() => {
        navigate({ to: "/connexion" });
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Link to="/">
            <div className="bg-white rounded-2xl p-4 shadow-elegant inline-block">
              <img src={logo} alt="Super Apprenant" className="h-20 w-auto" />
            </div>
          </Link>
        </div>

        <Card className="p-6 shadow-elegant">
          <h1 className="text-2xl font-bold text-primary text-center mb-2">
            Réinitialisation du mot de passe
          </h1>
          <p className="text-center text-sm text-muted-foreground mb-6">
            Choisissez un nouveau mot de passe sécurisé.
          </p>

          {validating ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : success ? (
            <div className="text-center space-y-4 py-4">
              <p className="text-green-600 font-medium">
                Votre mot de passe a été réinitialisé avec succès.
              </p>
              <p className="text-sm text-muted-foreground">
                Redirection vers la page de connexion...
              </p>
            </div>
          ) : !recoveryMode ? (
            <div className="text-center space-y-4 py-4">
              <p className="text-destructive font-medium">
                Lien de réinitialisation invalide ou expiré.
              </p>
              <p className="text-sm text-muted-foreground">
                Veuillez demander un nouveau lien depuis la page de connexion.
              </p>
              <Button asChild className="bg-brand text-white hover:opacity-90">
                <Link to="/connexion">Retour à la connexion</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">Nouveau mot de passe</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirm ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-10"
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                    aria-label={showConfirm ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-brand text-white hover:opacity-90"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Réinitialiser le mot de passe
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
