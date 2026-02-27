import { useEffect, useState } from 'react';
import { fetchMarketplaceOffers, MarketplaceOffer } from './searchOffersApi';

export function useMarketplaceOffers(query: string | null) {
  const [offers, setOffers] = useState<MarketplaceOffer[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    fetchMarketplaceOffers(query)
      .then(data => setOffers(data.offers || []))
      .catch(e => {
        console.error(e);
        setError((e as Error).message);
      })
      .finally(() => setLoading(false));
  }, [query]);

  return { offers, loading, error };
}
