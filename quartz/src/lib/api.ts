import { supabase } from "./supabase";

// Types (making fields optional to handle different database schemas)
export interface EnvironmentalReport {
  id: number;
  name: string;
  country?: string;
  sector?: string;
  url?: string;
  gpc_ref_num?: string; // GPC reference numbers separated by semicolons
  human_eval?: number; // 0=not scanned by human, 1=scanned by human
  accepted?: number; // 0=Not Accept, 1=Partially Accept, 2=Accept
  created_at?: string;
  updated_at?: string;
  comment?: string;
  // Additional fields that might exist in the user's database
  method_of_access?: string;
  data_format?: string;
  description?: string;
  granularity?: string;
  country_locode?: string;
}

export interface ReportsResponse {
  data: EnvironmentalReport[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  aggregates: {
    acceptedCount: number;
    totalCount: number;
    humanScannedCount: number;
  };
}

export interface ReportsMetadata {
  countries: string[];
  sectors: string[];
  statuses: { value: number; label: string }[];
  humanScannedOptions: { value: number; label: string }[];
}

export interface ReportsQuery {
  country?: string;
  sector?: string;
  status?: number; // 0, 1, or 2
  humanScanned?: number; // 0=not scanned, 1=scanned by human
  page?: number;
  limit?: number;
  sortBy?: "name" | "country" | "created_at";
  sortOrder?: "asc" | "desc";
}

export interface UpdateReviewRequest {
  accepted: number; // 0, 1, or 2
  comment?: string;
  human_eval?: number; // Mark as scanned by human
  gpc_ref_num?: string; // GPC reference numbers
}

export interface UpdateReportRequest {
  name?: string;
  country?: string;
  sector?: string;
  url?: string;
  gpc_ref_num?: string;
  accepted?: number;
  comment?: string;
  human_eval?: number;
  method_of_access?: string;
  data_format?: string;
  description?: string;
  granularity?: string;
  country_locode?: string;
}

export interface UpdateReviewResponse {
  success: boolean;
  data: EnvironmentalReport;
}

// GPC Reference Numbers for scanning
export const GPC_REFERENCE_NUMBERS = [
  "I.1.1",
  "I.1.2",
  "I.1.3",
  "I.2.1",
  "I.2.2",
  "I.2.3",
  "I.3.1",
  "I.3.2",
  "I.3.3",
  "I.4.1",
  "I.4.2",
  "I.4.3",
  "I.4.4",
  "I.5.1",
  "I.5.2",
  "I.6.1",
  "I.6.2",
  "I.7.1",
  "I.8.1",
  "II.1.1",
  "II.1.2",
  "II.1.3",
  "II.2.1",
  "II.2.2",
  "II.2.3",
  "II.3.1",
  "II.3.2",
  "II.3.3",
  "II.4.1",
  "II.4.2",
  "II.5.1",
  "III.1.1",
  "III.1.2",
  "III.2.1",
  "III.2.2",
  "III.3.1",
  "III.3.2",
  "III.4.1",
  "III.4.2",
  "III.4.3",
];

// GPC Reference Numbers with Priorities for Benchmarking
export const GPC_PRIORITIES = {
  "I.1.1": "high",
  "I.1.2": "high",
  "I.1.3": "low",
  "I.2.1": "medium",
  "I.2.2": "medium",
  "I.2.3": "low",
  "I.3.1": "medium",
  "I.3.2": "medium",
  "I.3.3": "low",
  "I.4.1": "medium",
  "I.4.2": "medium",
  "I.4.3": "low",
  "I.4.4": "low",
  "I.5.1": "medium",
  "I.5.2": "medium",
  "I.5.3": "low",
  "I.6.1": "low",
  "I.6.2": "low",
  "I.6.3": "low",
  "I.7.1": "medium",
  "I.8.1": "medium",
  "II.1.1": "high",
  "II.1.2": "low",
  "II.1.3": "low",
  "II.2.1": "medium",
  "II.2.2": "low",
  "II.2.3": "low",
  "II.3.1": "low",
  "II.3.2": "low",
  "II.3.3": "low",
  "II.4.1": "low",
  "II.4.2": "low",
  "II.4.3": "low",
  "II.5.1": "low",
  "II.5.2": "low",
  "III.1.1": "high",
  "III.1.2": "high",
  "III.1.3": "low",
  "III.2.1": "medium",
  "III.2.2": "medium",
  "III.2.3": "low",
  "III.3.1": "medium",
  "III.3.2": "medium",
  "III.3.3": "low",
  "III.4.1": "high",
  "III.4.2": "high",
  "III.4.3": "low",
  "IV.1": "low",
  "IV.2": "low",
  "V.1": "medium",
  "V.2": "medium",
  "V.3": "low",
  "VI.1": "low",
} as const;

export type GPCPriority = "high" | "medium" | "low";

// Helper functions for GPC priorities
export const gpcPriorityHelpers = {
  getPriority: (gpcRef: string): GPCPriority => {
    return GPC_PRIORITIES[gpcRef as keyof typeof GPC_PRIORITIES] || "low";
  },

  groupByPriority: (gpcRefs: string[]) => {
    return gpcRefs.reduce((acc, ref) => {
      const priority = gpcPriorityHelpers.getPriority(ref);
      if (!acc[priority]) acc[priority] = [];
      acc[priority].push(ref);
      return acc;
    }, {} as Record<GPCPriority, string[]>);
  },

  sortByPriority: (gpcRefs: string[]) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return gpcRefs.sort((a, b) => {
      const priorityA = gpcPriorityHelpers.getPriority(a);
      const priorityB = gpcPriorityHelpers.getPriority(b);
      return priorityOrder[priorityA] - priorityOrder[priorityB];
    });
  },

