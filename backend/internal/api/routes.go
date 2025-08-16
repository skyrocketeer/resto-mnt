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

		// Order routes
		protected.GET("/orders", orderHandler.GetOrders)
		protected.POST("/orders", orderHandler.CreateOrder)
		protected.GET("/orders/:id", orderHandler.GetOrder)
		protected.PATCH("/orders/:id/status", orderHandler.UpdateOrderStatus)

		// Payment routes
		protected.POST("/orders/:order_id/payments", paymentHandler.ProcessPayment)
		protected.GET("/orders/:order_id/payments", paymentHandler.GetPayments)
		protected.GET("/orders/:order_id/payment-summary", paymentHandler.GetPaymentSummary)
	}

	// Admin routes (admin/manager only)
	admin := router.Group("/admin")
	admin.Use(authMiddleware)
	admin.Use(middleware.RequireRoles([]string{"admin", "manager"}))
	{
		// Dashboard and reporting routes would go here
		admin.GET("/dashboard/stats", getDashboardStats(db))
		admin.GET("/reports/sales", getSalesReport(db))
		admin.GET("/reports/orders", getOrdersReport(db))
	}

	// Kitchen routes (kitchen staff access)
	kitchen := router.Group("/kitchen")
	kitchen.Use(authMiddleware)
	kitchen.Use(middleware.RequireRoles([]string{"kitchen", "admin", "manager"}))
	{
		kitchen.GET("/orders", getKitchenOrders(db))
		kitchen.PATCH("/orders/:id/items/:item_id/status", updateOrderItemStatus(db))
	}
}

// Dashboard stats handler
func getDashboardStats(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get basic stats for dashboard
		stats := make(map[string]interface{})

		// Today's orders
		var todayOrders int
		db.QueryRow(`
			SELECT COUNT(*) 
			FROM orders 
			WHERE DATE(created_at) = CURRENT_DATE
		`).Scan(&todayOrders)

		// Today's revenue
		var todayRevenue float64
		db.QueryRow(`
			SELECT COALESCE(SUM(total_amount), 0) 
			FROM orders 
			WHERE DATE(created_at) = CURRENT_DATE AND status = 'completed'
		`).Scan(&todayRevenue)

		// Active orders
		var activeOrders int
		db.QueryRow(`
			SELECT COUNT(*) 
			FROM orders 
			WHERE status NOT IN ('completed', 'cancelled')
		`).Scan(&activeOrders)

		// Occupied tables
		var occupiedTables int
		db.QueryRow(`
			SELECT COUNT(*) 
			FROM dining_tables 
			WHERE is_occupied = true
		`).Scan(&occupiedTables)

		stats["today_orders"] = todayOrders
		stats["today_revenue"] = todayRevenue
		stats["active_orders"] = activeOrders
		stats["occupied_tables"] = occupiedTables

		c.JSON(200, gin.H{
			"success": true,
			"message": "Dashboard stats retrieved successfully",
			"data":    stats,
		})
	}
}

// Sales report handler
func getSalesReport(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		period := c.DefaultQuery("period", "today") // today, week, month

		var query string
		switch period {
		case "week":
			query = `
				SELECT DATE(created_at) as date, COUNT(*) as order_count, SUM(total_amount) as revenue
				FROM orders 
				WHERE created_at >= CURRENT_DATE - INTERVAL '7 days' AND status = 'completed'
				GROUP BY DATE(created_at)
				ORDER BY date DESC
			`
		case "month":
			query = `
				SELECT DATE(created_at) as date, COUNT(*) as order_count, SUM(total_amount) as revenue
				FROM orders 
				WHERE created_at >= CURRENT_DATE - INTERVAL '30 days' AND status = 'completed'
				GROUP BY DATE(created_at)
				ORDER BY date DESC
			`
		default: // today
			query = `
				SELECT DATE_TRUNC('hour', created_at) as hour, COUNT(*) as order_count, SUM(total_amount) as revenue
				FROM orders 
				WHERE DATE(created_at) = CURRENT_DATE AND status = 'completed'
				GROUP BY DATE_TRUNC('hour', created_at)
				ORDER BY hour DESC
			`
		}

		rows, err := db.Query(query)
		if err != nil {
			c.JSON(500, gin.H{
				"success": false,
				"message": "Failed to fetch sales report",
				"error":   err.Error(),
			})
			return
		}
		defer rows.Close()

		var report []map[string]interface{}
		for rows.Next() {
			var date interface{}
			var orderCount int
			var revenue float64

			err := rows.Scan(&date, &orderCount, &revenue)
			if err != nil {
				c.JSON(500, gin.H{
					"success": false,
					"message": "Failed to scan sales data",
					"error":   err.Error(),
				})
				return
			}

			report = append(report, map[string]interface{}{
				"date":        date,
				"order_count": orderCount,
				"revenue":     revenue,
			})
		}

		c.JSON(200, gin.H{
			"success": true,
			"message": "Sales report retrieved successfully",
			"data":    report,
		})
	}
}

