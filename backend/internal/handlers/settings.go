package handlers

import (
	"database/sql"
	"net/http"
	"time"

	"pos-backend/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type SettingsHandler struct {
	db *sql.DB
}

func NewSettingsHandler(db *sql.DB) *SettingsHandler {
	return &SettingsHandler{db: db}
}

// GetRestaurantSettings returns the current restaurant settings
func (h *SettingsHandler) GetSettings(c *gin.Context) {
	// Get the first (and only) restaurant settings record
	query := `
		SELECT id, name, description, address, phone, email, website, logo_url,
		       currency, tax_rate, service_charge_rate, opening_time, closing_time,
		       timezone, default_order_type, auto_print_receipts, auto_print_kitchen,
		       receipt_footer, is_active, created_at, updated_at
		FROM setting
		ORDER BY created_at DESC
		LIMIT 1
	`

	var settings models.Settings
	err := h.db.QueryRow(query).Scan(
		&settings.ID, &settings.Name, &settings.Description, &settings.Address,
		&settings.Phone, &settings.Email, &settings.Website, &settings.LogoURL,
		&settings.Currency, &settings.TaxRate, &settings.ServiceChargeRate,
		&settings.OpeningTime, &settings.ClosingTime, &settings.Timezone,
		&settings.DefaultOrderType, &settings.AutoPrintReceipts, &settings.AutoPrintKitchen,
		&settings.ReceiptFooter, &settings.IsActive, &settings.CreatedAt, &settings.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, models.APIResponse{
			Success: false,
			Message: "Restaurant settings not found",
			Error:   stringPtr("No restaurant settings configured yet"),
		})
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to fetch restaurant settings",
			Error:   stringPtr(err.Error()),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Restaurant settings retrieved successfully",
		Data:    settings,
	})
}

// UpdateRestaurantSettings updates the restaurant settings
func (h *SettingsHandler) UpdateSettings(c *gin.Context) {
	var req models.UpdateSettingsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid request data",
			Error:   stringPtr(err.Error()),
		})
		return
	}

	// Check if settings exist
	var existingID uuid.UUID
	err := h.db.QueryRow("SELECT id FROM settings ORDER BY created_at DESC LIMIT 1").Scan(&existingID)

	var query string
	var args []interface{}

	if err == sql.ErrNoRows {
		// Create new settings
		query = `
			INSERT INTO settings (
				id, name, description, address, phone, email, website, logo_url,
				currency, tax_rate, service_charge_rate, opening_time, closing_time,
				timezone, default_order_type, auto_print_receipts, auto_print_kitchen,
				receipt_footer, is_active, created_at, updated_at
			) VALUES (
				$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
			)
		`
		
		newID := uuid.New()
		args = []interface{}{
			newID,
			getStringValue(req.Name, "Restaurant"),
			req.Description,
			req.Address,
			req.Phone,
			req.Email,
			req.Website,
			req.LogoURL,
			getStringValue(req.Currency, "USD"),
			getFloat64Value(req.TaxRate, 0.0),
			getFloat64Value(req.ServiceChargeRate, 0.0),
			req.OpeningTime,
			req.ClosingTime,
			getStringValue(req.Timezone, "UTC"),
			getStringValue(req.DefaultOrderType, "dine_in"),
			getBoolValue(req.AutoPrintReceipts, false),
			getBoolValue(req.AutoPrintKitchen, false),
			req.ReceiptFooter,
			getBoolValue(req.IsActive, true),
			time.Now(),
			time.Now(),
		}
	} else if err == nil {
		// Update existing settings
		query = `
			UPDATE settings SET
				name = $1, description = $2, address = $3, phone = $4, email = $5,
				website = $6, logo_url = $7, currency = $8, tax_rate = $9,
				service_charge_rate = $10, opening_time = $11, closing_time = $12,
				timezone = $13, default_order_type = $14, auto_print_receipts = $15,
				auto_print_kitchen = $16, receipt_footer = $17, is_active = $18,
				updated_at = $19
			WHERE id = $20
		`
		
		// Get current values to preserve unchanged fields
		var currentSettings models.Settings
		h.db.QueryRow("SELECT name, currency, tax_rate, service_charge_rate, timezone, default_order_type, auto_print_receipts, auto_print_kitchen, is_active FROM settings WHERE id = $1", existingID).Scan(
			&currentSettings.Name, &currentSettings.Currency, &currentSettings.TaxRate,
			&currentSettings.ServiceChargeRate, &currentSettings.Timezone,
			&currentSettings.DefaultOrderType, &currentSettings.AutoPrintReceipts,
			&currentSettings.AutoPrintKitchen, &currentSettings.IsActive,
		)

		args = []interface{}{
			getStringValue(req.Name, currentSettings.Name),
			req.Description,
			req.Address,
			req.Phone,
			req.Email,
			req.Website,
			req.LogoURL,
			getStringValue(req.Currency, currentSettings.Currency),
			getFloat64Value(req.TaxRate, currentSettings.TaxRate),
			getFloat64Value(req.ServiceChargeRate, currentSettings.ServiceChargeRate),
			req.OpeningTime,
			req.ClosingTime,
			getStringValue(req.Timezone, currentSettings.Timezone),
			getStringValue(req.DefaultOrderType, currentSettings.DefaultOrderType),
			getBoolValue(req.AutoPrintReceipts, currentSettings.AutoPrintReceipts),
			getBoolValue(req.AutoPrintKitchen, currentSettings.AutoPrintKitchen),
			req.ReceiptFooter,
			getBoolValue(req.IsActive, currentSettings.IsActive),
			time.Now(),
			existingID,
		}
	} else {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to check existing settings",
			Error:   stringPtr(err.Error()),
		})
		return
	}

	_, err = h.db.Exec(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to update restaurant settings",
			Error:   stringPtr(err.Error()),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Restaurant settings updated successfully",
	})
}

// Helper functions to handle optional fields
func getStringValue(ptr *string, defaultValue string) string {
	if ptr != nil {
		return *ptr
	}
	return defaultValue
}

func getFloat64Value(ptr *float64, defaultValue float64) float64 {
	if ptr != nil {
		return *ptr
	}
	return defaultValue
}

func getBoolValue(ptr *bool, defaultValue bool) bool {
	if ptr != nil {
		return *ptr
	}
	return defaultValue
}

