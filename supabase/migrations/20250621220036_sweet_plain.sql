-- Migration: Fix notification_types schema to ensure is_active column exists
-- Fecha: 2025-06-21

-- Check if is_active column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notification_types' 
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE notification_types ADD COLUMN is_active BOOLEAN DEFAULT true;
        
        -- Update existing records to have is_active = true
        UPDATE notification_types SET is_active = true WHERE is_active IS NULL;
    END IF;
END $$;

-- Ensure the table has all required columns with proper defaults
DO $$
BEGIN
    -- Add icon_name column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notification_types' 
        AND column_name = 'icon_name'
    ) THEN
        ALTER TABLE notification_types ADD COLUMN icon_name VARCHAR(50) DEFAULT 'bell';
    END IF;

    -- Add color column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notification_types' 
        AND column_name = 'color'
    ) THEN
        ALTER TABLE notification_types ADD COLUMN color VARCHAR(7) DEFAULT '#237584';
    END IF;

    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notification_types' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE notification_types ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Ensure the updated_at trigger exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_notification_types_updated_at ON notification_types;
CREATE TRIGGER update_notification_types_updated_at 
    BEFORE UPDATE ON notification_types 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update any NULL values to have proper defaults
UPDATE notification_types 
SET 
    is_active = COALESCE(is_active, true),
    icon_name = COALESCE(icon_name, 'bell'),
    color = COALESCE(color, '#237584'),
    updated_at = COALESCE(updated_at, NOW())
WHERE is_active IS NULL OR icon_name IS NULL OR color IS NULL OR updated_at IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN notification_types.is_active IS 'Indica si el tipo de notificación está activo y disponible para usar';