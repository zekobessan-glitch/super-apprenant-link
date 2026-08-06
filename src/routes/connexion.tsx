import { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterChooser } from "@/components/auth/RegisterChooser";
import { useAuth } from "@/hooks/use-auth";
import logo from "@/assets/logo.jpg";

const TITLE = "Connexion & inscription — SUPER@PPRENANT-I";
const DESC =
  "Connectez-vous ou créez votre compte parent, élève ou encadreur sur SUPER@PPRENANT-I.";

export const Route = createFileRoute("/connexion")({
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
  component: HomePage,
});

function HomePage() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && role) {
      navigate({ to: `/dashboard/${role}` as any });
    }
  }, [user, role, loading, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero header */}
      <header className="bg-hero text-white">
        <div className="container mx-auto px-4 py-10 lg:py-16">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6 text-center lg:text-left">
              <div className="flex justify-center lg:justify-start">
                <div className="bg-white rounded-2xl p-4 shadow-elegant inline-block">
                  <img src={logo} alt="Super Apprenant" className="h-24 w-auto" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Chaque jour plus fort à l'école
              </h1>
              <Card className="bg-white/10 border-white/20 backdrop-blur p-5 text-white">
                <p className="text-sm uppercase tracking-wider text-accent font-semibold mb-2">
                  Proverbes 22 : 6
                </p>
                <p className="italic text-white/95 leading-relaxed">
                  « Instruis l'enfant selon la voie qu'il doit suivre, et quand il sera
                  vieux, il ne s'en détournera pas. »
                </p>
              </Card>
              <p className="text-white/85 text-lg max-w-lg">
                La plateforme qui connecte les parents à des encadreurs qualifiés selon le
                profil d'apprentissage de chaque enfant.
              </p>
            </div>

            {/* Auth card */}
            <div className="w-full max-w-md mx-auto lg:ml-auto">
            <Card className="p-6 shadow-elegant animate-float-slow hover:[animation-play-state:paused] transition-all">
                <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="login">Connexion</TabsTrigger>
                    <TabsTrigger value="register">Inscription</TabsTrigger>
                  </TabsList>
                  <TabsContent value="login">
                    <LoginForm />
                  </TabsContent>
                  <TabsContent value="register">
                    <RegisterChooser />
                  </TabsContent>
                </Tabs>
              </Card>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 bg-background py-16">
        <div className="container mx-auto px-4 grid md:grid-cols-3 gap-6">
          {[
            {
              title: "Pour les parents",
              text: "Trouvez l'encadreur idéal selon le profil d'apprentissage de votre enfant et sa zone de résidence.",
            },
            {
              title: "Pour les encadreurs",
              text: "Identifiez des apprenants compatibles avec votre profil pédagogique et vos disciplines.",
            },
            {
              title: "Profils intelligents",
              text: "Notre questionnaire identifie automatiquement les meilleurs appariements.",
            },
          ].map((c) => (
            <Card key={c.title} className="p-6 shadow-soft hover:shadow-elegant transition-shadow">
              <div className="h-1 w-12 bg-accent-gradient rounded-full mb-4" />
              <h3 className="text-xl font-bold text-primary mb-2">{c.title}</h3>
              <p className="text-muted-foreground">{c.text}</p>
            </Card>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
