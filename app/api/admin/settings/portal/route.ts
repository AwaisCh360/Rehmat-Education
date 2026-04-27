import { NextResponse } from "next/server";
import { z } from "zod";

import { requireApiAdmin } from "@/lib/auth/session";
import { defaultPortalSettings, setPortalSettings } from "@/lib/app/portal-settings";

const portalSettingsSchema = z.object({
  appName: z.string().trim().min(2).max(80),
  slogan: z.string().trim().min(5).max(140),
  movingHeaderText: z.string().trim().min(2).max(220),
  tickerDurationSeconds: z.number().int().min(12).max(120),
  heroBannerWidthPx: z.number().int().min(360).max(1600),
  heroBannerHeightPx: z.number().int().min(80).max(480),
  logoDataUrl: z.string().trim().optional().nullable(),
  heroSlides: z.array(z.string().trim()).max(10),
  signupEnabled: z.boolean(),
  defaultProgramLayout: z.enum(["table", "card"]),
  programDisplay: z.object({
    table: z.object({
      university: z.boolean(),
      programName: z.boolean(),
      degree: z.boolean(),
      language: z.boolean(),
      campus: z.boolean(),
      discountedFee: z.boolean(),
      originalFee: z.boolean(),
      cashFee: z.boolean(),
      depositFee: z.boolean(),
      prepSchoolFee: z.boolean(),
      academicYear: z.boolean(),
      semester: z.boolean(),
      status: z.boolean()
    }),
    card: z.object({
      university: z.boolean(),
      programName: z.boolean(),
      degree: z.boolean(),
      language: z.boolean(),
      campus: z.boolean(),
      status: z.boolean(),
      originalFee: z.boolean(),
      discountedFee: z.boolean(),
      cashFee: z.boolean(),
      depositFee: z.boolean(),
      prepSchoolFee: z.boolean(),
      academicYear: z.boolean()
    })
  })
});

const MAX_LOGO_BYTES = 2 * 1024 * 1024;
const MAX_SLIDE_BYTES = 2 * 1024 * 1024;

function estimateDataUrlBytes(dataUrl: string) {
  const parts = dataUrl.split(",", 2);

  if (parts.length !== 2) {
    return null;
  }

  const metadata = parts[0];
  const base64Payload = parts[1] ?? "";

  if (!metadata.startsWith("data:image/") || !metadata.includes(";base64")) {
    return null;
  }

  const sanitized = base64Payload.replace(/\s+/g, "");
  const padding = sanitized.endsWith("==") ? 2 : sanitized.endsWith("=") ? 1 : 0;

  return Math.floor((sanitized.length * 3) / 4) - padding;
}

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

  const normalizedLogo = parsed.data.logoDataUrl && parsed.data.logoDataUrl.trim().length > 0 ? parsed.data.logoDataUrl.trim() : null;

  if (normalizedLogo) {
    const byteSize = estimateDataUrlBytes(normalizedLogo);

    if (byteSize === null) {
      return NextResponse.json({ error: "Logo must be a valid image file." }, { status: 400 });
    }

    if (byteSize > MAX_LOGO_BYTES) {
      return NextResponse.json({ error: "Logo size must be 2MB or less." }, { status: 400 });
    }
  }

  const normalizedSlides = parsed.data.heroSlides
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

  for (const slide of normalizedSlides) {
    const byteSize = estimateDataUrlBytes(slide);

    if (byteSize === null) {
      return NextResponse.json({ error: "Each slide must be a valid image file." }, { status: 400 });
    }

    if (byteSize > MAX_SLIDE_BYTES) {
      return NextResponse.json({ error: "Each slide image must be 2MB or less." }, { status: 400 });
    }
  }

  const settings = await setPortalSettings({
    ...defaultPortalSettings,
    ...parsed.data,
    logoDataUrl: normalizedLogo,
    heroSlides: normalizedSlides
  });

  return NextResponse.json({ ok: true, settings });
}