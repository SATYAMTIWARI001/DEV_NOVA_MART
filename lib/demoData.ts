// Enhanced demo data with reviews, price history, and seller info

import {
  AmazonRawProduct,
  FlipkartRawProduct,
  MeeshoRawProduct,
  Review,
  PriceHistory,
  SellerInfo,
  Platform
} from './types';
import { buildMeeshoUrl } from './utils';

const productImages = {
  iphone: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop',
  samsung: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=400&fit=crop',
  headphones: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
  laptop: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop',
  watch: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
  shoes: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
};

// Generate realistic price history for last 90 days
export function generatePriceHistory(
  basePrice: number,
  platform: Platform,
  volatility: number = 0.1
): PriceHistory {
  const history: { date: string; price: number }[] = [];
  const today = new Date();
  let currentPrice = basePrice;
  let lowestPrice = basePrice;
  let highestPrice = basePrice;
  let totalPrice = 0;

  for (let i = 90; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Add some random variation
    const change = (Math.random() - 0.5) * 2 * volatility * basePrice;
    currentPrice = Math.max(basePrice * 0.7, Math.min(basePrice * 1.3, currentPrice + change));
    currentPrice = Math.round(currentPrice);

    if (currentPrice < lowestPrice) lowestPrice = currentPrice;
    if (currentPrice > highestPrice) highestPrice = currentPrice;
    totalPrice += currentPrice;

    // Only add weekly data points to keep it manageable
    if (i % 7 === 0) {
      history.push({
        date: date.toISOString().split('T')[0],
        price: currentPrice,
      });
    }
  }

  const lastPrice = history[history.length - 2]?.price || basePrice;
  const priceDropAmount = lastPrice > basePrice ? lastPrice - basePrice : 0;

  return {
    platform,
    history,
    lowestPrice,
    highestPrice,
    averagePrice: Math.round(totalPrice / 91),
    currentTrend: basePrice < lastPrice ? 'down' : basePrice > lastPrice ? 'up' : 'stable',
    priceDropAmount: priceDropAmount > 0 ? priceDropAmount : undefined,
  };
}

// Generate realistic reviews
export function generateReviews(rating: number, count: number): Review[] {
  const reviewTemplates = {
    positive: [
      { title: 'Excellent product!', content: 'Absolutely love this product. Quality is outstanding and delivery was super fast. Highly recommend!' },
      { title: 'Great value for money', content: 'This product exceeded my expectations. The build quality is premium and works perfectly.' },
      { title: 'Very satisfied', content: 'Exactly what I was looking for. Fast shipping and great packaging. Will buy again.' },
      { title: 'Amazing quality', content: 'The product quality is top-notch. Customer service was also very helpful.' },
      { title: 'Best purchase', content: 'One of the best purchases I have made. The product is exactly as described.' },
    ],
    neutral: [
      { title: 'Good but not great', content: 'Product is okay. Does what it says but nothing special. Delivery took longer than expected.' },
      { title: 'Average product', content: 'It works fine but I expected better quality for this price. Packaging could be improved.' },
      { title: 'Decent', content: 'The product is decent for the price. Some minor issues but overall acceptable.' },
    ],
    negative: [
      { title: 'Disappointed', content: 'Product did not meet my expectations. Quality is below average for the price.' },
      { title: 'Not worth it', content: 'Had issues from day one. Customer support was not helpful either.' },
    ],
  };

  const names = ['Rahul S.', 'Priya M.', 'Amit K.', 'Sneha R.', 'Vikram P.', 'Anjali T.', 'Rohan D.', 'Meera G.', 'Arjun B.', 'Kavita N.'];

  const reviews: Review[] = [];
  const reviewCount = Math.min(count, 10);

  for (let i = 0; i < reviewCount; i++) {
    const reviewRating = Math.max(1, Math.min(5, Math.round(rating + (Math.random() - 0.5) * 2)));
    const templates = reviewRating >= 4 ? reviewTemplates.positive : reviewRating >= 3 ? reviewTemplates.neutral : reviewTemplates.negative;
    const template = templates[Math.floor(Math.random() * templates.length)];

    const daysAgo = Math.floor(Math.random() * 90);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);

    reviews.push({
      id: `review-${i}`,
      userName: names[i % names.length],
      rating: reviewRating,
      title: template.title,
      content: template.content,
      date: date.toISOString().split('T')[0],
      helpful: Math.floor(Math.random() * 50),
      verified: Math.random() > 0.2,
    });
  }

  return reviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Generate seller info
export function generateSellerInfo(platform: Platform, rating: number): SellerInfo {
  const sellerNames = {
    Amazon: ['Appario Retail', 'Cloudtail India', 'RetailNet', 'Cocoblu Retail'],
    Flipkart: ['RetailNet', 'SuperComNet', 'TrueComRetail', 'OmniTech'],
    Meesho: ['FastShip Store', 'ValueMart', 'BestDeals Hub', 'QuickSell'],
  };

  const names = sellerNames[platform];

  return {
    name: names[Math.floor(Math.random() * names.length)],
    rating: Math.min(5, rating + (Math.random() - 0.3) * 0.5),
    reviewCount: Math.floor(Math.random() * 50000) + 1000,
    responseRate: Math.floor(Math.random() * 20) + 80,
    deliveryScore: Math.floor(Math.random() * 15) + 85,
  };
}

