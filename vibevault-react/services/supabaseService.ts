import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

/**
 * Initialize the arcade games table in Supabase
 * This should be called once to ensure the table exists
 */
export const initArcadeTable = async () => {
  try {
    // Try to fetch to see if table exists
    const { error } = await supabase
      .from('arcade_games')
      .select('id')
      .limit(1);
    
    if (error && error.code === 'PGRST116') {
      console.log('Table does not exist. Please create it in Supabase dashboard.');
      console.log('SQL to run in Supabase:');
      console.log(`
        CREATE TABLE arcade_games (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          content TEXT NOT NULL,
          uploader_name TEXT NOT NULL,
          added_at BIGINT NOT NULL,
          uploaded_at BIGINT NOT NULL,
          likes INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
        
        CREATE INDEX idx_uploaded_at ON arcade_games(uploaded_at DESC);
      `);
    }
  } catch (error) {
    console.error('Error initializing arcade table:', error);
  }
};
