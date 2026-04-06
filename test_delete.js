const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
(async () => {
    // try to delete a fake id
    const { data, error } = await supabase.from('members').delete().eq('id', '00000000-0000-0000-0000-000000000000').select();
    console.log("Delete error:", error, "Data:", data);
})()
