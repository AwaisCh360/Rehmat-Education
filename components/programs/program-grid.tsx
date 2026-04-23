"use client";

import { useEffect, useState } from "react";
import { Download, LayoutGrid, ListChecks, Table2 } from "lucide-react";
import Link from "next/link";
import type { Program } from "@prisma/client";

import { ProgramCard } from "@/components/programs/program-card";
import { ProgramStatusBadge } from "@/components/programs/program-status-badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatNullable } from "@/lib/utils";

export function ProgramGrid({ programs }: { programs: Program[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const selectedIdSet = new Set(selectedIds);

  useEffect(() => {
    const visibleIds = new Set(programs.map((program) => program.id));
    setSelectedIds((current) => current.filter((id) => visibleIds.has(id)));
  }, [programs]);

  const selectedCount = selectedIds.length;
  const areAllVisibleSelected = programs.length > 0 && selectedCount === programs.length;

  if (!programs.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center shadow-card">
        <h3 className="text-lg font-semibold">No programs match these filters</h3>
        <p className="mt-2 text-sm text-muted-foreground">Try widening the search, clearing a filter, or adjusting the price range.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card/80 px-4 py-3">
        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <ListChecks className="h-4 w-4 text-primary" />
          {selectedCount ? `${selectedCount} selected` : "Select one or more programs"}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center rounded-lg border border-border/70 bg-background p-1">
            <Button
              className="h-8 px-3"
              onClick={() => setViewMode("table")}
              size="sm"
              variant={viewMode === "table" ? "default" : "ghost"}
            >
              <Table2 className="h-4 w-4" />
              Table
            </Button>
            <Button
              className="h-8 px-3"
              onClick={() => setViewMode("card")}
              size="sm"
              variant={viewMode === "card" ? "default" : "ghost"}
            >
              <LayoutGrid className="h-4 w-4" />
              Card
            </Button>
          </div>
          <Button
            onClick={() => {
              if (areAllVisibleSelected) {
                setSelectedIds([]);
                return;
              }

              setSelectedIds(programs.map((program) => program.id));
            }}
            size="sm"
            variant="outline"
          >
            {areAllVisibleSelected ? "Clear selection" : "Select visible"}
          </Button>
          <Button
            disabled={!selectedCount}
            onClick={() => {
              if (!selectedCount) {
                return;
              }

              const query = encodeURIComponent(selectedIds.join(","));
              window.open(`/api/programs/pdf?ids=${query}`, "_blank", "noopener,noreferrer");
            }}
            size="sm"
          >
            <Download className="h-4 w-4" />
            Download selected PDF
          </Button>
        </div>
      </div>

      {viewMode === "table" ? (
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[52px]">Select</TableHead>
                  <TableHead>University</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Degree</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Campus</TableHead>
                  <TableHead>Discounted</TableHead>
                  <TableHead>Original</TableHead>
                  <TableHead>Cash</TableHead>
                  <TableHead>Deposit</TableHead>
                  <TableHead>Prep School</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {programs.map((program) => {
                  const currency = program.currencyType ?? "USD";

                  return (
                    <TableRow key={program.id}>
                      <TableCell>
                        <input
                          checked={selectedIdSet.has(program.id)}
                          className="h-4 w-4 accent-emerald-700"
                          onChange={(event) => {
                            const nextSelected = event.target.checked;

                            setSelectedIds((current) => {
                              if (nextSelected) {
                                return current.includes(program.id) ? current : [...current, program.id];
                              }

                              return current.filter((id) => id !== program.id);
                            });
                          }}
                          type="checkbox"
                        />
                      </TableCell>
                      <TableCell className="min-w-[240px]">
                        <div className="font-medium">{program.universityName}</div>
                        {program.universityNameCn ? <div className="text-xs text-muted-foreground">{program.universityNameCn}</div> : null}
                      </TableCell>
                      <TableCell className="min-w-[280px]">
                        <div className="font-medium">{program.programName}</div>
                        {program.programNameCn ? <div className="text-xs text-muted-foreground">{program.programNameCn}</div> : null}
                      </TableCell>
                      <TableCell>{formatNullable(program.programDegree)}</TableCell>
                      <TableCell>{formatNullable(program.language)}</TableCell>
                      <TableCell>{formatNullable(program.campus)}</TableCell>
                      <TableCell>{formatCurrency(program.discountedTuitionFee, currency)}</TableCell>
                      <TableCell>{formatCurrency(program.tuitionFee, currency)}</TableCell>
                      <TableCell>{formatCurrency(program.cashPaymentFee, currency)}</TableCell>
                      <TableCell>{formatCurrency(program.depositPrice, currency)}</TableCell>
                      <TableCell>{formatCurrency(program.prepSchoolFee, currency)}</TableCell>
                      <TableCell>{formatNullable(program.academicYear)}</TableCell>
                      <TableCell>{formatNullable(program.semester)}</TableCell>
                      <TableCell>
                        <ProgramStatusBadge quotaFull={program.quotaFull} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/programs/${program.id}`}>View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {programs.map((program) => (
            <ProgramCard
              key={program.id}
              onSelectedChange={(nextSelected) => {
                setSelectedIds((current) => {
                  if (nextSelected) {
                    return current.includes(program.id) ? current : [...current, program.id];
                  }

                  return current.filter((id) => id !== program.id);
                });
              }}
              program={program}
              selectable
              selected={selectedIdSet.has(program.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
