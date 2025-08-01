export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      analyses: {
        Row: {
          ai_prompt: string | null
          created_at: string
          id: string
          metadata: Json | null
          processing_time_ms: number | null
          project_id: string
          screenshot_url: string | null
          source_url: string | null
          status: Database["public"]["Enums"]["analysis_status"]
          type: Database["public"]["Enums"]["analysis_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_prompt?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          processing_time_ms?: number | null
          project_id: string
          screenshot_url?: string | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["analysis_status"]
          type: Database["public"]["Enums"]["analysis_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_prompt?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          processing_time_ms?: number | null
          project_id?: string
          screenshot_url?: string | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["analysis_status"]
          type?: Database["public"]["Enums"]["analysis_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "analyses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      analysis_screenshots: {
        Row: {
          analysis_id: string
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          height: number | null
          id: string
          is_original: boolean
          mime_type: string | null
          user_id: string
          width: number | null
        }
        Insert: {
          analysis_id: string
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          height?: number | null
          id?: string
          is_original?: boolean
          mime_type?: string | null
          user_id: string
          width?: number | null
        }
        Update: {
          analysis_id?: string
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          height?: number | null
          id?: string
          is_original?: boolean
          mime_type?: string | null
          user_id?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "analysis_screenshots_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      analysis_tags: {
        Row: {
          analysis_id: string
          created_at: string
          id: string
          tag: string
          user_id: string
        }
        Insert: {
          analysis_id: string
          created_at?: string
          id?: string
          tag: string
          user_id: string
        }
        Update: {
          analysis_id?: string
          created_at?: string
          id?: string
          tag?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "analysis_tags_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      component_templates: {
        Row: {
          created_at: string
          css_template: string | null
          description: string | null
          html_template: string | null
          id: string
          is_public: boolean
          name: string
          props_schema: Json | null
          react_template: string | null
          tailwind_template: string | null
          type: Database["public"]["Enums"]["component_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          css_template?: string | null
          description?: string | null
          html_template?: string | null
          id?: string
          is_public?: boolean
          name: string
          props_schema?: Json | null
          react_template?: string | null
          tailwind_template?: string | null
          type?: Database["public"]["Enums"]["component_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          css_template?: string | null
          description?: string | null
          html_template?: string | null
          id?: string
          is_public?: boolean
          name?: string
          props_schema?: Json | null
          react_template?: string | null
          tailwind_template?: string | null
          type?: Database["public"]["Enums"]["component_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      components: {
        Row: {
          analysis_id: string
          created_at: string
          css_code: string | null
          description: string | null
          html_code: string | null
          id: string
          name: string
          position_data: Json | null
          props: Json | null
          react_code: string | null
          tailwind_classes: string | null
          type: Database["public"]["Enums"]["component_type"]
          user_id: string
        }
        Insert: {
          analysis_id: string
          created_at?: string
          css_code?: string | null
          description?: string | null
          html_code?: string | null
          id?: string
          name: string
          position_data?: Json | null
          props?: Json | null
          react_code?: string | null
          tailwind_classes?: string | null
          type?: Database["public"]["Enums"]["component_type"]
          user_id: string
        }
        Update: {
          analysis_id?: string
          created_at?: string
          css_code?: string | null
          description?: string | null
          html_code?: string | null
          id?: string
          name?: string
          position_data?: Json | null
          props?: Json | null
          react_code?: string | null
          tailwind_classes?: string | null
          type?: Database["public"]["Enums"]["component_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "components_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      design_systems: {
        Row: {
          analysis_id: string
          border_radius: Json
          breakpoints: Json
          colors: Json
          created_at: string
          fonts: Json
          id: string
          shadows: Json
          spacing: Json
          user_id: string
        }
        Insert: {
          analysis_id: string
          border_radius?: Json
          breakpoints?: Json
          colors?: Json
          created_at?: string
          fonts?: Json
          id?: string
          shadows?: Json
          spacing?: Json
          user_id: string
        }
        Update: {
          analysis_id?: string
          border_radius?: Json
          breakpoints?: Json
          colors?: Json
          created_at?: string
          fonts?: Json
          id?: string
          shadows?: Json
          spacing?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "design_systems_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_code: {
        Row: {
          analysis_id: string
          code: string
          created_at: string
          file_size: number | null
          filename: string | null
          format: Database["public"]["Enums"]["code_format"]
          id: string
          user_id: string
        }
        Insert: {
          analysis_id: string
          code: string
          created_at?: string
          file_size?: number | null
          filename?: string | null
          format: Database["public"]["Enums"]["code_format"]
          id?: string
          user_id: string
        }
        Update: {
          analysis_id?: string
          code?: string
          created_at?: string
          file_size?: number | null
          filename?: string | null
          format?: Database["public"]["Enums"]["code_format"]
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_code_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          ai_model_preference: string | null
          auto_generate_components: boolean
          created_at: string
          default_code_format: Database["public"]["Enums"]["code_format"]
          export_settings: Json
          id: string
          preferred_css_framework: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_model_preference?: string | null
          auto_generate_components?: boolean
          created_at?: string
          default_code_format?: Database["public"]["Enums"]["code_format"]
          export_settings?: Json
          id?: string
          preferred_css_framework?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_model_preference?: string | null
          auto_generate_components?: boolean
          created_at?: string
          default_code_format?: Database["public"]["Enums"]["code_format"]
          export_settings?: Json
          id?: string
          preferred_css_framework?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      analysis_status: "pending" | "processing" | "completed" | "failed"
      analysis_type: "url" | "screenshot"
      code_format: "html" | "css" | "react" | "tailwind" | "vue" | "angular"
      component_type:
        | "button"
        | "input"
        | "card"
        | "navigation"
        | "header"
        | "footer"
        | "form"
        | "modal"
        | "table"
        | "other"
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
      analysis_status: ["pending", "processing", "completed", "failed"],
      analysis_type: ["url", "screenshot"],
      code_format: ["html", "css", "react", "tailwind", "vue", "angular"],
      component_type: [
        "button",
        "input",
        "card",
        "navigation",
        "header",
        "footer",
        "form",
        "modal",
        "table",
        "other",
      ],
    },
  },
} as const
