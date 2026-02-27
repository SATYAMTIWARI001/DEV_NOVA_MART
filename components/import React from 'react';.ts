import React from 'react';
import ResultCard from '@/components/ResultCard';
import { PriceResult } from '@/lib/types';

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

export default function HomePage() {
  return (
    <div>
      {/* …other markup… */}
      <ResultCard result={example} isBest={true} rank={1} />
    </div>
  );
}