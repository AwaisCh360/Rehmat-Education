"use client";

import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { ProgramCombobox } from "@/components/programs/program-combobox";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { defaultPersistedFilters, type PersistedFilters, useProgramsFilterStore } from "@/lib/programs/filter-store";
import { defaultFilterVisibilitySettings, type FilterVisibilitySettings } from "@/lib/programs/filter-visibility";
import type { FilterOption } from "@/lib/programs/query";
import { createQueryString } from "@/lib/url";
import { formatCount } from "@/lib/utils";

type ToolbarProps = {
  basePath: string;
  currentPage: number;
  filterVisibility?: FilterVisibilitySettings;
  initialFilters: PersistedFilters;
  options: {
    universities: FilterOption[];
    programs: FilterOption[];
    degrees: FilterOption[];
    languages: FilterOption[];
    campuses: FilterOption[];
  };
  resultCount: number;
  mode?: "browse" | "admin";
};

export function ProgramsToolbar({ basePath, currentPage, filterVisibility, initialFilters, options, resultCount, mode = "browse" }: ToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const savedFilters = useProgramsFilterStore((state) => state.filters);
  const setSavedFilters = useProgramsFilterStore((state) => state.setFilters);
  const resetSavedFilters = useProgramsFilterStore((state) => state.resetFilters);
  const [filters, setFilters] = useState(initialFilters);
  const [mounted, setMounted] = useState(false);
  const hydratedRef = useRef(false);
  const skipPushRef = useRef(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setFilters(initialFilters);
    skipPushRef.current = true;
  }, [initialFilters]);

  useEffect(() => {
    if (hydratedRef.current) {
      return;
    }

    hydratedRef.current = true;
    const hasUrlFilters = Object.entries(initialFilters).some(([key, value]) => key !== "sort" ? Boolean(value) : value !== "updated");
    const hasSavedFilters = Object.entries(savedFilters).some(([key, value]) => key !== "sort" ? Boolean(value) : value !== "updated");

    if (currentPage === 1 && !hasUrlFilters && hasSavedFilters) {
      setFilters(savedFilters);
      skipPushRef.current = false;
      router.replace(`${basePath}?${createQueryString({ ...savedFilters, page: 1 })}`, { scroll: false });
      return;
    }

    setSavedFilters(initialFilters);
  }, [basePath, currentPage, initialFilters, router, savedFilters, setSavedFilters]);

  useEffect(() => {
    setSavedFilters(filters);

    if (skipPushRef.current) {
      skipPushRef.current = false;
      return;
    }

    const handle = window.setTimeout(() => {
      const query = createQueryString({
        ...filters,
        sort: filters.sort === "updated" ? undefined : filters.sort,
        page: 1
      });

      router.replace(query ? `${basePath}?${query}` : basePath, { scroll: false });
    }, 250);

    return () => window.clearTimeout(handle);
  }, [basePath, filters, router, setSavedFilters]);

  const summary = useMemo(() => `${formatCount(resultCount)} ${resultCount === 1 ? "program" : "programs"} found`, [resultCount]);
  const visibleFilters = mode === "admin" ? defaultFilterVisibilitySettings : filterVisibility ?? defaultFilterVisibilitySettings;

  if (!mounted) {
    return (
      <Card className="rounded-2xl border-border/70">
        <CardContent className="space-y-6 p-5">
          <div className="h-8 w-48 rounded-md bg-muted/70" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-20 rounded-xl bg-muted/40" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-border/70">
      <CardContent className="space-y-6 p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-sm font-medium">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              Live catalog filters
            </div>
            <div className="text-sm text-muted-foreground">{summary}</div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => {
                setFilters(defaultPersistedFilters);
                resetSavedFilters();
                router.replace(pathname, { scroll: false });
              }}
              variant="outline"
            >
              <X className="h-4 w-4" />
              Clear all
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {visibleFilters.search ? (
          <FilterField label="Global search">
            <Input
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
              placeholder="Search program, university, or Arabic name"
              value={filters.search}
            />
          </FilterField>
          ) : null}

          {visibleFilters.university ? (
          <FilterField label="University">
            <FilterSelect onChange={(value) => setFilters((current) => ({ ...current, university: value }))} options={options.universities} placeholder="All universities" value={filters.university} />
          </FilterField>
          ) : null}

          {visibleFilters.programName ? (
          <FilterField label="Program name">
            <ProgramCombobox onChange={(value) => setFilters((current) => ({ ...current, programName: value }))} options={options.programs} placeholder="All programs" value={filters.programName} />
          </FilterField>
          ) : null}

          {visibleFilters.degree ? (
          <FilterField label="Degree">
            <FilterSelect onChange={(value) => setFilters((current) => ({ ...current, degree: value }))} options={options.degrees} placeholder="All degrees" value={filters.degree} />
          </FilterField>
          ) : null}

          {visibleFilters.language ? (
          <FilterField label="Language">
            <FilterSelect onChange={(value) => setFilters((current) => ({ ...current, language: value }))} options={options.languages} placeholder="All languages" value={filters.language} />
          </FilterField>
          ) : null}

          {visibleFilters.campus ? (
          <FilterField label="Campus">
            <FilterSelect onChange={(value) => setFilters((current) => ({ ...current, campus: value }))} options={options.campuses} placeholder="All campuses" value={filters.campus} />
          </FilterField>
          ) : null}

          {visibleFilters.quota ? (
          <FilterField label="Quota">
            <Select
              onValueChange={(value) => setFilters((current) => ({ ...current, quota: value === "__all" ? "" : value }))}
              value={filters.quota || "__all"}
            >
              <SelectTrigger>
                <SelectValue placeholder="All quota statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all">All quota statuses</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="full">Quota full</SelectItem>
              </SelectContent>
            </Select>
          </FilterField>
          ) : null}

          {visibleFilters.discountedFeeRange ? (
          <FilterField label="Fee Range">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
              <Input
                inputMode="decimal"
                onChange={(event) => setFilters((current) => ({ ...current, minPrice: event.target.value }))}
                placeholder="Min"
                type="number"
                value={filters.minPrice}
              />
              <span className="text-xs text-muted-foreground">|</span>
              <Input
                inputMode="decimal"
                onChange={(event) => setFilters((current) => ({ ...current, maxPrice: event.target.value }))}
                placeholder="Max"
                type="number"
                value={filters.maxPrice}
              />
            </div>
          </FilterField>
          ) : null}
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {visibleFilters.sort ? (
          <FilterField label="Sort">
            <Select
              onValueChange={(value) => setFilters((current) => ({ ...current, sort: value }))}
              value={filters.sort || "updated"}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updated">Recently updated</SelectItem>
                <SelectItem value="price-asc">Price low to high</SelectItem>
                <SelectItem value="price-desc">Price high to low</SelectItem>
              </SelectContent>
            </Select>
          </FilterField>
          ) : null}
          <div className="rounded-xl bg-muted/60 px-4 py-3 text-sm text-muted-foreground md:col-span-1 xl:col-span-3">
            {mode === "browse"
              ? "Filters update the program list in place and stay saved on this device."
              : "Admin filters help narrow the table before editing or importing records."}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
  placeholder
}: {
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  placeholder: string;
}) {
  const normalizedValue = value || "__all";

  return (
    <Select onValueChange={(nextValue) => onChange(nextValue === "__all" ? "" : nextValue)} value={normalizedValue}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__all">{placeholder}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label} ({option.count})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
