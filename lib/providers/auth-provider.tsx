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

  const loadUserProfile = async (userId: string, retryCount = 0) => {
    try {
      console.log(`Loading user profile for ${userId} (attempt ${retryCount + 1})`);
      
      // First, ensure we have a valid session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('No session available for profile load');
        if (retryCount < 2) {
          await new Promise(r => setTimeout(r, 2000));
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
    const initAuth = async () => {
      try {
        // Wait a moment for session to be available (longer on mobile)
        await new Promise(r => setTimeout(r, 1000));
        
        // Add timeout to prevent hanging (longer on mobile)
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 10000) // Increased to 10s for mobile
        );

        let sessionResult;
        try {
          sessionResult = await Promise.race([sessionPromise, timeoutPromise]) as any;
        } catch (err: any) {
          console.error('Session check timeout or error:', err);
          // Try one more time on mobile
          try {
            await new Promise(r => setTimeout(r, 1000));
            const retryResult = await supabase.auth.getSession();
            sessionResult = retryResult;
          } catch (retryErr) {
            console.error('Session retry failed:', retryErr);
            sessionResult = { data: { session: null }, error: null };
          }
        }

        const session = sessionResult?.data?.session;
        setUser(session?.user ?? null);
        
        if (session?.user) {
          try {
            // Load profile with retry for mobile
            await loadUserProfile(session.user.id);
          } catch (profileErr) {
            console.error('Error loading user profile:', profileErr);
            // Don't set profile to null immediately - try once more
            try {
              await new Promise(r => setTimeout(r, 2000));
              await loadUserProfile(session.user.id);
            } catch (retryErr) {
              console.error('Profile retry failed:', retryErr);
              setProfile(null);
            }
          }
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setUser(null);
        setProfile(null);
      } finally {
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
