import os
from dotenv import load_dotenv
import httpx
from sentence_transformers import SentenceTransformer
import json

# Load environment variables
load_dotenv()

# Environment variables
SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("VITE_SUPABASE_ANON_KEY")

# Initialize the embedding model
print("Loading SentenceTransformer model...")
model = SentenceTransformer('all-MiniLM-L6-v2')
print("Model loaded")

async def fetch_candidates():
    """Fetch all candidates from Supabase"""
    print("Fetching candidates...")
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{SUPABASE_URL}/rest/v1/candidates?select=id,raw_text",
            headers={
                "apikey": SUPABASE_ANON_KEY,
                "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
            },
        )
        
        if response.status_code != 200:
            print(f"Error fetching candidates: {response.status_code} {response.text}")
            return []
        
        candidates = response.json()
        print(f"Found {len(candidates)} candidates")
        return candidates

async def update_candidate_embedding(candidate_id, embedding):
    """Update a candidate's embedding column directly"""
    async with httpx.AsyncClient() as client:
        response = await client.patch(
            f"{SUPABASE_URL}/rest/v1/candidates?id=eq.{candidate_id}",
            headers={
                "apikey": SUPABASE_ANON_KEY,
                "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
                "Content-Type": "application/json",
                "Prefer": "return=minimal"
            },
            json={
                "embedding": embedding
            }
        )
        
        if response.status_code != 204:
            print(f"Error updating candidate {candidate_id}: {response.status_code} {response.text}")
            return False
        
        return True

async def main():
    """Main function"""
    candidates = await fetch_candidates()
    
    for i, candidate in enumerate(candidates):
        if not candidate.get("raw_text"):
            print(f"Skipping candidate {candidate['id']} - no raw text found")
            continue
        
        # Generate embedding
        print(f"Generating embedding for candidate {candidate['id']} ({i+1}/{len(candidates)})")
        embedding = model.encode(candidate["raw_text"]).tolist()
        
        # Update the candidate with the new embedding
        success = await update_candidate_embedding(candidate["id"], embedding)
        if success:
            print(f"Updated embedding for candidate {candidate['id']}")
        
        if (i + 1) % 10 == 0:
            print(f"Processed {i + 1}/{len(candidates)} candidates")
    
    print("Embedding process complete.")
    print("Your candidates now have 384-dimensional embeddings for search.")

if __name__ == "__main__":
    import asyncio
    asyncio.run(main()) 