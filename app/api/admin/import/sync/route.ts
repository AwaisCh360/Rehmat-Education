import { NextResponse } from "next/server";
import { z } from "zod";

import { requireApiAdmin } from "@/lib/auth/session";
import { buildImportDiff, commitImport, parseImportPayload } from "@/lib/programs/import";
import { revalidateProgramFiltersCache } from "@/lib/programs/cache";
import { getImportSettings } from "@/lib/programs/import-settings";
import { fetchPartnerProgramsPayload } from "@/lib/programs/partner-source";

const syncPayloadSchema = z
  .object({
    sourceUrl: z.string().url().optional()
  })
  .optional();

export async function POST(request: Request) {
  const user = await requireApiAdmin();

  if (user instanceof Response) {
    return user;
  }

  try {
    const requestPayload = await request.json().catch(() => undefined);
    const parsedPayload = syncPayloadSchema.safeParse(requestPayload);

    if (!parsedPayload.success) {
      return NextResponse.json({ error: "Invalid sync payload." }, { status: 400 });
    }

    const importSettings = await getImportSettings();
    const sourceUrl = parsedPayload.data?.sourceUrl ?? importSettings.sourceUrl;
    const content = await fetchPartnerProgramsPayload(sourceUrl);
    const records = parseImportPayload(content);
    const diff = await buildImportDiff(records);

    await commitImport(records, "replace");
    revalidateProgramFiltersCache();

    return NextResponse.json({
      ok: true,
      mode: "replace",
      rowCount: records.length,
      diff
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to sync programs from source URL."
      },
      { status: 400 }
    );
  }
}
