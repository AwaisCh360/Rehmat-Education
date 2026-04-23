import { NextResponse } from "next/server";

import { requireApiAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";

export async function POST(_request: Request, context: { params: { id: string } }) {
  const admin = await requireApiAdmin();

  if (admin instanceof Response) {
    return admin;
  }

  const id = context.params.id;

  const requestRecord = await db.agentSignupRequest.findUnique({
    where: {
      id
    }
  });

  if (!requestRecord) {
    return NextResponse.json({ error: "Request not found." }, { status: 404 });
  }

  if (requestRecord.status !== "PENDING") {
    return NextResponse.json({ error: "This request has already been reviewed." }, { status: 400 });
  }

  await db.agentSignupRequest.update({
    where: {
      id
    },
    data: {
      status: "REJECTED",
      reviewedAt: new Date(),
      reviewedById: admin.id
    }
  });

  return NextResponse.json({ ok: true });
}