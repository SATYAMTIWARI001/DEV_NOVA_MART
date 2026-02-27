import React from 'react';
import ResultCard from '@/components/ResultCard';
import { PriceResult } from '@/lib/types';

/**
 * A tiny demo component that renders a single ResultCard with hard‑coded data.
 * Useful for quick testing or drop‑in previews.  You can remove this once you
 * replace it with real data fetched from your API.
 */
export default function ExampleResult() {
  const example: PriceResult = {
    platform: 'Amazon',
    score: 6.8,
    price: 14999,
    effective_price: 14999,
    rating: 4.3,
    delivery_days: 3,
    shipping_cost: 0,
    url: 'https://www.amazon.in/dp/EXAMPLE',
  };

  return <ResultCard result={example} isBest={true} rank={1} />;
}
