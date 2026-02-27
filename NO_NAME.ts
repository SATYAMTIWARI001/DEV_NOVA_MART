'use client';

import { useState } from 'react';
import { fetchProductDetails } from '@/lib/productDetailsApi';


export function ProductDetailsPanel() {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetDetails = async (productUrl: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProductDetails(productUrl);
      console.log('Product details:', data);
      setDetails(data);
    } catch (err) {
      console.error('Failed to fetch details:', err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded">
      <h2>Product Details Fetcher</h2>
      
      <button 
        onClick={() => handleGetDetails('https://www.amazon.in/s?k=iphone')}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        {loading ? 'Loading...' : 'Fetch iPhone Details'}
      </button>

      {error && <p className="text-red-500">{error}</p>}
      
      {details && (
        <pre className="mt-4 p-4 bg-gray-100 rounded overflow-auto">
          {JSON.stringify(details, null, 2)}
        </pre>
      )}
    </div>
  );
}