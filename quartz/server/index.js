import express from "express";
import cors from "cors";
import reportsRouter from "./routes/reports.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"], // Vite dev server
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use("/api/reports", reportsRouter);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    path: req.originalUrl,
    method: req.method,
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV !== "production";

  res.status(500).json({
    error: "Internal server error",
    ...(isDevelopment && { details: error.message, stack: error.stack }),
  });
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

const server = app.listen(PORT, () => {
  console.log(
    `🚀 Environmental Reports API server running on http://localhost:${PORT}`
  );
  console.log(`📊 API endpoints:`);
  console.log(`   GET  /api/reports - List reports with filtering`);
  console.log(`   GET  /api/reports/metadata - Get filter options`);
  console.log(`   GET  /api/reports/:id - Get single report`);
  console.log(`   POST /api/reports/:id/review - Update report review`);
  console.log(`   GET  /health - Health check`);
});

export default app;
