import { NextResponse } from "next/server";
import { z } from "zod";

import { setAgentRevoked } from "@/lib/auth/agent-access";
import { APP_ROLES } from "@/lib/auth/roles";
import { requireApiAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";

const accessSchema = z.object({
  action: z.enum(["revoke", "restore"])
});

export async function POST(request: Request, context: { params: { id: string } }) {
  const admin = await requireApiAdmin();

  if (admin instanceof Response) {
    return admin;
  }

  const parsed = accessSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid access action." }, { status: 400 });
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

  const isRevoked = parsed.data.action === "revoke";
  await setAgentRevoked(agent.id, isRevoked);

  return NextResponse.json({
    ok: true,
    status: isRevoked ? "REVOKED" : "ACTIVE"
  });
}
