import { NextResponse } from "next/server";
import { z } from "zod";

import { requireApiAdmin } from "@/lib/auth/session";
import { defaultPdfVisibilitySettings, setPdfVisibilitySettings } from "@/lib/programs/pdf-visibility";

const pdfSettingsSchema = z.object({
  showUniversity: z.boolean(),
  showProgram: z.boolean(),
  showDegree: z.boolean(),
  showLanguage: z.boolean(),
  showCampus: z.boolean(),
  showAcademicYear: z.boolean(),
  showSemester: z.boolean(),
  showQuotaStatus: z.boolean(),
  showCurrency: z.boolean(),
  showTuitionFee: z.boolean(),
  showDiscountedFee: z.boolean(),
  showPrepSchoolFee: z.boolean(),
  showCashPaymentFee: z.boolean(),
  showDepositPrice: z.boolean()
});

export async function POST(request: Request) {
  const user = await requireApiAdmin();

  if (user instanceof Response) {
    return user;
  }

  const payload = await request.json();
  const parsed = pdfSettingsSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid PDF settings payload." }, { status: 400 });
  }

  const settings = await setPdfVisibilitySettings({
    ...defaultPdfVisibilitySettings,
    ...parsed.data
  });

  return NextResponse.json({ ok: true, settings });
}
