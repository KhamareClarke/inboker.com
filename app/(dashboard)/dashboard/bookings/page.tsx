'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { AddBookingDialog } from '@/components/booking/add-booking-dialog';
import { Loader2, Calendar, User, Clock } from 'lucide-react';
import { useWorkspace } from '@/lib/providers/workspace-provider';
import { getBookings, updateBookingStatus } from '@/lib/actions/bookings';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function BookingsPage() {
  const { workspace } = useWorkspace();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, [workspace]);

  const loadBookings = async () => {
    if (!workspace) return;
    setLoading(true);
    try {
      const data = await getBookings(workspace.id);
      setBookings(data || []);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      await updateBookingStatus(bookingId, newStatus as any);
      toast({ title: 'Success', description: 'Booking status updated' });
      loadBookings();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div>
        <Header title="Bookings" />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Bookings" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            View and manage all appointments
          </p>
          {workspace && <AddBookingDialog workspaceId={workspace.id} onBookingAdded={loadBookings} />}
        </div>

        {bookings.length === 0 ? (
          <Card className="p-12 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-4">No bookings yet</p>
            <p className="text-sm text-muted-foreground">Create your first booking to get started</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {bookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{booking.title}</CardTitle>
                    <Select value={booking.status} onValueChange={(value) => handleStatusChange(booking.id, value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{booking.client?.full_name || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{format(new Date(booking.start_time), 'PPP')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {format(new Date(booking.start_time), 'p')} - {format(new Date(booking.end_time), 'p')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>Provider: {booking.provider?.user?.full_name || 'Unknown'}</span>
                    </div>
                    {booking.service && (
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <span className="text-green-600">${booking.service.price}</span>
                        <span className="text-muted-foreground">•</span>
                        <span>{booking.service.duration_minutes} min</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
