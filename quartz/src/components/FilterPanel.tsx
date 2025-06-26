import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportsQuery } from "@/lib/api";

interface FilterPanelProps {
  countries: string[];
  statuses: { value: number; label: string }[];
  filters: ReportsQuery;
  onFiltersChange: (filters: ReportsQuery) => void;
  aggregates?: {
    acceptedCount: number;
    totalCount: number;
    humanScannedCount: number;
  };
  metadata?: {
    humanScannedOptions?: { value: number; label: string }[];
  };
}

export function FilterPanel({
  countries,
  statuses,
  filters,
  onFiltersChange,
  aggregates,
  metadata,
}: FilterPanelProps) {
  const handleCountryChange = (value: string) => {
    onFiltersChange({
      ...filters,
      country: value === "all" ? undefined : value,
      page: 1, // Reset to first page
    });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value === "all" ? undefined : parseInt(value),
      page: 1, // Reset to first page
    });
  };

  const handleHumanScannedChange = (value: string) => {
    onFiltersChange({
      ...filters,
      humanScanned: value === "all" ? undefined : parseInt(value),
      page: 1, // Reset to first page
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      page: 1,
      limit: filters.limit,
      sortBy: "name",
      sortOrder: "desc",
    });
  };

  const hasActiveFilters =
    filters.country ||
    filters.status !== undefined ||
    filters.humanScanned !== undefined;

  // Filter out empty, null, or undefined values
  const validCountries = countries.filter(
    (country) => country && country.trim() !== "" && country !== "EMPTY"
  );

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <Card className="glass-card shadow-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center border border-accent/30">
              <span className="text-lg" aria-hidden="true">
                🔍
              </span>
            </div>
            <CardTitle className="text-xl text-foreground">Filters</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Country Filter */}
            <div className="space-y-3">
              <label
                htmlFor="country-select"
                className="text-sm font-semibold text-foreground flex items-center gap-2"
              >
                <span className="text-accent" aria-hidden="true">
                  🌍
                </span>
                Country
              </label>
              <Select
                value={filters.country || "all"}
                onValueChange={handleCountryChange}
              >
                <SelectTrigger
                  id="country-select"
                  className="bg-background border-border text-foreground hover:border-accent transition-colors focus:ring-accent/50"
                  aria-label="Filter by country"
                >
                  <SelectValue placeholder="All Countries" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem
                    value="all"
                    className="text-popover-foreground hover:bg-accent/10"
                  >
                    All Countries
                  </SelectItem>
                  {validCountries.map((country) => (
                    <SelectItem
                      key={country}
                      value={country}
                      className="text-popover-foreground hover:bg-accent/10"
                    >
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-3">
              <label
                htmlFor="status-select"
                className="text-sm font-semibold text-foreground flex items-center gap-2"
              >
                <span className="text-accent" aria-hidden="true">
                  🎯
                </span>
                Status
              </label>
              <Select
                value={
                  filters.status !== undefined
                    ? filters.status.toString()
                    : "all"
                }
                onValueChange={handleStatusChange}
              >
                <SelectTrigger
                  id="status-select"
                  className="bg-background border-border text-foreground hover:border-accent transition-colors focus:ring-accent/50"
                  aria-label="Filter by acceptance status"
                >
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem
                    value="all"
                    className="text-popover-foreground hover:bg-accent/10"
                  >
                    All Statuses
                  </SelectItem>
                  {statuses.map((status) => (
                    <SelectItem
                      key={status.value}
                      value={status.value.toString()}
                      className="text-popover-foreground hover:bg-accent/10"
                    >
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Human Scanned Filter */}
            <div className="space-y-3">
              <label
                htmlFor="human-scanned-select"
                className="text-sm font-semibold text-foreground flex items-center gap-2"
              >
                <span className="text-accent" aria-hidden="true">
                  👤
                </span>
                Scan Type
              </label>
              <Select
                value={
                  filters.humanScanned !== undefined
                    ? filters.humanScanned.toString()
                    : "all"
                }
                onValueChange={handleHumanScannedChange}
              >
                <SelectTrigger
                  id="human-scanned-select"
                  className="bg-background border-border text-foreground hover:border-accent transition-colors focus:ring-accent/50"
                  aria-label="Filter by scan type"
                >
                  <SelectValue placeholder="All Scan Types" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem
                    value="all"
                    className="text-popover-foreground hover:bg-accent/10"
                  >
                    All Scan Types
                  </SelectItem>
                  {metadata?.humanScannedOptions?.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value.toString()}
                      className="text-popover-foreground hover:bg-accent/10"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div className="flex justify-center pt-4 border-t border-border">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="hover:bg-muted border-border"
                aria-label="Clear all active filters"
              >
                <span className="mr-2" aria-hidden="true">
                  🗑️
                </span>
                Clear Filters
              </Button>
            </div>
          )}

          {/* Active Filters Indicator */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 pt-4 border-t border-border">
              <span className="text-sm font-medium text-muted-foreground">
                Active filters:
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {filters.country && (
                  <span className="px-2 py-1 bg-accent/20 text-accent-foreground border border-accent/30 rounded-md text-xs">
                    Country: {filters.country}
                  </span>
                )}
                {filters.status !== undefined && (
                  <span className="px-2 py-1 bg-accent/20 text-accent-foreground border border-accent/30 rounded-md text-xs">
                    Status:{" "}
                    {statuses.find((s) => s.value === filters.status)?.label ||
                      "Unknown"}
                  </span>
                )}
                {filters.humanScanned !== undefined && (
                  <span className="px-2 py-1 bg-accent/20 text-accent-foreground border border-accent/30 rounded-md text-xs">
                    Scan:{" "}
                    {metadata?.humanScannedOptions?.find(
                      (s) => s.value === filters.humanScanned
                    )?.label || "Unknown"}
                  </span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analytics Summary */}
      {aggregates && (
        <Card className="glass-card shadow-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-success-green/20 rounded-lg flex items-center justify-center border border-success-green/30">
                <span className="text-lg" aria-hidden="true">
                  📈
                </span>
              </div>
              <CardTitle className="text-xl text-foreground">
                Summary Statistics
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-accent">
                  {aggregates.acceptedCount}
                </div>
                <div className="text-sm text-muted-foreground">
                  Accepted Reports
                </div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-accent">
                  {aggregates.humanScannedCount}
                </div>
                <div className="text-sm text-muted-foreground">
                  Human Scanned
                </div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-foreground">
                  {aggregates.totalCount}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Reports
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
