import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DataTable } from "./components/DataTable";
import { FilterPanel } from "./components/FilterPanel";
import { ReviewDrawer } from "./components/ReviewDrawer";
import { GPCScanner } from "./components/GPCScanner";
import { Pagination } from "./components/ui/pagination";
import { useReports, useReportsMetadata } from "./hooks/useReports";
import { EnvironmentalReport, ReportsQuery } from "./lib/api";

console.log("🚀 App.tsx loaded - starting application");

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
});

console.log("✅ QueryClient created");

function Dashboard() {
  console.log("🏗️ Dashboard component mounting...");

  const [filters, setFilters] = useState<ReportsQuery>({
    page: 1,
    limit: 10,
    sortBy: "name",
    sortOrder: "desc",
  });

  console.log("📋 Initial filters set:", filters);

  const [selectedReport, setSelectedReport] =
    useState<EnvironmentalReport | null>(null);
  const [isReviewDrawerOpen, setIsReviewDrawerOpen] = useState(false);

  console.log("🔍 About to call useReports hook...");

  // Fetch reports data with error handling
  const {
    data: reportsData,
    isLoading: reportsLoading,
    error: reportsError,
  } = useReports(filters);

  console.log("📊 Reports hook state:", {
    reportsData: reportsData ? "Data loaded" : "No data",
    reportsLoading,
    reportsError: reportsError?.message || "No error",
  });

  console.log("🌍 About to call useReportsMetadata hook...");

  const {
    data: metadata,
    isLoading: metadataLoading,
    error: metadataError,
  } = useReportsMetadata();

  console.log("🗃️ Metadata hook state:", {
    metadata: metadata ? "Metadata loaded" : "No metadata",
    metadataLoading,
    metadataError: metadataError?.message || "No error",
  });

  // Add useEffect to track when data changes
  useEffect(() => {
    console.log("📈 Dashboard data state changed:", {
      reportsData: reportsData
        ? `${reportsData.data.length} reports`
        : "No data",
      reportsLoading,
      reportsError: reportsError?.message,
      metadata: metadata
        ? `${metadata.countries.length} countries`
        : "No metadata",
      metadataLoading,
      metadataError: metadataError?.message,
    });
  }, [
    reportsData,
    reportsLoading,
    reportsError,
    metadata,
    metadataLoading,
    metadataError,
  ]);

  console.log("🎯 Dashboard render state:", {
    reportsData: reportsData ? "Available" : "Not available",
    reportsLoading,
    reportsError: reportsError?.message || null,
    metadata: metadata ? "Available" : "Not available",
    metadataLoading,
    metadataError: metadataError?.message || null,
  });

  const handleReview = (report: EnvironmentalReport) => {
    console.log("✏️ Opening review for report:", report);
    console.log("✏️ Report ID:", report.id, "Type:", typeof report.id);
    setSelectedReport(report);
    setIsReviewDrawerOpen(true);
  };

  const handleCloseReviewDrawer = () => {
    console.log("❌ Closing review drawer");
    setIsReviewDrawerOpen(false);
    setSelectedReport(null);
  };

  const handlePageChange = (page: number) => {
    console.log("📄 Changing to page:", page);
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  };

  // Show error state if there are critical errors
  if (reportsError || metadataError) {
    console.log("💥 Rendering error state");
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <div className="text-6xl" aria-hidden="true">
            ⚠️
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Something went wrong
          </h1>
          <div className="text-muted-foreground max-w-lg">
            {reportsError && (
              <p className="mb-2">Reports Error: {reportsError.message}</p>
            )}
            {metadataError && <p>Metadata Error: {metadataError.message}</p>}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors"
            aria-label="Reload the page to try again"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  console.log("🎨 Rendering main dashboard UI");

  return (
    <div className="min-h-screen gradient-bg">
      <div className="container mx-auto py-8 px-4 space-y-8 max-w-7xl">
        {/* Header */}
        <header className="text-center space-y-4 py-8" role="banner">
          <div className="inline-flex items-center justify-center w-16 h-16 glass-card rounded-full mb-4">
            <span className="text-2xl" aria-hidden="true">
              🌱
            </span>
          </div>
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-accent via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Environmental Report Dashboard
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Track, analyze, and review environmental sustainability reports from
            organizations worldwide
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span
              className="w-2 h-2 bg-accent rounded-full animate-pulse"
              aria-hidden="true"
            ></span>
            Powered by Supabase
          </div>
        </header>

        {/* Filter Panel */}
        <section aria-label="Report filters and summary statistics">
          <FilterPanel
            countries={metadata?.countries || []}
            statuses={metadata?.statuses || []}
            filters={filters}
            onFiltersChange={setFilters}
            aggregates={reportsData?.aggregates}
            metadata={metadata}
          />
        </section>

        {/* GPC Scanner */}
        <section aria-label="GPC Scanner">
          <GPCScanner countries={metadata?.countries || []} />
        </section>

        {/* Data Table */}
        <section className="space-y-6" aria-label="Environmental reports table">
          <div className="flex items-center justify-between glass-card p-6 rounded-xl">
            <div>
              <h2 className="text-3xl font-bold text-foreground">
                Environmental Reports
              </h2>
              {reportsData?.pagination && (
                <p className="text-muted-foreground mt-1">
                  Showing {reportsData.data.length} of{" "}
                  {reportsData.pagination.total} reports
                  {reportsData.pagination.totalPages > 1 && (
                    <span className="ml-2 px-2 py-1 bg-accent/20 text-accent-foreground rounded-full text-xs font-medium border border-accent/30">
                      Page {reportsData.pagination.page} of{" "}
                      {reportsData.pagination.totalPages}
                    </span>
                  )}
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold gradient-accent bg-clip-text text-transparent">
                {reportsData?.aggregates?.totalCount || 0}
              </div>
              <div className="text-sm text-muted-foreground">
                Reports Tracked
              </div>
            </div>
          </div>

          <DataTable
            data={reportsData?.data || []}
            loading={reportsLoading || metadataLoading}
            onReview={handleReview}
          />

          {/* Pagination Controls */}
          {reportsData?.pagination && reportsData.pagination.totalPages > 1 && (
            <Pagination
              currentPage={reportsData.pagination.page}
              totalPages={reportsData.pagination.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </section>

        {/* Footer */}
        <footer className="text-center py-8" role="contentinfo">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass-card rounded-full text-sm text-muted-foreground">
            <span
              className="w-2 h-2 bg-accent rounded-full"
              aria-hidden="true"
            ></span>
            Environmental Report Dashboard - All Adjustments Complete
            <span className="text-muted-foreground/60" aria-hidden="true">
              •
            </span>
            <span className="gradient-accent bg-clip-text text-transparent font-medium">
              ✨ Dark Mode Enabled
            </span>
          </div>
        </footer>
      </div>

      {selectedReport && (
        <ReviewDrawer
          report={selectedReport}
          open={isReviewDrawerOpen}
          onClose={handleCloseReviewDrawer}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  );
}

export default App;
