package handlers

import (
	"database/sql"
	"encoding/json"
	"io"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

type ServerHandler struct {
	db *sql.DB
}

func NewServerHandler(db *sql.DB) *ServerHandler {
	return &ServerHandler{db: db}
}

// CreateDineInOrder creates a dine-in order (server role only)
func (h *ServerHandler) CreateDineInOrder(c *gin.Context) {
	var req struct {
		TableID      *string `json:"table_id"`
		CustomerName *string `json:"customer_name"`
		Items        []struct {
			ProductID           string  `json:"product_id"`
			Quantity            int     `json:"quantity"`
			SpecialInstructions *string `json:"special_instructions"`
		} `json:"items"`
		Notes *string `json:"notes"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request body",
			"error":   err.Error(),
		})
		return
	}

	// Force order type to dine_in for servers
	orderHandler := NewOrderHandler(h.db)

	// Create order request with forced dine_in type
	createOrderReq := map[string]interface{}{
		"table_id":      req.TableID,
		"customer_name": req.CustomerName,
		"order_type":    "dine_in", // Force dine-in for servers
		"items":         req.Items,
		"notes":         req.Notes,
	}

	// Convert to JSON and back to simulate the request
	reqBytes, _ := json.Marshal(createOrderReq)
	c.Request.Body = io.NopCloser(strings.NewReader(string(reqBytes)))

	orderHandler.CreateOrder(c)
}