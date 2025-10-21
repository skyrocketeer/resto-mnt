package handlers

import (
	"database/sql"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type AdminHandler struct {
	db *sql.DB
}

func NewAdminHandler(db *sql.DB) *AdminHandler {
	return &AdminHandler{db: db}
}

// GetAdminUsers returns paginated list of users for admin
func (h *AdminHandler) GetAdminUsers(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	offset := (page - 1) * limit

	// Get total count
	var totalCount int
	h.db.QueryRow("SELECT COUNT(*) FROM users").Scan(&totalCount)

	// Get users with pagination
	query := `
		SELECT id, username, email, first_name, last_name, role, is_active, created_at, updated_at
		FROM users 
		ORDER BY created_at DESC 
		LIMIT $1 OFFSET $2
	`

	rows, err := h.db.Query(query, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to fetch users",
			"error":   err.Error(),
		})
		return
	}
	defer rows.Close()

	var users []map[string]interface{}
	for rows.Next() {
		var (
			id        string
			username  string
			email     string
			firstName *string
			lastName  *string
			role      string
			isActive  bool
			createdAt time.Time
			updatedAt time.Time
		)
		err := rows.Scan(
			&id, &username, &email, &firstName, &lastName, &role, &isActive, &createdAt, &updatedAt,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Failed to scan user data",
				"error":   err.Error(),
			})
			return
		}

		user := map[string]interface{}{
			"id":         id,
			"username":   username,
			"email":      email,
			"first_name": firstName,
			"last_name":  lastName,
			"role":       role,
			"is_active":  isActive,
			"created_at": createdAt,
			"updated_at": updatedAt,
		}
		users = append(users, user)
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Users retrieved successfully",
		"data": gin.H{
			"users": users,
			"pagination": gin.H{
				"page":        page,
				"limit":       limit,
				"total":       totalCount,
				"total_pages": (totalCount + limit - 1) / limit,
			},
		},
	})
}

// GetAdminCategories returns paginated list of categories for admin
func (h *AdminHandler) GetAdminCategories(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	offset := (page - 1) * limit

	// Get total count
	var totalCount int
	h.db.QueryRow("SELECT COUNT(*) FROM categories").Scan(&totalCount)

	// Get categories with pagination
	query := `
		SELECT id, name, description, color, sort_order, is_active, created_at, updated_at
		FROM categories 
		ORDER BY sort_order, name 
		LIMIT $1 OFFSET $2
	`

	rows, err := h.db.Query(query, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to fetch categories",
			"error":   err.Error(),
		})
		return
	}
	defer rows.Close()

	var categories []map[string]interface{}
	for rows.Next() {
		var (
			id          string
			name        string
			description *string
			color       *string
			sortOrder   int
			isActive    bool
			createdAt   time.Time
			updatedAt   time.Time
		)
		err := rows.Scan(
			&id, &name, &description, &color, &sortOrder, &isActive, &createdAt, &updatedAt,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Failed to scan category data",
				"error":   err.Error(),
			})
			return
		}

		category := map[string]interface{}{
			"id":          id,
			"name":        name,
			"description": description,
			"color":       color,
			"sort_order":  sortOrder,
			"is_active":   isActive,
			"created_at":  createdAt,
			"updated_at":  updatedAt,
		}
		categories = append(categories, category)
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Categories retrieved successfully",
		"data": gin.H{
			"categories": categories,
			"pagination": gin.H{
				"page":        page,
				"limit":       limit,
				"total":       totalCount,
				"total_pages": (totalCount + limit - 1) / limit,
			},
		},
	})
}

