import express from "express";
import { preparedQueries } from "../db/connection.js";
import { ReportsQuerySchema, ReviewUpdateSchema } from "../types/schemas.js";

const router = express.Router();

// GET /api/reports - Get reports with filtering, pagination, and aggregates
router.get("/", (req, res) => {
  try {
    // Validate query parameters
    const queryValidation = ReportsQuerySchema.safeParse(req.query);

    if (!queryValidation.success) {
      return res.status(400).json({
        error: "Invalid query parameters",
        details: queryValidation.error.errors,
      });
    }

    const {
      country,
      sector,
      page = 1,
      limit = 10,
      sortBy = "created_at",
      sortOrder = "desc",
    } = queryValidation.data;

    const offset = (page - 1) * limit;

    // Get filtered and paginated reports
    const reports = preparedQueries.getAllReports.all(
      country,
      country,
      sector,
      sector,
      sortBy,
      sortOrder,
      sortBy,
      sortOrder,
      sortBy,
      sortOrder,
      sortBy,
      sortOrder,
      sortBy,
      sortOrder,
      sortBy,
      sortOrder,
      sortBy,
      sortOrder,
      sortBy,
      sortOrder,
      limit,
      offset
    );

    // Get total count for pagination
    const countResult = preparedQueries.getReportsCount.get(
      country,
      country,
      sector,
      sector
    );

    // Get aggregates for ranking
    const aggregates = preparedQueries.getAggregates.get(
      country,
      country,
      sector,
      sector
    );

    const totalPages = Math.ceil(countResult.total / limit);

    // Transform boolean values for JSON response
    const transformedReports = reports.map((report) => ({
      ...report,
      accepted: Boolean(report.accepted),
    }));

    res.json({
      data: transformedReports,
      pagination: {
        page,
        limit,
        total: countResult.total,
        totalPages,
      },
      aggregates: {
        averageScore: aggregates.average_score || 0,
        acceptedCount: aggregates.accepted_count || 0,
        totalCount: aggregates.total_count || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});

// GET /api/reports/metadata - Get filter options
router.get("/metadata", (req, res) => {
  try {
    const countries = preparedQueries.getDistinctCountries.all();
    const sectors = preparedQueries.getDistinctSectors.all();

    res.json({
      countries: countries.map((row) => row.country),
      sectors: sectors.map((row) => row.sector),
    });
  } catch (error) {
    console.error("Error fetching metadata:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});

// POST /api/reports/:id/review - Update report review
router.post("/:id/review", (req, res) => {
  try {
    const reportId = parseInt(req.params.id);

    if (isNaN(reportId)) {
      return res.status(400).json({
        error: "Invalid report ID",
      });
    }

    // Validate request body
    const bodyValidation = ReviewUpdateSchema.safeParse(req.body);

    if (!bodyValidation.success) {
      return res.status(400).json({
        error: "Invalid request body",
        details: bodyValidation.error.errors,
      });
    }

    const { score, accepted } = bodyValidation.data;

    // Check if report exists
    const existingReport = preparedQueries.getReportById.get(reportId);

    if (!existingReport) {
      return res.status(404).json({
        error: "Report not found",
      });
    }

    // Update the report
    const updateResult = preparedQueries.updateReportReview.run(
      score,
      accepted,
      reportId
    );

    if (updateResult.changes === 0) {
      return res.status(500).json({
        error: "Failed to update report",
      });
    }

    // Get the updated report
    const updatedReport = preparedQueries.getReportById.get(reportId);

    res.json({
      ...updatedReport,
      accepted: Boolean(updatedReport.accepted),
    });
  } catch (error) {
    console.error("Error updating report review:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});

// GET /api/reports/:id - Get single report
router.get("/:id", (req, res) => {
  try {
    const reportId = parseInt(req.params.id);

    if (isNaN(reportId)) {
      return res.status(400).json({
        error: "Invalid report ID",
      });
    }

    const report = preparedQueries.getReportById.get(reportId);

    if (!report) {
      return res.status(404).json({
        error: "Report not found",
      });
    }

    res.json({
      ...report,
      accepted: Boolean(report.accepted),
    });
  } catch (error) {
    console.error("Error fetching report:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});

export default router;
