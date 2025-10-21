-- +migrate Up
CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL,
    stock_num INTEGER DEFAULT 0,
    unit VARCHAR(10) DEFAULT 'pieces',
    last_restocked_at TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory(product_id);

-- +migrate Down
DROP TABLE IF EXISTS inventory;