import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Candidates from "./pages/Candidates";
import Shortlist from "./pages/Shortlist";
import NotFound from "./pages/NotFound";
import { EmailTest } from "./components/EmailTest";
import { useState } from 'react';
import CandidateList from '@/components/candidates/CandidateList';
import CandidateDetailModal from '@/components/candidates/CandidateDetailModal';
import { CandidateProps } from '@/components/candidates/CandidateCard';
import { mockCandidates } from '@/data/mockData';

const queryClient = new QueryClient();

const App = () => {
  const [selectedCandidate, setSelectedCandidate] = useState<Omit<CandidateProps, 'onView' | 'onShortlist' | 'onStatusChange' | 'onEmail'> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewCandidate = (id: string) => {
    // In a real app, this would fetch the candidate details from the API
    const candidate = mockCandidates.find(c => c.id === id);
    if (candidate) {
      setSelectedCandidate(candidate);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCandidate(null);
  };

  const handleShortlist = (id: string) => {
    // In a real app, this would update the backend
    console.log('Shortlist candidate:', id);
  };

  const handleStatusChange = (id: string, status: string) => {
    // In a real app, this would update the backend
    console.log('Update status:', id, status);
  };

  const handleEmail = (id: string) => {
    // In a real app, this would open the email composer
    console.log('Send email to:', id);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/candidates" element={<Candidates />} />
            <Route path="/shortlist" element={<Shortlist />} />
            <Route path="/test-email" element={<EmailTest />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      <CandidateDetailModal
        candidate={selectedCandidate}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onShortlist={handleShortlist}
        onStatusChange={handleStatusChange}
        onEmail={handleEmail}
      />
    </QueryClientProvider>
  );
};

export default App;
