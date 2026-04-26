import { NextResponse } from "next/server";
import { z } from "zod";

import { requireApiAdmin } from "@/lib/auth/session";
import { defaultPortalSettings, setPortalSettings } from "@/lib/app/portal-settings";

const portalSettingsSchema = z.object({
  signupEnabled: z.boolean(),
  defaultProgramLayout: z.enum(["table", "card"])
});

export async function POST(request: Request) {
  const user = await requireApiAdmin();

  if (user instanceof Response) {
    return user;
  }

  const payload = await request.json();
  const parsed = portalSettingsSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid portal settings payload." }, { status: 400 });
  }

  const settings = await setPortalSettings({
    ...defaultPortalSettings,
    ...parsed.data
  });

  return NextResponse.json({ ok: true, settings });
}