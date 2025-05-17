import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { RESUME_STORAGE_BUCKET } from '@/config/environment';

/**
 * Upload a resume file to Supabase Storage
 * @param file The resume file to upload
 * @returns Object with the file URL and name
 */
export const uploadResumeFile = async (file: File) => {
  try {
    // Generate a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `resumes/${fileName}`;
    
    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(RESUME_STORAGE_BUCKET)
      .upload(filePath, file);
      
    if (error) throw error;
    
    // Get public URL for the file
    const { data: { publicUrl } } = supabase.storage
      .from(RESUME_STORAGE_BUCKET)
      .getPublicUrl(filePath);
      
    return {
      resumeUrl: publicUrl,
      resumeFileName: fileName
    };
  } catch (error) {
    console.error('Error uploading resume:', error);
    throw new Error('Failed to upload resume file');
  }
};

/**
 * Store candidate data in the Supabase database
 * @param candidateData The parsed and processed candidate data
 * @returns The stored candidate data with ID
 */
export const storeCandidateData = async (candidateData: {
  name: string;
  email: string;
  currentTitle: string;
  location: string;
  workAuth?: string;
  yearsExperience: number;
  skills: string[];
  resumeText: string;
  resumeUrl: string;
  embedding: number[];
}) => {
  try {
    const { data, error } = await supabase
      .from('candidates')
      .insert([
        {
          name: candidateData.name,
          email: candidateData.email,
          current_title: candidateData.currentTitle,
          location: candidateData.location,
          work_auth: candidateData.workAuth || 'Unknown',
          years_exp: candidateData.yearsExperience,
          skills: candidateData.skills,
          resume_url: candidateData.resumeUrl,
          raw_text: candidateData.resumeText,
          embedding: candidateData.embedding
        }
      ])
      .select();
      
    if (error) throw error;
    
    return data[0];
  } catch (error) {
    console.error('Error storing candidate data:', error);
    throw new Error('Failed to store candidate data');
  }
}; 