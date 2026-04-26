"use client";

import { useState, useTransition } from "react";
import { ChevronDown, ChevronUp, Link2, LoaderCircle, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PortalSettings } from "@/lib/app/portal-settings";
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
  discountedFeeRange: "Fee Range",
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
  initialImportSettings,
  initialPortalSettings
}: {
  initialFilterSettings: FilterVisibilitySettings;
  initialPdfSettings: PdfVisibilitySettings;
  initialImportSettings: ImportSettings;
  initialPortalSettings: PortalSettings;
}) {
  const [filterSettings, setFilterSettings] = useState(initialFilterSettings);
  const [pdfSettings, setPdfSettings] = useState(initialPdfSettings);
  const [importSettings, setImportSettings] = useState(initialImportSettings);
  const [portalSettings, setPortalSettings] = useState(initialPortalSettings);
  const [isPending, startTransition] = useTransition();
  const [isSyncPending, startSyncTransition] = useTransition();
  const [showFilterFields, setShowFilterFields] = useState(false);
  const [showImportControls, setShowImportControls] = useState(false);
  const [showPdfFields, setShowPdfFields] = useState(false);

  return (
    <Card className="rounded-2xl border-border/70">
      <CardHeader>
        <CardTitle>Portal and visibility controls</CardTitle>
        <CardDescription>Manage signup, program layout, and what agents can view in filters and PDFs.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Portal defaults</h3>
          <div className="grid gap-3 rounded-2xl border border-border/70 bg-muted/20 p-4 md:grid-cols-2">
            <label className="flex items-center justify-between rounded-xl border border-border/70 bg-background/70 px-4 py-3 md:col-span-2">
              <span className="text-sm font-medium">Allow public agent signup page</span>
              <input
                checked={portalSettings.signupEnabled}
                className="h-4 w-4 accent-primary"
                onChange={(event) =>
                  setPortalSettings((current) => ({
                    ...current,
                    signupEnabled: event.target.checked
                  }))
                }
                type="checkbox"
              />
            </label>

            <div className="space-y-2">
              <Label htmlFor="default-program-layout">Default programs layout</Label>
              <Select
                onValueChange={(value) =>
                  setPortalSettings((current) => ({
                    ...current,
                    defaultProgramLayout: value as "table" | "card"
                  }))
                }
                value={portalSettings.defaultProgramLayout}
              >
                <SelectTrigger id="default-program-layout">
                  <SelectValue placeholder="Select default layout" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="table">Table layout</SelectItem>
                  <SelectItem value="card">Card layout</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-xl border border-border/70 bg-background/70 px-4 py-3 text-xs text-muted-foreground">
              This default applies when agents open the programs page. They can still switch between views manually.
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <SectionToggle isOpen={showFilterFields} label="Agent visibility filters" onClick={() => setShowFilterFields((current) => !current)} />
          {showFilterFields ? (
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
          ) : null}
        </div>

        <div className="space-y-3">
          <SectionToggle isOpen={showImportControls} label="Programs update" onClick={() => setShowImportControls((current) => !current)} />
          {showImportControls ? (
            <div className="rounded-2xl border border-border/70 bg-[linear-gradient(145deg,rgba(14,165,233,0.08),rgba(16,185,129,0.06))] p-4">
              <div className="space-y-4 rounded-xl border border-border/70 bg-background/70 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-sm font-semibold">Partner Source Sync</div>
                    <p className="text-xs text-muted-foreground">Set the source endpoint and run an immediate catalog refresh.</p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
                    <Link2 className="h-3.5 w-3.5" />
                    Live URL
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Source URL</div>
                  <Input
                    className="h-11 bg-background"
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
                  <p className="text-xs text-muted-foreground">The latest data from this URL will replace current catalog records.</p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-muted-foreground">Run this when you want the newest partner data immediately.</div>

                  <Button
                    className="h-10"
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
                    {isSyncPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
                    Update Programs Now
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-3">
          <SectionToggle isOpen={showPdfFields} label="Agent PDF fields" onClick={() => setShowPdfFields((current) => !current)} />
          {showPdfFields ? (
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
          ) : null}
        </div>

        <Button
          disabled={isPending}
          onClick={() => {
            startTransition(async () => {
              const [filtersResponse, pdfResponse, importResponse, portalResponse] = await Promise.all([
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
                }),
                fetch("/api/admin/settings/portal", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify(portalSettings)
                })
              ]);

              const [filtersPayload, pdfPayload, importPayload, portalPayload] = await Promise.all([
                filtersResponse.json(),
                pdfResponse.json(),
                importResponse.json(),
                portalResponse.json()
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

              if (!portalResponse.ok) {
                toast.error(portalPayload.error ?? "Unable to save portal settings.");
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

function SectionToggle({
  label,
  isOpen,
  onClick
}: {
  label: string;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <Button className="w-full justify-between" onClick={onClick} type="button" variant="outline">
      <span>{label}</span>
      {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
    </Button>
  );
}
