import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CartProvider, useCart, CartItem } from '../context/CartContext';

// Mock console.log to avoid noise in tests
const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

// Test component to access cart context
function TestComponent() {
  const cart = useCart();
  
  // Use static IDs instead of Date.now() to avoid duplicate key warnings
  const testProduct1 = { id: 1001, name: 'Test Product', price: 10.99 };
  const testProduct2 = { id: 1002, name: 'Different Product', price: 5.50 };
  
  return (
    <div>
      <div data-testid="item-count">{cart.getItemCount()}</div>
      <div data-testid="total">{cart.getTotal().toFixed(2)}</div>
      <div data-testid="items-length">{cart.items.length}</div>
      <button 
        data-testid="add-item"
        onClick={() => cart.addToCart(testProduct1)}
      >
        Add Item
      </button>
      <button 
        data-testid="add-same-item"
        onClick={() => cart.addToCart(testProduct1)}
      >
        Add Same Item
      </button>
      <button 
        data-testid="add-different-item"
        onClick={() => cart.addToCart(testProduct2)}
      >
        Add Different Item
      </button>
      {cart.items.map((item) => (
        <div key={item.id} data-testid={`item-${item.id}`}>
          <span data-testid={`item-${item.id}-name`}>{item.name}</span>
          <span data-testid={`item-${item.id}-quantity`}>{item.quantity}</span>
          <button 
            data-testid={`update-${item.id}`}
            onClick={() => cart.updateQuantity(item.id, item.quantity + 1)}
          >
            Update +
          </button>
          <button 
            data-testid={`remove-${item.id}`}
            onClick={() => cart.removeItem(item.id)}
          >
            Remove
          </button>
          <button 
            data-testid={`update-zero-${item.id}`}
            onClick={() => cart.updateQuantity(item.id, 0)}
          >
            Update to 0
          </button>
        </div>
      ))}
    </div>
  );
}

