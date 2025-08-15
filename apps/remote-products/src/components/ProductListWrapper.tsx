import { useEffect, useState } from 'react';
import ProductList from './ProductList';

export default function ProductListWrapper() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div>Loading products...</div>;
  }

  return <ProductList />;
}