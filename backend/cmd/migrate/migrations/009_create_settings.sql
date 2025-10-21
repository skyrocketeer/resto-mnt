-- +migrate Up
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    store_id UUID,
    store_name VARCHAR(30) NOT NULL,
    description TEXT,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(30),
    website VARCHAR(255),
    logo_url VARCHAR(200),
    currency VARCHAR(10) DEFAULT 'USD',
    tax_rate DECIMAL(5,2) DEFAULT 0.00,
    service_charge_rate DECIMAL(5,2) DEFAULT 0.00,
    opening_time VARCHAR(20),
    closing_time VARCHAR(20),
    timezone VARCHAR(50) DEFAULT 'UTC',
    default_order_type VARCHAR(20) DEFAULT 'dine_in',
    auto_print_receipts BOOLEAN DEFAULT false,
    auto_print_kitchen BOOLEAN DEFAULT false,
    receipt_footer TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO settings (store_name) VALUES ('Italia Cuisine Dining');

-- +migrate Down
DROP TABLE IF EXISTS settings;