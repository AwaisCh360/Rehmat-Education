"use client";

import { useState, useTransition } from "react";
import { FileJson, LoaderCircle, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function ImportUploader({ defaultMode }: { defaultMode: "merge" | "replace" }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <Card className="rounded-2xl border-border/70">
      <CardHeader>
        <CardTitle>Upload JSON</CardTitle>
        <CardDescription>
          Use the current Salesforce-style payload or a raw array of program records. Default commit mode is {defaultMode === "replace" ? "replace" : "merge"}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-muted/40 px-6 py-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <FileJson className="h-6 w-6" />
          </div>
          <div>
            <div className="font-medium">{file ? file.name : "Choose a JSON file"}</div>
            <div className="text-sm text-muted-foreground">Preview the diff before deciding whether to merge or replace.</div>
          </div>
          <Input
            accept="application/json"
            className="hidden"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            type="file"
          />
        </label>

        <Button
          disabled={!file || isPending}
          onClick={() => {
            if (!file) {
              return;
            }

            startTransition(async () => {
              const content = await file.text();
              const response = await fetch("/api/admin/import/preview", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  fileName: file.name,
                  content
                })
              });

              const payload = await response.json();

              if (!response.ok) {
                toast.error(payload.error ?? "Import preview failed.");
                return;
              }

              toast.success("Preview ready.");
              router.replace(`/admin/import?session=${payload.sessionId}`);
              router.refresh();
            });
          }}
        >
          {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
          Preview import
        </Button>
      </CardContent>
    </Card>
  );
}
