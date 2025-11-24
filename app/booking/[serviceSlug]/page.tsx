'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Check, Clock, DollarSign, User, Mail, Phone, Calendar as CalendarIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { useAuth } from '@/lib/providers/auth-provider';
import type { BusinessProfile, BusinessProfileService, BusinessProfileStaff } from '@/lib/types';

// Utility function to generate slug from service name
function generateServiceSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export default function ServiceBookingPage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile } = useAuth();
  const serviceSlug = params.serviceSlug as string;
  
  const [loading, setLoading] = useState(true);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [service, setService] = useState<BusinessProfileService | null>(null);
  const [availableStaff, setAvailableStaff] = useState<BusinessProfileStaff[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedStaff, setSelectedStaff] = useState<BusinessProfileStaff | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [emailError, setEmailError] = useState('');
  
  const [clientInfo, setClientInfo] = useState({
    full_name: '',
    email: '',
    phone: '',
    notes: '',
  });

  // Pre-populate email and name when user is logged in
  useEffect(() => {
    if (user?.email) {
      setClientInfo(prev => ({
        ...prev,
        email: user.email || '',
        full_name: profile?.full_name || prev.full_name,
      }));
    }
  }, [user, profile]);

  useEffect(() => {
    loadServiceData();
  }, [serviceSlug]);

  const loadServiceData = async () => {
    try {
      setLoading(true);
      
      // Get all services and match by slug (we'll check is_active separately)
      const { data: servicesData, error: servicesError } = await supabase
        .from('business_profile_services')
        .select(`
          *,
          business_profiles (*)
        `);

      if (servicesError || !servicesData || servicesData.length === 0) {
        console.error('No active services found');
        return;
      }

      // Find service that matches the slug
      const matchedService = servicesData.find((s: any) => 
        generateServiceSlug(s.name) === serviceSlug
      );

      if (!matchedService) {
        console.error('Service not found for slug:', serviceSlug);
        setLoading(false);
        return;
      }

      // Check if service is active
      if (!matchedService.is_active) {
        setService(matchedService);
        setBusinessProfile(matchedService.business_profiles as BusinessProfile);
        setLoading(false);
        return; // Will show inactive message in UI
      }

      setService(matchedService);
      setBusinessProfile(matchedService.business_profiles as BusinessProfile);

      // Load staff assigned to this service
      // First get the staff IDs from assignments
      const { data: assignments, error: assignmentsError } = await supabase
        .from('business_profile_staff_services')
        .select('staff_id')
        .eq('service_id', matchedService.id);

      if (assignmentsError) {
        console.error('Error loading staff assignments:', assignmentsError);
      }

      // Then get the staff details
      if (assignments && assignments.length > 0) {
        const staffIds = assignments.map((a: any) => a.staff_id);
        const { data: staffData, error: staffError } = await supabase
          .from('business_profile_staff')
          .select('*')
          .in('id', staffIds)
          .eq('is_active', true);

        if (staffError) {
          console.error('Error loading staff details:', staffError);
        } else {
          console.log('Available staff for service:', staffData);
          setAvailableStaff(staffData || []);
        }
      } else {
        console.log('No staff assignments found for service');
        setAvailableStaff([]);
      }
    } catch (err) {
      console.error('Error loading service:', err);
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
    '15:00', '16:00', '17:00', '18:00'
  ];

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !service || !businessProfile) {
      alert('Please complete all required fields');
      return;
    }

    if (!clientInfo.full_name || !clientInfo.email) {
      alert('Please fill in your name and email');
      return;
    }

    // Validate email matches logged-in user's email
    if (user?.email && clientInfo.email !== user.email) {
      setEmailError('Email address must match your account email: ' + user.email);
      alert('Email address must match your account email: ' + user.email);
      return;
    }
    
    setEmailError('');
    
    // Check if customer already has an active booking for this service
    try {
      const { data: existingBookings, error: checkError } = await supabase
        .from('business_profile_bookings')
        .select('id, status, start_time')
        .eq('service_id', service.id)
        .eq('client_email', clientInfo.email)
        .in('status', ['pending', 'confirmed']); // Only check active bookings
      
      if (checkError) {
        console.error('Error checking existing bookings:', checkError);
        // Continue with booking if check fails (don't block user)
      } else if (existingBookings && existingBookings.length > 0) {
        // Customer already has an active booking for this service
        const activeBooking = existingBookings[0];
        const bookingDate = new Date(activeBooking.start_time);
        alert(
          `You already have an active booking for this service.\n\n` +
          `Status: ${activeBooking.status}\n` +
          `Scheduled: ${bookingDate.toLocaleDateString()} at ${bookingDate.toLocaleTimeString()}\n\n` +
          `Please cancel your existing booking first if you want to book again.`
        );
        return;
      }
    } catch (checkErr) {
      console.error('Error checking existing bookings:', checkErr);
      // Continue with booking if check fails (don't block user)
    }
    
    setSubmitting(true);
    try {
      // Calculate start and end time
      const startTime = new Date(selectedDate);
      const [hour, min] = selectedTime.split(':');
      startTime.setHours(parseInt(hour), parseInt(min), 0, 0);

      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + service.duration_minutes);

      // Create booking
      const { data: newBooking, error: bookingError } = await supabase
        .from('business_profile_bookings')
        .insert({
          business_profile_id: businessProfile.id,
          service_id: service.id,
          staff_id: selectedStaff?.id || null,
          client_name: clientInfo.full_name,
          client_email: clientInfo.email,
          client_phone: clientInfo.phone || null,
          client_notes: clientInfo.notes || null,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          status: 'pending',
          amount: service.price,
          payment_status: 'unpaid',
          source: 'public_booking',
        })
        .select()
        .single();

      if (bookingError) throw bookingError;
      
      // Send email notification to business owner
      if (newBooking?.id) {
        try {
          await fetch('/api/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'new_booking',
              bookingId: newBooking.id,
              businessEmail: businessProfile.contact_email || '', // Will be fetched in API
            }),
          });
        } catch (emailError) {
          console.error('Error sending email notification:', emailError);
          // Don't fail the booking if email fails
        }
      }
      
      setSuccess(true);
      
      // If user is logged in as customer, redirect to dashboard after 2 seconds
      if (user) {
        setTimeout(() => {
          router.push('/dashboard/customer');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking: ' + (error.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!service || !businessProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">Service not found</p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if service is inactive
  if (!service.is_active) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{
        background: `linear-gradient(135deg, ${businessProfile.primary_color}15 0%, ${businessProfile.secondary_color}15 100%)`
      }}>
        <Card className="w-full max-w-2xl shadow-lg">
          <CardHeader className="relative" style={{
            background: `linear-gradient(135deg, ${businessProfile.primary_color} 0%, ${businessProfile.secondary_color} 100%)`,
            color: 'white',
          }}>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 left-4 text-white hover:bg-white/20"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="text-center py-4">
              {businessProfile.logo_url && (
                <img
                  src={businessProfile.logo_url}
                  alt={businessProfile.business_name}
                  className="h-12 object-contain mx-auto mb-2"
                />
              )}
              <CardTitle className="text-2xl font-bold">{service.name}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Service Currently Inactive</h2>
            <p className="text-muted-foreground mb-6">
              This service is currently not accepting new bookings. If you have an existing appointment for this service, 
              please contact {businessProfile.business_name} directly.
            </p>
            {businessProfile.contact_email && (
              <div className="flex items-center justify-center gap-2 mb-4">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${businessProfile.contact_email}`} className="text-blue-600 hover:underline">
                  {businessProfile.contact_email}
                </a>
              </div>
            )}
            {businessProfile.contact_phone && (
              <div className="flex items-center justify-center gap-2 mb-6">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${businessProfile.contact_phone}`} className="text-blue-600 hover:underline">
                  {businessProfile.contact_phone}
                </a>
              </div>
            )}
            <Button onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen py-8 px-4"
      style={{
        background: `linear-gradient(135deg, ${businessProfile.primary_color}15 0%, ${businessProfile.secondary_color}15 100%)`
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          {businessProfile.logo_url && (
            <div className="flex items-center gap-4 mb-4">
              <img
                src={businessProfile.logo_url}
                alt={businessProfile.business_name}
                className="w-16 h-16 object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold">{businessProfile.business_name}</h1>
                <p className="text-sm text-muted-foreground">Book {service.name}</p>
              </div>
            </div>
          )}
        </div>

        {success ? (
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
              <p className="text-muted-foreground mb-6">
                Your appointment has been scheduled successfully.
              </p>
              {user ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Redirecting to your dashboard...</p>
                  <Button onClick={() => router.push('/dashboard/customer')}>
                    Go to Dashboard
                  </Button>
                </div>
              ) : (
                <Button onClick={() => router.back()}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Go Back
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Service Info Card */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Service Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">{service.name}</h3>
                  {service.description && (
                    <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{service.duration_minutes} minutes</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">${service.price.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Booking Form */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>
                  {step === 1 && 'Select Date & Time'}
                  {step === 2 && 'Select Staff Member'}
                  {step === 3 && 'Your Information'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <Label>Select Date</Label>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date()}
                        className="rounded-md border mt-2"
                      />
                    </div>
                    
                    {selectedDate && (
                      <div>
                        <Label>Select Time</Label>
                        <div className="grid grid-cols-4 gap-2 mt-2">
                          {timeSlots.map((time) => (
                            <Button
                              key={time}
                              variant={selectedTime === time ? 'default' : 'outline'}
                              onClick={() => setSelectedTime(time)}
                              className="w-full"
                            >
                              {time}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={() => setStep(2)}
                      disabled={!selectedDate || !selectedTime}
                      className="w-full"
                    >
                      Continue
                    </Button>
                  </div>
                )}

                {step === 2 && availableStaff.length > 0 && (
                  <div className="space-y-4">
                    <Label>Select Staff Member</Label>
                    <div className="space-y-2">
                      {availableStaff.map((staff) => (
                        <Button
                          key={staff.id}
                          variant={selectedStaff?.id === staff.id ? 'default' : 'outline'}
                          onClick={() => setSelectedStaff(staff)}
                          className="w-full justify-start"
                        >
                          <User className="mr-2 h-4 w-4" />
                          {staff.full_name}
                          {staff.role && (
                            <Badge variant="secondary" className="ml-2">
                              {staff.role}
                            </Badge>
                          )}
                        </Button>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setStep(1)}
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={() => setStep(3)}
                        disabled={!selectedStaff}
                        className="flex-1"
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                )}

                {step === 2 && availableStaff.length === 0 && (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      No staff members available for this service. Proceeding without staff selection.
                    </p>
                    <Button
                      onClick={() => setStep(3)}
                      className="w-full"
                    >
                      Continue
                    </Button>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name *</Label>
                      <Input
                        id="full_name"
                        value={clientInfo.full_name}
                        onChange={(e) => setClientInfo({ ...clientInfo, full_name: e.target.value })}
                        placeholder="John Doe"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={clientInfo.email}
                        onChange={(e) => {
                          const newEmail = e.target.value;
                          setClientInfo({ ...clientInfo, email: newEmail });
                          // Clear error when user starts typing
                          if (emailError) {
                            setEmailError('');
                          }
                          // Validate in real-time if user is logged in
                          if (user?.email && newEmail && newEmail !== user.email) {
                            setEmailError('Email must match your account email: ' + user.email);
                          } else {
                            setEmailError('');
                          }
                        }}
                        placeholder={user?.email || "john@example.com"}
                        required
                        className={emailError ? 'border-red-500' : ''}
                      />
                      {emailError && (
                        <p className="text-sm text-red-500">{emailError}</p>
                      )}
                      {user?.email && (
                        <p className="text-xs text-muted-foreground">
                          Using your account email: {user.email}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={clientInfo.phone}
                        onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Additional Notes</Label>
                      <Textarea
                        id="notes"
                        value={clientInfo.notes}
                        onChange={(e) => setClientInfo({ ...clientInfo, notes: e.target.value })}
                        placeholder="Any special requests or notes..."
                        rows={3}
                      />
                    </div>

                    <div className="bg-muted p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Date</span>
                        <span className="font-semibold">
                          {selectedDate && format(selectedDate, 'PPP')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Time</span>
                        <span className="font-semibold">{selectedTime}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Total</span>
                        <span className="font-semibold text-lg">${service.price.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setStep(2)}
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        disabled={!clientInfo.full_name || !clientInfo.email || submitting}
                        className="flex-1"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Booking...
                          </>
                        ) : (
                          'Confirm Booking'
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

