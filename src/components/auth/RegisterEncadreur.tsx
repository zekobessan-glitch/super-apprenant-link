import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import {
  ZONES,
  CLASSES_PRIMAIRE,
  CLASSES_COLLEGE,
  CLASSES_LYCEE,
  SERIES,
  MATIERES,
  type ZoneKey,
} from "@/lib/constants";

type Niveau = "primaire" | "college" | "lycee";

const QUIZ = [
  "Quand vous devez expliquer un concept, vous préférez :",
  "En situation d'enseignement, vous trouvez plus facile :",
  "Quand un élève ne comprend pas, vous :",
  "Vous préférez travailler avec des élèves qui :",
  "Lors de vos sessions, vous :",
  "Lorsque vous présentez un nouveau sujet, vous :",
];
const QUIZ_OPTIONS = [
  ["Montrer un graphique", "Donner une explication orale", "Faire une démonstration pratique"],
  ["Préparer des supports visuels", "Discuter et interagir verbalement", "Organiser des activités pratiques"],
  ["Utiliser un schéma/diagramme", "Reformuler / questions", "Activité interactive concrète"],
  ["Regardent les visuels", "Participent aux discussions", "S'impliquent dans la pratique"],
  ["Aimez les graphiques/supports", "Préférez la discussion orale", "Privilégiez les activités pratiques"],
  ["Utilisez des visuels", "Expliquez verbalement", "Proposez des exercices pratiques"],
];

function computeProfilPedagogique(answers: number[]): string {
  const counts = [0, 0, 0];
  answers.forEach((a) => counts[a]++);
  const max = Math.max(...counts);
  if (counts[0] === max) return "Visuel";
  if (counts[1] === max) return "Auditif";
  return "Kinesthésique";
}

