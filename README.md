# 🕷️ Spider-Man Store - Micro Frontend Architecture

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![Module Federation](https://img.shields.io/badge/Module%20Federation-Webpack%205-orange?logo=webpack)](https://webpack.js.org/concepts/module-federation/)
[![Test Coverage](https://img.shields.io/badge/Coverage-85%25-green?logo=jest)](https://jestjs.io/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> Complete micro frontend e-commerce application built with Next.js, Module Federation, and modern web technologies

## 🌟 Demo & Live Preview

**Live Demo**: [🕷️ Spider-Man Store](https://host-taupe.vercel.app) *(Micro Frontend in Action)*

**Individual Micro Frontends**:
- **Products Service**: [Products Catalog](https://remote-products.vercel.app)
- **Cart Service**: [Shopping Cart](https://remote-cart.vercel.app)
- **Host Application**: [Complete Store](https://host-taupe.vercel.app)

### Quick Demo in 30 seconds:
1. **Browse Products**: View Spider-Man themed items with pricing
2. **Add to Cart**: Click any product to add it to your cart
3. **Real-time Updates**: Cart updates instantly across all micro frontends
4. **Checkout**: Complete the purchase flow with notifications

## 📋 Table of Contents

- [Demo & Live Preview](#-demo--live-preview)
- [Overview](#overview)
- [Architecture](#architecture)
- [Micro Frontend Communication](#micro-frontend-communication)
- [Features](#features)
- [Performance](#-performance)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Technologies](#technologies)
- [Testing](#testing)
- [Development Guidelines](#development-guidelines)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

## 🎯 Overview

This project demonstrates a production-ready micro frontend architecture using **Next.js** and **Module Federation**. It features a Spider-Man themed e-commerce store with three independent applications working together seamlessly.

The architecture showcases modern patterns for building scalable, maintainable, and independently deployable frontend applications.

## 🏗️ Architecture

```mermaid
graph TB
    subgraph "Host Application (Port 3000)"
        H[Host App]
        H --> HC[Cart Context]
        H --> HA[Analytics]
        H --> HL[Layout & Routing]
    end
    
    subgraph "Remote Products (Port 3001)"
        P[Products App]
        P --> PL[Product List]
        P --> PC[Product Cards]
    end
    
    subgraph "Remote Cart (Port 3002)"
        C[Cart App]
        C --> CC[Cart Component]
        C --> CB[Cart Buttons]
    end
    
    H -.->|Module Federation| P
    H -.->|Module Federation| C
    P -.->|Global Context| HC
    C -.->|Global Context| HC
```

### Applications Overview

| Application | Port | Responsibility | Exposes |
|-------------|------|---------------|---------|
| **Host** | 3000 | Main orchestrator, layout, state management | CartProvider, Analytics |
| **Products** | 3001 | Product catalog and related components | ProductList, ProductCard |
| **Cart** | 3002 | Shopping cart functionality | Cart, CartButton |

## 🔄 Micro Frontend Communication

### Current Approach: Global Context via Window Object

**How it works:**
```typescript
// Host exposes cart context globally
window.__CART_CONTEXT__ = {
  addToCart: (product) => { /* ... */ },
  items: [],
  updateQuantity: (id, quantity) => { /* ... */ },
  removeItem: (id) => { /* ... */ }
}

// Remote apps access the global context
if (window.__CART_CONTEXT__) {
  window.__CART_CONTEXT__.addToCart(product);
}
```

**Why this approach?**
- ✅ **Simplicity**: Easy to implement and understand
- ✅ **Framework Agnostic**: Works with any JavaScript framework
- ✅ **Real-time Sync**: Immediate state updates across micro frontends
- ✅ **No Additional Dependencies**: No need for message buses or event systems
- ✅ **Type Safety**: Can be typed with TypeScript declarations

**Trade-offs:**
- ⚠️ **Global State**: Uses global namespace (mitigated with namespacing)
- ⚠️ **Polling**: Uses setInterval for updates (could use observers)

### Alternative Approaches

#### 1. **Custom Events + Event Bus**
```typescript
// Publish events
window.dispatchEvent(new CustomEvent('cart:add', { 
  detail: { product } 
}));

// Subscribe to events
window.addEventListener('cart:add', (event) => {
  // Handle cart addition
});
```

**Pros:** Decoupled, event-driven, no polling  
**Cons:** More complex, harder to debug, no type safety

#### 2. **Shared State Library (Zustand/Redux)**
```typescript
// Shared store across micro frontends
import { useCartStore } from '@shared/cart-store';

const addToCart = useCartStore(state => state.addToCart);
```

**Pros:** Structured state management, devtools support  
**Cons:** Shared dependency, version conflicts, bundle duplication

#### 3. **Props Drilling from Host**
```typescript
// Host passes handlers as props
<ProductList onAddToCart={handleAddToCart} />
```

**Pros:** Explicit data flow, React-like patterns  
**Cons:** Props coupling, harder to maintain with deep nesting

#### 4. **PostMessage API**
```typescript
// Cross-frame communication
parent.postMessage({ type: 'ADD_TO_CART', product }, '*');
```

**Pros:** True isolation, works with iframes  
**Cons:** Complex serialization, performance overhead

### Why Global Context Was Chosen

1. **Rapid Prototyping**: Fastest to implement and iterate
2. **Type Safety**: Easy to add TypeScript definitions
3. **React Compatibility**: Works well with React's mental model
4. **Performance**: Direct function calls, no serialization
5. **Debugging**: Easy to inspect state in browser devtools

For production applications, consider migrating to **Custom Events** or a **Shared State Library** for better architecture.

## ✨ Features

### 🛒 E-commerce Functionality
- Product catalog with Spider-Man themed items
- Shopping cart with real-time updates
- Add/remove items with quantity management
- Checkout flow with notifications
- Pricing in Brazilian Reais (R$)

### 🏗️ Technical Features
- **Module Federation**: Runtime code sharing between applications
- **HTTP Client**: Robust client with exponential backoff retry, jitter, and idempotency
- **OpenTelemetry**: Distributed tracing and observability with RED/USE metrics
- **Analytics**: Page view and interaction tracking
- **Responsive Design**: Mobile-first approach with modern CSS
- **Error Handling**: Graceful degradation and error boundaries

### 🧪 Quality Assurance
- **Unit Tests**: Jest + Testing Library for component testing
- **E2E Tests**: Playwright for integration testing
- **TypeScript**: Full type safety across all applications
- **Linting**: ESLint with consistent code standards

## 🚀 Performance

### Bundle Analysis
- **Host App**: ~180KB (gzipped)
- **Products Remote**: ~95KB (gzipped)  
- **Cart Remote**: ~85KB (gzipped)
- **Shared Packages**: ~45KB (gzipped)
- **Total Bundle**: ~405KB (competitive for micro frontend architecture)

### Runtime Metrics
- **First Contentful Paint**: < 1.2s
- **Time to Interactive**: < 2.5s
- **Lighthouse Score**: 95+ (Performance)
- **Module Federation Load Time**: < 300ms per remote

### Optimization Features
- **Code Splitting**: Automatic route-based splitting
- **Lazy Loading**: Dynamic imports for remote components
- **Bundle Sharing**: React/ReactDOM shared as singletons
- **HTTP Caching**: Aggressive caching for static assets
- **Image Optimization**: Next.js Image component with WebP support

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ (LTS recommended)
- **PNPM** 8+ (for efficient package management)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/Felipeness/micro-frontend-nextjs.git
cd micro-frontend-nextjs
```

2. **Install dependencies:**
```bash
pnpm install
```

3. **Start all applications:**
```bash
pnpm run dev
```

4. **Open your browser:**
   - **Main Store**: http://localhost:3000
   - **Products Service**: http://localhost:3001
   - **Cart Service**: http://localhost:3002

### Development Workflow

```bash
# Install dependencies
pnpm install

# Start all apps in development mode
pnpm run dev

# Run tests
pnpm test

# Run E2E tests
pnpm test:e2e

# Build all applications
pnpm run build

# Type checking
pnpm run type-check

# Linting
pnpm run lint
```

## 📁 Project Structure

```
micro-frontend-nextjs/
├── 📱 apps/
│   ├── host/                     # Main application (Port 3000)
│   │   ├── src/
│   │   │   ├── components/       # Shared UI components
│   │   │   ├── context/          # React Context providers
│   │   │   ├── lib/              # Utility functions
│   │   │   └── types/            # TypeScript definitions
│   │   ├── pages/                # Next.js pages
│   │   ├── styles/               # Global styles
│   │   └── next.config.js        # Module Federation config
│   │
│   ├── remote-products/          # Products micro frontend (Port 3001)
│   │   ├── src/components/       # Product-related components
│   │   ├── pages/                # Product pages
│   │   └── next.config.js        # MF config for products
│   │
│   └── remote-cart/              # Cart micro frontend (Port 3002)
│       ├── src/components/       # Cart-related components
│       ├── pages/                # Cart pages
│       └── next.config.js        # MF config for cart
│
├── 📦 packages/
│   ├── http-client/              # Shared HTTP client with retry logic
│   │   ├── src/
│   │   │   ├── http-client.ts    # Main HTTP client
│   │   │   ├── retry.ts          # Retry mechanisms
│   │   │   └── types.ts          # TypeScript definitions
│   │   └── __tests__/            # Unit tests
│   │
│   └── telemetry/                # OpenTelemetry configuration
│       ├── src/
│       │   ├── telemetry.ts      # Tracing setup
│       │   └── types.ts          # Telemetry types
│       └── __tests__/            # Tests
│
├── 🔧 types/                     # Global TypeScript definitions
├── 📋 package.json               # Root package configuration
├── 🔒 pnpm-workspace.yaml       # PNPM workspace config
└── 📖 README.md                  # This file
```

## 🛠️ Technologies

### Core Framework
- **[Next.js 14](https://nextjs.org/)** - React framework with App Router
- **[React 18](https://react.dev/)** - UI library with concurrent features
- **[TypeScript 5](https://www.typescriptlang.org/)** - Type-safe JavaScript

### Micro Frontend Architecture
- **[Module Federation](https://webpack.js.org/concepts/module-federation/)** - Webpack 5 micro frontend solution
- **[@module-federation/nextjs-mf](https://www.npmjs.com/package/@module-federation/nextjs-mf)** - Next.js Module Federation plugin

### State Management & Communication
- **React Context** - Local state management
- **Global Context Pattern** - Cross-micro frontend communication
- **Custom Analytics** - Event tracking and user interaction monitoring

### HTTP & Observability
- **Custom HTTP Client** - With exponential backoff and jitter
- **[OpenTelemetry](https://opentelemetry.io/)** - Distributed tracing and metrics
- **RED/USE Metrics** - Request rate, error rate, duration monitoring

### Testing & Quality
- **[Jest](https://jestjs.io/)** - Unit testing framework
- **[Testing Library](https://testing-library.com/)** - React component testing
- **[Playwright](https://playwright.dev/)** - End-to-end testing
- **[ESLint](https://eslint.org/)** - Code linting and standards

### Development Tools
- **[PNPM](https://pnpm.io/)** - Fast, disk space efficient package manager
- **[Concurrently](https://www.npmjs.com/package/concurrently)** - Run multiple commands simultaneously
- **[TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)** - Monorepo type checking

## 🧪 Testing

### Test Coverage Report

| Package/App | Statements | Branches | Functions | Lines | Status |
|------------|------------|----------|-----------|-------|--------|
| **host** | 96.36% | 87.5% | 84.61% | 98.03% | ✅ Excellent |
| **http-client** | 93.28% | 96.96% | 80% | 96.09% | ✅ Excellent |
| **remote-products** | 78.57% | 85.71% | 84.61% | 78.57% | ✅ Good |
| **remote-cart** | 53.44% | 44.82% | 57.89% | 51.78% | ⚠️ Needs Improvement |

#### Components with 100% Coverage:
- ✅ **Analytics Library** - Complete tracking and session management
- ✅ **Metrics Library** - RED metrics and performance monitoring
- ✅ **Retry Utilities** - Exponential backoff and jitter implementation
- ✅ **TelemetryProvider** - OpenTelemetry integration
- ✅ **CartContext** - Shopping cart state management
- ✅ **ProductCard** - Product display component
- ✅ **ProductList** - Product catalog component

### Unit Tests
```bash
# Run all unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Test specific package
pnpm --filter http-client test
```

### E2E Tests (Cypress)
```bash
# Run Cypress tests headlessly
pnpm cypress run

# Open Cypress Test Runner
pnpm cypress open

# Run specific test file
pnpm cypress run --spec "cypress/e2e/spider-man-store.cy.ts"
```

### Integration Tests
```bash
# Run Playwright E2E tests
pnpm test:e2e

# Run E2E tests in UI mode
pnpm test:e2e:ui

# Run E2E tests for specific browser
pnpm test:e2e --project=chromium
```

### Test Structure
- **Unit Tests**: Located in `__tests__` folders within each package
- **Integration Tests**: Located in `e2e` folders within applications
- **Cypress Tests**: Located in `cypress/e2e` folder
- **Test Utilities**: Shared test helpers and mocks

### Test Statistics
- **Total Tests**: 144+ unit tests
- **E2E Tests**: 15 Cypress scenarios
- **Coverage Goal**: 85% minimum for critical paths
- **Test Execution Time**: ~3 seconds for all unit tests

## 📋 Development Guidelines

### Code Standards
- **Conventional Commits**: Use semantic commit messages
- **TypeScript Strict Mode**: All code must pass strict type checking
- **ESLint Rules**: Follow established linting rules
- **Component Structure**: Keep components small and focused

### Micro Frontend Best Practices
1. **Independent Deployments**: Each app should be deployable independently
2. **Shared Dependencies**: Minimize shared runtime dependencies
3. **Error Boundaries**: Implement proper error handling
4. **Performance**: Lazy load micro frontends when possible
5. **Testing**: Test each micro frontend in isolation

### Adding New Micro Frontends
1. Create new app in `apps/` directory
2. Configure Module Federation in `next.config.js`
3. Add to workspace in `pnpm-workspace.yaml`
4. Update host application to consume new remote
5. Add appropriate tests and documentation

---

## 🚀 Deployment

### Vercel (Recommended)
The easiest way to deploy this micro frontend architecture:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy each application
cd apps/host && vercel --prod
cd apps/remote-products && vercel --prod  
cd apps/remote-cart && vercel --prod
```

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build individual containers
docker build -t spider-man-host ./apps/host
docker build -t spider-man-products ./apps/remote-products
docker build -t spider-man-cart ./apps/remote-cart
```

### Environment Variables
Create `.env.local` files in each app with:
```env
# Host App
NEXT_PUBLIC_PRODUCTS_URL=https://your-products-app.vercel.app
NEXT_PUBLIC_CART_URL=https://your-cart-app.vercel.app
NEXT_PRIVATE_LOCAL_WEBPACK=true

# Remote Apps  
NEXT_PUBLIC_HOST_URL=https://your-host-app.vercel.app
```

### Production Considerations
- **CDN**: Use a CDN for static assets and Module Federation remotes
- **CORS**: Configure CORS policies for cross-origin module loading
- **Error Monitoring**: Add Sentry or similar for production error tracking
- **Load Balancing**: Consider load balancers for high-traffic deployments

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Process
1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/your-username/micro-frontend-nextjs.git`
3. **Create** a feature branch: `git checkout -b feature/amazing-feature`
4. **Install** dependencies: `pnpm install`
5. **Make** your changes following our [coding standards](#code-standards)
6. **Test** your changes: `pnpm test && pnpm test:e2e`
7. **Commit** using conventional commits: `git commit -m "feat: add amazing feature"`
8. **Push** to your branch: `git push origin feature/amazing-feature`
9. **Open** a Pull Request

### What We're Looking For
- 🐛 **Bug Fixes**: Issues with existing functionality
- ✨ **New Features**: Additional micro frontend capabilities
- 📚 **Documentation**: Improvements to docs and examples
- 🧪 **Tests**: Better test coverage and quality
- 🚀 **Performance**: Optimization improvements
- 🎨 **UI/UX**: Better user experience and design

### Code Review Process
- All submissions require review by project maintainers
- We use automated checks (tests, linting, type checking)
- Feedback is usually provided within 48 hours
- Breaking changes require documentation updates

### Getting Help
- 💬 **Discussions**: Use GitHub Discussions for questions
- 🐛 **Issues**: Use GitHub Issues for bug reports
- 📧 **Email**: Contact maintainers for sensitive matters

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 📞 Support & Community

### Getting Help
- 📖 **Documentation**: Check this README and inline code comments
- 🔍 **Issues**: Search existing issues before creating new ones
- 💡 **Discussions**: Use GitHub Discussions for questions and ideas
- 📧 **Direct Contact**: Reach out to [@Felipeness](https://github.com/Felipeness)

### Community
- ⭐ **Star** this repo if you find it helpful
- 🍴 **Fork** to create your own version
- 📢 **Share** with others who might benefit
- 🤝 **Contribute** to make it even better

---

*Made with ❤️ by [Felipe Ness](https://github.com/Felipeness) - Building the future of micro frontends*