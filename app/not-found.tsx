import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="space-y-4 text-center">
        <div className="text-sm text-muted-foreground">404</div>
        <h1 className="text-3xl font-semibold tracking-tight">We couldn&apos;t find that page.</h1>
        <Button asChild>
          <Link href="/programs">Go back to the catalog</Link>
        </Button>
      </div>
    </div>
  );
}
