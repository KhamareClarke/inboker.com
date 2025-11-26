'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import type { UserRole, UserProfile } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  role: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadUserProfile = async (userId: string, retryCount = 0): Promise<void> => {
    try {
      console.log(`Loading user profile for ${userId} (attempt ${retryCount + 1})`);
      
      // Quick session check with timeout - don't block too long
      let session: any = null;
      try {
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 5000)
        );
        
        const sessionResult = await Promise.race([
          sessionPromise.then((r: any) => r.data?.session),
          timeoutPromise.then(() => null)
        ]) as any;
        
        session = sessionResult;
      } catch (err) {
        console.warn('Session check failed during profile load:', err);
        // Continue anyway - might still work
      }
      
      if (!session) {
        console.warn('No session available for profile load');
        if (retryCount < 1) {
          // Only retry once, and quickly
          await new Promise(r => setTimeout(r, 1000));
          return loadUserProfile(userId, retryCount + 1);
        }
        setProfile(null);
        return;
      }

      const queryPromise = supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile query timeout')), 15000) // Increased to 15s for mobile
      );

      const result = await Promise.race([
        queryPromise.then((r: any) => ({ type: 'success', data: r.data, error: r.error })),
        timeoutPromise.then(() => ({ type: 'timeout' }))
      ]) as any;

      if (result.type === 'timeout') {
        console.error('Profile query timeout');
        // Retry up to 2 times on mobile if timeout
        if (retryCount < 2) {
          console.log('Retrying profile load...');
          await new Promise(r => setTimeout(r, 2000));
          return loadUserProfile(userId, retryCount + 1);
        }
        setProfile(null);
        return;
      }

      if (result.error) {
        console.error('Profile query error:', result.error);
        // Retry up to 2 times on RLS errors (common on mobile)
        if (retryCount < 2 && (result.error.code === 'PGRST301' || result.error.message?.includes('JWT') || result.error.message?.includes('authentication'))) {
          console.log('Retrying profile load after auth error...');
          await new Promise(r => setTimeout(r, 2000));
          return loadUserProfile(userId, retryCount + 1);
        }
        setProfile(null);
        return;
      }

      if (!result.data) {
        console.warn('No profile data returned');
        setProfile(null);
        return;
      }

      console.log('User profile loaded successfully:', result.data.full_name || result.data.email);
      setProfile(result.data as UserProfile);
    } catch (err: any) {
      console.error('Error loading user profile:', err);
      // Retry up to 2 times on unexpected errors
      if (retryCount < 2) {
        console.log('Retrying profile load after error...');
        await new Promise(r => setTimeout(r, 2000));
        return loadUserProfile(userId, retryCount + 1);
      }
      setProfile(null);
    }
  };

  useEffect(() => {
    // Safety timeout - always set loading to false after 20 seconds max
    const safetyTimeout = setTimeout(() => {
      console.warn('Auth initialization safety timeout - forcing loading to false');
      setLoading(false);
    }, 20000);

    const initAuth = async () => {
      try {
        // Reduced initial wait - check session immediately
        // Add timeout to prevent hanging (increased to 15s)
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 15000)
        );

        let sessionResult;
        try {
          sessionResult = await Promise.race([sessionPromise, timeoutPromise]) as any;
        } catch (err: any) {
          console.warn('Session check timeout or error:', err);
          // If timeout, try a quick retry without waiting
          try {
            const retryResult = await supabase.auth.getSession();
            sessionResult = retryResult;
          } catch (retryErr) {
            console.warn('Session retry failed:', retryErr);
            // Set to no session and continue - don't block
            sessionResult = { data: { session: null }, error: null };
          }
        }

        const session = sessionResult?.data?.session;
        setUser(session?.user ?? null);
        
        // Set loading to false immediately after determining user state
        // Profile can load in background
        if (session?.user) {
          // Load profile in background - don't block on it
          loadUserProfile(session.user.id).catch((profileErr) => {
            console.warn('Profile load failed (non-blocking):', profileErr);
            setProfile(null);
          });
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setUser(null);
        setProfile(null);
      } finally {
        // Always set loading to false quickly - don't wait for profile
        clearTimeout(safetyTimeout);
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: any, session: any) => {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setProfile(null);
        }
        
        router.refresh();
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    router.push('/login');
    router.refresh();
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        profile,
        role: profile?.role || null,
        loading, 
        signOut: handleSignOut 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
