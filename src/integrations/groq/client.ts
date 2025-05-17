import axios from 'axios';
import { GROQ_API_KEY } from '@/config/environment';

// Groq API configuration
const MODEL_NAME = 'llama-3.3-70b-versatile';

// Axios instance for Groq API
const groqClient = axios.create({
  baseURL: 'https://api.groq.com/v1',
  headers: {
    'Authorization': `Bearer ${GROQ_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

// Generate embeddings for resume text
export const generateEmbeddings = async (text: string): Promise<number[]> => {
  try {
    const response = await groqClient.post('/embeddings', {
      model: MODEL_NAME,
      input: text
    });
    
    return response.data.data[0].embedding;
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw new Error('Failed to generate embeddings');
  }
};

// Generate a summary of why the candidate fits
export const generateCandidateSummary = async (
  resumeText: string, 
  jobDescription: string
): Promise<string> => {
  try {
    const response = await groqClient.post('/chat/completions', {
      model: MODEL_NAME,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful AI recruiter assistant that analyzes resumes and provides concise summaries of candidate fit.'
        },
        {
          role: 'user',
          content: `Review this resume:\n\n${resumeText}\n\nFor this job description:\n\n${jobDescription}\n\nProvide a concise 2-3 sentence summary of why this candidate might be a good fit.`
        }
      ],
      max_tokens: 150,
      temperature: 0.7
    });
    
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating candidate summary:', error);
    throw new Error('Failed to generate candidate summary');
  }
}; 