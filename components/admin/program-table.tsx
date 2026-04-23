import Link from "next/link";
import type { Program } from "@prisma/client";
import { PencilLine, Plus } from "lucide-react";

import { DeleteProgramButton } from "@/components/admin/delete-program-button";
import { ProgramStatusBadge } from "@/components/programs/program-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatNullable } from "@/lib/utils";

export function ProgramTable({ programs }: { programs: Program[] }) {
  return (
    <Card className="rounded-2xl border-border/70">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>Catalog table</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">Edit records directly, then refresh the catalog immediately.</p>
        </div>
        <Button asChild>
          <Link href="/admin/programs/new">
            <Plus className="h-4 w-4" />
            Add program
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>University</TableHead>
              <TableHead>Program</TableHead>
              <TableHead>Degree</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Campus</TableHead>
              <TableHead>Discounted fee</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {programs.map((program) => (
              <TableRow key={program.id}>
                <TableCell className="font-medium">{program.universityName}</TableCell>
                <TableCell>
                  <div className="font-medium">{program.programName}</div>
                  <div className="text-xs text-muted-foreground">{program.id}</div>
                </TableCell>
                <TableCell>{formatNullable(program.programDegree)}</TableCell>
                <TableCell>{formatNullable(program.language)}</TableCell>
                <TableCell>{formatNullable(program.campus)}</TableCell>
                <TableCell>{formatCurrency(program.discountedTuitionFee, program.currencyType ?? "USD")}</TableCell>
                <TableCell>
                  <ProgramStatusBadge quotaFull={program.quotaFull} />
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/programs/${program.id}/edit`}>
                        <PencilLine className="h-4 w-4" />
                        Edit
                      </Link>
                    </Button>
                    <DeleteProgramButton programId={program.id} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
