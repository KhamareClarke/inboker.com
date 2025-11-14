import { Database } from './supabase';

export type Workspace = Database['public']['Tables']['workspaces']['Row'];
export type User = Database['public']['Tables']['users']['Row'];
export type WorkspaceMember = Database['public']['Tables']['workspace_members']['Row'];
export type TeamShift = Database['public']['Tables']['team_shifts']['Row'];
export type TimeOff = Database['public']['Tables']['time_off']['Row'];
export type Client = Database['public']['Tables']['clients']['Row'];
export type Booking = Database['public']['Tables']['bookings']['Row'];
export type ClientActivity = Database['public']['Tables']['client_activities']['Row'];
export type AvailabilityOverride = Database['public']['Tables']['availability_overrides']['Row'];

export type WorkspaceMemberWithUser = WorkspaceMember & {
  user: User;
};

export type BookingWithDetails = Booking & {
  client: Client;
  provider: WorkspaceMemberWithUser;
};

export type ClientWithActivities = Client & {
  activities: ClientActivity[];
};

export const PIPELINE_STAGES = [
  { id: 'new', label: 'New Lead', color: '#3b82f6' },
  { id: 'contacted', label: 'Contacted', color: '#8b5cf6' },
  { id: 'qualified', label: 'Qualified', color: '#ec4899' },
  { id: 'proposal', label: 'Proposal Sent', color: '#f59e0b' },
  { id: 'negotiation', label: 'Negotiation', color: '#10b981' },
  { id: 'won', label: 'Won', color: '#22c55e' },
  { id: 'lost', label: 'Lost', color: '#ef4444' },
] as const;

export const DAYS_OF_WEEK = [
  { id: 0, label: 'Sunday', short: 'Sun' },
  { id: 1, label: 'Monday', short: 'Mon' },
  { id: 2, label: 'Tuesday', short: 'Tue' },
  { id: 3, label: 'Wednesday', short: 'Wed' },
  { id: 4, label: 'Thursday', short: 'Thu' },
  { id: 5, label: 'Friday', short: 'Fri' },
  { id: 6, label: 'Saturday', short: 'Sat' },
] as const;
