import dynamic from 'next/dynamic';

const ProductList = dynamic(() => import('../src/components/ProductList'), {
  ssr: false,
});

export default ProductList;