// GetAdminTables returns paginated list of tables for admin
func (h *AdminHandler) GetAdminTables(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	offset := (page - 1) * limit

	// Get total count
	var totalCount int
	h.db.QueryRow("SELECT COUNT(*) FROM dining_tables").Scan(&totalCount)

	// Get tables with pagination
	query := `
		SELECT id, table_number, capacity, location, is_occupied, is_active, created_at, updated_at
		FROM dining_tables 
		ORDER BY location, table_number 
		LIMIT $1 OFFSET $2
	`

	rows, err := h.db.Query(query, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to fetch tables",
			"error":   err.Error(),
		})
		return
	}
	defer rows.Close()

	var tables []map[string]interface{}
	for rows.Next() {
		var (
			id          string
			tableNumber string
			capacity    int
			location    *string
			isOccupied  bool
			isActive    bool
			createdAt   time.Time
			updatedAt   time.Time
		)
		err := rows.Scan(
			&id, &tableNumber, &capacity, &location, &isOccupied, &isActive, &createdAt, &updatedAt,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Failed to scan table data",
				"error":   err.Error(),
			})
			return
		}

		table := map[string]interface{}{
			"id":           id,
			"table_number": tableNumber,
			"capacity":     capacity,
			"location":     location,
			"is_occupied":  isOccupied,
			"is_active":    isActive,
			"created_at":   createdAt,
			"updated_at":   updatedAt,
		}
		tables = append(tables, table)
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Tables retrieved successfully",
		"data": gin.H{
			"tables": tables,
			"pagination": gin.H{
				"page":        page,
				"limit":       limit,
				"total":       totalCount,
				"total_pages": (totalCount + limit - 1) / limit,
			},
		},
	})
}

// CreateCategory creates a new category
func (h *AdminHandler) CreateCategory(c *gin.Context) {
	var req struct {
		Name        string  `json:"name" binding:"required"`
		Description *string `json:"description"`
		Color       *string `json:"color"`
		SortOrder   int     `json:"sort_order"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request body",
			"error":   err.Error(),
		})
		return
	}

	var categoryID string
	err := h.db.QueryRow(`
		INSERT INTO categories (name, description, color, sort_order)
		VALUES ($1, $2, $3, $4)
		RETURNING id
	`, req.Name, req.Description, req.Color, req.SortOrder).Scan(&categoryID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to create category",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Category created successfully",
		"data":    gin.H{"id": categoryID},
	})
}

// UpdateCategory updates an existing category
func (h *AdminHandler) UpdateCategory(c *gin.Context) {
	categoryID := c.Param("id")

	var req struct {
		Name        *string `json:"name"`
		Description *string `json:"description"`
		Color       *string `json:"color"`
		SortOrder   *int    `json:"sort_order"`
		IsActive    *bool   `json:"is_active"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request body",
			"error":   err.Error(),
		})
		return
	}

	// Build dynamic update query
	updates := []string{}
	args := []interface{}{}
	argCount := 1

	if req.Name != nil {
		updates = append(updates, fmt.Sprintf("name = $%d", argCount))
		args = append(args, *req.Name)
		argCount++
	}
	if req.Description != nil {
		updates = append(updates, fmt.Sprintf("description = $%d", argCount))
		args = append(args, req.Description)
		argCount++
	}
	if req.Color != nil {
		updates = append(updates, fmt.Sprintf("color = $%d", argCount))
		args = append(args, req.Color)
		argCount++
	}
	if req.SortOrder != nil {
		updates = append(updates, fmt.Sprintf("sort_order = $%d", argCount))
		args = append(args, *req.SortOrder)
		argCount++
	}
	if req.IsActive != nil {
		updates = append(updates, fmt.Sprintf("is_active = $%d", argCount))
		args = append(args, *req.IsActive)
		argCount++
	}

	if len(updates) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "No fields to update",
		})
		return
	}

	updates = append(updates, "updated_at = CURRENT_TIMESTAMP")
	args = append(args, categoryID)

	query := fmt.Sprintf(`
		UPDATE categories 
		SET %s 
		WHERE id = $%d
	`, strings.Join(updates, ", "), argCount)

	result, err := h.db.Exec(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to update category",
			"error":   err.Error(),
		})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Category not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Category updated successfully",
	})
}

