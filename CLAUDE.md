# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
# Install dependencies and build packages in correct order
pnpm install
pnpm --filter http-client build
pnpm --filter telemetry build

# Start all services (host + remotes)
pnpm dev

# Individual service development
pnpm --filter host dev          # Host app (port 3000)
pnpm --filter remote-products dev  # Products remote (port 3001) 
pnpm --filter remote-cart dev      # Cart remote (port 3002)
```

### Build & Deploy
```bash
# Build all projects
pnpm build

# Individual builds
pnpm --filter host build
pnpm --filter remote-products build
pnpm --filter remote-cart build
```

### Testing
```bash
# All unit tests
pnpm test

# Individual app tests
pnpm --filter host test
pnpm --filter http-client test

# E2E tests (requires all services running)
pnpm test:e2e

# Single test file
pnpm --filter host test -- TelemetryProvider.test.tsx
```

### Quality & Type Safety
```bash
# TypeScript checking across all projects
pnpm type-check

# Linting across all projects  
pnpm lint

# Individual project type checking
pnpm --filter host type-check
```

## Architecture

### Module Federation Setup
This is a Next.js micro frontend using Module Federation with the following structure:

- **Host App** (`apps/host`): Main application that consumes remote components
- **Remote Products** (`apps/remote-products`): Exposes ProductList and ProductCard components
- **Remote Cart** (`apps/remote-cart`): Exposes Cart and CartButton components

**Critical Module Federation Requirements:**
- Environment variable `NEXT_PRIVATE_LOCAL_WEBPACK=true` must be set for all Next.js apps
- React/React-DOM are configured as singletons with `requiredVersion: false` to avoid version conflicts
- Remote components are wrapped in client-side wrappers (`ProductListWrapper`, `CartWrapper`) to handle SSR issues
- Dynamic imports use `ssr: false` to prevent server-side rendering conflicts
- All pages use `getServerSideProps` to force client-side rendering

### Shared Packages

**http-client** (`packages/http-client`):
- Robust HTTP client with exponential backoff retry, jitter, and idempotency
- Auto-metrics collection (RED/USE patterns)
- TypeScript interfaces: `RequestConfig`, `HttpResponse`, `HttpError`, `RetryConfig`
- Mock telemetry service currently in place (see line 18-36 in http-client.ts)

**telemetry** (`packages/telemetry`):
- OpenTelemetry implementation for distributed tracing
- RED (Rate, Error, Duration) and USE (Utilization, Saturation, Errors) metrics
- Custom spans and business metrics tracking

### Key Development Patterns

**Adding New Remote Components:**
1. Create component in appropriate remote (`apps/remote-*/src/components/`)
2. Create client-side wrapper with `useState(false)` + `useEffect(() => setIsClient(true))` pattern
3. Export wrapper in `next.config.js` exposes section
4. Import in host using `dynamic()` with `ssr: false`
5. Add TypeScript declarations in `apps/host/src/types/remote-*/index.d.ts`

**Package Dependencies:**
- Shared packages must be built before apps: `http-client` and `telemetry` before any app
- Apps reference packages via `workspace:*` in package.json
- `transpilePackages` configured in next.config.js for shared packages

**Testing Structure:**
- Shared Jest config in `jest.config.base.js`
- Individual Jest configs extend base config
- E2E tests only in host app using Playwright
- Test setup files import `@testing-library/jest-dom`

### Environment & Ports
- Host: http://localhost:3000
- Remote Products: http://localhost:3001  
- Remote Cart: http://localhost:3002
- All remotes serve Module Federation manifests at `/_next/static/chunks/remoteEntry.js`

### Critical Notes
- Never use regular imports for remote components - always use dynamic imports
- SSR is disabled for all Module Federation components to prevent React context conflicts
- Webpack 5 is required and explicitly installed in root package.json
- PNPM workspace manages monorepo dependencies and ensures correct build order