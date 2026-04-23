import { NextResponse } from "next/server";
import { z } from "zod";

import { requireApiAdmin } from "@/lib/auth/session";
import { setImportSettings } from "@/lib/programs/import-settings";

const importSettingsSchema = z.object({
  defaultMode: z.enum(["merge", "replace"]),
  sourceUrl: z.string().url()
});

export async function POST(request: Request) {
  const user = await requireApiAdmin();

  if (user instanceof Response) {
    return user;
  }

  const payload = await request.json();
  const parsed = importSettingsSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid import settings payload." }, { status: 400 });
  }

  const settings = await setImportSettings(parsed.data);

  return NextResponse.json({ ok: true, settings });
}
