import { createClient } from "@supabase/supabase-js";
export const supabaseUrl = "https://jzcmdlftdqiszjhqjhkp.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6Y21kbGZ0ZHFpc3pqaHFqaGtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NTE1NzEsImV4cCI6MjA4MzQyNzU3MX0.KPWH4fGezNi-JmUdq0TFixvVkh0cJtzQuDMzuZ_LuTQ";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
