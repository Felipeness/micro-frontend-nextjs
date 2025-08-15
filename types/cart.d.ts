declare global {
  interface Window {
    __CART_CONTEXT__?: {
      addToCart: (product: { id: number; name: string; price: number }) => void;
      items: Array<{
        id: number;
        productId: number;
        name: string;
        price: number;
        quantity: number;
      }>;
      updateQuantity: (itemId: number, quantity: number) => void;
      removeItem: (itemId: number) => void;
      getItemCount: () => number;
      getTotal: () => number;
    };
  }
}

export {};