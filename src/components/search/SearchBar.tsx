
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

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

  return (
    <div className={`search-bar-container w-full max-w-3xl mx-auto ${isFocused ? 'focused' : ''}`}>
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search candidates (e.g., 'aws engineer in bangalore')..."
          className="w-full px-4 py-3 pr-12 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-highlight text-lg"
        />
        <Button 
          type="submit" 
          className="absolute right-0 top-0 h-full bg-highlight hover:bg-highlight/90 text-white rounded-r-lg px-4"
        >
          <Search className="h-5 w-5" />
          <span className="ml-2 hidden sm:inline">Search</span>
        </Button>
      </form>
    </div>
  );
};

export default SearchBar;
