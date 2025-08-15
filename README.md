# Micro Frontend Monorepo

Uma arquitetura de micro frontend completa usando Next.js, Module Federation, TypeScript, com observabilidade, métricas RED/USE, testes unitários e E2E.

## 🏗️ Arquitetura

- **Host** (porta 3000): Aplicação principal que consome os micro frontends
- **Remote Products** (porta 3001): Micro frontend para gestão de produtos
- **Remote Cart** (porta 3002): Micro frontend para carrinho de compras

## 📦 Packages Compartilhados

- **http-client**: Cliente HTTP com retry exponencial, jitter e idempotência
- **telemetry**: Observabilidade com OpenTelemetry e métricas RED/USE

## 🚀 Getting Started

### Pré-requisitos

- Node.js 18+
- pnpm

### Instalação

```bash
# Instalar dependências
pnpm install

# Build dos packages
pnpm --filter http-client build
pnpm --filter telemetry build

# Executar em desenvolvimento
pnpm dev
```

### URLs de Desenvolvimento

- Host: http://localhost:3000
- Remote Products: http://localhost:3001
- Remote Cart: http://localhost:3002

## 🧪 Testes

```bash
# Testes unitários
pnpm test

# Testes E2E
pnpm test:e2e

# Type checking
pnpm type-check

# Linting
pnpm lint
```

## 📊 Observabilidade

### Métricas RED (Rate, Error, Duration)

- **Rate**: Número de requisições por minuto
- **Error**: Taxa de erro das requisições
- **Duration**: Latência das requisições (avg, p50, p95, p99)

### Métricas USE (Utilization, Saturation, Errors)

- **Utilization**: Utilização do sistema
- **Saturation**: Saturação (baseada na latência p95)
- **Errors**: Taxa de erro

### OpenTelemetry

- Tracing distribuído para requisições HTTP
- Instrumentação automática de fetch/XHR
- Spans customizados para operações de negócio

## 🔄 Cliente HTTP

Características do cliente HTTP:

- **Retry Exponencial**: Tentativas automáticas com backoff exponencial
- **Jitter**: Randomização para evitar thundering herd
- **Idempotência**: Chaves de idempotência para evitar duplicação
- **Métricas**: Coleta automática de métricas RED/USE
- **Observabilidade**: Integração com OpenTelemetry

### Exemplo de Uso

```typescript
import { httpClient } from 'http-client';

const response = await httpClient.get('/api/products', {
  retryConfig: {
    maxRetries: 3,
    baseDelay: 1000,
    jitterEnabled: true,
  },
  idempotencyKey: 'fetch-products',
});
```

## 🏛️ Module Federation

### Configuração

Cada remote expõe componentes que podem ser consumidos pelo host:

**Remote Products expõe:**
- `./ProductList`
- `./ProductCard`

**Remote Cart expõe:**
- `./Cart`
- `./CartButton`

### Consumo no Host

```typescript
const ProductList = lazy(() => import('remote-products/ProductList'));
const Cart = lazy(() => import('remote-cart/Cart'));
```

## 📁 Estrutura do Projeto

```
micro-front/
├── apps/
│   ├── host/                 # Aplicação principal
│   ├── remote-products/      # Micro frontend de produtos
│   └── remote-cart/          # Micro frontend de carrinho
├── packages/
│   ├── http-client/          # Cliente HTTP compartilhado
│   └── telemetry/            # Observabilidade compartilhada
├── pnpm-workspace.yaml       # Configuração do workspace
├── tsconfig.json             # TypeScript base
├── jest.config.base.js       # Jest base
└── README.md
```

## 🔧 Scripts Disponíveis

- `pnpm dev`: Executa todos os projetos em desenvolvimento
- `pnpm build`: Build de produção de todos os projetos  
- `pnpm test`: Executa testes unitários
- `pnpm test:e2e`: Executa testes E2E
- `pnpm lint`: Linting de todos os projetos
- `pnpm type-check`: Verificação de tipos

## 🚀 Deploy

Para produção, cada micro frontend deve ser deployado independentemente:

```bash
# Build de produção
pnpm build

# Deploy individual de cada app
pnpm --filter host build && pnpm --filter host start
pnpm --filter remote-products build && pnpm --filter remote-products start  
pnpm --filter remote-cart build && pnpm --filter remote-cart start
```

## 📈 Monitoramento

O sistema coleta automaticamente:

- Métricas de performance HTTP
- Traces distribuídos
- Métricas de negócio customizadas
- Interações do usuário
- Page views

Acesse as métricas através do `telemetryService`:

```typescript
// Métricas RED
const redMetrics = telemetryService.getRedMetrics();

// Métricas USE  
const useMetrics = telemetryService.getUseMetrics();

// Métricas customizadas
const metrics = telemetryService.getCustomMetrics();
metrics.businessMetric('conversion_rate', 0.15);
```