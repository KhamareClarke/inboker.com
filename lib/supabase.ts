import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Only create client if env vars are available (skip during build if not set)
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null as any; // Type assertion for build-time compatibility

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
          role: 'admin' | 'business_owner' | 'customer';
          suspended: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
          role?: 'admin' | 'business_owner' | 'customer';
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
      business_profiles: {
        Row: {
          id: string;
          user_id: string;
          business_name: string;
          business_slug: string | null;
          logo_url: string | null;
          description: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          website: string | null;
          primary_color: string;
          secondary_color: string;
          booking_page_title: string | null;
          booking_page_subtitle: string | null;
          social_links: Record<string, any>;
          custom_settings: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['business_profiles']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['business_profiles']['Insert']>;
      };
      business_profile_services: {
        Row: {
          id: string;
          business_profile_id: string;
          name: string;
          description: string | null;
          duration_minutes: number;
          price: number;
          is_active: boolean;
          color: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['business_profile_services']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['business_profile_services']['Insert']>;
      };
      business_profile_staff: {
        Row: {
          id: string;
          business_profile_id: string;
          full_name: string;
          email: string | null;
          phone: string | null;
          role: string;
          avatar_url: string | null;
          bio: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['business_profile_staff']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['business_profile_staff']['Insert']>;
      };
      business_profile_staff_services: {
        Row: {
          id: string;
          staff_id: string;
          service_id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['business_profile_staff_services']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['business_profile_staff_services']['Insert']>;
      };
      business_profile_bookings: {
        Row: {
          id: string;
          business_profile_id: string;
          service_id: string;
          staff_id: string | null;
          client_name: string;
          client_email: string;
          client_phone: string | null;
          client_notes: string | null;
          start_time: string;
          end_time: string;
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          amount: number | null;
          payment_status: 'unpaid' | 'paid' | 'refunded';
          source: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['business_profile_bookings']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['business_profile_bookings']['Insert']>;
      };
    };
  };
};
