import { NextRequest, NextResponse } from 'next/server';

// Proxy for Flipkart RapidAPI endpoint, now using backend helper
import { fetchFlipkartSubcategoriesRemote } from '@/backend';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('categoryId');

  if (!categoryId) {
    return NextResponse.json({ error: 'categoryId query parameter required' }, { status: 400 });
  }

  try {
    const data = await fetchFlipkartSubcategoriesRemote(categoryId);
    return NextResponse.json(data);
  } catch (err) {
    console.error('Flipkart API error', err);
    return NextResponse.json({ error: 'failed to fetch from Flipkart API' }, { status: 500 });
  }
}
