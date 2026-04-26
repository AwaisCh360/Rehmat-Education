import Link from "next/link";
import { Bell, type LucideIcon, LayoutDashboard, Settings2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const agentItems: NavItem[] = [
  {
    href: "/programs",
    label: "Programs",
    icon: LayoutDashboard
  },
  {
    href: "/notifications",
    label: "Notifications",
    icon: Bell
  }
];

const adminItems: NavItem[] = [
  ...agentItems,
  {
    href: "/admin/settings",
    label: "Settings",
    icon: Settings2
  }
];

export function Sidebar({
  pathname,
  role
}: {
  pathname: string;
  role: "ADMIN" | "AGENT";
}) {
  const items = role === "ADMIN" ? adminItems : agentItems;

  return (
    <aside className="flex h-full w-full flex-col gap-6 border-r border-border/80 bg-card px-4 py-5">
      <div className="space-y-2 px-2">
        <Link className="inline-flex items-center gap-3" href={role === "ADMIN" ? "/admin/settings" : "/programs"}>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/12 text-primary">
            <Settings2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold">Rehmat Education</div>
            <div className="text-xs text-muted-foreground">Programs dashboard</div>
          </div>
        </Link>
        <Badge className="w-fit" variant={role === "ADMIN" ? "warning" : "success"}>
          {role === "ADMIN" ? "Admin workspace" : "Agent workspace"}
        </Badge>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                isActive && "bg-primary text-primary-foreground hover:bg-primary/95 hover:text-primary-foreground"
              )}
              href={item.href}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
