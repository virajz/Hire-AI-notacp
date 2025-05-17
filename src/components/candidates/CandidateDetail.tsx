
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Mail, Download, Calendar, MapPin, Briefcase } from "lucide-react";
import { mockCandidates } from "@/data/mockData";
import { useState } from "react";
import EmailComposer from "../email/EmailComposer";

interface CandidateDetailProps {
  candidateId: string | null;
  open: boolean;
  onClose: () => void;
}

const CandidateDetail = ({ candidateId, open, onClose }: CandidateDetailProps) => {
  const [showingEmail, setShowingEmail] = useState(false);
  
  // Find the candidate in our mock data
  const candidate = mockCandidates.find((c) => c.id === candidateId);
  
  if (!candidate) {
    return null;
  }
  
  const handleEmail = () => {
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
                  {candidate.skills.map((skill) => (
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
                    <p>{candidate.aiSummary}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">Key Achievements</h4>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {candidate.achievements?.map((achievement, i) => (
                        <li key={i}>{achievement}</li>
                      ))}
                    </ul>
                  </div>
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
              <Button onClick={handleEmail} className="bg-highlight hover:bg-highlight/90 text-white">
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
