// frontend helper to call our /api proxy
export async function fetchAmazonReviews(asin: string, country = 'US') {
  const url = `/api/amazon-reviews?asin=${encodeURIComponent(asin)}&country=${encodeURIComponent(
    country,
  )}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`amazon reviews fetch failed (${res.status})`);
  }
  return res.json();
}
