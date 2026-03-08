'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/providers/auth-provider';

export default function DashboardPage() {
  const { user, role, loading } = useAuth();

  // IMMEDIATE redirect - NO checks, NO loading, just redirect
  useEffect(() => {
    // Don't do anything while loading
    if (loading) return;
    
    // If no user, go to login
    if (!user) {
      window.location.replace('/login');
      return;
    }
    
    // If we have a role, redirect immediately
    if (role === 'business_owner') {
      window.location.replace('/dashboard/business-owner');
      return;
    } else if (role === 'customer') {
      window.location.replace('/dashboard/customer');
      return;
    } else if (role === 'admin') {
      // Admins go to admin dashboard
      window.location.replace('/admin/dashboard');
      return;
    }
    
    // Fallback - if no role detected, go to login
    window.location.replace('/login');
  }, [user, role, loading]);

  // Show nothing - just redirect
  return null;
}
