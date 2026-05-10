import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/use-auth";
import appCss from "../styles.css?url";

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-primary">404</h1>
        <p className="mt-2 text-muted-foreground">Page introuvable</p>
        <Link to="/" className="mt-6 inline-block text-primary hover:underline">
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "SUPER@PPRENANT-I — Chaque jour plus fort à l'école" },
      {
        name: "description",
        content:
          "Plateforme de mise en relation entre parents/élèves et encadreurs en Côte d'Ivoire.",
      },
      { property: "og:title", content: "SUPER@PPRENANT-I — Chaque jour plus fort à l'école" },
      { name: "twitter:title", content: "SUPER@PPRENANT-I — Chaque jour plus fort à l'école" },
      { name: "description", content: "Super Learner Connect is a responsive website connecting parents with tutors and tutors with students." },
      { property: "og:description", content: "Super Learner Connect is a responsive website connecting parents with tutors and tutors with students." },
      { name: "twitter:description", content: "Super Learner Connect is a responsive website connecting parents with tutors and tutors with students." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/a6ab33b3-8e3e-4cf4-a022-0f9268298621/id-preview-36f5468e--6f0382c0-26c2-4075-8b42-8d62f8bf8762.lovable.app-1778455480230.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/a6ab33b3-8e3e-4cf4-a022-0f9268298621/id-preview-36f5468e--6f0382c0-26c2-4075-8b42-8d62f8bf8762.lovable.app-1778455480230.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFound,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
