import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://wunrwaoyjgeqpwnhvjxo.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('SUPABASE_SERVICE_KEY is not set in environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * Setup function to create necessary buckets and tables
 */
async function setupSupabase() {
  try {
    console.log('Setting up Supabase resources...');
    
    // Create bucket for resume files
    const { data: bucketData, error: bucketError } = await supabase.storage.createBucket(
      'candidate-resumes',
      {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      }
    );
    
    if (bucketError && bucketError.message !== 'Bucket already exists') {
      throw bucketError;
    }
    
    console.log('Storage bucket created or already exists');

    try {
      // Enable pgvector extension using SQL function
      const { data, error: pgvectorError } = await supabase.rpc('exec_sql', {
        sql: 'CREATE EXTENSION IF NOT EXISTS vector;'
      });
      
      if (pgvectorError) {
        console.warn('Warning: Could not enable pgvector extension:', pgvectorError);
      } else {
        console.log('pgvector extension enabled');
      }
    } catch (error) {
      console.warn('Warning: Could not enable pgvector extension. It may already be enabled or you need admin rights.');
      console.warn(error.message);
    }
    
    // Create tables via SQL Editor manually in the Supabase dashboard
    console.log(`
    Please create the following tables manually in the SQL Editor:
    
    1. candidates table:
    CREATE TABLE IF NOT EXISTS candidates (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      email TEXT,
      current_title TEXT,
      location TEXT,
      work_auth TEXT,
      years_exp INTEGER,
      skills TEXT[],
      resume_url TEXT,
      raw_text TEXT,
      embedding VECTOR(1536),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    2. candidate_status table:
    CREATE TABLE IF NOT EXISTS candidate_status (
      candidate_id UUID REFERENCES candidates(id),
      status TEXT NOT NULL DEFAULT 'new',
      updated_by UUID,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      PRIMARY KEY (candidate_id)
    );
    
    3. shortlists table:
    CREATE TABLE IF NOT EXISTS shortlists (
      user_id UUID NOT NULL,
      candidate_id UUID REFERENCES candidates(id),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      PRIMARY KEY (user_id, candidate_id)
    );
    
    4. email_log table:
    CREATE TABLE IF NOT EXISTS email_log (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      candidate_id UUID REFERENCES candidates(id),
      user_id UUID NOT NULL,
      subject TEXT,
      body TEXT,
      template_used TEXT,
      sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    `);
    
    console.log('Supabase setup partially completed');
  } catch (error) {
    console.error('Error setting up Supabase:', error);
  }
}

// Run the setup
setupSupabase(); 