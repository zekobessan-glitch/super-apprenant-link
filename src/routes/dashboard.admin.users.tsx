import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/admin/users")({
  component: AdminUsers,
});

interface Row {
  id: string;
  nom: string;
  prenoms: string;
  email: string;
  telephone: string;
  role: string | null;
}

function AdminUsers() {
  const [rows, setRows] = useState<Row[]>([]);

  const load = async () => {
    const { data: profiles } = await supabase.from("profiles").select("id, nom, prenoms, email, telephone");
    const { data: roles } = await supabase.from("user_roles").select("user_id, role");
    const map = new Map(roles?.map((r) => [r.user_id, r.role]));
    setRows((profiles ?? []).map((p) => ({ ...p, role: map.get(p.id) ?? null })));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet utilisateur ?")) return;
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Supprimé"); load(); }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-3xl font-bold text-primary">Utilisateurs</h1>
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.nom} {r.prenoms}</TableCell>
                <TableCell>{r.email}</TableCell>
                <TableCell>{r.telephone}</TableCell>
                <TableCell>
                  <Badge variant={r.role === "admin" ? "default" : "secondary"}>{r.role ?? "—"}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(r.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Aucun utilisateur</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
