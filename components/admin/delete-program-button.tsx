"use client";

import { useTransition } from "react";
import { LoaderCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function DeleteProgramButton({ programId }: { programId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      disabled={isPending}
      onClick={() => {
        const confirmed = window.confirm("Delete this program permanently?");

        if (!confirmed) {
          return;
        }

        startTransition(async () => {
          const response = await fetch(`/api/admin/programs/${programId}`, {
            method: "DELETE"
          });

          if (!response.ok) {
            toast.error("Could not delete the program.");
            return;
          }

          toast.success("Program deleted.");
          router.refresh();
        });
      }}
      size="sm"
      variant="destructive"
    >
      {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      Delete
    </Button>
  );
}
