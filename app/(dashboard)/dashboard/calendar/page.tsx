'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Loader2, Clock, User, Mail, Phone } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/providers/auth-provider';
import { format, isSameDay, parseISO } from 'date-fns';

interface Appointment {
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
  business_profiles?: {
    id: string;
    business_name: string;
    business_slug: string;
  };
}

export default function CalendarPage() {
  const { user, profile, role, loading: authLoading } = useAuth();
  const router = useRouter();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDateAppointments, setSelectedDateAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    if (!authLoading) {
      loadAppointments();
    }
  }, [authLoading, user]);

  useEffect(() => {
    if (date && appointments.length > 0) {
      const selected = appointments.filter(apt => 
        isSameDay(parseISO(apt.start_time), date)
      );
      setSelectedDateAppointments(selected);
    } else {
      setSelectedDateAppointments([]);
    }
  }, [date, appointments]);

  const loadAppointments = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Check user role
      const userRole = role || profile?.role || user.user_metadata?.role;
      
      let query;
      
      if (userRole === 'business_owner') {
        // For business owners, get appointments for their business profile
        const { data: businessProfile } = await supabase
          .from('business_profiles')
          .select('id, business_slug')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!businessProfile) {
          setLoading(false);
          return;
        }

        query = supabase
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
          .eq('business_profile_id', businessProfile.id)
          .order('start_time', { ascending: true });
      } else if (userRole === 'customer') {
        // For customers, get their own appointments
        const userEmail = user.email;
        if (!userEmail) {
          setLoading(false);
          return;
        }

        query = supabase
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
            ),
            business_profiles (
              id,
              business_name,
              business_slug
            )
          `)
          .eq('client_email', userEmail)
          .order('start_time', { ascending: true });
      } else {
        // Admin or other roles - show all appointments
        query = supabase
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
            ),
            business_profiles (
              id,
              business_name,
              business_slug
            )
          `)
          .order('start_time', { ascending: true });
      }

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 10000)
      );

      const result = await Promise.race([
        query.then((r: any) => ({ type: 'success', data: r.data, error: r.error })),
        timeoutPromise.then(() => ({ type: 'timeout' }))
      ]) as any;

      if (result.type === 'timeout') {
        console.error('Query timeout');
        setAppointments([]);
      } else if (result.error) {
        console.error('Error loading appointments:', result.error);
        setAppointments([]);
      } else {
        setAppointments(result.data || []);
      }
    } catch (err: any) {
      console.error('Error loading appointments:', err);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  // Get appointments for a specific date
  const getAppointmentsForDate = (date: Date): Appointment[] => {
    return appointments.filter(apt => 
      isSameDay(parseISO(apt.start_time), date)
    );
  };

  // Mark dates with appointments
  const dateModifiers = {
    hasAppointments: (date: Date) => {
      return getAppointmentsForDate(date).length > 0;
    },
    hasPending: (date: Date) => {
      return getAppointmentsForDate(date).some(apt => apt.status === 'pending');
    },
    hasConfirmed: (date: Date) => {
      return getAppointmentsForDate(date).some(apt => apt.status === 'confirmed');
    },
    hasCompleted: (date: Date) => {
      return getAppointmentsForDate(date).some(apt => apt.status === 'completed');
    },
    hasCancelled: (date: Date) => {
      return getAppointmentsForDate(date).some(apt => apt.status === 'cancelled');
    },
  };

  const dateModifiersClassNames = {
    hasAppointments: 'bg-blue-50 hover:bg-blue-100',
    hasPending: 'bg-yellow-50 hover:bg-yellow-100',
    hasConfirmed: 'bg-green-50 hover:bg-green-100',
    hasCompleted: 'bg-blue-100 hover:bg-blue-200',
    hasCancelled: 'bg-red-50 hover:bg-red-100',
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-500">Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    const userRole = role || profile?.role || user?.user_metadata?.role;
    if (userRole === 'business_owner' && appointment.business_profile_id) {
      // Get business slug
      supabase
        .from('business_profiles')
        .select('business_slug')
        .eq('id', appointment.business_profile_id)
        .single()
        .then(({ data }: any) => {
          if (data?.business_slug) {
            router.push(`/${data.business_slug}/appointments?appointmentId=${appointment.id}`);
          }
        });
    } else if (userRole === 'customer') {
      router.push(`/dashboard/customer/bookings?appointmentId=${appointment.id}`);
    }
  };

  if (loading) {
    return (
      <div>
        <Header title="Calendar" />
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Calendar" />
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <p className="text-xs sm:text-sm text-muted-foreground">
            View your appointments and schedule
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="p-4 sm:p-6 lg:col-span-2">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
              modifiers={dateModifiers}
              modifiersClassNames={dateModifiersClassNames}
            />
          </Card>

          <div className="space-y-3 sm:space-y-4">
            <Card className="p-4">
              <CardHeader>
                <CardTitle className="text-lg">
                  {date ? format(date, 'EEEE, MMMM d, yyyy') : 'Select a date'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDateAppointments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No appointments scheduled
                  </p>
                ) : (
                  <div className="space-y-3">
                    {selectedDateAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        onClick={() => handleAppointmentClick(appointment)}
                        className="p-3 border rounded-md hover:bg-accent cursor-pointer transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {appointment.business_profile_services?.name || 'Service'}
                            </p>
                            {appointment.business_profiles && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {appointment.business_profiles.business_name}
                              </p>
                            )}
                          </div>
                          {getStatusBadge(appointment.status)}
                        </div>
                        
                        <div className="space-y-1 mt-2">
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {format(parseISO(appointment.start_time), 'h:mm a')} - {format(parseISO(appointment.end_time), 'h:mm a')}
                          </div>
                          
                          <div className="flex items-center text-xs text-muted-foreground">
                            <User className="h-3 w-3 mr-1" />
                            {appointment.client_name}
                          </div>
                          
                          {appointment.business_profile_staff && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <User className="h-3 w-3 mr-1" />
                              Staff: {appointment.business_profile_staff.full_name}
                            </div>
                          )}
                          
                          {appointment.client_email && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Mail className="h-3 w-3 mr-1" />
                              {appointment.client_email}
                            </div>
                          )}
                          
                          {appointment.client_phone && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Phone className="h-3 w-3 mr-1" />
                              {appointment.client_phone}
                            </div>
                          )}
                        </div>
                        
                        {appointment.amount && (
                          <div className="mt-2 pt-2 border-t">
                            <p className="text-xs font-medium">
                              ${appointment.amount.toFixed(2)} - {appointment.payment_status}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="p-4">
              <CardHeader>
                <CardTitle className="text-lg">Upcoming</CardTitle>
              </CardHeader>
              <CardContent>
                {appointments.filter(apt => {
                  const aptDate = parseISO(apt.start_time);
                  return aptDate >= new Date() && apt.status !== 'cancelled';
                }).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                    No upcoming appointments
                </p>
              ) : (
                <div className="space-y-2">
                    {appointments
                      .filter(apt => {
                        const aptDate = parseISO(apt.start_time);
                        return aptDate >= new Date() && apt.status !== 'cancelled';
                      })
                      .slice(0, 5)
                      .map((appointment) => (
                        <div
                          key={appointment.id}
                          onClick={() => handleAppointmentClick(appointment)}
                          className="p-2 border rounded-md hover:bg-accent cursor-pointer transition-colors"
                        >
                          <p className="font-medium text-xs">
                            {appointment.business_profile_services?.name || 'Service'}
                          </p>
                      <p className="text-xs text-muted-foreground mt-1">
                            {format(parseISO(appointment.start_time), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
