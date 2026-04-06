const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
(async () => {
  // Try querying the LMS tables to see if they exist
  const res1 = await supabase.from('courses').select('id').limit(1);
  const res2 = await supabase.from('users_mentee').select('id').limit(1);
  const res3 = await supabase.from('attendance').select('id').limit(1);
  
  console.log("Courses exists?", !res1.error || res1.error.code !== '42P01');
  if (res1.error) console.log("Courses error:", res1.error.message);
  
  console.log("Users_Mentee exists?", !res2.error || res2.error.code !== '42P01');
  if (res2.error) console.log("Users error:", res2.error.message);
  
  console.log("Attendance exists?", !res3.error || res3.error.code !== '42P01');
  if (res3.error) console.log("Attendance error:", res3.error.message);
})()
