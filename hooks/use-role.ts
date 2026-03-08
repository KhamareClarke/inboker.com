'use client';

import { useAuth } from '@/lib/providers/auth-provider';
import type { UserRole } from '@/lib/auth';

/**
 * Hook to check user roles and permissions
 * 
 * @example
 * const { role, isAdmin, isBusinessOwner, isCustomer, canAccessDashboard } = useRole();
 */
export function useRole() {
  const { profile, role } = useAuth();

  const isAdmin = role === 'admin';
  const isBusinessOwner = role === 'business_owner';
  const isCustomer = role === 'customer';
  const canAccessDashboard = isAdmin || isBusinessOwner;
  const canCreateWorkspace = isAdmin || isBusinessOwner;

  return {
    role,
    profile,
    isAdmin,
    isBusinessOwner,
    isCustomer,
    canAccessDashboard,
    canCreateWorkspace,
    hasRole: (checkRole: UserRole) => role === checkRole,
    hasAnyRole: (roles: UserRole[]) => role ? roles.includes(role) : false,
  };
}



