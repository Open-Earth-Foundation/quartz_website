-- Create the environmental_reports table in Supabase
CREATE TABLE IF NOT EXISTS environmental_reports (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  sector TEXT NOT NULL,
  url TEXT NOT NULL,
  gpc_ref_num TEXT, -- GPC reference numbers separated by semicolons
  human_eval INTEGER DEFAULT 0,
  accepted INTEGER DEFAULT 0, -- 0=not accept, 1=partially accept, 2=accept
  comment TEXT, -- Review comments
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create RLS (Row Level Security) policies - adjust based on your auth needs
ALTER TABLE environmental_reports ENABLE ROW LEVEL SECURITY;

-- Allow public read access (you can modify this based on your auth requirements)
CREATE POLICY "Allow public read access" ON environmental_reports
  FOR SELECT USING (true);

-- Allow public insert access (modify if needed)
CREATE POLICY "Allow public insert access" ON environmental_reports
  FOR INSERT WITH CHECK (true);

-- Allow public update access (modify if needed)
CREATE POLICY "Allow public update access" ON environmental_reports
  FOR UPDATE USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_environmental_reports_country ON environmental_reports(country);
CREATE INDEX IF NOT EXISTS idx_environmental_reports_sector ON environmental_reports(sector);
CREATE INDEX IF NOT EXISTS idx_environmental_reports_human_eval ON environmental_reports(human_eval);
CREATE INDEX IF NOT EXISTS idx_environmental_reports_accepted ON environmental_reports(accepted);
CREATE INDEX IF NOT EXISTS idx_environmental_reports_created_at ON environmental_reports(created_at);
CREATE INDEX IF NOT EXISTS idx_environmental_reports_gpc_ref_num ON environmental_reports USING gin(string_to_array(gpc_ref_num, ';'));

-- Insert sample data with GPC reference numbers
INSERT INTO environmental_reports (name, country, sector, url, gpc_ref_num, human_eval, accepted) VALUES
('Tesla 2023 Impact Report', 'United States', 'Automotive', 'https://www.tesla.com/impact-report-2023', 'II.1.1;II.2.1;II.3.1', 1, 2),
('Microsoft Sustainability Report 2023', 'United States', 'Technology', 'https://query.prod.cms.rt.microsoft.com/cms/api/am/binary/RW15mgm', 'I.1.1;I.2.1;III.1.1', 1, 2),
('Apple Environmental Progress Report 2023', 'United States', 'Technology', 'https://www.apple.com/environment/pdf/Apple_Environmental_Progress_Report_2023.pdf', 'I.1.1;I.2.1;II.1.1', 1, 2),
('Shell Sustainability Report 2023', 'Netherlands', 'Energy', 'https://reports.shell.com/sustainability-report/2023/', 'I.4.1;I.4.2;I.4.3;I.4.4', 0, 0),
('Unilever Sustainable Living Report', 'United Kingdom', 'Consumer Goods', 'https://www.unilever.com/planet-and-society/sustainability-report/', 'I.3.1;II.1.1;III.2.1', 1, 2),
('Nestlé Creating Shared Value Report 2023', 'Switzerland', 'Food & Beverage', 'https://www.nestle.com/csv/reports', 'I.3.1;I.5.1;II.1.1', 1, 1),
('Siemens Sustainability Report 2023', 'Germany', 'Industrial', 'https://www.siemens.com/global/en/company/sustainability/report.html', 'I.1.1;I.2.1;II.1.1;II.2.1', 1, 2),
('Toyota Environmental Report 2023', 'Japan', 'Automotive', 'https://global.toyota/en/sustainability/report/', 'II.1.1;II.2.1;II.3.1', 1, 2),
('IKEA Sustainability Report 2023', 'Sweden', 'Retail', 'https://www.ikea.com/global/en/our-business/reports/', 'I.1.1;II.1.1;III.3.1', 1, 2),
('Walmart ESG Report 2023', 'United States', 'Retail', 'https://corporate.walmart.com/esgreport', 'I.1.1;II.1.1;II.3.1', 0, 0),
('BP Sustainability Report 2023', 'United Kingdom', 'Energy', 'https://www.bp.com/en/global/corporate/sustainability/', 'I.4.1;I.4.2;I.4.3', 0, 0),
('Samsung Sustainability Report 2023', 'South Korea', 'Technology', 'https://www.samsung.com/us/aboutsamsung/sustainability/', 'I.1.1;I.2.1;II.1.1', 1, 2);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_environmental_reports_updated_at 
    BEFORE UPDATE ON environmental_reports 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Migration script for existing databases
-- Add the gpc_ref_num column if it doesn't exist
ALTER TABLE environmental_reports ADD COLUMN IF NOT EXISTS gpc_ref_num TEXT;

-- Add comment column if it doesn't exist
ALTER TABLE environmental_reports ADD COLUMN IF NOT EXISTS comment TEXT;

-- Drop confidence column if it exists
ALTER TABLE environmental_reports DROP COLUMN IF EXISTS confidence;

-- Update accepted column to integer if it's still boolean
-- Note: This might need to be run manually in production
-- ALTER TABLE environmental_reports ALTER COLUMN accepted TYPE INTEGER USING CASE WHEN accepted THEN 2 ELSE 0 END; 