"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PersistedFilters = {
  search: string;
  university: string;
  programName: string;
  degree: string;
  language: string;
  campus: string;
  quota: string;
  minPrice: string;
  maxPrice: string;
  sort: string;
};

type FilterStore = {
  filters: PersistedFilters;
  setFilters: (filters: PersistedFilters) => void;
  resetFilters: () => void;
};

export const defaultPersistedFilters: PersistedFilters = {
  search: "",
  university: "",
  programName: "",
  degree: "",
  language: "",
  campus: "",
  quota: "",
  minPrice: "",
  maxPrice: "",
  sort: "updated"
};

export const useProgramsFilterStore = create<FilterStore>()(
  persist(
    (set) => ({
      filters: defaultPersistedFilters,
      setFilters: (filters) => set({ filters }),
      resetFilters: () => set({ filters: defaultPersistedFilters })
    }),
    {
      name: "programs-filter-store"
    }
  )
);
