/**
 * TypeScript types for the database.
 *
 * Written to match supabase/migrations exactly, in the same shape the
 * Supabase type generator produces, so they work with the Supabase clients.
 * When a migration adds or changes a table, column or enum, update this
 * file in the same commit.
 *
 * Notes:
 * - uuid and timestamptz values arrive as strings.
 * - integer, bigint and numeric values arrive as numbers.
 * - "Insert" and "Update" describe the table's columns, not what a user is
 *   allowed to write. Row level security and column permissions decide that
 *   (see the "Database" section of CLAUDE.md).
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      books: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          author_name: string | null;
          genre: string | null;
          mood: string | null;
          summary: string | null;
          manuscript_file_id: string | null;
          cover_file_id: string | null;
          status: Database["public"]["Enums"]["book_status"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          author_name?: string | null;
          genre?: string | null;
          mood?: string | null;
          summary?: string | null;
          manuscript_file_id?: string | null;
          cover_file_id?: string | null;
          status?: Database["public"]["Enums"]["book_status"];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          author_name?: string | null;
          genre?: string | null;
          mood?: string | null;
          summary?: string | null;
          manuscript_file_id?: string | null;
          cover_file_id?: string | null;
          status?: Database["public"]["Enums"]["book_status"];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "books_cover_file_id_fkey";
            columns: ["cover_file_id"];
            isOneToOne: false;
            referencedRelation: "files";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "books_manuscript_file_id_fkey";
            columns: ["manuscript_file_id"];
            isOneToOne: false;
            referencedRelation: "files";
            referencedColumns: ["id"];
          },
        ];
      };
      characters: {
        Row: {
          id: string;
          user_id: string;
          book_id: string | null;
          name: string;
          description: string | null;
          reference_file_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          book_id?: string | null;
          name: string;
          description?: string | null;
          reference_file_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          book_id?: string | null;
          name?: string;
          description?: string | null;
          reference_file_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "characters_book_id_fkey";
            columns: ["book_id"];
            isOneToOne: false;
            referencedRelation: "books";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "characters_reference_file_id_fkey";
            columns: ["reference_file_id"];
            isOneToOne: false;
            referencedRelation: "files";
            referencedColumns: ["id"];
          },
        ];
      };
      connected_account_secrets: {
        Row: {
          id: string;
          connected_account_id: string;
          access_token: string;
          refresh_token: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          connected_account_id: string;
          access_token: string;
          refresh_token?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          connected_account_id?: string;
          access_token?: string;
          refresh_token?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "connected_account_secrets_connected_account_id_fkey";
            columns: ["connected_account_id"];
            isOneToOne: true;
            referencedRelation: "connected_accounts";
            referencedColumns: ["id"];
          },
        ];
      };
      connected_accounts: {
        Row: {
          id: string;
          user_id: string;
          platform: Database["public"]["Enums"]["social_platform"];
          handle: string;
          status: Database["public"]["Enums"]["connection_status"];
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          platform: Database["public"]["Enums"]["social_platform"];
          handle: string;
          status?: Database["public"]["Enums"]["connection_status"];
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          platform?: Database["public"]["Enums"]["social_platform"];
          handle?: string;
          status?: Database["public"]["Enums"]["connection_status"];
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      credit_transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          kind: Database["public"]["Enums"]["credit_transaction_kind"];
          job_id: string | null;
          note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          kind: Database["public"]["Enums"]["credit_transaction_kind"];
          job_id?: string | null;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          kind?: Database["public"]["Enums"]["credit_transaction_kind"];
          job_id?: string | null;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "credit_transactions_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
        ];
      };
      credit_wallets: {
        Row: {
          id: string;
          user_id: string;
          balance: number;
          held: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          balance?: number;
          held?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          balance?: number;
          held?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      files: {
        Row: {
          id: string;
          user_id: string;
          kind: Database["public"]["Enums"]["file_kind"];
          storage_key: string;
          mime_type: string;
          size_bytes: number;
          width: number | null;
          height: number | null;
          duration_seconds: number | null;
          safety_status: Database["public"]["Enums"]["safety_status"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          kind: Database["public"]["Enums"]["file_kind"];
          storage_key: string;
          mime_type: string;
          size_bytes: number;
          width?: number | null;
          height?: number | null;
          duration_seconds?: number | null;
          safety_status?: Database["public"]["Enums"]["safety_status"];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          kind?: Database["public"]["Enums"]["file_kind"];
          storage_key?: string;
          mime_type?: string;
          size_bytes?: number;
          width?: number | null;
          height?: number | null;
          duration_seconds?: number | null;
          safety_status?: Database["public"]["Enums"]["safety_status"];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      gpu_connection_secrets: {
        Row: {
          id: string;
          gpu_connection_id: string;
          api_key: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          gpu_connection_id: string;
          api_key: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          gpu_connection_id?: string;
          api_key?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "gpu_connection_secrets_gpu_connection_id_fkey";
            columns: ["gpu_connection_id"];
            isOneToOne: true;
            referencedRelation: "gpu_connections";
            referencedColumns: ["id"];
          },
        ];
      };
      gpu_connections: {
        Row: {
          id: string;
          user_id: string;
          provider: Database["public"]["Enums"]["gpu_provider"];
          status: Database["public"]["Enums"]["connection_status"];
          endpoint_id: string | null;
          last_checked_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          provider: Database["public"]["Enums"]["gpu_provider"];
          status?: Database["public"]["Enums"]["connection_status"];
          endpoint_id?: string | null;
          last_checked_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          provider?: Database["public"]["Enums"]["gpu_provider"];
          status?: Database["public"]["Enums"]["connection_status"];
          endpoint_id?: string | null;
          last_checked_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      jobs: {
        Row: {
          id: string;
          user_id: string;
          project_id: string | null;
          scene_id: string | null;
          workflow_template_id: string | null;
          kind: Database["public"]["Enums"]["job_kind"];
          status: Database["public"]["Enums"]["job_status"];
          gpu_source: Database["public"]["Enums"]["gpu_source"];
          priority: number;
          attempt_count: number;
          input: Json;
          output_file_id: string | null;
          external_id: string | null;
          gpu_seconds: number;
          cost_usd: number;
          credits_held: number;
          credits_charged: number;
          error_message: string | null;
          started_at: string | null;
          finished_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id?: string | null;
          scene_id?: string | null;
          workflow_template_id?: string | null;
          kind: Database["public"]["Enums"]["job_kind"];
          status?: Database["public"]["Enums"]["job_status"];
          gpu_source?: Database["public"]["Enums"]["gpu_source"];
          priority?: number;
          attempt_count?: number;
          input?: Json;
          output_file_id?: string | null;
          external_id?: string | null;
          gpu_seconds?: number;
          cost_usd?: number;
          credits_held?: number;
          credits_charged?: number;
          error_message?: string | null;
          started_at?: string | null;
          finished_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          project_id?: string | null;
          scene_id?: string | null;
          workflow_template_id?: string | null;
          kind?: Database["public"]["Enums"]["job_kind"];
          status?: Database["public"]["Enums"]["job_status"];
          gpu_source?: Database["public"]["Enums"]["gpu_source"];
          priority?: number;
          attempt_count?: number;
          input?: Json;
          output_file_id?: string | null;
          external_id?: string | null;
          gpu_seconds?: number;
          cost_usd?: number;
          credits_held?: number;
          credits_charged?: number;
          error_message?: string | null;
          started_at?: string | null;
          finished_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "jobs_output_file_id_fkey";
            columns: ["output_file_id"];
            isOneToOne: false;
            referencedRelation: "files";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "jobs_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "jobs_scene_id_fkey";
            columns: ["scene_id"];
            isOneToOne: false;
            referencedRelation: "scenes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "jobs_workflow_template_id_fkey";
            columns: ["workflow_template_id"];
            isOneToOne: false;
            referencedRelation: "workflow_templates";
            referencedColumns: ["id"];
          },
        ];
      };
      personas: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          kind: Database["public"]["Enums"]["persona_kind"];
          look_description: string | null;
          reference_file_id: string | null;
          approval_status: Database["public"]["Enums"]["approval_status"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          kind: Database["public"]["Enums"]["persona_kind"];
          look_description?: string | null;
          reference_file_id?: string | null;
          approval_status?: Database["public"]["Enums"]["approval_status"];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          kind?: Database["public"]["Enums"]["persona_kind"];
          look_description?: string | null;
          reference_file_id?: string | null;
          approval_status?: Database["public"]["Enums"]["approval_status"];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "personas_reference_file_id_fkey";
            columns: ["reference_file_id"];
            isOneToOne: false;
            referencedRelation: "files";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          role: Database["public"]["Enums"]["user_role"] | null;
          is_admin: boolean;
          time_zone: string;
          plan: string;
          age_confirmed: boolean;
          id_check_status: Database["public"]["Enums"]["id_check_status"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          role?: Database["public"]["Enums"]["user_role"] | null;
          is_admin?: boolean;
          time_zone?: string;
          plan?: string;
          age_confirmed?: boolean;
          id_check_status?: Database["public"]["Enums"]["id_check_status"];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          role?: Database["public"]["Enums"]["user_role"] | null;
          is_admin?: boolean;
          time_zone?: string;
          plan?: string;
          age_confirmed?: boolean;
          id_check_status?: Database["public"]["Enums"]["id_check_status"];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          kind: Database["public"]["Enums"]["project_kind"];
          title: string;
          status: Database["public"]["Enums"]["project_status"];
          target_length_seconds: number | null;
          aspect_ratio: Database["public"]["Enums"]["aspect_ratio"] | null;
          current_step: string | null;
          book_id: string | null;
          persona_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          kind: Database["public"]["Enums"]["project_kind"];
          title: string;
          status?: Database["public"]["Enums"]["project_status"];
          target_length_seconds?: number | null;
          aspect_ratio?: Database["public"]["Enums"]["aspect_ratio"] | null;
          current_step?: string | null;
          book_id?: string | null;
          persona_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          kind?: Database["public"]["Enums"]["project_kind"];
          title?: string;
          status?: Database["public"]["Enums"]["project_status"];
          target_length_seconds?: number | null;
          aspect_ratio?: Database["public"]["Enums"]["aspect_ratio"] | null;
          current_step?: string | null;
          book_id?: string | null;
          persona_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "projects_book_id_fkey";
            columns: ["book_id"];
            isOneToOne: false;
            referencedRelation: "books";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "projects_persona_id_fkey";
            columns: ["persona_id"];
            isOneToOne: false;
            referencedRelation: "personas";
            referencedColumns: ["id"];
          },
        ];
      };
      scenes: {
        Row: {
          id: string;
          user_id: string;
          project_id: string;
          position: number;
          prompt: string | null;
          voiceover_line: string | null;
          length_seconds: number | null;
          keyframe_file_id: string | null;
          video_file_id: string | null;
          status: Database["public"]["Enums"]["scene_status"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id: string;
          position: number;
          prompt?: string | null;
          voiceover_line?: string | null;
          length_seconds?: number | null;
          keyframe_file_id?: string | null;
          video_file_id?: string | null;
          status?: Database["public"]["Enums"]["scene_status"];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          project_id?: string;
          position?: number;
          prompt?: string | null;
          voiceover_line?: string | null;
          length_seconds?: number | null;
          keyframe_file_id?: string | null;
          video_file_id?: string | null;
          status?: Database["public"]["Enums"]["scene_status"];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "scenes_keyframe_file_id_fkey";
            columns: ["keyframe_file_id"];
            isOneToOne: false;
            referencedRelation: "files";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "scenes_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "scenes_video_file_id_fkey";
            columns: ["video_file_id"];
            isOneToOne: false;
            referencedRelation: "files";
            referencedColumns: ["id"];
          },
        ];
      };
      scheduled_posts: {
        Row: {
          id: string;
          user_id: string;
          file_id: string | null;
          caption: string;
          hashtags: string[];
          platforms: Database["public"]["Enums"]["social_platform"][];
          scheduled_at: string | null;
          time_zone: string;
          status: Database["public"]["Enums"]["post_status"];
          safety_status: Database["public"]["Enums"]["safety_status"];
          post_url: string | null;
          error_message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          file_id?: string | null;
          caption?: string;
          hashtags?: string[];
          platforms?: Database["public"]["Enums"]["social_platform"][];
          scheduled_at?: string | null;
          time_zone?: string;
          status?: Database["public"]["Enums"]["post_status"];
          safety_status?: Database["public"]["Enums"]["safety_status"];
          post_url?: string | null;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          file_id?: string | null;
          caption?: string;
          hashtags?: string[];
          platforms?: Database["public"]["Enums"]["social_platform"][];
          scheduled_at?: string | null;
          time_zone?: string;
          status?: Database["public"]["Enums"]["post_status"];
          safety_status?: Database["public"]["Enums"]["safety_status"];
          post_url?: string | null;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "scheduled_posts_file_id_fkey";
            columns: ["file_id"];
            isOneToOne: false;
            referencedRelation: "files";
            referencedColumns: ["id"];
          },
        ];
      };
      workflow_templates: {
        Row: {
          id: string;
          name: string;
          kind: Database["public"]["Enums"]["workflow_kind"];
          version: number;
          workflow: Json;
          input_map: Json;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          kind: Database["public"]["Enums"]["workflow_kind"];
          version?: number;
          workflow: Json;
          input_map?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          kind?: Database["public"]["Enums"]["workflow_kind"];
          version?: number;
          workflow?: Json;
          input_map?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: never;
        Returns: boolean;
      };
      owns_book: {
        Args: { target_id: string };
        Returns: boolean;
      };
      owns_file: {
        Args: { target_id: string };
        Returns: boolean;
      };
      owns_persona: {
        Args: { target_id: string };
        Returns: boolean;
      };
      owns_project: {
        Args: { target_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      approval_status: "pending" | "approved" | "rejected";
      aspect_ratio: "16:9" | "9:16" | "1:1" | "4:5";
      book_status: "draft" | "ready" | "archived";
      connection_status: "pending" | "active" | "expired" | "error" | "revoked";
      credit_transaction_kind:
        | "purchase"
        | "hold"
        | "charge"
        | "release"
        | "refund"
        | "grant";
      file_kind:
        | "manuscript"
        | "cover"
        | "reference_image"
        | "keyframe"
        | "video_clip"
        | "final_video"
        | "image"
        | "audio"
        | "other";
      gpu_provider: "runpod" | "own_pc";
      gpu_source: "site" | "own_runpod" | "own_pc";
      id_check_status: "not_started" | "pending" | "passed" | "failed";
      job_kind: "image" | "video_shot" | "assemble";
      job_status: "queued" | "running" | "succeeded" | "failed" | "cancelled";
      persona_kind: "verified_self" | "ai_character";
      post_status: "draft" | "scheduled" | "posting" | "posted" | "failed";
      project_kind:
        | "trailer"
        | "short_video"
        | "image_post"
        | "carousel"
        | "thumbnail"
        | "feed_post"
        | "paid_set"
        | "clip"
        | "teaser";
      project_status: "draft" | "in_progress" | "completed" | "archived";
      safety_status: "not_checked" | "passed" | "held" | "blocked";
      scene_status: "draft" | "generating" | "ready" | "failed";
      social_platform:
        | "instagram"
        | "tiktok"
        | "youtube"
        | "facebook"
        | "x"
        | "fanvue";
      user_role: "author" | "creator" | "fanvue";
      workflow_kind: "image" | "video_shot";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database["public"];

/** A full row as read from a table, for example Tables<"books">. */
export type Tables<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Row"];

/** The shape for adding a row, for example TablesInsert<"books">. */
export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"];

/** The shape for changing a row, for example TablesUpdate<"books">. */
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"];

/** One of the fixed lists, for example Enums<"job_status">. */
export type Enums<T extends keyof PublicSchema["Enums"]> =
  PublicSchema["Enums"][T];
