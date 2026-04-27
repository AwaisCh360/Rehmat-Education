import type React from "react";
import { GraduationCap, Languages, School2 } from "lucide-react";

import { Pagination } from "@/components/programs/pagination";
import { ProgramGrid } from "@/components/programs/program-grid";
import { ProgramsToolbar } from "@/components/programs/programs-toolbar";
import { Card, CardContent } from "@/components/ui/card";
import { getPortalSettings } from "@/lib/app/portal-settings";
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
  const [catalog, options, filterVisibility, portalSettings] = await Promise.all([
    getPrograms({
      ...filters,
      page: cleanParams.page,
      pageSize: cleanParams.pageSize
    }),
    getProgramFilters(),
    getFilterVisibilitySettings(),
    getPortalSettings()
  ]);

  return (
    <div className="space-y-6">
      <section>
        <Card className="rounded-2xl border-border/70 bg-[linear-gradient(135deg,rgba(14,165,233,0.08),rgba(16,185,129,0.08))]">
          <CardContent className="space-y-6 p-6">
            <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="space-y-3">
                <div className="inline-flex w-fit rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">Agent workspace</div>
                <h1 className="text-3xl font-semibold tracking-tight">{portalSettings.appName}</h1>
                <p className="max-w-3xl text-base text-muted-foreground">{portalSettings.slogan}</p>
              </div>

              <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-border/70 bg-background/80 lg:h-28 lg:w-28">
                {portalSettings.logoDataUrl ? (
                  <img alt="Portal logo" className="h-16 w-16 object-contain lg:h-20 lg:w-20" src={portalSettings.logoDataUrl} />
                ) : (
                  <div className="text-center text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Logo</div>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard icon={School2} label="Programs in catalog" value={formatCount(catalog.totalCatalog)} />
              <StatCard icon={GraduationCap} label="Degrees available" value={formatCount(options.degrees.length)} />
              <StatCard icon={Languages} label="Languages covered" value={formatCount(options.languages.length)} />
            </div>
          </CardContent>
        </Card>
      </section>

      <ProgramsToolbar basePath="/programs" currentPage={catalog.page} filterVisibility={filterVisibility} initialFilters={filters} mode="browse" options={options} resultCount={catalog.total} />
      <ProgramGrid defaultViewMode={portalSettings.defaultProgramLayout} displaySettings={portalSettings.programDisplay} programs={catalog.items} />
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
