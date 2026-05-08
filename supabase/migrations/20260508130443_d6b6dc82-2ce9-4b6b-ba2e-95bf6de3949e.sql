
-- ===== ENUMS =====
CREATE TYPE public.app_role AS ENUM ('admin', 'encadreur', 'parent');
CREATE TYPE public.zone_residence AS ENUM ('zone1', 'zone2', 'zone3');
CREATE TYPE public.genre_type AS ENUM ('homme', 'femme');
CREATE TYPE public.niveau_type AS ENUM ('primaire', 'college', 'lycee');
CREATE TYPE public.serie_type AS ENUM ('A', 'C', 'D');
CREATE TYPE public.correspondance_statut AS ENUM ('en_attente', 'acceptee', 'refusee', 'debloquee');
CREATE TYPE public.paiement_type AS ENUM ('premium_encadreur', 'contact_unique_encadreur', 'pack_contacts_parent');
CREATE TYPE public.paiement_statut AS ENUM ('en_attente', 'reussi', 'echoue');

-- ===== PROFILES =====
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  nom TEXT NOT NULL,
  prenoms TEXT NOT NULL,
  telephone TEXT NOT NULL,
  email TEXT NOT NULL,
  photo_url TEXT,
  zone_residence public.zone_residence,
  profession TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ===== USER ROLES =====
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer functions
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS public.app_role LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1 $$;

-- ===== ENCADREURS =====
CREATE TABLE public.encadreurs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  genre public.genre_type NOT NULL,
  zone_residence public.zone_residence NOT NULL,
  dernier_diplome TEXT NOT NULL,
  experience_pro BOOLEAN NOT NULL DEFAULT false,
  experience_detail TEXT,
  niveaux public.niveau_type[] NOT NULL DEFAULT '{}',
  classes_primaire TEXT[] DEFAULT '{}',
  classes_college TEXT[] DEFAULT '{}',
  classes_lycee TEXT[] DEFAULT '{}',
  series_lycee public.serie_type[] DEFAULT '{}',
  matieres_college TEXT[] DEFAULT '{}',
  matieres_lycee TEXT[] DEFAULT '{}',
  motivation TEXT NOT NULL,
  profil_pedagogique TEXT,
  formation_super_apprenant BOOLEAN NOT NULL DEFAULT false,
  formation_validee BOOLEAN NOT NULL DEFAULT false,
  premium BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.encadreurs ENABLE ROW LEVEL SECURITY;

-- ===== APPRENANTS =====
CREATE TABLE public.apprenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  prenoms TEXT NOT NULL,
  age INT NOT NULL,
  zone_residence public.zone_residence NOT NULL,
  niveau public.niveau_type NOT NULL,
  classe TEXT NOT NULL,
  serie public.serie_type,
  matieres TEXT[] DEFAULT '{}',
  profil_apprentissage TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.apprenants ENABLE ROW LEVEL SECURITY;

-- ===== QUIZ RESPONSES =====
CREATE TABLE public.quiz_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  reponses JSONB NOT NULL,
  profil_calcule TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.quiz_responses ENABLE ROW LEVEL SECURITY;

-- ===== CORRESPONDANCES =====
CREATE TABLE public.correspondances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encadreur_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  apprenant_id UUID REFERENCES public.apprenants(id) ON DELETE SET NULL,
  statut public.correspondance_statut NOT NULL DEFAULT 'en_attente',
  initiateur public.app_role NOT NULL,
  contact_debloque BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (encadreur_id, parent_id, apprenant_id)
);
ALTER TABLE public.correspondances ENABLE ROW LEVEL SECURITY;

-- ===== NOTIFICATIONS =====
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titre TEXT NOT NULL,
  message TEXT NOT NULL,
  lien TEXT,
  lu BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ===== PAIEMENTS =====
CREATE TABLE public.paiements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  montant INT NOT NULL,
  type public.paiement_type NOT NULL,
  statut public.paiement_statut NOT NULL DEFAULT 'en_attente',
  fedapay_ref TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.paiements ENABLE ROW LEVEL SECURITY;

-- ===== CONTACTS CREDITS =====
CREATE TABLE public.contacts_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  credits_restants INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.contacts_credits ENABLE ROW LEVEL SECURITY;

-- ===== TRIGGERS =====
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_encadreurs_updated BEFORE UPDATE ON public.encadreurs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_apprenants_updated BEFORE UPDATE ON public.apprenants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_correspondances_updated BEFORE UPDATE ON public.correspondances
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== AUTO-CREATE PROFILE ON SIGNUP =====
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, username, nom, prenoms, telephone, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'nom', ''),
    COALESCE(NEW.raw_user_meta_data->>'prenoms', ''),
    COALESCE(NEW.raw_user_meta_data->>'telephone', ''),
    NEW.email
  );

  IF NEW.raw_user_meta_data->>'role' IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, (NEW.raw_user_meta_data->>'role')::public.app_role)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===== RLS POLICIES =====

-- profiles
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_select_authenticated_catalog" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_admin_all" ON public.profiles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- user_roles
CREATE POLICY "user_roles_select_own" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "user_roles_admin_manage" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- encadreurs
CREATE POLICY "encadreurs_select_all_authenticated" ON public.encadreurs FOR SELECT TO authenticated USING (true);
CREATE POLICY "encadreurs_insert_own" ON public.encadreurs FOR INSERT TO authenticated WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "encadreurs_update_own" ON public.encadreurs FOR UPDATE TO authenticated USING (auth.uid() = profile_id);
CREATE POLICY "encadreurs_admin_all" ON public.encadreurs FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- apprenants
CREATE POLICY "apprenants_select_all_authenticated" ON public.apprenants FOR SELECT TO authenticated USING (true);
CREATE POLICY "apprenants_insert_own" ON public.apprenants FOR INSERT TO authenticated WITH CHECK (auth.uid() = parent_id);
CREATE POLICY "apprenants_update_own" ON public.apprenants FOR UPDATE TO authenticated USING (auth.uid() = parent_id);
CREATE POLICY "apprenants_delete_own" ON public.apprenants FOR DELETE TO authenticated USING (auth.uid() = parent_id);
CREATE POLICY "apprenants_admin_all" ON public.apprenants FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- quiz_responses
CREATE POLICY "quiz_select_own" ON public.quiz_responses FOR SELECT TO authenticated USING (auth.uid() = profile_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "quiz_insert_own" ON public.quiz_responses FOR INSERT TO authenticated WITH CHECK (auth.uid() = profile_id);

-- correspondances
CREATE POLICY "correspondances_select_involved" ON public.correspondances FOR SELECT TO authenticated USING (auth.uid() = encadreur_id OR auth.uid() = parent_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "correspondances_insert_involved" ON public.correspondances FOR INSERT TO authenticated WITH CHECK (auth.uid() = encadreur_id OR auth.uid() = parent_id);
CREATE POLICY "correspondances_update_involved" ON public.correspondances FOR UPDATE TO authenticated USING (auth.uid() = encadreur_id OR auth.uid() = parent_id OR public.has_role(auth.uid(), 'admin'));

-- notifications
CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "notifications_admin_all" ON public.notifications FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- paiements
CREATE POLICY "paiements_select_own" ON public.paiements FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "paiements_insert_own" ON public.paiements FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- contacts_credits
CREATE POLICY "credits_select_own" ON public.contacts_credits FOR SELECT TO authenticated USING (auth.uid() = parent_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "credits_admin_manage" ON public.contacts_credits FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ===== STORAGE BUCKET FOR PROFILE PHOTOS =====
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
