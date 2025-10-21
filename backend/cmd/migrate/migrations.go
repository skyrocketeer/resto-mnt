package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
)

type Migration struct {
	Version int
	Name    string
	Up      string
	Down    string
	Status  string
}

type MigrationManager struct {
	db *sql.DB
}

func NewMigrationManager(db *sql.DB) *MigrationManager {
	return &MigrationManager{db: db}
}

// CreateMigrationsTable creates the migrations table if it doesn't exist
func (m *MigrationManager) CreateMigrationsTable() error {
	query := `
		CREATE TABLE IF NOT EXISTS migrations (
			id SERIAL PRIMARY KEY,
			version INTEGER NOT NULL UNIQUE,
			name VARCHAR(255) NOT NULL,
			applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)
	`
	_, err := m.db.Exec(query)
	return err
}

// GetAppliedMigrations returns a list of applied migration versions
func (m *MigrationManager) GetAppliedMigrations() (map[int]bool, error) {
	applied := make(map[int]bool)

	rows, err := m.db.Query("SELECT version FROM migrations ORDER BY version")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var version int
		if err := rows.Scan(&version); err != nil {
			return nil, err
		}
		applied[version] = true
	}

	return applied, nil
}

// ApplyMigration applies a single migration
func (m *MigrationManager) ApplyMigration(migration *Migration) error {
	tx, err := m.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Execute the migration SQL
	if _, err := tx.Exec(migration.Up); err != nil {
		return fmt.Errorf("failed to apply migration %d_%s: %w", migration.Version, migration.Name, err)
	}

	// Record the migration
	_, err = tx.Exec("INSERT INTO migrations (version, name) VALUES ($1, $2)", migration.Version, migration.Name)
	if err != nil {
		return fmt.Errorf("failed to record migration %d_%s: %w", migration.Version, migration.Name, err)
	}

	return tx.Commit()
}

// RollbackMigration rolls back a single migration
func (m *MigrationManager) RollbackMigration(migration *Migration) error {
	tx, err := m.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Execute the rollback SQL
	if migration.Down != "" {
		if _, err := tx.Exec(migration.Down); err != nil {
			return fmt.Errorf("failed to rollback migration %d_%s: %w", migration.Version, migration.Name, err)
		}
	}

	// Remove the migration record
	_, err = tx.Exec("DELETE FROM migrations WHERE version = $1", migration.Version)
	if err != nil {
		return fmt.Errorf("failed to remove migration record %d_%s: %w", migration.Version, migration.Name, err)
	}

	return tx.Commit()
}

// parseMigrationSQL parses the migration SQL file content into up and down sections
// looking for specific markers: -- +migrate Up and -- +migrate Down
func parseMigrationSQL(content string) (string, string) {
	upMarker := "-- +migrate Up"
	downMarker := "-- +migrate Down"

	// Split the content by the markers
	parts := strings.SplitN(content, downMarker, 2)

	// Get the Up SQL
	upSQL := ""
	if strings.Contains(parts[0], upMarker) {
		upParts := strings.SplitN(parts[0], upMarker, 2)
		if len(upParts) > 1 {
			upSQL = strings.TrimSpace(upParts[1])
		}
	}

	// Get the Down SQL if it exists
	downSQL := ""
	if len(parts) > 1 {
		downSQL = strings.TrimSpace(parts[1])
	}

	return upSQL, downSQL
}

// GetPendingMigrations returns migrations that haven't been applied
func (m *MigrationManager) GetPendingMigrations() ([]*Migration, error) {
	applied, err := m.GetAppliedMigrations()
	if err != nil {
		return nil, err
	}

	// Get all migration files
	migrationsDir := "./migrations"
	files, err := os.ReadDir(migrationsDir)
	if err != nil {
		if os.IsNotExist(err) {
			return []*Migration{}, nil
		}
		return nil, err
	}

	var migrations []*Migration

	for _, file := range files {
		if file.IsDir() {
			continue
		}

		filename := file.Name()
		if !strings.HasSuffix(filename, ".sql") {
			continue
		}

		// Parse version and name from filename (e.g., 001_create_users.sql)
		parts := strings.Split(strings.TrimSuffix(filename, ".sql"), "_")
		if len(parts) < 2 {
			continue
		}

		version, err := strconv.Atoi(parts[0])
		if err != nil {
			continue
		}

		// Skip if already applied
		if applied[version] {
			continue
		}

		name := strings.Join(parts[1:], "_")
		migrationFile := filepath.Join(migrationsDir, filename)

		// Read migration file
		content, err := os.ReadFile(migrationFile)
		if err != nil {
			return nil, fmt.Errorf("failed to read migration file %s: %w", filename, err)
		}

		// Parse up and down SQL using the parseMigrationSQL function
		upSQL, downSQL := parseMigrationSQL(string(content))
		if upSQL == "" {
			log.Printf("Warning: No Up migration found in %s", filename)
			continue
		}

		migrations = append(migrations, &Migration{
			Version: version,
			Name:    name,
			Up:      upSQL,
			Down:    downSQL,
		})
	}

	// Sort migrations by version
	sort.Slice(migrations, func(i, j int) bool {
		return migrations[i].Version < migrations[j].Version
	})

	return migrations, nil
}

