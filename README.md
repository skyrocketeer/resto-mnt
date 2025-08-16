# 🍽️ Complete POS System - Professional Restaurant Management

> **A modern, enterprise-grade Point of Sale system built for the next generation of restaurants**

[![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker&logoColor=white)](https://docker.com)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Go](https://img.shields.io/badge/Go-1.21-00ADD8?logo=go&logoColor=white)](https://golang.org)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=black)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.2-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql&logoColor=white)](https://postgresql.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.13-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

## 🌟 **Built with Modern Technologies**

- **🔧 Backend:** Golang + Gin + PostgreSQL with raw SQL for maximum performance
- **⚡ Frontend:** React + TanStack Start + TypeScript + Tailwind CSS + shadcn/ui
- **🗄️ Database:** PostgreSQL with comprehensive schema and optimized queries
- **🐳 Infrastructure:** Docker containers with Docker Compose orchestration
- **🔐 Security:** JWT authentication with role-based access control (RBAC)

---

## 📸 **Beautiful Professional Interface**

### 🍽️ Server Interface - Intuitive Order Management
![Dashboard Server Interface](gh-image/dashboard-server-interface.png)
*Clean, modern interface designed for speed and efficiency with real-time updates*

### ✨ **Enterprise-Grade Admin Tables**
Our latest update includes **professional data tables** with:
- 📊 **Advanced sorting & filtering** with TanStack Table
- 🎨 **Beautiful visual design** with gradient avatars and color-coded indicators  
- 📱 **Responsive layout** that works perfectly on tablets and desktop
- ⚡ **Real-time search** with debouncing for instant results
- 🔄 **Table/Cards view toggle** for optimal data visualization

---

## 🚀 **Core Features**

### 💼 **Complete POS Functionality**
- **📋 Order Management**: Create, modify, and track customer orders with real-time kitchen updates
- **👨‍🍳 Kitchen Workflow**: Advanced kitchen display system with preparation time tracking and status updates
- **💳 Payment Processing**: Complete multi-step payment flow with receipt generation and payment history
- **🍕 Product Management**: Full menu and category management with pricing, images, and inventory control
- **🪑 Table Management**: Comprehensive table and seating arrangement system with availability tracking
- **👥 Multi-Role Support**: Role-based access control (Admin, Manager, Server, Counter, Kitchen)

### 🏢 **Advanced Admin Features**
- **📊 Comprehensive Admin Dashboard**: Complete control center with navigation to all system areas
- **🔄 Role-Based Interface Switching**: Admin can access and monitor all role interfaces seamlessly  
- **👤 Staff Management**: Create, manage, and delete user accounts with role assignments and permissions
- **💰 Financial Reporting**: Income reports, sales analytics, and performance metrics with visual charts
- **⚙️ System Settings**: Restaurant configuration, currency settings, tax rates, and operational parameters
- **📋 Menu Management**: Full CRUD operations for categories and products with advanced table views

### 🎯 **Role-Specific Interfaces**
- **🔑 Admin**: Full system access with comprehensive management dashboard and beautiful data tables
- **🍽️ Server**: Streamlined dine-in order creation interface optimized for speed
- **💰 Counter/Checkout**: All order types plus complete payment processing system
- **👨‍🍳 Kitchen**: Order preparation workflow with status updates and timing management

---

## 🔧 **System Architecture**

```
┌─────────────────────────┐    ┌─────────────────────────┐    ┌─────────────────────────┐
│   Frontend (React)      │    │   Backend (Golang)      │    │  Database (PostgreSQL)  │
│                         │    │                         │    │                         │
│ • TanStack Start        │◄──►│ • Gin Web Framework     │◄──►│ • User Management       │
│ • TypeScript            │    │ • Raw SQL Queries       │    │ • Order System          │
│ • TanStack Table        │    │ • JWT Authentication    │    │ • Product Catalog       │
│ • Tailwind CSS          │    │ • Role-based APIs       │    │ • Financial Data        │
│ • shadcn/ui Components  │    │ • RESTful Endpoints     │    │ • Comprehensive Logs    │
│ • Real-time Updates     │    │ • CORS Middleware       │    │ • Optimized Indexes     │
└─────────────────────────┘    └─────────────────────────┘    └─────────────────────────┘
```

---

## ⚡ **Quick Start**

### 🚀 **One Command Startup**
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

### 🎭 **Demo Accounts**

| Role | Username | Password | Access Level |
|------|----------|----------|-------------|
| **👑 Admin** | `admin` | `admin123` | Full system access, all interfaces, beautiful admin tables |
| **📊 Manager** | `manager1` | `admin123` | Business operations and oversight with reporting |
| **🍽️ Server** | `server1` / `server2` | `admin123` | Dine-in orders only with streamlined interface |
| **💰 Counter** | `counter1` / `counter2` | `admin123` | All orders + complete payment processing |
| **👨‍🍳 Kitchen** | `kitchen1` | `admin123` | Order preparation and status updates |

### 🎯 **First Login Experience**
1. **🌐 Navigate to**: http://localhost:3000
2. **🔑 Login as Admin**: Use `admin` / `admin123` for full system access
3. **📊 Explore Admin Dashboard**: Access all interfaces via the beautiful sidebar navigation
4. **🔄 Switch Interfaces**: Admin can view Server, Counter, Kitchen, and POS interfaces  
5. **⚙️ Manage System**: Create staff, manage menu with professional tables, configure settings

---

## 🛠️ **Available Make Commands**

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

---

## 💻 **Technology Stack**

### **🏗️ Backend Stack**
- **⚡ Golang 1.21** - High-performance server runtime
- **🌐 Gin Framework 1.9.1** - Fast HTTP web framework with middleware support
- **🗄️ Raw SQL with PostgreSQL Driver** - Direct database operations for maximum control and performance
- **🔐 JWT Authentication (v5.2.0)** - Secure token-based authentication system
- **🛡️ CORS Middleware** - Cross-origin request handling for development and production

### **🎨 Frontend Stack**
- **⚛️ TanStack Start 1.57.15** - Full-stack React framework with file-based routing
- **⚛️ React 18.3.1** - Latest React with concurrent features and hooks
- **📝 TypeScript 5.6.2** - Type-safe development with comprehensive type definitions
- **📊 TanStack Table 8.21.3** - Powerful data table with sorting, filtering, and pagination
- **🔄 TanStack Query 5.56.2** - Powerful data synchronization and caching
- **🎨 Tailwind CSS 3.4.13** - Utility-first CSS framework for rapid UI development
- **⚡ Vite 5.4.8** - Lightning-fast build tool and dev server
- **🧩 shadcn/ui + Radix UI** - Beautiful, accessible component library

### **🗄️ Database & Infrastructure**
- **🐘 PostgreSQL 15-Alpine** - Robust relational database with advanced features
- **📋 Comprehensive Schema** - Users, orders, products, payments, and audit logs
- **🔒 Role-based Security** - Database-level access control and permissions
- **⚡ Optimized Queries** - Strategically indexed for maximum performance
- **🐳 Docker Compose** - Containerized development and production environments
- **🟢 Node.js 24.3.0** - Modern JavaScript runtime for development tools

---

## 🏆 **Key Achievements**

### ✨ **Latest Features**
- **📊 Professional Table Views**: Enterprise-grade data tables with TanStack Table integration
- **🎨 Beautiful UI/UX**: Modern design with gradient avatars, color-coded badges, and smooth animations  
- **📱 Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **⚡ Real-time Search**: Instant filtering with debouncing and visual feedback
- **🔄 View Toggle System**: Switch between table and card views for optimal data visualization

### 🎯 **Development Excellence**
- **📚 Comprehensive Documentation** - Extensive Cursor Rules and development guidelines
- **🧪 Type Safety** - Complete TypeScript integration throughout the application
- **🔒 Security First** - JWT authentication, SQL injection prevention, and role-based access
- **⚡ Performance Optimized** - Efficient queries, caching, and optimized bundle sizes
- **🐳 Docker Ready** - Full containerization with development and production configurations

---

## 🤝 **Support the Project**

### 💝 **Open for Sponsorship & Donations**

This project represents hundreds of hours of development work, creating a modern, professional POS system that's **completely free and open source**. If you find this project valuable:

**🌟 Ways to Support:**
- ⭐ **Star this repository** to show your appreciation
- 🐛 **Report bugs** or suggest features to help improve the system
- 💰 **Sponsor development** to help maintain and add new features
- ☕ **Buy me a coffee** to fuel late-night coding sessions
- 🗣️ **Share the project** with other restaurant owners or developers

**💳 Donation Options:**
- **🌟 GitHub Sponsors** - Support ongoing development
- **💰 PayPal** - Send donations to: `arissetia.m@gmail.com` (one-time or recurring)
- **💎 Cryptocurrency** - Contact for wallet addresses
- **🏢 Commercial Licensing** - Enterprise support and customization available

*Every contribution helps make this project better for everyone! 🙏*

---

## 📋 **Project Structure**

```
pos-full/
├── 🔧 backend/                 # Golang REST API server
│   ├── internal/api/           # Route definitions and handlers
│   ├── internal/handlers/      # Business logic controllers
│   ├── internal/middleware/    # Authentication and CORS
│   ├── internal/models/        # Data models and DTOs
│   └── main.go                 # Application entry point
├── 🎨 frontend/                # TanStack Start React application
│   ├── src/components/         # Reusable UI components
│   ├── src/routes/            # File-based routing system
│   ├── src/api/               # API client and integrations
│   ├── src/types/             # TypeScript type definitions
│   └── src/hooks/             # Custom React hooks
├── 🗄️ database/               # SQL schema and seed data
│   └── init/                  # Database initialization scripts
├── 🐳 docker/                 # Docker configuration files
├── 📚 docs/                   # Project documentation
└── 🛠️ scripts/               # Development and deployment scripts
```

---

## 🚀 **Getting Started**

### **Prerequisites**
- Docker & Docker Compose
- Make (for convenience commands)
- Git (for cloning the repository)

### **Installation**
```bash
# Clone the repository
git clone https://github.com/madebyaris/poinf-of-sales.git
cd poinf-of-sales

# Start everything with one command
make dev

# Open your browser
open http://localhost:3000
```

### **Development**
```bash
# Development mode with hot reloading
make dev

# Individual service startup (for advanced users)
cd backend && go run main.go
cd frontend && npm run dev
```

---

## 📄 **License**

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License - Free for commercial and personal use
✅ Commercial use    ✅ Modification    ✅ Distribution    ✅ Private use
```

---

## 🙏 **Acknowledgments**

- **🔧 Golang Community** for the amazing ecosystem and performance
- **⚛️ React Team** for the incredible frontend framework
- **🎨 Tailwind CSS** for making beautiful designs accessible
- **📊 TanStack** for the powerful table and query libraries
- **🧩 shadcn/ui** for the beautiful component system
- **🐳 Docker** for making deployment seamless

---

<div align="center">

### **⭐ Star this project if you find it useful! ⭐**

**Built with ❤️ by developers, for developers**

*Ready to transform your restaurant operations? Get started today!*

[🚀 **Get Started**](#-quick-start) • [💝 **Support the Project**](#-support-the-project) • [📚 **Documentation**](docs/) • [🐛 **Report Issues**](issues/)

</div>