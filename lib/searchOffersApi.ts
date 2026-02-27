export interface MarketplaceOffer {
  platform: string;
  price: number;
  rating: number;
  deliveryDays: number;
  shippingCost: number;
  url: string;
}

export async function fetchMarketplaceOffers(query: string) {
  const url = `/api/marketplace-search?q=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`marketplace offers fetch failed (${res.status})`);
  }
  return res.json();
}
