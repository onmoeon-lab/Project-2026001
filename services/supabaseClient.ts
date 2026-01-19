
import { createClient } from '@supabase/supabase-js';

// TODO: REPLACE THESE WITH YOUR ACTUAL SUPABASE VALUES
// You get these from your Supabase Project Settings -> API
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
