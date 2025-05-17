import { useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import SearchBar from "../components/search/SearchBar";
import CandidateList from "../components/candidates/CandidateList";
import CandidateDetail from "../components/candidates/CandidateDetail";
import ResumeUploader from "../components/resume/ResumeUploader";
import ExportButton from "../components/export/ExportButton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Search } from "lucide-react";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [showCandidateDetail, setShowCandidateDetail] = useState(false);
  const [activeTab, setActiveTab] = useState("search");
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setHasSearched(true);
    setActiveTab("search");
  };

  const handleViewCandidate = (id: string) => {
    setSelectedCandidateId(id);
    setShowCandidateDetail(true);
  };

  const handleStatusChange = (id: string, status: string) => {
    // In a real app, this would update the backend
    console.log('Update status:', id, status);
  };

  const handleUploadComplete = () => {
    // In a real app, this would refresh the candidate list
    setActiveTab("search");
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">AI Recruit Copilot</h1>
          <ExportButton />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="search">
              <Search className="h-4 w-4 mr-2" />
              Search
            </TabsTrigger>
            <TabsTrigger value="upload">
              <Upload className="h-4 w-4 mr-2" />
              Upload Resume
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search">
            <div className="space-y-4">
              <SearchBar onSearch={handleSearch} />
              {hasSearched && (
                <CandidateList
                  searchQuery={searchQuery}
                  onViewCandidate={handleViewCandidate}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="upload">
            <ResumeUploader onUploadComplete={handleUploadComplete} />
          </TabsContent>
        </Tabs>
      </div>

      <CandidateDetail
        candidateId={selectedCandidateId}
        open={showCandidateDetail}
        onClose={() => setShowCandidateDetail(false)}
        onStatusChange={handleStatusChange}
      />
    </MainLayout>
  );
};

export default Index;
