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
    const { data: member } = await supabase.from('members').select('id, entry_no, quiz_avg').eq('email', email).single();
    
    if (member) {
      
      const currentAvg = parseFloat(member.quiz_avg) || 0;
      // Simple logic: New score averages heavily with the old
      const newAvg = currentAvg === 0 ? score_percentage : (currentAvg + score_percentage) / 2;

      const { error } = await supabase.from('members').update({
        quiz_avg: newAvg
      }).eq('id', member.id);

      if (error) throw error;
      
      // Auto-Trigger Eligibility engine calculation
      const { runEligibilityCheck } = await import('@/lib/eligibility-engine');
      await runEligibilityCheck(member.entry_no);
      console.log(`Quiz score updated & engines fired for ${member.entry_no}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Quiz Webhook Error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
