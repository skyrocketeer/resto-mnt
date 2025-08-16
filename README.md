# Complete POS System

A modern Point of Sale system built with:
- **Backend**: Golang with raw SQL
- **Frontend**: TanStack Start with Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL
- **Infrastructure**: Docker

## Features

### Core POS Functionality
- **Order Management**: Create, modify, and track customer orders
- **Serving Workflow**: Kitchen display system with order status tracking
- **Checkout & Payment**: Complete payment processing with cash and card simulation
- **Product Management**: Manage menu items, categories, and pricing
- **Table Management**: Track orders by table/location
- **Staff Management**: User roles and permissions

### System Architecture
```
├── backend/          # Golang REST API
├── frontend/         # TanStack Start app
├── database/         # SQL schema and migrations
├── docker/           # Docker configuration
└── docs/             # Documentation
```

## Quick Start

```bash
# Start the entire system
docker-compose up -d

# Access the applications
Frontend: http://localhost:3000
Backend API: http://localhost:8080
Database: localhost:5432
```

## Development

```bash
# Start in development mode
docker-compose -f docker-compose.dev.yml up

# Run backend only
cd backend && go run main.go

# Run frontend only
cd frontend && npm run dev
```

