const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
(async () => {
  const { data: member } = await supabase.from('members').select('*').limit(1).single();
  const { data, error } = await supabase.from('members').update({ attendance: 99 }).eq('id', member.id).select();
  console.log("Error:", error);
  console.log("Data length:", data ? data.length : 0);
})()
