"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type NotificationLevel = "info" | "success" | "warning";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  href: string;
  level: NotificationLevel;
  createdAt: string;
};

export function NotificationsMenu() {
  const router = useRouter();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const response = await fetch("/api/notifications", { cache: "no-store" });
        const payload = await response.json();

        if (!active) {
          return;
        }

        if (!response.ok) {
          setItems([]);
          setUnreadCount(0);
          return;
        }

        setItems(payload.items ?? []);
        setUnreadCount(payload.unreadCount ?? 0);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void load();
    const interval = window.setInterval(load, 60_000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  const hasItems = useMemo(() => items.length > 0, [items]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button aria-label="Open notifications" className="relative" size="icon" variant="outline">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 ? (
            <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
              {unreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[360px] max-w-[92vw]">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          <span className="text-xs font-normal text-muted-foreground">{unreadCount} new</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {isLoading ? <div className="px-2 py-4 text-sm text-muted-foreground">Loading notifications...</div> : null}

        {!isLoading && !hasItems ? <div className="px-2 py-4 text-sm text-muted-foreground">No notifications right now.</div> : null}

        {!isLoading && hasItems
          ? items.slice(0, 6).map((item) => (
              <DropdownMenuItem
                key={item.id}
                className="cursor-pointer items-start gap-2 py-3"
                onSelect={() => {
                  router.push(item.href);
                }}
              >
                <span className={dotClassName(item.level)} />
                <div className="space-y-1">
                  <div className="text-sm font-medium leading-tight">{item.title}</div>
                  <div className="line-clamp-2 text-xs text-muted-foreground">{item.message}</div>
                </div>
              </DropdownMenuItem>
            ))
          : null}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer justify-center font-medium"
          onSelect={() => {
            router.push("/notifications");
          }}
        >
          Open Notification Center
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function dotClassName(level: NotificationLevel) {
  if (level === "success") {
    return "mt-1.5 h-2.5 w-2.5 rounded-full bg-emerald-500";
  }

  if (level === "warning") {
    return "mt-1.5 h-2.5 w-2.5 rounded-full bg-amber-500";
  }

  return "mt-1.5 h-2.5 w-2.5 rounded-full bg-sky-500";
}
