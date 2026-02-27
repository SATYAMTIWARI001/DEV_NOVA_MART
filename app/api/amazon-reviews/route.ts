import { NextRequest, NextResponse } from 'next/server';

// proxy that delegates to backend/amazon.ts utilities
import { fetchAmazonReviewsRemote } from '@/backend';
// Expects query parameters `asin` and optional `country` (default US).
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const asin = searchParams.get('asin');
  const country = searchParams.get('country') || 'US';

  if (!asin) {
    return NextResponse.json({ error: 'asin query parameter is required' }, { status: 400 });
  }

  try {
    const data = await fetchAmazonReviewsRemote(asin, country);
    return NextResponse.json(data);
  } catch (err) {
    console.error('Error fetching Amazon reviews', err);
    return NextResponse.json({ error: 'Failed to fetch from Amazon API' }, { status: 500 });
  }
}
