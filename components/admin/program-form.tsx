"use client";

import type React from "react";
import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Program } from "@prisma/client";
import { LoaderCircle, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { type ProgramFormValues, programFormSchema } from "@/lib/programs/schemas";

const defaultValues: ProgramFormValues = {
  id: "",
  universityName: "",
  programDegree: "",
  programName: "",
  universityNameCn: "",
  programNameCn: "",
  alternativeProgramName: "",
  currencyType: "USD",
  tuitionFeeOriginal: "",
  discountedTuitionFeeOriginal: "",
  cashPaymentFeeOriginal: "",
  prepSchoolFeeOriginal: "",
  depositPriceOriginal: "",
  language: "",
  campus: "",
  quotaFull: false,
  programRef: "",
  termSettings: "",
  semester: "",
  universityId: "",
  academicYear: "",
  unilogo: ""
};

export function ProgramForm({
  mode,
  program
}: {
  mode: "create" | "edit";
  program?: Program;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<ProgramFormValues>({
    resolver: zodResolver(programFormSchema),
    defaultValues: program
      ? {
          id: program.id,
          universityName: program.universityName,
          programDegree: program.programDegree ?? "",
          programName: program.programName,
          universityNameCn: program.universityNameCn ?? "",
          programNameCn: program.programNameCn ?? "",
          alternativeProgramName: program.alternativeProgramName ?? "",
          currencyType: program.currencyType ?? "",
          tuitionFeeOriginal: program.tuitionFeeOriginal ?? "",
          discountedTuitionFeeOriginal: program.discountedTuitionFeeOriginal ?? "",
          cashPaymentFeeOriginal: program.cashPaymentFeeOriginal ?? "",
          prepSchoolFeeOriginal: program.prepSchoolFeeOriginal ?? "",
          depositPriceOriginal: program.depositPriceOriginal ?? "",
          language: program.language ?? "",
          campus: program.campus ?? "",
          quotaFull: program.quotaFull,
          programRef: program.programRef ?? "",
          termSettings: program.termSettings ?? "",
          semester: program.semester ?? "",
          universityId: program.universityId ?? "",
          academicYear: program.academicYear ?? "",
          unilogo: program.unilogo ?? ""
        }
      : defaultValues
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const endpoint = mode === "create" ? "/api/admin/programs" : `/api/admin/programs/${program?.id}`;
      const response = await fetch(endpoint, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(values)
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({ error: "Unable to save the program." }));
        toast.error(payload.error ?? "Unable to save the program.");
        return;
      }

      toast.success(mode === "create" ? "Program created." : "Program updated.");
      router.push("/admin/programs");
      router.refresh();
    });
  });

  return (
    <Card className="rounded-2xl border-border/70">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Add program" : "Edit program"}</CardTitle>
        <CardDescription>All fields map directly to the program catalog. Leave optional fields blank when not provided.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={onSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField error={form.formState.errors.id?.message} label="Program Id">
              <Input {...form.register("id")} disabled={mode === "edit"} />
            </FormField>
            <FormField error={form.formState.errors.universityName?.message} label="University name">
              <Input {...form.register("universityName")} />
            </FormField>
            <FormField error={form.formState.errors.programName?.message} label="Program name">
              <Input {...form.register("programName")} />
            </FormField>
            <FormField error={form.formState.errors.programDegree?.message} label="Degree">
              <Input {...form.register("programDegree")} placeholder="Bachelor / Master / PhD" />
            </FormField>
            <FormField label="Language">
              <Input {...form.register("language")} />
            </FormField>
            <FormField label="Campus">
              <Input {...form.register("campus")} />
            </FormField>
            <FormField label="Currency">
              <Input {...form.register("currencyType")} />
            </FormField>
            <FormField label="Academic year">
              <Input {...form.register("academicYear")} />
            </FormField>
            <FormField label="Semester">
              <Input {...form.register("semester")} />
            </FormField>
            <FormField label="University ID">
              <Input {...form.register("universityId")} />
            </FormField>
            <FormField label="Program Ref">
              <Input {...form.register("programRef")} />
            </FormField>
            <FormField label="Logo URL">
              <Input {...form.register("unilogo")} />
            </FormField>
            <FormField label="Tuition fee">
              <Input {...form.register("tuitionFeeOriginal")} inputMode="decimal" />
            </FormField>
            <FormField label="Discounted fee">
              <Input {...form.register("discountedTuitionFeeOriginal")} inputMode="decimal" />
            </FormField>
            <FormField label="Cash payment fee">
              <Input {...form.register("cashPaymentFeeOriginal")} inputMode="decimal" />
            </FormField>
            <FormField label="Prep school fee">
              <Input {...form.register("prepSchoolFeeOriginal")} inputMode="decimal" />
            </FormField>
            <FormField label="Deposit price">
              <Input {...form.register("depositPriceOriginal")} inputMode="decimal" />
            </FormField>
            <FormField label="University name CN">
              <Input {...form.register("universityNameCn")} />
            </FormField>
            <FormField label="Program name CN">
              <Input {...form.register("programNameCn")} />
            </FormField>
          </div>

          <FormField label="Alternative program name">
            <Textarea {...form.register("alternativeProgramName")} />
          </FormField>

          <FormField label="Term settings">
            <Textarea {...form.register("termSettings")} />
          </FormField>

          <label className="flex items-center gap-3 rounded-xl border border-border/70 px-4 py-3">
            <input className="h-4 w-4 rounded border-input" type="checkbox" {...form.register("quotaFull")} />
            <div>
              <div className="text-sm font-medium">Quota full</div>
              <div className="text-xs text-muted-foreground">Mark this if new applicants cannot enroll.</div>
            </div>
          </label>

          <div className="flex justify-end">
            <Button disabled={isPending} type="submit">
              {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {mode === "create" ? "Create program" : "Save changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function FormField({
  label,
  children,
  error
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
