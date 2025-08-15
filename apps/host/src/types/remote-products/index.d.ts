declare module 'remote-products/ProductList' {
  const ProductList: React.ComponentType;
  export default ProductList;
}

declare module 'remote-products/ProductCard' {
  interface Product {
    id: number;
    name: string;
    price: number;
    image: string;
  }

  interface ProductCardProps {
    product: Product;
  }

  const ProductCard: React.ComponentType<ProductCardProps>;
  export default ProductCard;
}