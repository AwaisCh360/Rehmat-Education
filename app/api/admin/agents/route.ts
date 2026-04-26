import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { APP_ROLES } from "@/lib/auth/roles";
import { requireApiAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";

const createAgentSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  password: z.string().min(8).max(128)
});

export async function POST(request: Request) {
  const admin = await requireApiAdmin();

  if (admin instanceof Response) {
    return admin;
  }

  const payload = await request.json();
  const parsed = createAgentSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Name, email, and password are required (minimum 8 chars)." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();

  const existingUser = await db.user.findUnique({
    where: {
      email
    },
    select: {
      id: true
    }
  });

  if (existingUser) {
    return NextResponse.json({ error: "A user with this email already exists." }, { status: 409 });
  }

  const passwordHash = await hash(parsed.data.password, 10);

  const user = await db.user.create({
    data: {
      name: parsed.data.name,
      email,
      passwordHash,
      role: APP_ROLES.AGENT
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true
    }
  });

  return NextResponse.json({ ok: true, user }, { status: 201 });
}