// DeleteCategory deletes a category
func (h *AdminHandler) DeleteCategory(c *gin.Context) {
	categoryID := c.Param("id")

	// Check if category has products
	var productCount int
	h.db.QueryRow("SELECT COUNT(*) FROM products WHERE category_id = $1", categoryID).Scan(&productCount)

	if productCount > 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Cannot delete category with existing products",
			"error":   "category_has_products",
		})
		return
	}

	result, err := h.db.Exec("DELETE FROM categories WHERE id = $1", categoryID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to delete category",
			"error":   err.Error(),
		})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Category not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Category deleted successfully",
	})
}

// CreateProduct creates a new product
func (h *AdminHandler) CreateProduct(c *gin.Context) {
	var req struct {
		CategoryID      *string `json:"category_id"`
		Name            string  `json:"name" binding:"required"`
		Description     *string `json:"description"`
		Price           float64 `json:"price" binding:"required"`
		ImageURL        *string `json:"image_url"`
		Barcode         *string `json:"barcode"`
		SKU             *string `json:"sku"`
		PreparationTime int     `json:"preparation_time"`
		SortOrder       int     `json:"sort_order"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request body",
			"error":   err.Error(),
		})
		return
	}

	var productID string
	err := h.db.QueryRow(`
		INSERT INTO products (category_id, name, description, price, image_url, barcode, sku, preparation_time, sort_order)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id
	`, req.CategoryID, req.Name, req.Description, req.Price, req.ImageURL,
		req.Barcode, req.SKU, req.PreparationTime, req.SortOrder).Scan(&productID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to create product",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Product created successfully",
		"data":    gin.H{"id": productID},
	})
}

// UpdateProduct updates an existing product
func (h *AdminHandler) UpdateProduct(c *gin.Context) {
	productID := c.Param("id")

	var req struct {
		CategoryID      *string  `json:"category_id"`
		Name            *string  `json:"name"`
		Description     *string  `json:"description"`
		Price           *float64 `json:"price"`
		ImageURL        *string  `json:"image_url"`
		Barcode         *string  `json:"barcode"`
		SKU             *string  `json:"sku"`
		PreparationTime *int     `json:"preparation_time"`
		SortOrder       *int     `json:"sort_order"`
		IsActive        *bool    `json:"is_active"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request body",
			"error":   err.Error(),
		})
		return
	}

	// Build dynamic update query
	updates := []string{}
	args := []interface{}{}
	argCount := 1

	if req.CategoryID != nil {
		updates = append(updates, fmt.Sprintf("category_id = $%d", argCount))
		args = append(args, req.CategoryID)
		argCount++
	}
	if req.Name != nil {
		updates = append(updates, fmt.Sprintf("name = $%d", argCount))
		args = append(args, *req.Name)
		argCount++
	}
	if req.Description != nil {
		updates = append(updates, fmt.Sprintf("description = $%d", argCount))
		args = append(args, req.Description)
		argCount++
	}
	if req.Price != nil {
		updates = append(updates, fmt.Sprintf("price = $%d", argCount))
		args = append(args, *req.Price)
		argCount++
	}
	if req.ImageURL != nil {
		updates = append(updates, fmt.Sprintf("image_url = $%d", argCount))
		args = append(args, req.ImageURL)
		argCount++
	}
	if req.Barcode != nil {
		updates = append(updates, fmt.Sprintf("barcode = $%d", argCount))
		args = append(args, req.Barcode)
		argCount++
	}
	if req.SKU != nil {
		updates = append(updates, fmt.Sprintf("sku = $%d", argCount))
		args = append(args, req.SKU)
		argCount++
	}
	if req.PreparationTime != nil {
		updates = append(updates, fmt.Sprintf("preparation_time = $%d", argCount))
		args = append(args, *req.PreparationTime)
		argCount++
	}
	if req.SortOrder != nil {
		updates = append(updates, fmt.Sprintf("sort_order = $%d", argCount))
		args = append(args, *req.SortOrder)
		argCount++
	}
	if req.IsActive != nil {
		updates = append(updates, fmt.Sprintf("is_active = $%d", argCount))
		args = append(args, *req.IsActive)
		argCount++
	}

	if len(updates) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "No fields to update",
		})
		return
	}

	updates = append(updates, "updated_at = CURRENT_TIMESTAMP")
	args = append(args, productID)

	query := fmt.Sprintf(`
		UPDATE products 
		SET %s 
		WHERE id = $%d
	`, strings.Join(updates, ", "), argCount)

	result, err := h.db.Exec(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to update product",
			"error":   err.Error(),
		})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Product not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Product updated successfully",
	})
}

