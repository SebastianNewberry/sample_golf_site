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

interface CartItem {
  id: string;
  cartId: string;
  programId: string;
  programSessionId: string | null;
  registrationType: string;
  quantity: number;
  priceAtAdd: string;
  createdAt: Date;
  program: {
    id: string;
    name: string;
    description: string;
    type: string;
    price: string;
    duration: string;
    imageUrl: string | null;
  } | null;
  session: {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
    schedule: unknown;
  } | null;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  total: number;
  isLoading: boolean;
  isAddingToCart: boolean;
  cartAnimationTrigger: number;
  addItem: (data: {
    programId: string;
    programSessionId?: string;
    registrationType: "adult" | "junior";
    price: number;
  }) => Promise<{ success: boolean; message?: string; error?: string }>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [itemCount, setItemCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartAnimationTrigger, setCartAnimationTrigger] = useState(0);

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
        (sum, i) => sum + parseFloat(i.priceAtAdd) * i.quantity,
        0
      );
      // Batch state updates using React 18 automatic batching
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
      // If quantity is 0 or negative, remove the item
      await removeItem(itemId);
      return;
    }

    // Optimistic update: update local state immediately
    setItems((prevItems) => {
      const newItems = prevItems.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      );
      // Recalculate totals
      const newItemCount = newItems.reduce((sum, i) => sum + i.quantity, 0);
      const newTotal = newItems.reduce(
        (sum, i) => sum + parseFloat(i.priceAtAdd) * i.quantity,
        0
      );
      // Batch state updates using React 18 automatic batching
      setItemCount(newItemCount);
      setTotal(newTotal);
      return newItems;
    });

    // Sync with database in the background (fire and forget)
    updateCartItem(itemId, quantity).catch((error) => {
      console.error("Error updating quantity:", error);
      // If database update fails, refresh cart to get correct state
      refreshCart();
    });
  };

  const clearCartItems = useCallback(async () => {
    try {
      await emptyCart();
      await refreshCart();
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  }, [refreshCart]);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        total,
        isLoading,
        isAddingToCart,
        cartAnimationTrigger,
        addItem,
        removeItem,
        updateQuantity,
        clearCart: clearCartItems,
        refreshCart,
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
