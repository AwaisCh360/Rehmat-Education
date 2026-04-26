import { Menu } from "lucide-react";

import { Sidebar } from "@/components/layout/sidebar";
import { NotificationsMenu } from "@/components/layout/notifications-menu";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function Topbar({
  pathname,
  user
}: {
  pathname: string;
  user: {
    name: string;
    email: string;
    role: "ADMIN" | "AGENT";
  };
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-3 px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button className="lg:hidden" size="icon" variant="outline">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent className="p-0" side="left">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation</SheetTitle>
                <SheetDescription>Browse dashboard sections</SheetDescription>
              </SheetHeader>
              <Sidebar pathname={pathname} role={user.role} />
            </SheetContent>
          </Sheet>
          <div>
            <div className="text-sm font-semibold">University Programs Dashboard</div>
            <div className="text-xs text-muted-foreground">Search, compare, and manage admissions data</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <NotificationsMenu />
          <ThemeToggle />
          <UserMenu email={user.email} name={user.name} role={user.role} />
        </div>
      </div>
    </header>
  );
}
