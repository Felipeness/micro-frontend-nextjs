import dynamic from 'next/dynamic';

const ProductList = dynamic(() => import('../src/components/ProductList'), {
  ssr: false,
  loading: () => <div>Loading products...</div>
});

export default function ProductsPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Products Micro Frontend</h1>
      <ProductList />
    </div>
  );
}

export async function getServerSideProps() {
  return {
    props: {},
  };
}