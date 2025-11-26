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
    // Set loading to false immediately - don't block page rendering
    // Auth will happen in background and update user state when ready
    setLoading(false);
    
    // Safety timeout - always ensure loading is false after 2 seconds (backup)
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, 2000);

    const initAuth = async () => {
      try {
        // Try getUser() first - it's often faster than getSession()
        // Use very short timeout (2s) for initial check
        let userResult: any = null;
        try {
          const getUserPromise = supabase.auth.getUser();
          const getUserTimeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('GetUser timeout')), 2000)
          );
          
          userResult = await Promise.race([getUserPromise, getUserTimeout]) as any;
        } catch (err: any) {
          console.warn('GetUser timeout or error, trying getSession:', err);
          // Fallback to getSession with very short timeout (1.5s)
          try {
            const sessionPromise = supabase.auth.getSession();
            const sessionTimeout = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Session timeout')), 1500)
            );
            
            const sessionResult = await Promise.race([sessionPromise, sessionTimeout]) as any;
            if (sessionResult?.data?.session) {
              userResult = { data: { user: sessionResult.data.session.user } };
            }
          } catch (sessionErr) {
            console.warn('Both getUser and getSession failed - proceeding without auth:', sessionErr);
            // Don't block - set user to null and continue
            userResult = null;
          }
        }

        const user = userResult?.data?.user ?? null;
        setUser(user);
        
        // Profile can load in background - don't block on it
        if (user) {
          // Load profile in background - don't block on it
          loadUserProfile(user.id).catch((profileErr) => {
            console.warn('Profile load failed (non-blocking):', profileErr);
            setProfile(null);
          });
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        // Don't block - set to null and continue
        setUser(null);
        setProfile(null);
      } finally {
        // Ensure loading is always false
        clearTimeout(safetyTimeout);
        setLoading(false);
      }
    };

    // Start auth in background - don't block
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
