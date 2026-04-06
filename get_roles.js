const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
(async () => {
  // Let's see if we can do an RPC call or something to disable RLS, but we can't via API.
  // Wait, let's see if the update is ACTUALLY failing due to RLS, or if the ID is wrong!
  const { data: member } = await supabase.from('members').select('*').limit(1).single();
  console.log("Member:", member.name, "ID:", member.id);
  
  const { data, error } = await supabase.from('members').update({ attendance: 5 }).eq('id', member.id).select();
  console.log("Update Error:", error);
  console.log("Update Data:", data);
})()
