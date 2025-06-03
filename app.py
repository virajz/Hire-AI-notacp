import os
import nltk # Make sure nltk is imported early

# --- BEGIN NLTK Path Configuration ---
# Construct the absolute path to your custom NLTK data directory
# RENDER_PROJECT_ROOT is typically /opt/render/project/src on Render
# If running locally and RENDER_PROJECT_ROOT is not set, it defaults to the current working directory.
project_root = os.environ.get('RENDER_PROJECT_ROOT', os.getcwd())
custom_nltk_data_path = os.path.join(project_root, "nltk_data_local")

# Check if the custom path exists (it should if build.sh ran correctly)
if os.path.exists(custom_nltk_data_path):
    # Prepend your custom path to NLTK's data path list
    # This makes NLTK look here first.
    if custom_nltk_data_path not in nltk.data.path:
        nltk.data.path.insert(0, custom_nltk_data_path)
    print(f"Successfully added custom NLTK data path: {custom_nltk_data_path}")
    print(f"NLTK search paths (runtime): {nltk.data.path}")
else:
    print(f"Custom NLTK data path not found: {custom_nltk_data_path}. NLTK will use default paths.")
    print(f"NLTK search paths (runtime, default): {nltk.data.path}")
# --- END NLTK Path Configuration ---

import base64
import tempfile
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Query, File, UploadFile, Form, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import httpx
import json
import PyPDF2
import re
import hashlib
import socket
import fitz  # PyMuPDF (for PDF parsing)
import mammoth  # For DOCX parsing (better than python-docx for text extraction)
from pyresparser import ResumeParser

# Import robust parser
from backend.routers.resume_parser import extract_fields

# Load environment variables
load_dotenv()

# Environment variables
SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("VITE_SUPABASE_ANON_KEY")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") # Ensure this is set in your backend environment

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
    allow_origins=["http://localhost:8080", "http://localhost:5173", "https://hire-ai-notacp.vercel.app/"],  # Add both Vite default ports
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

class AISummaryResponse(BaseModel):
    ai_summary: str

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
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        text = "\n".join(page.get_text() for page in doc)
        if text.strip():
            return text
    except Exception:
        pass
    return ""

def extract_text_from_docx(file_bytes: bytes) -> str:
    try:
        # Use mammoth to extract text from DOCX
        result = mammoth.extract_raw_text(file_bytes)
        text = result.value
        return text
    except Exception:
        return ""

@app.post("/api/resume/parse_from_bucket")
async def parse_resumes_from_bucket(filenames: list[str] = Body(...)):
    SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
    SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
    bucket = "candidate-resumes"
    parsed_results = []
    import httpx
    for filename in filenames:
        ext = filename.split(".")[-1].lower()
        file_url = f"{SUPABASE_URL}/storage/v1/object/{bucket}/resumes/{filename}"
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get(file_url, headers={
                    "apikey": SUPABASE_SERVICE_ROLE_KEY,
                    "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}"
                })
                if resp.status_code != 200:
                    parsed_results.append({"filename": filename, "error": f"Download failed: {resp.text}"})
                    continue
                file_bytes = resp.content
        except Exception as e:
            parsed_results.append({"filename": filename, "error": str(e)})
            continue
        try:
            fields = None
            if ext == "pdf":
                # Try pyresparser first
                with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
                    tmp_file.write(file_bytes)
                    tmp_path = tmp_file.name
                try:
                    parser = ResumeParser(tmp_path)
                    parsed_data = parser.get_extracted_data()
                    # If pyresparser returns at least a name or email, use it
                    if parsed_data and (parsed_data.get("name") or parsed_data.get("email")):
                        fields = parsed_data
                    else:
                        fields = None
                except Exception as e:
                    fields = None
                finally:
                    os.remove(tmp_path)
                # Fallback to PyMuPDF/pdfplumber logic if pyresparser fails
                if not fields:
                    text = extract_text_from_pdf(file_bytes)
                    if not text.strip():
                        parsed_results.append({"filename": filename, "error": "No extractable text found"})
                        continue
                    fields = extract_fields(text)
            elif ext in ("doc", "docx"):
                text = extract_text_from_docx(file_bytes)
                if not text.strip():
                    parsed_results.append({"filename": filename, "error": "No extractable text found"})
                    continue
                fields = extract_fields(text)
            else:
                parsed_results.append({"filename": filename, "error": "Unsupported file type"})
                continue
            parsed_results.append({"filename": filename, "fields": fields})
        except Exception as e:
            parsed_results.append({"filename": filename, "error": str(e)})
    return parsed_results

