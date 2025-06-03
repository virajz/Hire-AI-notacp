import { generateEmbeddings, generateCandidateSummary } from '@/integrations/groq/client';
import { parseResumeText } from '@/integrations/gemini/client';
import { uploadResumeFile, storeCandidateData } from './storageUtils';

/**
 * Escape special regex characters in a string
 */
const escapeRegExp = (input: string): string =>
  input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Extract basic information from the resume text
 */
export const extractBasicInfo = (text: string) => {
  // Initialize with default values
  const info = {
    name: '',
    email: '',
    phone: '',
    location: '',
    yearsExperience: 0,
    skills: [] as string[]
  };

  // Extract name (usually one of the first lines of the resume)
  const nameLines = text.split('\n').slice(0, 5);
  for (const line of nameLines) {
    const trimmedLine = line.trim();
    // Name is usually a short line with no special characters
    if (trimmedLine.length > 3 && trimmedLine.length < 30 && 
        !trimmedLine.includes('@') && !trimmedLine.includes(':') && 
        !trimmedLine.match(/^\d/)) {
      info.name = trimmedLine;
      break;
    }
  }

  // Extract email
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
  const emailMatch = text.match(emailRegex);
  if (emailMatch) {
    info.email = emailMatch[0];
  }

  // Extract phone number
  const phoneRegex = /(\+\d{1,3}[ -]?)?\(?\d{3}\)?[ -]?\d{3}[ -]?\d{4}/g;
  const phoneMatch = text.match(phoneRegex);
  if (phoneMatch) {
    info.phone = phoneMatch[0];
  }

  // Extract location (city, state, country)
  const locationKeywords = ['Location:', 'Address:', 'City:', 'Based in', 'residing in'];
  const lines = text.split('\n');
  for (const line of lines) {
    const lower = line.toLowerCase();
    if (locationKeywords.some(kw => lower.includes(kw.toLowerCase()))) {
      // Extract the part after the keyword
      const keyword = locationKeywords.find(kw => lower.includes(kw.toLowerCase()));
      if (keyword) {
        const index = lower.indexOf(keyword.toLowerCase());
        info.location = line.substring(index + keyword.length).trim();
        if (info.location.startsWith(':')) {
          info.location = info.location.substring(1).trim();
        }
      }
    }
  }

  // Try to extract location from common city/country patterns if not found above
  if (!info.location) {
    const cities = ['New York', 'San Francisco', 'Bangalore', 'London', 'Berlin', 'Tokyo', 'Sydney', 'Toronto', 'Austin', 'Seattle', 'Chicago', 'Boston'];
    for (const city of cities) {
      if (text.includes(city)) {
        info.location = city;
        break;
      }
    }
  }

  // Estimate years of experience based on dates
  const yearRanges = text.match(/20\d{2}\s*[-–—]\s*(20\d{2}|present|current)/gi) || [];
  let totalYears = 0;
  
  for (const range of yearRanges) {
    const [startStr, endStr] = range.split(/[-–—]/);
    const startYear = parseInt(startStr.trim());
    let endYear;
    
    if (endStr.trim().toLowerCase().includes('present') || endStr.trim().toLowerCase().includes('current')) {
      endYear = new Date().getFullYear();
    } else {
      endYear = parseInt(endStr.trim());
    }
    
    if (!isNaN(startYear) && !isNaN(endYear) && endYear >= startYear) {
      totalYears += (endYear - startYear);
    }
  }
  
  info.yearsExperience = totalYears > 0 ? totalYears : estimateExperienceFromText(text);

  // Extract skills
  info.skills = extractSkills(text);

  return info;
};

/**
 * Estimate years of experience from textual indicators
 */
const estimateExperienceFromText = (text: string): number => {
  const expRegex = /(\d+)[\+]?\s+(years|year)(\s+of)?\s+experience/i;
  const match = text.match(expRegex);
  
  if (match) {
    return parseInt(match[1]);
  }
  
  return 0;
};

/**
 * Extract skills from resume text
 */
const extractSkills = (text: string): string[] => {
  const commonSkills = [
    'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue', 'Node.js', 
    'Express', 'Next.js', 'Python', 'Django', 'Flask', 'Java', 'Spring', 
    'C#', '.NET', 'Go', 'Rust', 'PHP', 'Laravel', 'Ruby', 'Rails',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Git',
    'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'GraphQL',
    'REST API', 'Microservices', 'Machine Learning', 'AI',
    'HTML', 'CSS', 'Sass', 'TailwindCSS', 'Bootstrap', 'Material UI',
    'Jest', 'Testing', 'Cypress', 'Selenium'
  ];
  
  const skills: string[] = [];
  
  for (const skill of commonSkills) {
    const skillRegex = new RegExp(`\\b${escapeRegExp(skill)}\\b`, 'i');
    if (skillRegex.test(text)) {
      skills.push(skill);
    }
  }
  
  return skills;
};

/**
 * Extract current job title from resume text
 */
export const extractCurrentTitle = (text: string): string | null => {
  // Look for current job title indicators
  const currentTitleIndicators = [
    /current(ly)?:?\s*([^,\n.]+)/i,
    /present:?\s*([^,\n.]+)/i,
    /job title:?\s*([^,\n.]+)/i,
    /position:?\s*([^,\n.]+)/i,
    /title:?\s*([^,\n.]+)/i,
    /role:?\s*([^,\n.]+)/i
  ];
  
  for (const regex of currentTitleIndicators) {
    const match = text.match(regex);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  // If we couldn't find explicit indicators, try to find the most recent position
  const lines = text.split('\n');
  
  // Common job titles
  const jobTitles = [
    'Software Engineer', 'Software Developer', 'Full Stack', 'Frontend', 'Backend',
    'DevOps', 'Data Scientist', 'Data Engineer', 'Product Manager', 'Project Manager',
    'Engineering Manager', 'CTO', 'VP', 'Director', 'Lead', 'Architect', 'Designer'
  ];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (jobTitles.some(title => line.includes(title))) {
      // Check if the line also has a recent year
      if (line.match(/20(1[5-9]|2[0-9])/)) {
        return line.trim();
      }
    }
  }
  
  return null;
};

/**
 * Parse a resume file and extract candidate information
 */
export const parseResume = async (file: File) => {
  try {
    // Extract text using Gemini
    const text = await parseResumeText(file);
    
    // Use classical parsing approach
    const basicInfo = extractBasicInfo(text);
    const currentTitle = extractCurrentTitle(text);
    
    // Upload the file to storage
    const { resumeUrl } = await uploadResumeFile(file);
    
    // Generate embeddings for the resume text
    const embedding = await generateEmbeddings(text);
    
    // Prepare candidate data
    const candidateData = {
      name: basicInfo.name,
      email: basicInfo.email,
      currentTitle: currentTitle || 'Unknown Position',
      location: basicInfo.location || 'Unknown Location',
      workAuth: 'Unknown', // Would need more sophisticated parsing to determine
      yearsExperience: basicInfo.yearsExperience,
      skills: basicInfo.skills,
      resumeText: text,
      resumeUrl,
      embedding
    };
    
    // Store candidate data in the database
    const storedCandidate = await storeCandidateData(candidateData);
    
    return {
      ...storedCandidate,
      phone: basicInfo.phone
    };
  } catch (error) {
    console.error('Error parsing resume:', error);
    throw new Error('Failed to parse resume');
  }
};
