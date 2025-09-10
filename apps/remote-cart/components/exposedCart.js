import dynamic from 'next/dynamic';

const Cart = dynamic(() => import('../src/components/Cart'), {
  ssr: false,
});

export default Cart;