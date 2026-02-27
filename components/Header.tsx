'use client';

import { useState } from 'react';
import { 
  ShoppingBag, 
  User, 
  Heart, 
  ShoppingCart, 
  Bell, 
  LogOut, 
  ChevronDown,
  Settings,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/lib/UserContext';
import { AuthModal } from '@/components/AuthModal';

interface HeaderProps {
  onOpenCart?: () => void;
  onOpenWishlist?: () => void;
  onOpenAlerts?: () => void;
}

export function Header({ onOpenCart, onOpenWishlist, onOpenAlerts }: HeaderProps) {
  const { state, logout } = useUser();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const cartCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = state.wishlist.length;
  const alertsCount = state.priceAlerts.filter(a => !a.triggered).length;

  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary">
              <ShoppingBag className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">
              Nova<span className="text-primary">Mart</span>
            </span>
          </a>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Wishlist */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onOpenWishlist}
              className="relative"
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Button>

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onOpenCart}
              className="relative"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>

            {/* Price Alerts */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onOpenAlerts}
              className="relative"
            >
              <Bell className="h-5 w-5" />
              {alertsCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                  {alertsCount}
                </span>
              )}
            </Button>

            {/* User Menu */}
            {state.user ? (
              <div className="relative">
                <Button
                  variant="ghost"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2"
                >
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span className="hidden sm:inline text-sm font-medium">
                    {state.user.name}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>

                {showUserMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-card rounded-xl shadow-xl border z-50 animate-slide-up">
                      <div className="p-4 border-b">
                        <p className="font-medium">{state.user.name}</p>
                        <p className="text-sm text-muted-foreground">{state.user.email}</p>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={() => {
                            onOpenWishlist?.();
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-left"
                        >
                          <Heart className="h-4 w-4" />
                          <span>Wishlist</span>
                          {wishlistCount > 0 && (
                            <span className="ml-auto text-xs bg-muted px-2 py-0.5 rounded-full">
                              {wishlistCount}
                            </span>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            onOpenAlerts?.();
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-left"
                        >
                          <Bell className="h-4 w-4" />
                          <span>Price Alerts</span>
                          {alertsCount > 0 && (
                            <span className="ml-auto text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">
                              {alertsCount}
                            </span>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            logout();
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-left text-destructive"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Button onClick={() => setShowAuthModal(true)}>
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}
