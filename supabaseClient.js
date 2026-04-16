// /js/supabaseClient.js
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "hhttps://cbngdegxmfzkstistitg.supabase.co";  // <-- cambia esto
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNibmdkZWd4bWZ6a3N0aXN0aXRnIiwicm9sIjoicmFkbWluIiwiaWF0IjoxNzU0MjU3MzA0LCJleHAiOjIwNjk4MzMzMDR9.0wxaV19YNRrnXiFbtGIKgr9v32pwSQSbwRaWnyd3SlQ";               // <-- cambia esto

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
