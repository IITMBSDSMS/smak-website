import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabaseServer';


export async function POST(req) {
  const supabase = getSupabase();
  try {
    const { entry_no } = await req.json();

    if (!entry_no) {
      return NextResponse.json({ error: 'Missing entry_no parameter' }, { status: 400 });
    }

    // 1. Verify Member & Eligibility
    const { data: member, error } = await supabase
      .from('members')
      .select('name, course, cert_status')
      .eq('entry_no', entry_no)
      .single();

    if (error || !member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    if (member.cert_status !== 'eligible' && member.cert_status !== 'generated') {
       return NextResponse.json({ error: 'Member is not eligible for a certificate' }, { status: 403 });
    }

    // 2. Generate PDF Server-side (Integration Placeholder)
    // In production, you would attach jsPDF or simply trigger an external PDF-rendering API here.
    const mockPdfUrl = `https://smakresearch.com/verifications/cert_${entry_no.replace(' ', '')}.pdf`;

    // 3. Update DB to mark as generated
    await supabase.from('members')
      .update({ cert_status: 'generated' })
      .eq('entry_no', entry_no);

    return NextResponse.json({ 
       success: true, 
       message: 'Certificate successfully generated.',
       url: mockPdfUrl 
    });

  } catch (error) {
    console.error('Certificate Generation Error:', error);
    return NextResponse.json({ error: 'Failed to generate certificate due to a server error.' }, { status: 500 });
  }
}
