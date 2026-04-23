import type React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, GraduationCap, Languages, MapPin, Wallet } from "lucide-react";

import { ProgramStatusBadge } from "@/components/programs/program-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";
import { getProgramById } from "@/lib/programs/query";
import { formatCurrency, formatNullable } from "@/lib/utils";

export default async function ProgramDetailPage({ params }: { params: { id: string } }) {
  await requireUser();
  const program = await getProgramById(params.id);

  if (!program) {
    notFound();
  }

  const detailRows = [
    ["University", program.universityName],
    ["Program", program.programName],
    ["Degree", formatNullable(program.programDegree)],
    ["Alternative name", formatNullable(program.alternativeProgramName)],
    ["Language", formatNullable(program.language)],
    ["Campus", formatNullable(program.campus)],
    ["Semester", formatNullable(program.semester)],
    ["Academic year", formatNullable(program.academicYear)],
    ["University ID", formatNullable(program.universityId)],
    ["Program Ref", formatNullable(program.programRef)],
    ["Currency", formatNullable(program.currencyType)],
    ["Cash payment fee", formatCurrency(program.cashPaymentFee, program.currencyType ?? "USD")],
    ["Prep school fee", formatCurrency(program.prepSchoolFee, program.currencyType ?? "USD")],
    ["Deposit price", formatCurrency(program.depositPrice, program.currencyType ?? "USD")]
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <Button asChild size="sm" variant="ghost">
            <Link href="/programs">
              <ArrowLeft className="h-4 w-4" />
              Back to programs
            </Link>
          </Button>
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">{program.universityName}</div>
            <h1 className="text-3xl font-semibold tracking-tight">{program.programName}</h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ProgramStatusBadge quotaFull={program.quotaFull} />
          <Button asChild>
            <Link href={`/api/programs/${program.id}/pdf`} target="_blank">
              <Download className="h-4 w-4" />
              Download PDF
            </Link>
          </Button>
        </div>
      </div>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-2xl border-border/70">
          <CardHeader>
            <CardTitle>Program overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <Highlight icon={GraduationCap} label="Degree" value={formatNullable(program.programDegree)} />
              <Highlight icon={Languages} label="Language" value={formatNullable(program.language)} />
              <Highlight icon={MapPin} label="Campus" value={formatNullable(program.campus)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FeeCard label="Tuition fee" value={formatCurrency(program.tuitionFee, program.currencyType ?? "USD")} />
              <FeeCard label="Discounted tuition fee" value={formatCurrency(program.discountedTuitionFee, program.currencyType ?? "USD")} emphasized />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70">
          <CardHeader>
            <CardTitle>All fields</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {detailRows.map(([label, value]) => (
              <div key={label} className="rounded-xl bg-muted/50 p-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
                <div className="mt-2 text-sm font-medium">{value}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function Highlight({
  icon: Icon,
  label,
  value
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-muted/40 p-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <div className="mt-2 text-lg font-semibold">{value}</div>
    </div>
  );
}

function FeeCard({ label, value, emphasized = false }: { label: string; value: string; emphasized?: boolean }) {
  return (
    <div className={`rounded-2xl p-5 ${emphasized ? "bg-secondary/60 text-secondary-foreground" : "bg-muted/50"}`}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Wallet className="h-4 w-4" />
        {label}
      </div>
      <div className="mt-3 text-2xl font-semibold">{value}</div>
    </div>
  );
}
