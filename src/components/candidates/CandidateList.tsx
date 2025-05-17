
import { useState, useEffect } from 'react';
import CandidateCard, { CandidateProps } from './CandidateCard';
import { mockCandidates } from '@/data/mockData';

interface CandidateListProps {
  searchQuery?: string;
  onViewCandidate: (id: string) => void;
}

const CandidateList = ({ searchQuery = '', onViewCandidate }: CandidateListProps) => {
  const [candidates, setCandidates] = useState<Omit<CandidateProps, 'onView' | 'onShortlist' | 'onStatusChange' | 'onEmail'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [animateCards, setAnimateCards] = useState(false);

  useEffect(() => {
    // Simulate API call with the search query
    setLoading(true);
    
    setTimeout(() => {
      // Filter candidates based on the search query (in a real app, this would be done on the server)
      let filteredCandidates = mockCandidates;
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredCandidates = mockCandidates.filter(
          (candidate) =>
            candidate.name.toLowerCase().includes(query) ||
            candidate.currentTitle.toLowerCase().includes(query) ||
            candidate.location.toLowerCase().includes(query) ||
            candidate.skills.some((skill) => skill.toLowerCase().includes(query))
        );
      }
      
      setCandidates(filteredCandidates);
      setLoading(false);
      
      // Trigger animation after a short delay
      setTimeout(() => {
        setAnimateCards(true);
      }, 100);
    }, 600); // Simulated API delay
  }, [searchQuery]);

  const handleShortlist = (id: string) => {
    setCandidates((prev) =>
      prev.map((candidate) =>
        candidate.id === id ? { ...candidate, shortlisted: !candidate.shortlisted } : candidate
      )
    );
  };

  const handleStatusChange = (id: string, status: string) => {
    setCandidates((prev) =>
      prev.map((candidate) =>
        candidate.id === id
          ? { ...candidate, status: status as CandidateProps['status'] }
          : candidate
      )
    );
  };

  const handleEmail = (id: string) => {
    // Open email composer in drawer or modal
    console.log(`Open email composer for candidate ${id}`);
    onViewCandidate(id);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-pulse space-y-2 text-center">
          <div className="h-6 w-32 bg-gray-200 rounded mx-auto"></div>
          <p className="text-muted-foreground">Searching for candidates...</p>
        </div>
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">No candidates found</h3>
        <p className="text-muted-foreground mt-1">Try adjusting your search query</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {candidates.map((candidate, index) => (
        <div
          key={candidate.id}
          className={`${animateCards ? 'animate-card-shuffle' : 'opacity-0'}`}
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          <CandidateCard
            {...candidate}
            onView={onViewCandidate}
            onShortlist={handleShortlist}
            onStatusChange={handleStatusChange}
            onEmail={handleEmail}
          />
        </div>
      ))}
    </div>
  );
};

export default CandidateList;
