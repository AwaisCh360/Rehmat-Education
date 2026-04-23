import { NextResponse } from "next/server";

import { requireApiAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { commitImport, parseImportPayload } from "@/lib/programs/import";
import { importCommitSchema } from "@/lib/programs/schemas";

export async function POST(request: Request) {
  const user = await requireApiAdmin();

  if (user instanceof Response) {
    return user;
  }

  const payload = await request.json();
  const parsed = importCommitSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid commit payload." }, { status: 400 });
  }

  const session = await db.importSession.findUnique({
    where: {
      id: parsed.data.sessionId
    }
  });

  if (!session) {
    return NextResponse.json({ error: "Import session not found." }, { status: 404 });
  }

  try {
    const records = parseImportPayload(session.payloadJson);
    await commitImport(records, parsed.data.mode);
    await db.importSession.update({
      where: {
        id: session.id
      },
      data: {
        importMode: parsed.data.mode,
        status: "COMMITTED"
      }
    });

    return NextResponse.json({
      ok: true,
      mode: parsed.data.mode,
      rowCount: records.length
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to commit import."
      },
      { status: 400 }
    );
  }
}
