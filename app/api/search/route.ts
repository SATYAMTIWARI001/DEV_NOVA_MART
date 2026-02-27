import { NextRequest, NextResponse } from 'next/server';
import { searchAmazonProducts, searchFlipkartProducts } from '@/backend/search';

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get('q');

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query parameter required' },
        { status: 400 }
      );
    }

    // Fetch from both platforms in parallel
    const [amazonResults, flipkartResults] = await Promise.allSettled([
      searchAmazonProducts(query),
      searchFlipkartProducts(query),
    ]);

    const amazonProducts = amazonResults.status === 'fulfilled' ? amazonResults.value : [];
    const flipkartProducts = flipkartResults.status === 'fulfilled' ? flipkartResults.value : [];

    return NextResponse.json({
      query,
      amazon: amazonProducts,
      flipkart: flipkartProducts,
      totalResults: amazonProducts.length + flipkartProducts.length,
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
