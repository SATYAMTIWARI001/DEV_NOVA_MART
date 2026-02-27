'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, UserState, WishlistItem, CartItem, PriceAlert, Platform } from '@/lib/types';

// Action types
type Action =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'ADD_TO_WISHLIST'; payload: WishlistItem }
  | { type: 'REMOVE_FROM_WISHLIST'; payload: string }
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_CART_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'ADD_PRICE_ALERT'; payload: PriceAlert }
  | { type: 'REMOVE_PRICE_ALERT'; payload: string }
  | { type: 'TRIGGER_PRICE_ALERT'; payload: string }
  | { type: 'ADD_RECENT_SEARCH'; payload: string }
  | { type: 'CLEAR_RECENT_SEARCHES' }
  | { type: 'LOAD_STATE'; payload: UserState };

const initialState: UserState = {
  user: null,
  wishlist: [],
  cart: [],
  priceAlerts: [],
  recentSearches: [],
};

// Reducer
function userReducer(state: UserState, action: Action): UserState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload };
    
    case 'LOGOUT':
      return { ...initialState };
    
    case 'UPDATE_USER':
      return state.user 
        ? { ...state, user: { ...state.user, ...action.payload } }
        : state;
    
    case 'ADD_TO_WISHLIST':
      if (state.wishlist.some(item => item.productId === action.payload.productId)) {
        return state;
      }
      return { ...state, wishlist: [...state.wishlist, action.payload] };
    
    case 'REMOVE_FROM_WISHLIST':
      return {
        ...state,
        wishlist: state.wishlist.filter(item => item.productId !== action.payload),
      };
    
    case 'ADD_TO_CART':
      const existingCartItem = state.cart.find(item => item.productId === action.payload.productId);
      if (existingCartItem) {
        return {
          ...state,
          cart: state.cart.map(item =>
            item.productId === action.payload.productId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return { ...state, cart: [...state.cart, action.payload] };
    
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cart: state.cart.filter(item => item.productId !== action.payload),
      };
    
    case 'UPDATE_CART_QUANTITY':
      return {
        ...state,
        cart: state.cart.map(item =>
          item.productId === action.payload.productId
            ? { ...item, quantity: action.payload.quantity }
            : item
        ).filter(item => item.quantity > 0),
      };
    
    case 'CLEAR_CART':
      return { ...state, cart: [] };
    
    case 'ADD_PRICE_ALERT':
      if (state.priceAlerts.some(alert => alert.productId === action.payload.productId)) {
        return state;
      }
      return { ...state, priceAlerts: [...state.priceAlerts, action.payload] };
    
    case 'REMOVE_PRICE_ALERT':
      return {
        ...state,
        priceAlerts: state.priceAlerts.filter(alert => alert.id !== action.payload),
      };
    
    case 'TRIGGER_PRICE_ALERT':
      return {
        ...state,
        priceAlerts: state.priceAlerts.map(alert =>
          alert.id === action.payload
            ? { ...alert, triggered: true, triggeredAt: new Date().toISOString() }
            : alert
        ),
      };
    
    case 'ADD_RECENT_SEARCH':
      const searches = [
        action.payload,
        ...state.recentSearches.filter(s => s !== action.payload),
      ].slice(0, 10);
      return { ...state, recentSearches: searches };
    
    case 'CLEAR_RECENT_SEARCHES':
      return { ...state, recentSearches: [] };
    
    case 'LOAD_STATE':
      return action.payload;
    
    default:
      return state;
  }
}

// Context
interface UserContextType {
  state: UserState;
  login: (email: string, password: string, name?: string) => boolean;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  addToWishlist: (productId: string, groupId: string, targetPrice?: number) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  addToCart: (productId: string, groupId: string) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
  getCartQuantity: (productId: string) => number;
  addPriceAlert: (alert: Omit<PriceAlert, 'id' | 'createdAt' | 'triggered'>) => void;
  removePriceAlert: (alertId: string) => void;
  hasPriceAlert: (productId: string) => boolean;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const STORAGE_KEY = 'novamart_user_state';

// Provider
export function UserProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(userReducer, initialState);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        dispatch({ type: 'LOAD_STATE', payload: parsed });
      } catch (e) {
        console.error('Failed to load user state:', e);
      }
    }
  }, []);

  // Save state to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const login = (email: string, password: string, name?: string): boolean => {
    // Simple validation
    if (!email || !password) return false;
    
    // Create user (in real app, this would verify with backend)
    const user: User = {
      id: `user-${Date.now()}`,
      name: name || email.split('@')[0],
      email,
      createdAt: new Date().toISOString(),
    };
    
    dispatch({ type: 'LOGIN', payload: user });
    return true;
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (updates: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: updates });
  };

  const addToWishlist = (productId: string, groupId: string, targetPrice?: number) => {
    dispatch({
      type: 'ADD_TO_WISHLIST',
      payload: {
        productId,
        groupId,
        addedAt: new Date().toISOString(),
        targetPrice,
      },
    });
  };

  const removeFromWishlist = (productId: string) => {
    dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: productId });
  };

  const isInWishlist = (productId: string): boolean => {
    return state.wishlist.some(item => item.productId === productId);
  };

  const addToCart = (productId: string, groupId: string) => {
    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        productId,
        groupId,
        quantity: 1,
        addedAt: new Date().toISOString(),
      },
    });
  };

  const removeFromCart = (productId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_CART_QUANTITY', payload: { productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const isInCart = (productId: string): boolean => {
    return state.cart.some(item => item.productId === productId);
  };

  const getCartQuantity = (productId: string): number => {
    const item = state.cart.find(item => item.productId === productId);
    return item?.quantity || 0;
  };

  const addPriceAlert = (alert: Omit<PriceAlert, 'id' | 'createdAt' | 'triggered'>) => {
    dispatch({
      type: 'ADD_PRICE_ALERT',
      payload: {
        ...alert,
        id: `alert-${Date.now()}`,
        createdAt: new Date().toISOString(),
        triggered: false,
      },
    });
  };

  const removePriceAlert = (alertId: string) => {
    dispatch({ type: 'REMOVE_PRICE_ALERT', payload: alertId });
  };

  const hasPriceAlert = (productId: string): boolean => {
    return state.priceAlerts.some(alert => alert.productId === productId);
  };

  const addRecentSearch = (query: string) => {
    dispatch({ type: 'ADD_RECENT_SEARCH', payload: query });
  };

  const clearRecentSearches = () => {
    dispatch({ type: 'CLEAR_RECENT_SEARCHES' });
  };

  return (
    <UserContext.Provider
      value={{
        state,
        login,
        logout,
        updateUser,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        isInCart,
        getCartQuantity,
        addPriceAlert,
        removePriceAlert,
        hasPriceAlert,
        addRecentSearch,
        clearRecentSearches,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
