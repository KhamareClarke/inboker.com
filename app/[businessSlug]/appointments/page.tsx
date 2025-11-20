'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft, Calendar, Clock, User, Mail, Phone, Search, Filter, CheckCircle2, XCircle, Ban, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { BusinessProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface Booking {
  id: string;
  business_profile_id: string;
  service_id: string;
  staff_id: string | null;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  client_notes: string | null;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  amount: number | null;
  payment_status: 'unpaid' | 'paid' | 'refunded';
  source: string | null;
  created_at: string;
  updated_at: string;
  business_profile_services?: {
    id: string;
    name: string;
    color: string;
    is_active: boolean;
  };
  business_profile_staff?: {
    id: string;
    full_name: string;
  };
}

export default function BusinessAppointmentsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const businessSlug = params.businessSlug as string;
  const isLoadingRef = useRef(false);
  const hasLoadedRef = useRef(false);
  const filterFromUrlRef = useRef(false);

  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [appointments, setAppointments] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past' | 'pending' | 'confirmed' | 'cancelled' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [highlightedAppointmentId, setHighlightedAppointmentId] = useState<string | null>(null);

  useEffect(() => {
    // Check for appointment ID in URL params
    const appointmentId = searchParams.get('appointmentId');
    if (appointmentId) {
      setHighlightedAppointmentId(appointmentId);
      // Auto-filter to show cancelled/rescheduled if needed
      const status = searchParams.get('status');
      if (status === 'cancelled' || status === 'pending') {
        filterFromUrlRef.current = true;
        // Only update filter if it's different to prevent re-renders
        setFilter(prev => {
          if (prev === status) return prev;
          return status as any;
        });
      }
      // Scroll to appointment after appointments are loaded
      const scrollTimeout = setTimeout(() => {
        const element = document.getElementById(`appointment-${appointmentId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 1000);
      
      // Remove highlight after 5 seconds
      const highlightTimeout = setTimeout(() => {
        setHighlightedAppointmentId(null);
      }, 5000);
      
      return () => {
        clearTimeout(scrollTimeout);
        clearTimeout(highlightTimeout);
      };
    }
  }, [searchParams]);

  useEffect(() => {
    if (!businessSlug) return;
    
    // If filter changed from URL params, don't reload immediately (it will load on initial mount)
    if (filterFromUrlRef.current && hasLoadedRef.current) {
      filterFromUrlRef.current = false;
      // Still need to reload with new filter, but only once
      if (!isLoadingRef.current) {
        loadAppointments();
      }
      return;
    }
    
    // Only load if not already loading and hasn't loaded yet
    if (!isLoadingRef.current && !hasLoadedRef.current) {
      loadAppointments();
    }
    
    // Refresh appointments every 30 seconds to catch customer updates (increased to reduce load)
    const interval = setInterval(() => {
      if (businessSlug && !isLoadingRef.current && !loading) {
        loadAppointments();
      }
    }, 30000);
    
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessSlug, filter]);

  const loadAppointments = async () => {
    if (isLoadingRef.current) {
      console.log('Already loading, skipping...');
      return; // Prevent multiple simultaneous calls
    }
    
    try {
      isLoadingRef.current = true;
      setLoading(true);
      
      // Fetch business profile
      const { data: profileData, error: profileError } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('business_slug', businessSlug)
        .single();

      if (profileError || !profileData) {
        console.error('Business profile not found:', profileError);
        setLoading(false);
        isLoadingRef.current = false;
        return;
      }
      
      // Only update business profile if it changed
      setBusinessProfile(prev => {
        if (prev?.id === profileData.id) return prev;
        return profileData;
      });

      // Build query
      let query = supabase
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
        .eq('business_profile_id', profileData.id);

      // Apply filters
      const now = new Date().toISOString();
      if (filter === 'upcoming') {
        query = query.gte('start_time', now).in('status', ['pending', 'confirmed']);
      } else if (filter === 'past') {
        query = query.lt('start_time', now);
      } else if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      query = query.order('start_time', { ascending: filter === 'past' ? false : true });

      const { data, error } = await query;

      if (error) {
        throw error;
      }
      
      // Only update if data actually changed
      setAppointments(prev => {
        if (JSON.stringify(prev) === JSON.stringify(data || [])) {
          return prev;
        }
        return data || [];
      });
      
      hasLoadedRef.current = true;

    } catch (err: any) {
      console.error('Error loading appointments:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to load appointments',
        variant: 'destructive',
      });
      hasLoadedRef.current = true; // Mark as loaded even on error to prevent infinite retries
    } finally {
      setLoading(false);
      // Use setTimeout to ensure state updates complete before allowing next load
      setTimeout(() => {
        isLoadingRef.current = false;
      }, 100);
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      apt.client_name.toLowerCase().includes(query) ||
      apt.client_email.toLowerCase().includes(query) ||
      (apt.client_phone && apt.client_phone.toLowerCase().includes(query)) ||
      apt.business_profile_services?.name.toLowerCase().includes(query) ||
      apt.business_profile_staff?.full_name.toLowerCase().includes(query)
    );
  });

  const updateAppointmentStatus = async (appointmentId: string, newStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed') => {
    try {
      setUpdatingStatus(appointmentId);
      
      // Add timeout to prevent hanging
      const updatePromise = supabase
        .from('business_profile_bookings')
        .update({ status: newStatus })
        .eq('id', appointmentId);

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Update timeout - request took too long')), 10000)
      );

      const { error } = await Promise.race([updatePromise, timeoutPromise]) as any;

      if (error) throw error;

      // Fetch booking to get customer email
      const { data: updatedBooking } = await supabase
        .from('business_profile_bookings')
        .select('client_email, business_profiles(business_name)')
        .eq('id', appointmentId)
        .single();

      // Send email notifications
      if (newStatus === 'confirmed') {
        // Send confirmation email to customer
        try {
          await fetch('/api/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'customer_booking_confirmed',
              bookingId: appointmentId,
              customerEmail: updatedBooking?.client_email,
            }),
          });
        } catch (emailError) {
          console.error('Error sending confirmation email:', emailError);
        }
      } else if (newStatus === 'cancelled') {
        // Send cancellation email to customer
        try {
          await fetch('/api/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'customer_booking_cancelled',
              bookingId: appointmentId,
              customerEmail: updatedBooking?.client_email,
              additionalData: { cancelledBy: 'business_owner' },
            }),
          });
        } catch (emailError) {
          console.error('Error sending cancellation email:', emailError);
        }
      } else if (newStatus === 'completed') {
        // Send completion email to customer with review request
        try {
          await fetch('/api/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'customer_booking_completed',
              bookingId: appointmentId,
              customerEmail: updatedBooking?.client_email,
            }),
          });
        } catch (emailError) {
          console.error('Error sending completion email:', emailError);
        }
      }

      toast({
        title: 'Success',
        description: `Appointment status updated to ${newStatus}`,
      });

      // Update local state immediately instead of reloading
      setAppointments(prev => prev.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, status: newStatus, updated_at: new Date().toISOString() }
          : apt
      ));
      
      setUpdatingStatus(null);
      
      // Trigger a refresh after a short delay to ensure data is synced
      setTimeout(() => {
        if (hasLoadedRef.current) {
          loadAppointments();
        }
      }, 1000);
    } catch (err: any) {
      console.error('Error updating appointment status:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to update appointment status',
        variant: 'destructive',
      });
      setUpdatingStatus(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!businessProfile) {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <Button variant="outline" size="sm" onClick={() => router.push(`/${businessSlug}/dashboard`)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-2">Appointments</h1>
            <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">
              View and manage all booked appointments
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search" className="mb-2 block">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by client name, email, phone, service, or staff..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="md:w-56">
                <Label htmlFor="filter" className="mb-2 block">Filter</Label>
                <select
                  id="filter"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Appointments</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="past">Past</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center mx-auto mb-4 opacity-50">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <p className="text-muted-foreground mb-4 font-medium">
                {searchQuery ? 'No appointments match your search' : 'No appointments found'}
              </p>
              {searchQuery && (
                <Button variant="outline" onClick={() => setSearchQuery('')}>
                  Clear Search
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredAppointments.map((appointment) => {
              const startDate = new Date(appointment.start_time);
              const endDate = new Date(appointment.end_time);
              const isPast = startDate < new Date();
              const service = appointment.business_profile_services;
              const staff = appointment.business_profile_staff;
              const isServiceInactive = service && !service.is_active;
              const isHighlighted = highlightedAppointmentId === appointment.id;
              

              return (
                <Card
                  id={`appointment-${appointment.id}`}
                  key={appointment.id}
                  className={`hover:shadow-lg transition-all duration-200 border-l-4 ${
                    isHighlighted
                      ? 'ring-4 ring-purple-500 ring-opacity-50 shadow-xl animate-pulse'
                      : ''
                  } ${
                    isServiceInactive
                      ? 'border-l-orange-500 border-orange-200 dark:border-orange-800 bg-orange-50/30 dark:bg-orange-950/20'
                      : appointment.status === 'confirmed'
                      ? 'border-l-green-500'
                      : appointment.status === 'cancelled'
                      ? 'border-l-red-500'
                      : appointment.status === 'completed'
                      ? 'border-l-blue-500'
                      : 'border-l-yellow-500'
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className="w-5 h-5 rounded-full shadow-sm"
                            style={{ backgroundColor: service?.color || '#3b82f6' }}
                          />
                          <CardTitle className="text-xl">{service?.name || 'Service'}</CardTitle>
                          <Badge
                            variant={
                              appointment.status === 'confirmed'
                                ? 'default'
                                : appointment.status === 'cancelled'
                                ? 'destructive'
                                : appointment.status === 'completed'
                                ? 'secondary'
                                : 'outline'
                            }
                            className="text-xs font-medium"
                          >
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </Badge>
                          {isServiceInactive && (
                            <Badge
                              variant="outline"
                              className="text-xs border-orange-500 text-orange-700 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30"
                            >
                              Service Inactive
                            </Badge>
                          )}
                          {isPast && (
                            <Badge variant="outline" className="text-xs">
                              Past
                            </Badge>
                          )}
                        </div>
                        {isServiceInactive && (
                          <p className="text-xs text-orange-600 dark:text-orange-400 font-medium flex items-center gap-1">
                            <span>⚠️</span>
                            <span>This appointment was booked on a service that is now inactive</span>
                          </p>
                        )}
                      </div>
                      <div className="text-right ml-4 flex flex-col items-end gap-2">
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          ${Number(appointment.amount || 0).toFixed(2)}
                        </p>
                        {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={updatingStatus === appointment.id}
                                className="mt-2"
                              >
                                {updatingStatus === appointment.id ? (
                                  <>
                                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                    Updating...
                                  </>
                                ) : (
                                  <>
                                    <MoreVertical className="h-3 w-3 mr-1" />
                                    Actions
                                  </>
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {appointment.status !== 'confirmed' && (
                                <DropdownMenuItem
                                  onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                                  className="cursor-pointer"
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                                  Confirm Appointment
                                </DropdownMenuItem>
                              )}
                              {appointment.status !== 'completed' && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    if (isPast || confirm('Mark this upcoming appointment as completed?')) {
                                      updateAppointmentStatus(appointment.id, 'completed');
                                    }
                                  }}
                                  className="cursor-pointer"
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-2 text-blue-600" />
                                  Mark as Completed
                                </DropdownMenuItem>
                              )}
                              {appointment.status !== 'cancelled' && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    if (confirm('Are you sure you want to cancel this appointment?')) {
                                      updateAppointmentStatus(appointment.id, 'cancelled');
                                    }
                                  }}
                                  className="cursor-pointer text-red-600 focus:text-red-600"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Cancel Appointment
                                </DropdownMenuItem>
                              )}
                              {appointment.status !== 'pending' && (
                                <DropdownMenuItem
                                  onClick={() => updateAppointmentStatus(appointment.id, 'pending')}
                                  className="cursor-pointer"
                                >
                                  <Ban className="h-4 w-4 mr-2 text-yellow-600" />
                                  Set to Pending
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      {/* Client Information */}
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold text-sm text-muted-foreground mb-2 uppercase tracking-wide">
                            Client Information
                          </h3>
                          <div className="space-y-2">
                            <p className="font-semibold text-base">{appointment.client_name}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className="h-4 w-4 flex-shrink-0" />
                              <a href={`mailto:${appointment.client_email}`} className="hover:text-blue-600 hover:underline">
                                {appointment.client_email}
                              </a>
                            </div>
                            {appointment.client_phone && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="h-4 w-4 flex-shrink-0" />
                                <a href={`tel:${appointment.client_phone}`} className="hover:text-blue-600 hover:underline">
                                  {appointment.client_phone}
                                </a>
                              </div>
                            )}
                            {appointment.client_notes && (
                              <div className="mt-3 p-3 bg-slate-100 dark:bg-slate-800 rounded-md">
                                <p className="text-xs font-medium text-muted-foreground mb-1">Notes:</p>
                                <p className="text-sm text-foreground">{appointment.client_notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Appointment Details */}
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold text-sm text-muted-foreground mb-2 uppercase tracking-wide">
                            Appointment Details
                          </h3>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-blue-600 flex-shrink-0" />
                              <span className="font-medium">
                                {startDate.toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-blue-600 flex-shrink-0" />
                              <span className="font-medium">
                                {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                                {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            {staff && (
                              <div className="flex items-center gap-2 text-sm">
                                <User className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                <span className="font-medium">{staff.full_name}</span>
                              </div>
                            )}
                            <div className="mt-3 pt-3 border-t space-y-1">
                              <p className="text-xs text-muted-foreground">
                                Booked on {new Date(appointment.created_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

