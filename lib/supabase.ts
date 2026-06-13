import { createClient } from '@supabase/supabase-js';
import { normalizeSupabaseUrl } from './supabase-env';

/** JSON column helper for Supabase-generated-style types */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

const supabaseUrl = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

// Only create client if env vars are available (skip during build if not set)
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : (null as any); // build without env; callers must guard null at runtime

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
      appointment_reviews: {
        Row: {
          id: string;
          booking_id: string;
          business_profile_id: string;
          customer_email: string;
          rating: number;
          review_text: string | null;
          feedback: string | null;
          is_public: boolean | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          business_profile_id: string;
          customer_email: string;
          rating: number;
          review_text?: string | null;
          feedback?: string | null;
          is_public?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['appointment_reviews']['Insert']>;
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
          latitude: number | null;
          longitude: number | null;
          accepts_new_customers: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['business_profiles']['Row'],
          'id' | 'created_at' | 'updated_at' | 'latitude' | 'longitude' | 'accepts_new_customers'
        > & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          latitude?: number | null;
          longitude?: number | null;
          accepts_new_customers?: boolean;
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
          service_category: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['business_profile_services']['Row'],
          'id' | 'created_at' | 'updated_at' | 'service_category'
        > & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          service_category?: string | null;
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
      business_profile_staff_availability: {
        Row: {
          id: string;
          staff_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['business_profile_staff_availability']['Row'],
          'id' | 'created_at' | 'updated_at'
        > & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['business_profile_staff_availability']['Insert']>;
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
      notification_logs: {
        Row: {
          id: string;
          type: string;
          user_id: string | null;
          email: string | null;
          phone: string | null;
          channels: string[];
          status: string;
          error_message: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          type: string;
          user_id?: string | null;
          email?: string | null;
          phone?: string | null;
          channels?: string[];
          status?: string;
          error_message?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['notification_logs']['Insert']>;
      };
      notification_preferences: {
        Row: {
          id: string;
          user_id: string;
          email_enabled: boolean;
          sms_enabled: boolean;
          push_enabled: boolean;
          frequency: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email_enabled?: boolean;
          sms_enabled?: boolean;
          push_enabled?: boolean;
          frequency?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['notification_preferences']['Insert']>;
      };
      user_inbox_notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          body: string;
          metadata: Json;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          body: string;
          metadata?: Json;
          read_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['user_inbox_notifications']['Insert']>;
      };
      empire_os_events: {
        Row: {
          id: string;
          business_id: string | null;
          event_type: string;
          payload: Json;
          skill_ids: number[];
          outbound_ok: boolean;
          outbound_status: number | null;
          outbound_error: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id?: string | null;
          event_type: string;
          payload?: Json;
          skill_ids?: number[];
          outbound_ok?: boolean;
          outbound_status?: number | null;
          outbound_error?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['empire_os_events']['Insert']>;
      };
      empire_os_recommendations: {
        Row: {
          id: string;
          business_id: string;
          skill_id: number;
          title: string;
          description: string;
          action: string | null;
          estimated_impact: string;
          status: string;
          metadata: Json;
          created_at: string;
          implemented_at: string | null;
          dismissed_at: string | null;
          impact_measurement: Json | null;
        };
        Insert: {
          id?: string;
          business_id: string;
          skill_id: number;
          title: string;
          description: string;
          action?: string | null;
          estimated_impact?: string;
          status?: string;
          metadata?: Json;
          created_at?: string;
          implemented_at?: string | null;
          dismissed_at?: string | null;
          impact_measurement?: Json | null;
        };
        Update: Partial<Database['public']['Tables']['empire_os_recommendations']['Insert']>;
      };
      customer_booking_preferences: {
        Row: {
          id: string;
          user_id: string;
          business_profile_id: string;
          preferences: Json;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          business_profile_id: string;
          preferences?: Json;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['customer_booking_preferences']['Insert']>;
      };
      gift_vouchers: {
        Row: {
          id: string;
          business_profile_id: string;
          code: string;
          initial_value_pence: number;
          balance_pence: number;
          status: string;
          expires_at: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_profile_id: string;
          code: string;
          initial_value_pence: number;
          balance_pence: number;
          status?: string;
          expires_at?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['gift_vouchers']['Insert']>;
      };
      promo_codes: {
        Row: {
          id: string;
          business_profile_id: string;
          code: string;
          discount_type: string;
          discount_value: number;
          max_redemptions: number | null;
          redemptions_count: number;
          expires_at: string | null;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_profile_id: string;
          code: string;
          discount_type: string;
          discount_value: number;
          max_redemptions?: number | null;
          redemptions_count?: number;
          expires_at?: string | null;
          active?: boolean;
          created_at?: string;
        };
        Update: Partial<{
          id?: string;
          business_profile_id?: string;
          code?: string;
          discount_type?: string;
          discount_value?: number;
          max_redemptions?: number | null;
          redemptions_count?: number;
          expires_at?: string | null;
          active?: boolean;
          created_at?: string;
        }>;
      };
      booking_waitlist: {
        Row: {
          id: string;
          user_id: string | null;
          business_profile_id: string;
          service_id: string;
          staff_id: string | null;
          client_email: string;
          client_name: string | null;
          requested_start: string;
          requested_end: string;
          status: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          business_profile_id: string;
          service_id: string;
          staff_id?: string | null;
          client_email: string;
          client_name?: string | null;
          requested_start: string;
          requested_end: string;
          status?: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: Partial<{
          id?: string;
          user_id?: string | null;
          business_profile_id?: string;
          service_id?: string;
          staff_id?: string | null;
          client_email?: string;
          client_name?: string | null;
          requested_start?: string;
          requested_end?: string;
          status?: string;
          notes?: string | null;
          created_at?: string;
        }>;
      };
      customer_credits: {
        Row: {
          id: string;
          user_id: string;
          business_profile_id: string;
          balance_pence: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          business_profile_id: string;
          balance_pence?: number;
          updated_at?: string;
        };
        Update: Partial<{
          id?: string;
          user_id?: string;
          business_profile_id?: string;
          balance_pence?: number;
          updated_at?: string;
        }>;
      };
      audit_logs: {
        Row: {
          id: string;
          created_at: string;
          actor_user_id: string | null;
          actor_ip: string | null;
          user_agent: string | null;
          action: string;
          resource_type: string | null;
          resource_id: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          created_at?: string;
          actor_user_id?: string | null;
          actor_ip?: string | null;
          user_agent?: string | null;
          action: string;
          resource_type?: string | null;
          resource_id?: string | null;
          metadata?: Json;
        };
        Update: Partial<{
          id?: string;
          created_at?: string;
          actor_user_id?: string | null;
          actor_ip?: string | null;
          user_agent?: string | null;
          action?: string;
          resource_type?: string | null;
          resource_id?: string | null;
          metadata?: Json;
        }>;
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
          reminder_24h_sent_at: string | null;
          reminder_1h_sent_at: string | null;
          review_request_sent_at: string | null;
          party_size: number;
          recurring_frequency: string | null;
          recurring_until: string | null;
          applied_voucher_id: string | null;
          applied_promo_id: string | null;
          credit_applied_pence: number;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_profile_id: string;
          service_id: string;
          staff_id?: string | null;
          client_name: string;
          client_email: string;
          client_phone?: string | null;
          client_notes?: string | null;
          start_time: string;
          end_time: string;
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          amount?: number | null;
          payment_status?: 'unpaid' | 'paid' | 'refunded';
          source?: string | null;
          reminder_24h_sent_at?: string | null;
          reminder_1h_sent_at?: string | null;
          review_request_sent_at?: string | null;
          party_size?: number;
          recurring_frequency?: string | null;
          recurring_until?: string | null;
          applied_voucher_id?: string | null;
          applied_promo_id?: string | null;
          credit_applied_pence?: number;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<{
          id?: string;
          business_profile_id?: string;
          service_id?: string;
          staff_id?: string | null;
          client_name?: string;
          client_email?: string;
          client_phone?: string | null;
          client_notes?: string | null;
          start_time?: string;
          end_time?: string;
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          amount?: number | null;
          payment_status?: 'unpaid' | 'paid' | 'refunded';
          source?: string | null;
          reminder_24h_sent_at?: string | null;
          reminder_1h_sent_at?: string | null;
          review_request_sent_at?: string | null;
          party_size?: number;
          recurring_frequency?: string | null;
          recurring_until?: string | null;
          applied_voucher_id?: string | null;
          applied_promo_id?: string | null;
          credit_applied_pence?: number;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        }>;
      },
    },
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
