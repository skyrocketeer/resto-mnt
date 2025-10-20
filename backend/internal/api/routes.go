package api

import (
	"database/sql"

	"pos-backend/internal/handlers"
	"pos-backend/internal/middleware"

	"github.com/gin-gonic/gin"
)

// SetupRoutes configures all API routes
func SetupRoutes(router *gin.RouterGroup, db *sql.DB, authMiddleware gin.HandlerFunc) {
	// Initialize handlers
	authHandler := handlers.NewAuthHandler(db)
	orderHandler := handlers.NewOrderHandler(db)
	productHandler := handlers.NewProductHandler(db)
	paymentHandler := handlers.NewPaymentHandler(db)
	tableHandler := handlers.NewTableHandler(db)
	dashboardHandler := handlers.NewDashboardHandler(db)
	adminHandler := handlers.NewAdminHandler(db)
	kitchenHandler := handlers.NewKitchenHandler(db)
	serverHandler := handlers.NewServerHandler(db)
	settingsHandler := handlers.NewSettingsHandler(db)

	// Public routes (no authentication required)
	public := router.Group("/")
	{
		// Authentication routes
		public.POST("/auth/login", authHandler.Login)
		public.POST("/auth/logout", authHandler.Logout)
	}

	// Protected routes (authentication required)
	protected := router.Group("/")
	protected.Use(authMiddleware)
	{
		// Authentication routes
		protected.GET("/auth/me", authHandler.GetCurrentUser)

		// Product routes
		protected.GET("/products", productHandler.GetProducts)
		protected.GET("/products/:id", productHandler.GetProduct)
		protected.GET("/categories", productHandler.GetCategories)
		protected.GET("/categories/:id/products", productHandler.GetProductsByCategory)

		// Table routes
		protected.GET("/tables", tableHandler.GetTables)
		protected.GET("/tables/:id", tableHandler.GetTable)
		protected.GET("/tables/by-location", tableHandler.GetTablesByLocation)
		protected.GET("/tables/status", tableHandler.GetTableStatus)

		// Order routes (general view for all roles)
		protected.GET("/orders", orderHandler.GetOrders)
		protected.GET("/orders/:id", orderHandler.GetOrder)
		protected.PATCH("/orders/:id/status", orderHandler.UpdateOrderStatus)

		// Payment routes (counter/admin only)
		protected.GET("/orders/:id/payments", paymentHandler.GetPayments)
		protected.GET("/orders/:id/payment-summary", paymentHandler.GetPaymentSummary)
	}

	// Server routes (server role - dine-in orders only)
	server := router.Group("/server")
	server.Use(authMiddleware)
	server.Use(middleware.RequireRole("server"))
	{
		server.POST("/orders", serverHandler.CreateDineInOrder) // Only dine-in orders
	}

	// Counter routes (counter role - all order types and payments)
	counter := router.Group("/counter")
	counter.Use(authMiddleware)
	counter.Use(middleware.RequireRole("counter"))
	{
		counter.POST("/orders", orderHandler.CreateOrder)                   // All order types
		counter.POST("/orders/:id/payments", paymentHandler.ProcessPayment) // Process payments
	}

	// Admin routes (admin/manager only)
	admin := router.Group("/admin")
	admin.Use(authMiddleware)
	admin.Use(middleware.RequireRoles([]string{"admin", "manager"}))
	{
		// Dashboard and monitoring
		admin.GET("/dashboard/stats", dashboardHandler.GetDashboardStats)
		admin.GET("/reports/sales", dashboardHandler.GetSalesReport)
		admin.GET("/reports/orders", dashboardHandler.GetOrdersReport)
		admin.GET("/reports/income", dashboardHandler.GetIncomeReport)

		// Menu management with pagination
		admin.GET("/products", productHandler.GetProducts) // Use existing paginated handler
		admin.GET("/categories", adminHandler.GetAdminCategories)
		admin.POST("/categories", adminHandler.CreateCategory)
		admin.PUT("/categories/:id", adminHandler.UpdateCategory)
		admin.DELETE("/categories/:id", adminHandler.DeleteCategory)
		admin.POST("/products", adminHandler.CreateProduct)
		admin.PUT("/products/:id", adminHandler.UpdateProduct)
		admin.DELETE("/products/:id", adminHandler.DeleteProduct)

		// Table management with pagination
		admin.GET("/tables", adminHandler.GetAdminTables)
		admin.POST("/tables", adminHandler.CreateTable)
		admin.PUT("/tables/:id", adminHandler.UpdateTable)
		admin.DELETE("/tables/:id", adminHandler.DeleteTable)

		// User management with pagination
		admin.GET("/users", adminHandler.GetAdminUsers)
		admin.POST("/users", adminHandler.CreateUser)
		admin.PUT("/users/:id", adminHandler.UpdateUser)
		admin.DELETE("/users/:id", adminHandler.DeleteUser)

		// Restaurant settings management
		admin.GET("/settings", settingsHandler.GetSettings)
		admin.PUT("/settings", settingsHandler.UpdateSettings)

		// Advanced order management
		admin.POST("/orders", orderHandler.CreateOrder)                   // Admins can create any type of order
		admin.POST("/orders/:id/payments", paymentHandler.ProcessPayment) // Admins can process payments
	}

	// Kitchen routes (kitchen staff access)
	kitchen := router.Group("/kitchen")
	kitchen.Use(authMiddleware)
	kitchen.Use(middleware.RequireRoles([]string{"kitchen", "admin", "manager"}))
	{
		kitchen.GET("/orders", kitchenHandler.GetKitchenOrders)
		kitchen.PATCH("/orders/:id/items/:item_id/status", kitchenHandler.UpdateOrderItemStatus)
	}
}
