import { NextResponse } from "next/server";
import { z } from "zod";

import { requireApiAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { buildImportDiff, parseImportPayload } from "@/lib/programs/import";

const previewSchema = z.object({
  fileName: z.string().min(1),
  content: z.string().min(1)
});

export async function POST(request: Request) {
  const user = await requireApiAdmin();

  if (user instanceof Response) {
    return user;
  }

  const payload = await request.json();
  const parsed = previewSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "A valid JSON file is required." }, { status: 400 });
  }

  try {
    const records = parseImportPayload(parsed.data.content);
    const diff = await buildImportDiff(records);
    const session = await db.importSession.create({
      data: {
        fileName: parsed.data.fileName,
        rowCount: records.length,
        diffJson: JSON.stringify(diff),
        payloadJson: parsed.data.content,
        createdById: user.id
      }
    });

    return NextResponse.json({
      sessionId: session.id,
      diff
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to preview import."
      },
      { status: 400 }
    );
  }
}
