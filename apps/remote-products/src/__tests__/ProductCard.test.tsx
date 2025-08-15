import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductCard from '../components/ProductCard';

describe('ProductCard', () => {
  let consoleLogSpy: jest.SpyInstance;
  let appendChildSpy: jest.SpyInstance;
  let removeChildSpy: jest.SpyInstance;
  let containsSpy: jest.SpyInstance;

  const mockProduct = {
    id: 1,
    name: 'Spider-Man Web Shooter',
    price: 29.99,
    image: '/spiderman-web.jpg'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    appendChildSpy = jest.spyOn(document.body, 'appendChild');
    removeChildSpy = jest.spyOn(document.body, 'removeChild');
    containsSpy = jest.spyOn(document.body, 'contains');
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    consoleLogSpy.mockRestore();
    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
    containsSpy.mockRestore();
    
    // Clean up global cart context
    if (typeof window !== 'undefined') {
      delete (window as any).__CART_CONTEXT__;
    }
  });

  describe('Rendering', () => {
    it('should render product information correctly', () => {
      render(<ProductCard product={mockProduct} />);

      expect(screen.getByTestId('product-card')).toBeInTheDocument();
      expect(screen.getByText('Spider-Man Web Shooter')).toBeInTheDocument();
      expect(screen.getByText('R$ 29.99')).toBeInTheDocument();
      expect(screen.getByAltText('Spider-Man Web Shooter')).toBeInTheDocument();
      expect(screen.getByTestId('add-to-cart-btn')).toBeInTheDocument();
    });

    it('should render product image with correct attributes', () => {
      render(<ProductCard product={mockProduct} />);

      const image = screen.getByAltText('Spider-Man Web Shooter') as HTMLImageElement;
      expect(image.src).toContain('/spiderman-web.jpg');
      expect(image.style.width).toBe('100%');
      expect(image.style.height).toBe('200px');
      expect(image.style.objectFit).toBe('cover');
    });

    it('should format price correctly', () => {
      const productWithDecimals = { ...mockProduct, price: 19.5 };
      render(<ProductCard product={productWithDecimals} />);

      expect(screen.getByText('R$ 19.50')).toBeInTheDocument();
    });
  });

  describe('Add to Cart', () => {
    it('should log when adding to cart without cart context', () => {
      render(<ProductCard product={mockProduct} />);

      const addButton = screen.getByTestId('add-to-cart-btn');
      fireEvent.click(addButton);

      expect(consoleLogSpy).toHaveBeenCalledWith('Adding product Spider-Man Web Shooter to cart');
      expect(consoleLogSpy).toHaveBeenCalledWith('Cart context not available');
    });

    it('should add to cart when cart context is available', () => {
      const mockAddToCart = jest.fn();
      (window as any).__CART_CONTEXT__ = {
        addToCart: mockAddToCart
      };

      render(<ProductCard product={mockProduct} />);

      const addButton = screen.getByTestId('add-to-cart-btn');
      fireEvent.click(addButton);

      expect(mockAddToCart).toHaveBeenCalledWith({
        id: 1,
        name: 'Spider-Man Web Shooter',
        price: 29.99
      });
    });

    it('should show notification when adding to cart with context', () => {
      (window as any).__CART_CONTEXT__ = {
        addToCart: jest.fn()
      };

      const mockNotification = document.createElement('div');
      appendChildSpy.mockReturnValueOnce(mockNotification);
      containsSpy.mockReturnValueOnce(true);

      render(<ProductCard product={mockProduct} />);

      const addButton = screen.getByTestId('add-to-cart-btn');
      fireEvent.click(addButton);

      expect(appendChildSpy).toHaveBeenCalled();
      const notificationCall = appendChildSpy.mock.calls[0][0];
      expect(notificationCall.innerHTML).toContain('✅ Spider-Man Web Shooter added to cart!');
    });

    it('should remove notification after 3 seconds', () => {
      (window as any).__CART_CONTEXT__ = {
        addToCart: jest.fn()
      };

      const mockNotification = document.createElement('div');
      appendChildSpy.mockReturnValueOnce(mockNotification);
      containsSpy.mockReturnValueOnce(true);

      render(<ProductCard product={mockProduct} />);

      const addButton = screen.getByTestId('add-to-cart-btn');
      fireEvent.click(addButton);

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(removeChildSpy).toHaveBeenCalledWith(mockNotification);
    });

    it('should not remove notification if already removed', () => {
      (window as any).__CART_CONTEXT__ = {
        addToCart: jest.fn()
      };

      const mockNotification = document.createElement('div');
      appendChildSpy.mockReturnValueOnce(mockNotification);
      containsSpy.mockReturnValueOnce(false); // Already removed

      render(<ProductCard product={mockProduct} />);

      const addButton = screen.getByTestId('add-to-cart-btn');
      fireEvent.click(addButton);

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(removeChildSpy).not.toHaveBeenCalled();
    });
  });

  describe('Hover Effects', () => {
    it('should apply hover styles on mouse over', () => {
      render(<ProductCard product={mockProduct} />);

      const card = screen.getByTestId('product-card');
      
      fireEvent.mouseOver(card);

      expect(card.style.transform).toBe('translateY(-4px)');
      expect(card.style.boxShadow).toBe('0 4px 16px rgba(0,0,0,0.15)');
    });

    it('should remove hover styles on mouse out', () => {
      render(<ProductCard product={mockProduct} />);

      const card = screen.getByTestId('product-card');
      
      fireEvent.mouseOver(card);
      fireEvent.mouseOut(card);

      expect(card.style.transform).toBe('translateY(0)');
      expect(card.style.boxShadow).toBe('0 2px 8px rgba(0,0,0,0.1)');
    });

    it('should apply hover styles to button on mouse over', () => {
      render(<ProductCard product={mockProduct} />);

      const button = screen.getByTestId('add-to-cart-btn');
      
      fireEvent.mouseOver(button);

      expect((button as HTMLElement).style.backgroundColor).toBe('rgb(183, 28, 28)');
    });

    it('should remove hover styles from button on mouse out', () => {
      render(<ProductCard product={mockProduct} />);

      const button = screen.getByTestId('add-to-cart-btn');
      
      fireEvent.mouseOver(button);
      fireEvent.mouseOut(button);

      expect((button as HTMLElement).style.backgroundColor).toBe('rgb(220, 20, 60)');
    });
  });
});