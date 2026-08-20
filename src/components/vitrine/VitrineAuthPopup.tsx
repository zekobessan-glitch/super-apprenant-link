import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterChooser } from "@/components/auth/RegisterChooser";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const STORAGE_KEY = "vitrine-auth-popup-shown";
const SCROLL_THRESHOLD = 0.4;

export function VitrineAuthPopup() {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"login" | "register">("login");
  const [hasOpened, setHasOpened] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || loading || user || hasOpened) return;

    const alreadyShown = sessionStorage.getItem(STORAGE_KEY) === "1";
    if (alreadyShown) return;

    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0 && scrollTop / docHeight >= SCROLL_THRESHOLD) {
        setOpen(true);
        setHasOpened(true);
        sessionStorage.setItem(STORAGE_KEY, "1");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, user, hasOpened]);

  const handleClose = () => {
    setOpen(false);
    sessionStorage.setItem(STORAGE_KEY, "1");
  };

  if (loading || user) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) sessionStorage.setItem(STORAGE_KEY, "1");
    }}>
      <DialogContent hideClose className="max-w-md p-0 overflow-hidden sm:rounded-2xl">
        <div className="p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-center text-2xl font-bold text-primary">
              Rejoignez SUPER@PPRENANT-I
            </DialogTitle>
            <p className="text-center text-sm text-muted-foreground">
              Connectez-vous ou créez un compte pour commencer
            </p>
          </DialogHeader>

          <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
            <TabsList className="grid w-full grid-cols-2 mb-6 h-12 p-1.5 bg-muted rounded-full">
              <TabsTrigger
                value="login"
                className="rounded-full text-sm font-bold transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground"
              >
                Connexion
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="rounded-full text-sm font-bold transition-all data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-md data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground"
              >
                Inscription
              </TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <LoginForm />
            </TabsContent>
            <TabsContent value="register">
              <RegisterChooser />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
