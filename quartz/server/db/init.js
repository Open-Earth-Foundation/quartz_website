import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create database connection
const dbPath = join(__dirname, "environmental_reports.db");
const db = new Database(dbPath);

// Create the environmental_report table
const createTableSQL = `
CREATE TABLE IF NOT EXISTS environmental_report (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    country TEXT NOT NULL,
    sector TEXT NOT NULL,
    url TEXT NOT NULL,
    human_eval INTEGER DEFAULT 0,
    accepted BOOLEAN DEFAULT FALSE,
    confidence REAL DEFAULT 0.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

// Create indexes for better query performance
const createIndexes = `
CREATE INDEX IF NOT EXISTS idx_country ON environmental_report(country);
CREATE INDEX IF NOT EXISTS idx_sector ON environmental_report(sector);
CREATE INDEX IF NOT EXISTS idx_human_eval ON environmental_report(human_eval);
CREATE INDEX IF NOT EXISTS idx_accepted ON environmental_report(accepted);
`;

// Sample data for testing
const sampleData = `
INSERT OR IGNORE INTO environmental_report (id, name, country, sector, url, human_eval, accepted, confidence) VALUES
(1, 'Tesla Sustainability Report 2023', 'USA', 'Automotive', 'https://tesla.com/sustainability', 85, 1, 0.92),
(2, 'Shell Climate Report 2023', 'Netherlands', 'Energy', 'https://shell.com/climate', 72, 1, 0.88),
(3, 'Microsoft Environmental Report', 'USA', 'Technology', 'https://microsoft.com/environment', 91, 1, 0.95),
(4, 'Unilever Sustainable Living Plan', 'UK', 'Consumer Goods', 'https://unilever.com/sustainability', 78, 1, 0.85),
(5, 'Toyota Environmental Challenge 2050', 'Japan', 'Automotive', 'https://toyota.com/environment', 83, 0, 0.90),
(6, 'Amazon Sustainability Report', 'USA', 'Technology', 'https://amazon.com/sustainability', 76, 1, 0.87),
(7, 'Nestlé Creating Shared Value Report', 'Switzerland', 'Food & Beverage', 'https://nestle.com/csv', 69, 0, 0.82),
(8, 'BP Sustainability Report', 'UK', 'Energy', 'https://bp.com/sustainability', 74, 1, 0.86),
(9, 'Walmart ESG Report', 'USA', 'Retail', 'https://walmart.com/esg', 80, 1, 0.89),
(10, 'Samsung Sustainability Report', 'South Korea', 'Technology', 'https://samsung.com/sustainability', 77, 0, 0.84);
`;

try {
  console.log("Creating environmental_report table...");
  db.exec(createTableSQL);

  console.log("Creating indexes...");
  db.exec(createIndexes);

  console.log("Inserting sample data...");
  db.exec(sampleData);

  console.log("Database initialized successfully!");
  console.log(`Database location: ${dbPath}`);

  // Verify data
  const count = db
    .prepare("SELECT COUNT(*) as count FROM environmental_report")
    .get();
  console.log(`Total records: ${count.count}`);
} catch (error) {
  console.error("Error initializing database:", error);
} finally {
  db.close();
}
