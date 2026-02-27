// Server-side search utilities using RapidAPI

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

interface AmazonSearchResult {
  asin: string;
  product_title: string;
  product_price?: string;
  product_original_price?: string;
  product_star_rating: string;
  product_num_ratings: string;
  product_url: string;
  product_photo?: string;
  type?: string;
}

interface FlipkartSearchResult {
  productTitle: string;
  productPrice?: string;
  productOriginalPrice?: string;
  productRating?: string;
  productImageUrl?: string;
  productUrl: string;
  productId?: string;
}

/**
 * Search Amazon and Flipkart via RapidAPI
 */
export async function searchAmazonProducts(query: string): Promise<AmazonSearchResult[]> {
  if (!RAPIDAPI_KEY) {
    console.warn('Missing RAPIDAPI_KEY for Amazon search');
    return [];
  }

  try {
    const response = await fetch(
      `https://real-time-amazon-data.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=1&country=IN`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'real-time-amazon-data.p.rapidapi.com',
        },
      }
    );

    if (!response.ok) {
      console.error(`Amazon search failed: ${response.status}`);
      return [];
    }

    const data = await response.json();
    return data.data?.products || [];
  } catch (error) {
    console.error('Amazon search error:', error);
    return [];
  }
}

/**
 * Search Flipkart via RapidAPI
 */
export async function searchFlipkartProducts(query: string): Promise<FlipkartSearchResult[]> {
  if (!RAPIDAPI_KEY) {
    console.warn('Missing RAPIDAPI_KEY for Flipkart search');
    return [];
  }

  try {
    const response = await fetch(
      `https://real-time-flipkart-data.p.rapidapi.com/search?q=${encodeURIComponent(query)}&page=1`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'real-time-flipkart-data.p.rapidapi.com',
        },
      }
    );

    if (!response.ok) {
      console.error(`Flipkart search failed: ${response.status}`);
      return [];
    }

    const data = await response.json();
    return data.data?.products || [];
  } catch (error) {
    console.error('Flipkart search error:', error);
    return [];
  }
}
