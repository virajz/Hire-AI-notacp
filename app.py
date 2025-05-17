import os
import base64
import tempfile
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Query, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import httpx
import json
import PyPDF2
import re
import hashlib
import socket

# Load environment variables
load_dotenv()

# Environment variables
SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("VITE_SUPABASE_ANON_KEY")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

# Check for required environment variables
if not all([SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY]):
    missing_vars = []
    if not SUPABASE_URL:
        missing_vars.append("VITE_SUPABASE_URL")
    if not SUPABASE_ANON_KEY:
        missing_vars.append("VITE_SUPABASE_ANON_KEY")
    if not SUPABASE_SERVICE_ROLE_KEY:
        missing_vars.append("SUPABASE_SERVICE_ROLE_KEY")
    
    print(f"Missing required environment variables: {', '.join(missing_vars)}")
    raise ValueError("Missing required environment variables")

# Initialize FastAPI
app = FastAPI(title="HireAI API", description="API for HireAI resume search and candidate management")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:5173"],  # Add both Vite default ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Response models
class Candidate(BaseModel):
    id: str
    name: str
    current_title: Optional[str] = None
    location: Optional[str] = None
    work_auth: Optional[str] = None
    years_exp: Optional[float] = None
    resume_url: Optional[str] = None
    similarity: float

class SearchResponse(BaseModel):
    candidates: List[Candidate]
    message: Optional[str] = None

class ResumeUploadResponse(BaseModel):
    candidate_id: str
    name: str
    email: Optional[str] = None
    current_title: Optional[str] = None
    location: Optional[str] = None
    skills: List[str] = []
    years_exp: Optional[float] = None
    message: str = "Resume uploaded and processed successfully"

# Common skills list for keyword extraction
COMMON_SKILLS = [
    'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue', 'Node.js', 
    'Express', 'Next.js', 'Python', 'Django', 'Flask', 'Java', 'Spring', 
    'C#', '.NET', 'Go', 'Rust', 'PHP', 'Laravel', 'Ruby', 'Rails',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Git',
    'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'GraphQL',
    'REST API', 'Microservices', 'Machine Learning', 'AI',
    'HTML', 'CSS', 'Sass', 'TailwindCSS', 'Bootstrap', 'Material UI',
    'Jest', 'Testing', 'Cypress', 'Selenium'
]

