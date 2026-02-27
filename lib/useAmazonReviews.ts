import { useEffect, useState } from 'react';
import { fetchAmazonReviews } from './amazonApi';

export function useAmazonReviews(asin: string | null) {
  const [reviews, setReviews] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!asin) return;
    setLoading(true);
    fetchAmazonReviews(asin)
      .then(data => {
        setReviews(data);
      })
      .catch(e => {
        console.error(e);
        setError((e as Error).message);
      })
      .finally(() => setLoading(false));
  }, [asin]);

  return { reviews, error, loading };
}