@app.post("/api/resume/upload", response_model=ResumeUploadResponse)
async def upload_resume(
    file: UploadFile = File(...),
    extracted_text: str = Form(None)
):
    try:
        print(f"Processing file: {file.filename}")
        # Read file content
        file_bytes = await file.read()
        
        # Generate a unique filename
        file_hash = hashlib.md5(file_bytes).hexdigest()
        filename = f"{file_hash}.{file.filename.split('.')[-1]}"
        print(f"Generated filename: {filename}")
        
        # Store in Supabase
        bucket_path = f"resumes/{filename}"
        headers = {
            "apikey": SUPABASE_SERVICE_ROLE_KEY,
            "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}"
        }
        
        # Upload to Supabase Storage
        upload_url = f"{SUPABASE_URL}/storage/v1/object/candidate-resumes/{bucket_path}"
        
        # Set the correct Content-Type based on file extension
        content_type = "application/pdf" if file.filename.lower().endswith('.pdf') else \
                      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" if file.filename.lower().endswith('.docx') else \
                      "application/msword" if file.filename.lower().endswith('.doc') else \
                      "application/octet-stream"
        
        headers["Content-Type"] = content_type
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                upload_url,
                content=file_bytes,
                headers=headers
            )
            
            if response.status_code != 200:
                print(f"Supabase upload failed: {response.text}")
                #raise HTTPException(status_code=500, detail=f"Failed to upload file to storage: {response.text}")

        # Use pre-extracted text from Gemini if available
        text = None
        if extracted_text:
            print("Using pre-extracted text from Gemini")
            text = extracted_text
        else:
            # Extract text based on file type
            if file.filename.lower().endswith('.pdf'):
                print("Extracting text from PDF")
                try:
                    text = extract_text_from_pdf(file_bytes)
                    print(f"Extracted text length: {len(text) if text else 0}")
                except Exception as e:
                    print(f"PDF extraction error: {str(e)}")
                    raise HTTPException(status_code=500, detail=f"Error extracting text from PDF: {str(e)}")
            elif file.filename.lower().endswith(('.doc', '.docx')):
                print("Extracting text from DOCX")
                try:
                    text = extract_text_from_docx(file_bytes)
                    print(f"Extracted text length: {len(text) if text else 0}")
                except Exception as e:
                    print(f"DOCX extraction error: {str(e)}")
                    raise HTTPException(status_code=500, detail=f"Error extracting text from DOCX: {str(e)}")
            else:
                raise HTTPException(status_code=400, detail="Unsupported file type. Please upload PDF or DOCX files only.")
        
        if not text:
            raise HTTPException(status_code=422, detail="Could not extract text from resume")
        
        # Parse resume text using the extract_fields function
        print("Parsing extracted text")
        try:
            # from backend.routers.resume_parser import extract_fields # Already imported at the top
            parsed_fields = extract_fields(text) if text else {}
            print(f"Initial Parsed fields: {parsed_fields}") # Log initial parse
        except Exception as e:
            print(f"Resume parsing error: {str(e)}")
            # Fallback to empty dict if parsing fails, to allow default values to be set
            parsed_fields = {}
            # raise HTTPException(status_code=500, detail=f"Error parsing resume text: {str(e)}") # Optionally re-raise
        
        # Fallback if primary parsing yields no useful data (e.g., name is missing)
        if not parsed_fields.get("name"):
            name_from_filename = os.path.splitext(file.filename)[0] if file.filename else "Unknown Candidate"
            # Preserve any fields that might have been parsed, even if name was missing
            parsed_fields = {
                "name": parsed_fields.get("name") or name_from_filename,
                "email": parsed_fields.get("email"),
                "current_title": parsed_fields.get("current_title"),
                "location": parsed_fields.get("location"),
                "hard_skills": parsed_fields.get("hard_skills", []),
                "years_exp": parsed_fields.get("years_exp"),
            }
            print(f"Refined/Fallback parsed_fields: {parsed_fields}")

        # Prepare candidate data for database insertion
        # Explicitly handle current_title to ensure it's never None or empty if the column is NOT NULL
        current_title_val = parsed_fields.get("current_title")
        if current_title_val is None or str(current_title_val).strip() == "":
            current_title_to_insert = "Not specified"
        else:
            current_title_to_insert = str(current_title_val).strip()

        # Explicitly handle location to ensure it's never None or empty if the column is NOT NULL
        location_val = parsed_fields.get("location")
        if location_val is None or str(location_val).strip() == "":
            location_to_insert = "Not specified"
        else:
            location_to_insert = str(location_val).strip()

        # Handle years_exp carefully
        years_exp_val = parsed_fields.get("years_exp")
        years_exp_to_insert = None # Default to None if nullable in DB
        if years_exp_val is not None and str(years_exp_val).strip() != "":
            try:
                years_exp_to_insert = float(str(years_exp_val).strip())
            except ValueError:
                print(f"Could not convert years_exp '{years_exp_val}' to float. Setting to None.")
                # If years_exp is NOT NULL in DB, you might want to default to 0 here:
                # years_exp_to_insert = 0 
        # else: # If years_exp is NOT NULL and must have a value
            # years_exp_to_insert = 0 

        MAX_RAW_TEXT_LENGTH = 20000 # Define if not already defined globally

        candidate_data_to_insert = {
            "name": parsed_fields.get("name"),
            "email": parsed_fields.get("email"),
            "current_title": current_title_to_insert,
            "location": location_to_insert, # Use the explicitly handled value
            "skills": parsed_fields.get("hard_skills", []),
            "years_exp": years_exp_to_insert,
            "resume_url": f"{SUPABASE_URL}/storage/v1/object/public/candidate-resumes/{bucket_path}", # Assuming public bucket
            "raw_text": text[:MAX_RAW_TEXT_LENGTH] if text else None
        }
        
        # This line, if active, removes keys where the value is None.
        # candidate_data_to_insert = {k: v for k, v in candidate_data_to_insert.items() if v is not None}
        # For now, let Supabase handle nulls for nullable columns.

        print(f"Data to insert into DB: {json.dumps(candidate_data_to_insert, indent=2)}") # Log data before DB insert

        # Insert into Supabase 'candidates' table
        db_insert_url = f"{SUPABASE_URL}/rest/v1/candidates"
        db_headers = {
            "apikey": SUPABASE_SERVICE_ROLE_KEY,
            "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"  # To get the inserted row back
        }
        
        inserted_candidate_id_from_db = None
        async with httpx.AsyncClient() as client:
            try:
                db_response = await client.post(
                    db_insert_url,
                    json=candidate_data_to_insert,
                    headers=db_headers
                )
                db_response.raise_for_status() # Raise an exception for HTTP errors (4xx or 5xx)
                
                if db_response.status_code == 201:  # HTTP 201 Created
                    inserted_data = db_response.json()
                    if inserted_data and len(inserted_data) > 0:
                        inserted_candidate_id_from_db = inserted_data[0].get("id")
                    print(f"Successfully inserted candidate into DB. DB ID: {inserted_candidate_id_from_db}")
                else:
                    print(f"Failed to insert candidate into DB (Status: {db_response.status_code}): {db_response.text}")
                    # Not raising an error here, will return filename as candidate_id as fallback

            except httpx.HTTPStatusError as e:
                print(f"HTTP error inserting candidate into DB: {e.response.status_code} - {e.response.text}")
            except Exception as e:
                print(f"Generic error inserting candidate into DB: {str(e)}")

        # Return parsed information
        return ResumeUploadResponse(
            candidate_id=str(inserted_candidate_id_from_db) if inserted_candidate_id_from_db else filename, # Prefer DB ID
            name=parsed_fields.get("name", ""),
            email=parsed_fields.get("email", ""),
            current_title=parsed_fields.get("current_title", ""),
            location=parsed_fields.get("location", ""),
            skills=parsed_fields.get("hard_skills", []),
            years_exp=float(parsed_fields.get("years_exp")) if parsed_fields.get("years_exp") else None,
        )
        
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing resume: {str(e)}")

