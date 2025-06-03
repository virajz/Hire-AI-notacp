# AI Resume Parser

A powerful resume parsing API built with FastAPI that combines multiple parsing techniques to achieve high accuracy in extracting information from resumes.

## Features

- Text extraction from PDF and DOCX files using `unstructured`
- Field parsing using `pyresparser` for basic information extraction
- Regex-based extraction for additional fields (e.g., LinkedIn URLs)
- Date normalization and phone number validation
- Skill matching against a master skill list
- FastAPI microservice architecture

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Install spaCy model:
```bash
python -m spacy download en_core_web_sm
```

## Usage

1. Start the server:
```bash
python resume_parser.py
```

2. The API will be available at `http://localhost:8000`

3. API Endpoints:
   - POST `/parse-resume/`: Upload and parse a resume
   - GET `/docs`: Swagger documentation

## Example API Call

```python
import requests

url = "http://localhost:8000/parse-resume/"
files = {"file": open("resume.pdf", "rb")}
response = requests.post(url, files=files)
parsed_data = response.json()
```

## Response Format

```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "skills": ["Python", "Machine Learning", "AWS"],
    "education": [
        {
            "degree": "Bachelor of Science",
            "field": "Computer Science",
            "start_date": "2015-09-01",
            "end_date": "2019-05-15"
        }
    ],
    "experience": [
        {
            "title": "Software Engineer",
            "company": "Tech Corp",
            "start_date": "2019-06-01",
            "end_date": "present"
        }
    ],
    "linkedin_url": "https://linkedin.com/in/johndoe",
    "raw_text": "..."
}
```

## Error Handling

The API includes comprehensive error handling for:
- Invalid file formats
- Parsing failures
- File processing errors

## Contributing

Feel free to submit issues and enhancement requests!
