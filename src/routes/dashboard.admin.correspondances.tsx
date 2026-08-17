import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const Route = createFileRoute("/dashboard/admin/correspondances")({
  component: AdminCorrespondances,
  head: () => ({
    meta: [
      { title: "Correspondances — Administration" },
      { name: "description", content: "Suivi des correspondances en attente de paiement et des contacts déjà débloqués." },
      { property: "og:title", content: "Correspondances — Administration" },
      { property: "og:description", content: "Suivi des correspondances parents / encadreurs." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

interface Row {
  id: string;
  statut: string;
  contact_debloque: boolean;
  initiateur: string;
  created_at: string;
  parent: string;
  encadreur: string;
  apprenant: string;
}

function AdminCorrespondances() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: corr } = await supabase
        .from("correspondances")
        .select("id, statut, contact_debloque, initiateur, created_at, parent_id, encadreur_id, apprenant_id")
        .order("created_at", { ascending: false });

      const ids = new Set<string>();
      (corr ?? []).forEach((c) => {
        ids.add(c.parent_id);
        ids.add(c.encadreur_id);
      });
      const { data: profiles } = ids.size
        ? await supabase.from("profiles").select("id, nom, prenoms").in("id", Array.from(ids))
        : { data: [] as any[] };
      const appIds = (corr ?? []).map((c) => c.apprenant_id).filter(Boolean) as string[];
      const { data: apprenants } = appIds.length
        ? await supabase.from("apprenants").select("id, nom, prenoms, classe").in("id", appIds)
        : { data: [] as any[] };

      const pMap = new Map((profiles ?? []).map((p: any) => [p.id, `${p.prenoms} ${p.nom}`.trim()]));
      const aMap = new Map((apprenants ?? []).map((a: any) => [a.id, `${a.prenoms} ${a.nom} (${a.classe})`]));

      setRows(
        (corr ?? []).map((c) => ({
          id: c.id,
          statut: c.statut,
          contact_debloque: c.contact_debloque,
          initiateur: c.initiateur,
          created_at: c.created_at,
          parent: pMap.get(c.parent_id) ?? "—",
          encadreur: pMap.get(c.encadreur_id) ?? "—",
          apprenant: c.apprenant_id ? aMap.get(c.apprenant_id) ?? "—" : "—",
        })),
      );
      setLoading(false);
    };
    load();
  }, []);

  const enAttente = rows.filter((r) => !r.contact_debloque);
  const liees = rows.filter((r) => r.contact_debloque);

  const renderTable = (list: Row[]) => (
    <Card className="p-4 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Parent</TableHead>
            <TableHead>Encadreur</TableHead>
            <TableHead>Apprenant</TableHead>
            <TableHead>Initiateur</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {list.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                {loading ? "Chargement…" : "Aucune correspondance"}
              </TableCell>
            </TableRow>
          )}
          {list.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{r.parent}</TableCell>
              <TableCell>{r.encadreur}</TableCell>
              <TableCell>{r.apprenant}</TableCell>
              <TableCell className="capitalize">{r.initiateur}</TableCell>
              <TableCell>
                <Badge variant={r.contact_debloque ? "default" : "secondary"}>
                  {r.contact_debloque ? "Contact débloqué" : "En attente de paiement"}
                </Badge>
              </TableCell>
              <TableCell>{new Date(r.created_at).toLocaleDateString("fr-FR")}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Correspondances</h1>
      <Tabs defaultValue="attente">
        <TabsList>
          <TabsTrigger value="attente">En attente ({enAttente.length})</TabsTrigger>
          <TabsTrigger value="liees">Déjà liées ({liees.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="attente" className="mt-4">{renderTable(enAttente)}</TabsContent>
        <TabsContent value="liees" className="mt-4">{renderTable(liees)}</TabsContent>
      </Tabs>
    </div>
  );
}
