'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  ExternalLink,
  Star,
  TrendingDown,
  TrendingUp,
  Truck,
  Heart,
  ShoppingCart,
  Bell,
  ChevronDown,
  ChevronUp,
  Shield,
  Zap,
  AlertTriangle,
  Award,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { PlatformLogo } from '@/components/PlatformLogo';
import { PriceChart } from '@/components/PriceChart';
import { ReviewsSection } from '@/components/ReviewsSection';
import { PriceAlertModal } from '@/components/PriceAlertModal';
import { cn } from '@/lib/utils';
import { ProductGroup, NormalizedProduct } from '@/lib/types';
import { formatPrice, getValueTagColor, getTrustTagColor } from '@/lib/scoreEngines';
import { useUser } from '@/lib/UserContext';

interface ProductComparisonCardProps {
  group: ProductGroup;
  className?: string;
}

function PriceRow({
  product,
  groupId,
  isCheapest,
  isCostliest,
  isBestValue,
  isFastest,
  isTopRated
}: {
  product: NormalizedProduct;
  groupId: string;
  isCheapest: boolean;
  isCostliest: boolean;
  isBestValue: boolean;
  isFastest: boolean;
  isTopRated: boolean;
}) {
  const { addToWishlist, removeFromWishlist, isInWishlist, addToCart, isInCart, state } = useUser();
  const [showAlertModal, setShowAlertModal] = useState(false);

  const isWishlisted = isInWishlist(product.id);
  const inCart = isInCart(product.id);

  const platformBgClass = {
    Amazon: 'bg-amazon-bg border-amazon/30',
    Flipkart: 'bg-flipkart-bg border-flipkart/30',
    Meesho: 'bg-meesho-bg border-meesho/30',
  }[product.source];

  return (
    <>
      <div
        className={cn(
          'relative p-4 rounded-xl border-2 transition-all duration-200',
          platformBgClass,
          isCheapest && 'ring-2 ring-success ring-offset-2',
          product.isSuspicious && 'ring-2 ring-destructive ring-offset-2'
        )}
      >
        {/* Tags Row */}
        <div className="absolute -top-2 left-2 right-2 flex flex-wrap gap-1 justify-end">
          {isCheapest && (
            <Badge variant="bestDeal" className="shadow-md text-xs">
              <TrendingDown className="h-3 w-3 mr-1" />
              Best Deal
            </Badge>
          )}
          {isBestValue && !isCheapest && (
            <Badge className="bg-info text-info-foreground shadow-md text-xs">
              <Award className="h-3 w-3 mr-1" />
              Best Value
            </Badge>
          )}
          {isFastest && (
            <Badge className="bg-primary text-primary-foreground shadow-md text-xs">
              <Zap className="h-3 w-3 mr-1" />
              Fastest
            </Badge>
          )}
          {isTopRated && !isCheapest && !isBestValue && (
            <Badge className="bg-warning text-warning-foreground shadow-md text-xs">
              <Star className="h-3 w-3 mr-1" />
              Top Rated
            </Badge>
          )}
          {product.priceHistory?.priceDropAmount && product.priceHistory.priceDropAmount > 0 && (
            <Badge className="bg-success/80 text-success-foreground shadow-md text-xs animate-price-drop">
              <TrendingDown className="h-3 w-3 mr-1" />
              Price Drop!
            </Badge>
          )}
          {product.isSuspicious && (
            <Badge variant="destructive" className="shadow-md text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Suspicious
            </Badge>
          )}
        </div>

        <div className="flex items-start gap-4 mt-2">
          {/* Platform & Price */}
          <div className="flex items-center gap-3 flex-1">
            <PlatformLogo platform={product.source} size="md" />
            <div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className={cn(
                  'text-xl font-bold',
                  isCheapest ? 'text-success' : 'text-foreground'
                )}>
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                {product.discountPercentage > 0 && (
                  <span className="text-xs font-medium text-success">
                    {product.discountPercentage}% off
                  </span>
                )}
                <Badge className={cn('text-xs', getValueTagColor(product.valueTag))}>
                  {product.valueTag}
                </Badge>
              </div>
            </div>
          </div>

          {/* Rating & Delivery */}
          <div className="flex flex-col items-end gap-1 text-right">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-warning text-warning" />
              <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">
                ({product.reviewCount.toLocaleString()})
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Truck className="h-3 w-3" />
              {product.deliveryTime}
            </div>
            <Badge className={cn('text-xs mt-1', getTrustTagColor(product.trustTag))}>
              <Shield className="h-3 w-3 mr-1" />
              {product.trustTag}
            </Badge>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (isWishlisted) {
                removeFromWishlist(product.id);
              } else {
                addToWishlist(product.id, groupId);
              }
            }}
            className={cn(
              'h-8 px-2',
              isWishlisted && 'text-destructive'
            )}
          >
            <Heart className={cn('h-4 w-4', isWishlisted && 'fill-current')} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => addToCart(product.id, groupId)}
            className={cn(
              'h-8 px-2',
              inCart && 'text-primary'
            )}
          >
            <ShoppingCart className={cn('h-4 w-4', inCart && 'fill-current')} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAlertModal(true)}
            className="h-8 px-2"
          >
            <Bell className="h-4 w-4" />
          </Button>

          {/* log/validate link before rendering */}
          {console.log('product link', product.id, product.productUrl)}
          {product.productUrl ? (
            <a
              href={product.productUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                if (!/^https?:\/\/.+/.test(product.productUrl)) {
                  console.warn('unexpected URL format', product.productUrl);
                }
              }}
              className={cn(
                buttonVariants({
                  variant: product.source === 'Amazon' ? 'amazon' : product.source === 'Flipkart' ? 'flipkart' : 'meesho',
                  size: 'sm',
                }),
                "ml-auto"
              )}
            >
              Visit Store
              <ExternalLink className="h-3 w-3 ml-1.5" />
            </a>
          ) : (
            <span className="ml-auto text-xs text-red-500">No link available</span>
          )}
        </div>
      </div>

      <PriceAlertModal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        product={product}
        groupId={groupId}
      />
    </>
  );
}