export const amazonDemoData: Record<string, AmazonRawProduct[]> = {
  iphone: [
    {
      asin: 'AMZ001',
      product_title: 'Apple iPhone 15 Pro Max (256GB) - Natural Titanium',
      product_price: '₹1,59,900',
      product_original_price: '₹1,79,900',
      product_star_rating: '4.6',
      product_num_ratings: 12543,
      product_photo: productImages.iphone,
      product_url: 'https://www.amazon.in/dp/B0CHX6QG7Z',
      delivery: '2-3 days',
      is_prime: true,
    },
    {
      asin: 'AMZ002',
      product_title: 'Apple iPhone 15 (128GB) - Blue',
      product_price: '₹79,900',
      product_original_price: '₹89,900',
      product_star_rating: '4.5',
      product_num_ratings: 8932,
      product_photo: productImages.iphone,
      product_url: 'https://www.amazon.in/dp/B0CHX1W1XY',
      delivery: '1-2 days',
      is_prime: true,
    },
  ],
  samsung: [
    {
      asin: 'AMZ003',
      product_title: 'Samsung Galaxy S24 Ultra 5G (256GB) - Titanium Black',
      product_price: '₹1,29,999',
      product_original_price: '₹1,49,999',
      product_star_rating: '4.4',
      product_num_ratings: 9876,
      product_photo: productImages.samsung,
      product_url: 'https://www.amazon.in/dp/B0CQYLGCJD',
      delivery: '1-2 days',
      is_prime: true,
    },
  ],
  headphones: [
    {
      asin: 'AMZ004',
      product_title: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
      product_price: '₹26,990',
      product_original_price: '₹34,990',
      product_star_rating: '4.7',
      product_num_ratings: 15678,
      product_photo: productImages.headphones,
      product_url: 'https://www.amazon.in/dp/B09XS7JWHH',
      delivery: '2-3 days',
      is_prime: true,
    },
    {
      asin: 'AMZ005',
      product_title: 'Apple AirPods Pro (2nd Gen) with MagSafe Case',
      product_price: '₹24,900',
      product_original_price: '₹26,900',
      product_star_rating: '4.6',
      product_num_ratings: 23456,
      product_photo: productImages.headphones,
      product_url: 'https://www.amazon.in/dp/B0CHX7SND8',
      delivery: '1 day',
      is_prime: true,
    },
  ],
  laptop: [
    {
      asin: 'AMZ006',
      product_title: 'Apple MacBook Air M3 (15-inch, 8GB RAM, 256GB SSD)',
      product_price: '₹1,34,900',
      product_original_price: '₹1,44,900',
      product_star_rating: '4.8',
      product_num_ratings: 5678,
      product_photo: productImages.laptop,
      product_url: 'https://www.amazon.in/dp/B0CX2XXZYG',
      delivery: '2-3 days',
      is_prime: true,
    },
  ],
  watch: [
    {
      asin: 'AMZ007',
      product_title: 'Apple Watch Series 9 GPS 45mm Aluminium Case',
      product_price: '₹44,900',
      product_original_price: '₹49,900',
      product_star_rating: '4.5',
      product_num_ratings: 7890,
      product_photo: productImages.watch,
      product_url: 'https://www.amazon.in/dp/B0CHX85Y55',
      delivery: '1-2 days',
      is_prime: true,
    },
  ],
};

