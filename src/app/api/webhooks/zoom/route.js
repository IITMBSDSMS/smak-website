import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Helper to calculate duration in minutes
const calculateDuration = (joinTime, leaveTime) => {
  const start = new Date(joinTime);
  const end = new Date(leaveTime);
  return Math.round((end - start) / 60000);
};

export async function POST(req) {
  try {
    const rawBody = await req.json();

    // Zoom webhook verification (Challenge-Response)
    if (rawBody.event === 'endpoint.url_validation') {
      const crypto = require('crypto');
      const hashForValidate = crypto.createHmac('sha256', process.env.ZOOM_WEBHOOK_SECRET_TOKEN).update(rawBody.payload.plainToken).digest('hex');
      return NextResponse.json({
        plainToken: rawBody.payload.plainToken,
        encryptedToken: hashForValidate
      });
    }

    // Process participant left event (has duration info usually)
    if (rawBody.event === 'meeting.participant_left') {
      const participant = rawBody.payload.object.participant;
      const meetingId = rawBody.payload.object.id;
      const email = participant.email;
      
      const duration = calculateDuration(participant.join_time, participant.leave_time);

      if (email) {
        // Resolve user id from email
        const { data: member } = await supabase.from('members').select('id, entry_no, attendance').eq('email', email).single();
        if (member) {
          
          if (duration > 30) {
            // Logic: Increment attendance by 10% per valid session (max 100%)
            const newAttendance = Math.min((parseFloat(member.attendance) || 0) + 10, 100);

            await supabase.from('members').update({
              attendance: newAttendance
            }).eq('id', member.id);

            // Auto-Trigger Eligibility Engine
            const { runEligibilityCheck } = await import('@/lib/eligibility-engine');
            await runEligibilityCheck(member.entry_no);
            console.log(`Zoom attendance updated & engines fired for ${member.entry_no}`);
          }
        }
      }
    }

    return NextResponse.json({ success: true, processed: true });
  } catch (error) {
    console.error('Zoom Webhook Error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
