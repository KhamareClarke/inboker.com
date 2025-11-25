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

  const loadUserProfile = async (userId: string) => {
    try {
      const queryPromise = supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile query timeout')), 5000)
      );

      const result = await Promise.race([
        queryPromise.then((r: any) => ({ type: 'success', data: r.data, error: r.error })),
        timeoutPromise.then(() => ({ type: 'timeout' }))
      ]) as any;

      if (result.type === 'timeout') {
        console.error('Profile query timeout');
        setProfile(null);
        return;
      }

      if (result.error || !result.data) {
        setProfile(null);
        return;
      }

      setProfile(result.data as UserProfile);
    } catch (err) {
      console.error('Error loading user profile:', err);
      setProfile(null);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Wait a moment for session to be available
        await new Promise(r => setTimeout(r, 500));
        
        // Add timeout to prevent hanging
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 5000)
        );

        let sessionResult;
        try {
          sessionResult = await Promise.race([sessionPromise, timeoutPromise]) as any;
        } catch (err: any) {
          console.error('Session check timeout or error:', err);
          // Continue with null session
          sessionResult = { data: { session: null }, error: null };
        }

        const session = sessionResult?.data?.session;
        setUser(session?.user ?? null);
        
        if (session?.user) {
          try {
            await loadUserProfile(session.user.id);
          } catch (profileErr) {
            console.error('Error loading user profile:', profileErr);
            setProfile(null);
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
