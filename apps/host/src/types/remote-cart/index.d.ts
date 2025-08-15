declare module 'remote-cart/Cart' {
  const Cart: React.ComponentType;
  export default Cart;
}

declare module 'remote-cart/CartButton' {
  interface CartButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'danger';
  }

  const CartButton: React.ComponentType<CartButtonProps>;
  export default CartButton;
}