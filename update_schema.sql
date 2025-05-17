-- Enable the pgvector extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS vector;

-- Option 1: If you want to recreate the candidates table with the new embedding dimensions
-- WARNING: This will delete all existing candidate data!
/*
DROP TABLE IF EXISTS candidates;

CREATE TABLE candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  current_title text,
  location text,
  work_auth text,
  years_exp float,
  resume_url text,
  raw_text text,
  embedding vector(384) -- Changed from 768 to 384 dimensions
);

-- Create an index for vector similarity search
CREATE INDEX ON candidates USING ivfflat (embedding vector_cosine_ops);
*/

-- Option 2: If you want to keep your existing data and update the embeddings column
-- This approach preserves your data but requires re-embedding all resumes

-- First, create a temporary column
ALTER TABLE candidates ADD COLUMN embedding_new vector(384);

-- Update your application to fill this column with new embeddings
-- Then, run the following commands:

-- Drop the old embedding column and rename the new one
/*
ALTER TABLE candidates DROP COLUMN embedding;
ALTER TABLE candidates RENAME COLUMN embedding_new TO embedding;

-- Create a new index on the updated column
DROP INDEX IF EXISTS candidates_embedding_idx;
CREATE INDEX candidates_embedding_idx ON candidates USING ivfflat (embedding vector_cosine_ops);
*/ 