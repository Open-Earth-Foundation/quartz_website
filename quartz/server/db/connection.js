import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, "environmental_reports.db");

// Create a single database connection
const db = new Database(dbPath);

// Enable WAL mode for better concurrent access
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA synchronous = NORMAL;");
db.exec("PRAGMA cache_size = 1000;");
db.exec("PRAGMA temp_store = memory;");

// Prepare commonly used queries for better performance
export const preparedQueries = {
  getAllReports: db.prepare(`
    SELECT * FROM environmental_report 
    WHERE (? IS NULL OR country = ?)
    AND (? IS NULL OR sector = ?)
    ORDER BY 
      CASE WHEN ? = 'name' AND ? = 'asc' THEN name END ASC,
      CASE WHEN ? = 'name' AND ? = 'desc' THEN name END DESC,
      CASE WHEN ? = 'country' AND ? = 'asc' THEN country END ASC,
      CASE WHEN ? = 'country' AND ? = 'desc' THEN country END DESC,
      CASE WHEN ? = 'human_eval' AND ? = 'asc' THEN human_eval END ASC,
      CASE WHEN ? = 'human_eval' AND ? = 'desc' THEN human_eval END DESC,
      CASE WHEN ? = 'created_at' AND ? = 'asc' THEN created_at END ASC,
      CASE WHEN ? = 'created_at' AND ? = 'desc' THEN created_at END DESC,
      id DESC
    LIMIT ? OFFSET ?
  `),

  getReportsCount: db.prepare(`
    SELECT COUNT(*) as total FROM environmental_report 
    WHERE (? IS NULL OR country = ?)
    AND (? IS NULL OR sector = ?)
  `),

  getAggregates: db.prepare(`
    SELECT 
      AVG(human_eval) as average_score,
      SUM(CASE WHEN accepted = 1 THEN 1 ELSE 0 END) as accepted_count,
      COUNT(*) as total_count
    FROM environmental_report 
    WHERE (? IS NULL OR country = ?)
    AND (? IS NULL OR sector = ?)
  `),

  getReportById: db.prepare("SELECT * FROM environmental_report WHERE id = ?"),

  updateReportReview: db.prepare(`
    UPDATE environmental_report 
    SET human_eval = ?, accepted = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `),

  getDistinctCountries: db.prepare(
    "SELECT DISTINCT country FROM environmental_report ORDER BY country"
  ),

  getDistinctSectors: db.prepare(
    "SELECT DISTINCT sector FROM environmental_report ORDER BY sector"
  ),
};

export default db;
