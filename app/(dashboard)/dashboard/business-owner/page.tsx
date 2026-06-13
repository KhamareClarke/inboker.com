'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Users, BookOpen, TrendingUp, Sparkles, Bot, LogOut, Loader2, CreditCard, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { useAuth } from '@/lib/providers/auth-provider';
import { useBusinessProfile } from '@/lib/hooks/use-business-profile';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Section } from '@/components/ui/section';
import { TRIAL_PERIOD_DAYS } from '@/lib/stripe-config';

export default function BusinessOwnerDashboardPage() {
  const { profile, user, signOut, loading: authLoading } = useAuth();
  const { profile: businessProfile, loading: businessProfileLoading } = useBusinessProfile();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userName = profile?.full_name || user?.email || 'User';
  const [subscriptionStatus, setSubscriptionStatus] = useState<'active' | 'inactive' | 'trial' | 'trialing' | 'loading'>('loading');
  const [showTrialSuccess, setShowTrialSuccess] = useState(false);

  // Generate slug from business name if slug is missing
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!authLoading && !user) {
      console.log('User not authenticated - redirecting to login');
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  // Check for trial_started query parameter
  useEffect(() => {
    if (searchParams.get('trial_started') === 'true') {
      setShowTrialSuccess(true);
      // Remove query parameter from URL
      router.replace('/dashboard/business-owner', { scroll: false });
    }
  }, [searchParams, router]);

  // Check subscription status
  useEffect(() => {
    if (user) {
      checkSubscriptionStatus();
    }
  }, [user]);

  // Redirect to billing if subscription is inactive - NO dashboard access without payment
  useEffect(() => {
    if (subscriptionStatus === 'inactive' && !businessProfileLoading) {
      console.log('❌ Subscription inactive - redirecting to billing');
      router.replace('/dashboard/business-owner/billing?locked=true');
    }
  }, [subscriptionStatus, businessProfileLoading, router]);

  const checkSubscriptionStatus = async () => {
    try {
      const response = await fetch('/api/stripe/subscription');
      const data = await response.json();
      
      if (response.ok && data.subscription) {
        const status = data.subscription.status;
        // Allow access during trial (trialing, trial) and when active
        if (status === 'active' || status === 'trialing' || status === 'trial') {
          setSubscriptionStatus('active');
        } else {
          setSubscriptionStatus('inactive');
          // IMMEDIATELY redirect to billing - NO dashboard access without payment
          console.log('❌ No active subscription - redirecting to billing');
          router.replace('/dashboard/business-owner/billing?locked=true');
          return;
        }
      } else {
        setSubscriptionStatus('inactive');
        // IMMEDIATELY redirect to billing - NO dashboard access without payment
        console.log('❌ No subscription found - redirecting to billing');
        router.replace('/dashboard/business-owner/billing?locked=true');
        return;
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      setSubscriptionStatus('inactive');
      // IMMEDIATELY redirect to billing - NO dashboard access without payment
      console.log('❌ Error checking subscription - redirecting to billing');
      router.replace('/dashboard/business-owner/billing?locked=true');
    }
  };

  // Redirect to business-specific dashboard if business profile exists
  useEffect(() => {
    if (!businessProfileLoading && businessProfile && user) {
      const slug = businessProfile.business_slug || generateSlug(businessProfile.business_name);
      if (slug) {
        router.replace(`/${slug}/dashboard`);
      }
    }
  }, [businessProfile, businessProfileLoading, user, router]);

  // Show loading while checking for business profile or subscription
  if (businessProfileLoading || subscriptionStatus === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // BLOCK ACCESS if subscription is inactive - show loading while redirecting
  // This is a client-side backup to middleware protection
  if (subscriptionStatus === 'inactive') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Redirecting to billing...</p>
        </div>
      </div>
    );
  }

  // If business profile exists, we'll redirect (but show loading in the meantime)
  if (businessProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const stats = [
    { title: 'Total Bookings', value: '0', icon: BookOpen, description: 'No bookings yet', gradient: 'from-blue-600 to-cyan-600', bgGradient: 'from-blue-50 to-cyan-50' },
    { title: 'Active Clients', value: '0', icon: Users, description: 'No clients yet', gradient: 'from-green-600 to-emerald-600', bgGradient: 'from-green-50 to-emerald-50' },
    { title: 'Team Members', value: '0', icon: Calendar, description: 'No team members', gradient: 'from-orange-600 to-amber-600', bgGradient: 'from-orange-50 to-amber-50' },
    { title: 'Revenue', value: '£0', icon: TrendingUp, description: 'No revenue yet', gradient: 'from-teal-600 to-cyan-600', bgGradient: 'from-teal-50 to-cyan-50' },
  ];

  return (
    <Section className="space-y-ds-4">
      {/* Note: Inactive subscriptions are handled with early return above - this section only renders for active/trial subscriptions */}

      {/* Trial Success Message */}
      {showTrialSuccess && (
        <Alert className="border-emerald-200 bg-emerald-50 relative rounded-2xl">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <AlertDescription className="text-green-900 dark:text-green-100 pr-8">
            <div className="space-y-2">
              <p className="font-bold text-lg">🎉 Your Free Trial Has Been Started!</p>
              <p className="text-base">
                Now you can access and use all the features. After {TRIAL_PERIOD_DAYS} days, you will be charged. Enjoy your free trial!
              </p>
            </div>
          </AlertDescription>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTrialSuccess(false)}
            className="absolute top-2 right-2 text-green-600 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-900/30"
          >
            <X className="h-4 w-4" />
          </Button>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">Business Dashboard</h1>
          <p className="text-muted-foreground text-sm">Welcome back, {userName}!</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-100 to-cyan-100 border border-blue-200">
            <Bot className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">AI Active</span>
          </div>
          <Button
            onClick={signOut}
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-2 rounded-2xl shadow-md">
            <CardHeader className={`flex flex-row items-center justify-between pb-2 bg-gradient-to-br ${stat.bgGradient} rounded-t-2xl`}>
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className={`text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>{stat.value}</div>
              <p className="text-sm text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No business profile - show setup message */}
      {!businessProfile && (
        <Card className="border-2 border-dashed rounded-2xl shadow-md">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">Create Your Business Profile</h3>
            <p className="text-muted-foreground mb-6">
              Set up your business profile to start managing services, staff, and bookings
            </p>
            <Button onClick={() => router.push('/dashboard/brand')} size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0">
              Create Business Profile
            </Button>
          </CardContent>
        </Card>
      )}

      {!businessProfile && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/dashboard/business-owner/services">
            <Card className="border-2 hover:shadow-xl transition-all duration-300 cursor-pointer">
              <CardHeader className="bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Services</CardTitle>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">Manage</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-muted-foreground">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mx-auto mb-4 opacity-60">
                    <BookOpen className="h-8 w-8 text-white" />
                  </div>
                  <p className="font-medium">Manage Services</p>
                  <p className="text-sm mt-1">Add and edit your business services</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/business-owner/staff">
            <Card className="border-2 hover:shadow-xl transition-all duration-300 cursor-pointer">
              <CardHeader className="bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Staff</CardTitle>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700">Manage</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-muted-foreground">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-600 to-amber-600 flex items-center justify-center mx-auto mb-4 opacity-60">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <p className="font-medium">Manage Staff</p>
                  <p className="text-sm mt-1">Add and manage your team members</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card className="border-2 hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 via-cyan-50 to-indigo-50 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Upcoming Appointments</CardTitle>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Scheduled
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center mx-auto mb-4 opacity-60">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <p className="font-medium">No upcoming appointments</p>
                <p className="text-sm mt-1">Bookings will appear here once scheduled</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Section>
  );
}

