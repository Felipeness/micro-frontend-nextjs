import { useState, useEffect } from 'react';
import CartButton from './CartButton';

interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

export default function Cart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for cart updates from global context
    const updateCart = () => {
      if (typeof window !== 'undefined' && window.__CART_CONTEXT__) {
        setItems(window.__CART_CONTEXT__.items);
        setLoading(false);
      } else {
        // If no context available, show empty cart
        setItems([]);
        setLoading(false);
      }
    };

    // Initial load with delay to allow context to be set
    setTimeout(updateCart, 100);

    // Poll for updates every 200ms
    const interval = setInterval(updateCart, 200);

    return () => clearInterval(interval);
  }, []);

  const updateQuantity = (itemId: number, quantity: number) => {
    if (typeof window !== 'undefined' && window.__CART_CONTEXT__) {
      window.__CART_CONTEXT__.updateQuantity(itemId, quantity);
    }
  };

  const removeItem = (itemId: number) => {
    if (typeof window !== 'undefined' && window.__CART_CONTEXT__) {
      window.__CART_CONTEXT__.removeItem(itemId);
    }
  };

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (loading) {
    return <div>Loading cart...</div>;
  }

  return (
    <div style={{ 
      border: '1px solid #e0e0e0', 
      borderRadius: '12px', 
      padding: '20px',
      backgroundColor: 'white',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: '20px'
    }}>
      <h3 style={{ 
        marginBottom: '20px', 
        color: '#333',
        fontSize: '1.4rem',
        fontWeight: '600',
        borderBottom: '2px solid #f0f0f0',
        paddingBottom: '10px'
      }}>🛒 Shopping Cart</h3>
      
      {items.length === 0 ? (
        <p style={{ 
          textAlign: 'center', 
          color: '#666', 
          fontStyle: 'italic',
          padding: '40px 0'
        }}>Your cart is empty</p>
      ) : (
        <>
          {items.map((item) => (
            <div key={item.id} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '12px 0',
              borderBottom: '1px solid #f0f0f0',
              transition: 'background-color 0.2s'
            }}>
              <div>
                <div style={{ fontWeight: 'bold', color: '#333', fontSize: '14px' }}>{item.name}</div>
                <div style={{ color: '#666', fontSize: '12px' }}>R$ {item.price.toFixed(2)} each</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CartButton
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  -
                </CartButton>
                <span>{item.quantity}</span>
                <CartButton
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  +
                </CartButton>
                <CartButton
                  onClick={() => removeItem(item.id)}
                  variant="danger"
                >
                  Remove
                </CartButton>
              </div>
            </div>
          ))}
          
          <div style={{ 
            marginTop: '20px', 
            fontSize: '20px', 
            fontWeight: 'bold', 
            color: '#e74c3c',
            textAlign: 'center',
            padding: '16px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '2px solid #e9ecef'
          }}>
            Total: R$ {total.toFixed(2)}
          </div>
          
          <CartButton
            onClick={() => {
              // Show checkout notification
              const notification = document.createElement('div');
              notification.innerHTML = `
                <div style="
                  position: fixed;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  background: linear-gradient(135deg, #28a745, #20c997);
                  color: white;
                  padding: 24px 32px;
                  border-radius: 12px;
                  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
                  z-index: 1000;
                  text-align: center;
                  max-width: 400px;
                ">
                  <div style="font-size: 24px; margin-bottom: 12px;">🎉</div>
                  <div style="font-weight: bold; font-size: 18px; margin-bottom: 8px;">Thank you for your purchase!</div>
                  <div style="font-size: 14px; opacity: 0.9;">Total: R$ ${total.toFixed(2)}</div>
                  <div style="font-size: 12px; margin-top: 12px; opacity: 0.8;">Checkout functionality would be implemented here</div>
                </div>
              `;
              document.body.appendChild(notification);
              setTimeout(() => {
                if (document.body.contains(notification)) {
                  document.body.removeChild(notification);
                }
              }, 4000);
            }}
            style={{ 
              width: '100%', 
              marginTop: '16px',
              padding: '14px',
              fontSize: '16px',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #28a745, #20c997)',
              borderRadius: '8px'
            }}
          >
            🛒 Checkout (R$ {total.toFixed(2)})
          </CartButton>
        </>
      )}
    </div>
  );
}