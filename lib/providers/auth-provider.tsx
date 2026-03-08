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
    // Set loading to false after a short delay to allow auth check
    let loadingTimeout: NodeJS.Timeout;
    
    const initAuth = async () => {
      try {
        // Try getSession() first - it's more reliable than getUser()
        // Use shorter timeout (3s) to avoid long waits
        let userResult: any = null;
        try {
          const sessionPromise = supabase.auth.getSession();
          const sessionTimeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Session timeout')), 3000)
          );
          
          const sessionResult = await Promise.race([sessionPromise, sessionTimeout]) as any;
          if (sessionResult?.data?.session) {
            userResult = { data: { user: sessionResult.data.session.user } };
            console.log('✅ Session found in initAuth:', sessionResult.data.session.user.email);
          }
        } catch (sessionErr: any) {
          console.warn('GetSession timeout or error, trying getUser:', sessionErr);
          // Fallback to getUser with shorter timeout (2s)
          try {
            const getUserPromise = supabase.auth.getUser();
            const getUserTimeout = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('GetUser timeout')), 2000)
            );
            
            userResult = await Promise.race([getUserPromise, getUserTimeout]) as any;
            if (userResult?.data?.user) {
              console.log('✅ User found via getUser:', userResult.data.user.email);
            }
          } catch (getUserErr) {
            console.warn('Both getSession and getUser failed - will rely on onAuthStateChange:', getUserErr);
            // Set user to null if both fail - don't wait indefinitely
            userResult = null;
          }
        }

        const user = userResult?.data?.user ?? null;
        if (user) {
          setUser(user);
          // Load profile in background
          loadUserProfile(user.id).catch((profileErr) => {
            console.warn('Profile load failed (non-blocking):', profileErr);
            setProfile(null);
          });
        } else {
          // No user found - set to null immediately
          setUser(null);
          setProfile(null);
          console.log('⏳ No user found in init');
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        // On error, assume no user
        setUser(null);
        setProfile(null);
      } finally {
        // Always set loading to false after auth check
        setLoading(false);
        if (loadingTimeout) clearTimeout(loadingTimeout);
      }
    };

    // Set a safety timeout to ensure loading is false after max 2 seconds
    loadingTimeout = setTimeout(() => {
      setLoading(false);
    }, 2000);

    // Start auth check
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email || 'no user');
        
        if (session?.user) {
          console.log('✅ Setting user from onAuthStateChange:', session.user.email);
          setUser(session.user);
          // Load profile
          loadUserProfile(session.user.id).catch((profileErr) => {
            console.warn('Profile load failed in onAuthStateChange:', profileErr);
            setProfile(null);
          });
        } else {
          console.log('❌ No session in onAuthStateChange');
          setUser(null);
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
    try {
      // Clear local state first
      setUser(null);
      setProfile(null);
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
      }
      
      // Clear all Supabase-related cookies manually to ensure they're gone
      const cookies = document.cookie.split(";");
      cookies.forEach((c) => {
        const cookieName = c.trim().split("=")[0];
        if (cookieName.includes('supabase') || cookieName.includes('sb-') || cookieName.includes('auth')) {
          // Clear for current path
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          // Clear for root domain
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
          // Clear for parent domain (if applicable)
          const parts = window.location.hostname.split('.');
          if (parts.length > 1) {
            const parentDomain = '.' + parts.slice(-2).join('.');
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${parentDomain};`;
          }
        }
      });
      
      // Clear auth-related localStorage and sessionStorage
      try {
        // Clear Supabase auth data from localStorage
        Object.keys(localStorage).forEach(key => {
          if (key.includes('supabase') || key.includes('sb-') || key.includes('auth')) {
            localStorage.removeItem(key);
          }
        });
        // Clear auth-related sessionStorage
        Object.keys(sessionStorage).forEach(key => {
          if (key.includes('supabase') || key.includes('sb-') || key.includes('auth')) {
            sessionStorage.removeItem(key);
          }
        });
      } catch (e) {
        console.warn('Could not clear storage:', e);
      }
      
      // Wait a bit to ensure everything is cleared, then redirect with a bypass parameter
      setTimeout(() => {
        // Use a query parameter to bypass middleware redirect check
        // Force a full page reload to ensure all state is cleared
        window.location.replace('/login?logout=true');
      }, 200);
    } catch (error) {
      console.error('Error during sign out:', error);
      // Force redirect even if there's an error
      window.location.replace('/login?logout=true');
    }
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
