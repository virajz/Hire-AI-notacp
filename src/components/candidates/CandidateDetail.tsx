import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Mail, Download, Calendar, MapPin, Briefcase } from "lucide-react";
import { useState, useEffect } from "react";
import EmailComposer from "../email/EmailComposer";
import { supabase } from "@/integrations/supabase/client";

interface CandidateDetailProps {
  candidateId: string | null;
  open: boolean;
  onClose: () => void;
  onStatusChange?: (id: string, status: string) => void;
}

// Define a more comprehensive type for detailed candidate view
interface DetailedCandidate {
  id: string;
  name: string;
  currentTitle: string;
  location: string;
  workAuth: string; // Made required
  yearsExp: number; // Made required
  skills: string[]; // Will default to empty array
  shortlisted: boolean; // Will default to false
  status: 'new' | 'contacted' | 'interested' | 'interviewing'; // Made required, will default to 'new'
  aiSummary?: string; // Will default to undefined or empty string
  achievements: string[]; // Will default to empty array
  // Add other fields like resume_url if needed for download
}

const CandidateDetail = ({ candidateId, open, onClose, onStatusChange }: CandidateDetailProps) => {
  const [showingEmail, setShowingEmail] = useState(false);
  const [candidate, setCandidate] = useState<DetailedCandidate | null>(null);
  const [loading, setLoading] = useState(false); // For initial candidate load
  const [error, setError] = useState<string | null>(null); // For initial candidate load

  // State for AI Summary generation
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  useEffect(() => {
    if (candidateId && open) {
      const fetchCandidateDetails = async () => {
        setLoading(true);
        setError(null);
        setCandidate(null); // Clear previous candidate
        try {
          const { data, error: supabaseError } = await supabase
            .from('candidates')
            .select('*') // Reverted to select('*') to fetch all existing columns
            .eq('id', candidateId)
            .single();

          if (supabaseError) {
            // If the error is specifically about a column not existing, it might be suppressed here
            // or handled, but for now, we let it throw to be caught below.
            throw supabaseError;
          }

          console.log("Fetched candidate data in modal:", data); // Log the fetched data

          if (data) {
            // Map Supabase data to DetailedCandidate structure
            setCandidate({
              id: data.id,
              name: data.name,
              currentTitle: data.current_title,
              location: data.location,
              workAuth: data.work_auth || "N/A",
              yearsExp: data.years_exp || 0,
              // Use fetched data for these fields, with fallbacks
              skills: data['skills'] || [], 
              shortlisted: data['shortlisted'] || false,
              status: (data['status'] || 'new') as DetailedCandidate['status'],
              aiSummary: data['ai_summary'] || undefined, 
              achievements: data['achievements'] || [],
            });
          } else {
            setError("Candidate not found.");
          }
        } catch (err: any) {
          console.error("Error fetching candidate details:", err);
          setError(err.message || "Failed to fetch candidate details.");
        } finally {
          setLoading(false);
        }
      };
      fetchCandidateDetails();
    } else if (!open) {
      // Reset when dialog is closed
      setCandidate(null);
      setShowingEmail(false);
      setError(null);
      setIsGeneratingSummary(false); // Reset summary generation state
      setSummaryError(null);      // Reset summary error state
    }
  }, [candidateId, open]);

  const handleGenerateSummary = async () => {
    if (!candidate) return;
    setIsGeneratingSummary(true);
    setSummaryError(null);
    try {
      const response = await fetch(`/api/candidate/${candidate.id}/generate_summary`, {
        method: "POST",
      });
      if (!response.ok) {
        let errorDetail = "Failed to generate summary"; // Default message
        try {
          // Attempt to parse JSON error response from backend
          const errorData = await response.json();
          if (errorData && errorData.detail) {
            errorDetail = errorData.detail;
          } else {
            // If no JSON or no detail field, use status text
            errorDetail = `Server error: ${response.status} ${response.statusText}`;
          }
        } catch (jsonError) {
          // If response.json() itself fails (e.g., HTML error page instead of JSON)
          errorDetail = `Server error: ${response.status} ${response.statusText}. Could not parse error response.`;
        }
        throw new Error(errorDetail);
      }
      const result = await response.json();
      setCandidate(prevCandidate => prevCandidate ? { ...prevCandidate, aiSummary: result.ai_summary } : null);
    } catch (err: any) {
      console.error("Error generating AI summary:", err);
      setSummaryError(err.message || "An error occurred while generating the summary.");
    }
    setIsGeneratingSummary(false);
  };

  if (!open) { // Keep dialog unrendered if not open, useEffect handles cleanup
    return null;
  }

  // Handle loading and error states for the fetched data
  if (loading) {
    return (
      <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Loading Candidate...</DialogTitle>
          </DialogHeader>
          <div className="py-4">Loading details...</div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error && !candidate) { // Show error if fetching failed and no candidate data
     return (
      <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-red-600">{error}</div>
           <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  if (!candidate) { // If not loading, no error, but still no candidate (e.g. after closing), render nothing until open triggers fetch
    return null;
  }
  
  // Log candidate.skills at render time
  console.log("Rendering CandidateDetail, candidate.skills:", candidate.skills);

  const handleEmailClick = () => { // Renamed from handleEmail to avoid conflict if any
    setShowingEmail(true);
  };
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        setShowingEmail(false);
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>{candidate.name}</span>
            <Button
              variant="ghost"
              size="icon"
              className={`${candidate.shortlisted ? 'text-yellow-500' : 'text-muted-foreground'}`}
            >
              <Star className="h-5 w-5" fill={candidate.shortlisted ? 'currentColor' : 'none'} />
            </Button>
          </DialogTitle>
          <DialogDescription>{candidate.currentTitle}</DialogDescription>
        </DialogHeader>
        
        {showingEmail ? (
          <EmailComposer 
            candidate={candidate} 
            onBack={() => setShowingEmail(false)} 
            onSend={() => {
              setShowingEmail(false);
              onClose();
            }}
            onStatusChange={onStatusChange}
          />
        ) : (
          <>
            <div className="mt-2 space-y-4">
              <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {candidate.location}
                </div>
                {candidate.workAuth && (
                  <Badge variant="outline" className="ml-1">
                    {candidate.workAuth}
                  </Badge>
                )}
                <div className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-1" />
                  {candidate.yearsExp} years experience
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">Skills</h4>
                <div className="flex flex-wrap gap-1">
                  {candidate.skills?.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <Tabs defaultValue="summary">
                <TabsList className="grid grid-cols-3 mb-2">
                  <TabsTrigger value="summary">AI Summary</TabsTrigger>
                  <TabsTrigger value="resume">Resume</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>
                
                <TabsContent value="summary" className="space-y-3">
                  <div className="bg-muted/50 p-3 rounded-md text-sm">
                    <h4 className="font-medium mb-1">Why They Fit</h4>
                    {isGeneratingSummary ? (
                      <p>Generating AI summary...</p>
                    ) : summaryError ? (
                      <p className="text-red-600">Error: {summaryError}</p>
                    ) : candidate.aiSummary ? (
                      <p>{candidate.aiSummary}</p>
                    ) : (
                      <div className="text-center py-2">
                        <p className="text-muted-foreground mb-2">No AI summary available.</p>
                        <Button onClick={handleGenerateSummary} size="sm" variant="outline" disabled={isGeneratingSummary}>
                          Generate AI Summary
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {/* <div>
                    <h4 className="text-sm font-medium mb-1">Key Achievements</h4>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {candidate.achievements?.map((achievement, i) => (
                        <li key={i}>{achievement}</li>
                      )) || <li>No achievements listed.</li>}
                    </ul>
                  </div> */}
                </TabsContent>
                
                <TabsContent value="resume">
                  <div className="bg-muted/50 p-6 rounded-md flex flex-col items-center justify-center">
                    <p className="text-sm text-muted-foreground mb-2">Resume preview</p>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Download Resume
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="history">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span className="text-muted-foreground">Added to system on May 12, 2025</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4" />
                      <span className="text-muted-foreground">No previous emails sent</span>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button onClick={handleEmailClick} className="bg-highlight hover:bg-highlight/90 text-white">
                <Mail className="h-4 w-4 mr-1" />
                Send Email
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CandidateDetail;
