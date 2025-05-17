
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
}

const SearchBar = ({ onSearch, initialQuery = '' }: SearchBarProps) => {
  const [query, setQuery] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const exampleQueries = [
    'aws engineer in bangalore',
    'frontend developers with react experience',
    'data scientists with machine learning',
    'product managers in Toronto',
    'experienced engineers with 5+ years',
    'candidates interested in remote work',
    'software engineers with typescript skills',
    'designers with figma experience'
  ];
  
  const skillCategories = [
    { name: 'Frontend', skills: ['React', 'Angular', 'Vue', 'JavaScript', 'TypeScript'] },
    { name: 'Backend', skills: ['Node.js', 'Python', 'Java', 'Go', 'Ruby'] },
    { name: 'Data', skills: ['SQL', 'NoSQL', 'MongoDB', 'PostgreSQL', 'Data Science', 'ML'] },
    { name: 'DevOps', skills: ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes'] }
  ];

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            setOpen(true);
          }}
          onBlur={() => setIsFocused(false)}
          placeholder="Search using natural language (e.g., 'aws engineer in bangalore')..."
          className="w-full px-4 py-6 pr-12 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-highlight text-lg"
        />
        <Button 
          type="submit" 
          className="absolute right-0 top-0 h-full bg-highlight hover:bg-highlight/90 text-white rounded-r-lg px-4"
        >
          <Search className="h-5 w-5" />
          <span className="ml-2 hidden sm:inline">Search</span>
        </Button>
      </form>
      
      {isFocused && (
        <div className="mt-2 text-sm text-muted-foreground">
          <p className="mb-1">Try searching for:</p>
          <div className="flex flex-wrap gap-2">
            {exampleQueries.map((example, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  setQuery(example);
                  onSearch(example);
                }}
              >
                {example}
              </Button>
            ))}
          </div>
        </div>
      )}

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Type a command or search..." 
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Example Searches">
            {exampleQueries.map((example) => (
              <CommandItem
                key={example}
                onSelect={() => {
                  setQuery(example);
                  onSearch(example);
                  setOpen(false);
                }}
              >
                {example}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Search by Skills">
            {skillCategories.map((category) => (
              <CommandGroup key={category.name} heading={category.name}>
                {category.skills.map((skill) => (
                  <CommandItem
                    key={skill}
                    onSelect={() => {
                      const newQuery = `candidates with ${skill.toLowerCase()} skills`;
                      setQuery(newQuery);
                      onSearch(newQuery);
                      setOpen(false);
                    }}
                  >
                    {skill}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
};

export default SearchBar;
