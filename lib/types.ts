// Enhanced types for the unified comparison engine

export type Platform = 'Amazon' | 'Flipkart' | 'Meesho';

export type ValueTag = 'Best Value' | 'Good Value' | 'Fair Deal' | 'Overpriced';
export type TrustTag = 'Trusted Seller' | 'Verified' | 'Medium Risk' | 'High Risk';
export type DealTag = 'Best Deal' | 'Fastest Delivery' | 'Top Rated' | 'Price Drop';

export interface Review {
  id: string;
  userName: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  helpful: number;
  verified: boolean;
}

export interface PriceHistoryPoint {
  date: string;
  price: number;
}

export interface PriceHistory {
  platform: Platform;
  history: PriceHistoryPoint[];
  lowestPrice: number;
  highestPrice: number;
  averagePrice: number;
  currentTrend: 'up' | 'down' | 'stable';
  priceDropAmount?: number;
}

export interface SellerInfo {
  name: string;
  rating: number;
  reviewCount: number;
  responseRate: number;
  deliveryScore: number;
}

export interface NormalizedProduct {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  productUrl: string;
  source: Platform;
  deliveryTime: string;
  deliveryDays: number;
  deliveryCharge: number;
  discountPercentage: number;
  inStock: boolean;
  
  // Enhanced fields
  valueScore: number;
  valueTag: ValueTag;
  trustScore: number;
  trustTag: TrustTag;
  finalPrice: number; // Price + delivery - discounts
  
  // Reviews
  reviews: Review[];
  
  // Price history
  priceHistory: PriceHistory;
  
  // Seller info
  seller: SellerInfo;
  
  // Tags
  tags: DealTag[];
  
  // Scam detection
  isSuspicious: boolean;
  suspiciousReasons: string[];
}

export interface ProductGroup {
  groupId: string;
  title: string;
  image: string;
  category: string;
  products: NormalizedProduct[];
  cheapest: NormalizedProduct;
  costliest: NormalizedProduct;
  bestValue: NormalizedProduct;
  fastestDelivery: NormalizedProduct;
  topRated: NormalizedProduct;
  priceDifference: number;
  percentageDifference: number;
  averageRating: number;
  
  // Aggregated price history
  combinedPriceHistory: {
    amazon?: PriceHistory;
    flipkart?: PriceHistory;
    meesho?: PriceHistory;
  };
  
  // Alternative suggestions
  alternatives?: ProductGroup[];
}

export interface SearchResult {
  query: string;
  totalResults: number;
  groups: ProductGroup[];
  timestamp: number;
  filters: SearchFilters;
}

// Simplified result type used by ResultCard component for price comparisons.
export interface PriceResult {
  platform: string;
  score: number;
  price: number;
  effective_price: number;
  rating: number;
  delivery_days: number;
  shipping_cost: number;
  url: string;
}

export interface SearchFilters {
  minPrice?: number;
  maxPrice?: number;
  platforms?: Platform[];
  minRating?: number;
  sortBy?: SortOption;
  budgetMode?: BudgetPreference;
}

export type SortOption = 'price-low' | 'price-high' | 'rating' | 'discount' | 'value-score' | 'delivery';
export type BudgetPreference = 'best-rating' | 'best-value' | 'lowest-price';

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

export interface WishlistItem {
  productId: string;
  groupId: string;
  addedAt: string;
  targetPrice?: number;
}

export interface CartItem {
  productId: string;
  groupId: string;
  quantity: number;
  addedAt: string;
}

export interface PriceAlert {
  id: string;
  productId: string;
  groupId: string;
  productTitle: string;
  productImage: string;
  platform: Platform;
  currentPrice: number;
  targetPrice: number;
  createdAt: string;
  triggered: boolean;
  triggeredAt?: string;
}

export interface UserState {
  user: User | null;
  wishlist: WishlistItem[];
  cart: CartItem[];
  priceAlerts: PriceAlert[];
  recentSearches: string[];
}

// Raw API response types (simulated)
export interface AmazonRawProduct {
  asin: string;
  product_title: string;
  product_price: string;
  product_original_price?: string;
  product_star_rating: string;
  product_num_ratings: number;
  product_photo: string;
  product_url: string;
  delivery: string;
  is_prime: boolean;
}

export interface FlipkartRawProduct {
  pid: string;
  name: string;
  selling_price: number;
  mrp: number;
  rating: number;
  reviews: number;
  image_url: string;
  link: string;
  delivery_info: string;
  fassured: boolean;
}

export interface MeeshoRawProduct {
  product_id: string;
  title: string;
  price: number;
  original_price: number;
  stars: number;
  total_reviews: number;
  images: string[];
  url: string;
  shipping: string;
}
