import { publicSiteOrigin } from '../public-site-url';

const appUrl = () => publicSiteOrigin();

const wrap = (title: string, inner: string) => `
<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<style>
body{font-family:Arial,sans-serif;line-height:1.6;color:#333;}
.container{max-width:600px;margin:0 auto;padding:20px;}
.header{background:linear-gradient(135deg,#2563eb,#06b6d4);color:#fff;padding:20px;border-radius:8px 8px 0 0;}
.content{background:#f9fafb;padding:20px;border-radius:0 0 8px 8px;}
.btn{display:inline-block;padding:12px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;margin:8px 0;}
.footer{font-size:12px;color:#6b7280;margin-top:16px;text-align:center;}
</style></head><body>
<div class="container"><div class="header"><h2 style="margin:0;">${title}</h2></div>
<div class="content">${inner}</div>
<div class="footer">Inboker</div></div></body></html>`;

export function signupConfirmationEmail(name: string) {
  const n = name || 'there';
  const inner = `
<p>Hi ${n},</p>
<p><strong>Welcome to Inboker!</strong> Your account has been created.</p>
<p>You can now:</p>
<ul>
<li>Create your business profile</li>
<li>Set up services and staff</li>
<li>Start accepting bookings</li>
</ul>
<p><a class="btn" href="${appUrl()}/dashboard">Get started</a></p>
<p>Best regards,<br/>Inboker Team</p>`;
  return { subject: 'Welcome to Inboker!', html: wrap('Welcome', inner) };
}

export function loginAlertEmail(name: string, ip: string, device: string, when: string) {
  const n = name || 'there';
  const inner = `
<p>Hi ${n},</p>
<p>Your Inboker account was just signed in to.</p>
<ul>
<li><strong>IP:</strong> ${ip}</li>
<li><strong>Device:</strong> ${device}</li>
<li><strong>Time:</strong> ${when}</li>
</ul>
<p>If this was not you, reset your password immediately.</p>
<p><a class="btn" href="${appUrl()}/forgot-password">Reset password</a></p>
<p>— Inboker Security</p>`;
  return { subject: 'New login to your Inboker account', html: wrap('Security alert', inner) };
}

export function passwordResetRequestEmail(name: string, resetLink: string) {
  const n = name || 'there';
  const inner = `
<p>Hi ${n},</p>
<p>You requested a password reset for your Inboker account.</p>
<p><a class="btn" href="${resetLink}">Reset password</a></p>
<p>This link may expire after 24 hours. If you did not request this, you can ignore this email.</p>
<p>— Inboker Team</p>`;
  return { subject: 'Password reset request — Inboker', html: wrap('Password reset', inner) };
}

export function passwordChangedEmail(name: string, when: string) {
  const n = name || 'there';
  const inner = `
<p>Hi ${n},</p>
<p>Your Inboker password was successfully changed on <strong>${when}</strong>.</p>
<p>If you did not make this change, use forgot password or contact support.</p>
<p><a class="btn" href="${appUrl()}/forgot-password">Reset password</a></p>
<p>— Inboker Security</p>`;
  return { subject: 'Your Inboker password was changed', html: wrap('Password updated', inner) };
}

export function subscriptionRenewalEmail(ownerName: string, amountLabel: string, nextRenewal: string) {
  const inner = `
<p>Hi ${ownerName},</p>
<p>Your Inboker subscription has been renewed.</p>
<ul>
<li><strong>Amount:</strong> ${amountLabel}</li>
<li><strong>Next renewal:</strong> ${nextRenewal}</li>
<li><strong>Status:</strong> Active</li>
</ul>
<p>Thank you for using Inboker.</p>`;
  return { subject: 'Subscription renewed — Inboker', html: wrap('Subscription renewed', inner) };
}

export function subscriptionExpirationWarningEmail(
  ownerName: string,
  daysLeft: number,
  endDate: string
) {
  const inner = `
<p>Hi ${ownerName},</p>
<p>Your Inboker trial or subscription period ends in <strong>${daysLeft}</strong> day(s), on <strong>${endDate}</strong>.</p>
<p>To keep accepting bookings and your public booking page online, renew before it expires.</p>
<p><a class="btn" href="${appUrl()}/dashboard/business-owner/billing">Manage billing</a></p>
<p>— Inboker Team</p>`;
  return {
    subject: `Your Inboker access ends in ${daysLeft} day(s)`,
    html: wrap('Renewal reminder', inner),
  };
}

export function reviewRequestEmail(
  customerName: string,
  businessName: string,
  serviceName: string,
  reviewUrl: string
) {
  const inner = `
<p>Hi ${customerName},</p>
<p>How was your <strong>${serviceName}</strong> at <strong>${businessName}</strong>?</p>
<p>We would love a quick rating and optional comment.</p>
<p><a class="btn" href="${reviewUrl}">Rate &amp; review</a></p>
<p>Thank you,<br/>${businessName}</p>`;
  return { subject: `How was your visit at ${businessName}?`, html: wrap('We value your feedback', inner) };
}

export function reviewPostedOwnerEmail(
  ownerName: string,
  customerName: string,
  rating: number,
  reviewText: string,
  dashboardUrl: string
) {
  const inner = `
<p>Hi ${ownerName},</p>
<p>You received a new review from <strong>${customerName}</strong>.</p>
<p><strong>Rating:</strong> ${rating}/5</p>
${reviewText ? `<p><em>"${reviewText.replace(/</g, '')}"</em></p>` : ''}
<p><a class="btn" href="${dashboardUrl}">View dashboard</a></p>
<p>— Inboker</p>`;
  return { subject: `New review from ${customerName}`, html: wrap('New review', inner) };
}

export function smsSignupWelcome(name: string) {
  const n = (name || 'there').slice(0, 40);
  return `Hi ${n}! Welcome to Inboker. Sign in: ${appUrl()}/login`;
}

export function smsBookingCustomerConfirm(service: string, when: string, business: string) {
  return `Inboker: Booking confirmed — ${service} on ${when} at ${business}. ${appUrl()}`;
}

export function smsBookingReminder(service: string, when: string, business: string) {
  return `Reminder: ${service} ${when} — ${business}. ${appUrl()}`;
}

export function smsReviewRequest(business: string, url: string) {
  return `How was ${business}? Review: ${url.slice(0, 200)}`;
}

export function smsBookingCancelled(service: string, when: string, business: string) {
  return `Cancelled: ${service} ${when} — ${business}. ${appUrl()}`;
}

export function smsNewReviewOwner(customer: string, rating: number) {
  return `Inboker: New ${rating}★ review from ${customer.slice(0, 30)}`;
}