// DeleteProduct deletes a product
func (h *AdminHandler) DeleteProduct(c *gin.Context) {
	productID := c.Param("id")

	// Check if product has order items
	var orderItemCount int
	h.db.QueryRow("SELECT COUNT(*) FROM order_items WHERE product_id = $1", productID).Scan(&orderItemCount)

	if orderItemCount > 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Cannot delete product with existing order items",
			"error":   "product_has_orders",
		})
		return
	}

	result, err := h.db.Exec("DELETE FROM products WHERE id = $1", productID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to delete product",
			"error":   err.Error(),
		})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Product not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Product deleted successfully",
	})
}

// CreateTable creates a new table
func (h *AdminHandler) CreateTable(c *gin.Context) {
	var req struct {
		TableNumber string `json:"table_number" binding:"required"`
		Capacity    int    `json:"seat_capacity" binding:"required"`
		Location    string `json:"location" binding:"required"`
		Status      string `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request body",
			"error":   err.Error(),
		})
		return
	}

	if req.Capacity <= 0 || req.Capacity > 20 {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Seat capacity must be between 1 and 20.",
		})
		return
	}

	var tableID string
	err := h.db.QueryRow(`
		INSERT INTO dining_tables (table_number, seating_capacity, location, status)
		VALUES ($1, $2, $3, $4)
		RETURNING id
	`, req.TableNumber, req.Capacity, req.Location, req.Status).Scan(&tableID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to create table",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Table created successfully",
		"data":    gin.H{"id": tableID},
	})
}

// UpdateTable updates an existing table
func (h *AdminHandler) UpdateTable(c *gin.Context) {
	tableID := c.Param("id")

	var req struct {
		TableNumber *string `json:"table_number"`
		Capacity    *int    `json:"capacity"`
		Location    *string `json:"location"`
		IsActive    *bool   `json:"is_active"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request body",
			"error":   err.Error(),
		})
		return
	}

	// Build dynamic update query
	updates := []string{}
	args := []interface{}{}
	argCount := 1

	if req.TableNumber != nil {
		updates = append(updates, fmt.Sprintf("table_number = $%d", argCount))
		args = append(args, *req.TableNumber)
		argCount++
	}
	if req.Capacity != nil {
		updates = append(updates, fmt.Sprintf("capacity = $%d", argCount))
		args = append(args, *req.Capacity)
		argCount++
	}
	if req.Location != nil {
		updates = append(updates, fmt.Sprintf("location = $%d", argCount))
		args = append(args, req.Location)
		argCount++
	}
	if req.IsActive != nil {
		updates = append(updates, fmt.Sprintf("is_active = $%d", argCount))
		args = append(args, *req.IsActive)
		argCount++
	}

	if len(updates) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "No fields to update",
		})
		return
	}

	updates = append(updates, "updated_at = CURRENT_TIMESTAMP")
	args = append(args, tableID)

	query := fmt.Sprintf(`
		UPDATE dining_tables 
		SET %s 
		WHERE id = $%d
	`, strings.Join(updates, ", "), argCount)

	result, err := h.db.Exec(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to update table",
			"error":   err.Error(),
		})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Table not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Table updated successfully",
	})
}

// DeleteTable deletes a table
func (h *AdminHandler) DeleteTable(c *gin.Context) {
	tableID := c.Param("id")

	// Check if table has orders
	var orderCount int
	h.db.QueryRow("SELECT COUNT(*) FROM orders WHERE table_id = $1", tableID).Scan(&orderCount)

	if orderCount > 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Cannot delete table with existing orders",
			"error":   "table_has_orders",
		})
		return
	}

	result, err := h.db.Exec("DELETE FROM dining_tables WHERE id = $1", tableID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to delete table",
			"error":   err.Error(),
		})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Table not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Table deleted successfully",
	})
}

