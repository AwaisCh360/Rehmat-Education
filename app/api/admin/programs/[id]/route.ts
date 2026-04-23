import { NextResponse } from "next/server";

import { requireApiAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { programFormSchema, toProgramMutationInput } from "@/lib/programs/schemas";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const user = await requireApiAdmin();

  if (user instanceof Response) {
    return user;
  }

  const existing = await db.program.findUnique({
    where: {
      id: params.id
    }
  });

  if (!existing) {
    return NextResponse.json({ error: "Program not found." }, { status: 404 });
  }

  const payload = await request.json();
  const parsed = programFormSchema.safeParse({
    ...payload,
    id: params.id
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().formErrors.join(", ") || "Invalid program payload." }, { status: 400 });
  }

  const program = await db.program.update({
    where: {
      id: params.id
    },
    data: toProgramMutationInput(parsed.data)
  });

  return NextResponse.json(program);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const user = await requireApiAdmin();

  if (user instanceof Response) {
    return user;
  }

  await db.program.delete({
    where: {
      id: params.id
    }
  });

  return NextResponse.json({ ok: true });
}
