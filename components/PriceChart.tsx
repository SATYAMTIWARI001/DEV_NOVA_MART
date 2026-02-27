'use client';

import { useMemo } from 'react';
import { PriceHistory, Platform } from '@/lib/types';
import { formatPrice } from '@/lib/scoreEngines';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface PriceChartProps {
  priceHistory: {
    amazon?: PriceHistory;
    flipkart?: PriceHistory;
    meesho?: PriceHistory;
  };
  height?: number;
}

const platformColors = {
  amazon: '#FF9900',
  flipkart: '#2874F0',
  meesho: '#F43397',
};

export function PriceChart({ priceHistory, height = 200 }: PriceChartProps) {
  const chartData = useMemo(() => {
    // Combine all price histories
    const allDates = new Set<string>();
    const platforms: (keyof typeof priceHistory)[] = ['amazon', 'flipkart', 'meesho'];
    
    platforms.forEach(platform => {
      priceHistory[platform]?.history.forEach(point => {
        allDates.add(point.date);
      });
    });
    
    const sortedDates = Array.from(allDates).sort();
    
    // Find min and max prices for scaling
    let minPrice = Infinity;
    let maxPrice = 0;
    
    platforms.forEach(platform => {
      const ph = priceHistory[platform];
      if (ph) {
        minPrice = Math.min(minPrice, ph.lowestPrice);
        maxPrice = Math.max(maxPrice, ph.highestPrice);
      }
    });
    
    // Add padding to the range
    const padding = (maxPrice - minPrice) * 0.1;
    minPrice = Math.max(0, minPrice - padding);
    maxPrice = maxPrice + padding;
    
    return {
      dates: sortedDates,
      minPrice,
      maxPrice,
      platforms: platforms.filter(p => priceHistory[p]),
    };
  }, [priceHistory]);

  const getY = (price: number): number => {
    const range = chartData.maxPrice - chartData.minPrice;
    return height - ((price - chartData.minPrice) / range) * height;
  };

  const getPath = (platform: keyof typeof priceHistory): string => {
    const history = priceHistory[platform]?.history;
    if (!history || history.length === 0) return '';
    
    const points = history.map((point, i) => {
      const x = (i / (history.length - 1)) * 100;
      const y = getY(point.price);
      return `${i === 0 ? 'M' : 'L'} ${x}% ${y}`;
    });
    
    return points.join(' ');
  };

  if (chartData.platforms.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
        No price history available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Chart */}
      <div className="relative" style={{ height }}>
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} className="border-t border-border/50" />
          ))}
        </div>
        
        {/* Price labels */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-muted-foreground -ml-2 transform -translate-x-full">
          <span>{formatPrice(chartData.maxPrice)}</span>
          <span>{formatPrice((chartData.maxPrice + chartData.minPrice) / 2)}</span>
          <span>{formatPrice(chartData.minPrice)}</span>
        </div>
        
        {/* SVG Chart */}
        <svg 
          viewBox={`0 0 100 ${height}`} 
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          {chartData.platforms.map(platform => (
            <path
              key={platform}
              d={getPath(platform)}
              fill="none"
              stroke={platformColors[platform]}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
      </div>

      {/* Legend and Stats */}
      <div className="flex flex-wrap gap-4">
        {chartData.platforms.map(platform => {
          const ph = priceHistory[platform]!;
          return (
            <div key={platform} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: platformColors[platform] }}
              />
              <span className="text-sm font-medium capitalize">{platform}</span>
              <div className="flex items-center gap-1 text-xs">
                {ph.currentTrend === 'down' && (
                  <TrendingDown className="h-3 w-3 text-success" />
                )}
                {ph.currentTrend === 'up' && (
                  <TrendingUp className="h-3 w-3 text-destructive" />
                )}
                {ph.currentTrend === 'stable' && (
                  <Minus className="h-3 w-3 text-muted-foreground" />
                )}
                <span className="text-muted-foreground">
                  Low: {formatPrice(ph.lowestPrice)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Date range */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>3 months ago</span>
        <span>Today</span>
      </div>
    </div>
  );
}
