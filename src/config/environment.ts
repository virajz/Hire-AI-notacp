/**
 * Environment variables for the application
 * These should be set in your .env file in production
 */

// Groq API Key - used for embeddings and LLM features
export const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';

// Gemini API Key - used for resume parsing
export const GEMINI_API_KEY = import.meta.env.GEMINI_API_KEY || '';

// Supabase configuration
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://wunrwaoyjgeqpwnhvjxo.supabase.co';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1bnJ3YW95amdlcXB3bmh2anhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0NjY2MjIsImV4cCI6MjA2MzA0MjYyMn0.EuA86Q5rm4l4FfTK6qayq9kWm7Kbmc10T3h3K5MxcUA';

// Storage buckets
export const RESUME_STORAGE_BUCKET = 'candidate-resumes';

// API endpoints
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';