import { ProgramTable } from "@/components/admin/program-table";
import { Pagination } from "@/components/programs/pagination";
import { ProgramsToolbar } from "@/components/programs/programs-toolbar";
import { requireAdmin } from "@/lib/auth/session";
import { getFiltersFromSearchParams, toSingleSearchParamRecord } from "@/lib/programs/filters";
import { getProgramFilters, getPrograms } from "@/lib/programs/query";

export default async function AdminProgramsPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  await requireAdmin();

  const filters = getFiltersFromSearchParams(searchParams);
  const cleanParams = toSingleSearchParamRecord(searchParams);
  const [catalog, options] = await Promise.all([
    getPrograms({
      ...filters,
      page: cleanParams.page,
      pageSize: cleanParams.pageSize
    }),
    getProgramFilters()
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex rounded-full bg-warning/50 px-3 py-1 text-sm font-medium text-warning-foreground">Admin workspace</div>
          <h1 className="text-3xl font-semibold tracking-tight">Manage the live program catalog.</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">Filter the dataset, edit records directly, and publish updates from source URL in settings.</p>
        </div>
      </div>

      <ProgramsToolbar basePath="/admin/programs" currentPage={catalog.page} initialFilters={filters} mode="admin" options={options} resultCount={catalog.total} />
      <ProgramTable programs={catalog.items} />
      <Pagination basePath="/admin/programs" currentPage={catalog.page} searchParams={cleanParams} totalPages={catalog.totalPages} />
    </div>
  );
}
