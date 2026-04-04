import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { 
  getShortlistEmail, 
  getInterviewEmail, 
  getSelectionEmail 
} from '@/lib/emailTemplates';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
  // Should ideally use service_role to bypass RLS in the backend server, but anon works if RLS allows public update
);
const resend = new Resend(process.env.RESEND_API_KEY || "fallback_for_vercel");

export async function POST(request) {
  try {
    const { id, status, email, name } = await request.json();

    if (!id || !status || !email || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Update Supabase
    const { data: updateData, error: dbError } = await supabase
      .from('campus_ambassadors')
      .update({ status })
      .eq('id', id)
      .select();

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 400 });
    }

    // 2. Trigger relevant email based on the NEW status
    let subject = '';
    let html = '';

    switch (status) {
      case 'shortlisted':
        subject = 'You\'re Shortlisted – SMAK Campus Ambassador';
        html = getShortlistEmail(name);
        break;
      case 'interview':
        subject = 'Interview Setup – SMAK Campus Ambassador';
        html = getInterviewEmail(name);
        break;
      case 'selected':
        subject = 'Welcome to SMAK! – Campus Ambassador';
        html = getSelectionEmail(name);
        break;
      // If rejected, usually no email, or customize here.
      default:
        return NextResponse.json({ message: 'Status updated, no email sent' }, { status: 200 });
    }

    if (subject && html) {
      const { data: emailData, error: emailError } = await resend.emails.send({
        from: 'SMAK Admin <official@smakresearch.com>',
        to: [email],
        subject,
        html,
      });

      if (emailError) {
        // Warning: DB updated, but email failed.
        return NextResponse.json({ 
            message: 'DB updated but Email Failed', 
            error: emailError.message 
        }, { status: 207 });
      }
    }

    return NextResponse.json({ message: 'Status updated & Email sent successfully' }, { status: 200 });

  } catch (error) {
    console.error("Update Status API Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
