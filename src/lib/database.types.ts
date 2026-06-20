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
      hr_users: {
        Row: {
          id: string;
          auth_user_id: string;
          name: string | null;
          email: string;
          created_at: string;
        };
        Relationships: [];
        Insert: {
          id?: string;
          auth_user_id: string;
          name?: string | null;
          email: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          auth_user_id?: string;
          name?: string | null;
          email?: string;
          created_at?: string;
        };
      };
      jobs: {
        Row: {
          id: string;
          title: string;
          description: string;
          required_skills: string[];
          status: Database["public"]["Enums"]["job_status"];
          created_at: string;
          updated_at: string;
        };
        Relationships: [];
        Insert: {
          id?: string;
          title: string;
          description: string;
          required_skills?: string[];
          status?: Database["public"]["Enums"]["job_status"];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          required_skills?: string[];
          status?: Database["public"]["Enums"]["job_status"];
          created_at?: string;
          updated_at?: string;
        };
      };
      candidates: {
        Row: {
          id: string;
          job_id: string;
          name: string;
          email: string;
          phone: string | null;
          current_location: string | null;
          current_position: string | null;
          notice_period: string | null;
          salary_expectation: string | null;
          linkedin_url: string | null;
          status: Database["public"]["Enums"]["candidate_status"];
          resume_file_path: string | null;
          resume_file_name: string | null;
          rejection_reason: string | null;
          last_activity_at: string;
          created_at: string;
          updated_at: string;
        };
        Relationships: [
          {
            foreignKeyName: "candidates_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
        ];
        Insert: {
          id?: string;
          job_id: string;
          name: string;
          email: string;
          phone?: string | null;
          current_location?: string | null;
          current_position?: string | null;
          notice_period?: string | null;
          salary_expectation?: string | null;
          linkedin_url?: string | null;
          status?: Database["public"]["Enums"]["candidate_status"];
          resume_file_path?: string | null;
          resume_file_name?: string | null;
          rejection_reason?: string | null;
          last_activity_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["candidates"]["Insert"]>;
      };
      application_tokens: {
        Row: {
          id: string;
          candidate_id: string;
          token_hash: string;
          expires_at: string;
          used_at: string | null;
          created_at: string;
        };
        Relationships: [
          {
            foreignKeyName: "application_tokens_candidate_id_fkey";
            columns: ["candidate_id"];
            isOneToOne: false;
            referencedRelation: "candidates";
            referencedColumns: ["id"];
          },
        ];
        Insert: {
          id?: string;
          candidate_id: string;
          token_hash: string;
          expires_at: string;
          used_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["application_tokens"]["Insert"]>;
      };
      interviews: {
        Row: {
          id: string;
          candidate_id: string;
          scheduled_at: string;
          type: Database["public"]["Enums"]["interview_type"];
          interviewer_name: string;
          notes: string | null;
          status: Database["public"]["Enums"]["interview_status"];
          recommendation: Database["public"]["Enums"]["interview_recommendation"] | null;
          feedback_note: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Relationships: [
          {
            foreignKeyName: "interviews_candidate_id_fkey";
            columns: ["candidate_id"];
            isOneToOne: false;
            referencedRelation: "candidates";
            referencedColumns: ["id"];
          },
        ];
        Insert: {
          id?: string;
          candidate_id: string;
          scheduled_at: string;
          type: Database["public"]["Enums"]["interview_type"];
          interviewer_name: string;
          notes?: string | null;
          status?: Database["public"]["Enums"]["interview_status"];
          recommendation?: Database["public"]["Enums"]["interview_recommendation"] | null;
          feedback_note?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["interviews"]["Insert"]>;
      };
      documents: {
        Row: {
          id: string;
          candidate_id: string;
          type: Database["public"]["Enums"]["document_type"];
          file_path: string;
          file_name: string;
          metadata: Json;
          created_at: string;
        };
        Relationships: [
          {
            foreignKeyName: "documents_candidate_id_fkey";
            columns: ["candidate_id"];
            isOneToOne: false;
            referencedRelation: "candidates";
            referencedColumns: ["id"];
          },
        ];
        Insert: {
          id?: string;
          candidate_id: string;
          type: Database["public"]["Enums"]["document_type"];
          file_path: string;
          file_name: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["documents"]["Insert"]>;
      };
      timeline_events: {
        Row: {
          id: string;
          candidate_id: string;
          type: string;
          title: string;
          description: string | null;
          metadata: Json;
          created_at: string;
        };
        Relationships: [
          {
            foreignKeyName: "timeline_events_candidate_id_fkey";
            columns: ["candidate_id"];
            isOneToOne: false;
            referencedRelation: "candidates";
            referencedColumns: ["id"];
          },
        ];
        Insert: {
          id?: string;
          candidate_id: string;
          type: string;
          title: string;
          description?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["timeline_events"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      job_status: "Open" | "Closed";
      candidate_status:
        | "Applied"
        | "Form Submitted"
        | "Interview Scheduled"
        | "Offer Sent"
        | "Hired"
        | "Rejected";
      interview_type: "Screening" | "Technical";
      interview_status: "Scheduled" | "Completed";
      interview_recommendation: "Hire" | "No Hire" | "Maybe";
      document_type: "Offer Letter" | "NDA";
    };
    CompositeTypes: Record<string, never>;
  };
};
