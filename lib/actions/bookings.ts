'use server';

import { supabase } from '../supabase';
import { revalidatePath } from 'next/cache';

export async function getBookings(workspaceId: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      client:clients(*),
      provider:workspace_members(
        *,
        user:users(*)
      )
    `)
    .eq('workspace_id', workspaceId)
    .order('start_time', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getUpcomingBookings(workspaceId: string) {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      client:clients(*),
      provider:workspace_members(
        *,
        user:users(*)
      )
    `)
    .eq('workspace_id', workspaceId)
    .gte('start_time', now)
    .order('start_time', { ascending: true })
    .limit(10);

  if (error) throw error;
  return data;
}

export async function createBooking(data: {
  workspace_id: string;
  client_id: string;
  provider_id: string;
  service_id?: string;
  title: string;
  start_time: string;
  end_time: string;
  description?: string;
  status?: string;
  source?: string;
}) {
  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      workspace_id: data.workspace_id,
      client_id: data.client_id,
      provider_id: data.provider_id,
      service_id: data.service_id,
      title: data.title,
      description: data.description,
      start_time: data.start_time,
      end_time: data.end_time,
      status: data.status || 'pending',
      source: data.source,
    })
    .select(`
      *,
      client:clients(*),
      provider:workspace_members(
        *,
        user:users(*)
      ),
      service:services(*)
    `)
    .single();

  if (error) throw error;

  await supabase
    .from('client_activities')
    .insert({
      workspace_id: data.workspace_id,
      client_id: data.client_id,
      activity_type: 'booking',
      title: 'Booking Created',
      description: `Appointment scheduled for ${data.start_time}`,
      metadata: { booking_id: booking.id },
    });

  revalidatePath('/dashboard/bookings');
  revalidatePath('/dashboard/calendar');
  return booking;
}

export async function updateBookingStatus(
  bookingId: string,
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
) {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId)
    .select(`
      *,
      client:clients(*),
      provider:workspace_members(
        *,
        user:users(*)
      )
    `)
    .single();

  if (error) throw error;

  if (status === 'completed') {
    await supabase
      .from('clients')
      .update({
        lead_score: supabase.rpc('increment_lead_score', { client_id: data.client_id, points: 50 }),
      })
      .eq('id', data.client_id);
  }

  revalidatePath('/dashboard/bookings');
  revalidatePath('/dashboard/calendar');
  return data;
}

export async function updateBookingPayment(
  bookingId: string,
  paymentStatus: 'unpaid' | 'paid' | 'refunded',
  amount?: number
) {
  const updateData: any = { payment_status: paymentStatus };
  if (amount !== undefined) {
    updateData.amount = amount;
  }

  const { data, error } = await supabase
    .from('bookings')
    .update(updateData)
    .eq('id', bookingId)
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/dashboard/bookings');
  return data;
}

export async function deleteBooking(bookingId: string) {
  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', bookingId);

  if (error) throw error;
  revalidatePath('/dashboard/bookings');
  revalidatePath('/dashboard/calendar');
}
