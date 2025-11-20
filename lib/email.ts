import nodemailer from 'nodemailer';

// Create reusable transporter using Gmail SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Email credentials not configured');
      return false;
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: `"Inboker" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

// Email templates
export const emailTemplates = {
  newBooking: (booking: any, businessName: string) => ({
    subject: `New Booking: ${booking.business_profile_services?.name || 'Appointment'}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
            .info-box { background: white; padding: 15px; margin: 15px 0; border-radius: 6px; border-left: 4px solid #2563eb; }
            .info-row { margin: 10px 0; }
            .label { font-weight: bold; color: #4b5563; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>🎉 New Booking Received</h2>
            </div>
            <div class="content">
              <p>Hello ${businessName},</p>
              <p>You have received a new booking!</p>
              
              <div class="info-box">
                <div class="info-row">
                  <span class="label">Service:</span> ${booking.business_profile_services?.name || 'N/A'}
                </div>
                <div class="info-row">
                  <span class="label">Client Name:</span> ${booking.client_name}
                </div>
                <div class="info-row">
                  <span class="label">Client Email:</span> ${booking.client_email}
                </div>
                ${booking.client_phone ? `<div class="info-row"><span class="label">Client Phone:</span> ${booking.client_phone}</div>` : ''}
                <div class="info-row">
                  <span class="label">Date & Time:</span> ${new Date(booking.start_time).toLocaleString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </div>
                <div class="info-row">
                  <span class="label">Duration:</span> ${booking.business_profile_services?.duration_minutes || 60} minutes
                </div>
                <div class="info-row">
                  <span class="label">Amount:</span> $${Number(booking.amount || 0).toFixed(2)}
                </div>
                <div class="info-row">
                  <span class="label">Status:</span> ${booking.status}
                </div>
                ${booking.client_notes ? `<div class="info-row"><span class="label">Notes:</span> ${booking.client_notes}</div>` : ''}
              </div>
              
              <p>Please log in to your dashboard to confirm or manage this booking.</p>
            </div>
            <div class="footer">
              <p>This is an automated email from Inboker</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  bookingCancelled: (booking: any, businessName: string, cancelledBy: string) => ({
    subject: `Booking Cancelled: ${booking.business_profile_services?.name || 'Appointment'}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
            .info-box { background: white; padding: 15px; margin: 15px 0; border-radius: 6px; border-left: 4px solid #dc2626; }
            .info-row { margin: 10px 0; }
            .label { font-weight: bold; color: #4b5563; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>❌ Booking Cancelled</h2>
            </div>
            <div class="content">
              <p>Hello ${businessName},</p>
              <p>A booking has been cancelled ${cancelledBy === 'customer' ? 'by the customer' : 'by you'}.</p>
              
              <div class="info-box">
                <div class="info-row">
                  <span class="label">Service:</span> ${booking.business_profile_services?.name || 'N/A'}
                </div>
                <div class="info-row">
                  <span class="label">Client Name:</span> ${booking.client_name}
                </div>
                <div class="info-row">
                  <span class="label">Original Date & Time:</span> ${new Date(booking.start_time).toLocaleString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </div>
              </div>
              
              <p>This time slot is now available for other bookings.</p>
            </div>
            <div class="footer">
              <p>This is an automated email from Inboker</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  bookingRescheduled: (booking: any, businessName: string, newDate: string, newTime: string) => ({
    subject: `Booking Rescheduled: ${booking.business_profile_services?.name || 'Appointment'}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
            .info-box { background: white; padding: 15px; margin: 15px 0; border-radius: 6px; border-left: 4px solid #f59e0b; }
            .info-row { margin: 10px 0; }
            .label { font-weight: bold; color: #4b5563; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>🔄 Booking Rescheduled</h2>
            </div>
            <div class="content">
              <p>Hello ${businessName},</p>
              <p>A booking has been rescheduled.</p>
              
              <div class="info-box">
                <div class="info-row">
                  <span class="label">Service:</span> ${booking.business_profile_services?.name || 'N/A'}
                </div>
                <div class="info-row">
                  <span class="label">Client Name:</span> ${booking.client_name}
                </div>
                <div class="info-row">
                  <span class="label">Original Date & Time:</span> ${new Date(booking.start_time).toLocaleString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </div>
                <div class="info-row">
                  <span class="label">New Date & Time:</span> ${newDate} at ${newTime}
                </div>
              </div>
              
              <p>Please update your calendar accordingly.</p>
            </div>
            <div class="footer">
              <p>This is an automated email from Inboker</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  appointmentReminder: (booking: any, businessName: string, reminderType: 'day' | 'hour') => ({
    subject: `Reminder: ${reminderType === 'day' ? 'Appointment Tomorrow' : 'Appointment in 1 Hour'} - ${booking.business_profile_services?.name || 'Appointment'}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
            .info-box { background: white; padding: 15px; margin: 15px 0; border-radius: 6px; border-left: 4px solid #2563eb; }
            .info-row { margin: 10px 0; }
            .label { font-weight: bold; color: #4b5563; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>⏰ Appointment Reminder</h2>
            </div>
            <div class="content">
              <p>Hello ${businessName},</p>
              <p>This is a reminder that you have an appointment ${reminderType === 'day' ? 'tomorrow' : 'in 1 hour'}.</p>
              
              <div class="info-box">
                <div class="info-row">
                  <span class="label">Service:</span> ${booking.business_profile_services?.name || 'N/A'}
                </div>
                <div class="info-row">
                  <span class="label">Client Name:</span> ${booking.client_name}
                </div>
                <div class="info-row">
                  <span class="label">Client Email:</span> ${booking.client_email}
                </div>
                ${booking.client_phone ? `<div class="info-row"><span class="label">Client Phone:</span> ${booking.client_phone}</div>` : ''}
                <div class="info-row">
                  <span class="label">Date & Time:</span> ${new Date(booking.start_time).toLocaleString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </div>
                <div class="info-row">
                  <span class="label">Duration:</span> ${booking.business_profile_services?.duration_minutes || 60} minutes
                </div>
                ${booking.client_notes ? `<div class="info-row"><span class="label">Notes:</span> ${booking.client_notes}</div>` : ''}
              </div>
              
              <p>Please make sure you're prepared for this appointment.</p>
            </div>
            <div class="footer">
              <p>This is an automated email from Inboker</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  newReview: (review: any, booking: any, businessName: string) => ({
    subject: `New Review Received: ${booking.business_profile_services?.name || 'Appointment'}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
            .info-box { background: white; padding: 15px; margin: 15px 0; border-radius: 6px; border-left: 4px solid #10b981; }
            .review-box { background: #f0fdf4; padding: 15px; margin: 15px 0; border-radius: 6px; border: 1px solid #10b981; }
            .rating { font-size: 24px; color: #fbbf24; }
            .info-row { margin: 10px 0; }
            .label { font-weight: bold; color: #4b5563; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>⭐ New Review Received</h2>
            </div>
            <div class="content">
              <p>Hello ${businessName},</p>
              <p>You have received a new review for an appointment!</p>
              
              <div class="info-box">
                <div class="info-row">
                  <span class="label">Service:</span> ${booking.business_profile_services?.name || 'N/A'}
                </div>
                <div class="info-row">
                  <span class="label">Client:</span> ${booking.client_name}
                </div>
                <div class="info-row">
                  <span class="label">Appointment Date:</span> ${new Date(booking.start_time).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric'
                  })}
                </div>
              </div>
              
              <div class="review-box">
                <div class="info-row">
                  <span class="label">Rating:</span> 
                  <span class="rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</span> (${review.rating}/5)
                </div>
                ${review.review_text ? `
                  <div class="info-row">
                    <span class="label">Public Review:</span>
                    <p style="margin-top: 5px;">${review.review_text}</p>
                  </div>
                ` : ''}
                ${review.feedback ? `
                  <div class="info-row">
                    <span class="label">Private Feedback:</span>
                    <p style="margin-top: 5px;">${review.feedback}</p>
                  </div>
                ` : ''}
              </div>
            </div>
            <div class="footer">
              <p>This is an automated email from Inboker</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  // Customer email templates
  customerBookingConfirmed: (booking: any, businessName: string, dashboardUrl: string) => ({
    subject: `Appointment Confirmed: ${booking.business_profile_services?.name || 'Appointment'}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
            .info-box { background: white; padding: 15px; margin: 15px 0; border-radius: 6px; border-left: 4px solid #10b981; }
            .button { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%); color: white; text-decoration: none; border-radius: 6px; margin: 15px 0; font-weight: bold; }
            .info-row { margin: 10px 0; }
            .label { font-weight: bold; color: #4b5563; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>✅ Appointment Confirmed</h2>
            </div>
            <div class="content">
              <p>Hello ${booking.client_name},</p>
              <p>Great news! Your appointment has been confirmed by ${businessName}.</p>
              
              <div class="info-box">
                <div class="info-row">
                  <span class="label">Service:</span> ${booking.business_profile_services?.name || 'N/A'}
                </div>
                <div class="info-row">
                  <span class="label">Business:</span> ${businessName}
                </div>
                <div class="info-row">
                  <span class="label">Date & Time:</span> ${new Date(booking.start_time).toLocaleString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </div>
                <div class="info-row">
                  <span class="label">Duration:</span> ${booking.business_profile_services?.duration_minutes || 60} minutes
                </div>
                <div class="info-row">
                  <span class="label">Amount:</span> $${Number(booking.amount || 0).toFixed(2)}
                </div>
              </div>
              
              <p>We look forward to seeing you!</p>
              <a href="${dashboardUrl}" class="button">View in Dashboard</a>
            </div>
            <div class="footer">
              <p>This is an automated email from Inboker</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  customerBookingCancelled: (booking: any, businessName: string, cancelledBy: string, dashboardUrl: string) => ({
    subject: `Appointment Cancelled: ${booking.business_profile_services?.name || 'Appointment'}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
            .info-box { background: white; padding: 15px; margin: 15px 0; border-radius: 6px; border-left: 4px solid #dc2626; }
            .button { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%); color: white; text-decoration: none; border-radius: 6px; margin: 15px 0; font-weight: bold; }
            .info-row { margin: 10px 0; }
            .label { font-weight: bold; color: #4b5563; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>❌ Appointment Cancelled</h2>
            </div>
            <div class="content">
              <p>Hello ${booking.client_name},</p>
              <p>Your appointment has been cancelled ${cancelledBy === 'business_owner' ? `by ${businessName}` : 'by you'}.</p>
              
              <div class="info-box">
                <div class="info-row">
                  <span class="label">Service:</span> ${booking.business_profile_services?.name || 'N/A'}
                </div>
                <div class="info-row">
                  <span class="label">Business:</span> ${businessName}
                </div>
                <div class="info-row">
                  <span class="label">Original Date & Time:</span> ${new Date(booking.start_time).toLocaleString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </div>
              </div>
              
              ${cancelledBy === 'business_owner' ? '<p>We apologize for any inconvenience. Please feel free to book a new appointment at your convenience.</p>' : '<p>If you need to reschedule, please book a new appointment.</p>'}
              <a href="${dashboardUrl}" class="button">View Bookings</a>
            </div>
            <div class="footer">
              <p>This is an automated email from Inboker</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  customerBookingCompleted: (booking: any, businessName: string, dashboardUrl: string, reviewUrl: string) => ({
    subject: `Appointment Completed: ${booking.business_profile_services?.name || 'Appointment'}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
            .info-box { background: white; padding: 15px; margin: 15px 0; border-radius: 6px; border-left: 4px solid #2563eb; }
            .review-box { background: #fef3c7; padding: 20px; margin: 20px 0; border-radius: 6px; border: 2px solid #fbbf24; text-align: center; }
            .button { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%); color: white; text-decoration: none; border-radius: 6px; margin: 10px 5px; font-weight: bold; }
            .button-review { background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); }
            .info-row { margin: 10px 0; }
            .label { font-weight: bold; color: #4b5563; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>✨ Appointment Completed</h2>
            </div>
            <div class="content">
              <p>Hello ${booking.client_name},</p>
              <p>Your appointment with ${businessName} has been marked as completed.</p>
              
              <div class="info-box">
                <div class="info-row">
                  <span class="label">Service:</span> ${booking.business_profile_services?.name || 'N/A'}
                </div>
                <div class="info-row">
                  <span class="label">Business:</span> ${businessName}
                </div>
                <div class="info-row">
                  <span class="label">Date & Time:</span> ${new Date(booking.start_time).toLocaleString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </div>
              </div>
              
              <div class="review-box">
                <h3 style="margin-top: 0; color: #92400e;">⭐ Share Your Experience</h3>
                <p>We hope you had a great experience! Your feedback helps us improve and helps other customers make informed decisions.</p>
                <a href="${reviewUrl}" class="button button-review">Leave a Review</a>
              </div>
              
              <p style="text-align: center;">
                <a href="${dashboardUrl}" class="button">View All Bookings</a>
              </p>
            </div>
            <div class="footer">
              <p>This is an automated email from Inboker</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),
};

