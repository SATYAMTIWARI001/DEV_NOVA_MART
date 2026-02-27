'use client';

import { X, Heart, Trash2, Bell, ShoppingCart, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/lib/UserContext';
import { formatPrice } from '@/lib/scoreEngines';
import { ProductGroup } from '@/lib/types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'wishlist' | 'cart' | 'alerts';
  searchResult?: { groups: ProductGroup[] } | null;
}

export function Sidebar({ isOpen, onClose, type, searchResult }: SidebarProps) {
  const { 
    state, 
    removeFromWishlist, 
    removeFromCart, 
    updateCartQuantity,
    removePriceAlert,
    clearCart 
  } = useUser();

  if (!isOpen) return null;

  const getProductInfo = (productId: string, groupId: string) => {
    if (!searchResult) return null;
    const group = searchResult.groups.find(g => g.groupId === groupId);
    if (!group) return null;
    const product = group.products.find(p => p.id === productId);
    return product ? { product, group } : null;
  };

  const titles = {
    wishlist: 'Wishlist',
    cart: 'Shopping Cart',
    alerts: 'Price Alerts',
  };

  const icons = {
    wishlist: <Heart className="h-5 w-5" />,
    cart: <ShoppingCart className="h-5 w-5" />,
    alerts: <Bell className="h-5 w-5" />,
  };

  const items = {
    wishlist: state.wishlist,
    cart: state.cart,
    alerts: state.priceAlerts,
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-card shadow-xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            {icons[type]}
            <h2 className="text-lg font-semibold">{titles[type]}</h2>
            <span className="text-sm text-muted-foreground">
              ({items[type].length})
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 h-[calc(100vh-140px)]">
          {items[type].length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                {icons[type]}
              </div>
              <h3 className="font-medium mb-1">No items yet</h3>
              <p className="text-sm text-muted-foreground">
                {type === 'wishlist' && 'Save your favorite products here'}
                {type === 'cart' && 'Add products to compare and buy'}
                {type === 'alerts' && 'Set price alerts to get notified'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {type === 'wishlist' && state.wishlist.map(item => {
                const info = getProductInfo(item.productId, item.groupId);
                if (!info) return null;
                
                return (
                  <div key={item.productId} className="flex gap-3 p-3 rounded-xl bg-muted/50 border">
                    <img
                      src={info.product.image}
                      alt={info.product.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-2">{info.product.title}</p>
                      <p className="text-lg font-bold text-primary mt-1">
                        {formatPrice(info.product.price)}
                      </p>
                      <p className="text-xs text-muted-foreground">{info.product.source}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          if (info.product.productUrl) {
                            window.open(info.product.productUrl, '_blank');
                          } else {
                            console.warn('no url for', info.product);
                          }
                        }}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => removeFromWishlist(item.productId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}

              {type === 'cart' && state.cart.map(item => {
                const info = getProductInfo(item.productId, item.groupId);
                if (!info) return null;
                
                return (
                  <div key={item.productId} className="flex gap-3 p-3 rounded-xl bg-muted/50 border">
                    <img
                      src={info.product.image}
                      alt={info.product.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-2">{info.product.title}</p>
                      <p className="text-lg font-bold text-primary mt-1">
                        {formatPrice(info.product.price)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                          className="h-6 w-6 rounded border flex items-center justify-center hover:bg-muted"
                        >
                          -
                        </button>
                        <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                          className="h-6 w-6 rounded border flex items-center justify-center hover:bg-muted"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => removeFromCart(item.productId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}

              {type === 'alerts' && state.priceAlerts.map(alert => (
                <div key={alert.id} className="flex gap-3 p-3 rounded-xl bg-muted/50 border">
                  <img
                    src={alert.productImage}
                    alt={alert.productTitle}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm line-clamp-2">{alert.productTitle}</p>
                    <div className="mt-1">
                      <p className="text-xs text-muted-foreground">
                        Current: {formatPrice(alert.currentPrice)}
                      </p>
                      <p className="text-sm font-medium text-success">
                        Alert at: {formatPrice(alert.targetPrice)}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{alert.platform}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => removePriceAlert(alert.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {type === 'cart' && state.cart.length > 0 && (
          <div className="border-t p-4">
            <div className="flex justify-between mb-4">
              <span className="text-muted-foreground">Total Items</span>
              <span className="font-medium">
                {state.cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={clearCart}>
                Clear Cart
              </Button>
              <Button className="flex-1">
                Checkout
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