  getPriorityStats: (gpcRefs: string[]) => {
    const grouped = gpcPriorityHelpers.groupByPriority(gpcRefs);
    return {
      high: grouped.high?.length || 0,
      medium: grouped.medium?.length || 0,
      low: grouped.low?.length || 0,
      total: gpcRefs.length,
    };
  },
};

// API Functions using Supabase
export const reportsApi = {
  async getReports(params: ReportsQuery = {}): Promise<ReportsResponse> {
    try {
      const {
        country,
        sector,
        status,
        humanScanned,
        page = 1,
        limit = 10,
        sortBy = "name",
        sortOrder = "desc",
      } = params;

      console.log("Fetching reports with params:", params);

      // Build query
      let query = supabase
        .from("environmental_report")
        .select("*", { count: "exact" });

      // Apply filters only if the fields exist
      if (country) {
        query = query.eq("country", country);
      }
      if (sector) {
        query = query.eq("sector", sector);
      }
      if (status !== undefined) {
        query = query.eq("accepted", status);
      }
      if (humanScanned !== undefined) {
        query = query.eq("human_eval", humanScanned);
      }

      // Apply sorting - fallback to id if sortBy field doesn't exist
      const validSortFields = ["name", "country", "id"];
      const actualSortBy = validSortFields.includes(sortBy) ? sortBy : "id";
      query = query.order(actualSortBy, { ascending: sortOrder === "asc" });

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(`Failed to fetch reports: ${error.message}`);
      }

      if (!data) {
        console.warn("No data returned from Supabase");
        return {
          data: [],
          pagination: { page, limit, total: 0, totalPages: 0 },
          aggregates: {
            acceptedCount: 0,
            totalCount: 0,
            humanScannedCount: 0,
          },
        };
      }

      console.log("Raw data from Supabase:", data);

      // Debug: Check for null IDs
      const nullIdReports = data.filter((report) => !report.id);
      if (nullIdReports.length > 0) {
        console.warn("⚠️ Found reports with null/missing IDs:", nullIdReports);
      }

      const totalPages = Math.ceil((count || 0) / limit);

      return {
        data: data as EnvironmentalReport[],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages,
        },
        aggregates: {
          acceptedCount: data.filter((report) => report.accepted === 2).length,
          totalCount: count || 0,
          humanScannedCount: data.filter((report) => report.human_eval === 1)
            .length,
        },
      };
    } catch (error) {
      console.error("Error in getReports:", error);
      throw error;
    }
  },

  async getReportsMetadata(): Promise<ReportsMetadata> {
    try {
      console.log("Fetching reports metadata...");

      // Get all unique countries and sectors, handling case where columns might not exist
      const { data: allData, error } = await supabase
        .from("environmental_report")
        .select("*")
        .limit(1000); // Reasonable limit to get all unique values

      if (error) {
        console.error("Supabase metadata error:", error);
        throw new Error(`Failed to fetch metadata: ${error.message}`);
      }

      if (!allData || allData.length === 0) {
        console.warn("No data found for metadata");
        return {
          countries: [],
          sectors: [],
          statuses: [],
          humanScannedOptions: [],
        };
      }

      // Extract unique countries and sectors, filtering out null/undefined
      const countries = [
        ...new Set(
          allData
            .map((item) => item.country)
            .filter((country) => country && country.trim() !== "")
        ),
      ].sort();

      const sectors = [
        ...new Set(
          allData
            .map((item) => item.sector)
            .filter((sector) => sector && sector.trim() !== "")
        ),
      ].sort();

      const statuses = [
        { value: 0, label: "❌ Not Accept" },
        { value: 1, label: "⚠️ Partially Accept" },
        { value: 2, label: "✅ Accept" },
      ];

      const humanScannedOptions = [
        { value: 0, label: "🤖 Not Scanned by Human" },
        { value: 1, label: "👤 Scanned by Human" },
      ];

      console.log("Metadata extracted:", {
        countries,
        sectors,
        statuses,
        humanScannedOptions,
      });

      return { countries, sectors, statuses, humanScannedOptions };
    } catch (error) {
      console.error("Error in getReportsMetadata:", error);
      throw error;
    }
  },

  async getReport(id: number): Promise<EnvironmentalReport> {
    try {
      console.log("Fetching single report with ID:", id);

      const { data, error } = await supabase
        .from("environmental_report")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Supabase error fetching report:", error);
        throw new Error(`Failed to fetch report: ${error.message}`);
      }

      console.log("Report fetched:", data);
      return data as EnvironmentalReport;
    } catch (error) {
      console.error("Error in getReport:", error);
      throw error;
    }
  },

  async updateReportReview(
    id: number,
    review: UpdateReviewRequest
  ): Promise<UpdateReviewResponse> {
    try {
      console.log("Updating report review:", { id, review });

      const { data, error } = await supabase
        .from("environmental_report")
        .update(review)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Supabase error updating review:", error);
        throw new Error(`Failed to update review: ${error.message}`);
      }

      console.log("Review updated successfully:", data);
      return { success: true, data: data as EnvironmentalReport };
    } catch (error) {
      console.error("Error in updateReportReview:", error);
      throw error;
    }
  },

  async updateReport(
    id: number,
    updates: UpdateReportRequest
  ): Promise<UpdateReviewResponse> {
    try {
      console.log("Updating report:", { id, updates });

      const { data, error } = await supabase
        .from("environmental_report")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Supabase error updating report:", error);
        throw new Error(`Failed to update report: ${error.message}`);
      }

      console.log("Report updated successfully:", data);
      return { success: true, data: data as EnvironmentalReport };
    } catch (error) {
      console.error("Error in updateReport:", error);
      throw error;
    }
  },

  // Scan reports by country for GPC coverage
  async scanCountryGPCCoverage(country: string): Promise<{
    country: string;
    totalReports: number;
    coveredGPCNumbers: string[];
    missingGPCNumbers: string[];
    coveragePercentage: number;
  }> {
    try {
      console.log("Scanning GPC coverage for country:", country);

      const { data, error } = await supabase
        .from("environmental_report")
        .select("gpc_ref_num")
        .eq("country", country);

      if (error) {
        throw new Error(`Failed to scan country: ${error.message}`);
      }

      // Extract all GPC numbers from reports
      const allGPCNumbers = new Set<string>();
      data?.forEach((report) => {
        if (report.gpc_ref_num) {
          const gpcNumbers = report.gpc_ref_num
            .split(";")
            .map((s: string) => s.trim())
            .filter((s: string) => s);
          gpcNumbers.forEach((num: string) => allGPCNumbers.add(num));
        }
      });

      const coveredGPCNumbers = Array.from(allGPCNumbers).sort();
      const missingGPCNumbers = GPC_REFERENCE_NUMBERS.filter(
        (num: string) => !allGPCNumbers.has(num)
      );
      const coveragePercentage = Math.round(
        (coveredGPCNumbers.length / GPC_REFERENCE_NUMBERS.length) * 100
      );

      return {
        country,
        totalReports: data?.length || 0,
        coveredGPCNumbers,
        missingGPCNumbers,
        coveragePercentage,
      };
    } catch (error) {
      console.error("Error in scanCountryGPCCoverage:", error);
      throw error;
    }
  },
};
