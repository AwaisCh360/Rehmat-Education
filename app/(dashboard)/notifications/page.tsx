import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";
import { getNotificationsForUser, type NotificationLevel } from "@/lib/notifications";

export default async function NotificationsPage() {
  const user = await requireUser();
  const items = await getNotificationsForUser({ role: user.role });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Notification Center</h1>
        <p className="text-sm text-muted-foreground">Role-based updates for {user.role === "ADMIN" ? "admin" : "agent"} workflow and catalog activity.</p>
      </div>

      <div className="grid gap-4">
        {items.map((item) => (
          <Card key={item.id} className="rounded-2xl border-border/70">
            <CardHeader className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <Badge variant={badgeVariant(item.level)}>{labelForLevel(item.level)}</Badge>
              </div>
              <CardDescription>{new Date(item.createdAt).toLocaleString()}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{item.message}</p>
              <Link className="inline-flex text-sm font-medium text-primary hover:underline" href={item.href}>
                Open related section
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function badgeVariant(level: NotificationLevel): "default" | "success" | "warning" {
  if (level === "success") {
    return "success";
  }

  if (level === "warning") {
    return "warning";
  }

  return "default";
}

function labelForLevel(level: NotificationLevel) {
  if (level === "success") {
    return "Success";
  }

  if (level === "warning") {
    return "Attention";
  }

  return "Info";
}
