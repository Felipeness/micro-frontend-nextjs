import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Cart from '../components/Cart';

// Mock the CartButton component
jest.mock('../components/CartButton', () => ({
  __esModule: true,
  default: ({ children, onClick, disabled, variant, style, ...props }: any) => (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      style={style}
      {...props}
    >
      {children}
    </button>
  ),
}));

describe('Cart', () => {
  let appendChildSpy: jest.SpyInstance;
  let removeChildSpy: jest.SpyInstance;
  let containsSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    appendChildSpy = jest.spyOn(document.body, 'appendChild');
    removeChildSpy = jest.spyOn(document.body, 'removeChild');
    containsSpy = jest.spyOn(document.body, 'contains');
    
    // Clean up global cart context
    if (typeof window !== 'undefined') {
      delete (window as any).__CART_CONTEXT__;
    }
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
    containsSpy.mockRestore();
  });

  describe('Loading State', () => {
    it('should show loading state initially', () => {
      render(<Cart />);
      expect(screen.getByText('Loading cart...')).toBeInTheDocument();
    });

    it('should hide loading state after timeout', async () => {
      render(<Cart />);
      
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      await waitFor(() => {
        expect(screen.queryByText('Loading cart...')).not.toBeInTheDocument();
      });
    });
  });

  describe('Empty Cart', () => {
    it('should show empty cart message when no items', async () => {
      render(<Cart />);
      
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
      });
    });

    it('should show empty cart when context is not available', async () => {
      render(<Cart />);
      
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
      });
    });
  });

  describe('Cart with Items', () => {
    const mockItems = [
      { id: 101, productId: 1, name: 'Spider-Man Web Shooter', price: 89.90, quantity: 2 },
      { id: 102, productId: 2, name: 'Spider-Man Mask', price: 45.90, quantity: 1 }
    ];

    beforeEach(() => {
      (window as any).__CART_CONTEXT__ = {
        items: mockItems,
        updateQuantity: jest.fn(),
        removeItem: jest.fn()
      };
    });

    it('should display cart items from global context', async () => {
      render(<Cart />);
      
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Spider-Man Web Shooter')).toBeInTheDocument();
        expect(screen.getByText('Spider-Man Mask')).toBeInTheDocument();
        expect(screen.getByText('R$ 89.90 each')).toBeInTheDocument();
        expect(screen.getByText('R$ 45.90 each')).toBeInTheDocument();
      });
    });

    it('should display correct quantities', async () => {
      render(<Cart />);
      
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      await waitFor(() => {
        const quantities = screen.getAllByTestId('item-quantity');
        expect(quantities[0]).toHaveTextContent('2');
        expect(quantities[1]).toHaveTextContent('1');
      });
    });

    it('should calculate and display correct total', async () => {
      render(<Cart />);
      
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      await waitFor(() => {
        // Total: (89.90 * 2) + (45.90 * 1) = 179.80 + 45.90 = 225.70
        expect(screen.getByTestId('cart-total')).toHaveTextContent('Total: R$ 225.70');
      });
    });

    it('should update quantity when increase button is clicked', async () => {
      render(<Cart />);
      
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      await waitFor(() => {
        const increaseButtons = screen.getAllByTestId('increase-quantity-btn');
        fireEvent.click(increaseButtons[0]);
      });
      
      expect((window as any).__CART_CONTEXT__.updateQuantity).toHaveBeenCalledWith(101, 3);
    });

    it('should update quantity when decrease button is clicked', async () => {
      render(<Cart />);
      
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      await waitFor(() => {
        const decreaseButtons = screen.getAllByTestId('decrease-quantity-btn');
        fireEvent.click(decreaseButtons[0]);
      });
      
      expect((window as any).__CART_CONTEXT__.updateQuantity).toHaveBeenCalledWith(101, 1);
    });

    it('should disable decrease button when quantity is 1', async () => {
      render(<Cart />);
      
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      await waitFor(() => {
        const decreaseButtons = screen.getAllByTestId('decrease-quantity-btn');
        expect(decreaseButtons[1]).toBeDisabled(); // Second item has quantity 1
      });
    });

    it('should remove item when remove button is clicked', async () => {
      render(<Cart />);
      
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      await waitFor(() => {
        const removeButtons = screen.getAllByTestId('remove-item-btn');
        fireEvent.click(removeButtons[0]);
      });
      
      expect((window as any).__CART_CONTEXT__.removeItem).toHaveBeenCalledWith(101);
    });
  });

  describe('Checkout', () => {
    const mockItems = [
      { id: 101, productId: 1, name: 'Spider-Man Web Shooter', price: 89.90, quantity: 1 }
    ];

    beforeEach(() => {
      (window as any).__CART_CONTEXT__ = {
        items: mockItems,
        updateQuantity: jest.fn(),
        removeItem: jest.fn()
      };
    });

    it('should show checkout button with total', async () => {
      render(<Cart />);
      
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      await waitFor(() => {
        const checkoutButton = screen.getByTestId('checkout-btn');
        expect(checkoutButton).toHaveTextContent('🛒 Checkout (R$ 89.90)');
      });
    });

    it('should show checkout notification when checkout is clicked', async () => {
      const mockNotification = document.createElement('div');
      appendChildSpy.mockReturnValueOnce(mockNotification);
      containsSpy.mockReturnValueOnce(true);
      
      render(<Cart />);
      
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      await waitFor(() => {
        const checkoutButton = screen.getByTestId('checkout-btn');
        fireEvent.click(checkoutButton);
      });
      
      expect(appendChildSpy).toHaveBeenCalled();
      const notificationCall = appendChildSpy.mock.calls[0][0];
      expect(notificationCall.innerHTML).toContain('Thank you for your purchase!');
      expect(notificationCall.innerHTML).toContain('Total: R$ 89.90');
    });

    it('should remove checkout notification after 4 seconds', async () => {
      const mockNotification = document.createElement('div');
      appendChildSpy.mockReturnValueOnce(mockNotification);
      containsSpy.mockReturnValueOnce(true);
      
      render(<Cart />);
      
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      await waitFor(() => {
        const checkoutButton = screen.getByTestId('checkout-btn');
        fireEvent.click(checkoutButton);
      });
      
      act(() => {
        jest.advanceTimersByTime(4000);
      });
      
      expect(removeChildSpy).toHaveBeenCalledWith(mockNotification);
    });

    it('should not remove notification if already removed', async () => {
      const mockNotification = document.createElement('div');
      appendChildSpy.mockReturnValueOnce(mockNotification);
      containsSpy.mockReturnValueOnce(false); // Already removed
      
      render(<Cart />);
      
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      await waitFor(() => {
        const checkoutButton = screen.getByTestId('checkout-btn');
        fireEvent.click(checkoutButton);
      });
      
      act(() => {
        jest.advanceTimersByTime(4000);
      });
      
      expect(removeChildSpy).not.toHaveBeenCalled();
    });
  });

  describe('Polling Updates', () => {
    it('should poll for cart updates', async () => {
      const initialItems = [
        { id: 101, productId: 1, name: 'Initial Item', price: 10, quantity: 1 }
      ];
      
      (window as any).__CART_CONTEXT__ = {
        items: initialItems,
        updateQuantity: jest.fn(),
        removeItem: jest.fn()
      };
      
      render(<Cart />);
      
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Initial Item')).toBeInTheDocument();
      });
      
      // Update the cart context
      const updatedItems = [
        { id: 102, productId: 2, name: 'Updated Item', price: 20, quantity: 2 }
      ];
      (window as any).__CART_CONTEXT__.items = updatedItems;
      
      // Advance time to trigger polling
      act(() => {
        jest.advanceTimersByTime(200);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Updated Item')).toBeInTheDocument();
        expect(screen.queryByText('Initial Item')).not.toBeInTheDocument();
      });
    });

    it('should clean up interval on unmount', () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      
      const { unmount } = render(<Cart />);
      
      unmount();
      
      expect(clearIntervalSpy).toHaveBeenCalled();
      
      clearIntervalSpy.mockRestore();
    });
  });
});