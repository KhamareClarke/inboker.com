'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signUp } from '@/lib/auth';
import type { UserRole } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Section } from '@/components/ui/section';
import { Container } from '@/components/ui/container';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Sparkles, ArrowRight, Briefcase, User, AlertCircle, CreditCard } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userType, setUserType] = useState<'business_owner' | 'customer'>('business_owner');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const canceled = searchParams.get('canceled') === 'true';

  // Redirect to canonical domain (inboker.com) when on Vercel URL so Stripe return URLs show correct domain
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const host = window.location.host || '';
    if (host.includes('vercel.app')) {
      const canonical = 'https://inboker.com';
      const path = window.location.pathname + window.location.search;
      window.location.replace(canonical + path);
      return;
    }
  }, []);

  // Check if user is already logged in and subscription status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setIsLoggedIn(true);
          
          // Check subscription status
          const { data: subscription } = await supabase
            .from('subscriptions')
            .select('status')
            .eq('user_id', session.user.id)
            .single();
          
          const isActive = subscription?.status === 'active' || 
                           subscription?.status === 'trialing' || 
                           subscription?.status === 'trial';
          setHasActiveSubscription(isActive || false);
        }
      } catch (err) {
        console.error('Error checking auth:', err);
      } finally {
        setCheckingAuth(false);
      }
    };
    checkAuth();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const role: UserRole = userType === 'business_owner' ? 'business_owner' : 'customer';
      console.log('🔄 Starting signup...');
      
      // Increase timeout to 30 seconds to allow for database triggers
      const signupPromise = signUp(email, password, fullName, role);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('TIMEOUT')), 30000)
      );
      
      const result = await Promise.race([signupPromise, timeoutPromise]) as any;
      
      console.log('✅ Signup result:', result);
      
      // If signup succeeded (user was created)
      if (result && result.user) {
        console.log('✅ User created successfully!');
        setError('');
        
        // For business owners, redirect to trial subscription checkout
        if (userType === 'business_owner') {
          try {
            // Auto-authenticate first
            const signInResult = await supabase.auth.signInWithPassword({
              email: email.trim().toLowerCase(),
              password: password,
            });
            
            if (signInResult.error || !signInResult.data?.session) {
              console.error('❌ Auto-login failed:', signInResult.error);
              setError('Account created but login failed. Please sign in manually.');
              setLoading(false);
              return;
            }
            
            console.log('✅ Auto-authentication successful!');
            
            // Sync session to cookies so API routes can access it
            try {
              const syncResponse = await fetch('/api/auth/sync-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                  access_token: signInResult.data.session.access_token,
                  refresh_token: signInResult.data.session.refresh_token,
                }),
              });

              if (syncResponse.ok) {
                console.log('✅ Session synced to cookies');
              } else {
                console.warn('⚠️ Failed to sync session to cookies, but continuing');
              }
            } catch (syncErr) {
              console.warn('⚠️ Error syncing session to cookies:', syncErr);
            }
            
            // Wait a moment for session to be fully established
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Redirect to trial subscription checkout
            // We'll create a page that shows the trial offer and collects card details
            window.location.href = '/signup/trial?plan=monthly';
            return;
          } catch (authErr: any) {
            console.error('❌ Auto-authentication error:', authErr);
            setError('Account created but login failed. Please sign in manually.');
            setLoading(false);
            return;
          }
        }
        
        // For customers, redirect to login
        setLoading(false);
        window.location.replace('/login?signup=success');
        return;
      }
      
      // If we get here, something went wrong
      setError('Signup completed but redirect failed. Please try logging in.');
      setLoading(false);
    } catch (err: any) {
      console.error('❌ Signup error:', err);
      
      if (err.message === 'TIMEOUT') {
        // Even on timeout, the signup might have succeeded
        setError('');
        setLoading(false);
        
        // Redirect to login immediately - user can try logging in
        console.log('⚠️ Signup timeout - redirecting to login');
        window.location.replace('/login?signup=timeout');
      } else {
        setError(err.message || 'Failed to create account');
        setLoading(false);
      }
    }
  };

  // Show loading state while checking auth
  if (checkingAuth) {
    return (
      <Section as="div" className="min-h-screen flex items-center justify-center py-ds-6">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </Section>
    );
  }

  // If user is logged in, show message and option to go to dashboard or logout
  if (isLoggedIn) {
    return (
      <Section as="div" className="min-h-screen flex items-center justify-center py-ds-6 relative overflow-hidden bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50 dark:from-blue-950/30 dark:via-cyan-950/30 dark:to-indigo-950/30">
        <Container size="narrow" className="max-w-md w-full relative z-10">
          <Card className="w-full border-2 shadow-ds-xl backdrop-blur-sm bg-background/80 rounded-ds-lg">
            <CardHeader className="space-y-3 pb-6">
              {canceled ? (
                <>
                  <div className="flex items-center justify-center mb-2">
                    <AlertCircle className="h-8 w-8 text-orange-500" />
                  </div>
                  <CardTitle className="ds-heading-2 text-center">Payment Canceled</CardTitle>
                <CardDescription className="text-center">
                  Your payment was canceled. To access your dashboard, you need to complete your subscription setup.
                </CardDescription>
              </>
              ) : (
              <>
                <CardTitle className="ds-heading-2 text-center">Already Logged In</CardTitle>
                <CardDescription className="text-center">
                  You're already signed in. Would you like to create a new account?
                </CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {canceled ? (
              <Alert className="border-orange-200 bg-orange-50">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <strong>No dashboard access without payment.</strong> Please complete your subscription to access all features.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <AlertDescription>
                  To create a new account, please log out first or use a different email address.
                </AlertDescription>
              </Alert>
            )}
            <div className="flex flex-col gap-3">
              {/* If payment was canceled, NEVER show dashboard button - force subscription setup */}
              {canceled ? (
                <>
                  <Button 
                    onClick={() => router.push('/signup/trial?plan=monthly')} 
                    className="w-full bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600"
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Complete Subscription Setup
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={async () => {
                      await supabase.auth.signOut();
                      window.location.href = '/signup';
                    }}
                    className="w-full"
                  >
                    Log Out
                  </Button>
                </>
              ) : hasActiveSubscription ? (
                <>
                  <Button onClick={() => router.push('/dashboard')} className="w-full">
                    Go to Dashboard
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={async () => {
                      await supabase.auth.signOut();
                      window.location.href = '/signup';
                    }}
                    className="w-full"
                  >
                    Log Out and Create New Account
                  </Button>
                  <Link href="/login" className="w-full">
                    <Button variant="ghost" className="w-full">
                      Go to Login Page
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Button 
                    onClick={() => router.push('/signup/trial?plan=monthly')} 
                    className="w-full bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600"
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Complete Subscription Setup
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={async () => {
                      await supabase.auth.signOut();
                      window.location.href = '/signup';
                    }}
                    className="w-full"
                  >
                    Log Out and Create New Account
                  </Button>
                  <Link href="/login" className="w-full">
                    <Button variant="ghost" className="w-full">
                      Go to Login Page
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </CardContent>
          </Card>
        </Container>
      </Section>
    );
  }

  return (
    <Section as="div" className="min-h-screen flex items-center justify-center py-ds-6 relative overflow-hidden bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50 dark:from-blue-950/30 dark:via-cyan-950/30 dark:to-indigo-950/30">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40" />
      <Container size="narrow" className="max-w-md w-full relative z-10">
        <Card className="w-full border-2 shadow-ds-xl backdrop-blur-sm bg-background/80 rounded-ds-lg">
          <CardHeader className="space-y-3 pb-6">
            <div className="flex flex-col items-center gap-3 mb-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-ds bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 border border-blue-200 dark:border-blue-800">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span className="ds-body-sm font-medium bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Inboker
                </span>
              </div>
              <CardTitle className="ds-heading-2">Create an account</CardTitle>
            </div>
            <CardDescription className="text-center ds-body">
              Choose your account type to get started
            </CardDescription>
          </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <Tabs value={userType} onValueChange={(value) => setUserType(value as 'business_owner' | 'customer')} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="business_owner" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Business Owner
                </TabsTrigger>
                <TabsTrigger value="customer" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Customer
                </TabsTrigger>
              </TabsList>
            </Tabs>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {userType === 'business_owner' && (
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-2 border-blue-300 dark:border-blue-700 rounded-lg p-4 text-sm">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center text-white font-bold">
                    14
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-blue-900 dark:text-blue-100 mb-1">14-Day Free Trial</p>
                    <p className="text-blue-800 dark:text-blue-200 mb-2">
                      Start your free 14-day trial! No charges until your trial ends. Cancel anytime.
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      After trial: £20/month or £50/year. Card required to start trial.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {userType === 'customer' && (
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-3 text-sm text-green-900 dark:text-green-200">
                <p className="font-medium mb-1">Customer Account</p>
                <p>Book appointments with businesses. View and manage your bookings.</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={loading}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                className="h-11"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-2">
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 hover:from-blue-700 hover:via-cyan-700 hover:to-blue-700 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 bg-[length:200%_100%] hover:bg-right"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
                Sign in
              </Link>
            </div>
            <div className="text-center pt-2">
              <Link href="/" className="text-sm text-muted-foreground hover:text-blue-600 transition-colors">
                ← Back to home
              </Link>
            </div>
          </CardFooter>
        </form>
        </Card>
      </Container>
    </Section>
  );
}
