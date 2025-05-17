import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { API_BASE_URL } from '@/config/environment';

const ResumeUploader = ({ onUploadComplete }: { onUploadComplete: (candidateData?: any) => void }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressInterval, setProgressInterval] = useState<NodeJS.Timeout | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setIsUploading(true);
    setProgress(0);

    try {
      // Start progress animation
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            if (progressInterval) clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);
      
      setProgressInterval(interval);

      // Prepare form data for file upload
      const formData = new FormData();
      formData.append('file', file);
      
      // Call the API endpoint to upload and process the resume
      const response = await axios.post(
        '/api/resume/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      if (progressInterval) clearInterval(progressInterval);
      setProgress(100);
      
      // Extract candidate data from the response
      const parsedData = response.data;
      
      // Show success toast
      toast.success(`Resume for ${parsedData.name || 'candidate'} processed successfully`);
      
      // Call the callback with the parsed data
      setTimeout(() => {
        setIsUploading(false);
        setProgress(0);
        onUploadComplete(parsedData);
      }, 500);
      
    } catch (error) {
      console.error("Resume processing error:", error);
      
      // Clear progress interval
      if (progressInterval) clearInterval(progressInterval);
      setProgressInterval(null);
      
      setProgress(0);
      toast.error(
        axios.isAxiosError(error) && error.response?.data?.detail
          ? error.response.data.detail
          : "Failed to process resume. Please try again."
      );
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-8 border-2 border-dashed border-muted rounded-lg w-full">
      <Upload className="h-10 w-10 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">Upload Resumes</h3>
      <p className="text-muted-foreground text-sm mb-4 text-center">
        Drag and drop resume files (PDF) or click to browse
      </p>

      <div className="relative">
        <Button 
          variant="outline"
          className="relative"
          disabled={isUploading}
        >
          {isUploading ? `Processing... ${progress}%` : "Select Files"}
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            accept=".pdf"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </Button>
      </div>

      {isUploading && (
        <div className="w-full mt-4">
          <div className="h-2 bg-muted rounded overflow-hidden">
            <div 
              className="h-full bg-highlight transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-4">
        We'll extract skills, experience, and location automatically
      </p>
    </div>
  );
};

export default ResumeUploader;
