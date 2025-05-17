# Supabase Implementation Guide

This guide will help you update your Supabase database to work with the new 384-dimensional embeddings from Huggingface instead of the previous 768-dimensional ones from Groq.

## Option 1: Using the Supabase Dashboard (SQL Editor)

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Create a new query
4. Copy and paste the contents of `match_candidates_function.sql` into the editor
5. Run the SQL query to update the function

Then, depending on your situation:

- **If you're starting fresh or don't mind losing existing data**, uncomment and run Option 1 from `update_schema.sql`
- **If you want to preserve existing data**, run the first part of Option 2 from `update_schema.sql` to add the new column

## Option 2: Using the Supabase CLI

If you have the Supabase CLI set up, you can run:

```bash
supabase db execute --file match_candidates_function.sql
```

## Re-embedding Existing Data

If you chose Option 2 to preserve your data, you'll need to re-embed all resumes:

1. Create a script to:
   - Fetch all candidates
   - Generate new embeddings using the Huggingface model
   - Update each candidate's `embedding_new` column

2. After all candidates are updated, run the final SQL commands from Option 2 to:
   - Drop the old embedding column
   - Rename the new column
   - Create the appropriate index

## Sample Re-embedding Script

Here's a Python script to help with re-embedding:

```python
import os
from dotenv import load_dotenv
from supabase import create_client
from sentence_transformers import SentenceTransformer

# Load environment variables
load_dotenv()

# Initialize Supabase client
supabase_url = os.getenv("VITE_SUPABASE_URL")
supabase_key = os.getenv("VITE_SUPABASE_ANON_KEY")
supabase = create_client(supabase_url, supabase_key)

# Initialize the embedding model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Fetch all candidates
response = supabase.table("candidates").select("id, raw_text").execute()
candidates = response.data

print(f"Found {len(candidates)} candidates to re-embed")

# Process each candidate
for i, candidate in enumerate(candidates):
    if not candidate.get("raw_text"):
        print(f"Skipping candidate {candidate['id']} - no raw text found")
        continue
    
    # Generate new embedding
    embedding = model.encode(candidate["raw_text"]).tolist()
    
    # Update the candidate with the new embedding
    supabase.table("candidates").update({"embedding_new": embedding}).eq("id", candidate["id"]).execute()
    
    if (i + 1) % 10 == 0:
        print(f"Processed {i + 1}/{len(candidates)} candidates")

print("Re-embedding complete. Now run the final SQL commands to update your schema.")
```

After running this script, execute the commented SQL commands from Option 2 to finalize the schema change. 