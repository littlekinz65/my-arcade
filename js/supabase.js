// js/supabase.js

// 1. Paste your Project URL here inside the quotes:
const supabaseUrl = 'https://loqauchtfrkyrgfjngwo.supabase.co';

// 2. Paste your 'anon' public API key here inside the quotes:
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvcWF1Y2h0ZnJreXJnZmpuZ3dvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1OTQxNzIsImV4cCI6MjA5MDE3MDE3Mn0.wE7fcCgDnAWjo1SihOMUFoYgz7ET0MdJqa-LPhrjMME';

// 3. This creates the connection to your database!
// We attach it to the 'window' object so our other JS files can easily use it.
window.supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

console.log("Supabase connection initialized!");