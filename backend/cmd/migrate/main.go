package main

import (
	"flag"
	"fmt"
	"log"
	"os"

	"pos-backend/internal/database"
)

func main() {
	// Define command line flags
	upFlag := flag.Bool("up", false, "Apply all pending migrations")
	downFlag := flag.Bool("down", false, "Rollback the last applied migration")
	statusFlag := flag.Bool("status", false, "Show migration status")
	
	flag.Parse()

	// Load database configuration from environment variables
	config := database.Config{
		Host:     getEnv("DB_HOST", "localhost"),
		Port:     getEnv("DB_PORT", "5432"),
		User:     getEnv("DB_USER", "postgres"),
		Password: getEnv("DB_PASSWORD", ""),
		DBName:   getEnv("DB_NAME", "restaurant_db"),
		SSLMode:  getEnv("DB_SSL_MODE", "disable"),
	}

	// Connect to database
	db, err := database.Connect(config)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Create migration manager
	migrationManager := database.NewMigrationManager(db)

	// Execute command based on flags
	switch {
	case *upFlag:
		if err := migrationManager.Migrate(); err != nil {
			log.Fatalf("Migration failed: %v", err)
		}
		fmt.Println("Migrations applied successfully")
		
	case *downFlag:
		if err := migrationManager.Rollback(); err != nil {
			log.Fatalf("Rollback failed: %v", err)
		}
		fmt.Println("Rollback completed successfully")
		
	case *statusFlag:
		if err := showMigrationStatus(migrationManager); err != nil {
			log.Fatalf("Failed to get migration status: %v", err)
		}
		
	default:
		fmt.Println("Usage: migrate [command]")
		fmt.Println()
		fmt.Println("Commands:")
		fmt.Println("  -up      Apply all pending migrations")
		fmt.Println("  -down    Rollback the last applied migration")
		fmt.Println("  -status  Show migration status")
		fmt.Println()
		fmt.Println("Environment Variables:")
		fmt.Println("  DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, DB_SSL_MODE")
	}
}

func showMigrationStatus(migrationManager *database.MigrationManager) error {
	// Create migrations table if it doesn't exist
	if err := migrationManager.CreateMigrationsTable(); err != nil {
		return err
	}

	// Get applied migrations
	applied, err := migrationManager.GetAppliedMigrations()
	if err != nil {
		return err
	}

	// Get pending migrations
	pending, err := migrationManager.GetPendingMigrations()
	if err != nil {
		return err
	}

	fmt.Printf("Migration Status:\n")
	fmt.Printf("Applied migrations: %d\n", len(applied))
	fmt.Printf("Pending migrations: %d\n", len(pending))
	fmt.Println()

	if len(applied) > 0 {
		fmt.Println("Applied migrations:")
		for version := range applied {
			fmt.Printf("  %d\n", version)
		}
	}

	if len(pending) > 0 {
		fmt.Println("\nPending migrations:")
		for _, migration := range pending {
			fmt.Printf("  %d_%s\n", migration.Version, migration.Name)
		}
	}

	return nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}