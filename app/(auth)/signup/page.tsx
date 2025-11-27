'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signUp } from '@/lib/auth';
import type { UserRole } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Sparkles, ArrowRight, Briefcase, User } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SignupPage() {
  const router = useRouter();
  const [userType, setUserType] = useState<'business_owner' | 'customer'>('business_owner');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      
      // If signup succeeded (user was created), auto-authenticate and redirect
      if (result && result.user) {
        console.log('✅ User created successfully!');
        setError('');
        setLoading(false);
        
        // Auto-authenticate immediately after signup using direct Supabase signIn
        try {
          console.log('🔄 Auto-authenticating user after signup...');
          
          // Sign in directly with Supabase (faster and more reliable)
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password: password,
          });
          
          if (signInError || !signInData.session) {
            console.error('❌ Auto-login failed:', signInError);
            // If auto-login fails, redirect to login page
            window.location.replace('/login?signup=success');
            return;
          }
          
          console.log('✅ Auto-authentication successful! Session:', signInData.session.user.email);
          
          // Wait for session to be fully established
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Get user role from profile
          const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', signInData.session.user.id)
            .single();
          
          const userRole = profile?.role || role;
          console.log('✅ User role:', userRole);
          
          // Redirect based on role
          if (userRole === 'customer') {
            console.log('✅ Redirecting customer to /dashboard/customer');
            window.location.href = '/dashboard/customer?signup=success';
          } else if (userRole === 'business_owner') {
            // Check for business profile
            const { data: businessProfile } = await supabase
              .from('business_profiles')
              .select('business_slug')
              .eq('user_id', signInData.session.user.id)
              .single();
            
            if (businessProfile?.business_slug) {
              console.log('✅ Redirecting business owner to /' + businessProfile.business_slug + '/dashboard');
              window.location.href = `/${businessProfile.business_slug}/dashboard?signup=success`;
            } else {
              console.log('✅ Redirecting business owner to /dashboard/business-owner');
              window.location.href = '/dashboard/business-owner?signup=success';
            }
          } else {
            window.location.href = '/dashboard/customer?signup=success';
          }
        } catch (authErr: any) {
          console.error('❌ Auto-authentication error:', authErr);
          // If auto-authentication fails, redirect to login
          window.location.replace('/login?signup=success');
        }
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

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50 dark:from-blue-950/30 dark:via-cyan-950/30 dark:to-indigo-950/30" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40" />

      <Card className="w-full max-w-md relative border-2 shadow-2xl backdrop-blur-sm bg-background/80">
        <CardHeader className="space-y-3 pb-6">
          <div className="flex flex-col items-center gap-3 mb-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 border border-blue-200 dark:border-blue-800">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Inboker
              </span>
            </div>
            <CardTitle className="text-3xl font-bold">Create an account</CardTitle>
          </div>
          <CardDescription className="text-center text-base">
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
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm text-blue-900 dark:text-blue-200">
                <p className="font-medium mb-1">Business Owner Account</p>
                <p>Create and manage your booking business. Access dashboard, manage services, staff, and bookings.</p>
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
    </div>
  );
}
