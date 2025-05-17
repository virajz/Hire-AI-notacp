-- Enable the pgvector extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS vector;

-- Instead of dropping the table, we'll keep the existing structure
-- and just modify the embedding column

-- First, check if the embedding column exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' 
               AND table_name = 'candidates' 
               AND column_name = 'embedding') THEN
        
        -- Add temporary column for new embeddings
        ALTER TABLE candidates ADD COLUMN IF NOT EXISTS embedding_new vector(384);
        
        -- After manually re-embedding candidates, run:
        -- ALTER TABLE candidates DROP COLUMN embedding;
        -- ALTER TABLE candidates RENAME COLUMN embedding_new TO embedding;
        
        -- Create a new index on the updated column (after renaming)
        -- DROP INDEX IF EXISTS candidates_embedding_idx;
        -- CREATE INDEX candidates_embedding_idx ON candidates USING ivfflat (embedding vector_cosine_ops);
        
    ELSE
        -- If embedding column doesn't exist yet, just add it
        ALTER TABLE candidates ADD COLUMN embedding vector(384);
        
        -- Create an index for vector similarity search
        CREATE INDEX candidates_embedding_idx ON candidates USING ivfflat (embedding vector_cosine_ops);
    END IF;
END
$$; 