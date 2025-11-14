import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      workspaces: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          primary_color: string;
          domain: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['workspaces']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['workspaces']['Insert']>;
      };
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          avatar_url: string | null;
          timezone: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      workspace_members: {
        Row: {
          id: string;
          workspace_id: string;
          user_id: string;
          role: 'owner' | 'admin' | 'member';
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['workspace_members']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['workspace_members']['Insert']>;
      };
      team_shifts: {
        Row: {
          id: string;
          workspace_id: string;
          member_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['team_shifts']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['team_shifts']['Insert']>;
      };
      time_off: {
        Row: {
          id: string;
          workspace_id: string;
          member_id: string;
          start_date: string;
          end_date: string;
          reason: string | null;
          all_day: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['time_off']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['time_off']['Insert']>;
      };
      clients: {
        Row: {
          id: string;
          workspace_id: string;
          email: string | null;
          full_name: string;
          phone: string | null;
          avatar_url: string | null;
          timezone: string;
          tags: string[];
          notes: string | null;
          lead_score: number;
          pipeline_stage: string;
          last_activity_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['clients']['Row'], 'id' | 'created_at' | 'updated_at' | 'last_activity_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          last_activity_at?: string;
        };
        Update: Partial<Database['public']['Tables']['clients']['Insert']>;
      };
      bookings: {
        Row: {
          id: string;
          workspace_id: string;
          client_id: string;
          provider_id: string;
          title: string;
          description: string | null;
          start_time: string;
          end_time: string;
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          source: string | null;
          payment_status: 'unpaid' | 'paid' | 'refunded';
          amount: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['bookings']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['bookings']['Insert']>;
      };
      client_activities: {
        Row: {
          id: string;
          workspace_id: string;
          client_id: string;
          activity_type: 'booking' | 'note' | 'email' | 'call' | 'status_change';
          title: string;
          description: string | null;
          metadata: Record<string, any>;
          created_by: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['client_activities']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['client_activities']['Insert']>;
      };
      availability_overrides: {
        Row: {
          id: string;
          workspace_id: string;
          member_id: string;
          date: string;
          start_time: string | null;
          end_time: string | null;
          is_available: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['availability_overrides']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['availability_overrides']['Insert']>;
      };
    };
  };
};
