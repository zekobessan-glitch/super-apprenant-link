import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage } from "@/components/dashboard/ProfileSettings";
export const Route = createFileRoute("/dashboard/encadreur/profil")({ component: ProfilePage });
