// Frontend helper to fetch product details safely
export async function fetchProductDetails(productUrl: string) {
  try {
    const response = await fetch('/api/productDetails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: productUrl }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(`Error fetching product details: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
