import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req) {
  try {
    const body = await req.json();
    
    // Structure assuming webhook sends: { email, quiz_id, score_percentage }
    const { email, quiz_id, score_percentage } = body;

    if (!email || !quiz_id || typeof score_percentage === 'undefined') {
      return NextResponse.json({ error: 'Missing required payload' }, { status: 400 });
    }

    // Resolve user id from email
    const { data: user } = await supabase.from('users_mentee').select('id').eq('email', email).single();
    
    if (user) {
      // Log Assessment Score
      const { error } = await supabase.from('assessments').insert([{
        user_id: user.id,
        quiz_id: quiz_id,
        score: score_percentage
      }]);

      if (error) throw error;
      
      // Note: Trigger Eligibility engine calculation here later
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Quiz Webhook Error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
