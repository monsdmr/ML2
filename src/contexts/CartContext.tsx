import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { Product } from "@/data/products";

export interface CartItem {
  productIndex: number;
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (productIndex: number, product: Product) => void;
  removeItem: (productIndex: number) => void;
  updateQuantity: (productIndex: number, quantity: number) => void;
  clearCart: () => void;
  totalPrice: number;
  totalSavings: number;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((productIndex: number, product: Product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productIndex === productIndex);
      if (existing) {
        return prev.map((i) =>
          i.productIndex === productIndex ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { productIndex, product, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((productIndex: number) => {
    setItems((prev) => prev.filter((i) => i.productIndex !== productIndex));
  }, []);

  const updateQuantity = useCallback((productIndex: number, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.productIndex !== productIndex));
    } else {
      setItems((prev) =>
        prev.map((i) => (i.productIndex === productIndex ? { ...i, quantity } : i))
      );
    }
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalPrice = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const totalSavings = items.reduce(
    (sum, i) => sum + (i.product.originalPrice - i.product.price) * i.quantity,
    0
  );
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalPrice, totalSavings, totalItems }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