export function ProductComparisonCard({ group, className }: ProductComparisonCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'prices' | 'chart' | 'reviews'>('prices');

  const savingsAmount = group.priceDifference;
  const savingsPercentage = group.percentageDifference;

  return (
    <Card className={cn('overflow-hidden animate-scale-in', className)}>
      <CardHeader className="p-4 pb-0">
        <div className="flex gap-4">
          {/* Product Image */}
          <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-muted shrink-0">
            <Image
              src={group.image}
              alt={group.title}
              fill
              className="object-cover"
              sizes="112px"
            />
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-base leading-tight line-clamp-2">
                {group.title}
              </h3>
              <Badge variant="secondary" className="shrink-0 text-xs">
                {group.category}
              </Badge>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-warning text-warning" />
                <span className="text-sm font-medium">{group.averageRating.toFixed(1)}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                Avg across {group.products.length} platforms
              </span>
            </div>

            {/* Savings Highlight */}
            {savingsAmount > 0 && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success/10 border border-success/20 mt-2">
                <TrendingDown className="h-4 w-4 text-success" />
                <span className="text-sm font-medium text-success">
                  Save up to {formatPrice(savingsAmount)} ({savingsPercentage}%)
                </span>
              </div>
            )}

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-2 mt-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Zap className="h-3 w-3" />
                Fastest: {group.fastestDelivery.deliveryDays} days ({group.fastestDelivery.source})
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-muted rounded-lg mb-4">
          {(['prices', 'chart', 'reviews'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                activeTab === tab
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab === 'prices' && 'Compare Prices'}
              {tab === 'chart' && (
                <span className="flex items-center justify-center gap-1">
                  <BarChart3 className="h-3 w-3" />
                  Price History
                </span>
              )}
              {tab === 'reviews' && 'Reviews'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'prices' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-muted-foreground">
                Compare prices from {group.products.length} platforms
              </h4>
              <div className="flex gap-1">
                {group.products.map(p => (
                  <PlatformLogo key={p.id} platform={p.source} size="sm" />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {group.products.slice(0, isExpanded ? undefined : 3).map((product) => (
                <PriceRow
                  key={product.id}
                  product={product}
                  groupId={group.groupId}
                  isCheapest={product.id === group.cheapest.id}
                  isCostliest={product.id === group.costliest.id && group.products.length > 1}
                  isBestValue={product.id === group.bestValue.id}
                  isFastest={product.id === group.fastestDelivery.id}
                  isTopRated={product.id === group.topRated.id}
                />
              ))}
            </div>

            {group.products.length > 3 && (
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-2" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-2" />
                    Show {group.products.length - 3} More
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        {activeTab === 'chart' && (
          <div className="py-2">
            <PriceChart
              priceHistory={group.combinedPriceHistory}
              height={180}
            />
          </div>
        )}

        {activeTab === 'reviews' && (
          <ReviewsSection
            reviews={group.cheapest.reviews}
            rating={group.averageRating}
            reviewCount={group.products.reduce((sum, p) => sum + p.reviewCount, 0)}
          />
        )}
      </CardContent>
    </Card>
  );
}
