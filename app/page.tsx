'use client';

import { useState, useCallback } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { ProductComparisonCard } from '@/components/ProductComparisonCard';
import { FilterBar } from '@/components/FilterBar';
import { SearchResultsSkeleton } from '@/components/LoadingSkeleton';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { unifiedSearch, getSearchSuggestions, getTrendingSearches } from '@/lib/searchService';
import { SearchResult, Platform, SortOption, BudgetPreference } from '@/lib/types';
import { useMarketplaceOffers } from '@/lib/useMarketplaceOffers';
import type { MarketplaceOffer } from '@/lib/searchOffersApi';
import { 
  ShoppingBag, 
  Sparkles, 
  TrendingDown, 
  Shield, 
  Zap,
  Target,
  BarChart3,
  Bell,
  Search
} from 'lucide-react';
import { PlatformBadge } from '@/components/PlatformLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUser } from '@/lib/UserContext';

export default function HomePage() {
  const { addRecentSearch, state } = useUser();
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('price-low');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Budget mode
  const [budgetMode, setBudgetMode] = useState(false);
  const [maxBudget, setMaxBudget] = useState('');
  const [budgetPreference, setBudgetPreference] = useState<BudgetPreference>('lowest-price');
  
  // Sidebars
  const [sidebarOpen, setSidebarOpen] = useState<'wishlist' | 'cart' | 'alerts' | null>(null);

  const handleSearch = useCallback(async (query: string) => {
    setIsLoading(true);
    setHasSearched(true);
    addRecentSearch(query);
    
    try {
      const filters = {
        sortBy,
        platforms: selectedPlatforms.length > 0 ? selectedPlatforms : undefined,
        maxPrice: budgetMode && maxBudget ? parseInt(maxBudget, 10) : undefined,
        budgetMode: budgetMode ? budgetPreference : undefined,
      };
      
      const result = await unifiedSearch(query, filters);
      setSearchResult(result);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [sortBy, selectedPlatforms, budgetMode, maxBudget, budgetPreference, addRecentSearch]);

  const handleSortChange = useCallback(async (newSort: SortOption) => {
    setSortBy(newSort);
    if (searchResult) {
      setIsLoading(true);
      try {
        const result = await unifiedSearch(searchResult.query, {
          sortBy: newSort,
          platforms: selectedPlatforms.length > 0 ? selectedPlatforms : undefined,
          maxPrice: budgetMode && maxBudget ? parseInt(maxBudget, 10) : undefined,
          budgetMode: budgetMode ? budgetPreference : undefined,
        });
        setSearchResult(result);
      } finally {
        setIsLoading(false);
      }
    }
  }, [searchResult, selectedPlatforms, budgetMode, maxBudget, budgetPreference]);

  const handlePlatformToggle = useCallback(async (platform: Platform) => {
    const newPlatforms = selectedPlatforms.includes(platform)
      ? selectedPlatforms.filter(p => p !== platform)
      : [...selectedPlatforms, platform];
    
    setSelectedPlatforms(newPlatforms);
    
    if (searchResult) {
      setIsLoading(true);
      try {
        const result = await unifiedSearch(searchResult.query, {
          sortBy,
          platforms: newPlatforms.length > 0 ? newPlatforms : undefined,
          maxPrice: budgetMode && maxBudget ? parseInt(maxBudget, 10) : undefined,
          budgetMode: budgetMode ? budgetPreference : undefined,
        });
        setSearchResult(result);
      } finally {
        setIsLoading(false);
      }
    }
  }, [searchResult, selectedPlatforms, sortBy, budgetMode, maxBudget, budgetPreference]);

  // fetch additional marketplace links whenever the user searches
  const { offers: marketplaceOffers, loading: offersLoading } = useMarketplaceOffers(
    hasSearched ? searchResult?.query || '' : null
  );



  return (
    <div className="min-h-screen bg-background">
      <Header
        onOpenWishlist={() => setSidebarOpen('wishlist')}
        onOpenCart={() => setSidebarOpen('cart')}
        onOpenAlerts={() => setSidebarOpen('alerts')}
      />

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b bg-gradient-hero">
          {/* background video (autoplay, muted, loop) */}
          <video
            className="absolute inset-0 w-full h-full object-cover"
            src="/background.mp4"
            autoPlay
            muted
            loop
            playsInline
          />
          
          <div className="container relative py-12 md:py-16">
            <div className="flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto">
              {/* Logo & Title */}
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-primary shadow-glow">
                  <ShoppingBag className="h-8 w-8 text-primary-foreground" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  Price<span className="text-primary">Compare</span>
                </h1>
              </div>

              <p className="text-lg text-muted-foreground max-w-xl">
                Find the best deals across Amazon, Flipkart, and Meesho. 
                Compare prices, reviews, and delivery times instantly.
              </p>

              {/* Platform Badges */}
              <div className="flex items-center gap-2">
                <PlatformBadge platform="Amazon" />
                <PlatformBadge platform="Flipkart" />
                <PlatformBadge platform="Meesho" />
              </div>

              {/* Search Bar */}
              <SearchBar
                onSearch={handleSearch}
                suggestions={[...getSearchSuggestions(), ...(state.recentSearches.slice(0, 3))]}
                isLoading={isLoading}
                className="w-full mt-4"
              />

              {/* Budget Mode Toggle */}
              <div className="w-full max-w-xl">
                <button
                  onClick={() => setBudgetMode(!budgetMode)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                    budgetMode 
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-muted border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Target className="h-4 w-4" />
                  <span className="text-sm font-medium">Smart Budget Mode</span>
                </button>
                
                {budgetMode && (
                  <div className="mt-4 p-4 rounded-xl bg-card border shadow-sm animate-slide-up">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Max Budget</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                          <Input
                            type="number"
                            value={maxBudget}
                            onChange={(e) => setMaxBudget(e.target.value)}
                            placeholder="50000"
                            className="pl-8"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Optimize For</label>
                        <div className="flex gap-2">
                          {(['lowest-price', 'best-value', 'best-rating'] as const).map(pref => (
                            <button
                              key={pref}
                              onClick={() => setBudgetPreference(pref)}
                              className={`flex-1 px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                                budgetPreference === pref
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted hover:bg-muted/80'
                              }`}
                            >
                              {pref === 'lowest-price' && 'Price'}
                              {pref === 'best-value' && 'Value'}
                              {pref === 'best-rating' && 'Rating'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Feature Pills */}
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                {[
                  { icon: Zap, text: 'Instant Compare' },
                  { icon: TrendingDown, text: 'Best Prices' },
                  { icon: Shield, text: 'Trust Scores' },
                  { icon: BarChart3, text: 'Price History' },
                  { icon: Bell, text: 'Price Alerts' },
                  { icon: Sparkles, text: 'Value Scores' },
                ].map(({ icon: Icon, text }) => (
                  <div
                    key={text}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/80 text-sm text-muted-foreground border"
                  >
                    <Icon className="h-4 w-4" />
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Results Section */}
        <section className="container py-8">
          {isLoading && hasSearched ? (
            <SearchResultsSkeleton />
          ) : searchResult && searchResult.groups.length > 0 ? (
            <div className="space-y-6">
              <FilterBar
                sortBy={sortBy}
                onSortChange={handleSortChange}
                selectedPlatforms={selectedPlatforms}
                onPlatformToggle={handlePlatformToggle}
                totalResults={searchResult.totalResults}
              />

              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {searchResult.groups.map((group) => (
                  <ProductComparisonCard key={group.groupId} group={group} />
                ))}
              </div>
            </div>
          ) : hasSearched && !isLoading ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Try searching for popular products like &quot;iPhone&quot;, &quot;Samsung&quot;, 
                &quot;Headphones&quot;, &quot;Laptop&quot;, or &quot;Watch&quot;
              </p>
            </div>
          ) : (
            /* Initial State */
            <div className="py-8 space-y-12">
              {/* Trending Searches */}
              <div>
                <h2 className="text-2xl font-semibold text-center mb-6">
                  Trending Searches
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
                  {getTrendingSearches().map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSearch(suggestion)}
                      className="p-4 rounded-2xl bg-card border shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-200 text-center"
                    >
                      <span className="font-medium text-sm">{suggestion}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-semibold text-center mb-6">
                  Why Choose NovaMart?
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    {
                      icon: TrendingDown,
                      title: 'Best Prices',
                      description: 'Compare prices across Amazon, Flipkart, and Meesho to find the lowest price.',
                    },
                    {
                      icon: Sparkles,
                      title: 'AI Value Score',
                      description: 'Our algorithm calculates the best value based on price, rating, and reviews.',
                    },
                    {
                      icon: BarChart3,
                      title: 'Price History',
                      description: 'View 3-month price trends to know if you\'re getting a good deal.',
                    },
                    {
                      icon: Shield,
                      title: 'Trust Scores',
                      description: 'Seller trust scores help you avoid suspicious listings.',
                    },
                    {
                      icon: Bell,
                      title: 'Price Alerts',
                      description: 'Set alerts and get notified when prices drop.',
                    },
                    {
                      icon: Zap,
                      title: 'Fastest Delivery',
                      description: 'Compare delivery times and find the quickest option.',
                    },
                  ].map(({ icon: Icon, title, description }) => (
                    <div key={title} className="p-6 rounded-2xl bg-card border">
                      <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-2">{title}</h3>
                      <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* marketplace search links */}
        {hasSearched && (
          <section className="container py-8">
            <h2 className="text-xl font-semibold mb-4">Quick search on other sites</h2>
            {offersLoading && <p>Loading links…</p>}
            {marketplaceOffers && (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {marketplaceOffers.map((o: MarketplaceOffer) => (
                  <li key={o.platform} className="border p-4 rounded">
                    <a
                      href={o.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline"
                    >
                      {o.platform}
                    </a>
                    <div className="text-sm text-muted-foreground">
                      Price: ₹{o.price} | Rating: {o.rating} | Delivery: {o.deliveryDays}d
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {/* Footer */}
        <footer className="border-t bg-muted/30">
          <div className="container py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                <span className="font-semibold">NovaMart</span>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Compare prices across Amazon, Flipkart & Meesho. Find the best deals instantly.
              </p>
              <div className="flex gap-2">
                <PlatformBadge platform="Amazon" />
                <PlatformBadge platform="Flipkart" />
                <PlatformBadge platform="Meesho" />
              </div>
            </div>
          </div>
        </footer>
      </main>

      {/* Sidebars */}
      <Sidebar
        isOpen={sidebarOpen === 'wishlist'}
        onClose={() => setSidebarOpen(null)}
        type="wishlist"
        searchResult={searchResult}
      />
      <Sidebar
        isOpen={sidebarOpen === 'cart'}
        onClose={() => setSidebarOpen(null)}
        type="cart"
        searchResult={searchResult}
      />
      <Sidebar
        isOpen={sidebarOpen === 'alerts'}
        onClose={() => setSidebarOpen(null)}
        type="alerts"
        searchResult={searchResult}
      />
    </div>
  );
}
