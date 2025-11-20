'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/providers/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Loader2, ArrowLeft, Calendar, Users, BookOpen, TrendingUp, Mail, Phone, Globe, Instagram, Facebook, Twitter, Linkedin, Clock, User, CheckCircle2, Bell, X, AlertCircle, Star, MessageSquare, LogOut } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { BusinessProfile } from '@/lib/types';

export default function BusinessDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile: userProfile, signOut, loading: authLoading } = useAuth();
  const businessSlug = params.businessSlug as string;
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [completedBookings, setCompletedBookings] = useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [dismissedNotifications, setDismissedNotifications] = useState<Set<string>>(new Set());
  const [dismissedReviews, setDismissedReviews] = useState<Set<string>>(new Set());
  const [lastNotificationLoadTime, setLastNotificationLoadTime] = useState<Date | null>(null);
  const userName = userProfile?.full_name || user?.email || 'User';

  useEffect(() => {
    if (businessSlug) {
      loadBusinessProfile();
    }
    
    // Safety timeout - ensure loading is cleared after 15 seconds max
    const safetyTimeout = setTimeout(() => {
      if (loading) {
        console.error('Safety timeout: Force clearing loading state after 15 seconds');
        setLoading(false);
        setIsLoading(false);
      }
    }, 15000);
    
    return () => clearTimeout(safetyTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessSlug]);

  // Auto-refresh bookings and notifications every 20 seconds
  useEffect(() => {
    if (!profile?.id) return;
    
    const interval = setInterval(() => {
      console.log('Auto-refreshing business dashboard data...');
      if (profile.id) {
        loadUpcomingBookings(profile.id);
      }
    }, 20000); // Refresh every 20 seconds
    
    return () => clearInterval(interval);
  }, [profile?.id]);

  // Refresh on page focus
  useEffect(() => {
    if (!profile?.id) return;
    
    const handleFocus = () => {
      console.log('Page focused, refreshing business dashboard...');
      if (profile.id) {
        loadUpcomingBookings(profile.id);
      }
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [profile?.id]);

  const loadBusinessProfile = async () => {
    if (isLoading) return;
    if (!businessSlug) {
      setLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setLoading(true);
      
      console.log('Loading business profile for slug:', businessSlug);
      
      // Try 1: Exact slug match
      let slugData, slugError;
      try {
        console.log('Attempting slug lookup for:', businessSlug);
        const queryPromise = supabase
          .from('business_profiles')
          .select('*')
          .eq('business_slug', businessSlug)
          .maybeSingle();

        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 5000)
        );

        const result = await Promise.race([
          queryPromise.then((r: any) => {
            console.log('Slug query completed:', { data: r.data, error: r.error });
            return { type: 'success', data: r.data, error: r.error };
          }),
          timeoutPromise.then(() => ({ type: 'timeout' }))
        ]) as any;

        if (result.type === 'timeout') {
          console.error('Query timeout for slug lookup');
          slugError = { message: 'Request timeout' };
        } else {
          slugData = result.data;
          slugError = result.error;
          
          if (slugError) {
            console.log('Slug lookup error:', slugError);
          } else if (slugData) {
            console.log('Found profile by slug:', slugData.business_name);
          } else {
            console.log('No profile found by slug');
          }
        }
      } catch (err: any) {
        console.error('Exception during slug lookup:', err);
        if (err.message === 'Request timeout' || err.message === 'Timeout') {
          slugError = { message: 'Request timeout' };
        } else {
          slugError = err;
        }
      }

      if (!slugError && slugData) {
        setProfile(slugData);
        setLoading(false);
        setIsLoading(false);
        loadUpcomingBookings(slugData.id);
        return;
      }

      // Try 2: Convert slug to business name and search
      const businessName = businessSlug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      console.log('Trying to find by business name:', businessName);

      // Try case-insensitive match
      try {
        const queryPromise = supabase
          .from('business_profiles')
          .select('*')
          .ilike('business_name', `%${businessName}%`);

        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 5000)
        );

        const result = await Promise.race([
          queryPromise.then((r: any) => ({ type: 'success', data: r.data, error: r.error })),
          timeoutPromise.then(() => ({ type: 'timeout' }))
        ]) as any;

        if (result.type !== 'timeout' && !result.error && result.data && result.data.length > 0) {
          console.log('Found profile by ilike name:', result.data[0].business_name);
          setProfile(result.data[0]);
          setLoading(false);
          setIsLoading(false);
          loadUpcomingBookings(result.data[0].id);
          return;
        }
      } catch (err) {
        console.error('Error in ilike query:', err);
      }

      // Try exact match
      try {
        const queryPromise = supabase
          .from('business_profiles')
          .select('*')
          .eq('business_name', businessName)
          .maybeSingle();

        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 5000)
        );

        const result = await Promise.race([
          queryPromise.then((r: any) => ({ type: 'success', data: r.data, error: r.error })),
          timeoutPromise.then(() => ({ type: 'timeout' }))
        ]) as any;

        if (result.type !== 'timeout' && !result.error && result.data) {
          console.log('Found profile by exact name:', result.data.business_name);
          setProfile(result.data);
          setLoading(false);
          setIsLoading(false);
          loadUpcomingBookings(result.data.id);
          return;
        }
      } catch (err) {
        console.error('Error in exact match query:', err);
      }

      // Try 3: If user is logged in, try to find their own profile
      if (user) {
        console.log('Trying to find profile by user_id:', user.id);
        try {
          const queryPromise = supabase
            .from('business_profiles')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 5000)
          );

          const result = await Promise.race([
            queryPromise.then((r: any) => ({ type: 'success', data: r.data, error: r.error })),
            timeoutPromise.then(() => ({ type: 'timeout' }))
          ]) as any;

          if (result.type !== 'timeout' && !result.error && result.data) {
            console.log('Found profile by user_id:', result.data.business_name);
            setProfile(result.data);
            setLoading(false);
            setIsLoading(false);
            loadUpcomingBookings(result.data.id);
            return;
          }
        } catch (userErr) {
          console.warn('Error fetching user profile:', userErr);
        }
      }

      // Try 4: List all profiles to debug (only in development)
      if (process.env.NODE_ENV === 'development') {
        try {
          const { data: allProfiles, error: allError } = await supabase
            .from('business_profiles')
            .select('id, business_name, business_slug, user_id')
            .limit(10);
          
          if (!allError && allProfiles) {
            console.log('All business profiles in database:', allProfiles);
            console.log('Looking for slug:', businessSlug);
          }
        } catch (debugErr) {
          console.error('Error fetching all profiles for debug:', debugErr);
        }
      }

      console.error('Business profile not found for slug:', businessSlug);
      console.error('All lookup attempts failed. Setting profile to null.');
      setProfile(null);
    } catch (err: any) {
      console.error('Error loading business profile:', err);
      console.error('Error details:', err.message || err);
      setProfile(null);
    } finally {
      // Always clear loading state - this is critical
      console.log('Clearing loading state in finally block');
      setLoading(false);
      setIsLoading(false);
    }
  };

  const loadUpcomingBookings = async (businessProfileId: string) => {
    try {
      setBookingsLoading(true);
      const now = new Date().toISOString();
      
      const { data: upcomingData, error: upcomingError } = await supabase
        .from('business_profile_bookings')
        .select(`
          *,
          business_profile_services (
            id,
            name,
            color,
            is_active
          ),
          business_profile_staff (
            id,
            full_name
          )
        `)
        .eq('business_profile_id', businessProfileId)
        .gte('start_time', now)
        .in('status', ['pending', 'confirmed'])
        .order('start_time', { ascending: true })
        .limit(10);

      if (upcomingError) {
        console.error('Error loading upcoming bookings:', upcomingError);
      } else {
        setUpcomingBookings(upcomingData || []);
      }

      const { data: completedData, error: completedError } = await supabase
        .from('business_profile_bookings')
        .select(`
          *,
          business_profile_services (
            id,
            name,
            color,
            is_active
          ),
          business_profile_staff (
            id,
            full_name
          )
        `)
        .eq('business_profile_id', businessProfileId)
        .eq('status', 'completed')
        .order('start_time', { ascending: false })
        .limit(100);

      if (completedError) {
        console.error('Error loading completed bookings:', completedError);
      } else {
        setCompletedBookings(completedData || []);
      }

      loadNotifications(businessProfileId);
      loadReviews(businessProfileId);
    } catch (err) {
      console.error('Error loading bookings:', err);
    } finally {
      setBookingsLoading(false);
    }
  };

  const loadReviews = async (businessProfileId: string) => {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data, error } = await supabase
        .from('appointment_reviews')
        .select(`
          *,
          business_profile_bookings (
            id,
            client_name,
            client_email,
            start_time,
            business_profile_services (
              id,
              name
            )
          )
        `)
        .eq('business_profile_id', businessProfileId)
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading reviews:', error);
        return;
      }

      const activeReviews = (data || []).filter((r: any) => !dismissedReviews.has(r.id));
      setReviews(activeReviews);
    } catch (err) {
      console.error('Error loading reviews:', err);
    }
  };

  const dismissReview = (reviewId: string) => {
    setDismissedReviews(prev => new Set(Array.from(prev).concat(reviewId)));
    setReviews(prev => prev.filter(r => r.id !== reviewId));
  };

  const loadNotifications = async (businessProfileId: string) => {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      // Get new bookings (created in last 7 days, status pending)
      const { data: newBookingsData, error: newBookingsError } = await supabase
        .from('business_profile_bookings')
        .select(`
          *,
          business_profile_services (
            id,
            name,
            color
          ),
          business_profile_staff (
            id,
            full_name
          )
        `)
        .eq('business_profile_id', businessProfileId)
        .eq('status', 'pending')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      const { data: cancelledData, error: cancelledError } = await supabase
        .from('business_profile_bookings')
        .select(`
          *,
          business_profile_services (
            id,
            name,
            color
          ),
          business_profile_staff (
            id,
            full_name
          )
        `)
        .eq('business_profile_id', businessProfileId)
        .eq('status', 'cancelled')
        .gte('updated_at', sevenDaysAgo.toISOString())
        .order('updated_at', { ascending: false });

      const { data: allUpdatedData, error: allError } = await supabase
        .from('business_profile_bookings')
        .select(`
          *,
          business_profile_services (
            id,
            name,
            color
          ),
          business_profile_staff (
            id,
            full_name
          )
        `)
        .eq('business_profile_id', businessProfileId)
        .gte('updated_at', sevenDaysAgo.toISOString())
        .order('updated_at', { ascending: false });

      if (newBookingsError || cancelledError || allError) {
        console.error('Error loading notifications:', newBookingsError || cancelledError || allError);
      } else {
        const now = new Date();
        const threeMinutesAgo = new Date(now.getTime() - 3 * 60 * 1000); // 3 minutes ago
        
        // Filter function to exclude appointments updated by business owner (very recently)
        const isUpdatedByCustomer = (booking: any) => {
          const updatedAt = new Date(booking.updated_at);
          // If updated very recently (within last 3 minutes), assume it was the business owner
          // Only show if it was updated before the last notification load, or if this is the first load
          if (updatedAt > threeMinutesAgo) {
            // Very recent update - likely by business owner
            return false;
          }
          // If we have a last load time, only show if updated after that time
          if (lastNotificationLoadTime) {
            return updatedAt > lastNotificationLoadTime;
          }
          return true;
        };
        
        // New bookings (recently created, not rescheduled)
        const newBookings = (newBookingsData || [])
          .filter((b: any) => {
            const updatedAt = new Date(b.updated_at);
            const createdAt = new Date(b.created_at);
            // Only show as "new" if it was created recently and not significantly updated (not rescheduled)
            return updatedAt.getTime() - createdAt.getTime() < 60000; // Less than 1 minute difference
          })
          .map(b => ({ ...b, type: 'new_booking' }));
        
        // Only show cancelled bookings that were cancelled by customer (not recently updated)
        const cancelledBookings = (cancelledData || [])
          .filter(isUpdatedByCustomer)
          .map(b => ({ ...b, type: 'cancelled' }));
        
        // Only show rescheduled bookings that were rescheduled by customer (not recently updated)
        const rescheduledBookings = (allUpdatedData || [])
          .filter(b => {
            const updatedAt = new Date(b.updated_at);
            const createdAt = new Date(b.created_at);
            return b.status === 'pending' && 
                   updatedAt.getTime() - createdAt.getTime() > 60000 &&
                   updatedAt > sevenDaysAgo &&
                   isUpdatedByCustomer(b);
          })
          .map(b => ({ ...b, type: 'rescheduled' }));
        
        const allNotifications = [
          ...newBookings,
          ...rescheduledBookings,
          ...cancelledBookings
        ].filter(n => !dismissedNotifications.has(n.id));
        
        setNotifications(allNotifications);
        
        // Update last load time
        setLastNotificationLoadTime(now);
      }
    } catch (err) {
      console.error('Error loading notifications:', err);
    }
  };

  const dismissNotification = (notificationId: string) => {
    setDismissedNotifications(prev => new Set(Array.from(prev).concat(notificationId)));
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const dismissAllNotifications = () => {
    notifications.forEach(n => {
      setDismissedNotifications(prev => new Set(Array.from(prev).concat(n.id)));
    });
    setNotifications([]);
  };

  // Calculate stats using useMemo - MUST be before early returns (Rules of Hooks)
  const stats = useMemo(() => {
    const completedRevenue = completedBookings.reduce((sum, b) => sum + Number(b.amount || 0), 0);
    const uniqueClients = new Set([
      ...upcomingBookings.map(b => b.client_email),
      ...completedBookings.map(b => b.client_email)
    ]).size;

    const upcomingCount = upcomingBookings.length;
    const completedCount = completedBookings.length;
    const totalCount = upcomingCount + completedCount;
    const clientCount = uniqueClients;
    const revenueText = '$' + completedRevenue.toFixed(2);

    return [
      {
        title: 'Total Bookings',
        value: totalCount.toString(),
        icon: BookOpen,
        description: `${upcomingCount} upcoming, ${completedCount} completed`,
        gradient: 'from-blue-600 to-cyan-600',
      },
      {
        title: 'Active Clients',
        value: clientCount.toString(),
        icon: Users,
        description: `${clientCount} unique client${clientCount !== 1 ? 's' : ''}`,
        gradient: 'from-green-600 to-emerald-600',
      },
      {
        title: 'Upcoming',
        value: upcomingCount.toString(),
        icon: Calendar,
        description: `${upcomingCount} upcoming appointment${upcomingCount !== 1 ? 's' : ''}`,
        gradient: 'from-orange-600 to-amber-600',
      },
      {
        title: 'Completed',
        value: completedCount.toString(),
        icon: CheckCircle2,
        description: `${completedCount} completed appointment${completedCount !== 1 ? 's' : ''}`,
        gradient: 'from-purple-600 to-pink-600',
      },
      {
        title: 'Revenue',
        value: revenueText,
        icon: TrendingUp,
        description: 'Total from completed appointments',
        gradient: 'from-teal-600 to-cyan-600',
      }
    ];
  }, [upcomingBookings, completedBookings]);

  // Show loading while business profile is loading (don't wait for auth)
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Business Not Found</h1>
        <p className="text-muted-foreground mb-4">The business profile you're looking for doesn't exist.</p>
        <Button onClick={() => router.push('/dashboard')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              {profile.logo_url && (
                <img
                  src={profile.logo_url}
                  alt={profile.business_name}
                  className="w-10 h-10 sm:w-12 sm:h-12 object-contain flex-shrink-0"
                />
              )}
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold truncate">{profile.business_name}</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">Welcome back, {userName}! 👋</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/dashboard/brand')}
                className="hidden sm:flex"
              >
                Edit Profile
              </Button>
              <div className="relative flex-1 sm:flex-initial">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNotifications(true)}
                  className="relative w-full sm:w-auto"
                >
                  <Bell className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Notifications</span>
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {notifications.length}
                    </span>
                  )}
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 hidden sm:flex"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-screen-2xl">
        <Card className="mb-8" style={{
          borderColor: profile.primary_color + '40',
        }}>
          <CardHeader style={{
            background: `linear-gradient(135deg, ${profile.primary_color} 0%, ${profile.secondary_color} 100%)`,
            color: 'white',
          }}>
            <CardTitle className="text-white">About {profile.business_name}</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {profile.description && (
              <p className="text-muted-foreground mb-6">{profile.description}</p>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.contact_email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <a href={`mailto:${profile.contact_email}`} className="text-blue-600 hover:underline">
                    {profile.contact_email}
                  </a>
                </div>
              )}
              {profile.contact_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <a href={`tel:${profile.contact_phone}`} className="text-blue-600 hover:underline">
                    {profile.contact_phone}
                  </a>
                </div>
              )}
              {profile.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {profile.website}
                  </a>
                </div>
              )}
            </div>

            {(profile.social_links as any) && (
              <div className="flex gap-4 mt-6">
                {(profile.social_links as any).instagram && (
                  <a href={(profile.social_links as any).instagram} target="_blank" rel="noopener noreferrer">
                    <Instagram className="h-6 w-6 text-pink-600 hover:text-pink-700" />
                  </a>
                )}
                {(profile.social_links as any).facebook && (
                  <a href={(profile.social_links as any).facebook} target="_blank" rel="noopener noreferrer">
                    <Facebook className="h-6 w-6 text-blue-600 hover:text-blue-700" />
                  </a>
                )}
                {(profile.social_links as any).twitter && (
                  <a href={(profile.social_links as any).twitter} target="_blank" rel="noopener noreferrer">
                    <Twitter className="h-6 w-6 text-sky-600 hover:text-sky-700" />
                  </a>
                )}
                {(profile.social_links as any).linkedin && (
                  <a href={(profile.social_links as any).linkedin} target="_blank" rel="noopener noreferrer">
                    <Linkedin className="h-6 w-6 text-blue-700 hover:text-blue-800" />
                  </a>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          {stats.map((stat) => (
            <Card key={stat.title} className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <CardHeader className={`flex flex-row items-center justify-between pb-2 bg-gradient-to-br ${stat.gradient} bg-opacity-10`}>
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className={`text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                  {stat.value}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card 
            className="border-2 hover:shadow-xl transition-all duration-300 cursor-pointer group"
            onClick={() => router.push(`/${businessSlug}/services`)}
          >
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
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mx-auto mb-4 opacity-50 group-hover:opacity-100 transition-opacity">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <p className="font-medium">Manage Services</p>
                <p className="text-sm mt-1">Add and edit your business services</p>
                <p className="text-xs mt-2 text-blue-600">Click to open Services page</p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="border-2 hover:shadow-xl transition-all duration-300 cursor-pointer group"
            onClick={() => router.push(`/${businessSlug}/staff`)}
          >
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
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-600 to-amber-600 flex items-center justify-center mx-auto mb-4 opacity-50 group-hover:opacity-100 transition-opacity">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <p className="font-medium">Manage Staff</p>
                <p className="text-sm mt-1">Add and manage your team members</p>
                <p className="text-xs mt-2 text-blue-600">Click to open Staff page</p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="border-2 hover:shadow-xl transition-all duration-300 cursor-pointer group"
            onClick={() => router.push(`/${businessSlug}/appointments`)}
          >
            <CardHeader className="bg-gradient-to-r from-blue-50 via-cyan-50 to-indigo-50 dark:from-blue-950/20 dark:via-cyan-950/20 dark:to-indigo-950/20 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Upcoming Appointments</CardTitle>
                <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                  {upcomingBookings.length > 0 ? `${upcomingBookings.length} upcoming` : 'AI Scheduled'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {bookingsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              ) : upcomingBookings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center mx-auto mb-4 opacity-50 group-hover:opacity-100 transition-opacity">
                    <Calendar className="h-8 w-8 text-white" />
                  </div>
                  <p className="font-medium">No upcoming appointments</p>
                  <p className="text-sm mt-1">Bookings will appear here once scheduled</p>
                  <p className="text-xs mt-2 text-blue-600">Click to manage bookings</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingBookings.slice(0, 3).map((booking) => {
                    const startDate = new Date(booking.start_time);
                    const service = booking.business_profile_services;
                    const staff = booking.business_profile_staff;
                    const isServiceInactive = service && !service.is_active;
                    
                    return (
                      <div
                        key={booking.id}
                        className={`flex items-center justify-between p-3 rounded-lg border hover:shadow-md transition-shadow ${
                          isServiceInactive 
                            ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800' 
                            : 'bg-white dark:bg-slate-900'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: service?.color || '#3b82f6' }}
                            />
                            <p className="font-semibold">{service?.name || 'Service'}</p>
                            <Badge
                              variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {booking.status}
                            </Badge>
                            {isServiceInactive && (
                              <Badge
                                variant="outline"
                                className="text-xs border-orange-500 text-orange-700 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30"
                              >
                                Service Inactive
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{booking.client_name}</p>
                          {isServiceInactive && (
                            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1 font-medium">
                              ⚠️ This appointment was booked on a service that is now inactive
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {startDate.toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {staff && (
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {staff.full_name}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${Number(booking.amount || 0).toFixed(2)}</p>
                        </div>
                      </div>
                    );
                  })}
                  {upcomingBookings.length > 3 && (
                    <div className="text-center pt-2">
                      <p className="text-sm text-blue-600 font-medium">
                        View all {upcomingBookings.length} appointments →
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {reviews.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  New Reviews & Feedback
                </CardTitle>
                <Badge variant="secondary" className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
                  {reviews.length} new review{reviews.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reviews.map((review) => {
                  const booking = review.business_profile_bookings;
                  const service = booking?.business_profile_services;
                  const reviewDate = new Date(review.created_at);
                  
                  return (
                    <div
                      key={review.id}
                      className="p-4 rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/20"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                            <span className="font-semibold">{review.rating} / 5</span>
                            <Badge variant="outline" className="ml-2">
                              {service?.name || 'Service'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            From: {booking?.client_name || booking?.client_email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {reviewDate.toLocaleString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => dismissReview(review.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      {review.review_text && (
                        <div className="mb-3 p-3 bg-white dark:bg-gray-900 rounded-lg">
                          <p className="text-sm font-medium mb-1">Public Review:</p>
                          <p className="text-sm">{review.review_text}</p>
                        </div>
                      )}
                      {review.feedback && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <p className="text-sm font-medium mb-1 flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Private Feedback:
                          </p>
                          <p className="text-sm">{review.feedback}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Notifications</CardTitle>
              <Badge variant="secondary">
                {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No new bookings, rescheduled or cancelled appointments</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => {
                  const startDate = new Date(notification.start_time);
                  const service = notification.business_profile_services;
                  
                  return (
                    <div
                      key={notification.id}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        notification.type === 'cancelled'
                          ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                          : notification.type === 'new_booking'
                          ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                          : 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {notification.type === 'cancelled' ? (
                            <AlertCircle className="h-5 w-5 text-red-600" />
                          ) : notification.type === 'new_booking' ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <Clock className="h-5 w-5 text-yellow-600" />
                          )}
                          <Badge
                            variant={
                              notification.type === 'cancelled' 
                                ? 'destructive' 
                                : notification.type === 'new_booking'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {notification.type === 'cancelled' 
                              ? 'Cancelled' 
                              : notification.type === 'new_booking'
                              ? 'New Booking'
                              : 'Rescheduled'}
                          </Badge>
                        </div>
                        <p className="font-semibold">{service?.name || 'Service'}</p>
                        <p className="text-sm text-muted-foreground">
                          Client: {notification.client_name} ({notification.client_email})
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {notification.type === 'cancelled' 
                            ? `Cancelled on ${new Date(notification.updated_at).toLocaleDateString()}`
                            : notification.type === 'new_booking'
                            ? `Booked on ${new Date(notification.created_at).toLocaleDateString()} - ${startDate.toLocaleDateString()} at ${startDate.toLocaleTimeString()}`
                            : `Rescheduled to ${startDate.toLocaleDateString()} at ${startDate.toLocaleTimeString()}`
                          }
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/${businessSlug}/appointments?appointmentId=${notification.id}&status=${notification.status}`)}
                        >
                          View Details
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => dismissNotification(notification.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center"
                onClick={() => router.push('/dashboard/calendar')}
              >
                <Calendar className="h-6 w-6 mb-2" />
                View Calendar
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center"
                onClick={() => router.push(`/${businessSlug}/bookings`)}
              >
                <BookOpen className="h-6 w-6 mb-2" />
                Manage Bookings
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center"
                onClick={() => router.push('/dashboard/brand')}
              >
                <TrendingUp className="h-6 w-6 mb-2" />
                Edit Brand
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Notifications</DialogTitle>
                <DialogDescription>
                  Updates about bookings, appointments, and reviews
                </DialogDescription>
              </div>
              {(notifications.length > 0 || reviews.length > 0) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    dismissAllNotifications();
                    reviews.forEach(r => dismissReview(r.id));
                  }}
                >
                  Dismiss All
                </Button>
              )}
            </div>
          </DialogHeader>
          <div className="space-y-3 mt-4 max-h-[60vh] overflow-y-auto">
            {reviews.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  New Reviews & Feedback ({reviews.length})
                </h3>
                <div className="space-y-3">
                  {reviews.map((review) => {
                    const booking = review.business_profile_bookings;
                    const service = booking?.business_profile_services;
                    const reviewDate = new Date(review.created_at);
                    
                    return (
                      <div
                        key={review.id}
                        className="p-4 rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/20"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                              <span className="font-semibold">{review.rating} / 5</span>
                              <Badge variant="outline" className="ml-2">
                                {service?.name || 'Service'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                              From: {booking?.client_name || booking?.client_email}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {reviewDate.toLocaleString()}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => dismissReview(review.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        {review.review_text && (
                          <div className="mb-3 p-3 bg-white dark:bg-gray-900 rounded-lg">
                            <p className="text-sm font-medium mb-1">Public Review:</p>
                            <p className="text-sm">{review.review_text}</p>
                          </div>
                        )}
                        {review.feedback && (
                          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <p className="text-sm font-medium mb-1 flex items-center gap-2">
                              <MessageSquare className="h-4 w-4" />
                              Private Feedback:
                            </p>
                            <p className="text-sm">{review.feedback}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {notifications.length > 0 && (
              <div className={reviews.length > 0 ? 'mt-6 pt-6 border-t' : ''}>
                <h3 className="text-lg font-semibold mb-3">
                  Rescheduled & Cancelled Bookings ({notifications.length})
                </h3>
              </div>
            )}
            {notifications.length === 0 && reviews.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No new notifications</p>
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((notification) => {
                const startDate = new Date(notification.start_time);
                const service = notification.business_profile_services;
                
                return (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border ${
                      notification.type === 'cancelled'
                        ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                        : notification.type === 'new_booking'
                        ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                        : 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {notification.type === 'cancelled' ? (
                            <AlertCircle className="h-5 w-5 text-red-600" />
                          ) : notification.type === 'new_booking' ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <Clock className="h-5 w-5 text-yellow-600" />
                          )}
                          <Badge
                            variant={
                              notification.type === 'cancelled' 
                                ? 'destructive' 
                                : notification.type === 'new_booking'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {notification.type === 'cancelled' 
                              ? 'Cancelled' 
                              : notification.type === 'new_booking'
                              ? 'New Booking'
                              : 'Rescheduled'}
                          </Badge>
                        </div>
                        <p className="font-semibold mb-1">{service?.name || 'Service'}</p>
                        <p className="text-sm text-muted-foreground mb-1">
                          Client: {notification.client_name} ({notification.client_email})
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {notification.type === 'cancelled' 
                            ? `Cancelled on ${new Date(notification.updated_at).toLocaleString()}`
                            : notification.type === 'new_booking'
                            ? `Booked on ${new Date(notification.created_at).toLocaleString()} - ${startDate.toLocaleString()}`
                            : `Rescheduled to ${startDate.toLocaleString()}`
                          }
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismissNotification(notification.id)}
                        className="ml-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="mt-3 pt-3 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowNotifications(false);
                          router.push(`/${businessSlug}/appointments?appointmentId=${notification.id}&status=${notification.status}`);
                        }}
                      >
                        View in Appointments
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

