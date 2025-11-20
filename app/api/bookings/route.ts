import { NextRequest, NextResponse } from 'next/server';
import { createBooking, updateBookingStatus } from '@/lib/actions/bookings';

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspace_id, client_id, provider_id, service_id, title, start_time, end_time, status } = body;

    if (!workspace_id || !client_id || !provider_id || !title || !start_time || !end_time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const booking = await createBooking({
      workspace_id,
      client_id,
      provider_id,
      service_id,
      title,
      start_time,
      end_time,
      status: status || 'pending',
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error: any) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create booking' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { booking_id, status } = body;

    if (!booking_id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const booking = await updateBookingStatus(booking_id, status);
    return NextResponse.json(booking, { status: 200 });
  } catch (error: any) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update booking' },
      { status: 500 }
    );
  }
}
