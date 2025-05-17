
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
}

const SearchBar = ({ onSearch, initialQuery = '' }: SearchBarProps) => {
  const [query, setQuery] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const exampleQueries = [
    'aws engineer in bangalore',
    'frontend developers with react experience',
    'data scientists with machine learning',
    'product managers in Toronto'
  ];

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
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
    </div>
  );
};

export default SearchBar;
