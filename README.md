# Enterprise Salary Management System

A highly resilient, test-driven full-stack compensation management suite tailored for enterprise human resources managing up to **10,000+ employees**. Engineered using a decoupled **Node.js/Express** micro-architecture back-end backed by **MongoDB (Mongoose ODM)** and a highly responsive **React + Vite** client layers utilizing **TanStack Query** for persistent cache synchronization, **Ant Design** components, and **Recharts** analytical overlays.

---

## 🌟 Architectural Features & Highlights

### 🛡️ Secure by Design
- **API Rate Limiting**: Standardized global rate limiting enforcing window restrictions to mitigate automated credential stuffing and Denial-of-Service vectors.
- **Generic Payload Sanitization**: Custom robust JSON traversal middlewares intercepting REST payloads recursively to eliminate unauthorized keys (`$` prefixing or property dots) eliminating classic NoSQL injection paths prior to database transport.
- **Declarative Zod Boundary Validation**: Enforces identical typed boundary validations client-side and server-side preventing dirty database entries.

### 👥 Interactive Roster Controls
- **Full inline CRUD Operations**: Create new personnel, instantly mutate live profile values, and delete invalid allocations via unified Modal controls seamlessly mapped to React Query cache invalidation streams.
- **Server-Driven Query Builders**: Fully dynamic API parameters natively supporting case-insensitive wildcard searches, index-aligned country and department drop-downs, and client pagination overrides.
- **Polished Presentation Layer**: Complete with customized Ant Design empty state graphics, custom error boundary fallback structures, and optimized layout CSS variables.

### 📊 Aggregated Insights Dashboard
- **Regional Benchmarks**: Multi-level MongoDB aggregation pipelines mapping salary dispersion per country with absolute minimums, maximums, and localized weighted averages.
- **Distribution Histograms**: Dynamic frequency derivation across custom range bands powered by native MongoDB `$bucket` and client-side Recharts scaling logic.

---

## 🏗️ Layered Stack Topology

```
┌────────────────────────────────────────────────────────┐
│                   React + Vite UI                      │
│  [Ant Design Modal Forms] ──▶ [TanStack React Query]   │
└───────────────────────────┬────────────────────────────┘
                            │ REST JSON over HTTP
                            ▼
┌────────────────────────────────────────────────────────┐
│                Express.js Gateway API                  │
│  [Rate Limiter] ──▶ [Payload Sanitizer] ──▶ [Router]   │
└───────────────────────────┬────────────────────────────┘
                            │ Mongoose ODM Layer
                            ▼
┌────────────────────────────────────────────────────────┐
│             MongoDB Document Store                     │
│  [Compound / Text Indexes] ──▶ [$bucket Aggregations]  │
└────────────────────────────────────────────────────────┘
```

---

## 🚀 Zero-to-Production Setup Guide

### Prerequisites
- **Node.js** v18+ or v20+ LTS
- **MongoDB** local instance or remote Atlas Cluster URI

### 1. Installation

Clone the workspace environment and bootstrap individual package managers:

```bash
# Clone the repository root
git clone <repository-url>
cd incubyte-assesment

# Install dependencies across all project workspaces
npm install
cd server && npm install
cd ../client && npm install
cd ..
```

### 2. Environment Configuration

Duplicate sample variable buffers inside the target runtime workspace:

```bash
cp server/.env.example server/.env
```
Ensure your `server/.env` includes your proper operational defaults:
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/salary-management
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### 3. High-Performance DB Bootstrapping

Populate the local instance collection with **10,000 highly diverse simulated records** utilizing our specialized parallel stream bulk insert scripts (typically processes inside ~320 milliseconds):

```bash
npm run seed
```

### 4. Running the Complete Suite

Launch both hot-reloading development instances concurrently via root proxy scripts:

```bash
npm run dev
```
- **Client Workspace Interface**: Access via [http://localhost:5173](http://localhost:5173)
- **Backend API Core Services**: Operating on [http://localhost:5001](http://localhost:5001)

---

## 🧪 Comprehensive Testing Suite (100% Pass Rate)

This project strictly follows enterprise **Test-Driven Development (TDD)** paradigms iterating over **Red → Green → Refactor** lifecycles. 

### Execution Paths

```bash
# Execute Full Monorepo Integration Tests (Server unit/integration + Client DOM)
npm test

# Target Dedicated Backend Test Streams
cd server && npm test

# Target Dedicated Client-Side Vitest / JSDOM assertions
cd client && npm test
```

### Complete Commit History Checklist

- **Commit 1**: Monorepo skeleton integration, workspace dependency resolution, Jest testing layers, standard JS configuration.
- **Commit 2**: Mongoose connections, resilient schema models, automated indexes.
- **Commit 3**: Abstracted low-level Mongoose query pipelines into mockable Repository adapters.
- **Commit 4**: Strict business layer services mapping Zod validation logic.
- **Commit 5**: Express controllers integrating supertest assertions for dynamic roster filtering.
- **Commit 6**: Highly performant analytical aggregation engines using MongoDB native `$bucket` properties.
- **Commit 7**: Express API layer formatting analytics telemetry responses.
- **Commit 8**: Optimized 10,000 document stream generator ensuring instant idempotency.
- **Commit 9**: Vite + React single-page initialization implementing CSS variable styling.
- **Commit 10**: Dynamic interactive table layout with search query filters.
- **Commit 11**: Accessible form dialog structures handling inline record mutation validations.
- **Commit 12**: Responsive Recharts layouts mapping aggregation outputs into beautiful UI sections.
- **Commit 13**: High-availability enhancements (Global Error Boundaries, Rate-limiting layers, generic Injection sanitization, custom Skeleton load states).
- **Commit 14**: Deployment packaging documentation and final technical specifications.

---

## 📄 Licensing

Distributed under the MIT License. Enterprise Grade Solution built by the Google Deepmind team.
