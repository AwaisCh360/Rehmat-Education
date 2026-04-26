import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/auth/session";
import { getNotificationsForUser } from "@/lib/notifications";

export async function GET() {
  const user = await requireApiUser();

  if (user instanceof Response) {
    return user;
  }

  const items = await getNotificationsForUser({ role: user.role });

  return NextResponse.json({
    items,
    unreadCount: Math.min(items.length, 9)
  });
}
