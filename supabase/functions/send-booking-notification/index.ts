import { createClient } from 'npm:@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { booking_id, notification_type } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        client:clients(*),
        provider:workspace_members(
          *,
          user:users(*)
        ),
        service:services(*),
        workspace:workspaces(*)
      `)
      .eq('id', booking_id)
      .single();

    if (bookingError || !booking) {
      throw new Error('Booking not found');
    }

    let emailContent = '';
    let subject = '';
    let recipient = '';

    if (notification_type === 'client_confirmation') {
      recipient = booking.client.email;
      subject = `Booking Confirmation - ${booking.workspace.name}`;
      emailContent = `
        <h1>Booking Confirmed</h1>
        <p>Hi ${booking.client.full_name},</p>
        <p>Your booking has been confirmed!</p>
        <h3>Details:</h3>
        <ul>
          <li><strong>Service:</strong> ${booking.service?.name || booking.title}</li>
          <li><strong>Date:</strong> ${new Date(booking.start_time).toLocaleDateString()}</li>
          <li><strong>Time:</strong> ${new Date(booking.start_time).toLocaleTimeString()}</li>
          <li><strong>Provider:</strong> ${booking.provider.user.full_name}</li>
          ${booking.service ? `<li><strong>Price:</strong> $${booking.service.price}</li>` : ''}
        </ul>
        <p>Looking forward to seeing you!</p>
        <p>Best regards,<br>${booking.workspace.name}</p>
      `;
    } else if (notification_type === 'provider_notification') {
      recipient = booking.provider.user.email;
      subject = `New Booking - ${booking.client.full_name}`;
      emailContent = `
        <h1>New Booking</h1>
        <p>Hi ${booking.provider.user.full_name},</p>
        <p>You have a new booking!</p>
        <h3>Details:</h3>
        <ul>
          <li><strong>Client:</strong> ${booking.client.full_name}</li>
          <li><strong>Service:</strong> ${booking.service?.name || booking.title}</li>
          <li><strong>Date:</strong> ${new Date(booking.start_time).toLocaleDateString()}</li>
          <li><strong>Time:</strong> ${new Date(booking.start_time).toLocaleTimeString()}</li>
        </ul>
      `;
    }

    console.log(`Would send email to ${recipient} with subject: ${subject}`);
    console.log(`Email content: ${emailContent}`);

    return new Response(
      JSON.stringify({ success: true, message: 'Notification logged (email service not configured)' }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error: any) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
});
