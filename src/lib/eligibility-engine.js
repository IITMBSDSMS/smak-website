import { supabase } from './supabase';

export async function checkEligibility(userId, courseId) {
  try {
    // 1. Fetch Course Thresholds
    const { data: course } = await supabase.from('courses').select('*').eq('id', courseId).single();
    if (!course) throw new Error('Course not found');

    // 2. Fetch User Attendance Aggregation
    // In a real app we might need to count by unique session IDs, but this serves as the demo logic
    const { data: attendanceData } = await supabase.from('attendance').select('duration_attended').eq('user_id', userId);
    
    // Evaluate total attendance percentage (Simplified logic: sum of durations / expected total duration)
    // For sake of MVP, let's assume we store the "percentage" directly or calculate based on count:
    const totalSessions = 20; // Hardcoded dummy logic
    const attendedSessions = attendanceData ? attendanceData.length : 0;
    const attendancePercent = (attendedSessions / totalSessions) * 100;

    // 3. Fetch User Quiz Scores Aggregation
    const { data: quizData } = await supabase.from('assessments').select('score').eq('user_id', userId);
    const avgScore = quizData && quizData.length > 0 
      ? quizData.reduce((acc, q) => acc + parseFloat(q.score), 0) / quizData.length 
      : 0;

    // 4. Evaluate Thresholds
    const isCertEligible = attendancePercent >= course.attendance_req_percent && avgScore >= course.quiz_weightage_percent;
    const isLorEligible = attendancePercent >= course.lor_attendance_req && avgScore >= course.lor_quiz_req;

    // 5. Update Status in Tables
    if (isCertEligible) {
      // Upsert Certificate intent (pending generation if not exists)
      const { data: existingCert } = await supabase.from('certificates').select('id').eq('user_id', userId).single();
      if (!existingCert) {
        await supabase.from('certificates').insert([{ user_id: userId, generated_status: 'pending' }]);
        // Note: Could trigger certificate generation PDF function here.
      }
    }

    if (isLorEligible) {
      // Upsert LOR intent
      const { data: existingLor } = await supabase.from('lors').select('id').eq('user_id', userId).single();
      if (!existingLor) {
        await supabase.from('lors').insert([{ user_id: userId, eligibility_status: 'eligible' }]);
      }
    }

    return {
      attendancePercent,
      avgScore,
      isCertEligible,
      isLorEligible
    };

  } catch (error) {
    console.error('Eligibility Engine Error:', error);
    throw error;
  }
}
