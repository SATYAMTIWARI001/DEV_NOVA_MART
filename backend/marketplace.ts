// Marketplace helper moved from lib/marketplaceSearch.ts

export interface MarketplaceOffer {
  platform: string;
  price: number;
  rating: number;
  deliveryDays: number;
  shippingCost: number;
  url: string;
}

const platforms: Array<[string, string]> = [
  ['Amazon', 'https://www.amazon.in/s?k='],
  ['Flipkart', 'https://www.flipkart.com/search?q='],
  ['Meesho', 'https://www.meesho.com/search?q='],
  ['Croma', 'https://www.croma.com/search/?text='],
  ['Reliance Digital', 'https://www.reliancedigital.in/search?q='],
];

function encodeProduct(name: string) {
  return encodeURIComponent(name).replace(/%20/g, '+');
}

function normalizeText(s: string) {
  return (s || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function tokenScore(a: string, b: string) {
  const ta = new Set(normalizeText(a).split(' ').filter(Boolean));
  const tb = new Set(normalizeText(b).split(' ').filter(Boolean));
  if (!ta.size || !tb.size) return 0;
  let common = 0;
  ta.forEach(t => { if (tb.has(t)) common++; });
  return common / Math.max(ta.size, tb.size);
}

function parsePriceString(p: any): number {
  if (!p && p !== 0) return 0;
  const s = String(p);
  const num = parseInt(s.replace(/[^0-9]/g, ''), 10);
  return isNaN(num) ? 0 : num;
}

// Import server-side search helpers (RapidAPI integrations)
import { searchAmazonProducts, searchFlipkartProducts } from './search';

function generateMockOffer(platform: string, baseUrl: string, encoded: string, seed: number): MarketplaceOffer {
  // Generate reasonable mock values for quick search display
  // Use seed to vary prices/ratings slightly per platform while keeping them within sensible ranges
  const basePrice = 56000 + (seed * 7777) % 8000; // ₹56k–₹64k range
  const variation = ((seed + platform.charCodeAt(0)) * 12345) % 10000;
  
  return {
    platform,
    price: basePrice + (variation % 6000) - 3000, // vary by ±₹3k
    rating: 3.5 + ((variation % 15) / 10), // 3.5–5.0
    deliveryDays: 2 + ((variation % 4)), // 2–5 days
    shippingCost: Math.floor((variation % 300)),
    url: `${baseUrl}${encoded}`,
  };
}

export async function generateMarketplaceData(productName: string): Promise<MarketplaceOffer[]> {
  const encoded = encodeProduct(productName);
  const results: MarketplaceOffer[] = [];
  const seed = productName.charCodeAt(0) + productName.length; // deterministic seed per query

  // Amazon: try to find best match via RapidAPI
  let amazonFound = false;
  try {
    const amazon = await searchAmazonProducts(productName);
    if (amazon && amazon.length > 0) {
      let best = null;
      let bestScore = 0;
      for (const p of amazon) {
        const title = p.product_title || '';
        const score = tokenScore(productName, title);
        if (score > bestScore) { bestScore = score; best = p; }
      }
      if (best && bestScore > 0.3) { // require reasonable match
        results.push({
          platform: 'Amazon',
          price: parsePriceString(best.product_price || ''),
          rating: parseFloat(best.product_star_rating || '0') || 0,
          deliveryDays: 2 + Math.floor(Math.random() * 3),
          shippingCost: 0,
          url: best.product_url || `https://www.amazon.in/dp/${best.asin || ''}`,
        });
        amazonFound = true;
      }
    }
  } catch (e) {
    console.warn('Amazon marketplace lookup failed', e);
  }

  // Flipkart: similar approach
  let flipkartFound = false;
  try {
    const fk = await searchFlipkartProducts(productName);
    if (fk && fk.length > 0) {
      let best = null;
      let bestScore = 0;
      for (const p of fk) {
        const title = (p.productTitle || '');
        const score = tokenScore(productName, title);
        if (score > bestScore) { bestScore = score; best = p; }
      }
      if (best && bestScore > 0.3) {
        results.push({
          platform: 'Flipkart',
          price: parsePriceString(best.productPrice || ''),
          rating: parseFloat(best.productRating || '0') || 0,
          deliveryDays: 1 + Math.floor(Math.random() * 3),
          shippingCost: 0,
          url: best.productUrl || `https://www.flipkart.com/search?q=${encoded}`,
        });
        flipkartFound = true;
      }
    }
  } catch (e) {
    console.warn('Flipkart marketplace lookup failed', e);
  }

  // For all platforms not yet filled (or if API lookup failed), generate reasonable mock data
  for (const [name, baseUrl] of platforms) {
    if (name === 'Amazon' && amazonFound) continue;
    if (name === 'Flipkart' && flipkartFound) continue;
    
    // Generate mock offer with reasonable values
    const mockOffer = generateMockOffer(name, baseUrl, encoded, seed);
    results.push(mockOffer);
  }

  return results;
}
