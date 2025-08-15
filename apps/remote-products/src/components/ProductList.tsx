import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
}

const mockProducts: Product[] = [
  { 
    id: 1, 
    name: 'Spider-Man Web Shooter', 
    price: 89.90, 
    image: 'https://images.unsplash.com/photo-1608889476561-6242cfdbf622?w=300&h=300&fit=crop&crop=center'
  },
  { 
    id: 2, 
    name: 'Spider-Man Action Figure', 
    price: 159.90, 
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop&crop=center'
  },
  { 
    id: 3, 
    name: 'Spider-Man Mask', 
    price: 45.90, 
    image: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=300&h=300&fit=crop&crop=center'
  },
  { 
    id: 4, 
    name: 'Spider-Man Backpack', 
    price: 129.90, 
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop&crop=center'
  },
  { 
    id: 5, 
    name: 'Spider-Man LEGO Set', 
    price: 299.90, 
    image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=300&h=300&fit=crop&crop=center'
  },
  { 
    id: 6, 
    name: 'Spider-Man Comic Book', 
    price: 24.90, 
    image: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=300&h=300&fit=crop&crop=center'
  },
];

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProducts(mockProducts);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return <div>Loading products...</div>;
  }

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
      gap: '24px',
      padding: '0'
    }}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}