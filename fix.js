const fs = require('fs');

let content = fs.readFileSync('dashboard.js', 'utf8');
content = content.replace(/let supabase = null;/g, 'let supabaseClient = null;');
content = content.replace(/supabase = window\.supabase\.createClient/g, 'supabaseClient = window.supabase.createClient');

// Replace all usages of supabase object but don't match supabaseConfig or window.supabase
// By matching ' supabase.' or 'await supabase.' or '{ count, error } = await supabase'
content = content.replace(/await supabase\./g, 'await supabaseClient.');

fs.writeFileSync('dashboard.js', content, 'utf8');
console.log('Fixed dashboard.js');
