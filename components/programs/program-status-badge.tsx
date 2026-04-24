import { Badge } from "@/components/ui/badge";

export function ProgramStatusBadge({ quotaFull }: { quotaFull: boolean }) {
  return (
    <Badge className="h-8 whitespace-nowrap px-3 text-xs font-semibold leading-none" variant={quotaFull ? "warning" : "success"}>
      {quotaFull ? "Quota Full" : "Available"}
    </Badge>
  );
}
