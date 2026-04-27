"use client";

import { useEffect, useState } from "react";
import { Download, LayoutGrid, ListChecks, Table2 } from "lucide-react";
import Link from "next/link";

import { ProgramCard } from "@/components/programs/program-card";
import { ProgramStatusBadge } from "@/components/programs/program-status-badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ProgramListItem } from "@/lib/programs/query";
import { formatCurrency, formatNullable } from "@/lib/utils";

export function ProgramGrid({
  programs,
  displaySettings,
  defaultViewMode = "table"
}: {
  programs: ProgramListItem[];
  displaySettings: {
    table: {
      university: boolean;
      programName: boolean;
      degree: boolean;
      language: boolean;
      campus: boolean;
      discountedFee: boolean;
      originalFee: boolean;
      cashFee: boolean;
      depositFee: boolean;
      prepSchoolFee: boolean;
      academicYear: boolean;
      semester: boolean;
      status: boolean;
    };
    card: {
      university: boolean;
      programName: boolean;
      degree: boolean;
      language: boolean;
      campus: boolean;
      status: boolean;
      originalFee: boolean;
      discountedFee: boolean;
      cashFee: boolean;
      depositFee: boolean;
      prepSchoolFee: boolean;
      academicYear: boolean;
    };
  };
  defaultViewMode?: "table" | "card";
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"table" | "card">(defaultViewMode);
  const selectedIdSet = new Set(selectedIds);

  useEffect(() => {
    const visibleIds = new Set(programs.map((program) => program.id));
    setSelectedIds((current) => current.filter((id) => visibleIds.has(id)));
  }, [programs]);

  const selectedCount = selectedIds.length;
  const areAllVisibleSelected = programs.length > 0 && selectedCount === programs.length;
  const tableFields = displaySettings.table;

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
              window.location.assign(`/api/programs/pdf?ids=${query}`);
            }}
            size="sm"
          >
            <Download className="h-4 w-4" />
            Download selected PDF
          </Button>
        </div>
      </div>

      {viewMode === "table" ? (
        <div className="rounded-2xl border border-border/70 bg-card">
            <Table className="[border-collapse:separate] [border-spacing:0]" disableWrapper>
              <TableHeader className="bg-card">
                <TableRow>
                  <TableHead className="sticky top-16 z-30 w-[52px] border-b border-border/70 bg-card">Select</TableHead>
                  {tableFields.university ? <TableHead className="sticky top-16 z-30 border-b border-border/70 bg-card">University</TableHead> : null}
                  {tableFields.programName ? <TableHead className="sticky top-16 z-30 border-b border-border/70 bg-card">Program</TableHead> : null}
                  {tableFields.degree ? <TableHead className="sticky top-16 z-30 border-b border-border/70 bg-card">Degree</TableHead> : null}
                  {tableFields.language ? <TableHead className="sticky top-16 z-30 border-b border-border/70 bg-card">Language</TableHead> : null}
                  {tableFields.campus ? <TableHead className="sticky top-16 z-30 border-b border-border/70 bg-card">Campus</TableHead> : null}
                  {tableFields.discountedFee ? <TableHead className="sticky top-16 z-30 border-b border-border/70 bg-card">Discounted</TableHead> : null}
                  {tableFields.originalFee ? <TableHead className="sticky top-16 z-30 border-b border-border/70 bg-card">Original</TableHead> : null}
                  {tableFields.cashFee ? <TableHead className="sticky top-16 z-30 border-b border-border/70 bg-card">Cash</TableHead> : null}
                  {tableFields.depositFee ? <TableHead className="sticky top-16 z-30 border-b border-border/70 bg-card">Deposit</TableHead> : null}
                  {tableFields.prepSchoolFee ? <TableHead className="sticky top-16 z-30 border-b border-border/70 bg-card">Prep School</TableHead> : null}
                  {tableFields.academicYear ? <TableHead className="sticky top-16 z-30 whitespace-nowrap border-b border-border/70 bg-card">Year</TableHead> : null}
                  {tableFields.semester ? <TableHead className="sticky top-16 z-30 border-b border-border/70 bg-card">Semester</TableHead> : null}
                  {tableFields.status ? <TableHead className="sticky top-16 z-30 border-b border-border/70 bg-card">Status</TableHead> : null}
                  <TableHead className="sticky top-16 z-30 border-b border-border/70 bg-card text-right">Details</TableHead>
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
                      {tableFields.university ? (
                        <TableCell className="min-w-[240px]">
                          <div className="font-medium">{program.universityName}</div>
                          {program.universityNameCn ? <div className="text-xs text-muted-foreground">{program.universityNameCn}</div> : null}
                        </TableCell>
                      ) : null}
                      {tableFields.programName ? (
                        <TableCell className="min-w-[280px]">
                          <div className="font-medium">{program.programName}</div>
                          {program.programNameCn ? <div className="text-xs text-muted-foreground">{program.programNameCn}</div> : null}
                        </TableCell>
                      ) : null}
                      {tableFields.degree ? <TableCell>{formatNullable(program.programDegree)}</TableCell> : null}
                      {tableFields.language ? <TableCell>{formatNullable(program.language)}</TableCell> : null}
                      {tableFields.campus ? <TableCell>{formatNullable(program.campus)}</TableCell> : null}
                      {tableFields.discountedFee ? <TableCell>{formatCurrency(program.discountedTuitionFee, currency)}</TableCell> : null}
                      {tableFields.originalFee ? <TableCell>{formatCurrency(program.tuitionFee, currency)}</TableCell> : null}
                      {tableFields.cashFee ? <TableCell>{formatCurrency(program.cashPaymentFee, currency)}</TableCell> : null}
                      {tableFields.depositFee ? <TableCell>{formatCurrency(program.depositPrice, currency)}</TableCell> : null}
                      {tableFields.prepSchoolFee ? <TableCell>{formatCurrency(program.prepSchoolFee, currency)}</TableCell> : null}
                      {tableFields.academicYear ? <TableCell className="whitespace-nowrap">{formatNullable(program.academicYear)}</TableCell> : null}
                      {tableFields.semester ? <TableCell>{formatNullable(program.semester)}</TableCell> : null}
                      {tableFields.status ? (
                        <TableCell>
                          <ProgramStatusBadge quotaFull={program.quotaFull} />
                        </TableCell>
                      ) : null}
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
              visibility={displaySettings.card}
              selectable
              selected={selectedIdSet.has(program.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
