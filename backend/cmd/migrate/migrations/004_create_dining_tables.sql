-- Tables/Dining Areas
CREATE TABLE dining_tables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    table_number VARCHAR(20) UNIQUE NOT NULL,
    seating_capacity INTEGER DEFAULT 4,
    location VARCHAR(50), -- e.g., 'main floor', 'patio', 'private room'
    status VARCHAR(50) DEFAULT 'available', -- available, occupied, reserved, cleaning
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_dining_tables_table_number ON dining_tables(table_number);
CREATE INDEX IF NOT EXISTS idx_dining_tables_status ON dining_tables(status);
CREATE INDEX IF NOT EXISTS idx_dining_tables_is_active ON dining_tables(is_active);
CREATE INDEX IF NOT EXISTS idx_dining_tables_capacity ON dining_tables(capacity);

-- +migrate Down
DROP TABLE IF EXISTS dining_tables;