// Backend utility for the "Realtime Flipkart Amazon Myntra Ajio Croma Product Details" API
// This endpoint takes a product URL and returns detailed product information

export async function fetchProductDetailsRemote(productUrl: string) {
  const endpoint = `https://realtime-flipkart-amazon-myntra-ajio-croma-product-details.p.rapidapi.com/product?url=${encodeURIComponent(
    productUrl,
  )}`;

  const res = await fetch(endpoint, {
    method: 'GET',
    headers: {
      'x-rapidapi-key': process.env.RAPIDAPI_KEY || '',
      'x-rapidapi-host':
        'realtime-flipkart-amazon-myntra-ajio-croma-product-details.p.rapidapi.com',
    },
  });

  if (!res.ok) {
    throw new Error(`Product Details API error (${res.status})`);
  }

  return res.json();
}

// Cache responses to avoid hitting rate limits
const detailsCache = new Map<
  string,
  {
    data: any;
    timestamp: number;
  }
>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function fetchProductDetailsWithCache(productUrl: string) {
  // Check cache first
  const cached = detailsCache.get(productUrl);
  if (
    cached &&
    Date.now() - cached.timestamp < CACHE_TTL
  ) {
    console.log('Returning cached product details for:', productUrl);
    return cached.data;
  }

  // Fetch fresh data
  const data = await fetchProductDetailsRemote(productUrl);

  // Cache it
  detailsCache.set(productUrl, { data, timestamp: Date.now() });

  return data;
}
