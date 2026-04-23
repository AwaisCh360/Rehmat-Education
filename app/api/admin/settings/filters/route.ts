import { NextResponse } from "next/server";
import { z } from "zod";

import { requireApiAdmin } from "@/lib/auth/session";
import { defaultFilterVisibilitySettings, setFilterVisibilitySettings } from "@/lib/programs/filter-visibility";

const filterSettingsSchema = z.object({
  search: z.boolean(),
  university: z.boolean(),
  programName: z.boolean(),
  degree: z.boolean(),
  language: z.boolean(),
  campus: z.boolean(),
  quota: z.boolean(),
  discountedFeeRange: z.boolean(),
  sort: z.boolean()
});

export async function POST(request: Request) {
  const user = await requireApiAdmin();

  if (user instanceof Response) {
    return user;
  }

  const payload = await request.json();
  const parsed = filterSettingsSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid settings payload." }, { status: 400 });
  }

  const settings = await setFilterVisibilitySettings({
    ...defaultFilterVisibilitySettings,
    ...parsed.data
  });

  return NextResponse.json({ ok: true, settings });
}
