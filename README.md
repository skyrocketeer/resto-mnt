# Complete POS System

A modern Point of Sale system built with:
- **Backend**: Golang with raw SQL
- **Frontend**: TanStack Start with Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL
- **Infrastructure**: Docker

## Features

### Core POS Functionality
- **Order Management**: Create, modify, and track customer orders with real-time updates
- **Kitchen Workflow**: Advanced kitchen display system with preparation time tracking
- **Payment Processing**: Complete multi-step payment flow with receipt generation
- **Product Management**: Full menu and category management system
- **Table Management**: Comprehensive table and seating arrangement system
- **Multi-Role Support**: Role-based access control (Admin, Manager, Server, Counter, Kitchen)

### Advanced Admin Features
- **Comprehensive Admin Dashboard**: Complete control center with navigation to all system areas
- **Role-Based Interface Switching**: Admin can access and monitor all role interfaces
- **Staff Management**: Create, manage, and delete user accounts with role assignments
- **Financial Reporting**: Income reports, sales analytics, and performance metrics
- **System Settings**: Restaurant configuration, currency, tax rates, and operational settings
- **Menu Management**: Full CRUD operations for categories and products with pricing control

### Role-Specific Interfaces
- **Admin**: Full system access with comprehensive management dashboard
- **Server**: Streamlined dine-in order creation interface
- **Counter/Checkout**: All order types plus complete payment processing system
- **Kitchen**: Order preparation workflow with status updates and timing

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
docker-compose -f docker-compose.dev.yml up -d

# Access the applications
Frontend: http://localhost:3000
Backend API: http://localhost:8080/api/v1
Database: localhost:5432
```

### Demo Accounts

| Role | Username | Password | Description |
|------|----------|----------|-------------|
| **Admin** | `admin` | `admin123` | Full system access, all interfaces |
| **Manager** | `manager1` | `admin123` | Business operations and oversight |
| **Server** | `server1` / `server2` | `admin123` | Dine-in orders only |
| **Counter** | `counter1` / `counter2` | `admin123` | All orders + payment processing |
| **Kitchen** | `kitchen1` | `admin123` | Order preparation and status updates |

### First Login Experience
1. **Navigate to**: http://localhost:3000
2. **Login as Admin**: Use `admin` / `admin123` for full system access
3. **Explore Admin Dashboard**: Access all interfaces via the sidebar navigation
4. **Switch Interfaces**: Admin can view Server, Counter, Kitchen, and POS interfaces
5. **Manage System**: Create staff, manage menu, configure settings

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

## Architecture

### System Overview
```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│   Frontend (React)  │    │  Backend (Golang)   │    │ Database (PostgreSQL)│
│                     │    │                     │    │                     │
│ • TanStack Start    │◄──►│ • Gin Web Framework │◄──►│ • User Management   │
│ • TypeScript        │    │ • Raw SQL Queries   │    │ • Order System      │
│ • Tailwind CSS      │    │ • JWT Authentication│    │ • Product Catalog   │
│ • shadcn/ui         │    │ • Role-based APIs   │    │ • Financial Data    │
│ • React Query       │    │ • RESTful Endpoints │    │ • Comprehensive Logs│
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
```

### Key Technologies

**Backend Stack:**
- **Golang 1.24** - High-performance server runtime
- **Gin Framework** - Fast HTTP web framework
- **Raw SQL** - Direct database operations for maximum control
- **JWT Authentication** - Secure token-based auth
- **CORS Middleware** - Cross-origin request handling

**Frontend Stack:**
- **TanStack Start** - Full-stack React framework
- **TypeScript** - Type-safe development
- **TanStack Query** - Powerful data synchronization
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern component library

**Database:**
- **PostgreSQL 15** - Robust relational database
- **Comprehensive Schema** - Users, orders, products, payments
- **Role-based Security** - Database-level access control
- **Optimized Queries** - Indexed for performance

### Development Guidelines
The project includes comprehensive **Cursor Rules** for:
- Admin interface development patterns
- Role-based access control implementation
- Authentication flow best practices
- React hooks usage and common pitfalls
- API integration patterns

