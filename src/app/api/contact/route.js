import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email and message are required.' }, { status: 400 });
    }

    // --- Store in Supabase ---
    const { error: dbError } = await supabase
      .from('contact_messages')
      .insert([{ name, email, subject: subject || 'General Inquiry', message, status: 'unread' }]);

    if (dbError) {
      console.error('Contact DB error:', dbError.message);
      // Don't fail — still send the email
    }

    // --- Notify admin ---
    await resend.emails.send({
      from: 'SMAK Contact <official@smakresearch.com>',
      to: 'official@smakresearch.com',
      subject: `[Contact] ${subject || 'New Message'} — from ${name}`,
      html: `
<div style="font-family:Arial,sans-serif;background:#050B14;color:#fff;padding:24px;border-radius:12px;max-width:600px;">
  <div style="border-bottom:1px solid rgba(37,99,235,0.3);padding-bottom:16px;margin-bottom:20px;">
    <span style="color:#60A5FA;font-size:11px;font-family:monospace;letter-spacing:2px;text-transform:uppercase;">⚡ NEW CONTACT MESSAGE</span>
    <h2 style="color:#fff;margin:8px 0 0;">${subject || 'General Inquiry'}</h2>
  </div>
  <p><b style="color:#94A3B8;">From:</b> <span style="color:#fff;">${name}</span></p>
  <p><b style="color:#94A3B8;">Email:</b> <a href="mailto:${email}" style="color:#60A5FA;">${email}</a></p>
  <hr style="border-color:rgba(255,255,255,0.08);margin:20px 0;"/>
  <p style="color:#CBD5E1;line-height:1.7;white-space:pre-wrap;">${message}</p>
  <div style="margin-top:24px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.08);">
    <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject || 'Your inquiry')}" 
       style="background:#2563EB;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:13px;">
      Reply to ${name}
    </a>
  </div>
</div>`,
    });

    // --- Auto-reply to sender ---
    await resend.emails.send({
      from: 'SMAK Research <official@smakresearch.com>',
      to: email,
      subject: `We received your message — SMAK Research`,
      html: `
<div style="font-family:'Segoe UI',Arial,sans-serif;background:#050B14;color:#fff;max-width:600px;margin:0 auto;border:1px solid rgba(37,99,235,0.3);border-radius:16px;overflow:hidden;">
  <div style="background:linear-gradient(135deg,#0A1220,#0D1B35);padding:36px 40px 28px;border-bottom:1px solid rgba(37,99,235,0.2);">
    <span style="background:rgba(37,99,235,0.15);border:1px solid rgba(37,99,235,0.3);border-radius:20px;padding:5px 14px;color:#60A5FA;font-size:11px;font-family:monospace;letter-spacing:2px;text-transform:uppercase;">MESSAGE RECEIVED</span>
    <h1 style="color:#fff;font-size:24px;margin:16px 0 6px;">Thanks, ${name}! 👋</h1>
    <p style="color:#94A3B8;margin:0;font-size:14px;">We'll get back to you within 24–48 hours.</p>
  </div>
  <div style="padding:28px 40px;">
    <p style="color:#CBD5E1;font-size:14px;line-height:1.7;">Your message has been received by the SMAK team. Here's a copy of what you sent:</p>
    <div style="background:rgba(37,99,235,0.06);border:1px solid rgba(37,99,235,0.15);border-radius:10px;padding:18px;margin:18px 0;">
      <p style="color:#64748B;font-size:11px;font-family:monospace;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Subject</p>
      <p style="color:#fff;font-size:14px;font-weight:600;margin:0 0 16px;">${subject || 'General Inquiry'}</p>
      <p style="color:#64748B;font-size:11px;font-family:monospace;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Message</p>
      <p style="color:#CBD5E1;font-size:14px;line-height:1.6;margin:0;white-space:pre-wrap;">${message}</p>
    </div>
    <p style="color:#64748B;font-size:13px;">Questions? Reply directly to this email or reach us at <a href="mailto:official@smakresearch.com" style="color:#60A5FA;">official@smakresearch.com</a></p>
  </div>
  <div style="background:#050B14;padding:20px 40px;border-top:1px solid rgba(255,255,255,0.05);text-align:center;">
    <p style="color:#334155;font-size:11px;margin:0;font-family:monospace;letter-spacing:1px;">SOCIETY FOR MEDICAL ACADEMIA & KNOWLEDGE · smakresearch.com</p>
  </div>
</div>`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Contact API error:', err);
    return NextResponse.json({ error: 'Failed to send message. Please try again.' }, { status: 500 });
  }
}
