"use client";

import { useTransition } from "react";
import { AlertTriangle, LoaderCircle, RotateCcw, Shuffle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type ImportReviewProps = {
  sessionId: string;
  defaultMode: "merge" | "replace";
  diff: {
    created: number;
    changed: number;
    unchanged: number;
    deleted: number;
    preview: {
      created: Array<{ Id: string; University_Name__c: string; Program_Name__c: string }>;
      changed: Array<{ Id: string; University_Name__c: string; Program_Name__c: string }>;
      deleted: string[];
    };
  };
};

export function ImportReview({ sessionId, defaultMode, diff }: ImportReviewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const commit = (mode: "merge" | "replace") => {
    startTransition(async () => {
      const response = await fetch("/api/admin/import/commit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sessionId,
          mode
        })
      });

      const payload = await response.json();

      if (!response.ok) {
        toast.error(payload.error ?? "Import failed.");
        return;
      }

      toast.success(mode === "merge" ? "Catalog merged." : "Catalog replaced.");
      router.push("/admin/programs");
      router.refresh();
    });
  };

  return (
    <Card className="rounded-2xl border-border/70">
      <CardHeader>
        <CardTitle>Import review</CardTitle>
        <CardDescription>Check the delta before writing anything to the live catalog.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="New records" value={diff.created} />
          <StatCard label="Changed records" value={diff.changed} />
          <StatCard label="Unchanged records" value={diff.unchanged} />
          <StatCard label="Records missing from upload" value={diff.deleted} />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <PreviewList
            items={diff.preview.created.map((item) => `${item.University_Name__c} — ${item.Program_Name__c}`)}
            title="Sample new records"
          />
          <PreviewList
            items={diff.preview.changed.map((item) => `${item.University_Name__c} — ${item.Program_Name__c}`)}
            title="Sample changed records"
          />
          <PreviewList items={diff.preview.deleted} title="Sample removed IDs" />
        </div>

        <div className="rounded-xl border border-warning/30 bg-warning/30 px-4 py-3 text-sm text-warning-foreground">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle className="h-4 w-4" />
            Replace mode deletes any catalog record missing from the uploaded JSON.
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {defaultMode === "replace" ? (
            <>
              <Button disabled={isPending} onClick={() => commit("replace")} variant="destructive">
                {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                Replace catalog (default)
              </Button>
              <Button disabled={isPending} onClick={() => commit("merge")} variant="outline">
                {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Shuffle className="h-4 w-4" />}
                Merge records
              </Button>
            </>
          ) : (
            <>
              <Button disabled={isPending} onClick={() => commit("merge")}>
                {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Shuffle className="h-4 w-4" />}
                Merge records (default)
              </Button>
              <Button disabled={isPending} onClick={() => commit("replace")} variant="destructive">
                {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                Replace catalog
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-muted/50 p-4">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-2 text-3xl font-semibold">{value.toLocaleString()}</div>
    </div>
  );
}

function PreviewList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4">
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-3 space-y-2 text-sm text-muted-foreground">
        {items.length ? items.map((item) => <div key={item}>{item}</div>) : <div>No sample records in this bucket.</div>}
      </div>
    </div>
  );
}