// Migrate applies all pending migrations
func (m *MigrationManager) Migrate() error {
	if err := m.CreateMigrationsTable(); err != nil {
		return fmt.Errorf("failed to create migrations table: %w", err)
	}

	pending, err := m.GetPendingMigrations()
	if err != nil {
		return fmt.Errorf("failed to get pending migrations: %w", err)
	}

	if len(pending) == 0 {
		log.Println("No pending migrations")
		return nil
	}

	log.Printf("Applying %d pending migrations...\n", len(pending))

	for _, migration := range pending {
		log.Printf("Applying migration %d_%s...\n", migration.Version, migration.Name)

		if err := m.ApplyMigration(migration); err != nil {
			return fmt.Errorf("failed to apply migration %d_%s: %w", migration.Version, migration.Name, err)
		}

		log.Printf("Migration %d_%s applied successfully\n", migration.Version, migration.Name)
	}

	log.Printf("All %d migrations applied successfully\n", len(pending))
	return nil
}

// Rollback rolls back the last applied migration
// Rollback rolls back the last applied migration, skipping if no Down SQL is found.
func (m *MigrationManager) Rollback() error {
	// 1. Get all applied migrations in reverse order
	rows, err := m.db.Query("SELECT version, name FROM migrations ORDER BY version DESC")
	if err != nil {
		return fmt.Errorf("failed to get applied migrations: %w", err)
	}
	defer rows.Close()

	var appliedMigrations []struct {
		Version int
		Name    string
	}

	for rows.Next() {
		var mig struct {
			Version int
			Name    string
		}
		if err := rows.Scan(&mig.Version, &mig.Name); err != nil {
			return fmt.Errorf("failed to scan migration: %w", err)
		}
		appliedMigrations = append(appliedMigrations, mig)
	}

	if len(appliedMigrations) == 0 {
		log.Println("No migrations to rollback")
		return nil
	}

	// 2. Loop through applied migrations (newest first) until a valid rollback file is found
	for _, migration := range appliedMigrations {
		log.Printf("Checking applied version %d (%s) for Down SQL...", migration.Version, migration.Name)

		// a. Construct the expected migration filename
		migrationsDir := "./migrations"
		filename := fmt.Sprintf("%03d_%s.sql", migration.Version, migration.Name)
		migrationFile := filepath.Join(migrationsDir, filename)

		// Skip if file doesn't exist
		if _, err := os.Stat(migrationFile); os.IsNotExist(err) {
			log.Printf("Warning: Skipping version %d (%s). Migration file not found: %v", migration.Version, migration.Name, err)
			continue
		}

		// b. Read the file
		content, err := os.ReadFile(migrationFile)
		if err != nil {
			log.Printf("Warning: Skipping version %d. Failed to read file: %v", migration.Version, err)
			continue
		}

		// c. Parse for the Down SQL
		_, downSQL := parseMigrationSQL(string(content))
		if downSQL == "" {
			log.Printf("Skipping version %d (%s). No -- +migrate Down statement found.", migration.Version, migration.Name)
			continue
		}

		// 3. Execute the Rollback (Valid migration found!)
		if err := m.RollbackMigration(&Migration{
			Version: migration.Version,
			Name:    migration.Name,
			Down:    downSQL,
		}); err != nil {
			return fmt.Errorf("failed to rollback version %d (%s): %w", migration.Version, migration.Name, err)
		}

		log.Printf("Successfully rolled back version %d (%s). SQL: \"%s\"", migration.Version, migration.Name, downSQL)
		return nil // IMPORTANT: Stop after the first successful rollback
	}

	// 4. Fallback error if loop finishes without finding a file
	return fmt.Errorf("failed to find a migration file with Down SQL from applied versions")
}

// RunMigrations is a convenience function to run migrations on application startup
func (m *MigrationManager) RunMigrations() error {
	return m.Migrate()
}

func (m *MigrationManager) ShowMigrationStatus() error {
	// Create migrations table if it doesn't exist
	if err := m.CreateMigrationsTable(); err != nil {
		return err
	}

	// Get applied migrationså
	applied, err := m.GetAppliedMigrations()
	if err != nil {
		return err
	}

	// Get pending migrations
	pending, err := m.GetPendingMigrations()
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

func (m *MigrationManager) findMigrationFile() (string, error) {
	migrationsDir := "./migrations"
	files, err := os.ReadDir(migrationsDir)
	if err != nil {
		return "", fmt.Errorf("failed to read migrations directory: %w", err)
	}

	// versionStr := fmt.Sprintf("%d", version)
	for _, file := range files {
		if file.IsDir() {
			continue
		}
		if strings.HasSuffix(file.Name(), ".sql") {
			return filepath.Join(migrationsDir, file.Name()), nil
		}
	}

	return "", fmt.Errorf("migration file not found for version %d")
}
