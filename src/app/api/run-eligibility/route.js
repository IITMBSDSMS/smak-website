import { runEligibilityCheck, runEligibilityForAll } from '@/lib/eligibility-engine';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  const { entry_no, run_all } = await req.json();

  try {
    if (run_all) {
      // Batch mode — run for every member
      const results = await runEligibilityForAll();
      return Response.json(results);
    }

    if (!entry_no) {
      return Response.json({ error: 'entry_no required' }, { status: 400 });
    }

    // Single member check
    const result = await runEligibilityCheck(entry_no);

    // If LOR just became eligible via the engine, notify the student
    if (result.success && result.changes?.lor_status === 'eligible') {
      // Fetch member email details
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );
      const { data: member } = await supabase
        .from('members')
        .select('name, email, course, entry_no')
        .eq('entry_no', entry_no)
        .single();

      if (member?.email) {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://smakresearch.com'}/api/lor-approved`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: member.name,
            email: member.email,
            entry_no: member.entry_no,
            course: member.course,
          }),
        }).catch(e => console.warn('LOR email failed:', e));
      }
    }

    return Response.json(result);

  } catch (err) {
    console.error('Run eligibility error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
