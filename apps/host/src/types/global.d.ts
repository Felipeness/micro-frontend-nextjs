interface CartContext {
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  addItem: (item: { id: string; name: string; price: number }) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  total: number;
}

declare module 'remote_products/ProductList' {
  const ProductList: React.ComponentType<any>;
  export default ProductList;
}

declare module 'remote_cart/Cart' {
  const Cart: React.ComponentType<any>;
  export default Cart;
}

declare global {
  interface Window {
    __CART_CONTEXT__?: CartContext;
  }
}

export {};