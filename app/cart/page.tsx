"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/app/components/cart/CartContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, Minus, Plus, ShoppingCart, ArrowRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function CartPage() {
  const { items, total, isLoading, removeItem, updateQuantity, clearCart } = useCart();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-200 rounded-full mb-6">
              <ShoppingCart className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Your Cart is Empty
            </h1>
            <p className="text-gray-600 mb-8">
              Looks like you haven&apos;t added any programs to your cart yet.
              Browse our programs to get started!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/adult-programs/get-golf-ready-level-1">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                  Browse Adult Programs
                </Button>
              </Link>
              <Link href="/junior-programs/beginner-series">
                <Button variant="outline">
                  Browse Junior Programs
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              Shopping Cart
            </h1>
            <Button
              variant="ghost"
              className="text-gray-600 hover:text-red-600"
              onClick={() => clearCart()}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Cart
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    layout
                  >
                    <Card className="p-6 bg-white">
                      <div className="flex gap-4">
                        {/* Program Image Placeholder */}
                        <div className="w-24 h-24 bg-gradient-to-br from-green-600 to-green-800 rounded-lg flex items-center justify-center shrink-0">
                          <span className="text-white text-2xl font-bold">
                            {item.program?.type === "junior" ? "J" : "A"}
                          </span>
                        </div>

                        {/* Program Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-bold text-gray-800 text-lg">
                                {item.program?.name || "Program"}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
                                {item.registrationType === "junior"
                                  ? "Junior Program"
                                  : "Adult Program"}
                              </p>
                              {item.session && (
                                <p className="text-sm text-orange-600 mt-1">
                                  {item.session.name}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-gray-400 hover:text-red-600 transition-colors p-1"
                              aria-label="Remove item"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                                aria-label="Decrease quantity"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="w-8 text-center font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                                aria-label="Increase quantity"
                              >
                                <Plus size={14} />
                              </button>
                            </div>

                            {/* Price */}
                            <div className="text-right">
                              <p className="text-lg font-bold text-green-700">
                                ${(parseFloat(item.priceAtAdd) * item.quantity).toFixed(2)}
                              </p>
                              {item.quantity > 1 && (
                                <p className="text-xs text-gray-500">
                                  ${item.priceAtAdd} each
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6 bg-white sticky top-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Order Summary
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({items.reduce((sum, i) => sum + i.quantity, 0)} items)</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-bold text-gray-800">
                      <span>Total</span>
                      <span className="text-green-700">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Link href="/checkout">
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 font-semibold">
                    Proceed to Checkout
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>

                <p className="text-xs text-gray-500 text-center mt-4">
                  You&apos;ll complete registration forms for each program at checkout
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

