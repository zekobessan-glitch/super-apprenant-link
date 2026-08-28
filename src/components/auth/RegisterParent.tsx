import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react";
import {
  ZONES,
  CLASSES_PRIMAIRE,
  CLASSES_COLLEGE,
  CLASSES_LYCEE,
  SERIES,
  MATIERES,
  type ZoneKey,
} from "@/lib/constants";

const QUIZ = [
  "Quand vous devez apprendre quelque chose de nouveau :",
  "Pour mémoriser un concept :",
  "Pour réviser un sujet :",
  "Lors d'une lecture, vous êtes attentif à :",
  "Pour apprendre quelque chose de nouveau :",
  "Quel type de révision préférez-vous ?",
  "Pour apprendre un concept :",
  "Pendant les révisions :",
  "Vous retenez mieux quand :",
];
const QUIZ_OPTIONS = [
  ["Lire des notes/livres", "Écouter une explication", "Pratiquer des exercices"],
  ["Schémas/diagrammes", "Lire/écouter des explications", "Faire des expériences"],
  ["Graphiques/vidéos", "Résumés audio/discussion", "Refaire des exercices"],
  ["Mots et sens", "Sons/rythmes", "Gestes/actions"],
  ["Vidéos/manuels", "Podcasts/conférences", "Activités pratiques"],
  ["Lire des résumés", "Écouter/discuter", "Pratiquer/résoudre"],
  ["Documents/vidéos", "Explication verbale", "Manipuler avec les mains"],
  ["Vidéos/graphiques", "Écouter des explications", "Projets pratiques"],
  ["Vous lisez plusieurs fois", "Vous entendez plusieurs fois", "Vous expérimentez"],
];

function computeProfilApprentissage(answers: number[]): string {
  const counts = [0, 0, 0];
  answers.forEach((a) => counts[a]++);
  const max = Math.max(...counts);
  if (counts[0] === max) return "Visuel";
  if (counts[1] === max) return "Auditif";
  return "Kinesthésique";
}

