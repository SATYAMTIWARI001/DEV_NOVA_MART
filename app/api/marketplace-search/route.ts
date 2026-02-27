import { NextRequest, NextResponse } from 'next/server';
import { generateMarketplaceData } from '@/lib/marketplaceSearch';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  if (!q) {
    return NextResponse.json({ error: 'query (q) parameter required' }, { status: 400 });
  }

  const offers = await generateMarketplaceData(q);
  return NextResponse.json({ query: q, offers });
}
