import { NextResponse } from "next/server";

import { requireApiAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { revalidateProgramFiltersCache } from "@/lib/programs/cache";
import { getPrograms } from "@/lib/programs/query";
import { programFormSchema, toProgramMutationInput } from "@/lib/programs/schemas";

export async function GET(request: Request) {
  const user = await requireApiAdmin();

  if (user instanceof Response) {
    return user;
  }

  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());
  const catalog = await getPrograms(params);

  return NextResponse.json(catalog);
}

export async function POST(request: Request) {
  const user = await requireApiAdmin();

  if (user instanceof Response) {
    return user;
  }

  const payload = await request.json();
  const parsed = programFormSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().formErrors.join(", ") || "Invalid program payload." }, { status: 400 });
  }

  const input = toProgramMutationInput(parsed.data);

  const exists = await db.program.findUnique({
    where: {
      id: input.id
    }
  });

  if (exists) {
    return NextResponse.json({ error: "A program with this Id already exists." }, { status: 409 });
  }

  const program = await db.program.create({
    data: input
  });

  revalidateProgramFiltersCache();

  return NextResponse.json(program, { status: 201 });
}
