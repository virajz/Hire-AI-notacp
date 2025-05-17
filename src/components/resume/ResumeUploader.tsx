
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import { parseResume } from '@/utils/resumeParser';

const ResumeUploader = ({ onUploadComplete }: { onUploadComplete: () => void }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

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
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      // Simulate parsing the resume
      await new Promise(resolve => setTimeout(resolve, 3000));
      clearInterval(interval);
      setProgress(100);
      
      // Parse resume (in a real app, this would call an API)
      const parsedData = await parseResume(file);
      
      // Show success toast
      toast.success("Resume uploaded and parsed successfully");
      
      // Call the callback
      setTimeout(() => {
        setIsUploading(false);
        setProgress(0);
        onUploadComplete();
      }, 500);
      
    } catch (error) {
      clearInterval();
      toast.error("Failed to upload resume. Please try again.");
      setIsUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="flex flex-col items-center p-8 border-2 border-dashed border-muted rounded-lg w-full">
      <Upload className="h-10 w-10 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">Upload Resumes</h3>
      <p className="text-muted-foreground text-sm mb-4 text-center">
        Drag and drop resume files (PDF, DOC, DOCX) or click to browse
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
            accept=".pdf,.doc,.docx"
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
