import type React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { createQueryString } from "@/lib/url";
import { cn } from "@/lib/utils";

export function Pagination({
  basePath,
  currentPage,
  totalPages,
  searchParams
}: {
  basePath: string;
  currentPage: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = buildPages(currentPage, totalPages);

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <PaginationLink basePath={basePath} page={currentPage - 1} searchParams={searchParams} disabled={currentPage === 1}>
        <ChevronLeft className="h-4 w-4" />
        Previous
      </PaginationLink>

      {pages.map((page, index) =>
        typeof page === "number" ? (
          <Link
            key={page}
            className={cn(buttonVariants({ variant: page === currentPage ? "default" : "outline", size: "sm" }), "min-w-9")}
            href={`${basePath}?${createQueryString({ ...searchParams, page })}`}
            scroll={false}
          >
            {page}
          </Link>
        ) : (
          <span key={`ellipsis-${currentPage}-${totalPages}-${index}`} className="px-1 text-sm text-muted-foreground">
            ...
          </span>
        )
      )}

      <PaginationLink basePath={basePath} page={currentPage + 1} searchParams={searchParams} disabled={currentPage === totalPages}>
        Next
        <ChevronRight className="h-4 w-4" />
      </PaginationLink>
    </div>
  );
}

function PaginationLink({
  basePath,
  page,
  searchParams,
  disabled,
  children
}: {
  basePath: string;
  page: number;
  searchParams: Record<string, string | undefined>;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <Button disabled size="sm" variant="outline">
        {children}
      </Button>
    );
  }

  return (
    <Link className={buttonVariants({ variant: "outline", size: "sm" })} href={`${basePath}?${createQueryString({ ...searchParams, page })}`} scroll={false}>
      {children}
    </Link>
  );
}

function buildPages(currentPage: number, totalPages: number) {
  const pages = new Set<number>();
  pages.add(1);
  pages.add(totalPages);

  for (let page = currentPage - 1; page <= currentPage + 1; page += 1) {
    if (page > 1 && page < totalPages) {
      pages.add(page);
    }
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const result: Array<number | "ellipsis"> = [];

  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) {
      result.push("ellipsis");
    }
    result.push(page);
  });

  return result;
}