export function RegisterParent({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);


  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [nom, setNom] = useState("");
  const [prenoms, setPrenoms] = useState("");
  const [telephone, setTelephone] = useState("");
  const [profession, setProfession] = useState("");
  const [zoneParent, setZoneParent] = useState<ZoneKey | "">("");

  const [nomApp, setNomApp] = useState("");
  const [prenomsApp, setPrenomsApp] = useState("");
  const [age, setAge] = useState("");
  const [zoneApp, setZoneApp] = useState<ZoneKey | "">("");
  const [classe, setClasse] = useState("");
  const [serie, setSerie] = useState<string>("");
  const [matieres, setMatieres] = useState<string[]>([]);

  const [answers, setAnswers] = useState<(number | null)[]>(Array(9).fill(null));

  // Determine niveau from classe
  const niveau: "primaire" | "college" | "lycee" | null = CLASSES_PRIMAIRE.includes(classe)
    ? "primaire"
    : CLASSES_COLLEGE.includes(classe)
    ? "college"
    : CLASSES_LYCEE.includes(classe)
    ? "lycee"
    : null;

  const toggleMat = (m: string) => {
    if (matieres.includes(m)) setMatieres(matieres.filter((x) => x !== m));
    else if (matieres.length < 2) setMatieres([...matieres, m]);
    else toast.warning("Maximum 2 matières");
  };

  const handleSubmit = async () => {
    if (answers.some((a) => a === null)) {
      toast.error("Répondez à toutes les questions");
      return;
    }
    setLoading(true);
    const profil = computeProfilApprentissage(answers as number[]);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          role: "parent",
          username,
          nom,
          prenoms,
          telephone,
          profession,
          zone_residence: zoneParent,
          apprenant: {
            nom: nomApp,
            prenoms: prenomsApp,
            age: age,
            zone_residence: zoneApp,
            niveau,
            classe,
            serie: niveau === "lycee" ? serie : null,
            matieres: niveau === "primaire" ? [] : matieres,
            profil_apprentissage: profil,
          },
          quiz: {
            type: "profil_apprentissage",
            reponses: answers,
            profil_calcule: profil,
          },
        },
      },
    });

    setLoading(false);

    if (error) {
      toast.error(error.message ?? "Erreur d'inscription");
      return;
    }

    setDone(true);
    toast.success("Inscription enregistrée ! Vérifiez votre boîte mail pour confirmer votre adresse.");
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
          <div><Label>Nom d'utilisateur *</Label><Input value={username} onChange={(e) => setUsername(e.target.value)} /></div>
          <div><Label>Email *</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div className="relative">
            <Label>Mot de passe *</Label>
            <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} className="pr-10" />
            <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-[28px] text-muted-foreground hover:text-foreground">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <Button className="w-full bg-brand text-white" onClick={() => setStep(2)} disabled={!email || !password || !username}>Suivant</Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-primary">Parent</h3>
          <div className="grid grid-cols-2 gap-2">
            <div><Label>Nom *</Label><Input value={nom} onChange={(e) => setNom(e.target.value)} /></div>
            <div><Label>Prénoms *</Label><Input value={prenoms} onChange={(e) => setPrenoms(e.target.value)} /></div>
          </div>
          <div><Label>Téléphone *</Label><Input value={telephone} onChange={(e) => setTelephone(e.target.value)} /></div>
          <div><Label>Profession *</Label><Input value={profession} onChange={(e) => setProfession(e.target.value)} /></div>
          <div>
            <Label>Zone de résidence (parent) *</Label>
            <Select value={zoneParent} onValueChange={(v) => setZoneParent(v as ZoneKey)}>
              <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
              <SelectContent>
                {Object.entries(ZONES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Précédent</Button>
            <Button className="flex-1 bg-brand text-white" onClick={() => setStep(3)} disabled={!nom || !prenoms || !telephone || !profession || !zoneParent}>Suivant</Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-primary">Apprenant</h3>
          <div className="grid grid-cols-2 gap-2">
            <div><Label>Nom *</Label><Input value={nomApp} onChange={(e) => setNomApp(e.target.value)} /></div>
            <div><Label>Prénoms *</Label><Input value={prenomsApp} onChange={(e) => setPrenomsApp(e.target.value)} /></div>
          </div>
          <div><Label>Âge *</Label><Input type="number" value={age} onChange={(e) => setAge(e.target.value)} /></div>
          <div>
            <Label>Zone de l'apprenant *</Label>
            <Select value={zoneApp} onValueChange={(v) => setZoneApp(v as ZoneKey)}>
              <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
              <SelectContent>
                {Object.entries(ZONES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Classe *</Label>
            <Select value={classe} onValueChange={(v) => { setClasse(v); setMatieres([]); setSerie(""); }}>
              <SelectTrigger><SelectValue placeholder="Choisir la classe..." /></SelectTrigger>
              <SelectContent>
                {[...CLASSES_PRIMAIRE, ...CLASSES_COLLEGE, ...CLASSES_LYCEE].map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {niveau === "lycee" && (
            <div>
              <Label>Série *</Label>
              <RadioGroup value={serie} onValueChange={setSerie} className="flex gap-3 mt-1">
                {SERIES.map((s) => (
                  <div key={s} className="flex items-center gap-1">
                    <RadioGroupItem value={s} id={`sa-${s}`} /><Label htmlFor={`sa-${s}`}>{s}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}
          {(niveau === "college" || niveau === "lycee") && (
            <div>
              <Label>Matières (besoin) — max 2</Label>
              <div className="grid grid-cols-2 gap-1 mt-1">
                {MATIERES.map((m) => (
                  <div key={m} className="flex items-center gap-1">
                    <Checkbox checked={matieres.includes(m)} onCheckedChange={() => toggleMat(m)} id={`mp-${m}`} />
                    <Label htmlFor={`mp-${m}`} className="text-xs">{m}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(2)} className="flex-1">Précédent</Button>
            <Button className="flex-1 bg-brand text-white" onClick={() => setStep(4)} disabled={!nomApp || !prenomsApp || !age || !zoneApp || !classe || (niveau === "lycee" && !serie) || ((niveau === "college" || niveau === "lycee") && matieres.length === 0)}>
              Suivant
            </Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-primary">Profil d'apprentissage de l'apprenant</h3>
          <p className="text-xs text-muted-foreground">L'apprenant répond en se basant sur ses réussites.</p>
          {QUIZ.map((q, i) => (
            <div key={i} className="space-y-1 border rounded-lg p-3">
              <p className="text-sm font-medium">{i + 1}. {q}</p>
              <RadioGroup value={answers[i]?.toString() ?? ""} onValueChange={(v) => {
                const next = [...answers]; next[i] = parseInt(v); setAnswers(next);
              }}>
                {QUIZ_OPTIONS[i].map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <RadioGroupItem value={idx.toString()} id={`pq${i}-${idx}`} />
                    <Label htmlFor={`pq${i}-${idx}`} className="text-sm font-normal">{opt}</Label>
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
