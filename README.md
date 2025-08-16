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
# Start the entire system (easiest way)
make dev

# Or use Docker Compose directly
docker-compose up -d

# Access the applications
Frontend: http://localhost:3000
Backend API: http://localhost:8080
Database: localhost:5432
```

## Available Make Commands

```bash
# Development
make help         # Show all available commands
make dev          # Start development environment with hot reloading
make up           # Start Docker containers
make down         # Stop Docker containers
make restart      # Restart all services

# Database Management
make create-admin # Create a super admin user
make backup       # Backup database and files
make restore      # Restore from backup
make remove-data  # Remove all data (DESTRUCTIVE)
make db-reset     # Reset database with fresh schema and seed data
make db-shell     # Access PostgreSQL shell

# Utilities
make logs         # View all service logs
make status       # Show service status
make clean        # Clean up Docker resources
make test         # Run tests
make lint         # Run linting
```

## Development

```bash
# Start in development mode (with hot reloading)
make dev

# Or manually start individual services
cd backend && go run main.go
cd frontend && npm run dev
```

