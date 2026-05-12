# Salary Management Tool

A full-stack salary management application for organizations with 10,000 employees, built with **Node.js/Express** + **MongoDB** (backend) and **React/Vite** (frontend).

## 🎯 Features

### Employee Management
- Add, view, update, and delete employees via a modern UI
- Server-side pagination, search, and filtering
- Full employee profiles with name, job title, department, country, salary, and hire date

### Salary Insights Dashboard
- Min, max, average salary per country
- Average salary by job title per country
- Department-level headcount and salary summaries
- Salary distribution histogram
- Interactive charts with filtering

## 🏗️ Architecture

```
┌──────────────────────┐     ┌──────────────────────────────────┐
│   React + Vite       │     │   Node.js + Express              │
│   - Ant Design       │────▶│   Routes → Services → Repos      │
│   - Recharts         │     │   - Zod Validation               │
│   - React Query      │     │   - Error Handling               │
└──────────────────────┘     └──────────────┬───────────────────┘
                                            │
                                  ┌─────────▼─────────┐
                                  │     MongoDB        │
                                  │   (Mongoose ODM)   │
                                  └───────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)

### Setup

```bash
# Clone the repository
git clone <repo-url>
cd incubyte-assesment

# Install all dependencies
npm install
cd server && npm install
cd ../client && npm install
cd ..

# Configure environment
cp server/.env.example server/.env
# Edit server/.env with your MongoDB URI

# Seed the database (10,000 employees)
npm run seed

# Start both servers
npm run dev
```

### Available Scripts (from root)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start **both** server (port 5000) & client (port 5173) |
| `npm run dev:server` | Start server only |
| `npm run dev:client` | Start client only |
| `npm test` | Run all tests (server + client) |
| `npm run test:server` | Server tests only |
| `npm run test:client` | Client tests only |
| `npm run seed` | Seed database with 10,000 employees |

### Running Tests

```bash
# Run all tests
npm test

# Server tests with coverage
cd server && npm run test:coverage
```

## 📁 Project Structure

```
├── server/           # Backend API (Node.js + Express)
│   ├── src/
│   │   ├── config/   # Database connection
│   │   ├── models/   # Mongoose schemas
│   │   ├── repositories/  # Data access layer
│   │   ├── services/      # Business logic
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Error handling, validation
│   │   └── db/            # Seed script
│   └── tests/        # Jest + Supertest tests
├── client/           # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   ├── pages/         # Page components
│   │   └── api/           # API client
│   └── tests/        # Vitest + RTL tests
└── docs/             # Architecture & design docs
```

## 🧪 Development Approach

This project follows **Test-Driven Development (TDD)** with Red → Green → Refactor cycles. Each commit represents an incremental step in the development process.

## 📄 License

MIT
