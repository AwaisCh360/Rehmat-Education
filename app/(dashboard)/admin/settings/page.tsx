import { AgentApprovalRequests } from "@/components/admin/agent-approval-requests";
import { AgentAccessManager } from "@/components/admin/agent-access-manager";
import { FilterVisibilitySettingsForm } from "@/components/admin/filter-visibility-settings-form";
import { getRevokedAgentIds } from "@/lib/auth/agent-access";
import { APP_ROLES } from "@/lib/auth/roles";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getFilterVisibilitySettings } from "@/lib/programs/filter-visibility";
import { getImportSettings } from "@/lib/programs/import-settings";
import { getPdfVisibilitySettings } from "@/lib/programs/pdf-visibility";

export default async function AdminSettingsPage() {
  await requireAdmin();
  try {
    const [initialFilterSettings, initialPdfSettings, initialImportSettings, pendingRequests, agents, revokedAgentIds] = await Promise.all([
      getFilterVisibilitySettings({ fresh: true }),
      getPdfVisibilitySettings(),
      getImportSettings(),
      db.agentSignupRequest.findMany({
        where: {
          status: "PENDING"
        },
        orderBy: {
          createdAt: "asc"
        },
        select: {
          id: true,
          name: true,
          email: true,
          agencyName: true,
          designation: true,
          yearsOfExperience: true,
          website: true,
          postalCode: true,
          address: true,
          cnic: true,
          country: true,
          province: true,
          city: true,
          phoneNumber: true,
          status: true,
          createdAt: true
        }
      }),
      db.user.findMany({
        where: {
          role: APP_ROLES.AGENT
        },
        orderBy: {
          createdAt: "desc"
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true
        }
      })
      ,
      getRevokedAgentIds()
    ]);

    const revokedSet = new Set(revokedAgentIds);

    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage filter visibility, PDF fields, and source URL based program updates.</p>
        </div>

        <FilterVisibilitySettingsForm
          initialFilterSettings={initialFilterSettings}
          initialPdfSettings={initialPdfSettings}
          initialImportSettings={initialImportSettings}
        />

        <AgentApprovalRequests
          initialRequests={pendingRequests.map((request) => ({
            ...request,
            createdAt: request.createdAt.toISOString()
          }))}
        />

        <AgentAccessManager
          initialAgents={agents.map((agent) => ({
            id: agent.id,
            name: agent.name,
            email: agent.email,
            createdAt: agent.createdAt.toISOString(),
            accessStatus: revokedSet.has(agent.id) ? "REVOKED" : "ACTIVE"
          }))}
        />
      </div>
    );
  } catch {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          Database connection failed. Update DATABASE_URL to the Supabase Session Pooler connection string (IPv4 compatible), then restart the app.
        </div>
      </div>
    );
  }
}
