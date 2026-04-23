import { NextResponse } from "next/server";

import { requireApiAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";

export async function GET() {
  const user = await requireApiAdmin();

  if (user instanceof Response) {
    return user;
  }

  const requests = await db.agentSignupRequest.findMany({
    where: {
      status: "PENDING"
    },
    orderBy: {
      createdAt: "asc"
    },
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      createdAt: true
    }
  });

  return NextResponse.json({ requests });
}