// Backend utilities for Amazon-related API calls and business logic.

export async function fetchAmazonReviewsRemote(asin: string, country = 'US') {
  const endpoint = `https://real-time-amazon-data.p.rapidapi.com/top-product-reviews?asin=${encodeURIComponent(
    asin,
  )}&country=${encodeURIComponent(country)}`;

  const res = await fetch(endpoint, {
    method: 'GET',
    headers: {
      'x-rapidapi-key': process.env.RAPIDAPI_KEY || '',
      'x-rapidapi-host': 'real-time-amazon-data.p.rapidapi.com',
    },
  });

  if (!res.ok) {
    throw new Error(`Amazon API error (${res.status})`);
  }

  return res.json();
}
