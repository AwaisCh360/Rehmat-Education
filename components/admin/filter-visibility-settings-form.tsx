"use client";

import { useState, useTransition } from "react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { FilterVisibilitySettings } from "@/lib/programs/filter-visibility";
import type { ImportSettings } from "@/lib/programs/import-settings";
import type { PdfVisibilitySettings } from "@/lib/programs/pdf-visibility";

const filterFieldLabels: Array<keyof FilterVisibilitySettings> = [
  "search",
  "university",
  "programName",
  "degree",
  "language",
  "campus",
  "quota",
  "discountedFeeRange",
  "sort"
];

const filterLabelMap: Record<keyof FilterVisibilitySettings, string> = {
  search: "Global search",
  university: "University filter",
  programName: "Program name filter",
  degree: "Degree filter",
  language: "Language filter",
  campus: "Campus filter",
  quota: "Quota filter",
  discountedFeeRange: "Discounted fee range",
  sort: "Sort filter"
};

const pdfFieldLabels: Array<keyof PdfVisibilitySettings> = [
  "showUniversity",
  "showProgram",
  "showDegree",
  "showLanguage",
  "showCampus",
  "showAcademicYear",
  "showSemester",
  "showQuotaStatus",
  "showCurrency",
  "showTuitionFee",
  "showDiscountedFee",
  "showPrepSchoolFee",
  "showCashPaymentFee",
  "showDepositPrice"
];

const pdfLabelMap: Record<keyof PdfVisibilitySettings, string> = {
  showUniversity: "University",
  showProgram: "Program",
  showDegree: "Degree",
  showLanguage: "Language",
  showCampus: "Campus",
  showAcademicYear: "Academic year",
  showSemester: "Semester",
  showQuotaStatus: "Quota status",
  showCurrency: "Currency",
  showTuitionFee: "Tuition fee",
  showDiscountedFee: "Discounted fee",
  showPrepSchoolFee: "Prep school fee",
  showCashPaymentFee: "Cash payment fee",
  showDepositPrice: "Deposit price"
};

export function FilterVisibilitySettingsForm({
  initialFilterSettings,
  initialPdfSettings,
  initialImportSettings
}: {
  initialFilterSettings: FilterVisibilitySettings;
  initialPdfSettings: PdfVisibilitySettings;
  initialImportSettings: ImportSettings;
}) {
  const [filterSettings, setFilterSettings] = useState(initialFilterSettings);
  const [pdfSettings, setPdfSettings] = useState(initialPdfSettings);
  const [importSettings, setImportSettings] = useState(initialImportSettings);
  const [isPending, startTransition] = useTransition();
  const [isSyncPending, startSyncTransition] = useTransition();

  return (
    <Card className="rounded-2xl border-border/70">
      <CardHeader>
        <CardTitle>Agent visibility controls</CardTitle>
        <CardDescription>Choose which filters agents see and what PDF fields agents can download.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Program filters</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {filterFieldLabels.map((field) => (
              <label key={field} className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/30 px-4 py-3">
                <span className="text-sm font-medium">{filterLabelMap[field]}</span>
                <input
                  checked={filterSettings[field]}
                  className="h-4 w-4 accent-primary"
                  onChange={(event) => setFilterSettings((current) => ({ ...current, [field]: event.target.checked }))}
                  type="checkbox"
                />
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Programs update</h3>
          <div className="space-y-3 rounded-xl border border-border/70 bg-muted/30 px-4 py-3">
            <div className="space-y-2">
              <div className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Source URL</div>
              <Input
                onChange={(event) =>
                  setImportSettings((current) => ({
                    ...current,
                    sourceUrl: event.target.value
                  }))
                }
                placeholder="https://partner.unitededucation.com/Manage/test?termid=..."
                type="url"
                value={importSettings.sourceUrl}
              />
            </div>

            <Button
              disabled={isSyncPending}
              onClick={() => {
                startSyncTransition(async () => {
                  const response = await fetch("/api/admin/import/sync", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                      sourceUrl: importSettings.sourceUrl
                    })
                  });

                  const payload = await response.json();

                  if (!response.ok) {
                    toast.error(payload.error ?? "Programs update failed.");
                    return;
                  }

                  toast.success(`Programs updated (${payload.rowCount} records).`);
                });
              }}
              variant="secondary"
            >
              {isSyncPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              Update programs now
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Agent PDF fields</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {pdfFieldLabels.map((field) => (
              <label key={field} className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/30 px-4 py-3">
                <span className="text-sm font-medium">{pdfLabelMap[field]}</span>
                <input
                  checked={pdfSettings[field]}
                  className="h-4 w-4 accent-primary"
                  onChange={(event) => setPdfSettings((current) => ({ ...current, [field]: event.target.checked }))}
                  type="checkbox"
                />
              </label>
            ))}
          </div>
        </div>

        <Button
          disabled={isPending}
          onClick={() => {
            startTransition(async () => {
              const [filtersResponse, pdfResponse, importResponse] = await Promise.all([
                fetch("/api/admin/settings/filters", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify(filterSettings)
                }),
                fetch("/api/admin/settings/pdf", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify(pdfSettings)
                }),
                fetch("/api/admin/settings/import", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify(importSettings)
                })
              ]);

              const [filtersPayload, pdfPayload, importPayload] = await Promise.all([
                filtersResponse.json(),
                pdfResponse.json(),
                importResponse.json()
              ]);

              if (!filtersResponse.ok) {
                toast.error(filtersPayload.error ?? "Unable to save filter settings.");
                return;
              }

              if (!pdfResponse.ok) {
                toast.error(pdfPayload.error ?? "Unable to save PDF settings.");
                return;
              }

              if (!importResponse.ok) {
                toast.error(importPayload.error ?? "Unable to save import settings.");
                return;
              }

              toast.success("Settings updated.");
            });
          }}
        >
          {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
          Save settings
        </Button>
      </CardContent>
    </Card>
  );
}
