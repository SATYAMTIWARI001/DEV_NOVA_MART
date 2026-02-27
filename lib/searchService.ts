// Enhanced Search Service with all features

import { NormalizedProduct, ProductGroup, SearchResult, Platform, SortOption, SearchFilters } from './types';
import { normalizeAmazon, normalizeFlipkart, normalizeMeesho } from './normalizer';
import { 
  mergeProducts, 
  buildProductGroups, 
  applyFilters,
  buildSearchResult 
} from './comparisonEngine';
import { 
  amazonDemoData, 
  flipkartDemoData, 
  meeshoDemoData, 
  findMatchingCategory 
} from './demoData';
import { fetchSearchResults } from './searchApi';

// Simple in-memory cache
const cache = new Map<string, { result: SearchResult; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch real Amazon products via API
 */
async function fetchAmazonProducts(query: string): Promise<NormalizedProduct[]> {
  try {
    const results = await fetchSearchResults(query);
    const amazonProducts = results.amazon || [];
    
    if (amazonProducts.length > 0) {
      return normalizeAmazon(amazonProducts);
    }
  } catch (error) {
    console.warn('Amazon API search failed, falling back to demo data:', error);
  }
  
  // Fallback to demo data
  const category = findMatchingCategory(query);
  if (category && amazonDemoData[category]) {
    return normalizeAmazon(amazonDemoData[category]);
  }
  
  return [];
}

/**
 * Fetch real Flipkart products via API
 */
async function fetchFlipkartProducts(query: string): Promise<NormalizedProduct[]> {
  try {
    const results = await fetchSearchResults(query);
    const flipkartProducts = results.flipkart || [];
    
    if (flipkartProducts.length > 0) {
      return normalizeFlipkart(flipkartProducts);
    }
  } catch (error) {
    console.warn('Flipkart API search failed, falling back to demo data:', error);
  }
  
  // Fallback to demo data
  const category = findMatchingCategory(query);
  if (category && flipkartDemoData[category]) {
    return normalizeFlipkart(flipkartDemoData[category]);
  }
  
  return [];
}

/**
 * Fetch Meesho products (demo data only, no API available)
 */
async function fetchMeeshoProducts(query: string): Promise<NormalizedProduct[]> {
  const category = findMatchingCategory(query);
  if (category && meeshoDemoData[category]) {
    return normalizeMeesho(meeshoDemoData[category]);
  }
  
  return [];
}

/**
 * Unified search function - fetches from all platforms in parallel
 */
export async function unifiedSearch(
  query: string,
  filters: SearchFilters = {}
): Promise<SearchResult> {
  const normalizedQuery = query.toLowerCase().trim();
  
  // Build cache key
  const cacheKey = JSON.stringify({ query: normalizedQuery, filters });
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.result;
  }
  
  // Fetch from all platforms in parallel (resilient)
  const [amazonProducts, flipkartProducts, meeshoProducts] = await Promise.allSettled([
    fetchAmazonProducts(normalizedQuery),
    fetchFlipkartProducts(normalizedQuery),
    fetchMeeshoProducts(normalizedQuery),
  ]);
  
  // Extract successful results
  const amazon = amazonProducts.status === 'fulfilled' ? amazonProducts.value : [];
  const flipkart = flipkartProducts.status === 'fulfilled' ? flipkartProducts.value : [];
  const meesho = meeshoProducts.status === 'fulfilled' ? meeshoProducts.value : [];
  
  // Merge all products
  const allProducts = mergeProducts(amazon, flipkart, meesho);
  
  // Build product groups
  let groups = buildProductGroups(allProducts);
  
  // Apply filters
  groups = applyFilters(groups, filters);
  
  // Build final result
  const result = buildSearchResult(query, groups, filters);
  
  // Cache result
  cache.set(cacheKey, { result, timestamp: Date.now() });
  
  return result;
}

/**
 * Get product by ID
 */
export function getProductFromGroups(
  groups: ProductGroup[],
  productId: string
): { product: NormalizedProduct; group: ProductGroup } | null {
  for (const group of groups) {
    const product = group.products.find(p => p.id === productId);
    if (product) {
      return { product, group };
    }
  }
  return null;
}

/**
 * Get all available categories for suggestions
 */
export function getSearchSuggestions(): string[] {
  return [
    'iPhone 15',
    'Samsung Galaxy S24',
    'Headphones',
    'MacBook Laptop',
    'Apple Watch',
  ];
}

/**
 * Get trending products (mock)
 */
export function getTrendingSearches(): string[] {
  return [
    'iPhone 15 Pro Max',
    'Samsung S24 Ultra',
    'Sony WH-1000XM5',
    'MacBook Air M3',
    'Apple Watch Series 9',
  ];
}
