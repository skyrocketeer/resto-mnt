package main

import (
	"flag"
	"fmt"
	"log"
	"os"
	"time"

	// Assuming these paths are correct for your project structure
	"pos-backend/internal/database"
	"pos-backend/internal/util"
)

func main() {
	// Load environment variables
	util.LoadEnv("../../")

	// Define command line flags
	upFlag := flag.Bool("up", false, "Apply pending migrations")
	downFlag := flag.Bool("down", false, "Rollback the last applied migration")
	forceFlag := flag.Bool("force", false, "Skip confirmation for dangerous operations")
	statusFlag := flag.Bool("status", false, "Show migration status")

	// Although the manager hardcodes the dir, we keep the flag for better usage instructions
	_ = flag.String("dir", "./migrations", "migrations directory (currently hardcoded in manager)")
	_ = flag.Duration("timeout", 30*time.Second, "DB operation timeout (currently unused)")

	flag.Parse()

	// Setup database connection
	dbConfig := database.Config{
		Host:     util.FromEnv("DB_HOST", "localhost"),
		Port:     util.FromEnv("DB_PORT", "5432"),
		User:     util.FromEnv("DB_USER", "postgres"),
		Password: util.FromEnv("DB_PASSWORD", ""),
		DBName:   util.FromEnv("DB_NAME", "pos_system"),
		SSLMode:  util.FromEnv("DB_SSL_MODE", "disable"),
	}

	db, err := database.Connect(dbConfig)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Verify we're connected to the correct database
	var dbname string
	err = db.QueryRow("SELECT current_database()").Scan(&dbname)
	if err != nil {
		log.Fatalf("Failed to get current database: %v", err)
	}
	if dbname != dbConfig.DBName {
		log.Fatalf("Connected to wrong database. Want: %s, Got: %s", dbConfig.DBName, dbname)
	}

	// Test database connection
	if err := db.Ping(); err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}

	log.Printf("Successfully connected to database: %s", dbname)

	migrationManager := NewMigrationManager(db)

	// Execute command based on flags
	switch {
	case *upFlag:
		// RunMigrations handles finding, sorting, and applying all pending files.
		log.Println("Starting migration: Applying pending files...")
		if err := migrationManager.RunMigrations(); err != nil {
			log.Fatalf("Migration failed: %v", err)
		}
		log.Println("All pending migrations applied successfully.")

	case *downFlag:
		if !*forceFlag {
			fmt.Print("Warning: This will drop tables and delete data. Continue? (Y/n): ")
			var response string
			fmt.Scanln(&response)
			if response != "Y" {
				fmt.Println("Rollback cancelled")
				return
			}
		}
		if err := migrationManager.Rollback(); err != nil {
			log.Fatalf("Rollback failed: %v", err)
		}
		fmt.Println("Rollback completed successfully.")

	case *statusFlag:
		// ShowMigrationStatus displays applied vs. pending files.
		if err := migrationManager.ShowMigrationStatus(); err != nil {
			log.Fatalf("Failed to get migration status: %v", err)
		}

	default:
		// If no valid flag is provided, print usage instructions
		fmt.Println("Usage: run [command]")
		fmt.Println()
		fmt.Println("Commands:")
		fmt.Println("  -up      Apply all pending migrations")
		fmt.Println("  -down    Rollback the single last applied migration")
		fmt.Println("  -status  Show migration status (applied vs. pending)")
		fmt.Println()
		fmt.Println("Environment Variables:")
		fmt.Println("  DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, DB_SSL_MODE")
		os.Exit(1)
	}
}
