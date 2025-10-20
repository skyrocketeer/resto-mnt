package handlers

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
)

type KitchenHandler struct {
	db *sql.DB
}

func NewKitchenHandler(db *sql.DB) *KitchenHandler {
	return &KitchenHandler{db: db}
}

// GetKitchenOrders returns orders for kitchen staff
func (h *KitchenHandler) GetKitchenOrders(c *gin.Context) {
	status := c.DefaultQuery("status", "all")

	query := `
		SELECT DISTINCT o.id, o.order_number, o.table_id, o.order_type, o.status, 
		       o.created_at, o.customer_name,
		       t.table_number
		FROM orders o
		LEFT JOIN dining_tables t ON o.table_id = t.id
		WHERE o.status IN ('confirmed', 'preparing', 'ready', 'pending')
	`

	if status != "all" {
		query += ` AND o.status = '` + status + `'`
	}

	query += ` ORDER BY o.created_at ASC`

	rows, err := h.db.Query(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
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
			c.JSON(http.StatusInternalServerError, gin.H{
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

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Kitchen orders retrieved successfully",
		"data":    orders,
	})
}

// UpdateOrderItemStatus updates the status of an order item
func (h *KitchenHandler) UpdateOrderItemStatus(c *gin.Context) {
	orderID := c.Param("id")
	itemID := c.Param("item_id")

	var req struct {
		Status string `json:"status"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request body",
			"error":   err.Error(),
		})
		return
	}

	// Update order item status
	_, err := h.db.Exec(`
		UPDATE order_items 
		SET status = $1, updated_at = CURRENT_TIMESTAMP 
		WHERE id = $2 AND order_id = $3
	`, req.Status, itemID, orderID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to update order item status",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Order item status updated successfully",
	})
}