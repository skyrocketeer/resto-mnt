package util

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
)

// RunSQLFile executes the SQL file at path inside a single transaction with the given timeout.
func RunSQLFile(db *sql.DB, path string, timeout time.Duration) error {
	sqlBytes, err := os.ReadFile(path)
	if err != nil {
		return fmt.Errorf("failed to read SQL file %s: %w", path, err)
	}
	sqlText := string(sqlBytes)
	if sqlText == "" {
		return fmt.Errorf("SQL file %s is empty", path)
	}

	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	tx, err := db.BeginTx(ctx, &sql.TxOptions{})
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}

	if _, err := tx.ExecContext(ctx, sqlText); err != nil {
		_ = tx.Rollback()
		return fmt.Errorf("execution failed: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("commit failed: %w", err)
	}

	return nil
}

func FromEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func LoadEnv() {
	if err := godotenv.Load(".env"); err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}
}
