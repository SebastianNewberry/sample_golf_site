"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getCart, addToCart, removeFromCart, updateCartItem, emptyCart } from "@/app/actions/cart";

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
  } | null;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  total: number;
  isLoading: boolean;
  isAddingToCart: boolean;
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

  const refreshCart = useCallback(async () => {
    try {
      const result = await getCart();
      if (result.success) {
        setItems(result.items as CartItem[]);
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
    try {
      await removeFromCart(itemId);
      await refreshCart();
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      await updateCartItem(itemId, quantity);
      await refreshCart();
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const clearCartItems = async () => {
    try {
      await emptyCart();
      await refreshCart();
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        total,
        isLoading,
        isAddingToCart,
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

