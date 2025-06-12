import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { TagInput } from "@/components/ui/tag-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EnvironmentalReport } from "@/lib/api";
import { useUpdateReportReview, useUpdateReport } from "@/hooks/useReports";

interface ReviewDrawerProps {
  report: EnvironmentalReport | null;
  open: boolean;
  onClose: () => void;
}

export function ReviewDrawer({ report, open, onClose }: ReviewDrawerProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [accepted, setAccepted] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [humanEval, setHumanEval] = useState<number>(0);

  // Editable fields
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [sector, setSector] = useState("");
  const [url, setUrl] = useState("");
  const [gpcRefNum, setGpcRefNum] = useState("");
  const [methodOfAccess, setMethodOfAccess] = useState("");
  const [dataFormat, setDataFormat] = useState("");
  const [description, setDescription] = useState("");
  const [granularity, setGranularity] = useState("");
  const [countryLocode, setCountryLocode] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateReviewMutation = useUpdateReportReview();
  const updateReportMutation = useUpdateReport();

  // Reset form when report changes
  useEffect(() => {
    if (report) {
      setAccepted(report.accepted || 0);
      setComment(report.comment || "");
      setHumanEval(report.human_eval || 0);
      setName(report.name || "");
      setCountry(report.country || "");
      setSector(report.sector || "");
      setUrl(report.url || "");
      setGpcRefNum(report.gpc_ref_num || "");
      setMethodOfAccess(report.method_of_access || "");
      setDataFormat(report.data_format || "");
      setDescription(report.description || "");
      setGranularity(report.granularity || "");
      setCountryLocode(report.country_locode || "");
    }
  }, [report]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("🐛 DEBUG - Report object:", report);
    console.log("🐛 DEBUG - Report ID:", report?.id);
    console.log("🐛 DEBUG - Report ID type:", typeof report?.id);
    console.log(
      "🐛 DEBUG - All report keys:",
      report ? Object.keys(report) : "No report"
    );

    if (
      !report ||
      !report.id ||
      report.id === null ||
      report.id === undefined
    ) {
      console.error("No report or report ID available");
      console.error("Report exists:", !!report);
      console.error("Report ID exists:", !!report?.id);
      console.error("Report ID value:", report?.id);

      // Show a more helpful error message
      const errorMessage = !report
        ? "No report selected"
        : !report.id || report.id === null || report.id === undefined
        ? "Report is missing a valid ID. This indicates a database issue - the ID column needs to be fixed."
        : "Unknown error";

      alert(`❌ Error: ${errorMessage}`);
      return;
    }

    console.log("Submitting review for report ID:", report.id);

    setIsSubmitting(true);

    try {
      await updateReviewMutation.mutateAsync({
        id: report.id,
        review: {
          accepted,
          comment: comment.trim() || undefined,
          human_eval: humanEval,
          gpc_ref_num: gpcRefNum.trim(),
        },
      });

      // Close drawer and show success
      onClose();

      // Show success message
      setTimeout(() => {
        alert("✅ Review updated successfully!");
      }, 100);
    } catch (error) {
      console.error("Failed to update review:", error);
      alert("❌ Failed to update review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReportUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !report ||
      !report.id ||
      report.id === null ||
      report.id === undefined
    ) {
      console.error("No report or report ID available");

      const errorMessage = !report
        ? "No report selected"
        : !report.id || report.id === null || report.id === undefined
        ? "Report is missing a valid ID. This indicates a database issue - the ID column needs to be fixed."
        : "Unknown error";

      alert(`❌ Error: ${errorMessage}`);
      return;
    }

    console.log("Updating report with ID:", report.id);

    setIsSubmitting(true);

    try {
      await updateReportMutation.mutateAsync({
        id: report.id,
        updates: {
          name: name.trim(),
          country: country.trim(),
          sector: sector.trim(),
          url: url.trim(),
          gpc_ref_num: gpcRefNum.trim(),
          accepted,
          comment: comment.trim() || undefined,
          human_eval: humanEval,
          method_of_access: methodOfAccess.trim(),
          data_format: dataFormat.trim(),
          description: description.trim(),
          granularity: granularity.trim(),
          country_locode: countryLocode.trim(),
        },
      });

      // Close drawer and show success
      onClose();
      setIsEditMode(false);

      // Show success message
      setTimeout(() => {
        alert("✅ Report updated successfully!");
      }, 100);
    } catch (error) {
      console.error("Failed to update report:", error);
      alert("❌ Failed to update report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setIsEditMode(false);
    onClose();
  };

  if (!report) return null;

  // Status options with updated colors
  const statusOptions = [
    { value: 0, label: "❌ Not Accept", color: "text-outlier-red" },
    { value: 1, label: "⚠️ Partially Accept", color: "text-outlier-yellow" },
    { value: 2, label: "✅ Accept", color: "text-success-green" },
  ];

  const humanEvalOptions = [
    { value: 0, label: "🤖 Not Scanned by Human" },
    { value: 1, label: "👤 Scanned by Human" },
  ];

  const currentStatus = statusOptions.find((s) => s.value === accepted);
  const currentHumanEval = humanEvalOptions.find((s) => s.value === humanEval);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-4xl bg-card border border-border shadow-2xl max-h-[90vh] overflow-y-auto"
        aria-describedby="review-dialog-description"
      >
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center border border-accent/30">
                <span className="text-2xl" aria-hidden="true">
                  {isEditMode ? "✏️" : "👁️"}
                </span>
              </div>
              <div>
                <DialogTitle className="text-xl text-foreground">
                  {isEditMode
                    ? "Edit Environmental Report"
                    : "Review Environmental Report"}
                </DialogTitle>
                <DialogDescription
                  id="review-dialog-description"
                  className="text-muted-foreground"
                >
                  {isEditMode
                    ? "Update all report details and review status"
                    : "Update the acceptance status and comments for this report"}
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsEditMode(!isEditMode)}
              disabled={isSubmitting}
              className="hover:bg-muted"
            >
              {isEditMode ? "👁️ View Mode" : "✏️ Edit Mode"}
            </Button>
          </div>
        </DialogHeader>

        {/* Report Info / Edit Form */}
        <div className="bg-muted/50 backdrop-blur-sm p-4 rounded-lg border border-border space-y-4">
          {isEditMode ? (
            <form onSubmit={handleReportUpdate} className="space-y-4">
              {/* Editable Report Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-name"
                    className="text-foreground font-semibold"
                  >
                    Report Name
                  </Label>
                  <Input
                    id="edit-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-background border-border"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-country"
                    className="text-foreground font-semibold"
                  >
                    Country
                  </Label>
                  <Input
                    id="edit-country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="bg-background border-border"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-sector"
                    className="text-foreground font-semibold"
                  >
                    Sector
                  </Label>
                  <Input
                    id="edit-sector"
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    className="bg-background border-border"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-url"
                    className="text-foreground font-semibold"
                  >
                    Report URL
                  </Label>
                  <Input
                    id="edit-url"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="bg-background border-border"
                    placeholder="https://example.com/report.pdf"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-method-access"
                    className="text-foreground font-semibold"
                  >
                    Method of Access
                  </Label>
                  <Input
                    id="edit-method-access"
                    value={methodOfAccess}
                    onChange={(e) => setMethodOfAccess(e.target.value)}
                    className="bg-background border-border"
                    placeholder="Direct download, API, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-data-format"
                    className="text-foreground font-semibold"
                  >
                    Data Format
                  </Label>
                  <Input
                    id="edit-data-format"
                    value={dataFormat}
                    onChange={(e) => setDataFormat(e.target.value)}
                    className="bg-background border-border"
                    placeholder="PDF, CSV, JSON, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-granularity"
                    className="text-foreground font-semibold"
                  >
                    Granularity
                  </Label>
                  <Input
                    id="edit-granularity"
                    value={granularity}
                    onChange={(e) => setGranularity(e.target.value)}
                    className="bg-background border-border"
                    placeholder="City, Regional, National, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-country-locode"
                    className="text-foreground font-semibold"
                  >
                    Country LOCODE
                  </Label>
                  <Input
                    id="edit-country-locode"
                    value={countryLocode}
                    onChange={(e) => setCountryLocode(e.target.value)}
                    className="bg-background border-border"
                    placeholder="US, DE, FR, etc."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="edit-description"
                  className="text-foreground font-semibold"
                >
                  Description
                </Label>
                <Textarea
                  id="edit-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-20 bg-background border-border text-foreground focus:border-accent focus:ring-accent/50 placeholder:text-muted-foreground resize-none"
                  placeholder="Brief description of the report content..."
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="edit-gpc-ref"
                  className="text-foreground font-semibold"
                >
                  GPC Reference Numbers
                </Label>
                <TagInput
                  value={
                    gpcRefNum
                      ? gpcRefNum
                          .split(";")
                          .map((s) => s.trim())
                          .filter((s) => s)
                      : []
                  }
                  onChange={(values) => setGpcRefNum(values.join(";"))}
                  placeholder="Type GPC reference number (e.g., I.1.1) and press Enter"
                  disabled={isSubmitting}
                />
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-foreground mb-1">
                  {report.name}
                </h4>
                <div className="flex items-center gap-2 text-sm flex-wrap">
                  <Badge
                    variant="outline"
                    className="bg-accent/20 text-accent-foreground border-accent/30"
                  >
                    🌍 {report.country || "Unknown Country"}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-success-green text-white border-success-green"
                  >
                    🏭 {report.sector || "Unknown Sector"}
                  </Badge>
                  {report.url && (
                    <a
                      href={report.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-accent/20 text-accent-foreground border border-accent/30 rounded-md hover:bg-accent/30 transition-colors no-underline"
                      aria-label={`Open report URL: ${report.url}`}
                    >
                      🔗 Open Report
                    </a>
                  )}
                </div>
              </div>

              {/* Additional Report Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {report.method_of_access && (
                  <div>
                    <span className="font-medium text-foreground">
                      Method of Access:
                    </span>
                    <span className="ml-2 text-muted-foreground">
                      {report.method_of_access}
                    </span>
                  </div>
                )}
                {report.data_format && (
                  <div>
                    <span className="font-medium text-foreground">
                      Data Format:
                    </span>
                    <span className="ml-2 text-muted-foreground">
                      {report.data_format}
                    </span>
                  </div>
                )}
                {report.granularity && (
                  <div>
                    <span className="font-medium text-foreground">
                      Granularity:
                    </span>
                    <span className="ml-2 text-muted-foreground">
                      {report.granularity}
                    </span>
                  </div>
                )}
                {report.country_locode && (
                  <div>
                    <span className="font-medium text-foreground">
                      Country LOCODE:
                    </span>
                    <span className="ml-2 text-muted-foreground">
                      {report.country_locode}
                    </span>
                  </div>
                )}
              </div>

              {report.description && (
                <div>
                  <span className="text-sm font-medium text-foreground">
                    Description:
                  </span>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {report.description}
                  </p>
                </div>
              )}

              {/* GPC Reference Numbers Display */}
              {report.gpc_ref_num && (
                <div>
                  <span className="text-sm font-medium text-foreground">
                    GPC Reference Numbers:
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {report.gpc_ref_num.split(";").map((num, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-xs bg-accent/10 text-accent border-accent/30"
                      >
                        {num.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Review Form */}
        <form
          onSubmit={isEditMode ? handleReportUpdate : handleReviewSubmit}
          className="space-y-6"
        >
          {/* GPC Reference Numbers - Always Editable */}
          <div className="space-y-3">
            <Label className="text-foreground font-semibold flex items-center gap-2">
              <span className="text-accent" aria-hidden="true">
                🏷️
              </span>
              GPC Reference Numbers
            </Label>
            <TagInput
              value={
                gpcRefNum
                  ? gpcRefNum
                      .split(";")
                      .map((s) => s.trim())
                      .filter((s) => s)
                  : []
              }
              onChange={(values) => setGpcRefNum(values.join(";"))}
              placeholder="Type GPC reference number (e.g., I.1.1) and press Enter"
              disabled={isSubmitting}
            />
          </div>

          {/* Human Evaluation Status */}
          <div className="space-y-3">
            <Label
              htmlFor="human-eval-select"
              className="text-foreground font-semibold flex items-center gap-2"
            >
              <span className="text-accent" aria-hidden="true">
                👤
              </span>
              Scan Status
            </Label>
            <Select
              value={humanEval.toString()}
              onValueChange={(value) => setHumanEval(parseInt(value))}
              disabled={isSubmitting}
            >
              <SelectTrigger
                id="human-eval-select"
                className="bg-background border-border text-foreground focus:border-accent focus:ring-accent/50"
              >
                <SelectValue placeholder="Select scan status" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {humanEvalOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value.toString()}
                    className="hover:bg-accent/10"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Select */}
          <div className="space-y-3">
            <Label
              htmlFor="status-select"
              className="text-foreground font-semibold flex items-center gap-2"
            >
              <span className="text-accent" aria-hidden="true">
                ✅
              </span>
              Acceptance Status
            </Label>
            <Select
              value={accepted.toString()}
              onValueChange={(value) => setAccepted(parseInt(value))}
              disabled={isSubmitting}
            >
              <SelectTrigger
                id="status-select"
                className="bg-background border-border text-foreground focus:border-accent focus:ring-accent/50"
                aria-describedby="status-help"
              >
                <SelectValue placeholder="Select acceptance status" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {statusOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value.toString()}
                    className="hover:bg-accent/10"
                  >
                    <span className={option.color}>{option.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p id="status-help" className="text-xs text-muted-foreground">
              Select whether to accept, partially accept, or reject this report
            </p>
          </div>

          {/* Comment Textarea */}
          <div className="space-y-3">
            <Label
              htmlFor="comment"
              className="text-foreground font-semibold flex items-center gap-2"
            >
              <span className="text-accent" aria-hidden="true">
                💬
              </span>
              Review Comments
            </Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add optional comments about this report..."
              className="min-h-24 bg-background border-border text-foreground focus:border-accent focus:ring-accent/50 placeholder:text-muted-foreground resize-none"
              disabled={isSubmitting}
              aria-describedby="comment-help"
            />
            <p id="comment-help" className="text-xs text-muted-foreground">
              Optional: Add additional context or feedback about this report
            </p>
          </div>

          {/* Current Status Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentStatus && (
              <div className="bg-muted/30 p-3 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Current Status:
                  </span>
                  <span
                    className={`text-sm font-medium ${currentStatus.color}`}
                  >
                    {currentStatus.label}
                  </span>
                </div>
              </div>
            )}
            {currentHumanEval && (
              <div className="bg-muted/30 p-3 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Scan Status:
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {currentHumanEval.label}
                  </span>
                </div>
              </div>
            )}
          </div>
        </form>

        <DialogFooter className="flex items-center gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="hover:bg-muted"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={isEditMode ? handleReportUpdate : handleReviewSubmit}
            disabled={isSubmitting}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
            aria-describedby="submit-button-help"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin mr-2" />
                {isEditMode ? "Updating Report..." : "Saving Review..."}
              </>
            ) : (
              <>
                💾{" "}
                {isEditMode ? "Save All Changes" : "Save Review & GPC Numbers"}
              </>
            )}
          </Button>
          <p id="submit-button-help" className="sr-only">
            Save the changes to the database
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
