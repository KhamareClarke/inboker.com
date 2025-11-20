'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Hardcoded admin credentials
const ADMIN_EMAIL = 'admin@inboker.com';
const ADMIN_PASSWORD = 'admin123';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Check hardcoded credentials
      if (email.trim() !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
        setError('Invalid admin credentials');
        setLoading(false);
        return;
      }

      // Check if admin user exists in users table
      const { data: existingUser, error: userCheckError } = await supabase
        .from('users')
        .select('*')
        .eq('email', ADMIN_EMAIL)
        .single();

      // If admin user doesn't exist or doesn't have admin role, try to create/update it
      if (!existingUser || existingUser.role !== 'admin') {
        // Try to sign up (will fail if user already exists in auth)
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
        });

        if (authData?.user) {
          // Create user profile
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: authData.user.id,
              email: ADMIN_EMAIL,
              full_name: 'Admin',
              role: 'admin',
              suspended: false,
            });

          if (insertError && !insertError.message.includes('duplicate')) {
            console.error('Error creating admin profile:', insertError);
          }
        } else if (authError && !authError.message.includes('already registered')) {
          // If it's not an "already registered" error, try to update existing user
          if (existingUser) {
            // Update existing user to admin role
            await supabase
              .from('users')
              .update({ role: 'admin' })
              .eq('id', existingUser.id);
          } else {
            console.warn('Admin signup warning:', authError);
          }
        } else if (existingUser && existingUser.role !== 'admin') {
          // Update existing user to admin role
          await supabase
            .from('users')
            .update({ role: 'admin' })
            .eq('id', existingUser.id);
        }
      }

      // Use the regular login API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to login as admin');
      }

      if (result.success && result.session) {
        // Set session
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: result.session.access_token,
          refresh_token: result.session.refresh_token,
        });

        if (sessionError) {
          console.error('Session error:', sessionError);
        }

        // Wait a moment for session to be set and cookies to be stored
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Force a page reload to ensure auth state is refreshed
        // Redirect to admin dashboard
        window.location.href = '/admin/dashboard';
      } else {
        throw new Error('Login failed');
      }
    } catch (err: any) {
      console.error('Admin login error:', err);
      setError(err.message || 'Failed to login as admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <Card className="w-full max-w-md border-2 border-purple-500/20 shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Admin Login
          </CardTitle>
          <CardDescription>
            Enter your admin credentials to access the admin panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@inboker.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="bg-background"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login as Admin'
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              <p>Default credentials:</p>
              <p className="font-mono text-xs mt-1">
                Email: {ADMIN_EMAIL}
              </p>
              <p className="font-mono text-xs">
                Password: {ADMIN_PASSWORD}
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

