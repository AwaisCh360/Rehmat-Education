import Link from "next/link";
import { ArrowRight, Building2, GraduationCap, Languages, MapPin } from "lucide-react";
import type { Program } from "@prisma/client";

import { ProgramStatusBadge } from "@/components/programs/program-status-badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatNullable } from "@/lib/utils";

export function ProgramCard({
  program,
  selectable = false,
  selected = false,
  onSelectedChange
}: {
  program: Program;
  selectable?: boolean;
  selected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
}) {
  const currency = program.currencyType ?? "USD";
  const tuitionFee = formatCurrency(program.tuitionFee, currency);
  const discountedFee = formatCurrency(program.discountedTuitionFee, currency);
  const cashPaymentFee = formatCurrency(program.cashPaymentFee, currency);
  const depositFee = formatCurrency(program.depositPrice, currency);
  const prepSchoolFee = formatCurrency(program.prepSchoolFee, currency);
  const hasDiscount =
    typeof program.tuitionFee === "number" &&
    typeof program.discountedTuitionFee === "number" &&
    program.discountedTuitionFee < program.tuitionFee;

  return (
    <Card className="group h-full overflow-hidden rounded-3xl border-border/70 bg-card shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-emerald-700/30 hover:shadow-[0_16px_40px_rgba(15,23,42,0.12)]">
      <div className="h-1 bg-gradient-to-r from-amber-400 via-emerald-400 to-emerald-500" />

      <div className="relative">
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-br from-amber-300/20 via-transparent to-emerald-500/10" />

        <CardHeader className="relative space-y-5 p-6 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
                <Building2 className="h-3.5 w-3.5" />
                University
              </div>

              <div className="space-y-2">
                <div className="break-words text-2xl font-bold leading-tight text-foreground">
                  {program.universityName}
                </div>
                <CardTitle className="break-words text-xl leading-tight tracking-tight text-foreground/90">
                  {program.programName}
                </CardTitle>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 self-start">
              {selectable ? (
                <label className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-border bg-background/95 shadow-sm ring-1 ring-black/5 transition-colors hover:border-emerald-700/40">
                  <input
                    checked={selected}
                    className="h-4 w-4 accent-emerald-700"
                    onChange={(event) => onSelectedChange?.(event.target.checked)}
                    type="checkbox"
                  />
                </label>
              ) : null}
              <ProgramStatusBadge quotaFull={program.quotaFull} />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-muted/60 px-3 py-1.5">
              <GraduationCap className="h-3.5 w-3.5" />
              {formatNullable(program.programDegree)}
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-muted/60 px-3 py-1.5">
              <Languages className="h-3.5 w-3.5" />
              {formatNullable(program.language)}
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-muted/60 px-3 py-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {formatNullable(program.campus)}
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative space-y-4 px-6 pb-6 pt-0">
          <div className="rounded-3xl border border-border/70 bg-background p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Fee snapshot</div>

            <div className="mt-4 grid gap-3 sm:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-2xl border border-border/70 bg-muted/35 p-4">
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Original fee</div>
                <div className={hasDiscount ? "mt-2 text-lg font-semibold text-destructive line-through" : "mt-2 text-lg font-semibold text-foreground"}>
                  {tuitionFee}
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">Discounted fee</div>
                <div className="mt-2 text-2xl font-semibold text-emerald-700 dark:text-emerald-300">
                  {discountedFee}
                </div>
              </div>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <InlineMetric label="Cash" value={cashPaymentFee} />
              <InlineMetric label="Deposit" value={depositFee} />
              <InlineMetric label="Prep school" value={prepSchoolFee} />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/30 px-4 py-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-4 w-4" />
              Academic year
            </div>
            <div className="font-medium text-foreground">{program.academicYear ?? "Not specified"}</div>
          </div>
        </CardContent>

        <CardFooter className="relative px-6 pb-6 pt-0">
          <Link
            className="inline-flex items-center gap-2 rounded-full border border-emerald-700/20 bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700/90"
            href={`/programs/${program.id}`}
          >
            View details
            <ArrowRight className="h-4 w-4" />
          </Link>
        </CardFooter>
      </div>
    </Card>
  );
}

function InlineMetric({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background px-3 py-2">
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}
