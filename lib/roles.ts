import { supabase } from './supabase';
import type { UserRole, UserProfile } from './auth';

/**
 * Check if the current user has a specific role
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  return profile?.role === role;
}

/**
 * Check if the current user has any of the specified roles
 */
export async function hasAnyRole(roles: UserRole[]): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  return profile?.role ? roles.includes(profile.role as UserRole) : false;
}

/**
 * Get the current user's role
 */
export async function getUserRole(): Promise<UserRole | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  return (profile?.role as UserRole) || null;
}

/**
 * Check if the current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole('admin');
}

/**
 * Check if the current user is a business owner
 */
export async function isBusinessOwner(): Promise<boolean> {
  return hasRole('business_owner');
}

/**
 * Check if the current user is a customer
 */
export async function isCustomer(): Promise<boolean> {
  return hasRole('customer');
}

/**
 * Check if the current user can access the dashboard
 * (Admin and Business Owners can access, Customers cannot)
 */
export async function canAccessDashboard(): Promise<boolean> {
  return hasAnyRole(['admin', 'business_owner']);
}

/**
 * Check if the current user can create workspaces
 * (Admin and Business Owners can create workspaces)
 */
export async function canCreateWorkspace(): Promise<boolean> {
  return hasAnyRole(['admin', 'business_owner']);
}

/**
 * Update a user's role (admin only)
 */
export async function updateUserRole(userId: string, role: UserRole): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({ role })
    .eq('id', userId);

  if (error) throw error;
}

/**
 * Get user profile with role information
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) return null;
  return data as UserProfile;
}



