-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS match_candidates;

-- Create the updated function for 384-dimensional embeddings
CREATE OR REPLACE FUNCTION match_candidates(
  query_embedding vector(384),  -- Changed from 768 to 384 dimensions
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  name text,
  current_title text,
  location text, 
  work_auth text,
  years_exp float,
  resume_url text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.name,
    c.current_title,
    c.location,
    c.work_auth,
    c.years_exp,
    c.resume_url,
    1 - (c.embedding <=> query_embedding) as similarity
  FROM
    candidates c
  WHERE
    1 - (c.embedding <=> query_embedding) > match_threshold
  ORDER BY
    similarity DESC
  LIMIT
    match_count;
END;
$$; 