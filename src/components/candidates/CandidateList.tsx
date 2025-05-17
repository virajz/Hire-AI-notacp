
import { useState, useEffect } from 'react';
import CandidateCard, { CandidateProps } from './CandidateCard';
import { supabase } from '@/integrations/supabase/client';

interface CandidateListProps {
  searchQuery?: string;
  onViewCandidate: (id: string) => void;
}

const CandidateList = ({ searchQuery = '', onViewCandidate }: CandidateListProps) => {
  const [candidates, setCandidates] = useState<Omit<CandidateProps, "onView" | "onShortlist" | "onStatusChange" | "onEmail">[]>([]);
  const [loading, setLoading] = useState(true);
  const [animateCards, setAnimateCards] = useState(false);

  useEffect(() => {
    const fetchCandidates = async () => {
      setLoading(true);
      setAnimateCards(false);
      
      try {
        // Parse the natural language query to extract key elements
        const queryTerms = parseSearchQuery(searchQuery.toLowerCase());
        
        // Start with a base query for all candidates
        let query = supabase
          .from('candidates')
          .select(`
            *,
            candidate_skills!inner(skill),
            candidate_status!inner(status)
          `);
        
        // Apply filters based on the parsed query
        if (queryTerms.role.length > 0) {
          query = query.or(
            queryTerms.role.map(role => 
              `current_title.ilike.%${role}%`
            ).join(',')
          );
        }
        
        if (queryTerms.skills.length > 0) {
          query = query.in(
            'candidate_skills.skill', 
            queryTerms.skills.map(skill => skill)
          );
        }
        
        if (queryTerms.location.length > 0) {
          query = query.or(
            queryTerms.location.map(loc => 
              `location.ilike.%${loc}%`
            ).join(',')
          );
        }
        
        if (queryTerms.status.length > 0) {
          query = query.in(
            'candidate_status.status',
            queryTerms.status
          );
        }
        
        // Execute the query
        const { data, error } = await query;
        
        if (error) {
          console.error("Error fetching candidates:", error);
          setCandidates([]);
        } else {
          // Process and deduplicate candidates
          const uniqueCandidates = processAndDeduplicate(data);
          
          // Format the data to match the component props
          const formattedCandidates = uniqueCandidates.map(candidate => {
            return {
              id: candidate.id,
              name: candidate.name,
              currentTitle: candidate.current_title,
              location: candidate.location,
              skills: candidate.skills || [],
              status: candidate.status || 'new',
              workAuth: candidate.work_auth || 'Unknown', // Add default value for workAuth
              yearsExp: candidate.years_exp || 0, // Add default value for yearsExp
              shortlisted: false // We'll set this later
            };
          });
          
          setCandidates(formattedCandidates);
        }
      } catch (error) {
        console.error("Error in search:", error);
        setCandidates([]);
      } finally {
        setLoading(false);
        setTimeout(() => {
          setAnimateCards(true);
        }, 100);
      }
    };

    // Only fetch if there's a search query
    if (searchQuery) {
      fetchCandidates();
    } else {
      setLoading(false);
    }
  }, [searchQuery]);

  const parseSearchQuery = (query: string) => {
    const result = {
      role: [] as string[],
      skills: [] as string[],
      location: [] as string[],
      status: [] as string[]
    };
    
    // Common tech skills to match in queries
    const techSkills = [
      'javascript', 'typescript', 'react', 'angular', 'vue', 'node', 'python', 'django', 'flask',
      'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'ml', 'ai', 'machine learning',
      'data science', 'sql', 'nosql', 'mongodb', 'postgres', 'mysql', 'graphql', 'rest'
    ];
    
    // Common roles
    const roles = [
      'engineer', 'developer', 'architect', 'lead', 'manager', 'designer', 'analyst',
      'scientist', 'frontend', 'backend', 'full stack', 'devops', 'sre', 'product'
    ];
    
    // Status keywords
    const statusMap: Record<string, string> = {
      'new': 'new',
      'contacted': 'contacted',
      'reached out': 'contacted',
      'interested': 'interested',
      'interviewing': 'interviewing',
      'in interview': 'interviewing',
      'interview': 'interviewing'
    };
    
    // First, check for exact matches
    for (const skill of techSkills) {
      if (query.includes(skill)) {
        result.skills.push(skill);
      }
    }
    
    for (const role of roles) {
      if (query.includes(role)) {
        result.role.push(role);
      }
    }
    
    // Look for status mentions
    for (const [keyword, status] of Object.entries(statusMap)) {
      if (query.includes(keyword)) {
        if (!result.status.includes(status)) {
          result.status.push(status);
        }
      }
    }
    
    // Look for location mentions
    const words = query.split(' ');
    const commonLocations = ['bangalore', 'seattle', 'austin', 'toronto', 'hyderabad', 'buenos aires'];
    
    for (const word of words) {
      if (commonLocations.includes(word.toLowerCase())) {
        result.location.push(word);
      }
      
      // Also check for "in <location>" pattern
      const locationIndex = query.indexOf(' in ');
      if (locationIndex !== -1) {
        const possibleLocation = query.substring(locationIndex + 4).trim().split(' ')[0];
        if (possibleLocation && possibleLocation.length > 2 && !result.location.includes(possibleLocation)) {
          result.location.push(possibleLocation);
        }
      }
    }
    
    return result;
  };

  const processAndDeduplicate = (data: any[]) => {
    // Create a Map to store unique candidates with their skills
    const candidateMap = new Map();
    
    for (const item of data) {
      const candidateId = item.id;
      
      if (!candidateMap.has(candidateId)) {
        // Initialize the candidate with their data
        candidateMap.set(candidateId, {
          ...item,
          skills: [],
          status: item.candidate_status?.[0]?.status || 'new'
        });
      }
      
      // Add the skill if it's not already in the list
      const candidate = candidateMap.get(candidateId);
      const skill = item.candidate_skills?.skill;
      
      if (skill && !candidate.skills.includes(skill)) {
        candidate.skills.push(skill);
      }
    }
    
    // Convert the Map back to an array
    return Array.from(candidateMap.values());
  };

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
