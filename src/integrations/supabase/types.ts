export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      apprenants: {
        Row: {
          age: number
          classe: string
          created_at: string
          id: string
          matieres: string[] | null
          niveau: Database["public"]["Enums"]["niveau_type"]
          nom: string
          parent_id: string
          prenoms: string
          profil_apprentissage: string | null
          serie: Database["public"]["Enums"]["serie_type"] | null
          updated_at: string
          zone_residence: Database["public"]["Enums"]["zone_residence"]
        }
        Insert: {
          age: number
          classe: string
          created_at?: string
          id?: string
          matieres?: string[] | null
          niveau: Database["public"]["Enums"]["niveau_type"]
          nom: string
          parent_id: string
          prenoms: string
          profil_apprentissage?: string | null
          serie?: Database["public"]["Enums"]["serie_type"] | null
          updated_at?: string
          zone_residence: Database["public"]["Enums"]["zone_residence"]
        }
        Update: {
          age?: number
          classe?: string
          created_at?: string
          id?: string
          matieres?: string[] | null
          niveau?: Database["public"]["Enums"]["niveau_type"]
          nom?: string
          parent_id?: string
          prenoms?: string
          profil_apprentissage?: string | null
          serie?: Database["public"]["Enums"]["serie_type"] | null
          updated_at?: string
          zone_residence?: Database["public"]["Enums"]["zone_residence"]
        }
        Relationships: [
          {
            foreignKeyName: "apprenants_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apprenants_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts_credits: {
        Row: {
          credits_restants: number
          id: string
          parent_id: string
          updated_at: string
        }
        Insert: {
          credits_restants?: number
          id?: string
          parent_id: string
          updated_at?: string
        }
        Update: {
          credits_restants?: number
          id?: string
          parent_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_credits_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_credits_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: true
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      correspondances: {
        Row: {
          apprenant_id: string | null
          contact_debloque: boolean
          created_at: string
          encadreur_id: string
          id: string
          initiateur: Database["public"]["Enums"]["app_role"]
          parent_id: string
          statut: Database["public"]["Enums"]["correspondance_statut"]
          updated_at: string
        }
        Insert: {
          apprenant_id?: string | null
          contact_debloque?: boolean
          created_at?: string
          encadreur_id: string
          id?: string
          initiateur: Database["public"]["Enums"]["app_role"]
          parent_id: string
          statut?: Database["public"]["Enums"]["correspondance_statut"]
          updated_at?: string
        }
        Update: {
          apprenant_id?: string | null
          contact_debloque?: boolean
          created_at?: string
          encadreur_id?: string
          id?: string
          initiateur?: Database["public"]["Enums"]["app_role"]
          parent_id?: string
          statut?: Database["public"]["Enums"]["correspondance_statut"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "correspondances_apprenant_id_fkey"
            columns: ["apprenant_id"]
            isOneToOne: false
            referencedRelation: "apprenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "correspondances_apprenant_id_fkey"
            columns: ["apprenant_id"]
            isOneToOne: false
            referencedRelation: "public_apprenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "correspondances_encadreur_id_fkey"
            columns: ["encadreur_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "correspondances_encadreur_id_fkey"
            columns: ["encadreur_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "correspondances_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "correspondances_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      encadreur_refus: {
        Row: {
          admin_id: string
          created_at: string
          encadreur_id: string
          encadreur_profile_id: string
          id: string
          motif: string
        }
        Insert: {
          admin_id?: string
          created_at?: string
          encadreur_id: string
          encadreur_profile_id: string
          id?: string
          motif: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          encadreur_id?: string
          encadreur_profile_id?: string
          id?: string
          motif?: string
        }
        Relationships: []
      }
      encadreurs: {
        Row: {
          classes_college: string[] | null
          classes_lycee: string[] | null
          classes_primaire: string[] | null
          created_at: string
          dernier_diplome: string
          experience_detail: string | null
          experience_pro: boolean
          formation_super_apprenant: boolean
          formation_validee: boolean
          genre: Database["public"]["Enums"]["genre_type"]
          id: string
          matieres_college: string[] | null
          matieres_lycee: string[] | null
          motivation: string
          niveaux: Database["public"]["Enums"]["niveau_type"][]
          premium: boolean
          profil_pedagogique: string | null
          profile_id: string
          series_lycee: Database["public"]["Enums"]["serie_type"][] | null
          updated_at: string
          zone_residence: Database["public"]["Enums"]["zone_residence"]
        }
        Insert: {
          classes_college?: string[] | null
          classes_lycee?: string[] | null
          classes_primaire?: string[] | null
          created_at?: string
          dernier_diplome: string
          experience_detail?: string | null
          experience_pro?: boolean
          formation_super_apprenant?: boolean
          formation_validee?: boolean
          genre: Database["public"]["Enums"]["genre_type"]
          id?: string
          matieres_college?: string[] | null
          matieres_lycee?: string[] | null
          motivation: string
          niveaux?: Database["public"]["Enums"]["niveau_type"][]
          premium?: boolean
          profil_pedagogique?: string | null
          profile_id: string
          series_lycee?: Database["public"]["Enums"]["serie_type"][] | null
          updated_at?: string
          zone_residence: Database["public"]["Enums"]["zone_residence"]
        }
        Update: {
          classes_college?: string[] | null
          classes_lycee?: string[] | null
          classes_primaire?: string[] | null
          created_at?: string
          dernier_diplome?: string
          experience_detail?: string | null
          experience_pro?: boolean
          formation_super_apprenant?: boolean
          formation_validee?: boolean
          genre?: Database["public"]["Enums"]["genre_type"]
          id?: string
          matieres_college?: string[] | null
          matieres_lycee?: string[] | null
          motivation?: string
          niveaux?: Database["public"]["Enums"]["niveau_type"][]
          premium?: boolean
          profil_pedagogique?: string | null
          profile_id?: string
          series_lycee?: Database["public"]["Enums"]["serie_type"][] | null
          updated_at?: string
          zone_residence?: Database["public"]["Enums"]["zone_residence"]
        }
        Relationships: [
          {
            foreignKeyName: "encadreurs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "encadreurs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          lien: string | null
          lu: boolean
          message: string
          titre: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lien?: string | null
          lu?: boolean
          message: string
          titre: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lien?: string | null
          lu?: boolean
          message?: string
          titre?: string
          user_id?: string
        }
        Relationships: []
      }
      paiements: {
        Row: {
          created_at: string
          fedapay_ref: string | null
          id: string
          metadata: Json | null
          montant: number
          statut: Database["public"]["Enums"]["paiement_statut"]
          type: Database["public"]["Enums"]["paiement_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          fedapay_ref?: string | null
          id?: string
          metadata?: Json | null
          montant: number
          statut?: Database["public"]["Enums"]["paiement_statut"]
          type: Database["public"]["Enums"]["paiement_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          fedapay_ref?: string | null
          id?: string
          metadata?: Json | null
          montant?: number
          statut?: Database["public"]["Enums"]["paiement_statut"]
          type?: Database["public"]["Enums"]["paiement_type"]
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          nom: string
          photo_url: string | null
          prenoms: string
          profession: string | null
          telephone: string
          updated_at: string
          username: string
          zone_residence: Database["public"]["Enums"]["zone_residence"] | null
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          nom: string
          photo_url?: string | null
          prenoms: string
          profession?: string | null
          telephone: string
          updated_at?: string
          username: string
          zone_residence?: Database["public"]["Enums"]["zone_residence"] | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          nom?: string
          photo_url?: string | null
          prenoms?: string
          profession?: string | null
          telephone?: string
          updated_at?: string
          username?: string
          zone_residence?: Database["public"]["Enums"]["zone_residence"] | null
        }
        Relationships: []
      }
      quiz_responses: {
        Row: {
          created_at: string
          id: string
          profil_calcule: string | null
          profile_id: string
          reponses: Json
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          profil_calcule?: string | null
          profile_id: string
          reponses: Json
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          profil_calcule?: string | null
          profile_id?: string
          reponses?: Json
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_responses_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_responses_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      support_messages: {
        Row: {
          admin_id: string | null
          created_at: string
          id: string
          message: string
          reponse_admin: string | null
          statut: Database["public"]["Enums"]["support_statut"]
          sujet: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_id?: string | null
          created_at?: string
          id?: string
          message: string
          reponse_admin?: string | null
          statut?: Database["public"]["Enums"]["support_statut"]
          sujet: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          admin_id?: string | null
          created_at?: string
          id?: string
          message?: string
          reponse_admin?: string | null
          statut?: Database["public"]["Enums"]["support_statut"]
          sujet?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_apprenants: {
        Row: {
          age: number | null
          classe: string | null
          id: string | null
          matieres: string[] | null
          niveau: Database["public"]["Enums"]["niveau_type"] | null
          parent_id: string | null
          profil_apprentissage: string | null
          serie: Database["public"]["Enums"]["serie_type"] | null
          zone_residence: Database["public"]["Enums"]["zone_residence"] | null
        }
        Insert: {
          age?: number | null
          classe?: string | null
          id?: string | null
          matieres?: string[] | null
          niveau?: Database["public"]["Enums"]["niveau_type"] | null
          parent_id?: string | null
          profil_apprentissage?: string | null
          serie?: Database["public"]["Enums"]["serie_type"] | null
          zone_residence?: Database["public"]["Enums"]["zone_residence"] | null
        }
        Update: {
          age?: number | null
          classe?: string | null
          id?: string | null
          matieres?: string[] | null
          niveau?: Database["public"]["Enums"]["niveau_type"] | null
          parent_id?: string | null
          profil_apprentissage?: string | null
          serie?: Database["public"]["Enums"]["serie_type"] | null
          zone_residence?: Database["public"]["Enums"]["zone_residence"] | null
        }
        Relationships: [
          {
            foreignKeyName: "apprenants_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apprenants_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      public_encadreurs: {
        Row: {
          classes_college: string[] | null
          classes_lycee: string[] | null
          classes_primaire: string[] | null
          dernier_diplome: string | null
          experience_pro: boolean | null
          genre: Database["public"]["Enums"]["genre_type"] | null
          id: string | null
          matieres_college: string[] | null
          matieres_lycee: string[] | null
          niveaux: Database["public"]["Enums"]["niveau_type"][] | null
          premium: boolean | null
          profil_pedagogique: string | null
          profile_id: string | null
          series_lycee: Database["public"]["Enums"]["serie_type"][] | null
          zone_residence: Database["public"]["Enums"]["zone_residence"] | null
        }
        Insert: {
          classes_college?: string[] | null
          classes_lycee?: string[] | null
          classes_primaire?: string[] | null
          dernier_diplome?: string | null
          experience_pro?: boolean | null
          genre?: Database["public"]["Enums"]["genre_type"] | null
          id?: string | null
          matieres_college?: string[] | null
          matieres_lycee?: string[] | null
          niveaux?: Database["public"]["Enums"]["niveau_type"][] | null
          premium?: boolean | null
          profil_pedagogique?: string | null
          profile_id?: string | null
          series_lycee?: Database["public"]["Enums"]["serie_type"][] | null
          zone_residence?: Database["public"]["Enums"]["zone_residence"] | null
        }
        Update: {
          classes_college?: string[] | null
          classes_lycee?: string[] | null
          classes_primaire?: string[] | null
          dernier_diplome?: string | null
          experience_pro?: boolean | null
          genre?: Database["public"]["Enums"]["genre_type"] | null
          id?: string | null
          matieres_college?: string[] | null
          matieres_lycee?: string[] | null
          niveaux?: Database["public"]["Enums"]["niveau_type"][] | null
          premium?: boolean | null
          profil_pedagogique?: string | null
          profile_id?: string | null
          series_lycee?: Database["public"]["Enums"]["serie_type"][] | null
          zone_residence?: Database["public"]["Enums"]["zone_residence"] | null
        }
        Relationships: [
          {
            foreignKeyName: "encadreurs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "encadreurs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      public_profiles: {
        Row: {
          id: string | null
          nom: string | null
          photo_url: string | null
          prenoms: string | null
          zone_residence: Database["public"]["Enums"]["zone_residence"] | null
        }
        Insert: {
          id?: string | null
          nom?: string | null
          photo_url?: string | null
          prenoms?: string | null
          zone_residence?: Database["public"]["Enums"]["zone_residence"] | null
        }
        Update: {
          id?: string | null
          nom?: string | null
          photo_url?: string | null
          prenoms?: string | null
          zone_residence?: Database["public"]["Enums"]["zone_residence"] | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "encadreur" | "parent"
      correspondance_statut: "en_attente" | "acceptee" | "refusee" | "debloquee"
      genre_type: "homme" | "femme"
      niveau_type: "primaire" | "college" | "lycee"
      paiement_statut: "en_attente" | "reussi" | "echoue"
      paiement_type:
        | "premium_encadreur"
        | "contact_unique_encadreur"
        | "pack_contacts_parent"
      serie_type: "A" | "C" | "D"
      support_statut: "ouvert" | "en_cours" | "resolu"
      zone_residence: "zone1" | "zone2" | "zone3"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "encadreur", "parent"],
      correspondance_statut: ["en_attente", "acceptee", "refusee", "debloquee"],
      genre_type: ["homme", "femme"],
      niveau_type: ["primaire", "college", "lycee"],
      paiement_statut: ["en_attente", "reussi", "echoue"],
      paiement_type: [
        "premium_encadreur",
        "contact_unique_encadreur",
        "pack_contacts_parent",
      ],
      serie_type: ["A", "C", "D"],
      support_statut: ["ouvert", "en_cours", "resolu"],
      zone_residence: ["zone1", "zone2", "zone3"],
    },
  },
} as const
