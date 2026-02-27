import { useEffect, useState } from 'react';
import { fetchFlipkartSubcategories } from './flipkartApi';

export function useFlipkartSubcategories(categoryId: string | null) {
  const [data, setData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!categoryId) return;
    setLoading(true);
    fetchFlipkartSubcategories(categoryId)
      .then(r => setData(r))
      .catch(e => {
        console.error(e);
        setError((e as Error).message);
      })
      .finally(() => setLoading(false));
  }, [categoryId]);

  return { data, error, loading };
}
