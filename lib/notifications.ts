import { db } from "@/lib/db";
import { getRevokedAgentIds } from "@/lib/auth/agent-access";

export type NotificationLevel = "info" | "success" | "warning";

export type DashboardNotification = {
  id: string;
  title: string;
  message: string;
  href: string;
  level: NotificationLevel;
  createdAt: string;
};

export async function getNotificationsForUser(user: { role: "ADMIN" | "AGENT" }): Promise<DashboardNotification[]> {
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  if (user.role === "ADMIN") {
    const [pendingRequests, recentImports, updatedPrograms, revokedAgentIds] = await Promise.all([
      db.agentSignupRequest.count({
        where: {
          status: "PENDING"
        }
      }),
      db.importSession.count({
        where: {
          status: "COMMITTED",
          createdAt: {
            gte: weekAgo
          }
        }
      }),
      db.program.count({
        where: {
          updatedAt: {
            gte: dayAgo
          }
        }
      }),
      getRevokedAgentIds()
    ]);

    const items: DashboardNotification[] = [];

    if (pendingRequests > 0) {
      items.push({
        id: "pending-agent-requests",
        title: "Pending Agent Requests",
        message: `${pendingRequests} signup request${pendingRequests > 1 ? "s" : ""} awaiting review.`,
        href: "/admin/settings",
        level: "warning",
        createdAt: now.toISOString()
      });
    }

    if (recentImports > 0) {
      items.push({
        id: "recent-imports",
        title: "Recent Catalog Imports",
        message: `${recentImports} import session${recentImports > 1 ? "s" : ""} committed in the last 7 days.`,
        href: "/admin/import",
        level: "success",
        createdAt: now.toISOString()
      });
    }

    if (updatedPrograms > 0) {
      items.push({
        id: "updated-programs-admin",
        title: "Programs Updated",
        message: `${updatedPrograms} program record${updatedPrograms > 1 ? "s" : ""} updated in the last 24 hours.`,
        href: "/admin/programs",
        level: "info",
        createdAt: now.toISOString()
      });
    }

    if (revokedAgentIds.length > 0) {
      items.push({
        id: "revoked-agents",
        title: "Restricted Agent Accounts",
        message: `${revokedAgentIds.length} agent account${revokedAgentIds.length > 1 ? "s" : ""} currently revoked.`,
        href: "/admin/settings",
        level: "warning",
        createdAt: now.toISOString()
      });
    }

    return withFallback(items, "/admin/settings");
  }

  const [recentUpdates, quotaFullPrograms, totalPrograms] = await Promise.all([
    db.program.count({
      where: {
        updatedAt: {
          gte: weekAgo
        }
      }
    }),
    db.program.count({
      where: {
        quotaFull: true
      }
    }),
    db.program.count()
  ]);

  const items: DashboardNotification[] = [];

  if (recentUpdates > 0) {
    items.push({
      id: "recent-program-updates-agent",
      title: "Catalog Updates",
      message: `${recentUpdates} program${recentUpdates > 1 ? "s" : ""} updated in the last 7 days.`,
      href: "/programs",
      level: "success",
      createdAt: now.toISOString()
    });
  }

  if (quotaFullPrograms > 0) {
    items.push({
      id: "quota-full-programs",
      title: "Quota Monitoring",
      message: `${quotaFullPrograms} program${quotaFullPrograms > 1 ? "s" : ""} currently marked as Quota Full.`,
      href: "/programs?quota=full",
      level: "warning",
      createdAt: now.toISOString()
    });
  }

  if (totalPrograms > 0) {
    items.push({
      id: "catalog-ready",
      title: "Catalog Ready",
      message: `${totalPrograms} programs available for filtering and student matching.`,
      href: "/programs",
      level: "info",
      createdAt: now.toISOString()
    });
  }

  return withFallback(items, "/programs");
}

function withFallback(items: DashboardNotification[], href: string): DashboardNotification[] {
  if (items.length > 0) {
    return items;
  }

  return [
    {
      id: "no-new-notifications",
      title: "All Caught Up",
      message: "No new notifications right now.",
      href,
      level: "info",
      createdAt: new Date().toISOString()
    }
  ];
}
