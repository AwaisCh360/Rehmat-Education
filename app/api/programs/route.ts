import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/auth/session";
import { getProgramFilters, getPrograms } from "@/lib/programs/query";

export async function GET(request: Request) {
  const user = await requireApiUser();

  if (user instanceof Response) {
    return user;
  }

  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());
  const [catalog, filters] = await Promise.all([getPrograms(params), getProgramFilters()]);

  return NextResponse.json({
    ...catalog,
    filters
  });
}
