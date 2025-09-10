import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { analytics } from '../lib/analytics';
import { CartProvider } from '../context/CartContext';

const ProductList = dynamic(() => import('remote_products/ProductList').catch(() => ({ default: () => <div>Products service unavailable</div> })), {
  ssr: false,
  loading: () => <div>Loading products...</div>
});

const Cart = dynamic(() => import('remote_cart/Cart').catch(() => ({ default: () => <div>Cart service unavailable</div> })), {
  ssr: false,
  loading: () => <div>Loading cart...</div>
});

export default function ClientHomePage() {
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  useEffect(() => {
    // Track page view automatically when component mounts
    analytics.trackPageView('home');
  }, []);

  const handleTrackPageView = () => {
    analytics.trackPageView('home_manual');
    analytics.trackInteraction('button_click', 'track_page_view_button');
    setAnalyticsData(analytics.getAnalytics());
    
    // Show visual feedback
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #dc143c, #ff6b6b);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 1000;
        font-weight: bold;
      ">
        📊 Page view tracked successfully!
      </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 3000);
  };

  const handleShowAnalytics = () => {
    const data = analytics.getAnalytics();
    setAnalyticsData(data);
    console.log('Analytics Data:', data);
    
    // Show modal notification that closes when clicking outside
    const overlay = document.createElement('div');
    overlay.innerHTML = `
      <div id="analytics-overlay" style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div id="analytics-modal" style="
          background: linear-gradient(135deg, #1565c0, #42a5f5);
          color: white;
          padding: 24px 32px;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
          max-width: 400px;
          width: 90%;
          text-align: center;
        ">
          <div style="font-weight: bold; margin-bottom: 16px; font-size: 18px;">📊 Analytics Summary</div>
          <div style="margin-bottom: 8px;">Page Views: ${data.summary.totalPageViews}</div>
          <div style="margin-bottom: 8px;">Interactions: ${data.summary.totalInteractions}</div>
          <div style="margin-bottom: 16px;">Session Duration: ${data.summary.sessionDuration}</div>
          <div style="font-size: 12px; opacity: 0.8; margin-bottom: 12px;">Check console for detailed data</div>
          <div style="font-size: 12px; opacity: 0.6;">Click outside to close</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Close when clicking outside the modal
    overlay.addEventListener('click', (e) => {
      const modal = document.getElementById('analytics-modal');
      if (e.target === overlay || !modal?.contains(e.target as Node)) {
        document.body.removeChild(overlay);
      }
    });
    
    // Auto close after 10 seconds
    setTimeout(() => {
      if (document.body.contains(overlay)) {
        document.body.removeChild(overlay);
      }
    }, 10000);
  };

  return (
    <CartProvider>
      <div className="container">
        <header className="header">
          <h1 data-testid="app-title">🕷️ Spider-Man Store</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              data-testid="track-page-view-btn"
              onClick={handleTrackPageView}
              style={{
                padding: '8px 16px',
                background: 'linear-gradient(135deg, #dc143c, #ff6b6b)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                boxShadow: '0 2px 8px rgba(220, 20, 60, 0.3)',
                transition: 'all 0.2s ease',
              }}
            >
              Track Page View
            </button>
            <button 
              data-testid="show-analytics-btn"
              onClick={handleShowAnalytics}
              style={{
                padding: '8px 16px',
                background: 'linear-gradient(135deg, #1565c0, #42a5f5)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                boxShadow: '0 2px 8px rgba(21, 101, 192, 0.3)',
                transition: 'all 0.2s ease',
              }}
            >
              Show Analytics
            </button>
          </div>
        </header>

        <main className="main-content">
          <section>
            <h2>Products</h2>
            <ProductList />
          </section>

          <aside>
            <h2>Shopping Cart</h2>
            <Cart />
          </aside>
        </main>
      </div>
    </CartProvider>
  );
}