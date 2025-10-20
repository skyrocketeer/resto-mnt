package main

import (
	"flag"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"time"

	"pos-backend/internal/database"
	"pos-backend/internal/util"
)

func main() {
	// Define command line flags
	upFlag := flag.Bool("up", false, "Apply migrations")
	downFlag := flag.Bool("down", false, "Rollback the last applied migration")
	statusFlag := flag.Bool("status", false, "Show migration status")
	timeout := flag.Duration("timeout", 30*time.Second, "DB operation timeout")

	flag.Parse()

	// Load database configuration from environment variables
	config := database.Config{
		Host:     util.FromEnv("DB_HOST", "localhost"),
		Port:     util.FromEnv("DB_PORT", "5432"),
		User:     util.FromEnv("DB_USER", "postgres"),
		Password: util.FromEnv("DB_PASSWORD", ""),
		DBName:   util.FromEnv("DB_NAME", "pos_system"),
		SSLMode:  util.FromEnv("DB_SSL_MODE", "disable"),
	}

	// Connect to database
	db, err := database.Connect(config)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Create migration manager (kept for compatibility with -down/-status)
	migrationManager := database.NewMigrationManager(db)

	// Execute command based on flags
	switch {
	case *upFlag:
		// run all .sql files from the "./migrations" folder only
		migrationsDir := "./migrations"
		files, err := listSQLFiles(migrationsDir)
		if err != nil {
			log.Fatalf("Failed to list migration files in %s: %v", migrationsDir, err)
		}
		if len(files) == 0 {
			log.Printf("No .sql files found in %s.", migrationsDir)
			return
		}

		for _, f := range files {
			log.Printf("Running migration file: %s\n", f)
			if err := util.RunSQLFile(db, f, *timeout); err != nil {
				log.Fatalf("Running SQL migration failed for %s: %v", f, err)
			}
		}

		fmt.Println("All migrations executed successfully.")

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
		fmt.Println("  -up      Apply migrations (use -all to run all SQL files in migrations folders)")
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

// listSQLFiles returns sorted list of .sql files (full path) from the given directory (non-recursive).
// Sorting rule: cut the first 3 characters of the filename (without extension) and sort by numeric value (cardinal order).
// If the remaining part is not numeric, those files are ordered after numeric ones and sorted lexicographically.
func listSQLFiles(dir string) ([]string, error) {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil, err
	}
	type item struct {
		path string
		base string
		key  int
		ok   bool
	}
	var items []item
	for _, e := range entries {
		if e.IsDir() {
			continue
		}
		if filepath.Ext(e.Name()) != ".sql" {
			continue
		}
		base := strings.TrimSuffix(e.Name(), filepath.Ext(e.Name()))
		// cut first 3 letters
		rem := base
		if len(base) > 3 {
			rem = base[3:]
		} else {
			rem = ""
		}
		it := item{path: filepath.Join(dir, e.Name()), base: base}
		if rem != "" {
			if k, err := strconv.Atoi(rem); err == nil {
				it.key = k
				it.ok = true
			}
		}
		items = append(items, it)
	}
	sort.Slice(items, func(i, j int) bool {
		a, b := items[i], items[j]
		if a.ok && b.ok {
			return a.key < b.key
		}
		if a.ok != b.ok {
			// numeric-keyed files come before non-numeric
			return a.ok
		}
		// fallback to lexicographic compare of full base name
		return a.base < b.base
	})
	files := make([]string, len(items))
	for i, it := range items {
		files[i] = it.path
	}
	return files, nil
}
