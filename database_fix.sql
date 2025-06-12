-- Fix the environmental_report table ID column
-- This script will properly set up the ID as a primary key with auto-increment

-- Step 1: Add a temporary column with proper serial type
ALTER TABLE environmental_report ADD COLUMN temp_id SERIAL;

-- Step 2: Update existing records to have sequential IDs
UPDATE environmental_report SET temp_id = DEFAULT;

-- Step 3: Drop the old id column
ALTER TABLE environmental_report DROP COLUMN id;

-- Step 4: Rename temp_id to id
ALTER TABLE environmental_report RENAME COLUMN temp_id TO id;

-- Step 5: Set id as primary key
ALTER TABLE environmental_report ADD PRIMARY KEY (id);

-- Step 6: Ensure the sequence starts from the next available number
SELECT setval(pg_get_serial_sequence('environmental_report', 'id'), (SELECT MAX(id) FROM environmental_report));

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'environmental_report' 
ORDER BY ordinal_position; 