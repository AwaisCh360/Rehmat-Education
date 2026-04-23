import { NextResponse } from "next/server";
import { jsPDF } from "jspdf";

import { requireApiUser } from "@/lib/auth/session";
import { defaultPdfVisibilitySettings, getPdfVisibilitySettings } from "@/lib/programs/pdf-visibility";
import { renderProgramPdfPage } from "../../../../../lib/programs/pdf";
import { getProgramById } from "@/lib/programs/query";

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const user = await requireApiUser();

  if (user instanceof Response) {
    return user;
  }

  const program = await getProgramById(params.id);
  const pdfVisibility = user.role === "ADMIN" ? defaultPdfVisibilitySettings : await getPdfVisibilitySettings();

  if (!program) {
    return NextResponse.json({ error: "Program not found." }, { status: 404 });
  }

  const doc = new jsPDF({
    format: "a4",
    unit: "pt"
  });

  renderProgramPdfPage(doc, program, {
    pageIndex: 0,
    totalPages: 1,
    visibility: pdfVisibility
  });

  const buffer = Buffer.from(doc.output("arraybuffer"));

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${program.programName.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.pdf"`
    }
  });
}
