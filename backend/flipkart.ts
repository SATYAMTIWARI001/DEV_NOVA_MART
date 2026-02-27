// Backend utilities for Flipkart-related API calls

export async function fetchFlipkartSubcategoriesRemote(categoryId: string) {
  const endpoint = `https://real-time-flipkart-data2.p.rapidapi.com/sub-categories?categoryId=${encodeURIComponent(
    categoryId,
  )}`;

  const res = await fetch(endpoint, {
    method: 'GET',
    headers: {
      'x-rapidapi-key': process.env.RAPIDAPI_KEY || '',
      'x-rapidapi-host': 'real-time-flipkart-data2.p.rapidapi.com',
    },
  });

  if (!res.ok) {
    throw new Error(`Flipkart API error (${res.status})`);
  }

  return res.json();
}
