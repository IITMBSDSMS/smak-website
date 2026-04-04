import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req) {
  try {
    const { userId, certId } = await req.json();

    // Verification
    const { data: cert } = await supabase.from('certificates').select('*').eq('id', certId).eq('user_id', userId).single();
    if (!cert) return NextResponse.json({ error: 'Certificate intent not found for user' }, { status: 404 });

    const { data: user } = await supabase.from('users_mentee').select('full_name, course_enrolled').eq('id', userId).single();

    // 1. Generate PDF Server-side using jsPDF/Pdf-lib (Mocked logic here)
    // const { jsPDF } = await import("jspdf");
    // const doc = new jsPDF();
    // doc.text(`Certificate of Completion`, 10, 10);
    // doc.text(`Awarded to ${user.full_name}`, 10, 20);
    // const pdfBuffer = doc.output('arraybuffer');
    
    const mockPdfUrl = `https://smak.university/verifications/cert_${certId}.pdf`;

    // 2. Upload to S3/Supabase Storage (Skipped in mock)
    // await supabase.storage.from('certificates').upload(`cert_${userId}.pdf`, pdfBuffer);

    // 3. Update DB
    await supabase.from('certificates')
      .update({ generated_status: 'generated', certificate_url: mockPdfUrl })
      .eq('id', certId);

    // 4. (Optional) Email the certificate
    // sendCertificateEmail(user.email, mockPdfUrl)

    return NextResponse.json({ success: true, url: mockPdfUrl });
  } catch (error) {
    console.error('Certificate Generation Error:', error);
    return NextResponse.json({ error: 'Failed to generate certificate' }, { status: 500 });
  }
}
