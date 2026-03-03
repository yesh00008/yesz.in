import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vmgggzxbqlnmgiyikhzy.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('Error: SUPABASE_SERVICE_KEY environment variable not set');
  console.log('You can get this from: https://app.supabase.com/project/vmgggzxbqlnmgiyikhzy/settings/api');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function seedDatabase() {
  try {
    const sqlFile = fs.readFileSync('./database/08-seed-additional-posts.sql', 'utf-8');
    
    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql: sqlFile });
    
    if (error) {
      console.error('Error seeding database:', error);
      process.exit(1);
    }
    
    console.log('✅ Successfully seeded 20 new blog posts!');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

seedDatabase();
