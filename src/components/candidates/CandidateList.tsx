import React, { useState, useEffect } from 'react';
import CandidateCard, { CandidateProps } from './CandidateCard';
import CandidateCardSkeleton from './CandidateCardSkeleton';
import { supabase } from '@/integrations/supabase/client';

interface CandidateListProps {
  searchQuery?: string;
  onViewCandidate: (id: string) => void;
}

const CandidateList: React.FC<CandidateListProps> = ({ searchQuery = '', onViewCandidate }) => {
  const [candidates, setCandidates] = useState<Omit<CandidateProps, 'onView' | 'onShortlist' | 'onStatusChange' | 'onEmail'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCandidates = async () => {
      setLoading(true);
      setError(null);

      try {
        let queryBuilder = supabase.from('candidates').select('*');

        if (searchQuery) {
          queryBuilder = queryBuilder.ilike('name', `%${searchQuery}%`);
        }

        const { data: supabaseData, error: supabaseError } = await queryBuilder;

        if (supabaseError) {
          throw supabaseError;
        }

        const formattedCandidates = supabaseData ? supabaseData.map(candidate => ({
          id: candidate.id,
          name: candidate.name,
          currentTitle: candidate.current_title,
          location: candidate.location,
          workAuth: candidate.work_auth,
          yearsExp: candidate.years_exp,
          skills: [], // Default to empty array as 'skills' does not exist on fetched type
          shortlisted: false, // Default to false as 'shortlisted' does not exist on fetched type
          status: 'new' as CandidateProps['status'], // Default to 'new' and cast to specific type
        })) : [];

        setCandidates(formattedCandidates);
      } catch (err: any) {
        console.error("Error fetching candidates:", err);
        setError(err.message || 'Failed to fetch candidates');
        setCandidates([]); // Clear candidates on error
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
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
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CandidateCardSkeleton />
          </div>
        ))}
      </div>
    );
  }

  if (error) { // Display error message if an error occurred
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-red-600">Error loading candidates</h3>
        <p className="text-muted-foreground mt-1">{error}</p>
        <p className="text-muted-foreground mt-1">Please check the console for more details and ensure your Supabase connection is configured correctly.</p>
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
    <>
      {/* <style jsx global>{`
        @keyframes stackAndFan {
          0% {
            transform: scale(0.95) translateY(40px) rotate(-3deg);
            opacity: 0;
          }
          100% {
            transform: scale(1) translateY(0) rotate(0);
            opacity: 1;
          }
        }
        .animate-card-stack {
          animation: stackAndFan 0.5s ease-out forwards;
        }
      `}</style> */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {candidates.map((candidate, index) => (
          <div
            key={candidate.id}
            className="animate-card-stack"
            style={{ animationDelay: `${index * 100}ms` }}
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
    </>
  );
};

export default CandidateList;
