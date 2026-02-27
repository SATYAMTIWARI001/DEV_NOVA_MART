// Enhanced Comparison Engine with all features

import { 
  NormalizedProduct, 
  ProductGroup, 
  SearchResult, 
  Platform,
  SearchFilters,
  SortOption,
  BudgetPreference
} from './types';
import { getValueTag, getDealTags } from './scoreEngines';

/**
 * Calculate string similarity using word overlap
 */
function stringSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().replace(/[^a-z0-9]/g, '');
  const s2 = str2.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;
  if (s1.includes(s2) || s2.includes(s1)) return 0.8;
  
  const words1 = new Set(str1.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  const words2 = new Set(str2.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  
  const intersection = [...words1].filter(word => words2.has(word));
  const union = new Set([...words1, ...words2]);
  
  return intersection.length / union.size;
}

/**
 * Extract product identifier from title for better grouping
 */
function extractProductKey(title: string): string {
  const normalized = title.toLowerCase();
  
  const patterns = [
    /iphone\s*\d+\s*(pro\s*max|pro|plus)?/i,
    /galaxy\s*s\d+\s*(ultra|plus)?/i,
    /macbook\s*(air|pro)\s*m\d/i,
    /airpods\s*(pro)?(\s*\d+)?/i,
    /wh-?\d+xm\d/i,
    /watch\s*series\s*\d+/i,
  ];
  
  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match) return match[0].replace(/\s+/g, ' ').trim();
  }
  
  return normalized
    .split(/\s+/)
    .filter(w => w.length > 3 && !['with', 'from', 'brand', 'new'].includes(w))
    .slice(0, 3)
    .join(' ');
}

/**
 * Group similar products together
 */
function groupProducts(products: NormalizedProduct[]): Map<string, NormalizedProduct[]> {
  const groups = new Map<string, NormalizedProduct[]>();
  
  for (const product of products) {
    const key = extractProductKey(product.title);
    
    let foundGroup = false;
    for (const [existingKey, existingProducts] of groups) {
      if (stringSimilarity(key, existingKey) > 0.6) {
        existingProducts.push(product);
        foundGroup = true;
        break;
      }
    }
    
    if (!foundGroup) {
      groups.set(key, [product]);
    }
  }
  
  return groups;
}

/**
 * Find product by criteria
 */
function findProductBy(
  products: NormalizedProduct[], 
  compareFn: (a: NormalizedProduct, b: NormalizedProduct) => NormalizedProduct
): NormalizedProduct {
  return products.reduce((best, p) => compareFn(best, p), products[0]);
}

/**
 * Calculate average rating
 */
function calculateAverageRating(products: NormalizedProduct[]): number {
  const sum = products.reduce((acc, p) => acc + p.rating, 0);
  return Math.round((sum / products.length) * 10) / 10;
}

/**
 * Update value tags based on comparison within group
 */
function updateValueTags(products: NormalizedProduct[]): void {
  const allScores = products.map(p => p.valueScore);
  products.forEach(p => {
    p.valueTag = getValueTag(p.valueScore, allScores);
    p.tags = getDealTags(p, products);
  });
}

/**
 * Build product groups with comparison data
 */
export function buildProductGroups(products: NormalizedProduct[]): ProductGroup[] {
  const groupedProducts = groupProducts(products);
  const productGroups: ProductGroup[] = [];
  
  let groupIndex = 0;
  for (const [, groupProducts] of groupedProducts) {
    if (groupProducts.length === 0) continue;
    
    // Update value tags within the group
    updateValueTags(groupProducts);
    
    const cheapest = findProductBy(groupProducts, (a, b) => a.price < b.price ? a : b);
    const costliest = findProductBy(groupProducts, (a, b) => a.price > b.price ? a : b);
    const bestValue = findProductBy(groupProducts, (a, b) => a.valueScore > b.valueScore ? a : b);
    const fastestDelivery = findProductBy(groupProducts, (a, b) => a.deliveryDays < b.deliveryDays ? a : b);
    const topRated = findProductBy(groupProducts, (a, b) => a.rating > b.rating ? a : b);
    
    const priceDifference = costliest.price - cheapest.price;
    const percentageDifference = costliest.price > 0 
      ? Math.round((priceDifference / costliest.price) * 100) 
      : 0;
    
    // Build combined price history
    const combinedPriceHistory: ProductGroup['combinedPriceHistory'] = {};
    groupProducts.forEach(p => {
      const key = p.source.toLowerCase() as 'amazon' | 'flipkart' | 'meesho';
      combinedPriceHistory[key] = p.priceHistory;
    });
    
    // Detect category from title
    const category = detectCategory(cheapest.title);
    
    productGroups.push({
      groupId: `group-${groupIndex++}`,
      title: cheapest.title,
      image: cheapest.image,
      category,
      products: groupProducts.sort((a, b) => a.price - b.price),
      cheapest,
      costliest,
      bestValue,
      fastestDelivery,
      topRated,
      priceDifference,
      percentageDifference,
      averageRating: calculateAverageRating(groupProducts),
      combinedPriceHistory,
    });
  }
  
  return productGroups;
}

/**
 * Detect product category from title
 */
