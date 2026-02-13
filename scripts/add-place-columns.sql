-- Add place info columns to schedule_rounds table
ALTER TABLE schedule_rounds ADD COLUMN IF NOT EXISTS place_id VARCHAR(50);
ALTER TABLE schedule_rounds ADD COLUMN IF NOT EXISTS place_name VARCHAR(255);
ALTER TABLE schedule_rounds ADD COLUMN IF NOT EXISTS place_address VARCHAR(500);
ALTER TABLE schedule_rounds ADD COLUMN IF NOT EXISTS place_category VARCHAR(100);
ALTER TABLE schedule_rounds ADD COLUMN IF NOT EXISTS place_phone VARCHAR(50);
ALTER TABLE schedule_rounds ADD COLUMN IF NOT EXISTS place_longitude VARCHAR(50);
ALTER TABLE schedule_rounds ADD COLUMN IF NOT EXISTS place_latitude VARCHAR(50);
ALTER TABLE schedule_rounds ADD COLUMN IF NOT EXISTS place_url VARCHAR(500);
