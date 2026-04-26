"use client";

import type React from "react";
import { usePathname } from "next/navigation";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export function AppShell({
  branding,
  user,
  children
}: {
  branding: {
    appName: string;
    slogan: string;
    logoDataUrl: string | null;
  };
  user: {
    name: string;
    email: string;
    role: "ADMIN" | "AGENT";
  };
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <div className="hidden lg:block">
          <Sidebar branding={branding} pathname={pathname} role={user.role} />
        </div>
        <div className="flex min-h-screen flex-col">
          <Topbar branding={branding} pathname={pathname} user={user} />
          <main className="flex-1 px-4 py-6 lg:px-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
