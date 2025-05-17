-- Enable the pgvector extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS vector;

-- Since the embedding column doesn't exist yet, we can simply add it
ALTER TABLE candidates ADD COLUMN embedding vector(384);

-- Create an index for vector similarity search
CREATE INDEX candidates_embedding_idx ON candidates USING ivfflat (embedding vector_cosine_ops); 