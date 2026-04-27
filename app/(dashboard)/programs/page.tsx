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
        <Card className="rounded-2xl border-border/70 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.18),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.18),transparent_42%),linear-gradient(120deg,rgba(15,23,42,0.82),rgba(3,7,18,0.95))]">
          <CardContent className="space-y-6 p-6">
            <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
              <div className="space-y-4">
                <h1 className="text-3xl font-semibold tracking-tight text-slate-100">{portalSettings.appName}</h1>
                <p className="max-w-3xl text-base text-slate-300">{portalSettings.slogan}</p>

                <div className="grid gap-4 sm:grid-cols-3">
                  <StatCard icon={School2} label="Programs in catalog" value={formatCount(catalog.totalCatalog)} />
                  <StatCard icon={GraduationCap} label="Degrees available" value={formatCount(options.degrees.length)} />
                  <StatCard icon={Languages} label="Languages covered" value={formatCount(options.languages.length)} />
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
                <div className="relative aspect-[3/2] min-h-[280px] overflow-hidden rounded-xl border border-white/10 bg-[linear-gradient(120deg,rgba(15,23,42,0.98),rgba(8,47,73,0.9))] lg:min-h-[360px]">
                  {portalSettings.logoDataUrl ? (
                    <img alt="Hero media" className="h-full w-full object-cover" src={portalSettings.logoDataUrl} />
                  ) : (
                    <div className="flex h-full items-center justify-center text-center text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                      1080 x 720 image placeholder
                    </div>
                  )}
                </div>
              </div>
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
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold text-slate-100">{value}</div>
    </div>
  );
}
