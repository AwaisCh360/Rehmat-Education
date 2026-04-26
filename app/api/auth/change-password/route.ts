import { compare, hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { requireApiUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

const passwordChangeSchema = z
  .object({
    oldPassword: z.string().min(1),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(8)
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "New password and confirm password must match.",
    path: ["confirmPassword"]
  })
  .refine((value) => /[A-Z]/.test(value.newPassword), {
    message: "New password must include at least one uppercase letter.",
    path: ["newPassword"]
  });

export async function POST(request: Request) {
  const user = await requireApiUser();

  if (user instanceof Response) {
    return user;
  }

  const payload = await request.json();
  const parsed = passwordChangeSchema.safeParse(payload);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]?.message;
    return NextResponse.json({ error: firstIssue ?? "Invalid password payload." }, { status: 400 });
  }

  const account = await db.user.findUnique({
    where: {
      id: user.id
    },
    select: {
      id: true,
      passwordHash: true
    }
  });

  if (!account) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const oldPasswordMatches = await compare(parsed.data.oldPassword, account.passwordHash);

  if (!oldPasswordMatches) {
    return NextResponse.json({ error: "Old password is incorrect." }, { status: 400 });
  }

  const nextHash = await hash(parsed.data.newPassword, 10);

  await db.user.update({
    where: {
      id: account.id
    },
    data: {
      passwordHash: nextHash,
      mustChangePassword: false
    }
  });

  return NextResponse.json({ ok: true });
}
