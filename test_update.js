const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

(async () => {
  // First get a member
  const { data: member } = await supabase.from('members').select('*').limit(1).single();
  if(!member) return console.log("No member found");
  
  console.log("Found member:", member.name, member.id);
  
  // Try to update their attendance
  const { data, error, count } = await supabase
    .from('members')
    .update({ attendance: 50, cert_status: 'eligible' })
    .eq('id', member.id)
    .select(); // important to select to see if it returned the updated row
    
  console.log("Update Error?", error);
  console.log("Returned Data length:", data ? data.length : 0);
  console.log("Updated Data:", data);
})()