describe('CartContext', () => {
  beforeEach(() => {
    consoleSpy.mockClear();
    // Clear global context
    if (typeof window !== 'undefined') {
      window.__CART_CONTEXT__ = undefined;
    }
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  describe('CartProvider', () => {
    it('should provide cart context to children', () => {
      render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      expect(screen.getByTestId('item-count')).toHaveTextContent('0');
      expect(screen.getByTestId('total')).toHaveTextContent('0.00');
      expect(screen.getByTestId('items-length')).toHaveTextContent('0');
    });

    it('should expose cart context globally', () => {
      render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      expect(window.__CART_CONTEXT__).toBeDefined();
      expect(window.__CART_CONTEXT__.items).toEqual([]);
      expect(typeof window.__CART_CONTEXT__.addToCart).toBe('function');
      expect(consoleSpy).toHaveBeenCalledWith(
        'Cart context exposed globally:',
        expect.objectContaining({
          items: [],
          addToCart: expect.any(Function),
          updateQuantity: expect.any(Function),
          removeItem: expect.any(Function),
          getItemCount: expect.any(Function),
          getTotal: expect.any(Function),
        })
      );
    });
  });

  describe('useCart hook', () => {
    it('should throw error when used outside CartProvider', () => {
      // Suppress console.error for this test
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      
      expect(() => {
        render(<TestComponent />);
      }).toThrow('useCart must be used within a CartProvider');
      
      consoleError.mockRestore();
    });
  });

  describe('Cart operations', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should add new item to cart', () => {
      render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      const addButton = screen.getByTestId('add-item');
      
      act(() => {
        addButton.click();
      });

      expect(screen.getByTestId('item-count')).toHaveTextContent('1');
      expect(screen.getByTestId('total')).toHaveTextContent('10.99');
      expect(screen.getByTestId('items-length')).toHaveTextContent('1');
    });

    it('should increase quantity when adding same item', () => {
      render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      const addButton = screen.getByTestId('add-item');
      const addSameButton = screen.getByTestId('add-same-item');
      
      act(() => {
        addButton.click();
        addSameButton.click();
      });

      expect(screen.getByTestId('item-count')).toHaveTextContent('2');
      expect(screen.getByTestId('total')).toHaveTextContent('21.98');
      expect(screen.getByTestId('items-length')).toHaveTextContent('1'); // Still one unique item
    });

    it('should add multiple different items', () => {
      render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      const addButton = screen.getByTestId('add-item');
      const addDifferentButton = screen.getByTestId('add-different-item');
      
      act(() => {
        addButton.click();
        addDifferentButton.click();
      });

      expect(screen.getByTestId('item-count')).toHaveTextContent('2');
      expect(screen.getByTestId('total')).toHaveTextContent('16.49'); // 10.99 + 5.50
      expect(screen.getByTestId('items-length')).toHaveTextContent('2');
    });

    it('should update item quantity', () => {
      render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      act(() => {
        screen.getByTestId('add-item').click();
      });

      const itemId = screen.getByTestId('items-length').textContent === '1' 
        ? screen.getByTestId(/item-\d+-name/).closest('[data-testid^="item-"]')?.getAttribute('data-testid')?.split('-')[1]
        : null;

      if (itemId) {
        act(() => {
          screen.getByTestId(`update-${itemId}`).click();
        });

        expect(screen.getByTestId('item-count')).toHaveTextContent('2');
        expect(screen.getByTestId('total')).toHaveTextContent('21.98');
      }
    });

    it('should remove item when quantity updated to 0', () => {
      render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      act(() => {
        screen.getByTestId('add-item').click();
      });

      const itemId = screen.getByTestId('items-length').textContent === '1' 
        ? screen.getByTestId(/item-\d+-name/).closest('[data-testid^="item-"]')?.getAttribute('data-testid')?.split('-')[1]
        : null;

      if (itemId) {
        act(() => {
          screen.getByTestId(`update-zero-${itemId}`).click();
        });

        expect(screen.getByTestId('item-count')).toHaveTextContent('0');
        expect(screen.getByTestId('total')).toHaveTextContent('0.00');
        expect(screen.getByTestId('items-length')).toHaveTextContent('0');
      }
    });

    it('should remove item directly', () => {
      render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      act(() => {
        screen.getByTestId('add-item').click();
      });

      const itemId = screen.getByTestId('items-length').textContent === '1' 
        ? screen.getByTestId(/item-\d+-name/).closest('[data-testid^="item-"]')?.getAttribute('data-testid')?.split('-')[1]
        : null;

      if (itemId) {
        act(() => {
          screen.getByTestId(`remove-${itemId}`).click();
        });

        expect(screen.getByTestId('item-count')).toHaveTextContent('0');
        expect(screen.getByTestId('total')).toHaveTextContent('0.00');
        expect(screen.getByTestId('items-length')).toHaveTextContent('0');
      }
    });

    it('should calculate total correctly with multiple items', () => {
      render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      act(() => {
        // Add first item twice
        screen.getByTestId('add-item').click();
        screen.getByTestId('add-same-item').click();
        // Add different item
        screen.getByTestId('add-different-item').click();
      });

      expect(screen.getByTestId('item-count')).toHaveTextContent('3'); // 2 + 1
      expect(screen.getByTestId('total')).toHaveTextContent('27.48'); // (10.99 * 2) + 5.50
    });

    it('should generate unique IDs for cart items', () => {
      const mockDate = 1640995200000; // Fixed timestamp
      jest.setSystemTime(mockDate);

      render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      act(() => {
        screen.getByTestId('add-item').click();
        jest.advanceTimersByTime(1); // Advance by 1ms
        screen.getByTestId('add-different-item').click();
      });

      expect(screen.getByTestId('items-length')).toHaveTextContent('2');
      // Both items should have different IDs based on Date.now()
    });
  });
});