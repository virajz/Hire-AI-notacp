
import { useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import CandidateDetail from "../components/candidates/CandidateDetail";
import ExportButton from "../components/export/ExportButton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Mail, User } from "lucide-react";
import { mockCandidates } from "@/data/mockData";

const Shortlist = () => {
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [showCandidateDetail, setShowCandidateDetail] = useState(false);

  // Filter only shortlisted candidates
  const shortlistedCandidates = mockCandidates.filter(candidate => candidate.shortlisted);

  const handleViewCandidate = (id: string) => {
    setSelectedCandidateId(id);
    setShowCandidateDetail(true);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <Star className="h-5 w-5 mr-2 text-yellow-500" fill="currentColor" />
              Shortlisted Candidates
            </h1>
            <p className="text-muted-foreground">
              Candidates you've marked as favorites
            </p>
          </div>
          <ExportButton />
        </div>

        {shortlistedCandidates.length === 0 ? (
          <div className="bg-muted/30 rounded-lg p-8 text-center">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <h3 className="text-lg font-medium mb-1">No shortlisted candidates</h3>
            <p className="text-muted-foreground mb-4">
              When you shortlist candidates, they will appear here for easy access
            </p>
            <Button asChild>
              <a href="/">Search for Candidates</a>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shortlistedCandidates.map((candidate) => (
              <Card key={candidate.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{candidate.name}</h3>
                    <p className="text-sm text-muted-foreground">{candidate.currentTitle}</p>
                  </div>
                  <Star className="h-5 w-5 text-yellow-500" fill="currentColor" />
                </div>
                
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {candidate.location}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {candidate.yearsExp}+ years
                  </Badge>
                </div>
                
                <div className="mt-3">
                  <div className="flex flex-wrap gap-1">
                    {candidate.skills.slice(0, 3).map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="mt-4 flex justify-between">
                  <Button size="sm" variant="ghost" onClick={() => handleViewCandidate(candidate.id)}>
                    View Profile
                  </Button>
                  <Button size="sm" variant="outline">
                    <Mail className="h-4 w-4 mr-1" />
                    Contact
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <CandidateDetail
        candidateId={selectedCandidateId}
        open={showCandidateDetail}
        onClose={() => setShowCandidateDetail(false)}
      />
    </MainLayout>
  );
};

export default Shortlist;
