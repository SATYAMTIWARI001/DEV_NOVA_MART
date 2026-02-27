import { NextRequest, NextResponse } from 'next/server';
import { fetchProductDetailsWithCache } from '@/backend/productDetails';

/**
 * Proxy endpoint for fetching product details from RapidAPI.
 * Expects: GET /api/product-details?url={encoded-product-url}
 *
 * Example:
 *   GET /api/product-details?url=https%3A%2F%2Fwww.amazon.in%2Fs%3Fk%3Diphone
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productUrl = searchParams.get('url');

  if (!productUrl) {
    return NextResponse.json(
      { error: 'url query parameter is required' },
      { status: 400 }
    );
  }

  try {
    const data = await fetchProductDetailsWithCache(productUrl);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Product details API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product details' },
      { status: 500 }
    );
  }
}
