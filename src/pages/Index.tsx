
import { useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import SearchBar from "../components/search/SearchBar";
import CandidateList from "../components/candidates/CandidateList";
import CandidateDetail from "../components/candidates/CandidateDetail";
import ResumeUploader from "../components/resume/ResumeUploader";
import ExportButton from "../components/export/ExportButton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, ListFilter } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [showCandidateDetail, setShowCandidateDetail] = useState(false);
  const [activeTab, setActiveTab] = useState("search");
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      toast({
        title: "Empty Search",
        description: "Please enter a search term to find candidates",
        variant: "default"
      });
      return;
    }
    
    setSearchQuery(query);
    setHasSearched(true);
    setActiveTab("search");
    
    toast({
      title: "Searching",
      description: `Looking for candidates matching "${query}"`,
      variant: "default"
    });
  };

  const handleViewCandidate = (id: string) => {
    setSelectedCandidateId(id);
    setShowCandidateDetail(true);
  };

  const handleUploadComplete = () => {
    // In a real app, this would refresh the candidate list
    setActiveTab("search");
    toast({
      title: "Upload Complete",
      description: "Resume was successfully processed",
      variant: "default"
    });
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">HireAI</h1>
          <p className="text-muted-foreground">
            AI-powered candidate search and outreach
          </p>
        </div>

        <div className="mb-8">
          <SearchBar onSearch={handleSearch} initialQuery={searchQuery} />
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="mt-6"
        >
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="search">
                <ListFilter className="h-4 w-4 mr-1" />
                Search Results
              </TabsTrigger>
              <TabsTrigger value="upload">
                <Upload className="h-4 w-4 mr-1" />
                Upload
              </TabsTrigger>
            </TabsList>

            {activeTab === "search" && hasSearched && <ExportButton />}
          </div>

          <TabsContent value="search" className="mt-2">
            {hasSearched ? (
              <CandidateList
                searchQuery={searchQuery}
                onViewCandidate={handleViewCandidate}
              />
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium mb-2">
                  Start searching for candidates
                </h3>
                <p className="text-muted-foreground mb-6">
                  Use the search bar above to find candidates by skills, location, or job titles
                </p>
                <div className="flex justify-center gap-4 flex-wrap">
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("upload")}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Resumes
                  </Button>
                  <Button
                    onClick={() => handleSearch("software engineer with aws")}
                  >
                    Try an Example Search
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="upload" className="mt-2">
            <div className="max-w-xl mx-auto">
              <ResumeUploader onUploadComplete={handleUploadComplete} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <CandidateDetail
        candidateId={selectedCandidateId}
        open={showCandidateDetail}
        onClose={() => setShowCandidateDetail(false)}
      />
    </MainLayout>
  );
};

export default Index;
