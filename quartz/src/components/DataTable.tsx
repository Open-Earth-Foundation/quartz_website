import { useState, useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EnvironmentalReport } from "@/lib/api";

interface DataTableProps {
  data: EnvironmentalReport[];
  onReview: (report: EnvironmentalReport) => void;
  loading?: boolean;
}

export function DataTable({ data, onReview, loading }: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "name", desc: false },
  ]);

  // Memoize the data without ranking
  const tableData = useMemo(() => {
    console.log("📊 Preparing table data for", data.length, "items");
    return data;
  }, [data]);

  // Memoize the columns to prevent recreation on every render
  const columns = useMemo<ColumnDef<EnvironmentalReport>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Report Details",
        cell: ({ row }) => {
          // Safe date parsing
          const formatDate = (dateString: string | null | undefined) => {
            if (!dateString) return "No date";
            try {
              const date = new Date(dateString);
              if (isNaN(date.getTime())) return "No date";
              return date.toLocaleDateString();
            } catch (error) {
              return "No date";
            }
          };

          return (
            <div
              className="max-w-xs"
              role="cell"
              aria-label={`Report: ${row.original.name}`}
            >
              <div className="font-semibold text-white mb-1">
                {row.original.name}
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="text-xs bg-accent/20 text-accent-foreground border-accent/30"
                >
                  {row.original.sector || "Unknown Sector"}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDate(row.original.created_at)}
                </span>
              </div>
            </div>
          );
        },
        enableSorting: true,
        sortingFn: "alphanumeric",
      },
      {
        accessorKey: "country",
        header: "Country",
        cell: ({ getValue }) => (
          <Badge
            variant="outline"
            className="bg-success-green text-white border-success-green font-medium"
            role="cell"
            aria-label={`Country: ${(getValue() as string) || "Unknown"}`}
          >
            🌍 {(getValue() as string) || "Unknown"}
          </Badge>
        ),
        enableSorting: true,
        sortingFn: "alphanumeric",
      },
      {
        accessorKey: "gpc_ref_num",
        header: "GPC Reference Numbers",
        cell: ({ getValue }) => {
          const gpcNumbers = getValue() as string | undefined;

          if (!gpcNumbers || gpcNumbers.trim() === "") {
            return (
              <div className="text-center">
                <span className="text-muted-foreground text-xs">
                  No GPC numbers
                </span>
              </div>
            );
          }

          const numbers = gpcNumbers
            .split(";")
            .map((s) => s.trim())
            .filter((s) => s);

          return (
            <div
              className="space-y-1"
              role="cell"
              aria-label={`GPC reference numbers: ${numbers.join(", ")}`}
            >
              <div className="flex flex-wrap gap-1">
                {numbers.slice(0, 3).map((num, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs bg-accent/10 text-accent border-accent/30"
                  >
                    {num}
                  </Badge>
                ))}
                {numbers.length > 3 && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-muted text-muted-foreground border-border"
                  >
                    +{numbers.length - 3} more
                  </Badge>
                )}
              </div>
              {numbers.length > 3 && (
                <div className="text-xs text-muted-foreground">
                  Total: {numbers.length} GPC references
                </div>
              )}
            </div>
          );
        },
        enableSorting: false,
      },
      {
        accessorKey: "human_eval",
        header: "Scan Status",
        cell: ({ getValue }) => {
          const isScanned = getValue() as number | undefined;

          return (
            <div
              className="text-center"
              role="cell"
              aria-label={`Scan status: ${
                isScanned === 1 ? "Scanned by human" : "Not scanned by human"
              }`}
            >
              {isScanned === 1 ? (
                <Badge className="bg-success-green text-white border-success-green">
                  👤 Human Scanned
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="bg-muted text-muted-foreground border-border"
                >
                  🤖 Not Scanned
                </Badge>
              )}
            </div>
          );
        },
        enableSorting: true,
        sortingFn: (rowA, rowB) => {
          const a = rowA.original.human_eval || 0;
          const b = rowB.original.human_eval || 0;
          return a - b;
        },
      },
      {
        accessorKey: "accepted",
        header: "Status",
        cell: ({ getValue }) => {
          const accepted = getValue() as number | undefined;

          // Status mapping with improved colors
          const getStatusBadge = (status: number | undefined) => {
            switch (status) {
              case 2:
                return (
                  <Badge className="bg-success-green hover:bg-success-green/90 text-white text-xs border-success-green">
                    ✅ Accept
                  </Badge>
                );
              case 1:
                return (
                  <Badge className="bg-outlier-yellow hover:bg-outlier-yellow/90 text-white text-xs border-outlier-yellow">
                    ⚠️ Partially Accept
                  </Badge>
                );
              case 0:
              default:
                return (
                  <Badge
                    variant="outline"
                    className="bg-outlier-red border-outlier-red text-white"
                  >
                    ❌ Not Accept
                  </Badge>
                );
            }
          };

          return (
            <div
              className="text-center"
              role="cell"
              aria-label={`Status: ${
                accepted === 2
                  ? "Accept"
                  : accepted === 1
                  ? "Partially Accept"
                  : "Not Accept"
              }`}
            >
              {getStatusBadge(accepted)}
            </div>
          );
        },
        enableSorting: true,
        sortingFn: (rowA, rowB) => {
          const a = rowA.original.accepted || 0;
          const b = rowB.original.accepted || 0;
          return a - b;
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const reportUrl = row.original.url;
          const hasValidUrl =
            reportUrl && reportUrl !== "#" && reportUrl.trim() !== "";

          return (
            <div
              className="flex items-center gap-2"
              role="cell"
              aria-label="Available actions"
            >
              {hasValidUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-accent/10 border-accent/30"
                  onClick={() => window.open(reportUrl, "_blank")}
                  aria-label={`Open report URL: ${reportUrl}`}
                >
                  <span className="sr-only">Open URL</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15,3 21,3 21,9" />
                    <line x1="10" x2="21" y1="14" y2="3" />
                  </svg>
                </Button>
              )}
              <Button
                variant="default"
                size="sm"
                className="h-8 px-3 bg-accent hover:bg-accent/90"
                onClick={() => onReview(row.original)}
                aria-label={`Review report: ${row.original.name}`}
              >
                ✏️ Review
              </Button>
            </div>
          );
        },
      },
    ],
    [onReview]
  );

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  console.log("🗂️ Table state:", {
    rowCount: table.getRowModel().rows.length,
    sortingState: sorting,
  });

  if (loading) {
    console.log("⏳ Rendering loading state");
    return (
      <div className="flex items-center justify-center h-64 bg-card rounded-lg border">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          <p className="text-muted-foreground">
            Loading environmental reports...
          </p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    console.log("📄 Rendering empty state");
    return (
      <div className="flex items-center justify-center h-64 bg-card rounded-lg border">
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-semibold">No reports found</h3>
          <p className="text-muted-foreground max-w-sm">
            Try adjusting your filters or check back later for new environmental
            reports.
          </p>
        </div>
      </div>
    );
  }

  console.log("🎨 Rendering DataTable with", data.length, "rows");

  return (
    <div className="glass-card rounded-xl shadow-2xl">
      <ScrollArea className="h-[600px] w-full">
        <Table role="table" aria-label="Environmental reports data table">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="hover:bg-transparent border-b border-border"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="bg-muted/50">
                    {header.isPlaceholder ? null : (
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-semibold hover:bg-transparent"
                        onClick={
                          header.column.getCanSort()
                            ? header.column.getToggleSortingHandler()
                            : undefined
                        }
                        disabled={!header.column.getCanSort()}
                        aria-label={
                          header.column.getCanSort()
                            ? `Sort by ${flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}`
                            : undefined
                        }
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanSort() && (
                          <span
                            className="ml-2 text-muted-foreground"
                            aria-hidden="true"
                          >
                            {{
                              asc: "↑",
                              desc: "↓",
                            }[header.column.getIsSorted() as string] ?? "↕"}
                          </span>
                        )}
                      </Button>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/50 transition-colors"
                  role="row"
                  aria-rowindex={index + 2}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
