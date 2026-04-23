import { ProgramForm } from "@/components/admin/program-form";
import { requireAdmin } from "@/lib/auth/session";

export default async function NewProgramPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">Catalog management</div>
        <h1 className="text-3xl font-semibold tracking-tight">Add a new program</h1>
      </div>
      <ProgramForm mode="create" />
    </div>
  );
}
