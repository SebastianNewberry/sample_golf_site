"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItem,
  emptyCart,
} from "@/app/actions/cart";
import { cartItemLineTotal, parseCartMetadata } from "@/lib/pricing-options";

export interface AppliedDiscount {
  type: "gift_card" | "promo";
  discountId: string;
  code: string;
  discountType: string;
  discountValue: number;
  balance?: number;
}

interface CartItem {
  id: string;
  cartId: string;
  programId: string;
  programSessionId: string | null;
  registrationType: "adult" | "junior";
  quantity: number;
  priceAtAdd: string;
  metadata: string | null;
  createdAt: Date;
  program: {
    id: string;
    name: string;
    description: string;
    type: string;
    price: string;
    duration: string;
    imageUrl: string | null;
    schedulingType?: string | null;
    pricingOptions?: unknown;
  } | null;
  session: {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
    schedule: unknown;
    capacity: number;
    enrolledCount: number;
  } | null;
  availability?: {
    isAvailable: boolean;
    error?: string;
  };
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  total: number;
  discountAmount: number;
  finalTotal: number;
  isLoading: boolean;
  isAddingToCart: boolean;
  cartAnimationTrigger: number;
  addItem: (data: {
    programId: string;
    programSessionId?: string;
    registrationType: "adult" | "junior";
    price: number;
    metadata?: string;
    quantity?: number;
  }) => Promise<{ success: boolean; message?: string; error?: string }>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  appliedDiscount: AppliedDiscount | null;
  setAppliedDiscount: React.Dispatch<React.SetStateAction<AppliedDiscount | null>>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [itemCount, setItemCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartAnimationTrigger, setCartAnimationTrigger] = useState(0);
  const [appliedDiscount, setAppliedDiscount] = useState<AppliedDiscount | null>(null);

  const refreshCart = useCallback(async () => {
    try {
      const result = await getCart();
      if (result.success) {
        // Sort items by createdAt to ensure consistent order (first added = first displayed)
        const sortedItems = (result.items as CartItem[]).sort((a, b) => {
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        });
        setItems(sortedItems);
        setItemCount(result.itemCount);
        setTotal(result.total);
      }
    } catch (error) {
      console.error("Error refreshing cart:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addItem = async (data: {
    programId: string;
    programSessionId?: string;
    registrationType: "adult" | "junior";
    price: number;
    metadata?: string;
    quantity?: number;
  }) => {
    setIsAddingToCart(true);
    try {
      const result = await addToCart(data);
      if (result.success) {
        await refreshCart();
        // Trigger animation when item is successfully added
        setCartAnimationTrigger((prev) => prev + 1);
        return { success: true, message: result.message };
      }
      return { success: false, error: result.error };
    } catch (error) {
      console.error("Error adding to cart:", error);
      return { success: false, error: "Failed to add to cart" };
    } finally {
      setIsAddingToCart(false);
    }
  };

  const removeItem = async (itemId: string) => {
    // Optimistic update: remove item from local state immediately
    setItems((prevItems) => {
      const newItems = prevItems.filter((item) => item.id !== itemId);
      // Recalculate totals
      const newItemCount = newItems.reduce((sum, i) => sum + i.quantity, 0);
      const newTotal = newItems.reduce(
        (sum, i) => sum + cartItemLineTotal(i),
        0,
      );
      setItemCount(newItemCount);
      setTotal(newTotal);
      return newItems;
    });

    // Sync with database in the background (fire and forget)
    removeFromCart(itemId).catch((error) => {
      console.error("Error removing item:", error);
      // If database update fails, refresh cart to get correct state
      refreshCart();
    });
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(itemId);
      return;
    }

    const existing = items.find((item) => item.id === itemId);
    const isOnCourse = Boolean(
      parseCartMetadata(existing?.metadata).isOnCourse,
    );

    if (isOnCourse) {
      await updateCartItem(itemId, quantity);
      await refreshCart();
      return;
    }

    setItems((prevItems) => {
      const newItems = prevItems.map((item) =>
        item.id === itemId ? { ...item, quantity } : item,
      );
      const newItemCount = newItems.reduce((sum, i) => sum + i.quantity, 0);
      const newTotal = newItems.reduce(
        (sum, i) => sum + cartItemLineTotal(i),
        0,
      );
      setItemCount(newItemCount);
      setTotal(newTotal);
      return newItems;
    });

    updateCartItem(itemId, quantity).catch((error) => {
      console.error("Error updating quantity:", error);
      refreshCart();
    });
  };

  const clearCartItems = useCallback(async () => {
    // Clear local state immediately so the badge never lingers after checkout.
    setItems([]);
    setItemCount(0);
    setTotal(0);
    setAppliedDiscount(null);
    try {
      await emptyCart();
      await refreshCart();
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  }, [refreshCart]);

  // Calculate discount amount
  const discountAmount = React.useMemo(() => {
    if (!appliedDiscount) return 0;
    if (appliedDiscount.discountType === "percentage") {
      return Math.min(total, (total * appliedDiscount.discountValue) / 100);
    }
    // Fixed amount or gift card balance
    return Math.min(total, appliedDiscount.discountValue);
  }, [appliedDiscount, total]);

  const finalTotal = Math.max(0, total - discountAmount);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        total,
        discountAmount,
        finalTotal,
        isLoading,
        isAddingToCart,
        cartAnimationTrigger,
        addItem,
        removeItem,
        updateQuantity,
        clearCart: clearCartItems,
        refreshCart,
        appliedDiscount,
        setAppliedDiscount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
