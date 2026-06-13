import nodemailer from 'nodemailer';
import { publicSiteOrigin } from './public-site-url';

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
              <p>Hello ${booking.client_name || 'there'},</p>
              <p>This is a reminder that your appointment at <strong>${businessName}</strong> is ${reminderType === 'day' ? 'tomorrow' : 'in 1 hour'}.</p>
              
              <div class="info-box">
                <div class="info-row">
                  <span class="label">Service:</span> ${booking.business_profile_services?.name || 'N/A'}
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
                ${booking.client_notes ? `<div class="info-row"><span class="label">Your notes:</span> ${booking.client_notes}</div>` : ''}
              </div>
              
              <p>We look forward to seeing you.</p>
            </div>
            <div class="footer">
              <p>This is an automated reminder from ${businessName}</p>
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

  // Trial and subscription emails
  trialStarted: (userName: string, trialEndDate: Date) => ({
    subject: '🎉 Welcome to Inboker - Your Free Trial Has Started!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 6px; border-left: 4px solid #10b981; }
            .button { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%); color: white; text-decoration: none; border-radius: 6px; margin: 10px 5px; font-weight: bold; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to Inboker!</h1>
            </div>
            <div class="content">
              <p>Hello ${userName},</p>
              <p><strong>Your account has been created and your free trial has started!</strong></p>
              
              <div class="info-box">
                <h3 style="margin-top: 0; color: #059669;">✨ Your Free Trial Details</h3>
                <p><strong>Trial End Date:</strong> ${trialEndDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
                <p>You now have full access to all features during your 14-day free trial period.</p>
              </div>
              
              <p>You can now:</p>
              <ul>
                <li>✅ Create and manage your business profile</li>
                <li>✅ Add services and staff members</li>
                <li>✅ Accept bookings from customers</li>
                <li>✅ Use all premium features</li>
              </ul>
              
              <p style="text-align: center; margin-top: 30px;">
                <a href="${publicSiteOrigin()}/dashboard/business-owner" class="button">Go to Dashboard</a>
              </p>
              
              <p style="margin-top: 30px; padding: 15px; background: #fef3c7; border-radius: 6px; border-left: 4px solid #f59e0b;">
                <strong>📅 Important:</strong> After ${trialEndDate.toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric' 
                })}, you will be automatically charged for your subscription. You can cancel anytime during your trial.
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

  trialEndingReminder: (userName: string, daysRemaining: number, trialEndDate: Date) => ({
    subject: `⏰ Your Free Trial Ends in ${daysRemaining} ${daysRemaining === 1 ? 'Day' : 'Days'}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 6px; border-left: 4px solid #f59e0b; }
            .button { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%); color: white; text-decoration: none; border-radius: 6px; margin: 10px 5px; font-weight: bold; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏰ Trial Ending Soon</h1>
            </div>
            <div class="content">
              <p>Hello ${userName},</p>
              <p><strong>Your free trial ends in ${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'}!</strong></p>
              
              <div class="info-box">
                <h3 style="margin-top: 0; color: #f97316;">📅 Trial End Date</h3>
                <p><strong>${trialEndDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</strong></p>
                <p>After this date, you will be automatically charged for your subscription.</p>
              </div>
              
              <p>Don't worry - you can continue enjoying all features. If you'd like to cancel before being charged, you can do so from your billing dashboard.</p>
              
              <p style="text-align: center; margin-top: 30px;">
                <a href="${publicSiteOrigin()}/dashboard/business-owner/billing" class="button">Manage Subscription</a>
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

  trialEnded: (userName: string, planName: string, amount: number) => ({
    subject: '💳 Your Trial Has Ended - You Will Be Charged Now',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 6px; border-left: 4px solid #2563eb; }
            .button { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%); color: white; text-decoration: none; border-radius: 6px; margin: 10px 5px; font-weight: bold; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💳 Trial Period Ended</h1>
            </div>
            <div class="content">
              <p>Hello ${userName},</p>
              <p><strong>Your free trial has ended. You will now be charged for your subscription.</strong></p>
              
              <div class="info-box">
                <h3 style="margin-top: 0; color: #2563eb;">📋 Subscription Details</h3>
                <p><strong>Plan:</strong> ${planName}</p>
                <p><strong>Amount:</strong> £${amount.toFixed(2)}</p>
                <p>Your payment method on file will be charged automatically.</p>
              </div>
              
              <p>Thank you for using Inboker! You can continue to access all features with your active subscription.</p>
              
              <p style="text-align: center; margin-top: 30px;">
                <a href="${publicSiteOrigin()}/dashboard/business-owner" class="button">Go to Dashboard</a>
                <a href="${publicSiteOrigin()}/dashboard/business-owner/billing" class="button">View Billing</a>
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

  passwordResetByAdmin: (displayName: string) => ({
    subject: 'Your Inboker password was reset by an administrator',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); color: white; padding: 24px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 24px; border-radius: 0 0 8px 8px; }
            .info-box { background: white; padding: 16px; margin: 16px 0; border-radius: 6px; border-left: 4px solid #7c3aed; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin:0;">Password reset</h2>
            </div>
            <div class="content">
              <p>Hello ${displayName},</p>
              <p>An administrator has reset the password on your Inboker account.</p>
              <div class="info-box">
                <p style="margin:0;"><strong>For your security, your new password is not included in this email.</strong></p>
                <p style="margin:12px 0 0 0;">Use the temporary password that support shared with you, then change it after you sign in.</p>
              </div>
              <p>If you did not expect this change, contact support immediately.</p>
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

