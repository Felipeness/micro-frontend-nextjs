// Global type declarations for micro frontend

export interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

export interface CartContext {
  items: CartItem[];
  addToCart: (product: { id: number; name: string; price: number }) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  removeItem: (itemId: number) => void;
  getItemCount: () => number;
  getTotal: () => number;
}

// Extend Window interface to include global context
declare global {
  interface Window {
    __CART_CONTEXT__?: CartContext;
  }
}

export {};