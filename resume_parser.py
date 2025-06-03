import os
import re
import logging
import requests
from typing import Dict, List, Optional, Union
from datetime import datetime
from pathlib import Path
import tempfile

import spacy
import phonenumbers
from dateutil import parser as date_parser
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from pydantic import BaseModel, EmailStr
from unstructured.partition.auto import partition
from pyresparser import ResumeParser
from supabase import create_client, Client

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="Resume Parser API")

# Initialize Supabase client
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    logger.error("SUPABASE_URL or SUPABASE_SERVICE_KEY not set.")
    # In a production app, you might want to raise an exception or handle this differently

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# Initialize spaCy model
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    logger.info("Downloading spaCy model...")
    spacy.cli.download("en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

# Master skill list (you can expand this)
MASTER_SKILLS = {
    "python", "java", "javascript", "typescript", "react", "node.js", "sql",
    "aws", "docker", "kubernetes", "machine learning", "data science",
    "devops", "agile", "scrum", "git", "ci/cd", "rest api", "graphql"
}

class ResumeData(BaseModel):
    name: str
    email: EmailStr
    phone: str
    skills: List[str]
    education: List[Dict]
    experience: List[Dict]
    linkedin_url: Optional[str] = None
    raw_text: str

class ProcessResumePayload(BaseModel):
    candidate_id: str

def extract_text_from_document(file_path: str) -> str:
    """Extract text from PDF or DOCX using unstructured."""
    try:
        elements = partition(filename=file_path)
        return "\n".join([str(element) for element in elements])
    except Exception as e:
        logger.error(f"Error extracting text: {str(e)}")
        # We'll handle this gracefully in the parsing function
        return ""

def validate_phone(phone: str) -> str:
    """Validate and format phone number using phonenumbers library."""
    try:
        parsed_number = phonenumbers.parse(phone)
        if phonenumbers.is_valid_number(parsed_number):
            return phonenumbers.format_number(parsed_number, phonenumbers.PhoneNumberFormat.E164)
        return phone
    except:
        return phone

def normalize_date(date_str: str) -> str:
    """Normalize date string using dateutil."""
    try:
        parsed_date = date_parser.parse(date_str)
        return parsed_date.strftime("%Y-%m-%d")
    except:
        return date_str

def extract_linkedin_url(text: str) -> Optional[str]:
    """Extract LinkedIn URL using regex."""
    linkedin_pattern = r"(https?://(www\.)?linkedin\.com/[^\s]+)"
    match = re.search(linkedin_pattern, text)
    return match.group(0) if match else None

def validate_skills(skills: List[str]) -> List[str]:
    """Validate skills against master list."""
    validated_skills = []
    for skill in skills:
        skill_lower = skill.lower()
        if any(master_skill in skill_lower for master_skill in MASTER_SKILLS):
            validated_skills.append(skill)
    return validated_skills

def parse_resume_content(file_path: str) -> Dict:
    """Main resume parsing function, returns a dict of extracted data."""
    # Extract raw text
    raw_text = extract_text_from_document(file_path)
    
    # Parse with pyresparser
    try:
        parser = ResumeParser(file_path)
        parsed_data = parser.get_extracted_data()
    except Exception as e:
        logger.error(f"Pyresparser error: {str(e)}")
        parsed_data = {}
    
    # Extract LinkedIn URL
    linkedin_url = extract_linkedin_url(raw_text)
    
    # Validate and normalize data
    phone = validate_phone(parsed_data.get('phone_number', ''))
    skills = validate_skills(parsed_data.get('skills', []))
    
    # Normalize dates in experience and education
    experience = []
    for exp in parsed_data.get('experience', []):
        if 'start_date' in exp:
            exp['start_date'] = normalize_date(exp['start_date'])
        if 'end_date' in exp:
            exp['end_date'] = normalize_date(exp['end_date'])
        experience.append(exp)
    
    education = []
    for edu in parsed_data.get('education', []):
        if 'start_date' in edu:
            edu['start_date'] = normalize_date(edu['start_date'])
        if 'end_date' in edu:
            edu['end_date'] = normalize_date(edu['end_date'])
        education.append(edu)

    # Return a dictionary of the extracted data
    return {
        'name': parsed_data.get('name', ''),
        'email': parsed_data.get('email', ''),
        'phone': phone,
        'skills': skills,
        'education': education,
        'experience': experience,
        'linkedin_url': linkedin_url,
        'raw_text': raw_text
    }

async def process_resume_task(candidate_id: str):
    """Background task to download, parse, and update resume data."""
    logger.info(f"Processing resume for candidate ID: {candidate_id}")
    try:
        # Fetch candidate data to get resume URL
        response = supabase.from_('candidates').select('resume_url').eq('id', candidate_id).single().execute()
        if response.data and response.data[0]:
            resume_url = response.data[0]['resume_url']
            logger.info(f"Found resume URL: {resume_url}")
            
            # Download the file
            response = requests.get(resume_url, stream=True)
            response.raise_for_status() # Raise an exception for bad status codes
            
            # Save to a temporary file
            with tempfile.NamedTemporaryFile(delete=False) as tmp_file:
                for chunk in response.iter_content(chunk_size=8192):
                    tmp_file.write(chunk)
                temp_path = tmp_file.name
            
            logger.info(f"Downloaded resume to temporary file: {temp_path}")

            # Parse the resume
            parsed_data = parse_resume_content(temp_path)
            logger.info(f"Parsed data for {candidate_id}: {parsed_data}")

            # Update candidate record in Supabase
            update_response = supabase.from_('candidates').update({
                'name': parsed_data.get('name', ''),
                'email': parsed_data.get('email', ''),
                'current_title': parsed_data.get('current_title', ''), # Ensure key matches DB schema
                'location': parsed_data.get('location', ''), # Ensure key matches DB schema
                'work_auth': parsed_data.get('work_auth', ''), # Ensure key matches DB schema
                'years_exp': parsed_data.get('years_exp', 0), # Ensure key matches DB schema
                'skills': parsed_data.get('skills', []), # Ensure key matches DB schema
                'linkedin_url': parsed_data.get('linkedin_url', None),
                'raw_text': parsed_data.get('raw_text', '')
            }).eq('id', candidate_id).execute()

            if update_response.error:
                logger.error(f"Error updating candidate {candidate_id}: {update_response.error}")
            else:
                logger.info(f"Successfully updated candidate {candidate_id}")

            # Clean up temporary file
            os.remove(temp_path)
            logger.info(f"Removed temporary file: {temp_path}")

        else:
            logger.error(f"Candidate with ID {candidate_id} not found or no resume_url.")

    except Exception as e:
        logger.error(f"Error processing resume for candidate {candidate_id}: {str(e)}")

@app.post("/parse-resume-file/", response_model=ResumeData)
async def parse_resume_file_endpoint(file: UploadFile = File(...)):
    """FastAPI endpoint for direct resume parsing (keeping for convenience)."""
    # Save uploaded file temporarily
    temp_path = f"temp_{file.filename}"
    try:
        with open(temp_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Parse resume
        result_data = parse_resume_content(temp_path)
        
        # Return as ResumeData model
        return ResumeData(**result_data)
    
    except Exception as e:
        logger.error(f"Error processing resume: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        # Clean up temporary file
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.post("/process-uploaded-resume/")
async def process_uploaded_resume_endpoint(payload: ProcessResumePayload, background_tasks: BackgroundTasks):
    """FastAPI endpoint to trigger processing of an already uploaded resume."""
    background_tasks.add_task(process_resume_task, payload.candidate_id)
    return {"message": "Resume processing initiated in background"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)