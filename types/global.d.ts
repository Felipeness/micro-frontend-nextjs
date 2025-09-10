// Global type declarations for micro frontend architecture

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

// Module Federation type declarations
declare module 'remote-products/ProductList' {
  const ProductList: React.ComponentType;
  export default ProductList;
}

declare module 'remote-products/ProductCard' {
  const ProductCard: React.ComponentType<any>;
  export default ProductCard;
}

declare module 'remote-cart/Cart' {
  const Cart: React.ComponentType;
  export default Cart;
}

declare module 'remote-cart/CartButton' {
  const CartButton: React.ComponentType;
  export default CartButton;
}

export {};