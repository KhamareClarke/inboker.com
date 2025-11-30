'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, BookOpen, TrendingUp, Sparkles, Bot } from 'lucide-react';
import { useAuth } from '@/lib/providers/auth-provider';

export default function DashboardPage() {
  const { profile, user, role, loading } = useAuth();
  const router = useRouter();
  const userName = profile?.full_name || user?.email || 'User';

  // Redirect unauthenticated users to login - but wait a bit for auth to initialize
  useEffect(() => {
    if (!loading && !user) {
      // Wait 3 seconds before redirecting to give auth time to initialize
      const redirectTimer = setTimeout(() => {
        // Double check user is still not set
        if (!user) {
          console.log('User not authenticated after wait - redirecting to login');
          router.replace('/login');
        }
      }, 3000);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [user, loading, router]);

  // Redirect customers to their dashboard, business owners to theirs
  // Only redirect if we have both user and role - wait for both to be ready
  useEffect(() => {
    if (!loading && role && user) {
      // Small delay to ensure everything is ready
      const redirectTimer = setTimeout(() => {
        if (role === 'customer') {
          router.replace('/dashboard/customer');
        } else if (role === 'business_owner') {
          router.replace('/dashboard/business-owner');
        } else if (role === 'admin') {
          router.replace('/admin/dashboard');
        }
      }, 500);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [role, loading, user, router]);
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
          <h1 className="text-4xl font-bold tracking-tight mb-2">Dashboard</h1>
          <p className="text-muted-foreground text-lg">Welcome back, {userName}! 👋</p>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 border border-blue-200 dark:border-blue-800">
          <Bot className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            AI Active
          </span>
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

      <div className="grid gap-6 md:grid-cols-2">
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
            <div className="text-center py-12 text-muted-foreground">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center mx-auto mb-4 opacity-50">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <p className="font-medium">No upcoming appointments</p>
              <p className="text-sm mt-1">Bookings will appear here once scheduled</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/20 dark:via-emerald-950/20 dark:to-teal-950/20 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Recent Activity</CardTitle>
              <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                Live
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-center py-12 text-muted-foreground">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center mx-auto mb-4 opacity-50">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <p className="font-medium">No recent activity</p>
              <p className="text-sm mt-1">Activity feed will show client interactions</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
