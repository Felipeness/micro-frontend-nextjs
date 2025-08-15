import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CartProvider, useCart } from '../context/CartContext';

// Mock console.log
const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

// Test component for cart operations
function CartOperationsTest() {
  const cart = useCart();
  
  // Use static IDs to avoid duplicate key warnings
  const testProduct1 = { id: 2001, name: 'Test Product', price: 10.99 };
  const testProduct2 = { id: 2002, name: 'Different Product', price: 5.50 };
  
  const handleAddItem = () => {
    cart.addToCart(testProduct1);
  };

  const handleAddSameItem = () => {
    cart.addToCart(testProduct1);
  };

  const handleAddDifferentItem = () => {
    cart.addToCart(testProduct2);
  };

  const handleUpdateQuantity = (itemId: number, quantity: number) => {
    cart.updateQuantity(itemId, quantity);
  };

  const handleRemoveItem = (itemId: number) => {
    cart.removeItem(itemId);
  };

  return (
    <div>
      <div data-testid="item-count">{cart.getItemCount()}</div>
      <div data-testid="total">{cart.getTotal().toFixed(2)}</div>
      <div data-testid="items-length">{cart.items.length}</div>
      
      <button data-testid="add-item" onClick={handleAddItem}>Add Item</button>
      <button data-testid="add-same-item" onClick={handleAddSameItem}>Add Same Item</button>
      <button data-testid="add-different-item" onClick={handleAddDifferentItem}>Add Different Item</button>
      
      {cart.items.map((item) => (
        <div key={item.id} data-testid={`item-${item.id}`}>
          <span data-testid={`item-${item.id}-name`}>{item.name}</span>
          <span data-testid={`item-${item.id}-quantity`}>{item.quantity}</span>
          <button 
            data-testid={`update-plus-${item.id}`}
            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
          >
            +
          </button>
          <button 
            data-testid={`update-minus-${item.id}`}
            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
          >
            -
          </button>
          <button 
            data-testid={`remove-${item.id}`}
            onClick={() => handleRemoveItem(item.id)}
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}

describe('CartContext - Operations', () => {
  beforeEach(() => {
    consoleSpy.mockClear();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  describe('adding items', () => {
    it('should add new item to cart', () => {
      render(
        <CartProvider>
          <CartOperationsTest />
        </CartProvider>
      );

      act(() => {
        screen.getByTestId('add-item').click();
      });

      expect(screen.getByTestId('item-count')).toHaveTextContent('1');
      expect(screen.getByTestId('total')).toHaveTextContent('10.99');
      expect(screen.getByTestId('items-length')).toHaveTextContent('1');
    });

    it('should increase quantity when adding same item', () => {
      render(
        <CartProvider>
          <CartOperationsTest />
        </CartProvider>
      );

      act(() => {
        screen.getByTestId('add-item').click();
        screen.getByTestId('add-same-item').click();
      });

      expect(screen.getByTestId('item-count')).toHaveTextContent('2');
      expect(screen.getByTestId('total')).toHaveTextContent('21.98');
      expect(screen.getByTestId('items-length')).toHaveTextContent('1');
    });

    it('should add multiple different items', () => {
      render(
        <CartProvider>
          <CartOperationsTest />
        </CartProvider>
      );

      act(() => {
        screen.getByTestId('add-item').click();
        screen.getByTestId('add-different-item').click();
      });

      expect(screen.getByTestId('item-count')).toHaveTextContent('2');
      expect(screen.getByTestId('total')).toHaveTextContent('16.49');
      expect(screen.getByTestId('items-length')).toHaveTextContent('2');
    });
  });

  describe('updating quantities', () => {
    it('should update item quantity', () => {
      render(
        <CartProvider>
          <CartOperationsTest />
        </CartProvider>
      );

      act(() => {
        screen.getByTestId('add-item').click();
      });

      // Find the item ID from the rendered item
      const itemElement = screen.getByTestId(/item-\d+-name/);
      const itemId = itemElement.getAttribute('data-testid')?.split('-')[1];

      if (itemId) {
        act(() => {
          screen.getByTestId(`update-plus-${itemId}`).click();
        });

        expect(screen.getByTestId('item-count')).toHaveTextContent('2');
        expect(screen.getByTestId('total')).toHaveTextContent('21.98');
      }
    });

    it('should remove item when quantity reaches zero', () => {
      render(
        <CartProvider>
          <CartOperationsTest />
        </CartProvider>
      );

      act(() => {
        screen.getByTestId('add-item').click();
      });

      const itemElement = screen.getByTestId(/item-\d+-name/);
      const itemId = itemElement.getAttribute('data-testid')?.split('-')[1];

      if (itemId) {
        act(() => {
          screen.getByTestId(`update-minus-${itemId}`).click();
        });

        expect(screen.getByTestId('item-count')).toHaveTextContent('0');
        expect(screen.getByTestId('total')).toHaveTextContent('0.00');
        expect(screen.getByTestId('items-length')).toHaveTextContent('0');
      }
    });
  });

  describe('removing items', () => {
    it('should remove item directly', () => {
      render(
        <CartProvider>
          <CartOperationsTest />
        </CartProvider>
      );

      act(() => {
        screen.getByTestId('add-item').click();
      });

      const itemElement = screen.getByTestId(/item-\d+-name/);
      const itemId = itemElement.getAttribute('data-testid')?.split('-')[1];

      if (itemId) {
        act(() => {
          screen.getByTestId(`remove-${itemId}`).click();
        });

        expect(screen.getByTestId('item-count')).toHaveTextContent('0');
        expect(screen.getByTestId('total')).toHaveTextContent('0.00');
        expect(screen.getByTestId('items-length')).toHaveTextContent('0');
      }
    });
  });

  describe('calculations', () => {
    it('should calculate total correctly with multiple items', () => {
      render(
        <CartProvider>
          <CartOperationsTest />
        </CartProvider>
      );

      act(() => {
        screen.getByTestId('add-item').click();
        screen.getByTestId('add-same-item').click();
        screen.getByTestId('add-different-item').click();
      });

      expect(screen.getByTestId('item-count')).toHaveTextContent('3');
      expect(screen.getByTestId('total')).toHaveTextContent('27.48');
    });
  });
});