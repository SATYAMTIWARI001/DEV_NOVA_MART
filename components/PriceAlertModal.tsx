'use client';

import { useState } from 'react';
import { X, Bell, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUser } from '@/lib/UserContext';
import { NormalizedProduct, Platform } from '@/lib/types';
import { formatPrice } from '@/lib/scoreEngines';

interface PriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: NormalizedProduct;
  groupId: string;
}

export function PriceAlertModal({ isOpen, onClose, product, groupId }: PriceAlertModalProps) {
  const { state, addPriceAlert, hasPriceAlert } = useUser();
  const [targetPrice, setTargetPrice] = useState(Math.floor(product.price * 0.9).toString());

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const price = parseInt(targetPrice, 10);
    if (isNaN(price) || price <= 0) return;

    addPriceAlert({
      productId: product.id,
      groupId,
      productTitle: product.title,
      productImage: product.image,
      platform: product.source,
      currentPrice: product.price,
      targetPrice: price,
    });

    onClose();
  };

  const alreadyHasAlert = hasPriceAlert(product.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md mx-4 bg-card rounded-2xl shadow-xl animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Set Price Alert</h2>
              <p className="text-sm text-muted-foreground">
                Get notified when price drops
              </p>
            </div>
          </div>

          {/* Product info */}
          <div className="flex gap-3 p-3 rounded-xl bg-muted mb-4">
            <img
              src={product.image}
              alt={product.title}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm line-clamp-2">{product.title}</p>
              <p className="text-lg font-bold text-primary mt-1">
                {formatPrice(product.price)}
              </p>
            </div>
          </div>

          {alreadyHasAlert ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">
                You already have a price alert set for this product.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Alert me when price drops to
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    ₹
                  </span>
                  <Input
                    type="number"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    className="pl-8"
                    min={1}
                    max={product.price - 1}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Current price: {formatPrice(product.price)}
                </p>
              </div>

              {/* Quick options */}
              <div className="flex gap-2">
                {[10, 20, 30].map(percent => {
                  const discountedPrice = Math.floor(product.price * (1 - percent / 100));
                  return (
                    <button
                      key={percent}
                      type="button"
                      onClick={() => setTargetPrice(discountedPrice.toString())}
                      className="flex-1 px-3 py-2 rounded-lg border hover:bg-muted transition-colors text-sm"
                    >
                      <TrendingDown className="h-3 w-3 inline mr-1" />
                      {percent}% off
                    </button>
                  );
                })}
              </div>

              <Button type="submit" className="w-full">
                <Bell className="h-4 w-4 mr-2" />
                Set Alert
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
