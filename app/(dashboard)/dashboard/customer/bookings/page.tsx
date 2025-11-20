'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, MapPin, User, Mail, Phone, X, ArrowLeft, Loader2, AlertCircle, Star } from 'lucide-react';
import { useAuth } from '@/lib/providers/auth-provider';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

export default function CustomerBookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    // Wait for auth to finish loading before attempting to load bookings
    if (authLoading) {
      return;
    }
    
    if (user?.email) {
      loadBookings();
    } else {
      setLoading(false);
    }
  }, [user, authLoading]);

  useEffect(() => {
    // Check if review parameter is in URL
    const reviewBookingId = searchParams.get('review');
    if (reviewBookingId && bookings.length > 0) {
      const booking = bookings.find(b => b.id === reviewBookingId && b.status === 'completed');
      if (booking) {
        setSelectedBooking(booking);
        setShowReviewDialog(true);
      }
    }
  }, [searchParams, bookings]);

  const loadBookings = async () => {
    if (!user?.email) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Add timeout to prevent hanging
      const queryPromise = supabase
        .from('business_profile_bookings')
        .select(`
          *,
          business_profile_services (
            id,
            name,
            description,
            duration_minutes,
            price,
            color
          ),
          business_profiles (
            id,
            business_name,
            logo_url,
            contact_email,
            contact_phone,
            website
          )
        `)
        .eq('client_email', user.email)
        .order('start_time', { ascending: false });

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), 10000)
      );

      const result = await Promise.race([
        queryPromise.then(r => ({ type: 'success', data: r.data, error: r.error })),
        timeoutPromise.then(() => ({ type: 'timeout' }))
      ]) as any;

      if (result.type === 'timeout') {
        console.error('Bookings query timeout');
        alert('Request timed out. Please check your internet connection and try again.');
        setBookings([]);
        setLoading(false);
        return;
      }

      if (result.error) {
        console.error('Error loading bookings:', result.error);
        alert('Failed to load bookings: ' + (result.error.message || 'Unknown error'));
        setBookings([]);
      } else {
        setBookings(result.data || []);
      }
    } catch (err: any) {
      console.error('Error loading bookings:', err);
      if (err.message?.includes('ENOTFOUND') || err.message?.includes('getaddrinfo')) {
        alert('Network error: Cannot connect to database. Please check your internet connection.');
      } else if (err.message !== 'Query timeout') {
        alert('Failed to load bookings: ' + (err.message || 'Unknown error'));
      }
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedBooking) return;

    try {
      setCancelling(true);
      
      const updatePromise = supabase
        .from('business_profile_bookings')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedBooking.id);

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Update timeout')), 10000)
      );

      const result = await Promise.race([
        updatePromise.then(r => ({ type: 'success', error: r.error })),
        timeoutPromise.then(() => ({ type: 'timeout' }))
      ]) as any;

      if (result.type === 'timeout') {
        throw new Error('Request timed out. Please try again.');
      }

      if (result.error) throw result.error;

      // Update local state
      setBookings(bookings.map(b => 
        b.id === selectedBooking.id 
          ? { ...b, status: 'cancelled' }
          : b
      ));

      setShowCancelDialog(false);
      setSelectedBooking(null);
      setCancelReason('');
      
      // Send email notifications
      if (selectedBooking?.id) {
        try {
          // Send to business owner
          await fetch('/api/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'booking_cancelled',
              bookingId: selectedBooking.id,
              businessEmail: '', // Will be fetched in API
              additionalData: { cancelledBy: 'customer' },
            }),
          });
          
          // Send confirmation to customer
          await fetch('/api/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'customer_booking_cancelled',
              bookingId: selectedBooking.id,
              customerEmail: selectedBooking.client_email,
              additionalData: { cancelledBy: 'customer' },
            }),
          });
        } catch (emailError) {
          console.error('Error sending email notification:', emailError);
        }
      }
      
      // Reload bookings to get latest data
      setTimeout(() => {
        loadBookings();
      }, 500);
      
      alert('Appointment cancelled successfully. The business owner has been notified.');
    } catch (err: any) {
      console.error('Error cancelling booking:', err);
      alert('Failed to cancel appointment: ' + (err.message || 'Unknown error'));
    } finally {
      setCancelling(false);
    }
  };

  const handleReschedule = async () => {
    if (!selectedBooking || !newDate || !newTime) {
      alert('Please select a new date and time');
      return;
    }

    // Double-check if already rescheduled
    const createdAt = new Date(selectedBooking.created_at);
    const updatedAt = new Date(selectedBooking.updated_at);
    const timeDiff = updatedAt.getTime() - createdAt.getTime();
    const hasBeenRescheduled = timeDiff > 60000 && selectedBooking.status === 'pending';
    
    if (hasBeenRescheduled) {
      alert('This appointment has already been rescheduled once. Please contact the business directly for further changes.');
      setShowRescheduleDialog(false);
      return;
    }

    try {
      setRescheduling(true);
      
      // Calculate new start and end times
      const service = selectedBooking.business_profile_services;
      const startTime = new Date(`${newDate}T${newTime}`);
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + (service?.duration_minutes || 60));

      const updatePromise = supabase
        .from('business_profile_bookings')
        .update({
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          status: 'pending', // Reset to pending when rescheduled
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedBooking.id);

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Update timeout')), 10000)
      );

      const result = await Promise.race([
        updatePromise.then(r => ({ type: 'success', error: r.error })),
        timeoutPromise.then(() => ({ type: 'timeout' }))
      ]) as any;

      if (result.type === 'timeout') {
        throw new Error('Request timed out. Please try again.');
      }

      if (result.error) throw result.error;

      // Update local state
      setBookings(bookings.map(b => 
        b.id === selectedBooking.id 
          ? { 
              ...b, 
              start_time: startTime.toISOString(),
              end_time: endTime.toISOString(),
              status: 'pending'
            }
          : b
      ));

      setShowRescheduleDialog(false);
      setSelectedBooking(null);
      setNewDate('');
      setNewTime('');
      
      // Send email notification to business owner
      if (selectedBooking?.id) {
        try {
          await fetch('/api/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'booking_rescheduled',
              bookingId: selectedBooking.id,
              businessEmail: '', // Will be fetched in API
              additionalData: {
                newDate: newDate,
                newTime: newTime,
              },
            }),
          });
        } catch (emailError) {
          console.error('Error sending email notification:', emailError);
        }
      }
      
      // Reload bookings to get latest data
      setTimeout(() => {
        loadBookings();
      }, 500);
      
      alert('Appointment rescheduled successfully. The business owner has been notified.');
    } catch (err: any) {
      console.error('Error rescheduling booking:', err);
      alert('Failed to reschedule appointment: ' + (err.message || 'Unknown error'));
    } finally {
      setRescheduling(false);
    }
  };

  const openCancelDialog = (booking: any) => {
    setSelectedBooking(booking);
    setShowCancelDialog(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedBooking || !user || !rating) {
      alert('Please provide a rating');
      return;
    }

    try {
      setSubmittingReview(true);
      
      const insertPromise = supabase
        .from('appointment_reviews')
        .insert({
          booking_id: selectedBooking.id,
          business_profile_id: selectedBooking.business_profile_id,
          customer_email: user.email,
          rating: rating,
          review_text: reviewText || null,
          feedback: feedback || null,
        });

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Update timeout')), 10000)
      );

      const result = await Promise.race([
        insertPromise.then(r => ({ type: 'success', error: r.error })),
        timeoutPromise.then(() => ({ type: 'timeout' }))
      ]) as any;

      if (result.type === 'timeout') {
        throw new Error('Request timed out. Please try again.');
      }

      if (result.error) {
        if (result.error.code === '23505' || result.error.message?.includes('unique')) {
          throw new Error('You have already submitted a review for this appointment.');
        }
        throw result.error;
      }

      // Send email notification to business owner
      if (selectedBooking?.id) {
        try {
          const reviewData = {
            rating: rating,
            review_text: reviewText || null,
            feedback: feedback || null,
          };
          
          await fetch('/api/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'new_review',
              bookingId: selectedBooking.id,
              businessEmail: '', // Will be fetched in API
              additionalData: { review: reviewData },
            }),
          });
        } catch (emailError) {
          console.error('Error sending email notification:', emailError);
        }
      }

      // Close dialog and reset form
      setShowReviewDialog(false);
      setSelectedBooking(null);
      setRating(0);
      setReviewText('');
      setFeedback('');
      
      // Remove review parameter from URL
      router.push('/dashboard/customer/bookings');
      
      alert('Thank you for your review! Your feedback has been submitted.');
    } catch (err: any) {
      console.error('Error submitting review:', err);
      alert('Failed to submit review: ' + (err.message || 'Unknown error'));
    } finally {
      setSubmittingReview(false);
    }
  };

  const openRescheduleDialog = (booking: any) => {
    // Check if already rescheduled
    const createdAt = new Date(booking.created_at);
    const updatedAt = new Date(booking.updated_at);
    const timeDiff = updatedAt.getTime() - createdAt.getTime();
    const hasBeenRescheduled = timeDiff > 60000 && booking.status === 'pending';
    
    if (hasBeenRescheduled) {
      alert('This appointment has already been rescheduled once. Please contact the business directly for further changes.');
      return;
    }
    
    setSelectedBooking(booking);
    const startDate = new Date(booking.start_time);
    setNewDate(startDate.toISOString().split('T')[0]);
    setNewTime(startDate.toTimeString().slice(0, 5));
    setShowRescheduleDialog(true);
  };

  const now = new Date();
  const upcomingBookings = bookings.filter(b => {
    const startTime = new Date(b.start_time);
    return startTime >= now && b.status !== 'cancelled' && b.status !== 'completed';
  });
  const pastBookings = bookings.filter(b => {
    const startTime = new Date(b.start_time);
    return startTime < now || b.status === 'completed' || b.status === 'cancelled';
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'cancelled':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'completed':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        <p className="text-muted-foreground">Loading your bookings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 px-4 sm:px-6 lg:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            My Bookings
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">Manage your appointments</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/dashboard/customer')}
          className="w-full sm:w-auto"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Back to Dashboard</span>
          <span className="sm:hidden">Back</span>
        </Button>
      </div>

      {/* Upcoming Bookings */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Upcoming Appointments</h2>
        {upcomingBookings.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No upcoming appointments</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {upcomingBookings.map((booking) => {
              const startDate = new Date(booking.start_time);
              const service = booking.business_profile_services;
              const business = booking.business_profiles;
              
              // Check if appointment has already been rescheduled
              const createdAt = new Date(booking.created_at);
              const updatedAt = new Date(booking.updated_at);
              const timeDiff = updatedAt.getTime() - createdAt.getTime();
              // If updated_at is more than 1 minute after created_at, it was rescheduled
              const hasBeenRescheduled = timeDiff > 60000 && booking.status === 'pending';

              return (
                <Card
                  key={booking.id}
                  className="border-2 hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {business?.logo_url && (
                          <img
                            src={business.logo_url}
                            alt={business.business_name}
                            className="w-12 h-12 object-contain rounded"
                          />
                        )}
                        <div>
                          <CardTitle className="text-lg">{service?.name || 'Service'}</CardTitle>
                          <p className="text-sm text-muted-foreground">{business?.business_name}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{format(startDate, 'PPP')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{format(startDate, 'p')}</span>
                      </div>
                      {service?.duration_minutes && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Duration: {service.duration_minutes} minutes</span>
                        </div>
                      )}
                      {booking.amount && (
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          <span>Amount: ${Number(booking.amount).toFixed(2)}</span>
                        </div>
                      )}
                    </div>

                    {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                      <div className="space-y-2 pt-2">
                        {hasBeenRescheduled && (
                          <div className="p-2 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs text-yellow-700 dark:text-yellow-400">
                            ⚠️ This appointment has already been rescheduled once. Please contact the business directly for further changes.
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => openRescheduleDialog(booking)}
                            disabled={hasBeenRescheduled}
                            title={hasBeenRescheduled ? 'This appointment has already been rescheduled. Please contact the business for further changes.' : 'Reschedule appointment'}
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            {hasBeenRescheduled ? 'Already Rescheduled' : 'Reschedule'}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="flex-1"
                            onClick={() => openCancelDialog(booking)}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Past Bookings */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Past Appointments</h2>
        {pastBookings.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No past appointments</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {pastBookings.map((booking) => {
              const startDate = new Date(booking.start_time);
              const service = booking.business_profile_services;
              const business = booking.business_profiles;

              return (
                <Card
                  key={booking.id}
                  className="border-2 opacity-75"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {business?.logo_url && (
                          <img
                            src={business.logo_url}
                            alt={business.business_name}
                            className="w-12 h-12 object-contain rounded"
                          />
                        )}
                        <div>
                          <CardTitle className="text-lg">{service?.name || 'Service'}</CardTitle>
                          <p className="text-sm text-muted-foreground">{business?.business_name}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{format(startDate, 'PPP')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{format(startDate, 'p')}</span>
                    </div>
                    {booking.amount && (
                      <div className="text-sm font-semibold pt-2">
                        ${Number(booking.amount).toFixed(2)}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-semibold">{selectedBooking.business_profile_services?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedBooking.business_profiles?.business_name}
                </p>
                <p className="text-sm mt-2">
                  {format(new Date(selectedBooking.start_time), 'PPP p')}
                </p>
              </div>
              <div>
                <Label htmlFor="cancelReason">Reason for cancellation (optional)</Label>
                <Textarea
                  id="cancelReason"
                  placeholder="Let the business know why you're cancelling..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCancelDialog(false);
                setSelectedBooking(null);
                setCancelReason('');
              }}
            >
              Keep Appointment
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={cancelling}
            >
              {cancelling ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Cancel Appointment'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={showRescheduleDialog} onOpenChange={setShowRescheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <DialogDescription>
              Select a new date and time for your appointment.
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-semibold">{selectedBooking.business_profile_services?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedBooking.business_profiles?.business_name}
                </p>
                <p className="text-sm mt-2">
                  Current: {format(new Date(selectedBooking.start_time), 'PPP p')}
                </p>
              </div>
              <div>
                <Label htmlFor="newDate">New Date</Label>
                <Input
                  id="newDate"
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="newTime">New Time</Label>
                <Input
                  id="newTime"
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="mt-2"
                />
              </div>
              {newDate && newTime && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <p className="text-sm font-medium">New appointment time:</p>
                  <p className="text-sm">
                    {format(new Date(`${newDate}T${newTime}`), 'PPP p')}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRescheduleDialog(false);
                setSelectedBooking(null);
                setNewDate('');
                setNewTime('');
              }}
            >
              Keep Original Time
            </Button>
            <Button
              onClick={handleReschedule}
              disabled={rescheduling || !newDate || !newTime}
            >
              {rescheduling ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Rescheduling...
                </>
              ) : (
                'Reschedule Appointment'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review & Feedback Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="px-1 sm:px-0">
            <DialogTitle className="text-lg sm:text-xl">Leave a Review & Feedback</DialogTitle>
            <DialogDescription className="text-sm">
              Share your experience and help us improve our service
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4 sm:space-y-6 py-2 sm:py-4 px-1 sm:px-0">
              <div className="p-3 sm:p-4 bg-muted rounded-lg">
                <p className="font-semibold text-sm sm:text-base truncate">{selectedBooking.business_profile_services?.name}</p>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  {selectedBooking.business_profiles?.business_name}
                </p>
                <p className="text-xs sm:text-sm mt-2">
                  Completed: {format(new Date(selectedBooking.start_time), 'PPP')}
                </p>
              </div>
              
              <div>
                <Label htmlFor="rating" className="text-sm sm:text-base">Rating *</Label>
                <div className="flex items-center gap-1 sm:gap-2 mt-2 flex-wrap">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-6 w-6 sm:h-8 sm:w-8 ${
                          star <= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        } transition-colors`}
                      />
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="ml-1 sm:ml-2 text-xs sm:text-sm text-muted-foreground">
                      {rating} {rating === 1 ? 'star' : 'stars'}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="reviewText" className="text-sm sm:text-base">Public Review (Optional)</Label>
                <Textarea
                  id="reviewText"
                  placeholder="Share your experience with others..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="mt-2 text-sm sm:text-base resize-none"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This review will be visible to other customers
                </p>
              </div>

              <div>
                <Label htmlFor="feedback" className="text-sm sm:text-base">Private Feedback (Optional)</Label>
                <Textarea
                  id="feedback"
                  placeholder="Share private feedback for the business owner..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="mt-2 text-sm sm:text-base resize-none"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This feedback is only visible to the business owner
                </p>
              </div>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 px-1 sm:px-0">
            <Button
              variant="outline"
              onClick={() => {
                setShowReviewDialog(false);
                setSelectedBooking(null);
                setRating(0);
                setReviewText('');
                setFeedback('');
                router.push('/dashboard/customer/bookings');
              }}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={submittingReview || !rating}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 order-1 sm:order-2"
            >
              {submittingReview ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Review'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