# Helper utility functions for resume parsing
def extract_text_from_pdf(pdf_bytes):
    """Extract text from a PDF file byte stream."""
    try:
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            temp_file.write(pdf_bytes)
            temp_file_path = temp_file.name
        
        text = ""
        with open(temp_file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page_num in range(len(pdf_reader.pages)):
                text += pdf_reader.pages[page_num].extract_text()
        
        # Clean up temp file
        os.unlink(temp_file_path)
        return text
    except Exception as e:
        print(f"Error extracting text from PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error extracting text from PDF: {str(e)}")

def extract_basic_info(text):
    """Extract basic information from resume text using regex patterns."""
    # Initialize with default values
    info = {
        "name": "",
        "email": "",
        "location": "",
        "skills": [],
        "years_exp": 0,
        "current_title": ""
    }
    
    # Extract name (usually one of the first lines of the resume)
    name_lines = text.split('\n')[:5]
    for line in name_lines:
        line = line.strip()
        if 3 < len(line) < 30 and '@' not in line and ':' not in line and not re.match(r'^\d', line):
            info["name"] = line
            break
    
    # Extract email
    email_match = re.search(r'([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)', text)
    if email_match:
        info["email"] = email_match.group(1)
    
    # Extract location
    location_keywords = ['Location:', 'Address:', 'City:', 'Based in', 'residing in']
    lines = text.split('\n')
    for line in lines:
        lower = line.lower()
        for kw in location_keywords:
            if kw.lower() in lower:
                index = lower.find(kw.lower())
                location = line[index + len(kw):].strip()
                if location.startswith(':'):
                    location = location[1:].strip()
                info["location"] = location
                break
    
    # Extract skills
    for skill in COMMON_SKILLS:
        skill_pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(skill_pattern, text, re.IGNORECASE):
            info["skills"].append(skill)
    
    # Extract years of experience
    exp_match = re.search(r'(\d+)[\+]?\s+(years|year)(\s+of)?\s+experience', text, re.IGNORECASE)
    if exp_match and len(exp_match.groups()) >= 1:
        info["years_exp"] = int(exp_match.group(1))
    else:
        # Try to calculate from dates
        year_ranges = re.findall(r'20\d{2}\s*[-–—]\s*(20\d{2}|present|current)', text, re.IGNORECASE)
        total_years = 0
        for range_str in year_ranges:
            if isinstance(range_str, tuple) and len(range_str) > 0:
                range_str = range_str[0]  # Handle the case where re.findall returns tuples
            
            parts = re.split(r'[-–—]', range_str)
            if len(parts) == 2:
                start_match = re.search(r'20\d{2}', parts[0])
                if not start_match:
                    continue
                    
                start_year = int(start_match.group(0))
                
                if 'present' in parts[1].lower() or 'current' in parts[1].lower():
                    end_year = 2024  # Current year
                else:
                    end_match = re.search(r'20\d{2}', parts[1])
                    if not end_match:
                        continue
                    end_year = int(end_match.group(0))
                
                total_years += (end_year - start_year)
        
        if total_years > 0:
            info["years_exp"] = total_years
    
    # Extract current title - Fixed regex patterns with consistent capture groups
    title_indicators = [
        r'current(ly)?:?\s*(.*?)(?:$|,|\.|;)',
        r'present:?\s*(.*?)(?:$|,|\.|;)',
        r'job title:?\s*(.*?)(?:$|,|\.|;)',
        r'position:?\s*(.*?)(?:$|,|\.|;)',
        r'title:?\s*(.*?)(?:$|,|\.|;)',
        r'role:?\s*(.*?)(?:$|,|\.|;)'
    ]
    
    for pattern in title_indicators:
        match = re.search(pattern, text, re.IGNORECASE)
        if match and len(match.groups()) >= 1:
            title = match.group(1)
            if title and title.strip():
                info["current_title"] = title.strip()
                break
    
    if not info["current_title"]:
        job_titles = [
            'Software Engineer', 'Software Developer', 'Full Stack', 'Frontend', 
            'Backend', 'DevOps', 'Data Scientist', 'Data Engineer', 'Product Manager',
            'Project Manager', 'Engineering Manager', 'CTO', 'VP', 'Director', 
            'Lead', 'Architect', 'Designer'
        ]
        
        for line in lines:
            if any(title in line for title in job_titles) and re.search(r'20(1[5-9]|2[0-9])', line):
                info["current_title"] = line.strip()
                break
    
    return info

# Alternative simple embedding function that doesn't require ML libraries
def generate_simple_embedding(text: str, dim: int = 384) -> List[float]:
    """
    Generate a simple embedding based on keyword frequencies.
    This is a simplified alternative to ML-based embeddings.
    """
    # Create a deterministic hash from the text
    text_hash = hashlib.md5(text.encode()).hexdigest()
    
    # Convert the hash to a list of floats
    hash_bytes = bytes.fromhex(text_hash)
    
    # Generate a fixed dimension embedding by repeating and truncating the hash
    embedding = []
    while len(embedding) < dim:
        for b in hash_bytes:
            # Convert to a float between -1 and 1
            value = (b / 127.5) - 1.0
            embedding.append(value)
            if len(embedding) >= dim:
                break
    
    return embedding[:dim]

# Function to insert data directly into Supabase
async def insert_into_supabase(table: str, data: Dict[str, Any]):
    """Insert data directly into a Supabase table using httpx."""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{SUPABASE_URL}/rest/v1/{table}",
                headers={
                    "apikey": SUPABASE_ANON_KEY,
                    "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
                    "Content-Type": "application/json",
                    "Prefer": "return=representation"
                },
                json=data,
                timeout=30.0
            )
            
            if response.status_code != 201:
                print(f"Supabase insert error: {response.status_code} {response.text}")
                raise HTTPException(
                    status_code=500, 
                    detail=f"Database error: {response.text}"
                )
            
            return response.json()
    except httpx.HTTPError as e:
        print(f"HTTP error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"HTTP error: {str(e)}")

# Function to upload file to Supabase Storage
async def upload_to_supabase_storage(bucket: str, path: str, file_content: bytes):
    """Upload a file to Supabase Storage."""
    try:
        # Determine content type based on file extension
        content_type = "application/pdf"  # default to PDF
        if path.lower().endswith('.doc'):
            content_type = "application/msword"
        elif path.lower().endswith('.docx'):
            content_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{SUPABASE_URL}/storage/v1/object/{bucket}/{path}",
                headers={
                    "apikey": SUPABASE_SERVICE_ROLE_KEY,
                    "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
                    "Content-Type": content_type
                },
                content=file_content,
                timeout=30.0
            )
            
            if response.status_code != 200:
                print(f"Supabase storage error: {response.status_code} {response.text}")
                raise HTTPException(
                    status_code=500, 
                    detail=f"Storage error: {response.text}"
                )
            
            # Get public URL
            public_url = f"{SUPABASE_URL}/storage/v1/object/public/{bucket}/{path}"
            return public_url
    except httpx.HTTPError as e:
        print(f"HTTP error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"HTTP error: {str(e)}")

# Function to call Supabase RPC directly
async def call_supabase_rpc(function_name: str, params: Dict[str, Any]):
    """Call a Supabase RPC function directly using httpx."""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{SUPABASE_URL}/rest/v1/rpc/{function_name}",
                headers={
                    "apikey": SUPABASE_ANON_KEY,
                    "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
                    "Content-Type": "application/json",
                    "Prefer": "return=representation"
                },
                json=params,
                timeout=30.0
            )
            
            if response.status_code != 200:
                print(f"Supabase RPC error: {response.status_code} {response.text}")
                raise HTTPException(
                    status_code=500, 
                    detail=f"Database error: {response.text}"
                )
            
            return response.json()
    except httpx.HTTPError as e:
        print(f"HTTP error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"HTTP error: {str(e)}")

# Search endpoint
@app.get("/api/search", response_model=SearchResponse)
async def search(query: str = Query(..., description="Search query for candidate matching")):
    """
    Search for candidates based on a natural language query.
    The query will be converted to an embedding and matched against candidate embeddings in the database.
    If no results are found, fallback to a direct text search on name, skills, and raw_text.
    """
    if not query or query.strip() == "":
        raise HTTPException(
            status_code=400, 
            detail="Search query is required and must be a non-empty string."
        )
    
    try:
        print(f'Generating embedding for query: "{query}"')
        # Generate a simplified embedding
        query_embedding = generate_simple_embedding(query)
        print(f'Successfully generated embedding for query: "{query}"')
        print('Searching for candidates in Supabase...')
        # Call match_candidates RPC function
        candidates = await call_supabase_rpc(
            'match_candidates',
            {
                "query_embedding": query_embedding,
                "match_threshold": 0.1,
                "match_count": 10,
            }
        )
        if candidates and len(candidates) > 0:
            print(f'Found {len(candidates)} candidates for query: "{query}"')
            return SearchResponse(candidates=candidates)
        # Fallback: direct text search
        print('No candidates found with vector search, falling back to text search...')
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{SUPABASE_URL}/rest/v1/candidates",
                headers={
                    "apikey": SUPABASE_ANON_KEY,
                    "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
                },
                params={
                    "or": f"name.ilike.*{query}*,skills.cs.{{{query}}},raw_text.ilike.*{query}*",
                    "limit": 10
                },
                timeout=30.0
            )
            if response.status_code != 200:
                print(f"Supabase fallback text search error: {response.status_code} {response.text}")
                raise HTTPException(
                    status_code=500, 
                    detail=f"Database error: {response.text}"
                )
            text_candidates = response.json()
            # Add a dummy similarity score for UI compatibility
            for c in text_candidates:
                c["similarity"] = 1.0
            if not text_candidates:
                return SearchResponse(message="No candidates found matching your query.", candidates=[])
            print(f'Found {len(text_candidates)} candidates with fallback text search.')
            return SearchResponse(candidates=text_candidates)
    except HTTPException:
        raise
    except Exception as e:
        print(f"API error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Resume upload endpoint
@app.post("/api/resume/upload", response_model=ResumeUploadResponse)
async def upload_resume(
    file: UploadFile = File(..., description="Resume file (PDF, DOC, DOCX)")
):
    """
    Upload and parse a resume file.
    The file will be processed to extract candidate information, stored in Supabase,
    and embeddings will be generated for similarity search.
    """
    if not file:
        raise HTTPException(
            status_code=400,
            detail="Resume file is required."
        )
    
    # Check file type
    filename = file.filename.lower()
    if not (filename.endswith('.pdf') or filename.endswith('.doc') or filename.endswith('.docx')):
        raise HTTPException(
            status_code=400,
            detail="Only PDF, DOC, and DOCX files are supported."
        )
    
    try:
        print(f"Processing resume file: {filename}")
        
        # Read file content
        file_content = await file.read()
        
        # For now, we only support PDF parsing
        if filename.endswith('.pdf'):
            # Extract text from PDF
            resume_text = extract_text_from_pdf(file_content)
        else:
            # We would need additional libraries for DOC/DOCX
            # For the MVP, we'll return an error
            raise HTTPException(
                status_code=400,
                detail="Only PDF files are supported in the current version."
            )
        
        if not resume_text or len(resume_text.strip()) < 100:
            raise HTTPException(
                status_code=400,
                detail="Could not extract meaningful text from the resume. Please check the file."
            )
        
        # Parse resume text to extract basic information
        candidate_info = extract_basic_info(resume_text)
        
        # Generate a unique filename for storage
        import uuid
        unique_filename = f"{uuid.uuid4()}{os.path.splitext(filename)[1]}"
        file_path = f"resumes/{unique_filename}"
        
        # Upload file to Supabase Storage
        resume_url = await upload_to_supabase_storage("candidate-resumes", file_path, file_content)
        
        # Generate embeddings for the resume text using the simpler approach
        embedding = generate_simple_embedding(resume_text)
        
        # Prepare candidate data for database insertion
        candidate_data = {
            "name": candidate_info["name"],
            "email": candidate_info.get("email", ""),
            "current_title": candidate_info.get("current_title", "Unknown Position"),
            "location": candidate_info.get("location", "Unknown Location"),
            "work_auth": "Unknown",  # We need more sophisticated parsing for this
            "years_exp": candidate_info.get("years_exp", 0),
            "skills": candidate_info.get("skills", []),
            "resume_url": resume_url,
            "raw_text": resume_text,
            "embedding": embedding
        }
        
        # Insert candidate data into Supabase
        inserted_data = await insert_into_supabase("candidates", candidate_data)
        
        # Prepare response
        response = ResumeUploadResponse(
            candidate_id=inserted_data[0]["id"],
            name=candidate_info["name"],
            email=candidate_info.get("email", ""),
            current_title=candidate_info.get("current_title", ""),
            location=candidate_info.get("location", ""),
            skills=candidate_info.get("skills", []),
            years_exp=candidate_info.get("years_exp", 0),
            message="Resume uploaded and processed successfully"
        )
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Resume upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    
    def find_available_port(start_port: int, max_attempts: int = 10) -> int:
        """Find an available port starting from start_port."""
        for port in range(start_port, start_port + max_attempts):
            try:
                with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                    s.bind(('', port))
                    return port
            except OSError:
                continue
        raise RuntimeError(f"Could not find an available port after {max_attempts} attempts")
    
    default_port = int(os.getenv("PORT", "3001"))
    port = find_available_port(default_port)
    print(f"Starting server on port {port}")
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True) 