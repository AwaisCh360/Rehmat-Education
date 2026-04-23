import { NextResponse } from "next/server";
import { jsPDF } from "jspdf";

import { requireApiUser } from "@/lib/auth/session";
import { defaultPdfVisibilitySettings, getPdfVisibilitySettings } from "@/lib/programs/pdf-visibility";
import { renderProgramPdfPage } from "@/lib/programs/pdf";
import { getProgramsByIds } from "@/lib/programs/query";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const user = await requireApiUser();

  if (user instanceof Response) {
    return user;
  }

  const { searchParams } = new URL(request.url);
  const rawIds = searchParams.get("ids") ?? "";
  const ids = [...new Set(rawIds.split(",").map((value) => value.trim()).filter(Boolean))].slice(0, 50);

  if (!ids.length) {
    return NextResponse.json({ error: "At least one program ID is required." }, { status: 400 });
  }

  const programs = await getProgramsByIds(ids);
  const pdfVisibility = user.role === "ADMIN" ? defaultPdfVisibilitySettings : await getPdfVisibilitySettings();

  if (!programs.length) {
    return NextResponse.json({ error: "No matching programs found." }, { status: 404 });
  }

  const doc = new jsPDF({
    format: "a4",
    unit: "pt"
  });

  programs.forEach((program, index) => {
    if (index > 0) {
      doc.addPage();
    }

    renderProgramPdfPage(doc, program, {
      pageIndex: index,
      totalPages: programs.length,
      visibility: pdfVisibility
    });
  });

  const buffer = Buffer.from(doc.output("arraybuffer"));

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="programs-${programs.length}.pdf"`
    }
  });
}
