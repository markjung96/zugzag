export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
  public: {
    Tables: {
      activity_logs: {
        Row: {
          activity_data: Json | null;
          activity_type: string;
          created_at: string | null;
          crew_id: string | null;
          id: string;
          user_id: string;
        };
        Insert: {
          activity_data?: Json | null;
          activity_type: string;
          created_at?: string | null;
          crew_id?: string | null;
          id?: string;
          user_id: string;
        };
        Update: {
          activity_data?: Json | null;
          activity_type?: string;
          created_at?: string | null;
          crew_id?: string | null;
          id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "activity_logs_crew_id_fkey";
            columns: ["crew_id"];
            isOneToOne: false;
            referencedRelation: "crews";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "activity_logs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      climbing_sessions: {
        Row: {
          attempts: number | null;
          created_at: string | null;
          crew_id: string | null;
          difficulty_level: string | null;
          duration_minutes: number | null;
          id: string;
          is_completed: boolean | null;
          location: string | null;
          notes: string | null;
          photos: Json | null;
          rating: number | null;
          route_id: string | null;
          session_date: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          attempts?: number | null;
          created_at?: string | null;
          crew_id?: string | null;
          difficulty_level?: string | null;
          duration_minutes?: number | null;
          id?: string;
          is_completed?: boolean | null;
          location?: string | null;
          notes?: string | null;
          photos?: Json | null;
          rating?: number | null;
          route_id?: string | null;
          session_date: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          attempts?: number | null;
          created_at?: string | null;
          crew_id?: string | null;
          difficulty_level?: string | null;
          duration_minutes?: number | null;
          id?: string;
          is_completed?: boolean | null;
          location?: string | null;
          notes?: string | null;
          photos?: Json | null;
          rating?: number | null;
          route_id?: string | null;
          session_date?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "climbing_sessions_crew_id_fkey";
            columns: ["crew_id"];
            isOneToOne: false;
            referencedRelation: "crews";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "climbing_sessions_route_id_fkey";
            columns: ["route_id"];
            isOneToOne: false;
            referencedRelation: "routes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "climbing_sessions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      crew_members: {
        Row: {
          crew_id: string;
          id: string;
          is_active: boolean | null;
          joined_at: string | null;
          role: string | null;
          user_id: string;
        };
        Insert: {
          crew_id: string;
          id?: string;
          is_active?: boolean | null;
          joined_at?: string | null;
          role?: string | null;
          user_id: string;
        };
        Update: {
          crew_id?: string;
          id?: string;
          is_active?: boolean | null;
          joined_at?: string | null;
          role?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "crew_members_crew_id_fkey";
            columns: ["crew_id"];
            isOneToOne: false;
            referencedRelation: "crews";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "crew_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      crews: {
        Row: {
          created_at: string | null;
          created_by: string | null;
          description: string | null;
          id: string;
          is_public: boolean | null;
          location: string | null;
          logo_url: string | null;
          max_members: number | null;
          name: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          is_public?: boolean | null;
          location?: string | null;
          logo_url?: string | null;
          max_members?: number | null;
          name: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          is_public?: boolean | null;
          location?: string | null;
          logo_url?: string | null;
          max_members?: number | null;
          name?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "crews_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      data_collection_logs: {
        Row: {
          collection_type: string;
          completed_at: string | null;
          error_message: string | null;
          id: string;
          metadata: Json | null;
          records_collected: number | null;
          records_inserted: number | null;
          records_updated: number | null;
          source: string;
          started_at: string;
          status: string;
        };
        Insert: {
          collection_type: string;
          completed_at?: string | null;
          error_message?: string | null;
          id?: string;
          metadata?: Json | null;
          records_collected?: number | null;
          records_inserted?: number | null;
          records_updated?: number | null;
          source: string;
          started_at?: string;
          status: string;
        };
        Update: {
          collection_type?: string;
          completed_at?: string | null;
          error_message?: string | null;
          id?: string;
          metadata?: Json | null;
          records_collected?: number | null;
          records_inserted?: number | null;
          records_updated?: number | null;
          source?: string;
          started_at?: string;
          status?: string;
        };
        Relationships: [];
      };
      event_attendances: {
        Row: {
          admin_note: string | null;
          checked_in_at: string | null;
          checked_out_at: string | null;
          created_at: string | null;
          event_id: string;
          id: string;
          phase_id: string | null;
          status: string;
          status_history: Json | null;
          updated_at: string | null;
          user_id: string;
          user_note: string | null;
          waitlist_position: number | null;
          waitlist_promoted_at: string | null;
        };
        Insert: {
          admin_note?: string | null;
          checked_in_at?: string | null;
          checked_out_at?: string | null;
          created_at?: string | null;
          event_id: string;
          id?: string;
          phase_id?: string | null;
          status?: string;
          status_history?: Json | null;
          updated_at?: string | null;
          user_id: string;
          user_note?: string | null;
          waitlist_position?: number | null;
          waitlist_promoted_at?: string | null;
        };
        Update: {
          admin_note?: string | null;
          checked_in_at?: string | null;
          checked_out_at?: string | null;
          created_at?: string | null;
          event_id?: string;
          id?: string;
          phase_id?: string | null;
          status?: string;
          status_history?: Json | null;
          updated_at?: string | null;
          user_id?: string;
          user_note?: string | null;
          waitlist_position?: number | null;
          waitlist_promoted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "event_attendances_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "event_stats";
            referencedColumns: ["event_id"];
          },
          {
            foreignKeyName: "event_attendances_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "event_attendances_phase_id_fkey";
            columns: ["phase_id"];
            isOneToOne: false;
            referencedRelation: "event_phases";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "event_attendances_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      event_phases: {
        Row: {
          capacity: number | null;
          created_at: string | null;
          end_time: string | null;
          event_id: string;
          gym_id: string | null;
          id: string;
          location_text: string | null;
          notes: string | null;
          phase_number: number;
          start_time: string;
          title: string;
          updated_at: string | null;
        };
        Insert: {
          capacity?: number | null;
          created_at?: string | null;
          end_time?: string | null;
          event_id: string;
          gym_id?: string | null;
          id?: string;
          location_text?: string | null;
          notes?: string | null;
          phase_number: number;
          start_time: string;
          title: string;
          updated_at?: string | null;
        };
        Update: {
          capacity?: number | null;
          created_at?: string | null;
          end_time?: string | null;
          event_id?: string;
          gym_id?: string | null;
          id?: string;
          location_text?: string | null;
          notes?: string | null;
          phase_number?: number;
          start_time?: string;
          title?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "event_phases_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "event_stats";
            referencedColumns: ["event_id"];
          },
          {
            foreignKeyName: "event_phases_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "event_phases_gym_id_fkey";
            columns: ["gym_id"];
            isOneToOne: false;
            referencedRelation: "gym_route_stats";
            referencedColumns: ["gym_id"];
          },
          {
            foreignKeyName: "event_phases_gym_id_fkey";
            columns: ["gym_id"];
            isOneToOne: false;
            referencedRelation: "gyms";
            referencedColumns: ["id"];
          },
        ];
      };
      events: {
        Row: {
          allow_waitlist: boolean | null;
          cancelled_at: string | null;
          cancelled_by: string | null;
          cancelled_reason: string | null;
          created_at: string | null;
          created_by: string | null;
          crew_id: string;
          description: string | null;
          event_date: string;
          id: string;
          is_cancelled: boolean | null;
          is_public: boolean | null;
          max_waitlist: number | null;
          metadata: Json | null;
          notes: string | null;
          notification_sent: boolean | null;
          reminder_hours: number[] | null;
          rsvp_deadline: string | null;
          tags: string[] | null;
          title: string;
          total_capacity: number | null;
          updated_at: string | null;
          visibility: string | null;
        };
        Insert: {
          allow_waitlist?: boolean | null;
          cancelled_at?: string | null;
          cancelled_by?: string | null;
          cancelled_reason?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          crew_id: string;
          description?: string | null;
          event_date: string;
          id?: string;
          is_cancelled?: boolean | null;
          is_public?: boolean | null;
          max_waitlist?: number | null;
          metadata?: Json | null;
          notes?: string | null;
          notification_sent?: boolean | null;
          reminder_hours?: number[] | null;
          rsvp_deadline?: string | null;
          tags?: string[] | null;
          title: string;
          total_capacity?: number | null;
          updated_at?: string | null;
          visibility?: string | null;
        };
        Update: {
          allow_waitlist?: boolean | null;
          cancelled_at?: string | null;
          cancelled_by?: string | null;
          cancelled_reason?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          crew_id?: string;
          description?: string | null;
          event_date?: string;
          id?: string;
          is_cancelled?: boolean | null;
          is_public?: boolean | null;
          max_waitlist?: number | null;
          metadata?: Json | null;
          notes?: string | null;
          notification_sent?: boolean | null;
          reminder_hours?: number[] | null;
          rsvp_deadline?: string | null;
          tags?: string[] | null;
          title?: string;
          total_capacity?: number | null;
          updated_at?: string | null;
          visibility?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "events_cancelled_by_fkey";
            columns: ["cancelled_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "events_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "events_crew_id_fkey";
            columns: ["crew_id"];
            isOneToOne: false;
            referencedRelation: "crews";
            referencedColumns: ["id"];
          },
        ];
      };
      gym_aliases: {
        Row: {
          alias: string;
          created_at: string;
          gym_id: string;
          id: string;
        };
        Insert: {
          alias: string;
          created_at?: string;
          gym_id: string;
          id?: string;
        };
        Update: {
          alias?: string;
          created_at?: string;
          gym_id?: string;
          id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "gym_aliases_gym_id_fkey";
            columns: ["gym_id"];
            isOneToOne: false;
            referencedRelation: "gym_route_stats";
            referencedColumns: ["gym_id"];
          },
          {
            foreignKeyName: "gym_aliases_gym_id_fkey";
            columns: ["gym_id"];
            isOneToOne: false;
            referencedRelation: "gyms";
            referencedColumns: ["id"];
          },
        ];
      };
      gym_color_mappings: {
        Row: {
          color: string;
          created_at: string;
          created_by: string | null;
          difficulty_label: string | null;
          difficulty_normalized: number;
          gym_id: string;
          id: string;
          notes: string | null;
          updated_at: string;
        };
        Insert: {
          color: string;
          created_at?: string;
          created_by?: string | null;
          difficulty_label?: string | null;
          difficulty_normalized: number;
          gym_id: string;
          id?: string;
          notes?: string | null;
          updated_at?: string;
        };
        Update: {
          color?: string;
          created_at?: string;
          created_by?: string | null;
          difficulty_label?: string | null;
          difficulty_normalized?: number;
          gym_id?: string;
          id?: string;
          notes?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "gym_color_mappings_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "gym_color_mappings_gym_id_fkey";
            columns: ["gym_id"];
            isOneToOne: false;
            referencedRelation: "gym_route_stats";
            referencedColumns: ["gym_id"];
          },
          {
            foreignKeyName: "gym_color_mappings_gym_id_fkey";
            columns: ["gym_id"];
            isOneToOne: false;
            referencedRelation: "gyms";
            referencedColumns: ["id"];
          },
        ];
      };
      gyms: {
        Row: {
          address: string | null;
          created_at: string;
          data_sources: Json | null;
          difficulty_range: string | null;
          facilities: Json | null;
          id: string;
          images: Json | null;
          instagram_handle: string | null;
          is_active: boolean;
          last_route_update: string | null;
          latitude: number | null;
          longitude: number | null;
          metadata: Json | null;
          name: string;
          opening_hours: Json | null;
          phone: string | null;
          popularity_score: number;
          price_info: Json | null;
          provider: string | null;
          provider_place_id: string | null;
          rating: number | null;
          review_count: number | null;
          setter_names: string[] | null;
          total_routes: number | null;
          updated_at: string;
          wall_types: Json | null;
          website: string | null;
          website_verified: boolean | null;
        };
        Insert: {
          address?: string | null;
          created_at?: string;
          data_sources?: Json | null;
          difficulty_range?: string | null;
          facilities?: Json | null;
          id?: string;
          images?: Json | null;
          instagram_handle?: string | null;
          is_active?: boolean;
          last_route_update?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          metadata?: Json | null;
          name: string;
          opening_hours?: Json | null;
          phone?: string | null;
          popularity_score?: number;
          price_info?: Json | null;
          provider?: string | null;
          provider_place_id?: string | null;
          rating?: number | null;
          review_count?: number | null;
          setter_names?: string[] | null;
          total_routes?: number | null;
          updated_at?: string;
          wall_types?: Json | null;
          website?: string | null;
          website_verified?: boolean | null;
        };
        Update: {
          address?: string | null;
          created_at?: string;
          data_sources?: Json | null;
          difficulty_range?: string | null;
          facilities?: Json | null;
          id?: string;
          images?: Json | null;
          instagram_handle?: string | null;
          is_active?: boolean;
          last_route_update?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          metadata?: Json | null;
          name?: string;
          opening_hours?: Json | null;
          phone?: string | null;
          popularity_score?: number;
          price_info?: Json | null;
          provider?: string | null;
          provider_place_id?: string | null;
          rating?: number | null;
          review_count?: number | null;
          setter_names?: string[] | null;
          total_routes?: number | null;
          updated_at?: string;
          wall_types?: Json | null;
          website?: string | null;
          website_verified?: boolean | null;
        };
        Relationships: [];
      };
      pending_routes: {
        Row: {
          caption: string | null;
          created_at: string;
          final_color: string | null;
          final_difficulty: string | null;
          final_difficulty_normalized: number | null;
          final_notes: string | null;
          final_route_type: string | null;
          final_set_date: string | null;
          final_setter_name: string | null;
          final_wall_section: string | null;
          gym_id: string;
          id: string;
          image_url: string | null;
          instagram_post_id: string;
          instagram_url: string | null;
          parsed_color: string | null;
          parsed_difficulty: string | null;
          parsed_difficulty_normalized: number | null;
          parsed_route_type: string | null;
          parsed_set_date: string | null;
          parsed_setter_name: string | null;
          parsed_tags: string[] | null;
          parsed_wall_section: string | null;
          parsing_confidence: number | null;
          posted_at: string | null;
          rejection_reason: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          status: string;
          updated_at: string;
        };
        Insert: {
          caption?: string | null;
          created_at?: string;
          final_color?: string | null;
          final_difficulty?: string | null;
          final_difficulty_normalized?: number | null;
          final_notes?: string | null;
          final_route_type?: string | null;
          final_set_date?: string | null;
          final_setter_name?: string | null;
          final_wall_section?: string | null;
          gym_id: string;
          id?: string;
          image_url?: string | null;
          instagram_post_id: string;
          instagram_url?: string | null;
          parsed_color?: string | null;
          parsed_difficulty?: string | null;
          parsed_difficulty_normalized?: number | null;
          parsed_route_type?: string | null;
          parsed_set_date?: string | null;
          parsed_setter_name?: string | null;
          parsed_tags?: string[] | null;
          parsed_wall_section?: string | null;
          parsing_confidence?: number | null;
          posted_at?: string | null;
          rejection_reason?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: string;
          updated_at?: string;
        };
        Update: {
          caption?: string | null;
          created_at?: string;
          final_color?: string | null;
          final_difficulty?: string | null;
          final_difficulty_normalized?: number | null;
          final_notes?: string | null;
          final_route_type?: string | null;
          final_set_date?: string | null;
          final_setter_name?: string | null;
          final_wall_section?: string | null;
          gym_id?: string;
          id?: string;
          image_url?: string | null;
          instagram_post_id?: string;
          instagram_url?: string | null;
          parsed_color?: string | null;
          parsed_difficulty?: string | null;
          parsed_difficulty_normalized?: number | null;
          parsed_route_type?: string | null;
          parsed_set_date?: string | null;
          parsed_setter_name?: string | null;
          parsed_tags?: string[] | null;
          parsed_wall_section?: string | null;
          parsing_confidence?: number | null;
          posted_at?: string | null;
          rejection_reason?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pending_routes_gym_id_fkey";
            columns: ["gym_id"];
            isOneToOne: false;
            referencedRelation: "gym_route_stats";
            referencedColumns: ["gym_id"];
          },
          {
            foreignKeyName: "pending_routes_gym_id_fkey";
            columns: ["gym_id"];
            isOneToOne: false;
            referencedRelation: "gyms";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pending_routes_reviewed_by_fkey";
            columns: ["reviewed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          climbing_level: string | null;
          created_at: string | null;
          email: string;
          full_name: string | null;
          id: string;
          is_active: boolean | null;
          joined_at: string | null;
          last_seen_at: string | null;
          metadata: Json | null;
          nickname: string | null;
          phone: string | null;
          role: string | null;
          updated_at: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          climbing_level?: string | null;
          created_at?: string | null;
          email: string;
          full_name?: string | null;
          id: string;
          is_active?: boolean | null;
          joined_at?: string | null;
          last_seen_at?: string | null;
          metadata?: Json | null;
          nickname?: string | null;
          phone?: string | null;
          role?: string | null;
          updated_at?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          climbing_level?: string | null;
          created_at?: string | null;
          email?: string;
          full_name?: string | null;
          id?: string;
          is_active?: boolean | null;
          joined_at?: string | null;
          last_seen_at?: string | null;
          metadata?: Json | null;
          nickname?: string | null;
          phone?: string | null;
          role?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      routes: {
        Row: {
          attempt_count: number | null;
          average_rating: number | null;
          color: string | null;
          completion_count: number | null;
          created_at: string;
          difficulty: string;
          difficulty_normalized: number | null;
          estimated_removal_date: string | null;
          gym_id: string;
          holds_brand: string | null;
          id: string;
          image_url: string | null;
          is_active: boolean;
          name: string | null;
          notes: string | null;
          route_type: string;
          set_date: string | null;
          setter_name: string | null;
          source: string;
          source_id: string | null;
          source_url: string | null;
          tags: string[] | null;
          updated_at: string;
          video_url: string | null;
          wall_section: string | null;
        };
        Insert: {
          attempt_count?: number | null;
          average_rating?: number | null;
          color?: string | null;
          completion_count?: number | null;
          created_at?: string;
          difficulty: string;
          difficulty_normalized?: number | null;
          estimated_removal_date?: string | null;
          gym_id: string;
          holds_brand?: string | null;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          name?: string | null;
          notes?: string | null;
          route_type: string;
          set_date?: string | null;
          setter_name?: string | null;
          source: string;
          source_id?: string | null;
          source_url?: string | null;
          tags?: string[] | null;
          updated_at?: string;
          video_url?: string | null;
          wall_section?: string | null;
        };
        Update: {
          attempt_count?: number | null;
          average_rating?: number | null;
          color?: string | null;
          completion_count?: number | null;
          created_at?: string;
          difficulty?: string;
          difficulty_normalized?: number | null;
          estimated_removal_date?: string | null;
          gym_id?: string;
          holds_brand?: string | null;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          name?: string | null;
          notes?: string | null;
          route_type?: string;
          set_date?: string | null;
          setter_name?: string | null;
          source?: string;
          source_id?: string | null;
          source_url?: string | null;
          tags?: string[] | null;
          updated_at?: string;
          video_url?: string | null;
          wall_section?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "routes_gym_id_fkey";
            columns: ["gym_id"];
            isOneToOne: false;
            referencedRelation: "gym_route_stats";
            referencedColumns: ["gym_id"];
          },
          {
            foreignKeyName: "routes_gym_id_fkey";
            columns: ["gym_id"];
            isOneToOne: false;
            referencedRelation: "gyms";
            referencedColumns: ["id"];
          },
        ];
      };
      setters: {
        Row: {
          avatar_url: string | null;
          average_rating: number | null;
          bio: string | null;
          created_at: string;
          gym_id: string | null;
          id: string;
          instagram_handle: string | null;
          is_verified: boolean | null;
          name: string;
          specialty: string[] | null;
          total_routes_set: number | null;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          average_rating?: number | null;
          bio?: string | null;
          created_at?: string;
          gym_id?: string | null;
          id?: string;
          instagram_handle?: string | null;
          is_verified?: boolean | null;
          name: string;
          specialty?: string[] | null;
          total_routes_set?: number | null;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          average_rating?: number | null;
          bio?: string | null;
          created_at?: string;
          gym_id?: string | null;
          id?: string;
          instagram_handle?: string | null;
          is_verified?: boolean | null;
          name?: string;
          specialty?: string[] | null;
          total_routes_set?: number | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "setters_gym_id_fkey";
            columns: ["gym_id"];
            isOneToOne: false;
            referencedRelation: "gym_route_stats";
            referencedColumns: ["gym_id"];
          },
          {
            foreignKeyName: "setters_gym_id_fkey";
            columns: ["gym_id"];
            isOneToOne: false;
            referencedRelation: "gyms";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      event_stats: {
        Row: {
          attending_count: number | null;
          available_slots: number | null;
          checked_in_count: number | null;
          event_date: string | null;
          event_id: string | null;
          maybe_count: number | null;
          no_show_count: number | null;
          not_attending_count: number | null;
          title: string | null;
          total_capacity: number | null;
          waitlist_count: number | null;
        };
        Relationships: [];
      };
      gym_route_stats: {
        Row: {
          active_routes: number | null;
          avg_route_rating: number | null;
          gym_id: string | null;
          gym_name: string | null;
          last_route_update: string | null;
          max_difficulty: number | null;
          min_difficulty: number | null;
          setters: string[] | null;
          total_routes: number | null;
        };
        Relationships: [];
      };
      pending_routes_stats: {
        Row: {
          approved_count: number | null;
          avg_confidence: number | null;
          gym_id: string | null;
          gym_name: string | null;
          latest_pending_at: string | null;
          needs_review_count: number | null;
          pending_count: number | null;
          rejected_count: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "pending_routes_gym_id_fkey";
            columns: ["gym_id"];
            isOneToOne: false;
            referencedRelation: "gym_route_stats";
            referencedColumns: ["gym_id"];
          },
          {
            foreignKeyName: "pending_routes_gym_id_fkey";
            columns: ["gym_id"];
            isOneToOne: false;
            referencedRelation: "gyms";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: {
      apply_color_mapping: {
        Args: { p_color: string; p_gym_id: string };
        Returns: number;
      };
      approve_pending_route: {
        Args: { pending_route_id: string };
        Returns: string;
      };
      cube: {
        Args: { "": number[] } | { "": number };
        Returns: unknown;
      };
      cube_dim: {
        Args: { "": unknown };
        Returns: number;
      };
      cube_in: {
        Args: { "": unknown };
        Returns: unknown;
      };
      cube_is_point: {
        Args: { "": unknown };
        Returns: boolean;
      };
      cube_out: {
        Args: { "": unknown };
        Returns: unknown;
      };
      cube_recv: {
        Args: { "": unknown };
        Returns: unknown;
      };
      cube_send: {
        Args: { "": unknown };
        Returns: string;
      };
      cube_size: {
        Args: { "": unknown };
        Returns: number;
      };
      earth: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      gc_to_sec: {
        Args: { "": number };
        Returns: number;
      };
      gtrgm_compress: {
        Args: { "": unknown };
        Returns: unknown;
      };
      gtrgm_decompress: {
        Args: { "": unknown };
        Returns: unknown;
      };
      gtrgm_in: {
        Args: { "": unknown };
        Returns: unknown;
      };
      gtrgm_options: {
        Args: { "": unknown };
        Returns: undefined;
      };
      gtrgm_out: {
        Args: { "": unknown };
        Returns: unknown;
      };
      latitude: {
        Args: { "": unknown };
        Returns: number;
      };
      longitude: {
        Args: { "": unknown };
        Returns: number;
      };
      normalize_difficulty: {
        Args: { grade: string };
        Returns: number;
      };
      promote_from_waitlist: {
        Args: { p_event_id: string };
        Returns: undefined;
      };
      register_event_attendance: {
        Args: {
          p_event_id: string;
          p_phase_id?: string;
          p_user_id: string;
          p_user_note?: string;
        };
        Returns: Json;
      };
      reject_pending_route: {
        Args: { pending_route_id: string; reason?: string };
        Returns: undefined;
      };
      search_gyms: {
        Args: {
          max_distance_km?: number;
          q: string;
          top_n?: number;
          user_lat?: number;
          user_lon?: number;
        };
        Returns: {
          address: string;
          distance_m: number;
          id: string;
          latitude: number;
          longitude: number;
          name: string;
          phone: string;
          provider: string;
          provider_place_id: string;
          score: number;
          website: string;
        }[];
      };
      sec_to_gc: {
        Args: { "": number };
        Returns: number;
      };
      set_limit: {
        Args: { "": number };
        Returns: number;
      };
      show_limit: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      show_trgm: {
        Args: { "": string };
        Returns: string[];
      };
      update_gym_popularity: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
