import { useState, useEffect } from 'react';
import CandidateCard, { CandidateProps } from './CandidateCard';
import CandidateCardSkeleton from './CandidateCardSkeleton';
import { mockCandidates } from '@/data/mockData';

interface CandidateListProps {
  searchQuery?: string;
  onViewCandidate: (id: string) => void;
}

const CandidateList = ({ searchQuery = '', onViewCandidate }: CandidateListProps) => {
  const [candidates, setCandidates] = useState<Omit<CandidateProps, 'onView' | 'onShortlist' | 'onStatusChange' | 'onEmail'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [animationPhase, setAnimationPhase] = useState<'stack' | 'shuffle' | 'none'>('none');

  useEffect(() => {
    setLoading(true);
    setAnimationPhase('none');
    
    // Simulate API call with the search query
    setTimeout(() => {
      // Filter candidates based on the search query
      let filteredCandidates = mockCandidates;
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        
        // Extract location and skills from the query
        const locationMatch = query.match(/(?:in|from|at)\s+([a-zA-Z\s]+)/i);
        const location = locationMatch ? locationMatch[1].trim() : '';
        
        // Extract skills (assuming they're mentioned before "in" or at the start)
        const skillsMatch = query.match(/^([^in]+)/i);
        const skills = skillsMatch ? skillsMatch[1].trim().split(/\s+/) : [];
        
        filteredCandidates = mockCandidates.filter((candidate) => {
          // Check location if specified
          const locationMatch = !location || 
            candidate.location.toLowerCase().includes(location.toLowerCase());
          
          // Check skills if specified
          const skillsMatch = skills.length === 0 || 
            skills.some(skill => 
              candidate.skills.some(candidateSkill => 
                candidateSkill.toLowerCase().includes(skill.toLowerCase())
              )
            );
          
          // Check title for engineer/developer roles if skills are specified
          const titleMatch = skills.length === 0 || 
            candidate.currentTitle.toLowerCase().includes('engineer') ||
            candidate.currentTitle.toLowerCase().includes('developer') ||
            candidate.currentTitle.toLowerCase().includes('architect');
          
          return locationMatch && skillsMatch && titleMatch;
        });
      }
      
      setCandidates(filteredCandidates);
      setLoading(false);
      
      // Trigger stack animation first
      setAnimationPhase('stack');
      
      // Then trigger shuffle animation after stack completes
      setTimeout(() => {
        setAnimationPhase('shuffle');
      }, 300);
    }, 600);
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
    console.log(`Open email composer for candidate ${id}`);
    onViewCandidate(id);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="animate-card-stack"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <CandidateCardSkeleton />
          </div>
        ))}
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
          className={`${
            animationPhase === 'stack'
              ? 'animate-card-stack'
              : animationPhase === 'shuffle'
              ? 'animate-card-shuffle'
              : ''
          }`}
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
