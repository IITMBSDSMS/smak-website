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
        const { data: user } = await supabase.from('users_mentee').select('id').eq('email', email).single();
        if (user) {
          // Log Attendance
          await supabase.from('attendance').insert([{
            user_id: user.id,
            session_id: meetingId.toString(),
            duration_attended: duration,
            zoom_status: 'left'
          }]);
          
          // Note: In real app, we might trigger Eliigibility engine calculation here if duration > threshold
        }
      }
    }

    return NextResponse.json({ success: true, processed: true });
  } catch (error) {
    console.error('Zoom Webhook Error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
