'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Calendar, BookOpen, Clock, User, Star, CheckCircle2, DollarSign, Loader2, MapPin, ExternalLink, Bell, X, AlertCircle, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/providers/auth-provider';
import { supabase } from '@/lib/supabase';
import type { BusinessProfile, BusinessProfileService } from '@/lib/types';

// Utility function to generate slug from service name
function generateServiceSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export default function CustomerDashboardPage() {
  const { profile, user, signOut, loading: authLoading } = useAuth();
  const router = useRouter();
  const userName = profile?.full_name || user?.email || 'User';
  const [services, setServices] = useState<(BusinessProfileService & { business_profile: BusinessProfile })[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [favoriteBookings, setFavoriteBookings] = useState<string[]>([]); // Array of booking IDs
  const [favoriteServices, setFavoriteServices] = useState<string[]>([]); // Array of service IDs
  const [loading, setLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [favoritesLoading, setFavoritesLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [dismissedNotifications, setDismissedNotifications] = useState<Set<string>>(new Set());
  const [servicesError, setServicesError] = useState<string | null>(null);

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      console.log('Auth still loading...');
      return;
    }

    if (user) {
      console.log('User authenticated:', user.email);
      // Add a small delay to ensure auth state is fully set
      const timer = setTimeout(() => {
        console.log('Starting data load...');
        loadAllServices();
        loadCustomerBookings();
        loadFavorites();
        loadNotifications();
      }, 100);
      
      // Safety timeout - ensure loading states are cleared after 20 seconds
      const safetyTimer = setTimeout(() => {
        console.warn('Safety timeout: Force clearing loading states after 20 seconds');
        if (loading) {
          setLoading(false);
        }
        if (bookingsLoading) {
          setBookingsLoading(false);
        }
        if (favoritesLoading) {
          setFavoritesLoading(false);
        }
      }, 20000);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(safetyTimer);
      };
    } else {
      console.log('User not authenticated');
      setLoading(false);
      setBookingsLoading(false);
      setFavoritesLoading(false);
    }
  }, [user, authLoading]);

  // Reload bookings when page gains focus (e.g., after returning from booking page)
  useEffect(() => {
    const handleFocus = () => {
      if (user?.email) {
        console.log('Page focused, reloading bookings...');
        loadCustomerBookings();
        loadNotifications();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user]);

  // Auto-refresh bookings every 15 seconds to catch business owner updates
  useEffect(() => {
    if (!user?.email) return;
    
    const interval = setInterval(() => {
      console.log('Auto-refreshing bookings...');
      loadCustomerBookings();
      loadFavorites(); // Also refresh favorites
    }, 15000); // Refresh every 15 seconds
    
    return () => clearInterval(interval);
  }, [user]);

  // Refresh notifications every 15 seconds
  useEffect(() => {
    if (!user?.email) return;
    
    const interval = setInterval(() => {
      loadNotifications();
    }, 15000);
    
    return () => clearInterval(interval);
  }, [user]);

  const loadAllServices = async () => {
    try {
      setLoading(true);
      setServicesError(null);
      
      // Verify Supabase is configured
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl) {
        console.error('Supabase URL is not configured');
        setServices([]);
        setLoading(false);
        setServicesError('Configuration error: Supabase URL is missing.');
        return;
      }
      
      // Check if user is authenticated with timeout
      let session: any = null;
      try {
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 5000)
        );
        
        const result = await Promise.race([
          sessionPromise.then((r: any) => ({ type: 'success', data: r.data })),
          timeoutPromise.then(() => ({ type: 'timeout' }))
        ]) as any;

        if (result.type === 'timeout') {
          console.error('Session check timeout - this might indicate a network issue');
          setServices([]);
          setLoading(false);
          setServicesError('Connection timeout: Unable to reach the server. Please check your internet connection.');
          return;
        }
        
        session = result.data?.session;
      } catch (err: any) {
        console.error('Error checking session:', err);
        setServices([]);
        setLoading(false);
        if (err.message && err.message.includes('Failed to fetch')) {
          setServicesError('Network error: Cannot connect to Supabase. Please check your internet connection.');
        } else {
          setServicesError('Error checking authentication: ' + (err.message || 'Unknown error'));
        }
        return;
      }
      
      if (!session) {
        console.error('No active session found');
        setServices([]);
        setLoading(false);
        setServicesError('No active session. Please log in again.');
        return;
      }
      console.log('Session found, user:', session.user.email);
      
      // Load services with timeout
      let servicesData: any = null;
      let servicesError: any = null;
      
      try {
        console.log('Querying business_profile_services...');
        
        // Try the full query directly with timeout
        let queryResult: any;
        try {
          const queryPromise = supabase
            .from('business_profile_services')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 10000)
          );

          const result = await Promise.race([
            queryPromise.then((r: any) => ({ type: 'success', data: r.data, error: r.error })),
            timeoutPromise.then(() => ({ type: 'timeout' }))
          ]) as any;

          if (result.type === 'timeout') {
            throw new Error('Query timeout');
          }
          
          queryResult = result;
        } catch (networkErr: any) {
          console.error('Network error during services query:', networkErr);
          setServices([]);
          setLoading(false);
          if (networkErr.message && networkErr.message.includes('Failed to fetch')) {
            setServicesError('Network error: Cannot connect to Supabase. Please check your internet connection and Supabase configuration.');
          } else {
            setServicesError('Network error: Cannot connect to the server. Please check your internet connection and try refreshing the page.');
          }
          return;
        }
        
        servicesData = queryResult.data;
        servicesError = queryResult.error;
      } catch (err: any) {
        console.error('Services query error:', err);
        servicesError = err;
      }

      if (servicesError) {
        console.error('Error loading services:', servicesError);
        console.error('Error details:', JSON.stringify(servicesError, null, 2));
        setServices([]);
        setLoading(false);
        setServicesError('Error loading services: ' + (servicesError.message || 'Unknown error. Check console for details.'));
        return;
      }

      if (!servicesData || servicesData.length === 0) {
        console.log('No services found in database');
        setServices([]);
        setLoading(false);
        return;
      }

      console.log('Loaded services from database:', servicesData.length);
      console.log('Services data:', servicesData);

      // Now load business profiles for each service
      const businessProfileIds = Array.from(new Set(servicesData.map((s: any) => s.business_profile_id)));
      
      if (businessProfileIds.length === 0) {
        setServices([]);
        setLoading(false);
        return;
      }

      let profilesData: any = null;
      let profilesError: any = null;

      try {
        const queryPromise = supabase
          .from('business_profiles')
          .select('*')
          .in('id', businessProfileIds);

        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 10000)
        );

        const result = await Promise.race([
          queryPromise.then((r: any) => ({ type: 'success', data: r.data, error: r.error })),
          timeoutPromise.then(() => ({ type: 'timeout' }))
        ]) as any;

        if (result.type === 'timeout') {
          throw new Error('Query timeout');
        }
        
        profilesData = result.data;
        profilesError = result.error;
      } catch (err: any) {
        console.error('Profiles query error:', err);
        profilesError = err;
      }

      if (profilesError) {
        console.error('Error loading business profiles:', profilesError);
        console.error('Profiles error details:', JSON.stringify(profilesError, null, 2));
        // Still show services even if profiles fail
        profilesData = [];
      } else {
        console.log('Loaded business profiles:', profilesData?.length || 0);
      }

      // Combine services with their business profiles
      const servicesWithProfiles = servicesData.map((service: any) => {
        const profile = profilesData?.find((p: any) => p.id === service.business_profile_id);
        return {
          ...service,
          business_profile: profile || null
        };
      });

      // Only filter out services without profiles if we have profile data
      const validServices = profilesData && profilesData.length > 0
        ? servicesWithProfiles.filter((s: any) => s.business_profile !== null)
        : servicesWithProfiles;

      console.log('Valid services with profiles:', validServices.length);
      setServices(validServices as any);
      setServicesError(null);
    } catch (err: any) {
      console.error('Error loading services:', err);
      console.error('Error details:', err.message || err);
      setServices([]);
      // Show user-friendly error
      if (err.message && err.message.includes('timeout')) {
        setServicesError('Request timed out. This might be a network or database issue. Please try again.');
      } else {
        setServicesError('Error loading services: ' + (err.message || 'Unknown error'));
      }
    } finally {
      setLoading(false);
      console.log('loadAllServices completed, loading set to false');
    }
  };

  const loadCustomerBookings = async () => {
    if (!user?.email) {
      console.log('No user email, skipping bookings load');
      setBookingsLoading(false);
      setBookings([]);
      return;
    }

    // Set a maximum timeout to force clear loading state
    let maxTimeout: NodeJS.Timeout | null = null;
    
    try {
      setBookingsLoading(true);
      console.log('Loading customer bookings for:', user.email);
      
      // Set timeout to force clear loading after 15 seconds
      maxTimeout = setTimeout(() => {
        console.warn('Force clearing bookings loading after 15 seconds');
        setBookingsLoading(false);
        setBookings(prev => {
          if (prev.length === 0) {
            return [];
          }
          return prev;
        });
      }, 15000);
      
      // Load bookings with timeout
      let data: any = null;
      let error: any = null;

      try {
        const queryPromise = supabase
          .from('business_profile_bookings')
          .select(`
            *,
            business_profile_services (
              id,
              name,
              color,
              is_active
            ),
            business_profiles (
              id,
              business_name,
              logo_url,
              business_slug
            )
          `)
          .eq('client_email', user.email)
          .order('start_time', { ascending: false });

        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 10000)
        );

        const result = await Promise.race([
          queryPromise.then((r: any) => {
            console.log('Bookings query completed:', { 
              count: r.data?.length || 0, 
              error: r.error,
              errorCode: r.error?.code,
              errorMessage: r.error?.message,
              userEmail: user.email
            });
            if (r.error) {
              console.error('RLS Policy Error Details:', {
                code: r.error.code,
                message: r.error.message,
                details: r.error.details,
                hint: r.error.hint
              });
            }
            return { type: 'success', data: r.data, error: r.error };
          }),
          timeoutPromise.then(() => ({ type: 'timeout' }))
        ]) as any;

        if (result.type === 'timeout') {
          console.error('Bookings query timeout');
          throw new Error('Query timeout');
        }
        
        data = result.data;
        error = result.error;
      } catch (err: any) {
        console.error('Bookings query error:', err);
        if (err.message === 'Timeout' || err.message === 'Query timeout') {
          error = { message: 'Request timeout - please check your connection' };
        } else {
          error = err;
        }
      }

      // Clear the max timeout since we got a result
      if (maxTimeout) {
        clearTimeout(maxTimeout);
      }

      if (error) {
        console.error('Error loading bookings:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        
        // Check if it's an RLS policy error
        if (error.code === '42501' || error.message?.includes('permission denied') || error.message?.includes('policy')) {
          console.error('RLS Policy Error: Customer may not have permission to view bookings');
          console.error('Please ensure the migration 20251024000011_allow_customers_view_own_bookings.sql has been applied');
          alert('Permission error: Please contact support. Error: ' + error.message);
        }
        
        // Set empty array and clear loading even on error
        setBookings([]);
        setBookingsLoading(false);
      } else {
        console.log('Successfully loaded bookings:', data?.length || 0);
        if (data && data.length > 0) {
          console.log('Sample booking:', data[0]);
        }
        setBookings(data || []);
        setBookingsLoading(false);
        // Load notifications after bookings are loaded
        loadNotifications();
      }
    } catch (err) {
      console.error('Error loading customer bookings:', err);
      setBookings([]);
      setBookingsLoading(false);
    } finally {
      // Always clear loading state as a safety measure
      if (maxTimeout) {
        clearTimeout(maxTimeout);
      }
      console.log('Clearing bookings loading state in finally');
      setBookingsLoading(false);
    }
  };

  // Check if customer has an active booking for a service
  const hasActiveBooking = (serviceId: string): boolean => {
    if (!user?.email) return false;
    return bookings.some(
      booking => 
        booking.service_id === serviceId && 
        booking.client_email === user.email &&
        (booking.status === 'pending' || booking.status === 'confirmed')
    );
  };

  // Get active booking for a service
  const getActiveBooking = (serviceId: string) => {
    if (!user?.email) return null;
    return bookings.find(
      booking => 
        booking.service_id === serviceId && 
        booking.client_email === user.email &&
        (booking.status === 'pending' || booking.status === 'confirmed')
    );
  };

  const handleBookService = (service: BusinessProfileService & { business_profile: BusinessProfile }) => {
    // Check if customer already has an active booking for this service
    if (hasActiveBooking(service.id)) {
      const activeBooking = getActiveBooking(service.id);
      if (activeBooking) {
        const bookingDate = new Date(activeBooking.start_time);
        alert(
          `You already have an active booking for this service.\n\n` +
          `Status: ${activeBooking.status}\n` +
          `Scheduled: ${bookingDate.toLocaleDateString()} at ${bookingDate.toLocaleTimeString()}\n\n` +
          `Please cancel your existing booking first if you want to book again.`
        );
        return;
      }
    }
    
    const serviceSlug = generateServiceSlug(service.name);
    router.push(`/booking/${serviceSlug}`);
  };

  const loadNotifications = async () => {
    if (!user?.email) {
      return;
    }

    try {
      // Get bookings that were updated by business owner in the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data, error } = await supabase
        .from('business_profile_bookings')
        .select(`
          *,
          business_profile_services (
            id,
            name,
            color
          ),
          business_profiles (
            id,
            business_name,
            logo_url,
            business_slug
          )
        `)
        .eq('client_email', user.email)
        .gte('updated_at', sevenDaysAgo.toISOString())
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error loading notifications:', error);
        return;
      }

      // Filter for appointments that were changed by business owner (not by customer)
      // If status changed to confirmed, completed, or cancelled, and updated_at is recent
      const allBookings = data || [];
      const notificationBookings = allBookings
        .filter((b: any) => {
          const updatedAt = new Date(b.updated_at);
          const createdAt = new Date(b.created_at);
          // If updated_at is significantly after created_at, it was likely changed by business owner
          // OR if status is cancelled and updated recently, it's likely cancelled by business owner
          const wasChangedByBusiness = updatedAt.getTime() - createdAt.getTime() > 60000;
          
          // Check if status is confirmed, completed, or cancelled (business owner actions)
          const isBusinessAction = b.status === 'confirmed' || b.status === 'completed' || b.status === 'cancelled';
          
          // For cancelled appointments, show if updated recently (likely by business owner)
          // For confirmed/completed, require that it was changed significantly after creation
          if (b.status === 'cancelled') {
            // Show cancelled appointments if updated in last 7 days (likely by business owner)
            return isBusinessAction && updatedAt > sevenDaysAgo;
          }
          
          return wasChangedByBusiness && isBusinessAction && updatedAt > sevenDaysAgo;
        })
        .map((b: any) => ({
          ...b,
          type: b.status === 'confirmed' ? 'confirmed' : b.status === 'completed' ? 'completed' : 'cancelled'
        }))
        .filter((n: any) => !dismissedNotifications.has(n.id));
      
      // Check which completed appointments don't have reviews yet
      const completedBookings = notificationBookings.filter((n: any) => n.type === 'completed');
      if (completedBookings.length > 0) {
        const bookingIds = completedBookings.map((b: any) => b.id);
        const { data: reviewsData } = await supabase
          .from('appointment_reviews')
          .select('booking_id')
          .in('booking_id', bookingIds);
        
        const reviewedBookingIds = new Set((reviewsData || []).map((r: any) => r.booking_id));
        // Mark which notifications need reviews
        notificationBookings.forEach((n: any) => {
          if (n.type === 'completed' && !reviewedBookingIds.has(n.id)) {
            n.needsReview = true;
          }
        });
      }
      
      setNotifications(notificationBookings);
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

  const loadFavorites = async () => {
    if (!user?.id) {
      console.log('No user ID, skipping favorites load');
      setFavoritesLoading(false);
      return;
    }

    try {
      setFavoritesLoading(true);
      console.log('Loading favorites for user:', user.id);
      
      const queryPromise = supabase
        .from('customer_favorites')
        .select('booking_id, service_id')
        .eq('user_id', user.id);

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 10000)
      );

      const result = await Promise.race([
        queryPromise.then((r: any) => ({ type: 'success', data: r.data, error: r.error })),
        timeoutPromise.then(() => ({ type: 'timeout' }))
      ]) as any;

      if (result.type === 'timeout') {
        console.error('Favorites query timeout');
        setFavoriteBookings([]);
        setFavoriteServices([]);
      } else if (result.error) {
        console.error('Error loading favorites:', result.error);
        setFavoriteBookings([]);
        setFavoriteServices([]);
      } else {
        console.log('Successfully loaded favorites:', result.data?.length || 0);
        setFavoriteBookings((result.data || []).filter((f: any) => f.booking_id).map((f: any) => f.booking_id));
        setFavoriteServices((result.data || []).filter((f: any) => f.service_id).map((f: any) => f.service_id));
      }
    } catch (err) {
      console.error('Error loading favorites:', err);
      setFavoriteBookings([]);
      setFavoriteServices([]);
    } finally {
      console.log('Clearing favorites loading state');
      setFavoritesLoading(false);
    }
  };

  const toggleFavoriteBooking = async (bookingId: string) => {
    if (!user?.id) return;

    const isFavorite = favoriteBookings.includes(bookingId);

    try {
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('customer_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('booking_id', bookingId);

        if (error) {
          console.error('Delete favorite error:', error);
          throw error;
        }
        setFavoriteBookings(favoriteBookings.filter(id => id !== bookingId));
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('customer_favorites')
          .insert({
            user_id: user.id,
            booking_id: bookingId,
            service_id: null
          });

        if (error) {
          // If it's a duplicate, just refresh favorites instead of showing error
          if (error.code === '23505' || error.message?.includes('duplicate key')) {
            console.log('Already favorited, refreshing state...');
            await loadFavorites();
            return;
          }
          console.error('Insert favorite error:', error);
          throw error;
        }
        setFavoriteBookings([...favoriteBookings, bookingId]);
      }
    } catch (err: any) {
      console.error('Error toggling favorite booking:', err);
      console.error('Error details:', JSON.stringify(err, null, 2));
      const errorMsg = err?.message || err?.error?.message || 'Unknown error';
      if (errorMsg.includes('relation') && errorMsg.includes('does not exist')) {
        alert('Favorites feature not set up yet. Please run the database migration.');
      } else if (errorMsg.includes('duplicate key')) {
        // Already favorited, just refresh
        await loadFavorites();
      } else {
        alert('Failed to update favorite: ' + errorMsg);
      }
    }
  };

  const toggleFavoriteService = async (serviceId: string) => {
    if (!user?.id) return;

    const isFavorite = favoriteServices.includes(serviceId);

    try {
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('customer_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('service_id', serviceId);

        if (error) {
          console.error('Delete favorite error:', error);
          throw error;
        }
        setFavoriteServices(favoriteServices.filter(id => id !== serviceId));
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('customer_favorites')
          .insert({
            user_id: user.id,
            service_id: serviceId,
            booking_id: null
          });

        if (error) {
          // If it's a duplicate, just refresh favorites instead of showing error
          if (error.code === '23505' || error.message?.includes('duplicate key')) {
            console.log('Already favorited, refreshing state...');
            await loadFavorites();
            return;
          }
          console.error('Insert favorite error:', error);
          throw error;
        }
        setFavoriteServices([...favoriteServices, serviceId]);
      }
    } catch (err: any) {
      console.error('Error toggling favorite service:', err);
      console.error('Error details:', JSON.stringify(err, null, 2));
      const errorMsg = err?.message || err?.error?.message || 'Unknown error';
      if (errorMsg.includes('relation') && errorMsg.includes('does not exist')) {
        alert('Favorites feature not set up yet. Please run the database migration.');
      } else if (errorMsg.includes('duplicate key')) {
        // Already favorited, just refresh
        await loadFavorites();
      } else {
        alert('Failed to update favorite: ' + errorMsg);
      }
    }
  };

  // Calculate metrics from bookings
  const now = new Date();
  // Upcoming bookings: future appointments that are pending or confirmed (not cancelled or completed)
  const upcomingBookings = bookings.filter(b => {
    const startTime = new Date(b.start_time);
    const isFuture = startTime >= now;
    const isActive = ['pending', 'confirmed'].includes(b.status);
    return isFuture && isActive;
  });
  // Past bookings: appointments that are in the past OR completed OR cancelled (regardless of date)
  const pastBookings = bookings.filter((b: any) => {
    const startTime = new Date(b.start_time);
    const isPast = startTime < now;
    const isCompleted = b.status === 'completed';
    const isCancelled = b.status === 'cancelled';
    // Include: past appointments (not cancelled), completed appointments, or any cancelled appointments
    return (isPast && !isCancelled) || isCompleted || isCancelled;
  });
  // Completed bookings: only those with status 'completed'
  const completedBookings = bookings.filter((b: any) => b.status === 'completed');
  const favoriteBookingsList = bookings.filter((b: any) => favoriteBookings.includes(b.id));
  const favoriteServicesList = services.filter(s => favoriteServices.includes(s.id));
  const totalFavorites = favoriteBookings.length + favoriteServices.length;

  // Don't block the entire page - show content even if services are loading
  // Only show loading for the services section itself

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 px-4 sm:px-6 lg:px-0">
      {/* Customer Header - Professional Design */}
      <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-500 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-white shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold truncate">Welcome, {userName}!</h1>
                <p className="text-white/90 text-sm sm:text-base lg:text-lg mt-1">Customer Dashboard</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
              <User className="h-4 w-4" />
              <span className="text-xs sm:text-sm font-medium">Customer Portal</span>
            </div>
            <div className="relative flex-1 sm:flex-initial">
              <Button
                onClick={() => setShowNotifications(true)}
                variant="outline"
                size="sm"
                className="bg-white/10 hover:bg-white/20 border-white/30 text-white backdrop-blur-sm relative w-full sm:w-auto"
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
              onClick={signOut}
              variant="outline"
              size="sm"
              className="bg-white/10 hover:bg-white/20 border-white/30 text-white backdrop-blur-sm hidden sm:flex"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Customer Stats - Different Colors */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-2 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
            <CardTitle className="text-sm font-medium">My Bookings</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{bookings.length}</div>
            <p className="text-sm text-muted-foreground mt-1">Total bookings</p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-2 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center shadow-lg">
              <Calendar className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{upcomingBookings.length}</div>
            <p className="text-sm text-muted-foreground mt-1">Scheduled appointments</p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-2 border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950/20 dark:to-gray-950/20">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-600 to-gray-600 flex items-center justify-center shadow-lg">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold bg-gradient-to-r from-slate-600 to-gray-600 bg-clip-text text-transparent">{completedBookings.length}</div>
            <p className="text-sm text-muted-foreground mt-1">Past appointments</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 w-full text-xs"
              onClick={() => router.push('/dashboard/customer/bookings')}
            >
              Manage All Bookings →
            </Button>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-2 border-amber-200 dark:border-amber-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20">
            <CardTitle className="text-sm font-medium">Favorites</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-600 to-yellow-600 flex items-center justify-center shadow-lg">
              <Star className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">{totalFavorites}</div>
            <p className="text-sm text-muted-foreground mt-1">Saved items</p>
          </CardContent>
        </Card>
      </div>

      {/* Customer Content - Different Layout */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="border-2 border-blue-200 dark:border-blue-800 hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-blue-50 via-cyan-50 to-blue-50 dark:from-blue-950/20 dark:via-cyan-950/20 dark:to-blue-950/20 border-b border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-blue-900 dark:text-blue-100">My Upcoming Bookings</CardTitle>
              <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                <Calendar className="h-3 w-3 mr-1" />
                {upcomingBookings.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {bookingsLoading && bookings.length === 0 ? (
              <div className="text-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto" />
                <p className="text-sm text-muted-foreground mt-2">Loading bookings...</p>
              </div>
            ) : upcomingBookings.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mx-auto mb-4 opacity-50">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <p className="font-medium">No upcoming bookings</p>
                <p className="text-sm mt-1">Your scheduled appointments will appear here</p>
                <div className="flex gap-2 justify-center mt-4">
                  <Button 
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                  >
                    Browse Services
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => router.push('/dashboard/customer/bookings')}
                  >
                    View All Bookings
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingBookings.slice(0, 5).map((booking) => {
                  const startDate = new Date(booking.start_time);
                  const service = booking.business_profile_services;
                  const business = booking.business_profiles;
                  
                  return (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-white dark:bg-slate-900 hover:shadow-md transition-shadow"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {business?.logo_url && (
                            <img
                              src={business.logo_url}
                              alt={business.business_name}
                              className="w-6 h-6 object-contain rounded"
                            />
                          )}
                          <p className="font-semibold text-sm">{service?.name || 'Service'}</p>
                          <Badge
                            variant={booking.status === 'confirmed' ? 'default' : booking.status === 'pending' ? 'secondary' : 'outline'}
                            className={`text-xs ${
                              booking.status === 'confirmed' 
                                ? 'bg-green-500 text-white hover:bg-green-600' 
                                : booking.status === 'pending'
                                ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                                : ''
                            }`}
                          >
                            {booking.status === 'confirmed' ? 'Confirmed ✓' : booking.status === 'pending' ? 'Pending' : booking.status}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 ml-auto"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavoriteBooking(booking.id);
                            }}
                          >
                            <Star
                              className={`h-4 w-4 ${
                                favoriteBookings.includes(booking.id)
                                  ? 'fill-amber-500 text-amber-500'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">{business?.business_name}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {startDate.toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">${Number(booking.amount || 0).toFixed(2)}</p>
                      </div>
                    </div>
                  );
                })}
                {upcomingBookings.length > 5 && (
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => router.push('/dashboard/customer/bookings')}
                    >
                      View All {upcomingBookings.length} Bookings
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-rose-200 dark:border-rose-800 hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-rose-50 via-pink-50 to-purple-50 dark:from-rose-950/20 dark:via-pink-950/20 dark:to-purple-950/20 border-b border-rose-200 dark:border-rose-800">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-rose-900 dark:text-rose-100">Booking History</CardTitle>
              <Badge variant="secondary" className="bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400">
                <Clock className="h-3 w-3 mr-1" />
                {pastBookings.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {bookingsLoading && bookings.length === 0 ? (
              <div className="text-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-600 mx-auto" />
                <p className="text-sm text-muted-foreground mt-2">Loading history...</p>
              </div>
            ) : pastBookings.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-600 to-gray-600 flex items-center justify-center mx-auto mb-4 opacity-50">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <p className="font-medium">No booking history</p>
                <p className="text-sm mt-1">Your past appointments will be shown here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pastBookings.slice(0, 5).map((booking) => {
                  const startDate = new Date(booking.start_time);
                  const service = booking.business_profile_services;
                  const business = booking.business_profiles;
                  
                  return (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-white dark:bg-slate-900 hover:shadow-md transition-shadow"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {business?.logo_url && (
                            <img
                              src={business.logo_url}
                              alt={business.business_name}
                              className="w-6 h-6 object-contain rounded"
                            />
                          )}
                          <p className="font-semibold text-sm">{service?.name || 'Service'}</p>
                          <Badge
                            variant={
                              booking.status === 'completed' 
                                ? 'default' 
                                : booking.status === 'cancelled'
                                ? 'destructive'
                                : 'secondary'
                            }
                            className="text-xs"
                          >
                            {booking.status === 'cancelled' ? 'Cancelled' : booking.status}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 ml-auto"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavoriteBooking(booking.id);
                            }}
                          >
                            <Star
                              className={`h-4 w-4 ${
                                favoriteBookings.includes(booking.id)
                                  ? 'fill-amber-500 text-amber-500'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">{business?.business_name}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {startDate.toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">${Number(booking.amount || 0).toFixed(2)}</p>
                      </div>
                    </div>
                  );
                })}
                {pastBookings.length > 5 && (
                  <p className="text-xs text-center text-muted-foreground pt-2">
                    +{pastBookings.length - 5} more bookings
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Favorites Section */}
      {(favoriteBookingsList.length > 0 || favoriteServicesList.length > 0) && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                Favorites
              </h2>
              <p className="text-muted-foreground mt-1">
                Your saved appointments and services
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Favorite Appointments */}
            {favoriteBookingsList.map((booking) => {
              const startDate = new Date(booking.start_time);
              const service = booking.business_profile_services;
              const business = booking.business_profiles;
              
              return (
                <Card
                  key={booking.id}
                  className="border-2 border-amber-200 dark:border-amber-800 hover:shadow-xl transition-all duration-300"
                >
                  <CardHeader className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 dark:from-amber-950/20 dark:via-yellow-950/20 dark:to-amber-950/20 border-b border-amber-200 dark:border-amber-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {business?.logo_url && (
                          <img
                            src={business.logo_url}
                            alt={business.business_name}
                            className="w-8 h-8 object-contain rounded"
                          />
                        )}
                        <div>
                          <CardTitle className="text-lg">{service?.name || 'Service'}</CardTitle>
                          <p className="text-xs text-muted-foreground">{business?.business_name}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => toggleFavoriteBooking(booking.id)}
                      >
                        <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{startDate.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <Badge
                          variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {booking.status}
                        </Badge>
                        <span className="font-semibold text-sm">${Number(booking.amount || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {/* Favorite Services */}
            {favoriteServicesList.map((service) => {
              const business = service.business_profile as BusinessProfile | null;
              if (!business) return null;
              
              return (
                <Card
                  key={service.id}
                  className="border-2 border-amber-200 dark:border-amber-800 hover:shadow-xl transition-all duration-300"
                >
                  <CardHeader className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 dark:from-amber-950/20 dark:via-yellow-950/20 dark:to-amber-950/20 border-b border-amber-200 dark:border-amber-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {business?.logo_url && (
                          <img
                            src={business.logo_url}
                            alt={business.business_name}
                            className="w-8 h-8 object-contain rounded"
                          />
                        )}
                        <div>
                          <CardTitle className="text-lg">{service.name}</CardTitle>
                          <p className="text-xs text-muted-foreground">{business?.business_name}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => toggleFavoriteService(service.id)}
                      >
                        <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      {service.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{service.duration_minutes} min</span>
                        </div>
                        <div className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                          <DollarSign className="h-4 w-4" />
                          <span>${Number(service.price).toFixed(2)}</span>
                        </div>
                      </div>
                      {hasActiveBooking(service.id) ? (
                        <div className="space-y-2 mt-3">
                          <Button
                            className="w-full bg-gray-400 hover:bg-gray-500 cursor-not-allowed"
                            disabled
                          >
                            <AlertCircle className="h-4 w-4 mr-2" />
                            Already Booked
                          </Button>
                          <p className="text-xs text-muted-foreground text-center">
                            You have an active booking for this service. Cancel it first to book again.
                          </p>
                        </div>
                      ) : (
                        <Button
                          className="w-full mt-3 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700"
                          onClick={() => handleBookService(service)}
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Book Now
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Services Section */}
      <div>
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Available Services
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Browse and book services from all businesses
            </p>
          </div>
        </div>

        {loading ? (
          <Card className="border-2 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-12 pb-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
              <p className="text-sm text-muted-foreground mt-4">Loading services...</p>
              <p className="text-xs text-muted-foreground mt-2">This may take a few moments</p>
            </CardContent>
          </Card>
        ) : servicesError ? (
          <Card className="border-2 border-red-200 dark:border-red-800">
            <CardContent className="pt-12 pb-12 text-center">
              <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-4" />
              <p className="font-medium text-red-600 dark:text-red-400 mb-2">Error Loading Services</p>
              <p className="text-sm text-muted-foreground mb-4">{servicesError}</p>
              <Button
                variant="outline"
                onClick={() => {
                  setServicesError(null);
                  loadAllServices();
                }}
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : services.length === 0 ? (
          <Card className="border-2 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center mx-auto mb-4 opacity-50">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <p className="font-medium text-muted-foreground mb-2">No services available</p>
              <p className="text-sm text-muted-foreground">Check back later for new services</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {services.map((service) => {
              const business = service.business_profile as BusinessProfile | null;
              if (!business) return null;
              
              return (
                <Card
                  key={service.id}
                  className="border-2 border-blue-200 dark:border-blue-800 hover:shadow-xl transition-all duration-300 cursor-pointer group"
                  onClick={() => handleBookService(service)}
                >
                  <CardHeader className="bg-gradient-to-r from-blue-50 via-cyan-50 to-blue-50 dark:from-blue-950/20 dark:via-cyan-950/20 dark:to-blue-950/20 border-b border-blue-200 dark:border-blue-800">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {business?.logo_url && (
                            <img
                              src={business.logo_url}
                              alt={business.business_name || 'Business'}
                              className="w-8 h-8 object-contain rounded"
                            />
                          )}
                          <div className="flex-1">
                            <CardTitle className="text-lg text-blue-900 dark:text-blue-100">
                              {service.name}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground mt-1">
                              {business?.business_name || 'Business'}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-5 h-5 rounded-full shadow-sm"
                          style={{ backgroundColor: service.color }}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavoriteService(service.id);
                          }}
                        >
                          <Star
                            className={`h-4 w-4 ${
                              favoriteServices.includes(service.id)
                                ? 'fill-amber-500 text-amber-500'
                                : 'text-muted-foreground'
                            }`}
                          />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {service.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {service.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{service.duration_minutes} min</span>
                        </div>
                        <div className="flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400">
                          <DollarSign className="h-4 w-4" />
                          <span>${Number(service.price).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    {hasActiveBooking(service.id) ? (
                      <div className="space-y-2">
                        <Button
                          className="w-full bg-gray-400 hover:bg-gray-500 cursor-not-allowed"
                          disabled
                        >
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Already Booked
                        </Button>
                        <p className="text-xs text-muted-foreground text-center">
                          You have an active booking for this service. Cancel it first to book again.
                        </p>
                      </div>
                    ) : (
                      <Button
                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookService(service);
                        }}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Book Now
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Notifications Dialog */}
      <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Notifications</DialogTitle>
                <DialogDescription>
                  Updates about your appointments from business owners
                </DialogDescription>
              </div>
              {notifications.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={dismissAllNotifications}
                >
                  Dismiss All
                </Button>
              )}
            </div>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No new notifications</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const startDate = new Date(notification.start_time);
                const service = notification.business_profile_services;
                const business = notification.business_profiles;
                
                return (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border ${
                      notification.type === 'cancelled'
                        ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                        : notification.type === 'confirmed'
                        ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                        : 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {notification.type === 'cancelled' ? (
                            <AlertCircle className="h-5 w-5 text-red-600" />
                          ) : notification.type === 'confirmed' ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <CheckCircle2 className="h-5 w-5 text-blue-600" />
                          )}
                          <Badge
                            variant={
                              notification.type === 'cancelled' 
                                ? 'destructive' 
                                : notification.type === 'confirmed'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {notification.type === 'cancelled' 
                              ? 'Cancelled by Business' 
                              : notification.type === 'confirmed'
                              ? 'Confirmed'
                              : 'Completed'}
                          </Badge>
                        </div>
                        <p className="font-semibold mb-1">{service?.name || 'Service'}</p>
                        <p className="text-sm text-muted-foreground mb-1">
                          {business?.business_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {notification.type === 'cancelled' 
                            ? `Your appointment was cancelled on ${new Date(notification.updated_at).toLocaleString()}`
                            : notification.type === 'confirmed'
                            ? `Your appointment was confirmed on ${new Date(notification.updated_at).toLocaleString()}`
                            : `Your appointment was marked as completed on ${new Date(notification.updated_at).toLocaleString()}`
                          }
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Scheduled for: {startDate.toLocaleString()}
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
                    <div className="mt-3 pt-3 border-t space-y-2">
                      {notification.needsReview && notification.type === 'completed' && (
                        <Button
                          variant="default"
                          size="sm"
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                          onClick={() => {
                            setShowNotifications(false);
                            router.push(`/dashboard/customer/bookings?review=${notification.id}`);
                          }}
                        >
                          Leave Review & Feedback
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          setShowNotifications(false);
                          router.push('/dashboard/customer/bookings');
                        }}
                      >
                        View in My Bookings
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