// Orders report handler
func getOrdersReport(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get order statistics
		query := `
			SELECT 
				status,
				COUNT(*) as count,
				AVG(total_amount) as avg_amount
			FROM orders 
			WHERE DATE(created_at) = CURRENT_DATE
			GROUP BY status
		`

		rows, err := db.Query(query)
		if err != nil {
			c.JSON(500, gin.H{
				"success": false,
				"message": "Failed to fetch orders report",
				"error":   err.Error(),
			})
			return
		}
		defer rows.Close()

		var report []map[string]interface{}
		for rows.Next() {
			var status string
			var count int
			var avgAmount float64

			err := rows.Scan(&status, &count, &avgAmount)
			if err != nil {
				c.JSON(500, gin.H{
					"success": false,
					"message": "Failed to scan orders data",
					"error":   err.Error(),
				})
				return
			}

			report = append(report, map[string]interface{}{
				"status":     status,
				"count":      count,
				"avg_amount": avgAmount,
			})
		}

		c.JSON(200, gin.H{
			"success": true,
			"message": "Orders report retrieved successfully",
			"data":    report,
		})
	}
}

// Kitchen orders handler
func getKitchenOrders(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		status := c.DefaultQuery("status", "all")

		query := `
			SELECT DISTINCT o.id, o.order_number, o.table_id, o.order_type, o.status, 
			       o.created_at, o.customer_name,
			       t.table_number
			FROM orders o
			LEFT JOIN dining_tables t ON o.table_id = t.id
			WHERE o.status IN ('confirmed', 'preparing', 'ready')
		`

		if status != "all" {
			query += ` AND o.status = '` + status + `'`
		}

		query += ` ORDER BY o.created_at ASC`

		rows, err := db.Query(query)
		if err != nil {
			c.JSON(500, gin.H{
				"success": false,
				"message": "Failed to fetch kitchen orders",
				"error":   err.Error(),
			})
			return
		}
		defer rows.Close()

		var orders []map[string]interface{}
		for rows.Next() {
			var orderID, tableID interface{}
			var orderNumber, orderType, orderStatus, customerName, tableNumber sql.NullString
			var createdAt interface{}

			err := rows.Scan(&orderID, &orderNumber, &tableID, &orderType, &orderStatus,
				&createdAt, &customerName, &tableNumber)
			if err != nil {
				c.JSON(500, gin.H{
					"success": false,
					"message": "Failed to scan kitchen order",
					"error":   err.Error(),
				})
				return
			}

			order := map[string]interface{}{
				"id":            orderID,
				"order_number":  orderNumber.String,
				"table_id":      tableID,
				"table_number":  tableNumber.String,
				"order_type":    orderType.String,
				"status":        orderStatus.String,
				"customer_name": customerName.String,
				"created_at":    createdAt,
			}

			orders = append(orders, order)
		}

		c.JSON(200, gin.H{
			"success": true,
			"message": "Kitchen orders retrieved successfully",
			"data":    orders,
		})
	}
}

// Update order item status handler
func updateOrderItemStatus(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		orderID := c.Param("id")
		itemID := c.Param("item_id")

		var req struct {
			Status string `json:"status"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(400, gin.H{
				"success": false,
				"message": "Invalid request body",
				"error":   err.Error(),
			})
			return
		}

		// Update order item status
		_, err := db.Exec(`
			UPDATE order_items 
			SET status = $1, updated_at = CURRENT_TIMESTAMP 
			WHERE id = $2 AND order_id = $3
		`, req.Status, itemID, orderID)

		if err != nil {
			c.JSON(500, gin.H{
				"success": false,
				"message": "Failed to update order item status",
				"error":   err.Error(),
			})
			return
		}

		c.JSON(200, gin.H{
			"success": true,
			"message": "Order item status updated successfully",
		})
	}
}

