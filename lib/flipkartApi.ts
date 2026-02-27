// Frontend helper for calling Flipkart subcategory proxy
export async function fetchFlipkartSubcategories(categoryId: string) {
  const url = `/api/flipkart-subcategories?categoryId=${encodeURIComponent(categoryId)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`flipkart fetch failed (${res.status})`);
  }
  return res.json();
}
