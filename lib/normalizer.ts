// Enhanced normalization functions with all new features

import { 
  NormalizedProduct, 
  AmazonRawProduct, 
  FlipkartRawProduct, 
  MeeshoRawProduct,
  Platform
} from './types';
import { generatePriceHistory, generateReviews, generateSellerInfo } from './demoData';
import { 
  calculateValueScore, 
  calculateTrustScore, 
  getTrustTag,
  detectSuspiciousListing,
  parseDeliveryDays,
  calculateFinalPrice
} from './scoreEngines';
import { sanitizeUrl, buildAmazonUrl, buildFlipkartUrl, buildMeeshoUrl } from './utils';

/**
 * Parse price string to number
 */
function parsePrice(priceStr: string): number {
  return parseInt(priceStr.replace(/[₹,]/g, ''), 10) || 0;
}

/**
 * Calculate discount percentage
 */
function calculateDiscount(price: number, originalPrice: number): number {
  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

/**
 * Map RapidAPI Amazon response to AmazonRawProduct format
 */
export function mapAmazonApiResponse(apiProduct: any): AmazonRawProduct {
  return {
    asin: apiProduct.asin || '',
    product_title: apiProduct.product_title || apiProduct.title || '',
    product_price: apiProduct.product_price || '0',
    product_original_price: apiProduct.product_original_price,
    product_star_rating: String(apiProduct.product_star_rating || 0),
    product_num_ratings: parseInt(apiProduct.product_num_ratings?.replace(/,/g, '') || '0'),
    product_photo: apiProduct.product_photo || '',
    product_url: apiProduct.product_url || '',
    delivery: apiProduct.delivery || 'Standard Delivery',
    is_prime: apiProduct.is_prime || false,
  };
}

/**
 * Map RapidAPI Flipkart response to FlipkartRawProduct format
 */
export function mapFlipkartApiResponse(apiProduct: any): FlipkartRawProduct {
  return {
    pid: apiProduct.productId || apiProduct.pid || '',
    name: apiProduct.productTitle || apiProduct.name || '',
    selling_price: parseInt(String(apiProduct.productPrice || 0).replace(/[₹,]/g, '')) || 0,
    mrp: parseInt(String(apiProduct.productOriginalPrice || apiProduct.selling_price || 0).replace(/[₹,]/g, '')) || 0,
    rating: parseFloat(apiProduct.productRating || 0) || 0,
    reviews: parseInt(apiProduct.productReviewCount || 0) || 0,
    image_url: apiProduct.productImageUrl || '',
    link: apiProduct.productUrl || '',
    delivery_info: apiProduct.deliveryInfo || 'Standard Delivery',
    fassured: apiProduct.fassured || false,
  };
}

/**
 * Normalize Amazon product data to unified format
 */
export function normalizeAmazon(products: (AmazonRawProduct | any)[]): NormalizedProduct[] {
  return products.map((product) => {
    // Map API response to standard format if needed
    const mappedProduct: AmazonRawProduct = product.asin ? product : mapAmazonApiResponse(product);
    
    const price = parsePrice(mappedProduct.product_price);
    const originalPrice = mappedProduct.product_original_price 
      ? parsePrice(mappedProduct.product_original_price) 
      : price;
    const rating = parseFloat(mappedProduct.product_star_rating) || 0;
    const reviewCount = mappedProduct.product_num_ratings;
    const deliveryDays = parseDeliveryDays(mappedProduct.delivery);
    const deliveryCharge = mappedProduct.is_prime ? 0 : 40;
    const discountPercentage = calculateDiscount(price, originalPrice);
    
    const seller = generateSellerInfo('Amazon', rating);
    const trustScore = calculateTrustScore(seller);
    const valueScore = calculateValueScore(rating, reviewCount, price);
    const priceHistory = generatePriceHistory(price, 'Amazon', 0.08);
    const reviews = generateReviews(rating, Math.min(reviewCount, 10));
    const suspiciousCheck = detectSuspiciousListing({ rating, reviewCount, discountPercentage, price, originalPrice });
    
    const rawUrl = mappedProduct.product_url || buildAmazonUrl(mappedProduct.asin);
    const productUrl = sanitizeUrl(rawUrl) || buildAmazonUrl(mappedProduct.asin);

    return {
      id: `amazon-${mappedProduct.asin}`,
      title: mappedProduct.product_title,
      price,
      originalPrice,
      rating,
      reviewCount,
      image: mappedProduct.product_photo,
      productUrl,
      source: 'Amazon' as Platform,
      deliveryTime: mappedProduct.is_prime ? `Prime: ${mappedProduct.delivery}` : mappedProduct.delivery,
      deliveryDays,
      deliveryCharge,
      discountPercentage,
      inStock: true,
      valueScore,
      valueTag: 'Fair Deal', // Will be updated later with comparison
      trustScore,
      trustTag: getTrustTag(trustScore),
      finalPrice: calculateFinalPrice(price, deliveryCharge),
      reviews,
      priceHistory,
      seller,
      tags: [],
      isSuspicious: suspiciousCheck.isSuspicious,
      suspiciousReasons: suspiciousCheck.reasons,
    };
  });
}

/**
 * Normalize Flipkart product data to unified format
 */
export function normalizeFlipkart(products: (FlipkartRawProduct | any)[]): NormalizedProduct[] {
  return products.map((product) => {
    // Map API response to standard format if needed
    const mappedProduct: FlipkartRawProduct = product.pid ? product : mapFlipkartApiResponse(product);
    
    const price = mappedProduct.selling_price;
    const originalPrice = mappedProduct.mrp;
    const rating = mappedProduct.rating;
    const reviewCount = mappedProduct.reviews;
    const deliveryDays = parseDeliveryDays(mappedProduct.delivery_info);
    const deliveryCharge = mappedProduct.fassured ? 0 : 50;
    const discountPercentage = calculateDiscount(price, originalPrice);
    
    const seller = generateSellerInfo('Flipkart', rating);
    const trustScore = calculateTrustScore(seller);
    const valueScore = calculateValueScore(rating, reviewCount, price);
    const priceHistory = generatePriceHistory(price, 'Flipkart', 0.1);
    const reviews = generateReviews(rating, Math.min(reviewCount, 10));
    const suspiciousCheck = detectSuspiciousListing({ rating, reviewCount, discountPercentage, price, originalPrice });
    
    const rawUrlFK = mappedProduct.link || buildFlipkartUrl(mappedProduct.pid, mappedProduct.name);
    const productUrl = sanitizeUrl(rawUrlFK) || buildFlipkartUrl(mappedProduct.pid, mappedProduct.name);

    return {
      id: `flipkart-${mappedProduct.pid}`,
      title: mappedProduct.name,
      price,
      originalPrice,
      rating,
      reviewCount,
      image: mappedProduct.image_url,
      productUrl,
      source: 'Flipkart' as Platform,
      deliveryTime: mappedProduct.fassured ? `Assured: ${mappedProduct.delivery_info}` : mappedProduct.delivery_info,
      deliveryDays,
      deliveryCharge,
      discountPercentage,
      inStock: true,
      valueScore,
      valueTag: 'Fair Deal',
      trustScore,
      trustTag: getTrustTag(trustScore),
      finalPrice: calculateFinalPrice(price, deliveryCharge),
      reviews,
      priceHistory,
      seller,
      tags: [],
      isSuspicious: suspiciousCheck.isSuspicious,
      suspiciousReasons: suspiciousCheck.reasons,
    };
  });
}

/**
 * Normalize Meesho product data to unified format
 */
export function normalizeMeesho(products: MeeshoRawProduct[]): NormalizedProduct[] {
  return products.map((product) => {
    const price = product.price;
    const originalPrice = product.original_price;
    const rating = product.stars;
    const reviewCount = product.total_reviews;
    const deliveryDays = parseDeliveryDays(product.shipping);
    const deliveryCharge = 0; // Meesho has free shipping
    const discountPercentage = calculateDiscount(price, originalPrice);
    
    const seller = generateSellerInfo('Meesho', rating);
    const trustScore = calculateTrustScore(seller);
    const valueScore = calculateValueScore(rating, reviewCount, price);
    const priceHistory = generatePriceHistory(price, 'Meesho', 0.12);
    const reviews = generateReviews(rating, Math.min(reviewCount, 10));
    const suspiciousCheck = detectSuspiciousListing({ rating, reviewCount, discountPercentage, price, originalPrice });
    
    const rawUrlMS = product.url || buildMeeshoUrl(product.product_id);
    const productUrl = sanitizeUrl(rawUrlMS) || buildMeeshoUrl(product.product_id);

    return {
      id: `meesho-${product.product_id}`,
      title: product.title,
      price,
      originalPrice,
      rating,
      reviewCount,
      image: product.images[0] || '',
      productUrl,
      source: 'Meesho' as Platform,
      deliveryTime: `Free Shipping: ${product.shipping}`,
      deliveryDays,
      deliveryCharge,
      discountPercentage,
      inStock: true,
      valueScore,
      valueTag: 'Fair Deal',
      trustScore,
      trustTag: getTrustTag(trustScore),
      finalPrice: calculateFinalPrice(price, deliveryCharge),
      reviews,
      priceHistory,
      seller,
      tags: [],
      isSuspicious: suspiciousCheck.isSuspicious,
      suspiciousReasons: suspiciousCheck.reasons,
    };
  });
}
