import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/components/dashboard/ProfileSettings";
export const Route = createFileRoute("/dashboard/admin/parametres")({ component: SettingsPage });
