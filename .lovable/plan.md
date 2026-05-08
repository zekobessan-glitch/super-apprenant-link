## SUPER@PPRENANT-I — Plateforme de mise en relation Parents/Élèves & Encadreurs

Application web responsive (TanStack Start + Supabase + Tailwind) en français, palette **bleu / orange / noir**, avec logo officiel.

### Phase 1 — Fondations (ce premier message)

**Design system & branding**
- Intégrer le logo fourni (`src/assets/logo.png`)
- Palette : bleu profond `#1e40af`, orange `#f59e0b`, noir, blanc — tokens dans `src/styles.css`
- Typographie élégante (Outfit / Inter)
- Footer noir global : « SUPER@PPRENANT-I © 2026. Développé par ZEKO SERVICE » → www.zeko-services.com

**Page d'accueil (`/`)**
- Hero avec logo + verset Proverbes 22:6
- Slogan « Chaque jour plus fort à l'école »
- Onglets **Connexion / Inscription** directement sur la page
- Inscription : choix du rôle (Parent/Élève ou Encadreur) → formulaire multi-étapes correspondant
- Lien admin discret

**Base de données Supabase (1ère migration)**
- `profiles` (user_id, role: admin/parent/encadreur, nom, prénoms, téléphone, email, photo_url, zone, premium, validated, created_at)
- `encadreurs` (profile_id, genre, diplôme, expérience, niveau[], classes[], séries[], matières[], motivation, profil_pédagogique, formation_super_apprenant, formation_validée)
- `apprenants` (profile_id parent, nom_apprenant, prénoms, âge, zone, classe, série, matières[], profil_apprentissage)
- `quiz_responses` (profile_id, type, réponses jsonb, profil_calculé)
- `correspondances` (encadreur_id, parent_id, statut, initiateur, contact_débloqué, créé_le)
- `notifications` (user_id, titre, message, lu, créé_le)
- `paiements` (user_id, montant, type: premium/contact_pack/contact_unique, statut, fedapay_ref, créé_le)
- `contacts_credits` (parent_id, crédits_restants) ; `contacts_débloqués` (encadreur_id, parent_id)
- RLS : chaque user voit ses données ; admin voit tout via fonction `has_role`
- Table `user_roles` + enum `app_role` + fonction `has_role` (sécurité)
- Compte admin par défaut à créer après inscription : `ekbessan@gmail.com`

**Authentification Supabase**
- Email/mot de passe (auto-confirm activé pour dev)
- Trigger auto-create profile à l'inscription
- Route `/_authenticated/*` protégée

**Tableaux de bord (squelettes navigables)**
- `/dashboard/admin` — stats, liste users, validations
- `/dashboard/encadreur` — catalogue parents, correspondances, paiements
- `/dashboard/parent` — catalogue encadreurs, contacts, paiements
- Layout commun : sidebar bleue, contenu, profil

### Phase 2 (messages suivants — à itérer)

- Algorithme de matching (zone + classe + matières + série + profils)
- Calcul automatique du profil pédagogique (questionnaire 6Q encadreur)
- Calcul automatique du profil d'apprentissage (questionnaire 9Q apprenant)
- Notifications automatiques + emails (edge function)
- Intégration **FedaPay** (5000 FCFA — encadreur par contact / parent pack 3 contacts / encadreur premium)
- Validation admin → premium auto pour encadreurs « formation Super Apprenant »
- Limite 5 contacts par encadreur

### Détails techniques

- Stack : TanStack Start (déjà en place), Supabase (déjà connecté), Tailwind v4, shadcn/ui
- Validation Zod pour tous les formulaires
- React Hook Form pour formulaires multi-étapes
- Tanstack Query pour data fetching
- FedaPay : SDK JS côté client + edge function pour vérification webhook

### Question

Le périmètre est très large. **Je propose de commencer par la Phase 1** (design, page d'accueil avec inscription complète multi-étapes pour les deux rôles, schéma Supabase complet, dashboards avec navigation et données réelles). Le matching, FedaPay et notifications email viendront ensuite par itérations courtes.

Confirmez-vous ce découpage ?