// CreateUser creates a new user
func (h *AdminHandler) CreateUser(c *gin.Context) {
	var req struct {
		Username  string  `json:"username" binding:"required"`
		Email     string  `json:"email" binding:"required"`
		Password  string  `json:"password" binding:"required"`
		FirstName *string `json:"first_name"`
		LastName  *string `json:"last_name"`
		Role      string  `json:"role" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request body",
			"error":   err.Error(),
		})
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to hash password",
			"error":   err.Error(),
		})
		return
	}

	var userID string
	err = h.db.QueryRow(`
		INSERT INTO users (username, email, password_hash, first_name, last_name, role)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id
	`, req.Username, req.Email, string(hashedPassword), req.FirstName, req.LastName, req.Role).Scan(&userID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to create user",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "User created successfully",
		"data":    gin.H{"id": userID},
	})
}

// UpdateUser updates an existing user
func (h *AdminHandler) UpdateUser(c *gin.Context) {
	userID := c.Param("id")

	var req struct {
		Username  *string `json:"username"`
		Email     *string `json:"email"`
		Password  *string `json:"password"`
		FirstName *string `json:"first_name"`
		LastName  *string `json:"last_name"`
		Role      *string `json:"role"`
		IsActive  *bool   `json:"is_active"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request body",
			"error":   err.Error(),
		})
		return
	}

	// Build dynamic update query
	updates := []string{}
	args := []interface{}{}
	argCount := 1

	if req.Username != nil {
		updates = append(updates, fmt.Sprintf("username = $%d", argCount))
		args = append(args, *req.Username)
		argCount++
	}
	if req.Email != nil {
		updates = append(updates, fmt.Sprintf("email = $%d", argCount))
		args = append(args, *req.Email)
		argCount++
	}
	if req.Password != nil {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(*req.Password), bcrypt.DefaultCost)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Failed to hash password",
				"error":   err.Error(),
			})
			return
		}
		updates = append(updates, fmt.Sprintf("password_hash = $%d", argCount))
		args = append(args, string(hashedPassword))
		argCount++
	}
	if req.FirstName != nil {
		updates = append(updates, fmt.Sprintf("first_name = $%d", argCount))
		args = append(args, req.FirstName)
		argCount++
	}
	if req.LastName != nil {
		updates = append(updates, fmt.Sprintf("last_name = $%d", argCount))
		args = append(args, req.LastName)
		argCount++
	}
	if req.Role != nil {
		updates = append(updates, fmt.Sprintf("role = $%d", argCount))
		args = append(args, *req.Role)
		argCount++
	}
	if req.IsActive != nil {
		updates = append(updates, fmt.Sprintf("is_active = $%d", argCount))
		args = append(args, *req.IsActive)
		argCount++
	}

	if len(updates) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "No fields to update",
		})
		return
	}

	updates = append(updates, "updated_at = CURRENT_TIMESTAMP")
	args = append(args, userID)

	query := fmt.Sprintf(`
		UPDATE users 
		SET %s 
		WHERE id = $%d
	`, strings.Join(updates, ", "), argCount)

	result, err := h.db.Exec(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to update user",
			"error":   err.Error(),
		})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "User not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "User updated successfully",
	})
}

// DeleteUser deletes a user
func (h *AdminHandler) DeleteUser(c *gin.Context) {
	userID := c.Param("id")

	// Check if user has orders
	var orderCount int
	h.db.QueryRow("SELECT COUNT(*) FROM orders WHERE user_id = $1", userID).Scan(&orderCount)

	if orderCount > 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Cannot delete user with existing orders",
			"error":   "user_has_orders",
		})
		return
	}

	result, err := h.db.Exec("DELETE FROM users WHERE id = $1", userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to delete user",
			"error":   err.Error(),
		})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "User not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "User deleted successfully",
	})
}