export function RegisterEncadreur({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1 — auth
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Step 2 — profil
  const [nom, setNom] = useState("");
  const [prenoms, setPrenoms] = useState("");
  const [telephone, setTelephone] = useState("");
  const [genre, setGenre] = useState<"homme" | "femme">("homme");
  const [zone, setZone] = useState<ZoneKey | "">("");
  const [diplome, setDiplome] = useState("");
  const [experience, setExperience] = useState(false);
  const [experienceDetail, setExperienceDetail] = useState("");

  // Step 3 — pédagogie
  const [niveaux, setNiveaux] = useState<Niveau[]>([]);
  const [classesPrim, setClassesPrim] = useState<string[]>([]);
  const [classesColl, setClassesColl] = useState<string[]>([]);
  const [classesLyc, setClassesLyc] = useState<string[]>([]);
  const [seriesLyc, setSeriesLyc] = useState<string[]>([]);
  const [matieresColl, setMatieresColl] = useState<string[]>([]);
  const [matieresLyc, setMatieresLyc] = useState<string[]>([]);
  const [motivation, setMotivation] = useState("");
  const [formationSA, setFormationSA] = useState(false);

  // Step 4 — quiz
  const [answers, setAnswers] = useState<(number | null)[]>(Array(6).fill(null));

  const toggleArr = <T,>(arr: T[], val: T, set: (v: T[]) => void, max?: number) => {
    if (arr.includes(val)) set(arr.filter((v) => v !== val));
    else if (!max || arr.length < max) set([...arr, val]);
    else toast.warning(`Maximum ${max} sélections`);
  };

  const handleSubmit = async () => {
    if (answers.some((a) => a === null)) {
      toast.error("Veuillez répondre à toutes les questions");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { role: "encadreur", username, nom, prenoms, telephone },
      },
    });

    if (error || !data.user) {
      setLoading(false);
      toast.error(error?.message ?? "Erreur d'inscription");
      return;
    }

    const profilPedagogique = computeProfilPedagogique(answers as number[]);

    const { error: encErr } = await supabase.from("encadreurs").insert({
      profile_id: data.user.id,
      genre,
      zone_residence: zone as ZoneKey,
      dernier_diplome: diplome,
      experience_pro: experience,
      experience_detail: experienceDetail || null,
      niveaux,
      classes_primaire: classesPrim,
      classes_college: classesColl,
      classes_lycee: classesLyc,
      series_lycee: seriesLyc as any,
      matieres_college: matieresColl,
      matieres_lycee: matieresLyc,
      motivation,
      profil_pedagogique: profilPedagogique,
      formation_super_apprenant: formationSA,
    });

    if (encErr) {
      setLoading(false);
      toast.error(`Profil créé mais erreur encadreur : ${encErr.message}`);
      return;
    }

    await supabase.from("quiz_responses").insert({
      profile_id: data.user.id,
      type: "profil_encadrant",
      reponses: answers as any,
      profil_calcule: profilPedagogique,
    });

    setLoading(false);
    toast.success(`Inscription réussie ! Profil pédagogique : ${profilPedagogique}`);
  };

  const progress = (step / 4) * 100;

  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
      <div className="flex items-center gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour
        </Button>
        <span className="text-xs text-muted-foreground">Étape {step}/4</span>
      </div>
      <div className="h-1 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-brand transition-all" style={{ width: `${progress}%` }} />
      </div>

      {step === 1 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-primary">Identifiants</h3>
          <div><Label>Nom d'utilisateur *</Label><Input value={username} onChange={(e) => setUsername(e.target.value)} required /></div>
          <div><Label>Email *</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <div><Label>Mot de passe *</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} /></div>
          <Button className="w-full bg-brand text-white" onClick={() => setStep(2)} disabled={!email || !password || !username}>Suivant</Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-primary">Informations personnelles</h3>
          <div className="grid grid-cols-2 gap-2">
            <div><Label>Nom *</Label><Input value={nom} onChange={(e) => setNom(e.target.value)} /></div>
            <div><Label>Prénoms *</Label><Input value={prenoms} onChange={(e) => setPrenoms(e.target.value)} /></div>
          </div>
          <div><Label>Téléphone *</Label><Input value={telephone} onChange={(e) => setTelephone(e.target.value)} /></div>
          <div>
            <Label>Genre *</Label>
            <RadioGroup value={genre} onValueChange={(v) => setGenre(v as any)} className="flex gap-4 mt-1">
              <div className="flex items-center gap-2"><RadioGroupItem value="homme" id="g-h" /><Label htmlFor="g-h">Homme</Label></div>
              <div className="flex items-center gap-2"><RadioGroupItem value="femme" id="g-f" /><Label htmlFor="g-f">Femme</Label></div>
            </RadioGroup>
          </div>
          <div>
            <Label>Zone de résidence de l'apprenant *</Label>
            <Select value={zone} onValueChange={(v) => setZone(v as ZoneKey)}>
              <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
              <SelectContent>
                {Object.entries(ZONES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label>Dernier diplôme *</Label><Input value={diplome} onChange={(e) => setDiplome(e.target.value)} /></div>
          <div className="flex items-center gap-2">
            <Checkbox id="exp" checked={experience} onCheckedChange={(v) => setExperience(!!v)} />
            <Label htmlFor="exp">J'ai une expérience professionnelle</Label>
          </div>
          {experience && <Textarea placeholder="Détaillez votre expérience" value={experienceDetail} onChange={(e) => setExperienceDetail(e.target.value)} />}
          <div className="flex items-center gap-2">
            <Checkbox id="sa" checked={formationSA} onCheckedChange={(v) => setFormationSA(!!v)} />
            <Label htmlFor="sa">J'ai suivi la formation Super Apprenant</Label>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Précédent</Button>
            <Button className="flex-1 bg-brand text-white" onClick={() => setStep(3)} disabled={!nom || !prenoms || !telephone || !zone || !diplome}>Suivant</Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-primary">Niveaux et matières</h3>
          <div>
            <Label>Niveaux à enseigner *</Label>
            <div className="space-y-1 mt-1">
              {(["primaire", "college", "lycee"] as Niveau[]).map((n) => (
                <div key={n} className="flex items-center gap-2">
                  <Checkbox id={`n-${n}`} checked={niveaux.includes(n)} onCheckedChange={() => toggleArr(niveaux, n, setNiveaux)} />
                  <Label htmlFor={`n-${n}`} className="capitalize">{n}</Label>
                </div>
              ))}
            </div>
          </div>

          {niveaux.includes("primaire") && (
            <div>
              <Label>Classes primaire</Label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {CLASSES_PRIMAIRE.map((c) => (
                  <div key={c} className="flex items-center gap-1">
                    <Checkbox checked={classesPrim.includes(c)} onCheckedChange={() => toggleArr(classesPrim, c, setClassesPrim)} id={`p-${c}`} />
                    <Label htmlFor={`p-${c}`} className="text-sm">{c}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {niveaux.includes("college") && (
            <>
              <div>
                <Label>Classes collège</Label>
                <div className="grid grid-cols-4 gap-2 mt-1">
                  {CLASSES_COLLEGE.map((c) => (
                    <div key={c} className="flex items-center gap-1">
                      <Checkbox checked={classesColl.includes(c)} onCheckedChange={() => toggleArr(classesColl, c, setClassesColl)} id={`c-${c}`} />
                      <Label htmlFor={`c-${c}`} className="text-sm">{c}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label>Disciplines collège (max 2)</Label>
                <div className="grid grid-cols-2 gap-1 mt-1">
                  {MATIERES.map((m) => (
                    <div key={m} className="flex items-center gap-1">
                      <Checkbox checked={matieresColl.includes(m)} onCheckedChange={() => toggleArr(matieresColl, m, setMatieresColl, 2)} id={`mc-${m}`} />
                      <Label htmlFor={`mc-${m}`} className="text-xs">{m}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {niveaux.includes("lycee") && (
            <>
              <div>
                <Label>Classes lycée</Label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {CLASSES_LYCEE.map((c) => (
                    <div key={c} className="flex items-center gap-1">
                      <Checkbox checked={classesLyc.includes(c)} onCheckedChange={() => toggleArr(classesLyc, c, setClassesLyc)} id={`l-${c}`} />
                      <Label htmlFor={`l-${c}`} className="text-sm">{c}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label>Séries</Label>
                <div className="flex gap-3 mt-1">
                  {SERIES.map((s) => (
                    <div key={s} className="flex items-center gap-1">
                      <Checkbox checked={seriesLyc.includes(s)} onCheckedChange={() => toggleArr(seriesLyc, s, setSeriesLyc)} id={`s-${s}`} />
                      <Label htmlFor={`s-${s}`}>{s}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label>Disciplines lycée (max 2)</Label>
                <div className="grid grid-cols-2 gap-1 mt-1">
                  {MATIERES.map((m) => (
                    <div key={m} className="flex items-center gap-1">
                      <Checkbox checked={matieresLyc.includes(m)} onCheckedChange={() => toggleArr(matieresLyc, m, setMatieresLyc, 2)} id={`ml-${m}`} />
                      <Label htmlFor={`ml-${m}`} className="text-xs">{m}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div>
            <Label>Motivation à rejoindre l'équipe *</Label>
            <Textarea value={motivation} onChange={(e) => setMotivation(e.target.value)} rows={3} />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(2)} className="flex-1">Précédent</Button>
            <Button className="flex-1 bg-brand text-white" onClick={() => setStep(4)} disabled={niveaux.length === 0 || !motivation}>Suivant</Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-primary">Profil pédagogique</h3>
          <p className="text-xs text-muted-foreground">Basez vos réponses sur vos réussites en matière de soutien scolaire.</p>
          {QUIZ.map((q, i) => (
            <div key={i} className="space-y-1 border rounded-lg p-3">
              <p className="text-sm font-medium">{i + 1}. {q}</p>
              <RadioGroup value={answers[i]?.toString() ?? ""} onValueChange={(v) => {
                const next = [...answers]; next[i] = parseInt(v); setAnswers(next);
              }}>
                {QUIZ_OPTIONS[i].map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <RadioGroupItem value={idx.toString()} id={`q${i}-${idx}`} />
                    <Label htmlFor={`q${i}-${idx}`} className="text-sm font-normal">{opt}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ))}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(3)} className="flex-1">Précédent</Button>
            <Button className="flex-1 bg-brand text-white" onClick={handleSubmit} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              S'inscrire
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
