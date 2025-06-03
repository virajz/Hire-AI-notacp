import { useState, useEffect } from "react";
import MainLayout from "../components/layout/MainLayout";
import SearchBar from "../components/search/SearchBar";
import CandidateList from "../components/candidates/CandidateList";
import CandidateDetail from "../components/candidates/CandidateDetail";
import ResumeUploader from "../components/resume/ResumeUploader";
import ExportButton from "../components/export/ExportButton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Search, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [showCandidateDetail, setShowCandidateDetail] = useState(false);
  const [activeTab, setActiveTab] = useState("search");
  const [hasSearched, setHasSearched] = useState(false);

  // Authentication state
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    setAuthLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthLoading(false);
    });

    return () => {
      // Correct way to unsubscribe from Supabase v2 auth listener
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const handleLoginWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin, // Redirect back to the app after login
        },
      });
      if (error) {
        console.error("Error logging in with Google:", error.message);
        // Optionally, show a toast notification to the user
      }
    } catch (error) {
      console.error("Unexpected error during Google login:", error);
    }
  };

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

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
        <div className="p-8 bg-white shadow-lg rounded-lg text-center">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">Welcome to AI Recruit Copilot</h1>
          <p className="text-gray-600 mb-8">Please log in to continue.</p>
          <Button 
            onClick={handleLoginWithGoogle} 
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg text-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out"
          >
            <LogIn className="mr-2 h-5 w-5" /> Login with Google
          </Button>
        </div>
      </div>
    );
  }

  // User is authenticated, render the main application UI
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
