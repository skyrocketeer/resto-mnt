package main

import (
	"log"

	"pos-backend/internal/api"
	"pos-backend/internal/database"
	"pos-backend/internal/middleware"
	"pos-backend/internal/util"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

func main() {
	// Load environment variables
	util.LoadEnv("")

	// Database configuration
	dbConfig := database.Config{
		Host:     util.FromEnv("DB_HOST", "localhost"),
		Port:     util.FromEnv("DB_PORT", "5432"),
		User:     util.FromEnv("DB_USER", "postgres"),
		Password: util.FromEnv("DB_PASSWORD", ""),
		DBName:   util.FromEnv("DB_NAME", "pos_system"),
		SSLMode:  util.FromEnv("DB_SSLMODE", "disable"),
	}

	// Add debug logging for database connection
	log.Printf("Connecting to database: %s on %s:%s", dbConfig.DBName, dbConfig.Host, dbConfig.Port)

	// Initialize database connection
	db, err := database.Connect(dbConfig)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	log.Printf("Successfully connected to database: %s", dbConfig.DBName)

	// Test database connection
	if err := db.Ping(); err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}

	// Initialize Gin router
	gin.SetMode(util.FromEnv("GIN_MODE", "release"))
	router := gin.New()

	// Add middleware
	router.Use(gin.Logger())
	router.Use(gin.Recovery())
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003", "http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Content-Length", "Accept-Encoding", "X-CSRF-Token", "Authorization", "accept", "origin", "Cache-Control", "X-Requested-With"},
		AllowCredentials: true,
	}))

	// Add authentication middleware to protected routes
	authMiddleware := middleware.AuthMiddleware()

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "healthy", "message": "POS API is running"})
	})

	// Initialize API routes
	apiRoutes := router.Group("/api/v1")
	api.SetupRoutes(apiRoutes, db, authMiddleware)

	// Start server
	port := util.FromEnv("PORT", "8080")
	log.Printf("Starting server on port %s", port)

	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
