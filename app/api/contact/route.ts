import { NextRequest, NextResponse } from 'next/server';
import { applyPublicMutationGuards } from '@/lib/security/api-guards';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  const blocked = applyPublicMutationGuards(request, 'contact_form', 20, 60 * 60 * 1000);
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const { name, email, businessSize, website, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { ok: false, error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    const recipient = process.env.EMAIL_USER;
    if (recipient) {
      await sendEmail({
        to: recipient,
        subject: `New contact form submission from ${name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #1d4ed8, #312e81); padding: 24px; border-radius: 8px 8px 0 0;">
              <h2 style="color: white; margin: 0;">New Contact Form Submission</h2>
            </div>
            <div style="background: #f9fafb; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; color: #6b7280; width: 140px;"><strong>Name</strong></td><td style="padding: 8px 0;">${name}</td></tr>
                <tr><td style="padding: 8px 0; color: #6b7280;"><strong>Email</strong></td><td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td></tr>
                <tr><td style="padding: 8px 0; color: #6b7280;"><strong>Business Size</strong></td><td style="padding: 8px 0;">${businessSize || 'Not specified'}</td></tr>
                <tr><td style="padding: 8px 0; color: #6b7280;"><strong>Website</strong></td><td style="padding: 8px 0;">${website || 'Not provided'}</td></tr>
              </table>
              <div style="margin-top: 16px; padding: 16px; background: white; border-radius: 6px; border-left: 4px solid #2563eb;">
                <strong style="color: #374151;">Message</strong>
                <p style="margin: 8px 0 0; color: #4b5563; white-space: pre-wrap;">${message}</p>
              </div>
              <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">Reply directly to this email to respond to ${name}.</p>
            </div>
          </div>
        `,
        text: `New contact from ${name} (${email})\nBusiness size: ${businessSize || 'N/A'}\nWebsite: ${website || 'N/A'}\n\nMessage:\n${message}`,
      });
    }

    return NextResponse.json({ ok: true, message: 'Thank you! We will get back to you within 24 hours.' });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to submit' },
      { status: 500 }
    );
  }
}
