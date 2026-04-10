import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(req) {
  try {
    const { event_id, email } = await req.json();

    if (!event_id || !email) {
      return NextResponse.json({ error: 'Missing event_id or email' }, { status: 400 });
    }

    const { data } = await supabase
      .from('events_enrollments')
      .select('id, enrolled_at, payment_status')
      .eq('event_id', event_id)
      .eq('email', email.toLowerCase().trim())
      .in('payment_status', ['success', 'free'])
      .maybeSingle();

    return NextResponse.json({
      enrolled: !!data,
      enrollment: data || null,
    });

  } catch (error) {
    console.error('Check enrollment error:', error);
    return NextResponse.json({ error: 'Check failed' }, { status: 500 });
  }
}
