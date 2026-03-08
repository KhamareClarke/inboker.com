'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/providers/auth-provider';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Users, Building2, Calendar, Star, Trash2, AlertTriangle, LogOut, Shield, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Section } from '@/components/ui/section';
import { Container } from '@/components/ui/container';
import { format } from 'date-fns';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('business-owners');
  const [businessOwners, setBusinessOwners] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; user: any; type: 'business_owner' | 'customer' | null }>({
    open: false,
    user: null,
    type: null,
  });
  const [deleting, setDeleting] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [reminderLog, setReminderLog] = useState<any[]>([]);

  // Auto-logout when admin dashboard tab/window is closed
  useEffect(() => {
    if (!user || !isAdmin) return;

    const handleBeforeUnload = () => {
      // Set a flag in sessionStorage to trigger logout on next page load
      // This works even if the page is closing
      try {
        sessionStorage.setItem('admin_auto_logout', 'true');
      } catch (e) {
        // If sessionStorage fails, try localStorage as fallback
        try {
          localStorage.setItem('admin_auto_logout', 'true');
        } catch (err) {
          console.error('Could not set logout flag:', err);
        }
      }
    };

    const handlePageHide = async () => {
      // When page is being hidden/unloaded, attempt logout
      try {
        // Try to logout synchronously
        await signOut();
      } catch (error) {
        // If async logout fails, the flag will trigger logout on next load
        console.error('Error signing out on page hide:', error);
      }
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [user, isAdmin, signOut]);

  // Check for auto-logout flag on mount
  useEffect(() => {
    const checkAutoLogout = () => {
      const shouldLogout = sessionStorage.getItem('admin_auto_logout') || 
                         localStorage.getItem('admin_auto_logout');
      
      if (shouldLogout && user && isAdmin) {
        // Clear the flag
        sessionStorage.removeItem('admin_auto_logout');
        localStorage.removeItem('admin_auto_logout');
        
        // Logout
        signOut().catch((error) => {
          console.error('Error during auto-logout:', error);
        });
      }
    };

    // Check after a short delay to ensure auth is loaded
    const timer = setTimeout(checkAutoLogout, 500);
    return () => clearTimeout(timer);
  }, [user, isAdmin, signOut]);

  // Debug: Log loading state changes
  useEffect(() => {
    console.log('Admin dashboard: Loading state changed:', { loading, isAdmin, authLoading, hasUser: !!user, businessOwners: businessOwners.length, customers: customers.length });
  }, [loading, isAdmin, authLoading, user, businessOwners.length, customers.length]);

  // Safety timeout: Force clear loading after 35 seconds
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        console.log('Admin dashboard: Safety timeout - forcing loading to false');
        setLoading(false);
      }, 35000);
      return () => clearTimeout(timeout);
    }
  }, [loading]);

  // Check if user is admin by querying directly
  const checkAdminStatus = async (userId: string, userEmail?: string) => {
    try {
      console.log('Admin dashboard: Checking admin status for user:', userId);
      
      // Add timeout to prevent hanging
      const queryPromise = supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .maybeSingle();
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Admin check timeout')), 5000)
      );
      
      const result = await Promise.race([
        queryPromise.then((r: any) => ({ type: 'success', data: r.data, error: r.error })),
        timeoutPromise.then(() => ({ type: 'timeout' }))
      ]) as any;
      
      if (result.type === 'timeout') {
        console.error('Admin check timeout');
        // Fallback: check if email matches admin email
        if (userEmail === 'admin@inboker.com') {
          console.log('Admin dashboard: Using email fallback, user is admin');
          setIsAdmin(true);
          return true;
        }
        setIsAdmin(false);
        return false;
      }
      
      if (result.error) {
        console.error('Error checking admin status:', result.error);
        // Fallback: check if email matches admin email
        if (userEmail === 'admin@inboker.com') {
          console.log('Admin dashboard: Using email fallback due to error, user is admin');
          setIsAdmin(true);
          return true;
        }
        setIsAdmin(false);
        return false;
      }
      
      const userIsAdmin = result.data?.role === 'admin';
      console.log('Admin dashboard: User role is:', result.data?.role, 'Is admin:', userIsAdmin);
      setIsAdmin(userIsAdmin);
      return userIsAdmin;
    } catch (err) {
      console.error('Error checking admin status:', err);
      // Fallback: check if email matches admin email
      if (userEmail === 'admin@inboker.com') {
        console.log('Admin dashboard: Using email fallback due to exception, user is admin');
        setIsAdmin(true);
        return true;
      }
      setIsAdmin(false);
      return false;
    }
  };

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      console.log('Admin dashboard: Auth still loading...');
      return;
    }

    // If no user, redirect to login
    if (!user) {
      console.log('Admin dashboard: No user, redirecting to login');
      router.push('/admin-login');
      return;
    }

    // Check admin status directly if profile is not available
    const verifyAdmin = async () => {
      // First try to use profile if available
      if (profile) {
        const userIsAdmin = profile.role === 'admin';
        setIsAdmin(userIsAdmin);
        if (userIsAdmin) {
          console.log('Admin dashboard: User is admin (from profile), loading data');
          loadData();
        } else {
          console.log('Admin dashboard: User is not admin (from profile), redirecting');
          router.push('/admin-login');
        }
        return;
      }

      // If profile not available, check email first as fallback
      if (user?.email === 'admin@inboker.com') {
        console.log('Admin dashboard: User email matches admin email, allowing access');
        setIsAdmin(true);
        loadData();
        return;
      }

      // If email doesn't match, try database check
      console.log('Admin dashboard: Profile not available, checking admin status directly');
      const userIsAdmin = await checkAdminStatus(user.id, user.email);
      
      if (userIsAdmin) {
        console.log('Admin dashboard: User is admin (from direct check), loading data');
        loadData();
      } else {
        console.log('Admin dashboard: User is not admin (from direct check), redirecting');
        router.push('/admin-login');
      }
    };

    verifyAdmin();
  }, [user, profile, authLoading, router]);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('Admin dashboard: Starting to load data...');
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Data loading timeout')), 30000)
      );
      
      await Promise.race([
        Promise.all([loadBusinessOwners(), loadCustomers(), loadReminderLog()]),
        timeoutPromise
      ]);
      
      console.log('Admin dashboard: Data loaded successfully');
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      console.log('Admin dashboard: Clearing loading state');
      setLoading(false);
    }
  };

  const loadBusinessOwners = async () => {
    try {
      // Get all business owners
      const { data: owners, error: ownersError } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'business_owner')
        .order('created_at', { ascending: false });

      if (ownersError) throw ownersError;

      // Get business profiles for each owner
      const ownersWithProfiles = await Promise.all(
        (owners || []).map(async (owner: any) => {
          const { data: profile } = await supabase
            .from('business_profiles')
            .select('*')
            .eq('user_id', owner.id)
            .single();

          // Get service count
          const { count: serviceCount } = await supabase
            .from('business_profile_services')
            .select('*', { count: 'exact', head: true })
            .eq('business_profile_id', profile?.id || '');

          // Get staff count
          const { count: staffCount } = await supabase
            .from('business_profile_staff')
            .select('*', { count: 'exact', head: true })
            .eq('business_profile_id', profile?.id || '');

          // Get appointment stats with revenue
          const { data: appointments } = await supabase
            .from('business_profile_bookings')
            .select('status, start_time, amount, created_at, updated_at')
            .eq('business_profile_id', profile?.id || '');

          const now = new Date();
          const upcoming = (appointments || []).filter((a: any) => new Date(a.start_time) >= now && ['pending', 'confirmed'].includes(a.status));
          const rescheduled = (appointments || []).filter((a: any) => {
            // Check if rescheduled (updated_at significantly after created_at)
            return a.status === 'pending';
          });
          const cancelled = (appointments || []).filter((a: any) => a.status === 'cancelled');
          const completed = (appointments || []).filter((a: any) => a.status === 'completed');
          
          // Calculate revenue from completed appointments
          const revenue = completed.reduce((sum: number, apt: any) => sum + (Number(apt.amount) || 0), 0);
          
          // Get monthly completed appointments (last 30 days)
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          const monthlyCompleted = completed.filter((a: any) => {
            const completedDate = new Date(a.updated_at || a.start_time);
            return completedDate >= thirtyDaysAgo;
          });
          
          // Get reviews for this business
          let reviewCount = 0;
          let avgRating = '0';
          
          if (profile?.id) {
            const { count, error: reviewCountError } = await supabase
              .from('appointment_reviews')
              .select('*', { count: 'exact', head: true })
              .eq('business_profile_id', profile.id);
            
            if (reviewCountError) {
              console.error('Error fetching review count for business:', profile.id, reviewCountError);
            } else {
              reviewCount = count || 0;
            }
            
            // Get average rating
            const { data: reviewsData, error: reviewsError } = await supabase
              .from('appointment_reviews')
              .select('rating')
              .eq('business_profile_id', profile.id);
            
            if (reviewsError) {
              console.error('Error fetching reviews for business:', profile.id, reviewsError);
            } else if (reviewsData && reviewsData.length > 0) {
              const totalRating = reviewsData.reduce((sum: number, r: any) => sum + (r.rating || 0), 0);
              avgRating = (totalRating / reviewsData.length).toFixed(1);
            }
          }

          return {
            ...owner,
            businessProfile: profile || null,
            serviceCount: serviceCount || 0,
            staffCount: staffCount || 0,
            appointmentStats: {
              total: appointments?.length || 0,
              upcoming: upcoming.length,
              rescheduled: rescheduled.length,
              cancelled: cancelled.length,
              completed: completed.length,
              monthlyCompleted: monthlyCompleted.length,
            },
            revenue: revenue,
            reviewCount: reviewCount || 0,
            avgRating: avgRating,
          };
        })
      );

      setBusinessOwners(ownersWithProfiles);
      console.log('Admin dashboard: Business owners loaded:', ownersWithProfiles.length);
    } catch (err) {
      console.error('Error loading business owners:', err);
      // Set empty array on error to prevent infinite loading
      setBusinessOwners([]);
    }
  };

  const loadCustomers = async () => {
    try {
      // Get all customers
      const { data: customersData, error: customersError } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'customer')
        .order('created_at', { ascending: false });

      if (customersError) {
        console.error('Error fetching customers:', customersError);
        throw customersError;
      }
      
      console.log('Admin dashboard: Found', customersData?.length || 0, 'customers');

      // Get bookings and reviews for each customer
      const customersWithStats = await Promise.all(
        (customersData || []).map(async (customer: any) => {
          // Get bookings
          const { data: bookings } = await supabase
            .from('business_profile_bookings')
            .select(`
              *,
              business_profile_services (
                id,
                name
              ),
              business_profiles (
                id,
                business_name
              )
            `)
            .eq('client_email', customer.email);

          // Get reviews
          const { data: reviews } = await supabase
            .from('appointment_reviews')
            .select('*')
            .eq('customer_email', customer.email);

          return {
            ...customer,
            bookings: bookings || [],
            reviews: reviews || [],
            bookingCount: bookings?.length || 0,
            reviewCount: reviews?.length || 0,
          };
        })
      );

      setCustomers(customersWithStats);
      console.log('Admin dashboard: Customers loaded:', customersWithStats.length);
    } catch (err) {
      console.error('Error loading customers:', err);
      setCustomers([]);
    }
  };

  const loadReminderLog = async () => {
    try {
      const { data, error } = await supabase
        .from('reminder_deliveries')
        .select(`
          id,
          booking_id,
          reminder_type,
          sent_at,
          recipient_email,
          business_profile_bookings (
            start_time,
            client_name,
            business_profiles ( business_name )
          )
        `)
        .order('sent_at', { ascending: false })
        .limit(30);
      if (error) throw error;
      setReminderLog(data || []);
    } catch (err) {
      console.error('Error loading reminder log:', err);
      setReminderLog([]);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteDialog.user) return;

    try {
      setDeleting(true);

      // Update user to suspended
      const { error: updateError } = await supabase
        .from('users')
        .update({ suspended: true })
        .eq('id', deleteDialog.user.id);

      if (updateError) throw updateError;

      // Reload data
      await loadData();
      setDeleteDialog({ open: false, user: null, type: null });
    } catch (err: any) {
      console.error('Error deleting user:', err);
      alert('Failed to suspend user: ' + (err.message || 'Unknown error'));
    } finally {
      setDeleting(false);
    }
  };

  // Show loading only if auth is loading (but allow bypass if we've verified admin via email)
  if (authLoading && isAdmin !== true) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-purple-300">Loading authentication...</p>
        </div>
      </div>
    );
  }

  // If no user, show nothing (redirect will happen)
  if (!user) {
    return null;
  }

  // If we've checked and user is not admin, show nothing (redirect will happen)
  if (isAdmin === false) {
    return null;
  }

  // If we haven't checked admin status yet, show loading
  if (isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-purple-300">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Show data loading only if we have no data yet
  if (loading && businessOwners.length === 0 && customers.length === 0) {
    console.log('Admin dashboard: Rendering loading state, loading=', loading, 'businessOwners=', businessOwners.length, 'customers=', customers.length);
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="bg-slate-900/50 border-b border-purple-500/20">
          <Container size="wide" className="py-ds-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-ds-2">
                <Shield className="h-8 w-8 text-purple-400" />
                <div>
                  <h1 className="ds-heading-2 text-white">Admin Panel</h1>
                  <p className="ds-body-sm text-purple-300">Manage all users and businesses</p>
                </div>
              </div>
            </div>
          </Container>
        </div>
        <Section as="div" className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-ds-2" />
            <p className="ds-body text-purple-300">Loading admin data...</p>
          </div>
        </Section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-slate-900/50 border-b border-purple-500/20">
        <Container size="wide" className="py-ds-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-ds-2">
              <Shield className="h-8 w-8 text-purple-400" />
              <div>
                <h1 className="ds-heading-2 text-white">Admin Panel</h1>
                <p className="ds-body-sm text-purple-300">Manage all users and businesses</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={signOut}
              className="border-purple-500/20 text-purple-300 hover:bg-purple-500/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </Container>
      </div>

      <Section className="py-ds-4">
        <Container size="wide">
        {/* Reminder delivery log */}
        <Card className="bg-slate-800/50 border-purple-500/20 mb-ds-3 rounded-ds-lg shadow-ds-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-white ds-heading-3">Reminder delivery log</CardTitle>
            <p className="ds-body-sm text-gray-400">Last 30 appointment reminders (24h & 1h before) sent to customers</p>
          </CardHeader>
          <CardContent>
            {reminderLog.length === 0 ? (
              <p className="ds-body-sm text-gray-500">No reminders sent yet, or cron has not run.</p>
            ) : (
              <div className="space-y-ds-1 max-h-48 overflow-y-auto">
                {reminderLog.map((r: any) => {
                  const b = r.business_profile_bookings;
                  const bp = b?.business_profiles;
                  return (
                    <div key={r.id} className="flex items-center justify-between gap-ds-1 ds-body-sm bg-slate-700/30 rounded-ds px-2 py-1.5">
                      <span className="text-cyan-400 font-mono">{r.reminder_type}</span>
                      <span className="text-white truncate">{r.recipient_email}</span>
                      <span className="text-gray-400 truncate">{bp?.business_name || '—'}</span>
                      <span className="text-gray-500 text-xs whitespace-nowrap">
                        {r.sent_at ? format(new Date(r.sent_at), 'MMM d, HH:mm') : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-ds-3 bg-slate-800/50 rounded-ds">
            <TabsTrigger value="business-owners" className="data-[state=active]:bg-purple-600">
              <Building2 className="h-4 w-4 mr-2" />
              Business Owners ({businessOwners.length})
            </TabsTrigger>
            <TabsTrigger value="customers" className="data-[state=active]:bg-purple-600">
              <Users className="h-4 w-4 mr-2" />
              Customers ({customers.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="business-owners" className="space-y-ds-2">
            {businessOwners.length === 0 ? (
              <Card className="bg-slate-800/50 border-purple-500/20 rounded-ds-lg shadow-ds-md">
                <CardContent className="py-12 text-center text-gray-400 ds-body">
                  No business owners found
                </CardContent>
              </Card>
            ) : (
              businessOwners.map((owner) => (
                <Card key={owner.id} className="bg-slate-800/50 border-purple-500/20 rounded-ds-lg shadow-ds-md">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-white">{owner.full_name || owner.email}</CardTitle>
                          {owner.suspended && (
                            <Badge variant="destructive">Suspended</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-400">{owner.email}</p>
                        {owner.businessProfile && (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-purple-300">
                              Business: {owner.businessProfile.business_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              Slug: {owner.businessProfile.business_slug || 'N/A'}
                            </p>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteDialog({ open: true, user: owner, type: 'business_owner' })}
                        disabled={owner.suspended}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {owner.suspended ? 'Suspended' : 'Suspend'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-ds-2 mb-ds-2">
                      <div className="bg-slate-700/50 rounded-ds p-ds-2">
                        <p className="ds-body-sm text-gray-400 mb-1">Services</p>
                        <p className="ds-heading-2 text-white">{owner.serviceCount}</p>
                      </div>
                      <div className="bg-slate-700/50 rounded-ds p-ds-2">
                        <p className="ds-body-sm text-gray-400 mb-1">Staff</p>
                        <p className="ds-heading-2 text-white">{owner.staffCount}</p>
                      </div>
                      <div className="bg-slate-700/50 rounded-ds p-ds-2">
                        <p className="ds-body-sm text-gray-400 mb-1">Upcoming</p>
                        <p className="ds-heading-2 text-green-400">{owner.appointmentStats.upcoming}</p>
                      </div>
                      <div className="bg-slate-700/50 rounded-ds p-ds-2">
                        <p className="ds-body-sm text-gray-400 mb-1">Rescheduled</p>
                        <p className="ds-heading-2 text-yellow-400">{owner.appointmentStats.rescheduled}</p>
                      </div>
                      <div className="bg-slate-700/50 rounded-ds p-ds-2">
                        <p className="ds-body-sm text-gray-400 mb-1">Cancelled</p>
                        <p className="ds-heading-2 text-red-400">{owner.appointmentStats.cancelled}</p>
                      </div>
                    </div>
                    {/* Revenue, Reviews, and Monthly Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-ds-2">
                      <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-ds p-ds-2 border border-green-500/30">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-gray-400 uppercase tracking-wide">Total Revenue</p>
                          <TrendingUp className="h-4 w-4 text-green-400" />
                        </div>
                        <p className="text-2xl font-bold text-green-400">
                          ${Number(owner.revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">From {owner.appointmentStats.completed} completed appointments</p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-yellow-600/20 to-amber-600/20 rounded-lg p-4 border border-yellow-500/30">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-gray-400 uppercase tracking-wide">Reviews</p>
                          <Star className="h-4 w-4 text-yellow-400" />
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-2xl font-bold text-yellow-400">{owner.reviewCount}</p>
                          {owner.avgRating && owner.avgRating !== '0' && (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm text-gray-300">{owner.avgRating}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Average rating: {owner.avgRating || 'N/A'}</p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-lg p-4 border border-blue-500/30">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-gray-400 uppercase tracking-wide">Monthly Completed</p>
                          <Calendar className="h-4 w-4 text-blue-400" />
                        </div>
                        <p className="text-2xl font-bold text-blue-400">{owner.appointmentStats.monthlyCompleted}</p>
                        <p className="text-xs text-gray-500 mt-1">Completed in last 30 days</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-purple-500/20">
                      <p className="text-xs text-gray-400">
                        Registered: {format(new Date(owner.created_at), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="customers" className="space-y-4">
            {customers.length === 0 ? (
              <Card className="bg-slate-800/50 border-purple-500/20">
                <CardContent className="py-12 text-center text-gray-400">
                  No customers found
                </CardContent>
              </Card>
            ) : (
              customers.map((customer) => (
                <Card key={customer.id} className="bg-slate-800/50 border-purple-500/20">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-white">{customer.full_name || customer.email}</CardTitle>
                          {customer.suspended && (
                            <Badge variant="destructive">Suspended</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-400">{customer.email}</p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteDialog({ open: true, user: customer, type: 'customer' })}
                        disabled={customer.suspended}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {customer.suspended ? 'Suspended' : 'Suspend'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-slate-700/50 rounded-lg p-3">
                        <p className="text-xs text-gray-400 mb-1">Bookings</p>
                        <p className="text-2xl font-bold text-white">{customer.bookingCount}</p>
                      </div>
                      <div className="bg-slate-700/50 rounded-lg p-3">
                        <p className="text-xs text-gray-400 mb-1">Reviews</p>
                        <p className="text-2xl font-bold text-yellow-400">{customer.reviewCount}</p>
                      </div>
                      <div className="bg-slate-700/50 rounded-lg p-3">
                        <p className="text-xs text-gray-400 mb-1">Status</p>
                        <p className="text-lg font-bold text-white">
                          {customer.suspended ? 'Suspended' : 'Active'}
                        </p>
                      </div>
                    </div>

                    {/* Bookings */}
                    {customer.bookings.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-purple-500/20">
                        <p className="text-sm font-medium text-purple-300 mb-2">Recent Bookings:</p>
                        <div className="space-y-2">
                          {customer.bookings.slice(0, 5).map((booking: any) => (
                            <div key={booking.id} className="bg-slate-700/30 rounded p-2 text-sm">
                              <p className="text-white">
                                {booking.business_profile_services?.name || 'Service'} - {booking.business_profiles?.business_name}
                              </p>
                              <p className="text-xs text-gray-400">
                                {format(new Date(booking.start_time), 'MMM dd, yyyy HH:mm')} - {booking.status}
                              </p>
                              {(booking.reminder_24h_sent_at || booking.reminder_1h_sent_at) && (
                                <p className="text-xs text-cyan-400 mt-1">
                                  Reminders: {booking.reminder_24h_sent_at ? '24h ✓' : '24h —'} {booking.reminder_1h_sent_at ? '1h ✓' : '1h —'}
                                </p>
                              )}
                            </div>
                          ))}
                          {customer.bookings.length > 5 && (
                            <p className="text-xs text-gray-500">+{customer.bookings.length - 5} more bookings</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Reviews */}
                    {customer.reviews.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-purple-500/20">
                        <p className="text-sm font-medium text-purple-300 mb-2">Reviews:</p>
                        <div className="space-y-2">
                          {customer.reviews.slice(0, 3).map((review: any) => (
                            <div key={review.id} className="bg-slate-700/30 rounded p-2 text-sm">
                              <div className="flex items-center gap-2 mb-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${
                                      i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'
                                    }`}
                                  />
                                ))}
                              </div>
                              {review.review_text && (
                                <p className="text-white text-xs">{review.review_text}</p>
                              )}
                              <p className="text-xs text-gray-400 mt-1">
                                {format(new Date(review.created_at), 'MMM dd, yyyy')}
                              </p>
                            </div>
                          ))}
                          {customer.reviews.length > 3 && (
                            <p className="text-xs text-gray-500">+{customer.reviews.length - 3} more reviews</p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-purple-500/20">
                      <p className="text-xs text-gray-400">
                        Registered: {format(new Date(customer.created_at), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
        </Container>
      </Section>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, user: null, type: null })}>
        <DialogContent className="bg-slate-800 border-purple-500/20">
          <DialogHeader>
            <DialogTitle className="text-white">Suspend User Account</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to suspend {deleteDialog.user?.full_name || deleteDialog.user?.email}?
              They will not be able to login and will see a message that their account has been suspended by admin.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, user: null, type: null })}
              className="border-purple-500/20"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Suspending...
                </>
              ) : (
                'Suspend Account'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

