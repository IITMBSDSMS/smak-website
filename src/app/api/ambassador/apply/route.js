import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getConfirmationEmail } from '@/lib/emailTemplates';

const resend = new Resend(process.env.RESEND_API_KEY || "fallback_for_vercel_build");

export async function POST(request) {
  try {
    const { email, name, type } = await request.json();

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' }, 
        { status: 400 }
      );
    }

    if (type === 'confirmation') {
      const { data, error } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'SMAK Admin <official@smakresearch.com>', 
        to: [email],
        subject: 'Application Received – SMAK Campus Ambassador',
        html: getConfirmationEmail(name),
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ message: 'Email sent', data }, { status: 200 });
    }

    return NextResponse.json({ error: 'Invalid type request' }, { status: 400 });

  } catch (error) {
    console.error("Resend API Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
