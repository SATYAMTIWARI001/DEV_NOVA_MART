// Score calculation engines for value, trust, and scam detection

import { NormalizedProduct, ValueTag, TrustTag, DealTag, SellerInfo } from './types';

/**
 * Calculate Value Score
 * Formula: (Rating × log(ReviewCount + 1)) / (Price / 10000)
 * Higher score = better value
 */
export function calculateValueScore(
  rating: number,
  reviewCount: number,
  price: number
): number {
  if (price === 0) return 0;
  const score = (rating * Math.log10(reviewCount + 1)) / (price / 10000);
  return Math.round(score * 100) / 100;
}

/**
 * Get Value Tag based on score percentile
 */
export function getValueTag(valueScore: number, allScores: number[]): ValueTag {
  const sortedScores = [...allScores].sort((a, b) => b - a);
  const rank = sortedScores.indexOf(valueScore);
  const percentile = (rank / sortedScores.length) * 100;
  
  if (percentile <= 25) return 'Best Value';
  if (percentile <= 50) return 'Good Value';
  if (percentile <= 75) return 'Fair Deal';
  return 'Overpriced';
}

/**
 * Calculate Trust Score
 * Based on seller rating, review count, response rate, and delivery score
 */
export function calculateTrustScore(seller: SellerInfo): number {
  const ratingScore = (seller.rating / 5) * 30; // Max 30 points
  const reviewScore = Math.min(30, Math.log10(seller.reviewCount + 1) * 10); // Max 30 points
  const responseScore = (seller.responseRate / 100) * 20; // Max 20 points
  const deliveryScore = (seller.deliveryScore / 100) * 20; // Max 20 points
  
  return Math.round(ratingScore + reviewScore + responseScore + deliveryScore);
}

/**
 * Get Trust Tag based on trust score
 */
export function getTrustTag(trustScore: number): TrustTag {
  if (trustScore >= 80) return 'Trusted Seller';
  if (trustScore >= 60) return 'Verified';
  if (trustScore >= 40) return 'Medium Risk';
  return 'High Risk';
}

/**
 * Detect if a listing is suspicious (potential scam)
 */
export function detectSuspiciousListing(product: {
  rating: number;
  reviewCount: number;
  discountPercentage: number;
  price: number;
  originalPrice?: number;
}): { isSuspicious: boolean; reasons: string[] } {
  const reasons: string[] = [];
  
  // Check for extremely high discount
  if (product.discountPercentage > 70) {
    reasons.push('Unusually high discount (>70%)');
  }
  
  // Check for low rating with high discount
  if (product.rating < 3 && product.discountPercentage > 50) {
    reasons.push('Low rating with high discount');
  }
  
  // Check for very few reviews
  if (product.reviewCount < 10) {
    reasons.push('Very few reviews');
  }
  
  // Check for unrealistic price difference
  if (product.originalPrice && product.price < product.originalPrice * 0.2) {
    reasons.push('Price too good to be true');
  }
  
  return {
    isSuspicious: reasons.length >= 2,
    reasons,
  };
}

/**
 * Calculate final effective price including delivery
 */
export function calculateFinalPrice(
  price: number,
  deliveryCharge: number = 0
): number {
  return price + deliveryCharge;
}

/**
 * Get deal tags for a product
 */
export function getDealTags(
  product: NormalizedProduct,
  allProducts: NormalizedProduct[]
): DealTag[] {
  const tags: DealTag[] = [];
  
  // Check if cheapest
  const cheapest = allProducts.reduce((min, p) => p.price < min.price ? p : min, allProducts[0]);
  if (product.id === cheapest.id) {
    tags.push('Best Deal');
  }
  
  // Check if fastest delivery
  const fastest = allProducts.reduce((min, p) => p.deliveryDays < min.deliveryDays ? p : min, allProducts[0]);
  if (product.id === fastest.id && product.deliveryDays <= 2) {
    tags.push('Fastest Delivery');
  }
  
  // Check if top rated
  const topRated = allProducts.reduce((max, p) => p.rating > max.rating ? p : max, allProducts[0]);
  if (product.id === topRated.id && product.rating >= 4.5) {
    tags.push('Top Rated');
  }
  
  // Check for price drop
  if (product.priceHistory?.priceDropAmount && product.priceHistory.priceDropAmount > 0) {
    tags.push('Price Drop');
  }
  
  return tags;
}

/**
 * Get delivery days from delivery string
 */
export function parseDeliveryDays(deliveryTime: string): number {
  const match = deliveryTime.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 7;
}

/**
 * Format price in INR
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Get score color class
 */
export function getScoreColor(score: number, max: number = 100): string {
  const percentage = (score / max) * 100;
  if (percentage >= 75) return 'text-success';
  if (percentage >= 50) return 'text-warning';
  return 'text-destructive';
}

/**
 * Get value tag color
 */
export function getValueTagColor(tag: ValueTag): string {
  switch (tag) {
    case 'Best Value': return 'bg-success text-success-foreground';
    case 'Good Value': return 'bg-info text-info-foreground';
    case 'Fair Deal': return 'bg-warning text-warning-foreground';
    case 'Overpriced': return 'bg-destructive text-destructive-foreground';
  }
}

/**
 * Get trust tag color
 */
export function getTrustTagColor(tag: TrustTag): string {
  switch (tag) {
    case 'Trusted Seller': return 'bg-success text-success-foreground';
    case 'Verified': return 'bg-info text-info-foreground';
    case 'Medium Risk': return 'bg-warning text-warning-foreground';
    case 'High Risk': return 'bg-destructive text-destructive-foreground';
  }
}
