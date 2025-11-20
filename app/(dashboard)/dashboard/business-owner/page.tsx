'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Users, BookOpen, TrendingUp, Sparkles, Bot, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/providers/auth-provider';
import { useBusinessProfile } from '@/lib/hooks/use-business-profile';

export default function BusinessOwnerDashboardPage() {
  const { profile, user, signOut } = useAuth();
  const { profile: businessProfile, loading: businessProfileLoading } = useBusinessProfile();
  const router = useRouter();
  const userName = profile?.full_name || user?.email || 'User';

  // Generate slug from business name if slug is missing
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Redirect to business-specific dashboard if business profile exists
  useEffect(() => {
    if (!businessProfileLoading && businessProfile) {
      const slug = businessProfile.business_slug || generateSlug(businessProfile.business_name);
      if (slug) {
        router.replace(`/${slug}/dashboard`);
      }
    }
  }, [businessProfile, businessProfileLoading, router]);

  // Show loading while checking for business profile
  if (businessProfileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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
    {
      title: 'Total Bookings',
      value: '0',
      icon: BookOpen,
      description: 'No bookings yet',
      gradient: 'from-blue-600 to-cyan-600',
      bgGradient: 'from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20',
    },
    {
      title: 'Active Clients',
      value: '0',
      icon: Users,
      description: 'No clients yet',
      gradient: 'from-green-600 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20',
    },
    {
      title: 'Team Members',
      value: '0',
      icon: Calendar,
      description: 'No team members',
      gradient: 'from-orange-600 to-amber-600',
      bgGradient: 'from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20',
    },
    {
      title: 'Revenue',
      value: '$0',
      icon: TrendingUp,
      description: 'No revenue yet',
      gradient: 'from-teal-600 to-cyan-600',
      bgGradient: 'from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Business Dashboard</h1>
          <p className="text-muted-foreground text-lg">Welcome back, {userName}! 👋</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 border border-blue-200 dark:border-blue-800">
            <Bot className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              AI Active
            </span>
          </div>
          <Button
            onClick={signOut}
            variant="outline"
            className="border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-2">
            <CardHeader className={`flex flex-row items-center justify-between pb-2 bg-gradient-to-br ${stat.bgGradient}`}>
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className={`text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>{stat.value}</div>
              <p className="text-sm text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No business profile - show setup message */}
      {!businessProfile && (
        <Card className="border-2 border-dashed">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Create Your Business Profile</h3>
            <p className="text-muted-foreground mb-6">
              Set up your business profile to start managing services, staff, and bookings
            </p>
            <Button onClick={() => router.push('/dashboard/brand')} size="lg">
              Create Business Profile
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Show management cards only if business profile does NOT exist */}
      {!businessProfile && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/dashboard/business-owner/services">
            <Card className="border-2 hover:shadow-xl transition-all duration-300 cursor-pointer">
              <CardHeader className="bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-rose-950/20 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Services</CardTitle>
                  <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                    Manage
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-muted-foreground">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mx-auto mb-4 opacity-50">
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
              <CardHeader className="bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-950/20 dark:via-amber-950/20 dark:to-yellow-950/20 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Staff</CardTitle>
                  <Badge variant="secondary" className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
                    Manage
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-muted-foreground">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-600 to-amber-600 flex items-center justify-center mx-auto mb-4 opacity-50">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <p className="font-medium">Manage Staff</p>
                  <p className="text-sm mt-1">Add and manage your team members</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card className="border-2 hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 via-cyan-50 to-indigo-50 dark:from-blue-950/20 dark:via-cyan-950/20 dark:to-indigo-950/20 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Upcoming Appointments</CardTitle>
                <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Scheduled
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center mx-auto mb-4 opacity-50">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <p className="font-medium">No upcoming appointments</p>
                <p className="text-sm mt-1">Bookings will appear here once scheduled</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

