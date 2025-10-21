-- +migrate Up
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    order_number VARCHAR(20) UNIQUE NOT NULL,
    order_type VARCHAR(20) NOT NULL CHECK (order_type IN (
        'dine-in',
        'takeout',
        'delivery',
        'pickup'
    )) DEFAULT 'dine-in',
    table_id UUID,
    user_id UUID, -- Staff who created the order,
    customer_name VARCHAR(30),
    customer_phone VARCHAR(15),
    customer_email VARCHAR(30),
    status VARCHAR(20) NOT NULL CHECK (status IN (
        'pending',
        'confirmed',
        'preparing',
        'ready',
        'served',
        'completed',
        'cancelled'
    )) DEFAULT 'pending',
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    payment_status VARCHAR(10) CHECK (payment_status IN (
        'pending',
        'paid',
        'failed',
        'refunded'
    )) DEFAULT 'pending',
    payment_method VARCHAR(50),
    special_instructions TEXT,
    estimated_preparation_time INTEGER,
    served_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    kitchen_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_table_id ON orders(table_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

-- +migrate Down
DROP TABLE IF EXISTS orders;