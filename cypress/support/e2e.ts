// Import Cypress commands
import './commands';

// Import code coverage
import '@cypress/code-coverage/support';

// Import cypress-real-events
import 'cypress-real-events';

// Disable uncaught exception handling for better test stability
Cypress.on('uncaught:exception', (err, runnable) => {
  // Module Federation and React errors we want to ignore
  if (err.message.includes('ChunkLoadError') || 
      err.message.includes('Loading chunk') ||
      err.message.includes('Module Federation')) {
    return false;
  }
  
  // Don't fail on unhandled promise rejections in development
  if (err.message.includes('Unhandled promise rejection')) {
    return false;
  }
  
  return true;
});

// Global before hook
beforeEach(() => {
  // Clear localStorage and sessionStorage
  cy.clearLocalStorage();
  cy.clearCookies();
  
  // Intercept analytics and telemetry calls to prevent network errors
  cy.intercept('POST', '**/analytics/**', { statusCode: 200 }).as('analytics');
  cy.intercept('POST', '**/telemetry/**', { statusCode: 200 }).as('telemetry');
});