import { createClient } from
'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = "https://vkhbmordckrcqubfsogu.supabase.co";

const SUPABASE_KEY = "sb_publishable_AN_1Hj-Uowv4WeueHyYgjg_FEA05kdP";

export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);




