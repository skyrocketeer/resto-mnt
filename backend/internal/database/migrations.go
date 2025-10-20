package database

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

// Migration represents a database migration
type Migration struct {
	Version int
	Name    string
	UpSQL   string
	DownSQL string
}

// MigrationManager handles database migrations
type MigrationManager struct {
	db *sql.DB
}

// NewMigrationManager creates a new migration manager
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
	if _, err := tx.Exec(migration.UpSQL); err != nil {
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
	if migration.DownSQL != "" {
		if _, err := tx.Exec(migration.DownSQL); err != nil {
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
		
		// Read migration file
		content, err := os.ReadFile(filepath.Join(migrationsDir, filename))
		if err != nil {
			return nil, err
		}
		
		// Parse up and down SQL
		sqlContent := string(content)
		upSQL, downSQL := parseMigrationSQL(sqlContent)
		
		migrations = append(migrations, &Migration{
			Version: version,
			Name:    name,
			UpSQL:   upSQL,
			DownSQL: downSQL,
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
func (m *MigrationManager) Rollback() error {
	if err := m.CreateMigrationsTable(); err != nil {
		return fmt.Errorf("failed to create migrations table: %w", err)
	}
	
	// Get the last applied migration
	var version int
	var name string
	err := m.db.QueryRow("SELECT version, name FROM migrations ORDER BY version DESC LIMIT 1").Scan(&version, &name)
	if err == sql.ErrNoRows {
		log.Println("No migrations to rollback")
		return nil
	}
	if err != nil {
		return fmt.Errorf("failed to get last migration: %w", err)
	}
	
	// Find the migration file
	migrationsDir := "./migrations"
	pattern := fmt.Sprintf("%d_%s.sql", version, name)
	
	files, err := filepath.Glob(filepath.Join(migrationsDir, pattern))
	if err != nil || len(files) == 0 {
		return fmt.Errorf("migration file not found: %s", pattern)
	}
	
	content, err := os.ReadFile(files[0])
	if err != nil {
		return fmt.Errorf("failed to read migration file: %w", err)
	}
	
	_, downSQL := parseMigrationSQL(string(content))
	
	migration := &Migration{
		Version: version,
		Name:    name,
		DownSQL: downSQL,
	}
	
	log.Printf("Rolling back migration %d_%s...\n", version, name)
	
	if err := m.RollbackMigration(migration); err != nil {
		return fmt.Errorf("failed to rollback migration %d_%s: %w", version, name, err)
	}
	
	log.Printf("Migration %d_%s rolled back successfully\n", version, name)
	return nil
}

// parseMigrationSQL parses the migration SQL file content into up and down sections
func parseMigrationSQL(content string) (string, string) {
	parts := strings.Split(content, "-- +migrate Down")
	
	if len(parts) < 2 {
		return strings.TrimSpace(strings.TrimPrefix(content, "-- +migrate Up")), ""
	}
	
	upPart := strings.TrimSpace(strings.TrimPrefix(parts[0], "-- +migrate Up"))
	downPart := strings.TrimSpace(parts[1])
	
	return upPart, downPart
}

// RunMigrations is a convenience function to run migrations on application startup
func RunMigrations(db *sql.DB) error {
	migrationManager := NewMigrationManager(db)
	return migrationManager.Migrate()
}