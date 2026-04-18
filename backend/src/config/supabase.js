const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Missing SUPABASE_URL or SUPABASE_ANON_KEY. Please ensure your .env file is set up correctly.');
}

// Client for general ops / mapped to frontend user token
const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder');

// Admin Client. Highly privileged. Used strictly for background AI processing and updates overriding RLS.
const supabaseAdmin = supabaseUrl && supabaseServiceRoleKey 
  ? createClient(supabaseUrl, supabaseServiceRoleKey) 
  : null;

module.exports = { supabase, supabaseAdmin };
