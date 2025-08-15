interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const handleAddToCart = () => {
    console.log(`Adding product ${product.name} to cart`);
    
    // Try to use global cart context
    if (typeof window !== 'undefined' && window.__CART_CONTEXT__) {
      window.__CART_CONTEXT__.addToCart({
        id: product.id,
        name: product.name,
        price: product.price
      });
      
      // Show success notification
      const notification = document.createElement('div');
      notification.innerHTML = `
        <div style="
          position: fixed;
          top: 20px;
          right: 20px;
          background: linear-gradient(135deg, #28a745, #20c997);
          color: white;
          padding: 12px 20px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          z-index: 1000;
          font-weight: bold;
        ">
          ✅ ${product.name} added to cart!
        </div>
      `;
      document.body.appendChild(notification);
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 3000);
    } else {
      console.log('Cart context not available');
    }
  };

  return (
    <div style={{
      border: '1px solid #e0e0e0',
      borderRadius: '12px',
      padding: '16px',
      backgroundColor: 'white',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'pointer',
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
    }}
    >
      <img 
        src={product.image} 
        alt={product.name}
        style={{ width: '100%', height: '200px', objectFit: 'cover', marginBottom: '12px', borderRadius: '8px' }}
      />
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#333' }}>{product.name}</h3>
      <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#e74c3c', margin: '0 0 12px 0' }}>
        R$ {product.price.toFixed(2)}
      </p>
      <button
        onClick={handleAddToCart}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: '#dc143c',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          transition: 'background-color 0.2s',
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = '#b71c1c'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#dc143c'}
      >
        Add to Cart
      </button>
    </div>
  );
}