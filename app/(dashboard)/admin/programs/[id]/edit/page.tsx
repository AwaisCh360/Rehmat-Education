import { notFound } from "next/navigation";

import { ProgramForm } from "@/components/admin/program-form";
import { requireAdmin } from "@/lib/auth/session";
import { getProgramById } from "@/lib/programs/query";

export default async function EditProgramPage({ params }: { params: { id: string } }) {
  await requireAdmin();
  const program = await getProgramById(params.id);

  if (!program) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">Catalog management</div>
        <h1 className="text-3xl font-semibold tracking-tight">Edit program</h1>
      </div>
      <ProgramForm mode="edit" program={program} />
    </div>
  );
}
