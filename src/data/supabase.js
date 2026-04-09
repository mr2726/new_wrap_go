import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://rshhhtxokegviwblosur.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzaGhodHhva2Vndml3Ymxvc3VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0OTYwOTQsImV4cCI6MjA5MTA3MjA5NH0.H9ioTJIOA-baP00ugGkxGWhTP_67oQHu_ZPsuVF4fnc";

export const supabase = createClient(supabaseUrl, supabaseKey);