export const flipkartDemoData: Record<string, FlipkartRawProduct[]> = {
  iphone: [
    {
      pid: 'FK001',
      name: 'Apple iPhone 15 Pro Max 256 GB Natural Titanium',
      selling_price: 156999,
      mrp: 179900,
      rating: 4.5,
      reviews: 10234,
      image_url: productImages.iphone,
      link: '',
      delivery_info: '3-4 days',
      fassured: true,
    },
    {
      pid: 'FK002',
      name: 'Apple iPhone 15 128 GB Blue',
      selling_price: 76999,
      mrp: 89900,
      rating: 4.4,
      reviews: 7654,
      image_url: productImages.iphone,
      link: '',
      delivery_info: '2-3 days',
      fassured: true,
    },
  ],
  samsung: [
    {
      pid: 'FK003',
      name: 'Samsung Galaxy S24 Ultra 5G 256 GB Titanium Black',
      selling_price: 124999,
      mrp: 149999,
      rating: 4.3,
      reviews: 8765,
      image_url: productImages.samsung,
      link: '',
      delivery_info: '2-3 days',
      fassured: true,
    },
  ],
  headphones: [
    {
      pid: 'FK004',
      name: 'Sony WH-1000XM5 Wireless ANC Headphones Black',
      selling_price: 25999,
      mrp: 34990,
      rating: 4.6,
      reviews: 12345,
      image_url: productImages.headphones,
      link: '',
      delivery_info: '3-4 days',
      fassured: true,
    },
    {
      pid: 'FK005',
      name: 'Apple AirPods Pro 2nd Gen MagSafe Charging Case',
      selling_price: 23999,
      mrp: 26900,
      rating: 4.5,
      reviews: 19876,
      image_url: productImages.headphones,
      link: '',
      delivery_info: '2 days',
      fassured: true,
    },
  ],
  laptop: [
    {
      pid: 'FK006',
      name: 'Apple MacBook Air M3 15 inch 8GB 256GB SSD',
      selling_price: 131999,
      mrp: 144900,
      rating: 4.7,
      reviews: 4567,
      image_url: productImages.laptop,
      link: '',
      delivery_info: '3-4 days',
      fassured: true,
    },
  ],
  watch: [
    {
      pid: 'FK007',
      name: 'Apple Watch Series 9 GPS 45mm Aluminium',
      selling_price: 43999,
      mrp: 49900,
      rating: 4.4,
      reviews: 6543,
      image_url: productImages.watch,
      link: '',
      delivery_info: '2-3 days',
      fassured: true,
    },
  ],
};

export const meeshoDemoData: Record<string, MeeshoRawProduct[]> = {
  iphone: [
    {
      product_id: 'MS001',
      title: 'iPhone 15 Pro Max 256GB Natural Titanium (Refurbished)',
      price: 145999,
      original_price: 179900,
      stars: 4.2,
      total_reviews: 5678,
      images: [productImages.iphone],
      url: buildMeeshoUrl('MS001'),
      shipping: '5-7 days',
    },
    {
      product_id: 'MS002',
      title: 'iPhone 15 128GB Blue (Brand New Sealed)',
      price: 74999,
      original_price: 89900,
      stars: 4.3,
      total_reviews: 4321,
      images: [productImages.iphone],
      url: buildMeeshoUrl('MS002'),
      shipping: '4-5 days',
    },
  ],
  samsung: [
    {
      product_id: 'MS003',
      title: 'Samsung Galaxy S24 Ultra 256GB Titanium Black',
      price: 119999,
      original_price: 149999,
      stars: 4.1,
      total_reviews: 6543,
      images: [productImages.samsung],
      url: buildMeeshoUrl('MS003'),
      shipping: '4-6 days',
    },
  ],
  headphones: [
    {
      product_id: 'MS004',
      title: 'Sony WH-1000XM5 Noise Cancelling Headphones',
      price: 24499,
      original_price: 34990,
      stars: 4.4,
      total_reviews: 8765,
      images: [productImages.headphones],
      url: buildMeeshoUrl('MS004'),
      shipping: '5-7 days',
    },
    {
      product_id: 'MS005',
      title: 'Apple AirPods Pro 2nd Generation',
      price: 22999,
      original_price: 26900,
      stars: 4.3,
      total_reviews: 12345,
      images: [productImages.headphones],
      url: buildMeeshoUrl('MS005'),
      shipping: '4-5 days',
    },
  ],
  laptop: [
    {
      product_id: 'MS006',
      title: 'MacBook Air M3 15-inch 8GB 256GB',
      price: 128999,
      original_price: 144900,
      stars: 4.5,
      total_reviews: 2345,
      images: [productImages.laptop],
      url: buildMeeshoUrl('MS006'),
      shipping: '5-7 days',
    },
  ],
  watch: [
    {
      product_id: 'MS007',
      title: 'Apple Watch Series 9 GPS 45mm',
      price: 41999,
      original_price: 49900,
      stars: 4.2,
      total_reviews: 4567,
      images: [productImages.watch],
      url: buildMeeshoUrl('MS007'),
      shipping: '4-6 days',
    },
  ],
};

// Search keywords mapping
export const searchKeywords: Record<string, string[]> = {
  iphone: ['iphone', 'apple phone', 'iphone 15', 'iphone pro', 'apple mobile'],
  samsung: ['samsung', 'galaxy', 's24', 'samsung phone', 'galaxy ultra'],
  headphones: ['headphones', 'earphones', 'earbuds', 'airpods', 'sony', 'wireless headphones', 'bluetooth headphones'],
  laptop: ['laptop', 'macbook', 'notebook', 'computer', 'mac'],
  watch: ['watch', 'smartwatch', 'apple watch', 'fitness watch', 'smart watch'],
};

export function findMatchingCategory(query: string): string | null {
  const normalizedQuery = query.toLowerCase().trim();

  for (const [category, keywords] of Object.entries(searchKeywords)) {
    if (keywords.some(keyword => normalizedQuery.includes(keyword) || keyword.includes(normalizedQuery))) {
      return category;
    }
  }

  return null;
}
