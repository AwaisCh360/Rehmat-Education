import Link from "next/link";

import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/session";
import { getImportSettings } from "@/lib/programs/import-settings";

export default async function ImportPage({
  searchParams: _searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  await requireAdmin();
  const importSettings = await getImportSettings();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="inline-flex rounded-full bg-warning/50 px-3 py-1 text-sm font-medium text-warning-foreground">Admin workspace</div>
        <h1 className="text-3xl font-semibold tracking-tight">Program updates moved to Settings.</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">JSON upload flow is disabled. Use Settings to update programs directly from source URL.</p>
      </div>

      <div className="rounded-2xl border border-border/70 bg-card p-6">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Source URL</h2>
          <p className="text-sm text-muted-foreground break-all">{importSettings.sourceUrl}</p>
        </div>

        <div className="mt-4">
          <Button asChild>
            <Link href="/admin/settings">Open settings to update programs</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
