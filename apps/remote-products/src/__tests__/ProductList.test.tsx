import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductList from '../components/ProductList';

// Mock the ProductCard component
jest.mock('../components/ProductCard', () => ({
  __esModule: true,
  default: ({ product }: { product: any }) => (
    <div data-testid={`product-card-${product.id}`}>
      {product.name} - R$ {product.price}
    </div>
  ),
}));

describe('ProductList', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Loading State', () => {
    it('should show loading state initially', () => {
      render(<ProductList />);
      
      expect(screen.getByText('Loading products...')).toBeInTheDocument();
    });

    it('should hide loading state after products load', async () => {
      render(<ProductList />);
      
      // Initially loading
      expect(screen.getByText('Loading products...')).toBeInTheDocument();
      
      // Fast-forward time to trigger product loading
      jest.advanceTimersByTime(1000);
      
      // Loading should be gone
      await waitFor(() => {
        expect(screen.queryByText('Loading products...')).not.toBeInTheDocument();
      });
    });
  });

  describe('Product Display', () => {
    it('should display all products after loading', async () => {
      render(<ProductList />);
      
      // Fast-forward time to load products
      jest.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(screen.getByTestId('product-card-1')).toBeInTheDocument();
        expect(screen.getByTestId('product-card-2')).toBeInTheDocument();
        expect(screen.getByTestId('product-card-3')).toBeInTheDocument();
        expect(screen.getByTestId('product-card-4')).toBeInTheDocument();
        expect(screen.getByTestId('product-card-5')).toBeInTheDocument();
        expect(screen.getByTestId('product-card-6')).toBeInTheDocument();
      });
    });

    it('should display correct product information', async () => {
      render(<ProductList />);
      
      jest.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(screen.getByText(/Spider-Man Web Shooter - R\$ 89.9/)).toBeInTheDocument();
        expect(screen.getByText(/Spider-Man Action Figure - R\$ 159.9/)).toBeInTheDocument();
        expect(screen.getByText(/Spider-Man Mask - R\$ 45.9/)).toBeInTheDocument();
        expect(screen.getByText(/Spider-Man Backpack - R\$ 129.9/)).toBeInTheDocument();
        expect(screen.getByText(/Spider-Man LEGO Set - R\$ 299.9/)).toBeInTheDocument();
        expect(screen.getByText(/Spider-Man Comic Book - R\$ 24.9/)).toBeInTheDocument();
      });
    });

    it('should render products in a grid layout', async () => {
      const { container } = render(<ProductList />);
      
      jest.advanceTimersByTime(1000);
      
      await waitFor(() => {
        const grid = container.querySelector('div[style*="grid"]');
        expect(grid).toBeInTheDocument();
        expect(grid).toHaveStyle({
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px',
          padding: '0'
        });
      });
    });
  });

  describe('State Management', () => {
    it('should update products state after timeout', async () => {
      render(<ProductList />);
      
      // Initially no products
      expect(screen.queryByTestId('product-card-1')).not.toBeInTheDocument();
      
      // Fast-forward time
      jest.advanceTimersByTime(1000);
      
      // Products should be loaded
      await waitFor(() => {
        expect(screen.getByTestId('product-card-1')).toBeInTheDocument();
      });
    });

    it('should only load products once', async () => {
      const { rerender } = render(<ProductList />);
      
      jest.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(screen.getByTestId('product-card-1')).toBeInTheDocument();
      });
      
      // Rerender to ensure useEffect doesn't run again
      rerender(<ProductList />);
      
      // Products should still be there
      expect(screen.getByTestId('product-card-1')).toBeInTheDocument();
      
      // Fast-forward more time
      jest.advanceTimersByTime(1000);
      
      // Should still have same products, not duplicated
      const productCards = screen.getAllByTestId(/product-card-\d+/);
      expect(productCards).toHaveLength(6);
    });
  });
});