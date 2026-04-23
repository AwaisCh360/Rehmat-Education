import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/auth/session";
import { getProgramById } from "@/lib/programs/query";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const user = await requireApiUser();

  if (user instanceof Response) {
    return user;
  }

  const program = await getProgramById(params.id);

  if (!program) {
    return NextResponse.json({ error: "Program not found." }, { status: 404 });
  }

  return NextResponse.json(program);
}
