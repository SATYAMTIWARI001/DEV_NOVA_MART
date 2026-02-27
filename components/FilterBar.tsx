'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Platform, SortOption } from '@/lib/types';
import { ArrowDownAZ, ArrowUpAZ, Star, Percent, Filter, X, Sparkles, Truck } from 'lucide-react';

interface FilterBarProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  selectedPlatforms: Platform[];
  onPlatformToggle: (platform: Platform) => void;
  totalResults: number;
  className?: string;
}

const sortOptions: { value: SortOption; label: string; icon: React.ReactNode }[] = [
  { value: 'price-low', label: 'Price ↓', icon: <ArrowDownAZ className="h-4 w-4" /> },
  { value: 'price-high', label: 'Price ↑', icon: <ArrowUpAZ className="h-4 w-4" /> },
  { value: 'rating', label: 'Rating', icon: <Star className="h-4 w-4" /> },
  { value: 'value-score', label: 'Value', icon: <Sparkles className="h-4 w-4" /> },
  { value: 'discount', label: 'Discount', icon: <Percent className="h-4 w-4" /> },
  { value: 'delivery', label: 'Delivery', icon: <Truck className="h-4 w-4" /> },
];

const platforms: { value: Platform; label: string; variant: 'amazon' | 'flipkart' | 'meesho' }[] = [
  { value: 'Amazon', label: 'Amazon', variant: 'amazon' },
  { value: 'Flipkart', label: 'Flipkart', variant: 'flipkart' },
  { value: 'Meesho', label: 'Meesho', variant: 'meesho' },
];

export function FilterBar({
  sortBy,
  onSortChange,
  selectedPlatforms,
  onPlatformToggle,
  totalResults,
  className,
}: FilterBarProps) {
  const clearFilters = () => {
    platforms.forEach(p => {
      if (selectedPlatforms.includes(p.value)) {
        onPlatformToggle(p.value);
      }
    });
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Results count and clear */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Found <span className="font-semibold text-foreground">{totalResults}</span> results
        </p>
        {selectedPlatforms.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Clear filters
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        {/* Sort Options */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Sort:</span>
          <div className="flex flex-wrap gap-1">
            {sortOptions.map((option) => (
              <Button
                key={option.value}
                variant={sortBy === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => onSortChange(option.value)}
                className="text-xs h-8"
              >
                {option.icon}
                <span className="ml-1">{option.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Platform Filters */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Platforms:</span>
          <div className="flex gap-1">
            {platforms.map((platform) => {
              const isSelected = selectedPlatforms.includes(platform.value);
              return (
                <Badge
                  key={platform.value}
                  variant={isSelected ? platform.variant : 'outline'}
                  className={cn(
                    'cursor-pointer transition-all duration-200 hover:scale-105',
                    !isSelected && 'hover:bg-muted'
                  )}
                  onClick={() => onPlatformToggle(platform.value)}
                >
                  {platform.label}
                </Badge>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
