import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  reportsApi,
  type ReportsQuery,
  type UpdateReviewRequest,
  type UpdateReportRequest,
  type UpdateReviewResponse,
} from "@/lib/api";

console.log("📦 useReports hooks module loaded");

// Query Keys
export const reportKeys = {
  all: ["reports"] as const,
  lists: () => [...reportKeys.all, "list"] as const,
  list: (params: ReportsQuery) => [...reportKeys.lists(), params] as const,
  details: () => [...reportKeys.all, "detail"] as const,
  detail: (id: number) => [...reportKeys.details(), id] as const,
  metadata: () => [...reportKeys.all, "metadata"] as const,
  gpcScan: (country: string) =>
    [...reportKeys.all, "gpc-scan", country] as const,
};

// Reports List Hook
export function useReports(query: ReportsQuery) {
  console.log("🔄 useReports called with query:", query);

  return useQuery({
    queryKey: ["reports", query],
    queryFn: async () => {
      console.log("🚀 Starting getReports API call...");
      try {
        const result = await reportsApi.getReports(query);
        console.log("✅ getReports API call successful:", {
          dataCount: result.data.length,
          total: result.pagination.total,
          aggregates: result.aggregates,
        });
        return result;
      } catch (error) {
        console.error("💥 getReports API call failed:", error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Reports Metadata Hook
export function useReportsMetadata() {
  console.log("🔄 useReportsMetadata called");

  return useQuery({
    queryKey: ["reports", "metadata"],
    queryFn: async () => {
      console.log("🚀 Starting getReportsMetadata API call...");
      try {
        const result = await reportsApi.getReportsMetadata();
        console.log("✅ getReportsMetadata API call successful:", result);
        return result;
      } catch (error) {
        console.error("💥 getReportsMetadata API call failed:", error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Single Report Hook
export function useSingleReport(id: number) {
  console.log("🔄 useSingleReport called with id:", id);

  return useQuery({
    queryKey: ["reports", id],
    queryFn: async () => {
      console.log("🚀 Starting getReport API call for id:", id);
      try {
        const result = await reportsApi.getReport(id);
        console.log("✅ getReport API call successful:", result);
        return result;
      } catch (error) {
        console.error("💥 getReport API call failed:", error);
        throw error;
      }
    },
    enabled: !!id,
  });
}

// GPC Coverage Scan Hook
export function useGPCCoverageScan(country: string) {
  console.log("🔄 useGPCCoverageScan called with country:", country);

  return useQuery({
    queryKey: reportKeys.gpcScan(country),
    queryFn: async () => {
      console.log("🚀 Starting scanCountryGPCCoverage API call for:", country);
      try {
        const result = await reportsApi.scanCountryGPCCoverage(country);
        console.log("✅ scanCountryGPCCoverage API call successful:", result);
        return result;
      } catch (error) {
        console.error("💥 scanCountryGPCCoverage API call failed:", error);
        throw error;
      }
    },
    enabled: !!country,
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}

// Update Report Review Hook
export function useUpdateReportReview() {
  console.log("🔄 useUpdateReportReview hook created");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      review,
    }: {
      id: number;
      review: UpdateReviewRequest;
    }) => {
      console.log("🚀 Starting updateReportReview mutation:", { id, review });
      try {
        const result = await reportsApi.updateReportReview(id, review);
        console.log("✅ updateReportReview successful:", result);
        return result;
      } catch (error) {
        console.error("💥 updateReportReview failed:", error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log(
        "🎉 useUpdateReportReview onSuccess, invalidating queries..."
      );
      // Invalidate and refetch reports
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
    onError: (error) => {
      console.error("💀 useUpdateReportReview onError:", error);
    },
  });
}

// Update Report Hook (for editing all fields)
export function useUpdateReport() {
  console.log("🔄 useUpdateReport hook created");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: number;
      updates: UpdateReportRequest;
    }) => {
      console.log("🚀 Starting updateReport mutation:", { id, updates });
      try {
        const result = await reportsApi.updateReport(id, updates);
        console.log("✅ updateReport successful:", result);
        return result;
      } catch (error) {
        console.error("💥 updateReport failed:", error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log("🎉 useUpdateReport onSuccess, invalidating queries...");
      // Invalidate and refetch reports
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
    onError: (error) => {
      console.error("💀 useUpdateReport onError:", error);
    },
  });
}
