import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      event_id,
      name,
      email,
      phone,
      college,
      payment_id,
      order_id,
      razorpay_signature,
      amount,
      is_free = false,
    } = body;

    if (!event_id || !name || !email || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // --- Verify Razorpay Signature for paid events ---
    if (!is_free && payment_id && order_id && razorpay_signature) {
      const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${order_id}|${payment_id}`)
        .digest('hex');

      if (generatedSignature !== razorpay_signature) {
        return NextResponse.json({ error: 'Payment verification failed — invalid signature' }, { status: 400 });
      }
    }

    // --- Duplicate check ---
    const { data: existing } = await supabase
      .from('events_enrollments')
      .select('id')
      .eq('event_id', event_id)
      .eq('email', email)
      .eq('payment_status', 'success')
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'already_enrolled', message: 'You are already enrolled in this event.' }, { status: 409 });
    }

    // --- Fetch event info for email ---
    const { data: event } = await supabase
      .from('events')
      .select('title, date, location, capacity')
      .eq('id', event_id)
      .single();

    // --- Count current enrollments to check capacity ---
    if (event?.capacity) {
      const { count } = await supabase
        .from('events_enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', event_id)
        .eq('payment_status', 'success');

      if (count >= event.capacity) {
        return NextResponse.json({ error: 'Event is fully booked.' }, { status: 409 });
      }
    }

    // --- Insert enrollment ---
    // Note: only include razorpay_signature when present — Supabase schema cache
    // throws an error if you pass a column key with null value and cache is stale.
    const enrollmentPayload = {
      event_id,
      name,
      email,
      phone,
      college: college || null,
      payment_id: payment_id || null,
      order_id: order_id || null,
      amount: amount || 0,
      payment_status: is_free ? 'free' : 'success',
    }
    if (razorpay_signature) {
      enrollmentPayload.razorpay_signature = razorpay_signature
    }

    const { data: enrollment, error: insertError } = await supabase
      .from('events_enrollments')
      .insert([enrollmentPayload])
      .select()
      .single();

    if (insertError) {
      console.error('Enrollment insert error:', JSON.stringify(insertError, null, 2));
      return NextResponse.json({ 
        error: 'Failed to save enrollment.', 
        detail: insertError.message,
        code: insertError.code,
        hint: insertError.hint,
      }, { status: 500 });
    }

    // --- Send confirmation email to user ---
    const eventTitle = event?.title || 'SMAK Event';
    const eventDate = event?.date || 'TBD';
    const eventLocation = event?.location || 'Online';
    const amountDisplay = is_free ? 'FREE' : `₹${amount}`;

    await resend.emails.send({
      from: 'SMAK <official@smakresearch.com>',
      to: email,
      subject: `✅ Enrolled: ${eventTitle} — SMAK Research`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#050B14;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#0A1220;border:1px solid rgba(37,99,235,0.3);border-radius:16px;overflow:hidden;">
    
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0A1220 0%,#0D1B35 100%);padding:40px 40px 30px;border-bottom:1px solid rgba(37,99,235,0.2);">
      <div style="display:inline-block;background:rgba(37,99,235,0.15);border:1px solid rgba(37,99,235,0.3);border-radius:20px;padding:6px 16px;margin-bottom:20px;">
        <span style="color:#60A5FA;font-size:11px;font-family:monospace;letter-spacing:2px;text-transform:uppercase;">⚡ ENROLLMENT CONFIRMED</span>
      </div>
      <h1 style="color:#ffffff;font-size:28px;font-weight:800;margin:0 0 8px;letter-spacing:-0.5px;">You're In! 🎉</h1>
      <p style="color:#94A3B8;margin:0;font-size:14px;">Your registration for <strong style="color:#60A5FA;">${eventTitle}</strong> is confirmed.</p>
    </div>

    <!-- Body -->
    <div style="padding:32px 40px;">
      <p style="color:#CBD5E1;font-size:15px;margin:0 0 24px;">Hi <strong style="color:#ffffff;">${name}</strong>,</p>
      <p style="color:#94A3B8;font-size:14px;line-height:1.7;margin:0 0 28px;">
        Your spot has been secured. Here are your event details:
      </p>

      <!-- Event Info Card -->
      <div style="background:rgba(37,99,235,0.08);border:1px solid rgba(37,99,235,0.2);border-radius:12px;padding:24px;margin-bottom:28px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
              <span style="color:#64748B;font-size:11px;font-family:monospace;text-transform:uppercase;letter-spacing:1px;">Event</span>
            </td>
            <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);text-align:right;">
              <span style="color:#ffffff;font-size:14px;font-weight:600;">${eventTitle}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
              <span style="color:#64748B;font-size:11px;font-family:monospace;text-transform:uppercase;letter-spacing:1px;">Date</span>
            </td>
            <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);text-align:right;">
              <span style="color:#60A5FA;font-size:14px;font-family:monospace;">${eventDate}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
              <span style="color:#64748B;font-size:11px;font-family:monospace;text-transform:uppercase;letter-spacing:1px;">Location</span>
            </td>
            <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);text-align:right;">
              <span style="color:#ffffff;font-size:14px;">${eventLocation}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
              <span style="color:#64748B;font-size:11px;font-family:monospace;text-transform:uppercase;letter-spacing:1px;">Amount Paid</span>
            </td>
            <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);text-align:right;">
              <span style="color:#34D399;font-size:14px;font-weight:700;">${amountDisplay}</span>
            </td>
          </tr>
          ${payment_id ? `
          <tr>
            <td style="padding:8px 0;">
              <span style="color:#64748B;font-size:11px;font-family:monospace;text-transform:uppercase;letter-spacing:1px;">Payment ID</span>
            </td>
            <td style="padding:8px 0;text-align:right;">
              <span style="color:#94A3B8;font-size:12px;font-family:monospace;">${payment_id}</span>
            </td>
          </tr>
          ` : ''}
        </table>
      </div>

      <!-- CTA Button -->
      <div style="text-align:center;margin-bottom:32px;">
        <a href="https://smakresearch.com/events" style="display:inline-block;background:linear-gradient(135deg,#2563EB,#1D4ED8);color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:14px;font-weight:700;letter-spacing:0.5px;">
          View All Events →
        </a>
      </div>

      <p style="color:#64748B;font-size:13px;line-height:1.6;margin:0;">
        If you have any questions, reply to this email or reach us at 
        <a href="mailto:official@smakresearch.com" style="color:#60A5FA;text-decoration:none;">official@smakresearch.com</a>
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#050B14;padding:24px 40px;border-top:1px solid rgba(255,255,255,0.05);text-align:center;">
      <p style="color:#334155;font-size:12px;margin:0;font-family:monospace;letter-spacing:1px;">
        SOCIETY FOR MEDICAL ACADEMIA & KNOWLEDGE (SMAK)<br/>
        smakresearch.com • official@smakresearch.com
      </p>
    </div>
  </div>
</body>
</html>
      `,
    });

    // --- Notify admin ---
    await resend.emails.send({
      from: 'SMAK System <official@smakresearch.com>',
      to: 'official@smakresearch.com',
      subject: `[Event Enrollment] ${name} → ${eventTitle}`,
      html: `
<div style="font-family:Arial;padding:20px;background:#0A1220;color:#fff;border-radius:8px;">
  <h2 style="color:#60A5FA;">New Event Enrollment</h2>
  <p><b>Name:</b> ${name}</p>
  <p><b>Email:</b> ${email}</p>
  <p><b>Phone:</b> ${phone}</p>
  <p><b>College:</b> ${college || 'N/A'}</p>
  <p><b>Event:</b> ${eventTitle}</p>
  <p><b>Amount:</b> ${amountDisplay}</p>
  <p><b>Payment ID:</b> ${payment_id || 'Free Event'}</p>
  <p><b>Enrollment ID:</b> ${enrollment.id}</p>
</div>
      `,
    }).catch(e => console.warn('Admin notification email failed:', e));

    return NextResponse.json({ success: true, enrollment_id: enrollment.id });

  } catch (error) {
    console.error('Enrollment API Error:', error);
    return NextResponse.json({ error: 'Enrollment failed. Please try again.' }, { status: 500 });
  }
}