function detectCategory(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes('iphone') || lower.includes('galaxy') || lower.includes('phone')) return 'Smartphones';
  if (lower.includes('macbook') || lower.includes('laptop')) return 'Laptops';
  if (lower.includes('headphone') || lower.includes('airpods') || lower.includes('earbuds')) return 'Audio';
  if (lower.includes('watch')) return 'Wearables';
  return 'Electronics';
}

/**
 * Merge products from all platforms
 */
export function mergeProducts(
  amazonProducts: NormalizedProduct[],
  flipkartProducts: NormalizedProduct[],
  meeshoProducts: NormalizedProduct[]
): NormalizedProduct[] {
  return [...amazonProducts, ...flipkartProducts, ...meeshoProducts];
}

/**
 * Sort product groups by various criteria
 */
export function sortGroups(
  groups: ProductGroup[],
  sortBy: SortOption
): ProductGroup[] {
  const sorted = [...groups];
  
  switch (sortBy) {
    case 'price-low':
      return sorted.sort((a, b) => a.cheapest.price - b.cheapest.price);
    case 'price-high':
      return sorted.sort((a, b) => b.cheapest.price - a.cheapest.price);
    case 'rating':
      return sorted.sort((a, b) => b.averageRating - a.averageRating);
    case 'discount':
      return sorted.sort((a, b) => b.cheapest.discountPercentage - a.cheapest.discountPercentage);
    case 'value-score':
      return sorted.sort((a, b) => b.bestValue.valueScore - a.bestValue.valueScore);
    case 'delivery':
      return sorted.sort((a, b) => a.fastestDelivery.deliveryDays - b.fastestDelivery.deliveryDays);
    default:
      return sorted;
  }
}

/**
 * Filter groups by platform
 */
export function filterByPlatform(
  groups: ProductGroup[],
  platforms: Platform[]
): ProductGroup[] {
  if (platforms.length === 0) return groups;
  
  return groups
    .map(group => ({
      ...group,
      products: group.products.filter(p => platforms.includes(p.source)),
    }))
    .filter(group => group.products.length > 0)
    .map(group => {
      const cheapest = findProductBy(group.products, (a, b) => a.price < b.price ? a : b);
      const costliest = findProductBy(group.products, (a, b) => a.price > b.price ? a : b);
      const bestValue = findProductBy(group.products, (a, b) => a.valueScore > b.valueScore ? a : b);
      const fastestDelivery = findProductBy(group.products, (a, b) => a.deliveryDays < b.deliveryDays ? a : b);
      const topRated = findProductBy(group.products, (a, b) => a.rating > b.rating ? a : b);
      const priceDifference = costliest.price - cheapest.price;
      
      return {
        ...group,
        cheapest,
        costliest,
        bestValue,
        fastestDelivery,
        topRated,
        priceDifference,
        percentageDifference: costliest.price > 0 
          ? Math.round((priceDifference / costliest.price) * 100) 
          : 0,
      };
    });
}

/**
 * Filter by budget with preference
 */
export function filterByBudget(
  groups: ProductGroup[],
  maxBudget: number,
  preference: BudgetPreference
): ProductGroup[] {
  // Filter products within budget
  const filteredGroups = groups
    .map(group => ({
      ...group,
      products: group.products.filter(p => p.price <= maxBudget),
    }))
    .filter(group => group.products.length > 0);
  
  // Sort based on preference
  switch (preference) {
    case 'best-rating':
      return filteredGroups.sort((a, b) => b.topRated.rating - a.topRated.rating);
    case 'best-value':
      return filteredGroups.sort((a, b) => b.bestValue.valueScore - a.bestValue.valueScore);
    case 'lowest-price':
    default:
      return filteredGroups.sort((a, b) => a.cheapest.price - b.cheapest.price);
  }
}

/**
 * Apply all filters
 */
export function applyFilters(
  groups: ProductGroup[],
  filters: SearchFilters
): ProductGroup[] {
  let result = [...groups];
  
  // Apply platform filter
  if (filters.platforms && filters.platforms.length > 0) {
    result = filterByPlatform(result, filters.platforms);
  }
  
  // Apply price range filter
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    result = result
      .map(group => ({
        ...group,
        products: group.products.filter(p => {
          if (filters.minPrice !== undefined && p.price < filters.minPrice) return false;
          if (filters.maxPrice !== undefined && p.price > filters.maxPrice) return false;
          return true;
        }),
      }))
      .filter(group => group.products.length > 0);
  }
  
  // Apply rating filter
  if (filters.minRating !== undefined) {
    result = result.filter(group => group.averageRating >= filters.minRating!);
  }
  
  // Apply budget mode
  if (filters.maxPrice !== undefined && filters.budgetMode) {
    result = filterByBudget(result, filters.maxPrice, filters.budgetMode);
  }
  
  // Apply sorting
  if (filters.sortBy) {
    result = sortGroups(result, filters.sortBy);
  }
  
  return result;
}

/**
 * Build complete search result
 */
export function buildSearchResult(
  query: string,
  groups: ProductGroup[],
  filters: SearchFilters = {}
): SearchResult {
  return {
    query,
    totalResults: groups.reduce((sum, g) => sum + g.products.length, 0),
    groups,
    timestamp: Date.now(),
    filters,
  };
}
