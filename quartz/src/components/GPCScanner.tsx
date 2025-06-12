import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGPCCoverageScan } from "@/hooks/useReports";
import { GPC_REFERENCE_NUMBERS } from "@/lib/api";
import { reportsApi, gpcPriorityHelpers, type GPCPriority } from "@/lib/api";

interface GPCScannerProps {
  countries: string[];
}

export function GPCScanner({ countries }: GPCScannerProps) {
  const [selectedCountry, setSelectedCountry] = useState<string>("");

  const {
    data: scanResult,
    isLoading,
    error,
    refetch,
  } = useGPCCoverageScan(selectedCountry);

  const handleScan = () => {
    if (selectedCountry) {
      refetch();
    }
  };

  return (
    <Card className="glass-card shadow-2xl">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center border border-accent/30">
            <span className="text-lg" aria-hidden="true">
              🔍
            </span>
          </div>
          <CardTitle className="text-xl text-foreground">
            GPC Coverage Scanner
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Country Selection */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger
                className="bg-background border-border text-foreground hover:border-accent transition-colors focus:ring-accent/50"
                aria-label="Select country to scan"
              >
                <SelectValue placeholder="Select a country to scan" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {countries.map((country) => (
                  <SelectItem
                    key={country}
                    value={country}
                    className="text-popover-foreground hover:bg-accent/10"
                  >
                    🌍 {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleScan}
            disabled={!selectedCountry || isLoading}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin mr-2" />
                Scanning...
              </>
            ) : (
              <>🔍 Scan Coverage</>
            )}
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-outlier-red/10 border border-outlier-red/30 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <span className="text-outlier-red" aria-hidden="true">
                ⚠️
              </span>
              <span className="text-outlier-red font-medium">Scan failed</span>
            </div>
            <p className="text-outlier-red text-sm mt-1">{error.message}</p>
          </div>
        )}

        {/* Priority-Based Missing GPC Analysis */}
        {scanResult && (
          <div className="space-y-6">
            {/* Coverage Summary with Priority Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="glass-card p-4 rounded-lg border border-border">
                <div className="text-2xl font-bold gradient-accent bg-clip-text text-transparent">
                  {scanResult.coveragePercentage}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Coverage
                </div>
              </div>
              <div className="glass-card p-4 rounded-lg border border-border">
                <div className="text-2xl font-bold text-red-400">
                  {gpcPriorityHelpers.groupByPriority(
                    scanResult.missingGPCNumbers
                  ).high?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  🚨 High Priority Missing
                </div>
              </div>
              <div className="glass-card p-4 rounded-lg border border-border">
                <div className="text-2xl font-bold text-yellow-400">
                  {gpcPriorityHelpers.groupByPriority(
                    scanResult.missingGPCNumbers
                  ).medium?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  ⚠️ Medium Priority Missing
                </div>
              </div>
              <div className="glass-card p-4 rounded-lg border border-border">
                <div className="text-2xl font-bold text-blue-400">
                  {gpcPriorityHelpers.groupByPriority(
                    scanResult.missingGPCNumbers
                  ).low?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  ℹ️ Low Priority Missing
                </div>
              </div>
            </div>

            {/* Prioritized Missing GPC Numbers */}
            {scanResult.missingGPCNumbers.length > 0 && (
              <Card className="glass-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <span className="text-outlier-red" aria-hidden="true">
                      🎯
                    </span>
                    Missing GPC Numbers - Prioritized for Benchmarking
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {(["high", "medium", "low"] as GPCPriority[]).map(
                    (priority) => {
                      const missingByPriority =
                        gpcPriorityHelpers.groupByPriority(
                          scanResult.missingGPCNumbers
                        );
                      const priorityMissing = missingByPriority[priority] || [];

                      if (priorityMissing.length === 0) return null;

                      const priorityConfig = {
                        high: {
                          color: "bg-red-500/20 text-red-300 border-red-500/30",
                          icon: "🚨",
                          label: "High Priority",
                          description:
                            "Critical gaps that should be addressed first",
                        },
                        medium: {
                          color:
                            "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
                          icon: "⚠️",
                          label: "Medium Priority",
                          description:
                            "Important gaps for comprehensive coverage",
                        },
                        low: {
                          color:
                            "bg-blue-500/20 text-blue-300 border-blue-500/30",
                          icon: "ℹ️",
                          label: "Low Priority",
                          description: "Optional gaps for complete coverage",
                        },
                      };

                      return (
                        <div key={priority} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span aria-hidden="true">
                                {priorityConfig[priority].icon}
                              </span>
                              <h4 className="font-semibold text-foreground">
                                {priorityConfig[priority].label} (
                                {priorityMissing.length})
                              </h4>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {priorityConfig[priority].description}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {priorityMissing.map((gpcNum) => (
                              <Badge
                                key={gpcNum}
                                variant="outline"
                                className={`text-xs font-mono ${priorityConfig[priority].color}`}
                              >
                                {gpcNum}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      );
                    }
                  )}
                </CardContent>
              </Card>
            )}

            {/* Benchmarking Insights */}
            <Card className="glass-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <span className="text-accent" aria-hidden="true">
                    📊
                  </span>
                  Benchmarking Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Coverage Status */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground">
                      Coverage Status
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Total Reports
                        </span>
                        <span className="font-medium text-foreground">
                          {scanResult.totalReports}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Covered GPC Numbers
                        </span>
                        <span className="font-medium text-foreground">
                          {scanResult.coveredGPCNumbers.length}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Missing GPC Numbers
                        </span>
                        <span className="font-medium text-foreground">
                          {scanResult.missingGPCNumbers.length}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Priority Breakdown */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground">
                      Priority Breakdown
                    </h4>
                    <div className="space-y-2">
                      {(["high", "medium", "low"] as GPCPriority[]).map(
                        (priority) => {
                          const count =
                            gpcPriorityHelpers.groupByPriority(
                              scanResult.missingGPCNumbers
                            )[priority]?.length || 0;
                          const total = scanResult.missingGPCNumbers.length;
                          const percentage =
                            total > 0 ? Math.round((count / total) * 100) : 0;

                          return (
                            <div
                              key={priority}
                              className="flex justify-between items-center"
                            >
                              <span className="text-sm text-muted-foreground capitalize">
                                {priority} Priority
                              </span>
                              <span className="font-medium text-foreground">
                                {count} ({percentage}%)
                              </span>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>

                {/* Recommendation */}
                <div className="mt-6 p-4 bg-accent/10 border border-accent/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="text-accent text-xl" aria-hidden="true">
                      💡
                    </span>
                    <div>
                      <h5 className="font-semibold text-foreground mb-1">
                        Benchmarking Recommendation
                      </h5>
                      <p className="text-sm text-muted-foreground">
                        {(() => {
                          const highMissing =
                            gpcPriorityHelpers.groupByPriority(
                              scanResult.missingGPCNumbers
                            ).high?.length || 0;
                          const mediumMissing =
                            gpcPriorityHelpers.groupByPriority(
                              scanResult.missingGPCNumbers
                            ).medium?.length || 0;

                          if (highMissing > 0) {
                            return `Focus on collecting ${highMissing} high-priority GPC numbers first. These represent critical gaps in your environmental reporting coverage.`;
                          } else if (mediumMissing > 0) {
                            return `Great job on high-priority coverage! Consider addressing ${mediumMissing} medium-priority GPC numbers for more comprehensive reporting.`;
                          } else {
                            return "Excellent coverage of high and medium priority GPC numbers! Your reporting coverage is well-positioned for benchmarking.";
                          }
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
