import dynamic from 'next/dynamic';

const Cart = dynamic(() => import('../src/components/Cart'), {
  ssr: false,
  loading: () => <div>Loading cart...</div>
});

export default function CartPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Cart Micro Frontend</h1>
      <Cart />
    </div>
  );
}

export async function getServerSideProps() {
  return {
    props: {},
  };
}