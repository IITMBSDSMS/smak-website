import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import crypto from 'crypto';
import { sendInvoiceEmail, sendKitAndSOPEmail } from '@/lib/email-automation';

// Use service role if available for backend webhooks
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(req) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    // 1. Verify Webhook Signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || 'fallback_secret')
      .update(rawBody)
      .digest('hex');

    // Remove this skip in production!
    if (expectedSignature !== signature && process.env.NODE_ENV === 'production') {
       throw new Error('Invalid signature');
    }

    const { event, payload } = JSON.parse(rawBody);

    if (event === 'payment.captured' || event === 'payment.authorized') {
      const paymentEntity = payload.payment.entity;
      
      // Extract entry_no securely passed during order creation
      const { entry_no } = paymentEntity.notes || {};

      if (entry_no) {
        // Fetch member info securely
        const { data: member } = await supabase.from('members').select('email, name').eq('entry_no', entry_no).single();

        if (member) {
          // 2. Update Member Status
          const invoiceId = `INV-${Date.now()}`;
          const { error: dbError } = await supabase
            .from('members')
            .update({ 
              payment_status: 'SUCCESS',
              status: 'Active' 
            })
            .eq('entry_no', entry_no);

          if (dbError) throw dbError;

          // 3. Send Success & Kit Emails securely
          await sendInvoiceEmail({ to: member.email, name: member.name, invoiceId });
          await sendKitAndSOPEmail({ to: member.email, name: member.name });
          
          console.log(`Payment confirmed & emails sent for ${entry_no}`);
        }
      }
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 400 });
  }
}

