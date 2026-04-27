import type React from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AppShell } from "@/components/layout/app-shell";
import { getPortalSettings } from "@/lib/app/portal-settings";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const portalSettings = await getPortalSettings();

  return (
    <AppShell
      branding={{
        appName: portalSettings.appName,
        slogan: portalSettings.slogan,
        movingHeaderText: portalSettings.movingHeaderText,
        tickerSpeed: portalSettings.tickerSpeed,
        logoDataUrl: portalSettings.logoDataUrl
      }}
      user={{
        name: session.user.name ?? "User",
        email: session.user.email ?? "",
        role: session.user.role
      }}
    >
      {children}
    </AppShell>
  );
}
