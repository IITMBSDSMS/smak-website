import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Default eligibility thresholds (can be overridden per course in future)
const DEFAULT_THRESHOLDS = {
  cert: { attendance: 70, quiz: 50 },
  lor:  { attendance: 85, quiz: 75 },
};

/**
 * Run eligibility check for a single member by entry_no.
 * Reads attendance% and quiz_avg% from members table.
 * Auto-updates cert_status and lor_status if criteria are met.
 * Never downgrades 'generated' status — only upgrades to 'eligible'.
 */
export async function runEligibilityCheck(entryNo) {
  try {
    // 1. Fetch the member's current data
    const { data: member, error } = await supabase
      .from('members')
      .select('id, attendance, quiz_avg, cert_status, lor_status')
      .eq('entry_no', entryNo)
      .single();

    if (error || !member) {
      throw new Error(`Member not found: ${entryNo}`);
    }

    const attendance = parseFloat(member.attendance) || 0;
    const quizAvg    = parseFloat(member.quiz_avg)    || 0;

    const t = DEFAULT_THRESHOLDS;

    // 2. Calculate new eligibility
    const certEligible = attendance >= t.cert.attendance && quizAvg >= t.cert.quiz;
    const lorEligible  = attendance >= t.lor.attendance  && quizAvg >= t.lor.quiz;

    // 3. Build the update payload — never downgrade 'generated' or 'rejected' status
    const updates = {};
    const protectedStatuses = ['generated', 'rejected'];

    if (certEligible && !protectedStatuses.includes(member.cert_status)) {
      updates.cert_status = 'eligible';
    }
    if (lorEligible && !protectedStatuses.includes(member.lor_status)) {
      updates.lor_status = 'eligible';
    }

    // 4. Apply updates if any eligibility changed
    let updated = false;
    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await supabase
        .from('members')
        .update(updates)
        .eq('id', member.id);

      if (updateError) throw updateError;
      updated = true;
    }

    return {
      success: true,
      entryNo,
      attendance,
      quizAvg,
      certEligible,
      lorEligible,
      updated,
      changes: updates,
    };

  } catch (err) {
    console.error('Eligibility Engine Error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Run eligibility check for ALL members (batch mode).
 * Useful for periodic sweeps.
 */
export async function runEligibilityForAll() {
  const { data: members, error } = await supabase
    .from('members')
    .select('entry_no');

  if (error || !members) return { success: false, error: error?.message };

  const results = await Promise.allSettled(
    members.map(m => runEligibilityCheck(m.entry_no))
  );

  return {
    success: true,
    total: members.length,
    results: results.map(r => r.value || r.reason),
  };
}
