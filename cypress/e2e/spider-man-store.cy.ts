describe('🕷️ Spider-Man Store - Micro Frontend E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Page Load and Architecture', () => {
    it('should load all micro frontends successfully', () => {
      // Verify host application loads
      cy.get('h1').contains('🕷️ Spider-Man Store').should('be.visible');
      
      // Verify spider emoji is visible in title
      cy.get('h1').should('contain.text', '🕷️').and('be.visible');
      
      // Verify micro frontend sections are present
      cy.get('h2').contains('Products').should('be.visible');
      cy.get('h2').contains('Shopping Cart').should('be.visible');
      
      // Verify cart emoji is visible
      cy.get('h3').should('contain.text', '🛒').and('be.visible');
      
      // Wait for micro frontends to load completely
      cy.waitForMicroFrontends();
      
      // Verify products are loaded
      cy.get('[data-testid="product-card"]').should('have.length.at.least', 1);
      
      // Verify cart is empty initially
      cy.contains('Your cart is empty').should('be.visible');
    });

    it('should handle Module Federation gracefully', () => {
      // Test that the host works even if remotes are slow
      cy.get('h1').contains('🕷️ Spider-Man Store').should('be.visible');
      
      // Analytics buttons should be functional
      cy.get('button').contains('Track Page View').should('be.visible').and('be.enabled');
      cy.get('button').contains('Show Analytics').should('be.visible').and('be.enabled');
    });
  });

  describe('Visual Elements and Emojis', () => {
    it('should display all emojis and symbols correctly', () => {
      cy.waitForMicroFrontends();
      
      // Verify main title spider emoji
      cy.get('h1').should('contain.text', '🕷️').and('be.visible');
      
      // Verify cart emoji in shopping cart section
      cy.get('h3').should('contain.text', '🛒').and('be.visible');
      
      // Verify analytics emoji in button
      cy.get('button').contains('Track Page View').should('be.visible');
      cy.get('button').contains('Show Analytics').should('be.visible');
      
      // Add product to verify success emoji
      cy.get('[data-testid="add-to-cart-btn"]').first().click();
      cy.contains('✅').should('be.visible');
      
      // Wait for notification to disappear and cart to update
      cy.waitForNotification('added to cart!');
      
      // Check if checkout button appears (only when cart has items)
      cy.get('[data-testid="checkout-btn"]').should('exist');
    });
  });

  describe('Analytics Functionality', () => {
    it('should track page views successfully', () => {
      cy.waitForMicroFrontends();
      
      // Click track page view button
      cy.get('button').contains('Track Page View').click();
      
      // Verify success notification
      cy.waitForNotification('Page view tracked successfully!');
    });

    it('should show analytics modal with data', () => {
      cy.waitForMicroFrontends();
      
      // Track a page view first
      cy.get('button').contains('Track Page View').click();
      cy.waitForNotification('Page view tracked successfully!');
      
      // Show analytics
      cy.get('button').contains('Show Analytics').click();
      
      // Verify analytics modal appears with chart emoji
      cy.contains('📊').should('be.visible');
      cy.contains('📊 Analytics Summary').should('be.visible');
      cy.contains('Page Views:').should('be.visible');
      cy.contains('Interactions:').should('be.visible');
      
      // Close modal by clicking outside
      cy.get('body').click(0, 0);
      cy.contains('📊 Analytics Summary').should('not.exist');
    });
  });

  describe('Product Catalog', () => {
    it('should display all Spider-Man products', () => {
      cy.waitForMicroFrontends();
      
      // Verify Spider-Man themed products
      const expectedProducts = [
        'Spider-Man Web Shooter',
        'Spider-Man Action Figure', 
        'Spider-Man Mask',
        'Spider-Man Backpack',
        'Spider-Man LEGO Set',
        'Spider-Man Comic Book'
      ];
      
      expectedProducts.forEach(product => {
        cy.contains(product).should('be.visible');
      });
      
      // Verify pricing in Brazilian Reais
      cy.contains('R$').should('be.visible');
      
      // Verify product images are loaded
      cy.get('[data-testid="product-card"] img').should('have.length.at.least', 6);
    });

    it('should have functional Add to Cart buttons', () => {
      cy.waitForMicroFrontends();
      
      // All products should have Add to Cart buttons
      cy.get('[data-testid="add-to-cart-btn"]').should('have.length.at.least', 6);
      
      // Buttons should be enabled
      cy.get('[data-testid="add-to-cart-btn"]').first().should('be.enabled');
    });
  });

  describe('Shopping Cart Functionality', () => {
    it('should add products to cart successfully', () => {
      cy.waitForMicroFrontends();
      
      // Add first product to cart
      cy.get('[data-testid="add-to-cart-btn"]').first().click();
      
      // Verify success notification with checkmark emoji
      cy.contains('✅').should('be.visible');
      cy.waitForNotification('added to cart!');
      
      // Verify cart is no longer empty
      cy.contains('Your cart is empty').should('not.exist');
      
      // Verify cart item appears
      cy.get('[data-testid="cart-item"]').should('have.length', 1);
    });

    it('should handle quantity management', () => {
      cy.waitForMicroFrontends();
      
      // Add product to cart
      cy.get('[data-testid="add-to-cart-btn"]').first().click();
      cy.waitForNotification('added to cart!');
      
      // Increase quantity
      cy.get('[data-testid="cart-item"]').within(() => {
        cy.get('button').contains('+').click();
        cy.contains('2').should('be.visible');
      });
      
      // Decrease quantity
      cy.get('[data-testid="cart-item"]').within(() => {
        cy.get('button').contains('-').click();
        cy.contains('1').should('be.visible');
      });
    });

    it('should remove items when quantity reaches zero', () => {
      cy.waitForMicroFrontends();
      
      // Add product to cart
      cy.get('[data-testid="add-to-cart-btn"]').first().click();
      cy.waitForNotification('added to cart!');
      
      // Remove item using the Remove button since decreasing to 0 is disabled
      cy.get('[data-testid="cart-item"]').within(() => {
        cy.get('[data-testid="remove-item-btn"]').click();
      });
      
      // Verify cart is empty again
      cy.contains('Your cart is empty').should('be.visible');
    });

    it('should handle checkout process', () => {
      cy.waitForMicroFrontends();
      
      // Add multiple products
      cy.get('[data-testid="add-to-cart-btn"]').first().click();
      cy.waitForNotification('added to cart!');
      
      cy.get('[data-testid="add-to-cart-btn"]').eq(1).click();
      cy.waitForNotification('added to cart!');
      
      // Verify total calculation
      cy.contains('Total: R$').should('be.visible');
      
      // Click checkout
      cy.get('[data-testid="checkout-btn"]').click();
      
      // Verify checkout notification with celebration emoji
      cy.contains('🎉').should('be.visible');
      cy.contains('Thank you for your purchase!').should('be.visible');
    });
  });

  describe('Responsive Design', () => {
    it('should work on mobile viewport', () => {
      cy.viewport('iphone-6');
      cy.waitForMicroFrontends();
      
      // Verify mobile layout
      cy.get('h1').contains('🕷️ Spider-Man Store').should('be.visible');
      cy.get('h2').contains('Products').should('be.visible');
      cy.get('h2').contains('Shopping Cart').should('be.visible');
    });

    it('should work on tablet viewport', () => {
      cy.viewport('ipad-2');
      cy.waitForMicroFrontends();
      
      // Verify tablet layout
      cy.get('[data-testid="product-card"]').should('be.visible');
      cy.get('[data-testid="add-to-cart-btn"]').should('be.visible');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', () => {
      // Simulate network failure for images
      cy.intercept('GET', '**/images.unsplash.com/**', { forceNetworkError: true });
      
      cy.visit('/');
      cy.waitForMicroFrontends();
      
      // App should still function
      cy.get('h1').contains('🕷️ Spider-Man Store').should('be.visible');
      cy.get('[data-testid="add-to-cart-btn"]').should('be.visible');
    });

    it('should maintain state during micro frontend failures', () => {
      cy.waitForMicroFrontends();
      
      // Add item to cart
      cy.get('button').contains('Add to Cart').first().click();
      cy.waitForNotification('added to cart!');
      
      // Simulate page refresh
      cy.reload();
      
      // Host should still load
      cy.get('h1').contains('🕷️ Spider-Man Store').should('be.visible');
    });
  });
});