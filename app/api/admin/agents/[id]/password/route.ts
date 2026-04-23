import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { APP_ROLES } from "@/lib/auth/roles";
import { requireApiAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";

const passwordSchema = z.object({
  password: z.string().min(8).max(128)
});

export async function POST(request: Request, context: { params: { id: string } }) {
  const admin = await requireApiAdmin();

  if (admin instanceof Response) {
    return admin;
  }

  const parsed = passwordSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Password must be between 8 and 128 characters." }, { status: 400 });
  }

  const agent = await db.user.findUnique({
    where: {
      id: context.params.id
    },
    select: {
      id: true,
      role: true
    }
  });

  if (!agent || agent.role !== APP_ROLES.AGENT) {
    return NextResponse.json({ error: "Agent not found." }, { status: 404 });
  }

  const passwordHash = await hash(parsed.data.password, 10);

  await db.user.update({
    where: {
      id: agent.id
    },
    data: {
      passwordHash
    }
  });

  return NextResponse.json({ ok: true });
}
