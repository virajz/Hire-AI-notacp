
import { useState, useEffect } from 'react';
import CandidateCard, { CandidateProps } from './CandidateCard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

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
        // Only fetch if there's a search query
        if (!searchQuery) {
          setCandidates([]);
          setLoading(false);
          return;
        }

        // Parse the natural language query to extract key elements
        const queryTerms = parseSearchQuery(searchQuery.toLowerCase());
        console.log("Parsed query terms:", queryTerms);
        
        // Start with a base query for all candidates
        let query = supabase
          .from('candidates')
          .select(`
            *,
            candidate_skills!inner(skill),
            candidate_status!inner(status)
          `);
        
        // Apply role filters (job titles)
        if (queryTerms.role.length > 0) {
          // Create a combined filter for roles using OR conditions
          const roleFilters = queryTerms.role.map(role => `current_title.ilike.%${role}%`);
          query = query.or(roleFilters.join(','));
        }
        
        // Apply skill filters
        if (queryTerms.skills.length > 0) {
          query = query.in(
            'candidate_skills.skill', 
            queryTerms.skills
          );
        }
        
        // Apply location filters
        if (queryTerms.location.length > 0) {
          // Create a combined filter for locations using OR conditions
          const locationFilters = queryTerms.location.map(loc => `location.ilike.%${loc}%`);
          query = query.or(locationFilters.join(','));
        }
        
        // Apply experience filters
        if (queryTerms.experience > 0) {
          query = query.gte('years_exp', queryTerms.experience);
        }
        
        // Apply status filters
        if (queryTerms.status.length > 0) {
          query = query.in(
            'candidate_status.status',
            queryTerms.status
          );
        }
        
        console.log("Executing Supabase query with filters:", queryTerms);
        
        // Execute the query
        const { data, error } = await query;
        
        if (error) {
          console.error("Error fetching candidates:", error);
          toast({
            title: "Search Error",
            description: "Failed to fetch candidates. Please try again.",
            variant: "destructive"
          });
          setCandidates([]);
        } else {
          console.log("Raw query results:", data);
          
          // Process and deduplicate candidates
          const uniqueCandidates = processAndDeduplicate(data);
          console.log("After deduplication:", uniqueCandidates);
          
          // Format the data to match the component props
          const formattedCandidates = uniqueCandidates.map(candidate => {
            return {
              id: candidate.id,
              name: candidate.name,
              currentTitle: candidate.current_title,
              location: candidate.location,
              skills: candidate.skills || [],
              status: candidate.status || 'new',
              workAuth: candidate.work_auth || 'Unknown', 
              yearsExp: candidate.years_exp || 0,
              shortlisted: false
            };
          });
          
          setCandidates(formattedCandidates);
        }
      } catch (error) {
        console.error("Error in search:", error);
        toast({
          title: "Search Error",
          description: "An unexpected error occurred while searching. Please try again.",
          variant: "destructive"
        });
        setCandidates([]);
      } finally {
        setLoading(false);
        setTimeout(() => {
          setAnimateCards(true);
        }, 100);
      }
    };

    fetchCandidates();
  }, [searchQuery]);

  const parseSearchQuery = (query: string) => {
    const result = {
      role: [] as string[],
      skills: [] as string[],
      location: [] as string[],
      status: [] as string[],
      experience: 0
    };
    
    // Common tech skills to match in queries
    const techSkills = [
      'javascript', 'typescript', 'react', 'angular', 'vue', 'node', 'python', 'django', 'flask',
      'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'ml', 'ai', 'machine learning',
      'data science', 'sql', 'nosql', 'mongodb', 'postgres', 'postgresql', 'mysql', 'graphql', 'rest',
      'go', 'golang', 'rust', 'c#', 'java', 'spring', 'ruby', 'rails', 'php', 'laravel'
    ];
    
    // Common roles
    const roles = [
      'engineer', 'developer', 'architect', 'lead', 'manager', 'designer', 'analyst',
      'scientist', 'frontend', 'backend', 'full stack', 'fullstack', 'devops', 'sre', 'product',
      'project manager', 'software', 'data', 'ui', 'ux', 'qa', 'tester', 'security'
    ];
    
    // Status keywords
    const statusMap: Record<string, string> = {
      'new': 'new',
      'contacted': 'contacted',
      'reached out': 'contacted',
      'interested': 'interested',
      'interviewing': 'interviewing',
      'in interview': 'interviewing',
      'interview': 'interviewing',
      'hired': 'hired',
      'rejected': 'rejected'
    };
    
    // Check for experience mentions (e.g., "5+ years", "at least 3 years")
    const expRegex = /(\d+)(?:\+)?\s*(?:years|yrs|year)/i;
    const expMatch = query.match(expRegex);
    if (expMatch && expMatch[1]) {
      result.experience = parseInt(expMatch[1], 10);
    }
    
    // First, check for exact skill matches
    for (const skill of techSkills) {
      if (query.includes(skill)) {
        result.skills.push(skill);
      } else if (query.includes(`${skill} experience`)) {
        result.skills.push(skill);
      }
    }
    
    // Look for roles
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
    const commonLocations = [
      'bangalore', 'seattle', 'austin', 'toronto', 'hyderabad', 'buenos aires',
      'san francisco', 'new york', 'london', 'berlin', 'tokyo', 'singapore',
      'remote', 'usa', 'canada', 'india', 'uk', 'australia'
    ];
    
    for (const word of words) {
      const cleanWord = word.replace(/[,.;]/g, '').toLowerCase();
      if (commonLocations.includes(cleanWord)) {
        result.location.push(cleanWord);
      }
    }
    
    // Also check for "in <location>" pattern
    const locationPatterns = [
      /\bin\s+([a-z\s]+)(?:,|\s|$)/i,
      /\bfrom\s+([a-z\s]+)(?:,|\s|$)/i,
      /\bat\s+([a-z\s]+)(?:,|\s|$)/i
    ];
    
    for (const pattern of locationPatterns) {
      const match = query.match(pattern);
      if (match && match[1]) {
        const location = match[1].trim().toLowerCase();
        if (!result.location.includes(location)) {
          result.location.push(location);
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
