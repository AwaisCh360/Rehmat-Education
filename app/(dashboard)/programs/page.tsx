import { Pagination } from "@/components/programs/pagination";
import { HeroSlider } from "@/components/programs/hero-slider";
import { ProgramGrid } from "@/components/programs/program-grid";
import { ProgramsToolbar } from "@/components/programs/programs-toolbar";
import { Card, CardContent } from "@/components/ui/card";
import { getPortalSettings } from "@/lib/app/portal-settings";
import { requireUser } from "@/lib/auth/session";
import { getFilterVisibilitySettings } from "@/lib/programs/filter-visibility";
import { getFiltersFromSearchParams, toSingleSearchParamRecord } from "@/lib/programs/filters";
import { getProgramFilters, getPrograms } from "@/lib/programs/query";

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

  const heroSlides = portalSettings.heroSlides.length
    ? portalSettings.heroSlides
    : portalSettings.logoDataUrl
      ? [portalSettings.logoDataUrl]
      : [];

  return (
    <div className="space-y-6">
      <section>
        <Card className="rounded-2xl border-border/70 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.18),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.18),transparent_42%),linear-gradient(120deg,rgba(15,23,42,0.82),rgba(3,7,18,0.95))]">
          <CardContent className="p-6">
            <HeroSlider heightPx={portalSettings.heroBannerHeightPx} slides={heroSlides} widthPx={portalSettings.heroBannerWidthPx} />
          </CardContent>
        </Card>
      </section>

      <ProgramsToolbar basePath="/programs" currentPage={catalog.page} filterVisibility={filterVisibility} initialFilters={filters} mode="browse" options={options} resultCount={catalog.total} />
      <ProgramGrid defaultViewMode={portalSettings.defaultProgramLayout} displaySettings={portalSettings.programDisplay} programs={catalog.items} />
      <Pagination basePath="/programs" currentPage={catalog.page} searchParams={cleanParams} totalPages={catalog.totalPages} />
    </div>
  );
}
