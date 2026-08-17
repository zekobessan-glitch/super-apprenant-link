import { useEffect } from "react";
import {
  createFileRoute,
  Outlet,
  useNavigate,
  Link,
  useRouterState,
} from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import logo from "@/assets/logo.jpg";
import { LogOut, LayoutDashboard, Users, Bell, CreditCard, Settings, UserCircle, ShieldCheck, MessageSquare, Menu, LifeBuoy, Mail } from "lucide-react";
import { NotificationsBell } from "@/components/NotificationsBell";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useState } from "react";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

function DashboardLayout() {
  const { user, role, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/connexion" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Chargement…</div>;
  }

  const base = role ? `/dashboard/${role}` : "/dashboard";
  const items =
    role === "admin"
      ? [
          { to: base, icon: LayoutDashboard, label: "Vue d'ensemble" },
          { to: `${base}/users`, icon: Users, label: "Utilisateurs" },
          { to: `${base}/validations`, icon: ShieldCheck, label: "Validations" },
          { to: `${base}/correspondances`, icon: Bell, label: "Correspondances" },
          { to: `${base}/paiements`, icon: CreditCard, label: "Paiements" },
          { to: `/dashboard/messages`, icon: MessageSquare, label: "Messages" },
          { to: `${base}/emails`, icon: Mail, label: "E-mails envoyés" },
          { to: `${base}/support`, icon: LifeBuoy, label: "Support" },
        ]
      : role === "encadreur"
      ? [
          { to: base, icon: LayoutDashboard, label: "Vue d'ensemble" },
          { to: `${base}/catalogue`, icon: Users, label: "Catalogue parents" },
          { to: `${base}/correspondances`, icon: Bell, label: "Correspondances" },
          { to: `${base}/paiements`, icon: CreditCard, label: "Paiements" },
          { to: `/dashboard/messages`, icon: MessageSquare, label: "Messages" },
          { to: `/dashboard/support`, icon: LifeBuoy, label: "Support" },
        ]
      : [
          { to: base, icon: LayoutDashboard, label: "Vue d'ensemble" },
          { to: `${base}/catalogue`, icon: Users, label: "Catalogue encadreurs" },
          { to: `${base}/correspondances`, icon: Bell, label: "Mes contacts" },
          { to: `${base}/paiements`, icon: CreditCard, label: "Paiements" },
          { to: `/dashboard/messages`, icon: MessageSquare, label: "Messages" },
          { to: `/dashboard/support`, icon: LifeBuoy, label: "Support" },
        ];

  const navContent = (
    <>
      <nav className="flex-1 p-3 space-y-1 overflow-auto">
        {items.map((it) => {
          const active = pathname === it.to;
          return (
            <Link
              key={it.to}
              to={it.to as any}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold"
                  : "hover:bg-sidebar-accent"
              }`}
            >
              <it.icon className="h-4 w-4" />
              {it.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <Link
          to={`${base}/profil` as any}
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-sidebar-accent"
        >
          <UserCircle className="h-4 w-4" /> Mon profil
        </Link>
        <Link
          to={`${base}/parametres` as any}
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-sidebar-accent"
        >
          <Settings className="h-4 w-4" /> Paramètres
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
          onClick={async () => { setMobileOpen(false); await signOut(); navigate({ to: "/connexion" }); }}
        >
          <LogOut className="h-4 w-4" /> Déconnexion
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex">
        {/* Sidebar desktop */}
        <aside className="w-64 bg-sidebar text-sidebar-foreground hidden md:flex flex-col">
          <div className="p-4 border-b border-sidebar-border flex items-center gap-3">
            <div className="bg-white rounded-lg p-1.5">
              <img src={logo} alt="logo" className="h-8 w-auto" />
            </div>
            <div className="text-sm flex-1">
              <div className="font-bold">SUPER@PPRENANT</div>
              <div className="text-xs opacity-80 capitalize">{role}</div>
            </div>
            <NotificationsBell />
          </div>
          {navContent}
        </aside>

        {/* Mobile header */}
        <div className="md:hidden fixed top-0 left-0 right-0 bg-sidebar text-white p-3 flex justify-between items-center z-50">
          <div className="flex items-center gap-2">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="text-white px-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 bg-sidebar text-sidebar-foreground border-sidebar-border flex flex-col">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <div className="p-4 border-b border-sidebar-border flex items-center gap-3">
                  <div className="bg-white rounded-lg p-1.5">
                    <img src={logo} alt="logo" className="h-8 w-auto" />
                  </div>
                  <div className="text-sm flex-1">
                    <div className="font-bold">SUPER@PPRENANT</div>
                    <div className="text-xs opacity-80 capitalize">{role}</div>
                  </div>
                </div>
                {navContent}
              </SheetContent>
            </Sheet>
            <img src={logo} alt="logo" className="h-8 w-8 bg-white rounded p-1" />
            <span className="font-bold text-sm">SUPER@PPRENANT</span>
          </div>
          <div className="flex items-center gap-1">
            <NotificationsBell />
          </div>
        </div>

        <main className="flex-1 bg-background overflow-auto pt-14 md:pt-0">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}
