-- +migrate Up
CREATE TABLE IF NOT EXISTS dining_tables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    table_number VARCHAR(20) UNIQUE NOT NULL,
    seating_capacity INTEGER DEFAULT 4,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'out_of_service')),
    location VARCHAR(20) CHECK (location IN ('main_floor', 'patio', 'private_room', 'outdoor', 'bar_counter', 'takeout_counter', 'window_side')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dining_tables_table_number ON dining_tables(table_number);
CREATE INDEX IF NOT EXISTS idx_dining_tables_status ON dining_tables(status);
CREATE INDEX IF NOT EXISTS idx_dining_tables_capacity ON dining_tables(seating_capacity);

-- +migrate Down
DROP TABLE IF EXISTS dining_tables;