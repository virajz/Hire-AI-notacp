# HireAI - FastAPI Search Server

This FastAPI server replaces the Express.js implementation for the search functionality in the HireAI application. It handles searching for candidates using natural language queries by leveraging Huggingface's sentence-transformers for embeddings and Supabase with pgvector for similarity search.

## Prerequisites

- Python 3.9+
- Supabase project with pgvector extension enabled

## Setup Instructions

1. **Create a virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Create a .env file** in the project root with the following content:
   ```
   # Supabase Configuration
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   
   # Server Configuration
   PORT=3001
   ```

4. **Run the server**:
   ```bash
   python app.py
   ```
   
   Alternatively, you can use uvicorn directly:
   ```bash
   uvicorn app:app --host 0.0.0.0 --port 3001 --reload
   ```

## Implementation Notes

This implementation uses a minimal set of dependencies to avoid compatibility issues:
- Huggingface's `sentence-transformers` for generating embeddings locally
- Direct HTTP requests to the Supabase API endpoints using `httpx`
- No additional Supabase client libraries required
- `fastapi` for the API framework
- `uvicorn` ASGI server to run the FastAPI application

This approach eliminates complex dependency chains and version conflicts while maintaining all functionality.

## Embedding Model

The server uses Huggingface's `all-MiniLM-L6-v2` model, which:
- Generates 384-dimensional embeddings
- Provides good performance for semantic search applications
- Runs locally without requiring external API calls
- Will be automatically downloaded on first run

Ensure that the Supabase `match_candidates` function is configured to work with 384-dimensional vectors from this model.

## API Endpoints

### Search Candidates

- **URL**: `/api/search`
- **Method**: GET
- **Query Parameters**:
  - `query` (required): Natural language search query to match against candidate résumés
- **Response**:
  ```json
  {
    "candidates": [
      {
        "id": "string",
        "name": "string",
        "current_title": "string",
        "location": "string",
        "work_auth": "string",
        "years_exp": 3.5,
        "resume_url": "string",
        "similarity": 0.95
      }
    ],
    "message": "string"
  }
  ```

## Supabase Database Function

The server relies on a stored procedure in Supabase called `match_candidates` which performs the vector similarity search. Make sure this function exists in your Supabase project and is configured for 384-dimensional embeddings.

## Interactive API Documentation

FastAPI provides automatic API documentation available at:
- Swagger UI: http://localhost:3001/docs
- ReDoc: http://localhost:3001/redoc 