async def generate_text_summary_with_gemini(text_to_summarize: str) -> Optional[str]:
    if not GEMINI_API_KEY:
        print("GEMINI_API_KEY not configured for backend summary generation.")
        return None
    
    # This is a generic endpoint, replace with the actual one for your Gemini model
    # e.g., "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"
    gemini_api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={GEMINI_API_KEY}"
    
    # Construct the prompt carefully
    prompt = f"Summarize the following resume text, focusing on key skills, experience, and overall fit. Provide a concise summary suitable for a recruiter: \n\n{text_to_summarize[:4000]}" # Limit input text length
    
    payload = {
        "contents": [{
            "parts": [{
                "text": prompt
            }]
        }],
        "generationConfig": {
            "temperature": 0.5,
            "maxOutputTokens": 250,
        }
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(gemini_api_url, json=payload)
            response.raise_for_status() # Raise an exception for HTTP errors
            result = response.json()
            
            # Extract the summary text - structure depends on Gemini API response
            # This is a common pattern, adjust if needed:
            if result.get("candidates") and result["candidates"][0].get("content") and result["candidates"][0]["content"].get("parts"):
                summary = result["candidates"][0]["content"]["parts"][0]["text"]
                return summary.strip()
            else:
                print(f"Unexpected Gemini API response structure: {result}")
                return None
        except httpx.HTTPStatusError as e:
            print(f"Gemini API HTTP error: {e.response.status_code} - {e.response.text}")
            return None
        except Exception as e:
            print(f"Error calling Gemini API: {str(e)}")
            return None

@app.post("/api/candidate/{candidate_id}/generate_summary", response_model=AISummaryResponse)
async def generate_ai_summary(candidate_id: str):
    # 1. Fetch raw_text from Supabase
    fetch_url = f"{SUPABASE_URL}/rest/v1/candidates?id=eq.{candidate_id}&select=raw_text"
    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}"
    }
    raw_text = None
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(fetch_url, headers=headers)
            response.raise_for_status()
            data = response.json()
            if data and len(data) > 0 and data[0].get("raw_text"):
                raw_text = data[0]["raw_text"]
            else:
                raise HTTPException(status_code=404, detail="Candidate or raw text not found")
        except httpx.HTTPStatusError as e:
            print(f"Error fetching raw_text: {e.response.status_code} - {e.response.text}")
            raise HTTPException(status_code=e.response.status_code, detail="Failed to fetch candidate data")
        except Exception as e:
            print(f"Generic error fetching raw_text: {str(e)}")
            raise HTTPException(status_code=500, detail="Server error fetching candidate data")

    if not raw_text:
        raise HTTPException(status_code=404, detail="Raw text not found for candidate")

    # 2. Generate summary with Gemini
    generated_summary = await generate_text_summary_with_gemini(raw_text)
    if not generated_summary:
        raise HTTPException(status_code=500, detail="Failed to generate AI summary")

    # 3. Update ai_summary in Supabase
    update_url = f"{SUPABASE_URL}/rest/v1/candidates?id=eq.{candidate_id}"
    update_payload = {"ai_summary": generated_summary}
    db_headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal" # Or "representation" if you want the updated row back
    }
    async with httpx.AsyncClient() as client:
        try:
            response = await client.patch(update_url, json=update_payload, headers=db_headers)
            response.raise_for_status()
            print(f"Successfully updated ai_summary for candidate {candidate_id}")
        except httpx.HTTPStatusError as e:
            print(f"Error updating ai_summary: {e.response.status_code} - {e.response.text}")
            # Not raising HTTPException here, as summary was generated, but DB update failed.
            # Frontend will still get the summary, but it won't be persisted if this fails.
            # Consider how to handle this - maybe return summary but with a warning.
        except Exception as e:
            print(f"Generic error updating ai_summary: {str(e)}")

    return AISummaryResponse(ai_summary=generated_summary)

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