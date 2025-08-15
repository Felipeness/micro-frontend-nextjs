// Component testing support file
import './commands';
import '@cypress/code-coverage/support';

// Mount command for React components
import { mount } from 'cypress/react18';

Cypress.Commands.add('mount', mount);