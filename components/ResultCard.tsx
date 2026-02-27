// ResultCard is a reusable UI component for displaying a single platform's
// pricing result. It accepts a PriceResult object (defined in lib/types)
// along with ranking information. You can use it like:
//
//   import ResultCard from '@/components/ResultCard';
//   const result: PriceResult = { ... };
//   <ResultCard result={result} isBest={true} rank={1} />
//
// Put it wherever you need a compact comparison card (search results, etc.).

import React from 'react';
import { PriceResult } from '@/lib/types';

interface ResultCardProps {
  result: PriceResult;
  isBest: boolean;
  rank: number;
}

const platformColors: Record<string, { bg: string; text: string }> = {
  amazon:    { bg: "hsl(35 95% 50% / 0.15)", text: "hsl(35 95% 60%)" },
  flipkart:  { bg: "hsl(220 85% 60% / 0.15)", text: "hsl(220 85% 65%)" },
  meesho:    { bg: "hsl(310 65% 60% / 0.15)", text: "hsl(310 65% 65%)" },
  myntra:    { bg: "hsl(350 80% 55% / 0.15)", text: "hsl(350 80% 65%)" },
  snapdeal:  { bg: "hsl(20 90% 55% / 0.15)", text: "hsl(20 90% 65%)" },
  croma:     { bg: "hsl(160 60% 45% / 0.15)", text: "hsl(160 60% 60%)" },
};

const getPlatformStyle = (platform: string) => {
  const key = platform.toLowerCase();
  return platformColors[key] || { bg: "hsl(var(--primary) / 0.12)", text: "hsl(var(--primary))" };
};

const scoreColor = (score: number) => {
  if (score >= 7) return "hsl(var(--score-high))";
  if (score >= 5) return "hsl(var(--score-mid))";
  return "hsl(var(--score-low))";
};

const StarRating = ({ rating }: { rating: number }) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="13" height="13" viewBox="0 0 12 12" fill="none">
          <path
            d="M6 1l1.35 3.65L11 5.5 8.5 7.85 9.21 11 6 9.27 2.79 11 3.5 7.85 1 5.5l3.65-.85L6 1z"
            fill={
              i < full
                ? "hsl(40 90% 55%)"
                : i === full && half
                ? "hsl(40 90% 55% / 0.5)"
                : "hsl(var(--border))"
            }
          />
        </svg>
      ))}
      <span className="ml-1 text-xs font-medium text-muted-foreground">
        {rating.toFixed(1)}
      </span>
    </div>
  );
};

const ResultCard = ({ result, isBest, rank }: ResultCardProps) => {
  const style = getPlatformStyle(result.platform);

  return (
    <div className={`glass-card rounded-2xl p-5 result-card flex flex-col gap-4 relative overflow-hidden transition-all duration-300 hover:scale-[1.02] ${isBest ? "best-pick-card" : ""}`}>

      {/* BEST PICK BADGE */}
      {isBest && (
        <div className="absolute top-0 right-0">
          <div className="text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl bg-green-500 text-white">
            ★ BEST PICK
          </div>
        </div>
      )}

      {/* PLATFORM HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold"
            style={{ background: style.bg, color: style.text }}
          >
            {result.platform.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold capitalize text-sm">
              {result.platform}
            </p>
            <p className="text-xs text-muted-foreground">
              Rank #{rank}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs text-muted-foreground">Score</p>
          <p
            className="text-lg font-bold"
            style={{ color: scoreColor(result.score) }}
          >
            {result.score.toFixed(1)}
          </p>
        </div>
      </div>

      {/* PRICE */}
      <div className="glass-card rounded-xl p-3 bg-[hsl(220_27%_8%_/0.6)]">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">
              Listed Price
            </p>
            <p className="text-2xl font-bold">
              ₹{result.price.toLocaleString("en-IN")}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-1">
              Effective
            </p>
            <p className="text-base font-semibold text-primary">
              ₹{result.effective_price.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </div>

      {/* DETAILS */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <Stat label="Rating" value={<StarRating rating={result.rating} />} compact />
        <Stat label="Delivery" value={`${result.delivery_days}d`} />
        <Stat
          label="Shipping"
          value={result.shipping_cost === 0 ? "Free" : `₹${result.shipping_cost}`}
          highlight={result.shipping_cost === 0}
        />
      </div>

      {/* BUY BUTTON */}
      <a
        href={result.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2"
      >
        <button
          className={`w-full py-2.5 rounded-xl font-semibold transition-all duration-300 ${
            isBest
              ? "bg-green-500 hover:bg-green-600 text-white shadow-lg"
              : "bg-primary hover:opacity-90 text-white"
          }`}
        >
          Buy Now →
        </button>
      </a>
    </div>
  );
};

const Stat = ({
  label,
  value,
  compact,
  highlight,
}: {
  label: string;
  value: React.ReactNode;
  compact?: boolean;
  highlight?: boolean;
}) => (
  <div className="rounded-lg p-2 bg-[hsl(220_27%_8%_/0.5)]">
    <p className="text-xs text-muted-foreground mb-1">{label}</p>
    {compact ? (
      <div className="flex justify-center">{value}</div>
    ) : (
      <p
        className={`text-sm font-semibold ${
          highlight ? "text-green-400" : "text-foreground"
        }`}
      >
        {value}
      </p>
    )}
  </div>
);

export default ResultCard;
