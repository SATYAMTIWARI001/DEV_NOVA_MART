'use client';

import { useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  onSearch: (query: string) => void;
  suggestions?: string[];
  isLoading?: boolean;
  className?: string;
}

export function SearchBar({ 
  onSearch, 
  suggestions = [], 
  isLoading = false,
  className 
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setShowSuggestions(false);
    }
  }, [query, onSearch]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setQuery(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
  }, [onSearch]);

  const clearQuery = useCallback(() => {
    setQuery('');
  }, []);

  return (
    <div className={cn("relative w-full max-w-2xl", className)}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-4 h-5 w-5 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search for products across Amazon, Flipkart & Meesho..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(e.target.value.length > 0);
            }}
            onFocus={() => setShowSuggestions(query.length > 0)}
            className="h-14 pl-12 pr-24 text-base rounded-2xl border-2 border-muted focus:border-primary shadow-lg"
          />
          {query && (
            <button
              type="button"
              onClick={clearQuery}
              className="absolute right-24 p-1.5 rounded-full hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
          <Button 
            type="submit" 
            disabled={isLoading || !query.trim()}
            className="absolute right-2 h-10 px-6 rounded-xl"
          >
            {isLoading ? (
              <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              'Search'
            )}
          </Button>
        </div>
      </form>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
          <div className="p-2">
            <p className="text-xs text-muted-foreground px-3 py-1">Popular searches</p>
            {suggestions
              .filter(s => s.toLowerCase().includes(query.toLowerCase()))
              .slice(0, 5)
              .map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors flex items-center gap-2"
                >
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <span>{suggestion}</span>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
