import type React from "react";
import { ArrowUpRight, GraduationCap, Languages, School2 } from "lucide-react";

import { Pagination } from "@/components/programs/pagination";
import { ProgramGrid } from "@/components/programs/program-grid";
import { ProgramsToolbar } from "@/components/programs/programs-toolbar";
import { Card, CardContent } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";
import { getFilterVisibilitySettings } from "@/lib/programs/filter-visibility";
import { getFiltersFromSearchParams, toSingleSearchParamRecord } from "@/lib/programs/filters";
import { getProgramFilters, getPrograms } from "@/lib/programs/query";
import { formatCount } from "@/lib/utils";

export default async function ProgramsPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  await requireUser();

  const filters = getFiltersFromSearchParams(searchParams);
  const cleanParams = toSingleSearchParamRecord(searchParams);
  const [catalog, options, filterVisibility] = await Promise.all([
    getPrograms({
      ...filters,
      page: cleanParams.page,
      pageSize: cleanParams.pageSize
    }),
    getProgramFilters(),
    getFilterVisibilitySettings()
  ]);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <Card className="rounded-2xl border-border/70">
          <CardContent className="flex h-full flex-col justify-between gap-6 p-6">
            <div className="space-y-3">
              <div className="inline-flex w-fit rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">Agent workspace</div>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight">Browse the live university catalog.</h1>
                <p className="max-w-2xl text-sm text-muted-foreground">
                  Search across English and Arabic names, combine filters instantly, and open a clean detail view before exporting a PDF for the student file.
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard icon={School2} label="Programs returned" value={formatCount(catalog.total)} />
              <StatCard icon={GraduationCap} label="Degrees available" value={formatCount(options.degrees.length)} />
              <StatCard icon={Languages} label="Languages covered" value={formatCount(options.languages.length)} />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 bg-[linear-gradient(135deg,rgba(14,165,233,0.12),rgba(16,185,129,0.1))]">
          <CardContent className="flex h-full flex-col justify-between gap-4 p-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-sm font-medium">
                <ArrowUpRight className="h-4 w-4 text-primary" />
                Fast admissions triage
              </div>
              <h2 className="text-2xl font-semibold tracking-tight">Move from search to decision without leaving the dashboard.</h2>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>Use price sorting for quick shortlist passes, then export a PDF summary when a student is ready to review options.</p>
              <p>Filters stay on this device, so frequent agent workflows are one refresh away.</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <ProgramsToolbar basePath="/programs" currentPage={catalog.page} filterVisibility={filterVisibility} initialFilters={filters} mode="browse" options={options} resultCount={catalog.total} />
      <ProgramGrid programs={catalog.items} />
      <Pagination basePath="/programs" currentPage={catalog.page} searchParams={cleanParams} totalPages={catalog.totalPages} />
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}
