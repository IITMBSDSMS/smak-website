import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
// import { sendInvoiceEmail } from '@/lib/email-automation';

export async function POST(req) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature'); // or Stripe equivalent
    
    // 1. Verify Webhook Signature (skipping logic for stub)
    // const crypto = require('crypto');
    // const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET).update(rawBody).digest('hex');
    // if (expectedSignature !== signature) throw new Error('Invalid signature');

    const body = JSON.parse(rawBody);
    const { event, payload } = body;

    if (event === 'payment.captured' || event === 'payment.authorized') {
      const paymentEntity = payload.payment.entity;
      const orderId = paymentEntity.order_id;
      // Extract userId and courseId if passed through notes, or lookup enrollment by order_id
      const { user_id, course_id } = paymentEntity.notes || {};

      if (user_id && course_id) {
        // 2. Update Enrollment Status
        const { error: dbError } = await supabase
          .from('enrollments')
          .update({ payment_status: 'success', invoice_id: `INV-${Date.now()}` })
          .eq('user_id', user_id)
          .eq('course_id', course_id);

        if (dbError) throw dbError;

        // 3. Generate Invoice (stub) & Send Email
        // await sendInvoiceEmail({ userId: user_id, invoiceId: `INV-${Date.now()}` });
      }
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 400 });
  }
}
