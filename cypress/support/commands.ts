// Custom Cypress commands for micro frontend testing

// Wait for micro frontends to load
Cypress.Commands.add('waitForMicroFrontends', () => {
  // Wait for the host app to load
  cy.get('h1').contains('🕷️ Spider-Man Store').should('be.visible');
  
  // Wait for remote components to start loading
  cy.get('h2').contains('Products').should('be.visible');
  cy.get('h2').contains('Shopping Cart').should('be.visible');
  
  // Wait for loading states to disappear (indicating remotes loaded)
  cy.get('body').then(($body) => {
    if ($body.text().includes('Loading products...')) {
      cy.contains('Loading products...').should('not.exist', { timeout: 15000 });
    }
    if ($body.text().includes('Loading cart...')) {
      cy.contains('Loading cart...').should('not.exist', { timeout: 15000 });
    }
  });
});

// Add product to cart by name
Cypress.Commands.add('addProductToCart', (productName: string) => {
  cy.contains('.product-card', productName)
    .find('button')
    .contains('Add to Cart')
    .click();
});

// Wait for notification to appear
Cypress.Commands.add('waitForNotification', (message: string) => {
  cy.contains(message, { timeout: 3000 }).should('be.visible');
  cy.contains(message).should('not.exist', { timeout: 5000 });
});

// Check cart item count
Cypress.Commands.add('checkCartCount', (expectedCount: number) => {
  if (expectedCount === 0) {
    cy.contains('Your cart is empty').should('be.visible');
  } else {
    cy.get('[data-testid="cart-items"]').should('have.length', expectedCount);
  }
});

// Declare custom commands for TypeScript
declare global {
  namespace Cypress {
    interface Chainable {
      waitForMicroFrontends(): Chainable<void>;
      addProductToCart(productName: string): Chainable<void>;
      waitForNotification(message: string): Chainable<void>;
      checkCartCount(expectedCount: number): Chainable<void>;
    }
  }
}